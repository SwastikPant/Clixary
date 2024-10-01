from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import RegisterSerializer, VerifyOTPSerializer, OmniportOAuthSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Registration successful. Please check your email for OTP.',
            'email': user.email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        user.is_active = True
        user.save()
        user.profile.email_verified = True
        user.profile.otp = None  
        user.profile.save()
        
        return Response({
            'message': 'Email verified successfully. You can now login.'
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def omniport_login(request):
    serializer = OmniportOAuthSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user_info = serializer.validated_data['user_info']
    username = user_info.get('username')
    email = user_info.get('contact_information', {}).get('institute_webmail_address')
    full_name = user_info.get('person', {}).get('full_name', '')
    
    if not username or not email:
        return Response(
            {'error': 'Invalid user data from Omniport'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_active': True,  
        }
    )
    
    if not created and user.email != email:
        user.email = email
        user.save()
    
    user.profile.email_verified = True
    user.profile.save()
    
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'username': user.username,
            'email': user.email,
            'is_new': created
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'role': request.user.profile.role,
        'is_staff': request.user.is_staff,
    })

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    profile = request.user.profile
    
    if request.method == 'GET':
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'role': profile.role,
            'bio': profile.bio,
            'batch': profile.batch,
            'department': profile.department,
            'email_verified': profile.email_verified,
        })
    
    elif request.method == 'PATCH':
        if 'bio' in request.data:
            profile.bio = request.data['bio']
        if 'batch' in request.data:
            profile.batch = request.data['batch']
        if 'department' in request.data:
            profile.department = request.data['department']
        
        profile.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'bio': profile.bio,
            'batch': profile.batch,
            'department': profile.department,
        })