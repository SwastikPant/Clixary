from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
import random

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError('Passwords do not match')
        return data
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered')
        return value
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            is_active=False 
        )
        
        otp = str(random.randint(100000, 999999))
        
        from django.utils import timezone
        user.profile.otp = otp
        user.profile.otp_created_at = timezone.now()
        user.profile.save()
        
        from django.core.mail import send_mail
        send_mail(
            'Verify your email - Event Photo Platform',
            f'Your OTP is: {otp}\n\nThis OTP will expire in 10 minutes.',
            'noreply@eventphoto.com',
            [user.email],
            fail_silently=False,
        )
        
        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    
    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
        profile = user.profile
        
        if profile.otp != data['otp']:
            raise serializers.ValidationError("Invalid OTP")
        
        if not profile.is_otp_valid():
            raise serializers.ValidationError("OTP has expired")
        
        data['user'] = user
        return data


class OmniportOAuthSerializer(serializers.Serializer):
    code = serializers.CharField()
    
    def validate(self, data):
        import requests
        from django.conf import settings
        
        token_data = {
            'client_id': settings.OMNIPORT_OAUTH_CLIENT_ID,
            'client_secret': settings.OMNIPORT_OAUTH_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'code': data['code'],
            'redirect_uri': settings.OMNIPORT_OAUTH_REDIRECT_URI,
        }
        
        try:
            token_response = requests.post(
                settings.OMNIPORT_OAUTH_TOKEN_URL,
                data=token_data
            )
            token_response.raise_for_status()
            token_json = token_response.json()
            access_token = token_json.get('access_token')
            
            if not access_token:
                raise serializers.ValidationError("Failed to get access token")
            
            headers = {'Authorization': f'Bearer {access_token}'}
            user_response = requests.get(
                settings.OMNIPORT_OAUTH_USER_INFO_URL,
                headers=headers
            )
            user_response.raise_for_status()
            user_info = user_response.json()
            
            data['user_info'] = user_info
            return data
            
        except requests.exceptions.RequestException as e:
            raise serializers.ValidationError(f"OAuth failed: {str(e)}")