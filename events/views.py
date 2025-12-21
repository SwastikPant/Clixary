from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import EventSerializer, AlbumSerializer
from .models import Event, Album
from .permissions import CanManageEvent, CanModifyEvent
# Create your views here.

class EventViewSet(viewsets.ModelViewSet):
	queryset = Event.objects.all()
	serializer_class = EventSerializer
	
	def get_permissions(self):
		if self.action == 'create':
			return [permissions.IsAuthenticated(), CanManageEvent()]
		elif self.action in ['update', 'destroy']:
			return [permissions.IsAuthenticated(), CanModifyEvent()]
		else:
			return [permissions.IsAuthenticated()]

	def perform_create(self, serializer):
		serializer.save(created_by=self.request.user)

class AlbumViewSet(viewsets.ModelViewSet):
	queryset = Album.objects.all()
	serializer_class = AlbumSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]

	def perform_create(self, serializer):
		serializer.save(created_by=self.request.user)
