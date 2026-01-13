from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('omniport-login/', views.omniport_login, name='omniport_login'),
    path('me/', views.me, name='me'),
    path('users/', views.users_search, name='users_search'),
    path('profile/', views.profile, name='profile'),
]