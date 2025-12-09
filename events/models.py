from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Event(models.Model):
	name = models.CharField(max_length=100)
	start_date = models.DateTimeField()
	end_date = models.DateTimeField()
	description = models.TextField(null=True, blank=True)
	cover_photo = models.ImageField(upload_to="event_covers/", blank=True, null=True)
	created_by = models.ForeignKey(User, on_delete=models.CASCADE)
	is_public = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)

class Album(models.Model):
	event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
	name = models.CharField(max_length=100)
	start_date = models.DateTimeField()
	end_date = models.DateTimeField()
	description = models.TextField(null=True, blank=True)
	cover_photo = models.ImageField(upload_to="album_covers/", blank=True, null=True)
	created_by = models.ForeignKey(User, on_delete=models.CASCADE)
	is_public = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)	

class AlbumImage(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    image = models.ForeignKey("images.Image", on_delete=models.CASCADE, related_name="+")
    order = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "added_at"]
        unique_together = ("album", "image")
