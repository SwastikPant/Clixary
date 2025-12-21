from rest_framework import serializers
from .models import Event, Album

class EventSerializer(serializers.ModelSerializer):
	images = serializers.SerializerMethodField()
	class Meta:
		model = Event
		fields = "__all__"
		read_only_fields = ["created_at", "created_by"]

	def get_images(self, obj):
		from images.models import Image
		from images.serializers import ImageSerializer

		images = Image.objects.filter(
			event=obj,
			privacy='PUBLIC',
			is_deleted=False
		).order_by('uploaded_at')

		return ImageSerializer(images, many=True, context=self.context).data

class AlbumSerializer(serializers.ModelSerializer):
	class Meta:
		model = Album
		fields = "__all__"
		read_only_fields = ["created_at", "created_by"]