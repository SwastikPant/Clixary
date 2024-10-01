from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tag, ImageTag
from .serializers import TagSerializer

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        from django.db.models import Count
        
        popular_tags = Tag.objects.annotate(
            usage_count=Count('images')
        ).order_by('-usage_count')[:20]
        
        serializer = self.get_serializer(popular_tags, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        
        if query:
            tags = Tag.objects.filter(name__icontains=query)[:10]
        else:
            tags = Tag.objects.all()[:10]
        
        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)