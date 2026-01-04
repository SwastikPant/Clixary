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