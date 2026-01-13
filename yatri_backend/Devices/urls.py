"""
YatriConnect - Devices/Auth URLs
Explicit URL patterns for authentication and user management
"""

from django.urls import path
from . import views
from navigate import additional_views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('refresh/', views.refresh_token, name='refresh_token'),
    
    # User profile management
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('profile/picture/', additional_views.profile_picture, name='profile_picture'),
    
    # User's vehicle management
    path('vehicles/', views.get_user_vehicles, name='get_user_vehicles'),
    path('vehicles/add/', views.add_user_vehicle, name='add_user_vehicle'),
]
