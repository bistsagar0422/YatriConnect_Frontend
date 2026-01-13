"""
YatriConnect - Core Models
Includes: User, Vehicle, Device models with role-based access
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


# ============================================================
# USER MODEL - Custom user with role-based access
# ============================================================
class User(AbstractUser):
    """
    Extended User model with role-based authentication
    Roles: admin, police, normal_user, private_vehicle_owner, government_vehicle_owner
    """
    
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        POLICE = 'police', 'Police'
        NORMAL_USER = 'normal_user', 'Normal User'
        PRIVATE_VEHICLE_OWNER = 'private_vehicle_owner', 'Private Vehicle Owner'
        GOVERNMENT_VEHICLE_OWNER = 'government_vehicle_owner', 'Government Vehicle Owner'
    
    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.NORMAL_USER,
        db_index=True,
        help_text="User role for access control"
    )
    
    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Contact phone number"
    )
    
    emergency_contact = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Emergency contact number"
    )
    
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
        help_text="User profile picture"
    )
    
    bio = models.TextField(
        blank=True,
        null=True,
        help_text="User biography or description"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['username']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == self.Role.ADMIN or self.is_superuser
    
    def is_police(self):
        """Check if user is police"""
        return self.role == self.Role.POLICE
    
    def is_vehicle_owner(self):
        """Check if user owns any vehicle"""
        return self.role in [self.Role.PRIVATE_VEHICLE_OWNER, self.Role.GOVERNMENT_VEHICLE_OWNER]


# ============================================================
# VEHICLE MODEL
# ============================================================
class Vehicle(models.Model):
    """
    Vehicle model supporting public, private, and government vehicles
    """
    
    class VehicleType(models.TextChoices):
        PUBLIC = 'public', 'Public'
        PRIVATE = 'private', 'Private'
        GOVERNMENT = 'government', 'Government'
    
    vehicle_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Unique vehicle identifier (e.g., registration number)"
    )
    
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vehicles',
        null=True,
        blank=True,
        help_text="Vehicle owner (can be null for public vehicles)"
    )
    
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        db_index=True,
        help_text="Type of vehicle"
    )
    
    make = models.CharField(
        max_length=100,
        blank=True,
        help_text="Vehicle manufacturer"
    )
    
    model = models.CharField(
        max_length=100,
        blank=True,
        help_text="Vehicle model"
    )
    
    year = models.IntegerField(
        null=True,
        blank=True,
        help_text="Manufacturing year"
    )
    
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Whether vehicle is currently active"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vehicles'
        indexes = [
            models.Index(fields=['vehicle_type', 'is_active']),
            models.Index(fields=['owner', 'vehicle_type']),
            models.Index(fields=['vehicle_id']),
        ]
    
    def __str__(self):
        return f"{self.vehicle_id} ({self.get_vehicle_type_display()})"
    
    def is_public(self):
        """Check if vehicle is public"""
        return self.vehicle_type == self.VehicleType.PUBLIC
    
    def can_be_viewed_by(self, user):
        """
        Access control logic for vehicle data
        - Admin: can view all
        - Police: can view all
        - Normal User: can view only public vehicles
        - Vehicle Owner: can view own vehicles
        """
        if user.is_admin() or user.is_police():
            return True
        
        if self.vehicle_type == self.VehicleType.PUBLIC:
            return True
        
        if self.owner == user:
            return True
        
        return False


# ============================================================
# DEVICE MODEL - IoT devices attached to vehicles
# ============================================================
class Device(models.Model):
    """
    IoT Device model - represents physical devices sending telemetry
    """
    
    class DeviceStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        MAINTENANCE = 'maintenance', 'Maintenance'
        FAULTY = 'faulty', 'Faulty'
    
    device_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique device identifier (MAC address, IMEI, etc.)"
    )
    
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='devices',
        help_text="Vehicle this device is attached to"
    )
    
    status = models.CharField(
        max_length=20,
        choices=DeviceStatus.choices,
        default=DeviceStatus.ACTIVE,
        db_index=True,
        help_text="Current device status"
    )
    
    firmware_version = models.CharField(
        max_length=50,
        blank=True,
        help_text="Device firmware version"
    )
    
    last_ping = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Last time device sent data"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'devices'
        indexes = [
            models.Index(fields=['device_id']),
            models.Index(fields=['vehicle', 'status']),
            models.Index(fields=['last_ping']),
        ]
    
    def __str__(self):
        return f"{self.device_id} - {self.vehicle.vehicle_id}"
    
    def is_healthy(self):
        """
        Check if device is healthy (sent data recently)
        Returns True if last ping was within last 10 minutes
        """
        if not self.last_ping:
            return False
        
        from datetime import timedelta
        threshold = timezone.now() - timedelta(minutes=10)
        return self.last_ping >= threshold
    
    def update_ping(self):
        """Update last ping timestamp"""
        self.last_ping = timezone.now()
        self.save(update_fields=['last_ping'])


# ============================================================
# ROUTE MODEL - For public route detection
# ============================================================
class Route(models.Model):
    """
    Route model - represents detected public routes
    Generated from repeated trips with same start and end locations
    """
    
    route_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique route identifier"
    )
    
    name = models.CharField(
        max_length=200,
        help_text="Human-readable route name"
    )
    
    start_location = models.CharField(
        max_length=200,
        help_text="Starting point name"
    )
    
    end_location = models.CharField(
        max_length=200,
        help_text="Ending point name"
    )
    
    start_latitude = models.FloatField(
        help_text="Start location latitude"
    )
    
    start_longitude = models.FloatField(
        help_text="Start location longitude"
    )
    
    end_latitude = models.FloatField(
        help_text="End location latitude"
    )
    
    end_longitude = models.FloatField(
        help_text="End location longitude"
    )
    
    is_public = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Whether this is a public route (detected from repeated trips)"
    )
    
    trip_count = models.IntegerField(
        default=0,
        help_text="Number of trips on this route"
    )
    
    average_speed = models.FloatField(
        null=True,
        blank=True,
        help_text="Average speed on this route (m/s)"
    )
    
    average_duration = models.IntegerField(
        null=True,
        blank=True,
        help_text="Average trip duration (seconds)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'routes'
        indexes = [
            models.Index(fields=['route_id']),
            models.Index(fields=['is_public']),
            models.Index(fields=['start_latitude', 'start_longitude']),
            models.Index(fields=['end_latitude', 'end_longitude']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.start_location} -> {self.end_location})"

# ============================================================
# LOCATION MODEL - OpenStreetMap Integration
# ============================================================
class Location(models.Model):
    """
    Location/Place model for destination search
    Integrates with OpenStreetMap data
    """
    
    class LocationType(models.TextChoices):
        BUS_STOP = 'bus_stop', 'Bus Stop'
        METRO_STATION = 'metro_station', 'Metro Station'
        LANDMARK = 'landmark', 'Landmark'
        HOSPITAL = 'hospital', 'Hospital'
        SCHOOL = 'school', 'School'
        RESTAURANT = 'restaurant', 'Restaurant'
        SHOPPING = 'shopping', 'Shopping'
        OFFICE = 'office', 'Office'
        RESIDENTIAL = 'residential', 'Residential'
        OTHER = 'other', 'Other'
    
    name = models.CharField(
        max_length=200,
        db_index=True,
        help_text="Location name"
    )
    
    address = models.TextField(
        blank=True,
        help_text="Full address"
    )
    
    latitude = models.FloatField(
        db_index=True,
        help_text="Latitude coordinate"
    )
    
    longitude = models.FloatField(
        db_index=True,
        help_text="Longitude coordinate"
    )
    
    location_type = models.CharField(
        max_length=20,
        choices=LocationType.choices,
        default=LocationType.OTHER,
        db_index=True
    )
    
    # OpenStreetMap data
    osm_id = models.BigIntegerField(
        null=True,
        blank=True,
        unique=True,
        help_text="OpenStreetMap ID"
    )
    
    osm_type = models.CharField(
        max_length=20,
        blank=True,
        help_text="OSM type: node, way, relation"
    )
    
    # Accessibility
    is_public = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Accessible to public/normal users"
    )
    
    # Route associations
    associated_routes = models.ManyToManyField(
        Route,
        related_name='locations',
        blank=True,
        help_text="Routes passing through this location"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'locations'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['location_type']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.location_type})"