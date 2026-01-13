"""
YatriConnect - Core Serializers
DRF Serializers for API responses
"""

from rest_framework import serializers
from Devices.models import User, Vehicle, Device, Route


# ============================================================
# USER SERIALIZERS
# ============================================================
class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'emergency_contact', 
                 'first_name', 'last_name', 'profile_picture', 'profile_picture_url', 
                 'bio', 'created_at']
        read_only_fields = ['id', 'created_at', 'profile_picture_url']
    
    def get_profile_picture_url(self, obj):
        """Get full URL for profile picture"""
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'emergency_contact', 
                 'bio', 'profile_picture']
        
    def validate_profile_picture(self, value):
        """Validate profile picture file"""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image file size cannot exceed 5MB.")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Only JPEG, PNG, and WebP images are allowed.")
        
        return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label='Confirm Password')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role', 'phone', 
                 'emergency_contact', 'first_name', 'last_name']
    
    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.NORMAL_USER),
            phone=validated_data.get('phone', ''),
            emergency_contact=validated_data.get('emergency_contact', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


# ============================================================
# VEHICLE SERIALIZERS
# ============================================================
class VehicleSerializer(serializers.ModelSerializer):
    """Vehicle serializer with owner details"""
    
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = ['id', 'vehicle_id', 'owner', 'owner_name', 'vehicle_type', 
                 'vehicle_type_display', 'make', 'model', 'year', 'is_active', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vehicles"""
    
    class Meta:
        model = Vehicle
        fields = ['vehicle_id', 'owner', 'vehicle_type', 'make', 'model', 'year']
    
    def validate_vehicle_id(self, value):
        """Ensure vehicle_id is unique"""
        if Vehicle.objects.filter(vehicle_id=value).exists():
            raise serializers.ValidationError("Vehicle with this ID already exists.")
        return value


# ============================================================
# DEVICE SERIALIZERS
# ============================================================
class DeviceSerializer(serializers.ModelSerializer):
    """Device serializer with health status"""
    
    vehicle_id = serializers.CharField(source='vehicle.vehicle_id', read_only=True)
    is_healthy = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Device
        fields = ['id', 'device_id', 'vehicle', 'vehicle_id', 'status', 
                 'status_display', 'is_healthy', 'firmware_version', 
                 'last_ping', 'created_at', 'updated_at']
        read_only_fields = ['id', 'last_ping', 'created_at', 'updated_at']
    
    def get_is_healthy(self, obj):
        """Get device health status"""
        return obj.is_healthy()


# ============================================================
# ROUTE SERIALIZERS
# ============================================================
class RouteSerializer(serializers.ModelSerializer):
    """Route serializer for public routes"""
    
    class Meta:
        model = Route
        fields = ['id', 'route_id', 'name', 'start_location', 'end_location',
                 'start_latitude', 'start_longitude', 'end_latitude', 'end_longitude',
                 'is_public', 'trip_count', 'average_speed', 'average_duration',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class PublicRouteSerializer(serializers.ModelSerializer):
    """Simplified serializer for public route listing"""
    
    class Meta:
        model = Route
        fields = ['route_id', 'name', 'start_location', 'end_location',
                 'average_speed', 'average_duration', 'trip_count']
