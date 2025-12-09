from django.db import models
from django.contrib.auth.models import User

PRIV_CHOICES = [
    ("PUBLIC", "Public"),
    ("PRIVATE", "Private"),
]

# Create your models here.
class Image(models.Model):
	event = models.ForeignKey("events.Event", on_delete=models.CASCADE)
	batch = models.IntegerField(null=True, blank=True)
	original_image = models.ImageField(upload_to="images/original/", null=False, blank=False)
	watermarked_image = models.ImageField(upload_to="images/watermarked/", null=True, blank=True)
	thumbnail =  models.ImageField(upload_to="images/thumbnails/", null=True, blank=True)
	capture_time = models.DateTimeField(null=True, blank=True)
	camera_model = models.CharField(max_length=100, null=True, blank=True)
	aperture = models.CharField(max_length=100, null=True, blank=True)
	shutter_speed = models.CharField(max_length=100, null=True, blank=True)
	iso = models.IntegerField(null=True, blank=True)
	focal_length = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
	gps_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	gps_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	title = models.CharField(max_length=100, null=True, blank=True)
	description = models.TextField(null=True, blank=True)
	exif = models.JSONField(null=True, blank=True)
	tags = models.ManyToManyField("tags.Tag", blank=True)
	privacy = models.CharField(max_length=10, choices=PRIV_CHOICES, default="PRIVATE")
	view_count = models.IntegerField(default=0)
	like_count = models.IntegerField(default=0)
	download_count = models.IntegerField(default=0)
	uploaded_at = models.DateTimeField(auto_now_add=True)
	uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
	is_deleted = models.BooleanField(default=False)

	def __str__(self):
		return self.title or f"Image {self.pk}"


