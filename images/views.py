from django.shortcuts import render
from django.db.models import F, Q
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import ImageSerializer, ImageUploadSerializer
from .models import Image
from .permissions import CanUploadImage, CanModifyImage
from .filters import ImageFilter
from activities.models import Reaction
from tags.models import Tag, ImageTag, ImageUserTag
from tags.serializers import TagSerializer
from django.contrib.auth.models import User


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ImageFilter
    search_fields = ['uploaded_by__username', 'event__name']
    ordering_fields = ['uploaded_at', 'like_count', 'view_count'] 
    ordering = ['uploaded_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_authenticated:
            queryset = queryset.filter(
                Q(privacy='PUBLIC') | Q(uploaded_by=user)
            )
        else:
            queryset = queryset.filter(privacy='PUBLIC')
        
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'bulk_upload']:
            return [IsAuthenticated(), CanUploadImage()]
        elif self.action in ['update', 'destroy']:
            return [IsAuthenticated(), CanModifyImage()]
        else:
            return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        from django.db.models import F
        instance = self.get_object()
        Image.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        image = self.get_object()

        existing = Reaction.objects.filter(
            user=request.user,
            image=image,
            reaction_type='LIKE'
        ).first()

        if existing:
            existing.delete()
            image.like_count = F('like_count') - 1
            image.save(update_fields=['like_count'])
            image.refresh_from_db()
            return Response({
                'liked': False,
                'like_count': image.like_count
            })
        else:
            Reaction.objects.create(
                user=request.user,
                image=image,
                reaction_type='LIKE'
            )
            image.like_count = F('like_count') + 1
            image.save(update_fields=['like_count'])
            image.refresh_from_db()
            return Response({
                'liked': True,
                'like_count': image.like_count
            })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        image = self.get_object()

        existing = Reaction.objects.filter(
            user=request.user,
            image=image,
            reaction_type='FAVORITE'
        ).first()

        if existing:
            existing.delete()
            return Response({
                'favorited': False,
                'message': 'Removed from favorites'
            })
        else:
            Reaction.objects.create(
                user=request.user,
                image=image,
                reaction_type='FAVORITE'
            )
            return Response({
                'favorited': True,
                'message': 'Added to favorites'
            })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_favorites(self, request):
        favorite_reactions = Reaction.objects.filter(
            user=request.user,
            reaction_type='FAVORITE'
        ).select_related('image')
        
        favorited_images = [reaction.image for reaction in favorite_reactions]
        serializer = self.get_serializer(favorited_images, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_uploads(self, request):
        my_images = self.queryset.filter(uploaded_by=request.user)
        serializer = self.get_serializer(my_images, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def comments(self, request, pk=None):
        image = self.get_object()
        
        if request.method == 'GET':
            from activities.models import Comment
            from activities.serializers import CommentSerializer
            
            top_comments = Comment.objects.filter(
                image=image,
                parent=None
            ).select_related('user').prefetch_related('replies')
            
            serializer = CommentSerializer(top_comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            from activities.models import Comment
            from activities.serializers import CommentSerializer
            
            serializer = CommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, image=image)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_upload(self, request):

        files = request.FILES.getlist('images')
        event_id = request.data.get('event')
        privacy = request.data.get('privacy', 'PUBLIC')

        if not files:
            return Response(
                {'error': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_images = []
        errors = []

        for image_file in files:
            try:
                serializer = ImageUploadSerializer(
                    data={
                        'original_image': image_file,
                        'event': event_id,
                        'privacy': privacy
                    },
                    context={'request': request}
                )

                if serializer.is_valid():
                    image_obj = serializer.save()
                    uploaded_images.append({
                        'id': image_obj.id,
                        'filename': image_file.name,
                        'status': 'success'
                    })
                else:
                    errors.append({
                        'filename': image_file.name,
                        'errors': serializer.errors
                    })

            except Exception as e:
                errors.append({
                    'filename': image_file.name,
                    'error': str(e)
                })

        return Response({
            'uploaded': len(uploaded_images),
            'failed': len(errors),
            'images': uploaded_images,
            'errors': errors
        }, status=status.HTTP_201_CREATED if uploaded_images else status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        image = self.get_object()
    
        image.download_count = F('download_count') + 1
        image.save(update_fields=['download_count'])
        
        from django.shortcuts import redirect
        return redirect(image.original_image.url)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_tag(self, request, pk=None):
        image = self.get_object()
        
        can_tag = (
            request.user.profile.role in ['PHOTOGRAPHER', 'COORDINATOR', 'ADMIN'] or
            image.uploaded_by == request.user
        )
        
        if not can_tag:
            return Response(
                {'error': 'Only photographers/admins/owners can tag images'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        tag_name = request.data.get('tag_name', '').strip().lower()
        
        if not tag_name:
            return Response(
                {'error': 'Tag name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tag, created = Tag.objects.get_or_create(name=tag_name)
        
        image_tag, tag_created = ImageTag.objects.get_or_create(
            image=image,
            tag=tag,
            defaults={'added_by': request.user}
        )
        
        if not tag_created:
            return Response(
                {'message': 'Tag already exists on this image'},
                status=status.HTTP_200_OK
            )
        
        serializer = self.get_serializer(image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_tag(self, request, pk=None):
        image = self.get_object()
        tag_id = request.query_params.get('tag_id')
        
        if not tag_id:
            return Response(
                {'error': 'tag_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        can_remove = (
            request.user.profile.role in ['PHOTOGRAPHER', 'COORDINATOR', 'ADMIN'] or
            image.uploaded_by == request.user
        )
        
        if not can_remove:
            return Response(
                {'error': 'Only photographers/admins/owners can remove tags'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            image_tag = ImageTag.objects.get(image=image, tag_id=tag_id)
            image_tag.delete()
            
            serializer = self.get_serializer(image)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ImageTag.DoesNotExist:
            return Response(
                {'error': 'Tag not found on this image'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_user_tag(self, request, pk=None):
        image = self.get_object()

        can_tag = (
            request.user.profile.role in ['PHOTOGRAPHER', 'COORDINATOR', 'ADMIN'] or
            image.uploaded_by == request.user
        )

        if not can_tag:
            return Response(
                {'error': 'Only photographers/admins/owners can tag images'},
                status=status.HTTP_403_FORBIDDEN
            )

        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        image_user_tag, created = ImageUserTag.objects.get_or_create(
            image=image,
            user=target_user,
            defaults={'added_by': request.user}
        )

        if not created:
            return Response({'message': 'User already tagged on this image'}, status=status.HTTP_200_OK)

        serializer = self.get_serializer(image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_user_tag(self, request, pk=None):
        image = self.get_object()
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        can_remove = (
            request.user.profile.role in ['PHOTOGRAPHER', 'COORDINATOR', 'ADMIN'] or
            image.uploaded_by == request.user
        )

        if not can_remove:
            return Response(
                {'error': 'Only photographers/admins/owners can remove user tags'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            image_user_tag = ImageUserTag.objects.get(image=image, user_id=user_id)
            image_user_tag.delete()

            serializer = self.get_serializer(image)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ImageUserTag.DoesNotExist:
            return Response({'error': 'User not tagged on this image'}, status=status.HTTP_404_NOT_FOUND)
