from rest_framework import serializers
from .models import Tag, ImageTag
from .models import ImageUserTag
from django.contrib.auth.models import User


class ImageUserTagSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    added_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ImageUserTag
        fields = ['id', 'user_id', 'username', 'added_by', 'added_at']

class TagSerializer(serializers.ModelSerializer):
    image_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'created_at', 'image_count']
    
    def get_image_count(self, obj):
        return obj.images.count()

class ImageTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)
    tag_name = serializers.CharField(write_only=True)
    added_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = ImageTag
        fields = ['id', 'tag', 'tag_name', 'added_by', 'added_at']
        read_only_fields = ['added_by', 'added_at']
    
    def create(self, validated_data):
        tag_name = validated_data.pop('tag_name')
        
        tag, created = Tag.objects.get_or_create(
            name=tag_name.lower().strip()
        )
        
        image_tag = ImageTag.objects.create(
            tag=tag,
            **validated_data
        )
        return image_tag