from django.db import models
from django.contrib.auth.models import User
from images.models import Image

class Reaction(models.Model):
    REACTION_TYPES = [
        ('LIKE', 'Like'),
        ('FAVORITE', 'Favorite'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(max_length=10, choices=REACTION_TYPES, default='LIKE')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'image', 'reaction_type')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.reaction_type} - {self.image.id}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.user.username} on {self.image.id}"