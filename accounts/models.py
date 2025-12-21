from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone  
from datetime import timedelta

# Create your models here.
class Profile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	profile_picture = models.ImageField(upload_to="profile_pics/", blank=True, null=True)
	bio = models.TextField(blank=True, null=True)
	batch = models.IntegerField(blank=True, null=True)
	department = models.CharField(max_length=50, blank=True, null=True)

	ROLE_CHOICES = [
		('ADMIN', 'Admin'),
		('COORDINATOR', 'Coordinator'),
		('PHOTOGRAPHER', 'Photographer'),
		('MEMBER', 'IMG Member'),
		('PUBLIC', 'Public/Guest'),
	]

	role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PUBLIC')
	email_verified = models.BooleanField(default=False)
	otp = models.CharField(max_length=6, blank=True, null=True)
	otp_created_at = models.DateTimeField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def is_otp_valid(self):
		if not self.otp_created_at:
			return False
		return timezone.now() < self.otp_created_at + timedelta(minutes=10)

	def __str__(self):
		return f"{self.user.username}'s Profile"