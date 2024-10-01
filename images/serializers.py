from rest_framework import serializers
from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    user_liked = serializers.SerializerMethodField()
    user_favourited = serializers.SerializerMethodField()
    uploaded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Image
        fields = [
            'id', 'event', 'uploaded_by', 
            'original_image', 'watermarked_image', 'thumbnail',
            'camera_model', 'aperture', 'shutter_speed', 'iso',
            'gps_latitude', 'gps_longitude', 'capture_time',
            'view_count', 'like_count', 'download_count',
            'privacy', 'exif', 'uploaded_at',
            'user_liked', 'user_favourited', 'tags',
        ]
        read_only_fields = [
            "view_count",
            "like_count",
            "download_count",
            "uploaded_at",
            "uploaded_by",
            "exif",
        ]

    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from activities.models import Reaction
            return Reaction.objects.filter(
                user=request.user,
                image=obj,
                reaction_type='LIKE'
            ).exists()
        return False

    def get_user_favourited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from activities.models import Reaction
            return Reaction.objects.filter(
                user=request.user,
                image=obj,
                reaction_type='FAVORITE'
            ).exists()
        return False


class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['original_image', 'event', 'privacy']

    def create(self, validated_data):
        from PIL import Image as PILImage
        from PIL.ExifTags import TAGS
        import os 

        image_file = validated_data.get('original_image')

        image_obj = Image.objects.create(
            event = validated_data.get('event'),
            original_image = image_file,
            uploaded_by = self.context['request'].user,
            privacy = validated_data.get('privacy', 'PUBLIC')
        )

        try:
            img = PILImage.open(image_obj.original_image.path)
            exif_data = img._getexif()

            if exif_data is not None:
                exif_dict = {}

            for tag_id, value in exif_data.items():
                tag = TAGS.get(tag_id, tag_id)
                try:
                    exif_dict[tag] = str(value)
                except:
                    exif_dict[tag] = str(value)[:100]  

                image_obj.exif = exif_dict

                if 'Model' in exif_dict:
                    image_obj.camera_model = exif_dict['Model']

                if 'FNumber' in exif_dict:
                    image_obj.aperture = exif_dict['FNumber']

                if 'ExposureTime' in exif_dict:
                    image_obj.shutter_speed = exif_dict['ExposureTime']

                if 'ISOSpeedRatings' in exif_dict:
                    image_obj.iso = exif_dict['ISOSpeedRatings']

                if 'GPSInfo' in exif_dict:
                    gps_info = exif_dataa['GPSInfo']
                    ##fepfkpekge COMPLETE THIS

                if 'DateTimeOriginal' in exif_dict:
                    from datetime import datetime
                    try:
                        capture_time = datetime.strptime(
                            exif_dict['DateTimeOriginal'],
                            '%Y:%m:%d %H:%M:%S'
                        )
                        image_obj.capture_time = capture_time
                    except:
                        pass

                image_obj.save()

        except Exception as e:
                print(f"Exif extraction failed: {str(e)}")

        from images.tasks import generate_thumbnail, apply_watermark
        generate_thumbnail.delay(image_obj.id)
        apply_watermark.delay(image_obj.id)

        return image_obj
