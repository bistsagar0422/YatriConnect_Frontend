"""
YatriConnect - Authentication Views
Function-based views for user authentication with JWT
"""

from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User, Vehicle
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    VehicleSerializer,
    VehicleCreateSerializer
)
from .utils import success_response, error_response


# ============================================================
# AUTHENTICATION ENDPOINTS
# ============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def register_user(request):
    """
    User Registration
    
    POST /api/auth/register/
    
    Body:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "secure_pass",
        "password2": "secure_pass",
        "role": "normal_user",  // optional: admin, police, normal_user, private_vehicle_owner, government_vehicle_owner
        "phone": "1234567890",
        "emergency_contact": "0987654321"
    }
    
    Flow:
    1. Validate input data
    2. Check password match
    3. Create user with hashed password
    4. Return user data + JWT tokens
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return success_response(
            data={
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            },
            message="User registered successfully",
            status_code=status.HTTP_201_CREATED
        )
    
    return error_response(
        message="Registration failed",
        errors=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def login_user(request):
    """
    User Login
    
    POST /api/auth/login/
    
    Body:
    {
        "username": "john_doe",
        "password": "secure_pass"
    }
    
    Flow:
    1. Authenticate user credentials
    2. Generate JWT tokens
    3. Return user data + tokens
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return error_response(
            message="Username and password are required",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate user
    user = authenticate(username=username, password=password)
    
    if user is None:
        return error_response(
            message="Invalid credentials",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return error_response(
            message="User account is disabled",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return success_response(
        data={
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        },
        message="Login successful"
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    User Logout
    
    POST /api/auth/logout/
    
    Body:
    {
        "refresh": "refresh_token_here"
    }
    
    Flow:
    1. Get refresh token from request
    2. Blacklist the token
    3. Return success message
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return success_response(message="Logout successful")
    
    except Exception as e:
        return error_response(
            message="Logout failed",
            errors=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token(request):
    """
    Refresh JWT Token
    
    POST /api/auth/refresh/
    
    Body:
    {
        "refresh": "refresh_token_here"
    }
    
    Returns new access token
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return error_response(
            message="Refresh token is required",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        
        return success_response(
            data={
                'access': str(refresh.access_token)
            },
            message="Token refreshed successfully"
        )
    
    except Exception as e:
        return error_response(
            message="Token refresh failed",
            errors=str(e),
            status_code=status.HTTP_401_UNAUTHORIZED
        )


# ============================================================
# USER PROFILE ENDPOINTS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get User Profile
    
    GET /api/auth/profile/
    
    Returns current user's profile data
    """
    serializer = UserSerializer(request.user)
    return success_response(data=serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update User Profile
    
    PUT/PATCH /api/auth/profile/
    
    Body:
    {
        "phone": "new_phone",
        "emergency_contact": "new_emergency_contact",
        "email": "new_email"
    }
    
    Note: Cannot change username or role via this endpoint
    """
    user = request.user
    
    # Fields that can be updated
    allowed_fields = ['phone', 'emergency_contact', 'email', 'first_name', 'last_name']
    
    for field in allowed_fields:
        if field in request.data:
            setattr(user, field, request.data[field])
    
    user.save()
    
    serializer = UserSerializer(user)
    return success_response(
        data=serializer.data,
        message="Profile updated successfully"
    )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change Password
    
    PUT /api/auth/change-password/
    
    Body:
    {
        "old_password": "current_password",
        "new_password": "new_password",
        "new_password2": "new_password"
    }
    """
    user = request.user
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    new_password2 = request.data.get('new_password2')
    
    if not all([old_password, new_password, new_password2]):
        return error_response(
            message="All password fields are required",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify old password
    if not user.check_password(old_password):
        return error_response(
            message="Old password is incorrect",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify new passwords match
    if new_password != new_password2:
        return error_response(
            message="New passwords do not match",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    return success_response(message="Password changed successfully")


# ============================================================
# VEHICLE MANAGEMENT (User's own vehicles)
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_vehicles(request):
    """
    Get User's Vehicles
    
    GET /api/auth/vehicles/
    
    Returns all vehicles owned by the current user
    """
    vehicles = Vehicle.objects.filter(owner=request.user)
    serializer = VehicleSerializer(vehicles, many=True)
    
    return success_response(data=serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_user_vehicle(request):
    """
    Add Vehicle to User Account
    
    POST /api/auth/vehicles/
    
    Body:
    {
        "vehicle_id": "ABC123",
        "vehicle_type": "private",  // private or government
        "make": "Toyota",
        "model": "Camry",
        "year": 2022
    }
    
    Note: Normal users cannot create public vehicles
    """
    # Ensure user is vehicle owner
    if request.user.role not in [User.Role.PRIVATE_VEHICLE_OWNER, User.Role.GOVERNMENT_VEHICLE_OWNER]:
        return error_response(
            message="Only vehicle owners can add vehicles",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    # Set owner to current user
    data = request.data.copy()
    data['owner'] = request.user.id
    
    serializer = VehicleCreateSerializer(data=data)
    
    if serializer.is_valid():
        vehicle = serializer.save()
        return success_response(
            data=VehicleSerializer(vehicle).data,
            message="Vehicle added successfully",
            status_code=status.HTTP_201_CREATED
        )
    
    return error_response(
        message="Failed to add vehicle",
        errors=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )
