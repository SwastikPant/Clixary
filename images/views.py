from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import ImageSerializer
from .models import Image
# Create your views here.

class ImageViewSet(viewsets.ModelViewSet):
	queryset = Image.objects.all()
	serializer_class = ImageSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]
