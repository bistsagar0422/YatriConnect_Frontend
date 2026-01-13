"""
YatriConnect - Journey Models
Trip tracking, journey history, and public route detection
"""

from django.db import models
from django.utils import timezone
from Devices.models import Vehicle, Route


# ============================================================
# JOURNEY/TRIP MODEL
# ============================================================
class Journey(models.Model):
    """
    Individual trip/journey made by a vehicle
    Used for history tracking and public route detection
    """
    
    class TripStatus(models.TextChoices):
        ONGOING = 'ongoing', 'Ongoing'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    journey_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique journey identifier"
    )
    
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='journeys',
        help_text="Vehicle making this journey"
    )
    
    route = models.ForeignKey(
        Route,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='journeys',
        help_text="Route this journey belongs to (if detected)"
    )
    
    status = models.CharField(
        max_length=20,
        choices=TripStatus.choices,
        default=TripStatus.ONGOING,
        db_index=True,
        help_text="Current trip status"
    )
    
    # Start location
    start_location = models.CharField(
        max_length=200,
        help_text="Starting point name"
    )
    start_latitude = models.FloatField(help_text="Start latitude")
    start_longitude = models.FloatField(help_text="Start longitude")
    start_time = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="Trip start time"
    )
    
    # End location
    end_location = models.CharField(
        max_length=200,
        blank=True,
        help_text="Ending point name"
    )
    end_latitude = models.FloatField(null=True, blank=True, help_text="End latitude")
    end_longitude = models.FloatField(null=True, blank=True, help_text="End longitude")
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Trip end time"
    )
    
    # Trip statistics
    distance = models.FloatField(
        null=True,
        blank=True,
        help_text="Total distance traveled (meters)"
    )
    
    duration = models.IntegerField(
        null=True,
        blank=True,
        help_text="Trip duration (seconds)"
    )
    
    average_speed = models.FloatField(
        null=True,
        blank=True,
        help_text="Average speed (m/s)"
    )
    
    max_speed = models.FloatField(
        null=True,
        blank=True,
        help_text="Maximum speed reached (m/s)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'journeys'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['journey_id']),
            models.Index(fields=['vehicle', '-start_time']),
            models.Index(fields=['status', '-start_time']),
            models.Index(fields=['route', '-start_time']),
            models.Index(fields=['start_latitude', 'start_longitude']),
            models.Index(fields=['end_latitude', 'end_longitude']),
        ]
    
    def __str__(self):
        return f"Journey {self.journey_id} - {self.vehicle.vehicle_id}"
    
    def complete_journey(self):
        """Mark journey as completed and calculate statistics"""
        if self.status == self.TripStatus.ONGOING and self.end_time:
            self.status = self.TripStatus.COMPLETED
            
            # Calculate duration
            if self.start_time and self.end_time:
                self.duration = int((self.end_time - self.start_time).total_seconds())
            
            # Calculate average speed
            if self.duration and self.duration > 0 and self.distance:
                self.average_speed = self.distance / self.duration
            
            self.save()


# ============================================================
# CONGESTION MODEL - Real-time congestion tracking
# ============================================================
class Congestion(models.Model):
    """
    Congestion data for routes and locations
    Calculated from vehicle speed and density
    """
    
    class CongestionLevel(models.TextChoices):
        LOW = 'low', 'Low'
        MODERATE = 'moderate', 'Moderate'
        HIGH = 'high', 'High'
        SEVERE = 'severe', 'Severe'
    
    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name='congestion_data',
        null=True,
        blank=True,
        help_text="Route this congestion data belongs to"
    )
    
    location_name = models.CharField(
        max_length=200,
        help_text="Location or road segment name"
    )
    
    latitude = models.FloatField(help_text="Central latitude")
    longitude = models.FloatField(help_text="Central longitude")
    
    congestion_level = models.CharField(
        max_length=20,
        choices=CongestionLevel.choices,
        db_index=True,
        help_text="Congestion severity"
    )
    
    vehicle_count = models.IntegerField(
        default=0,
        help_text="Number of vehicles in this segment"
    )
    
    average_speed = models.FloatField(
        help_text="Average vehicle speed (m/s)"
    )
    
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="When this congestion was recorded"
    )
    
    class Meta:
        db_table = 'congestion'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['route', '-timestamp']),
            models.Index(fields=['congestion_level', '-timestamp']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.location_name} - {self.congestion_level} at {self.timestamp}"


# ============================================================
# CRASH EVENT MODEL - Accident/crash detection
# ============================================================
class CrashEvent(models.Model):
    """
    Detected crash/accident events
    Triggered by high acceleration magnitude
    """
    
    class Severity(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'
    
    class Status(models.TextChoices):
        DETECTED = 'detected', 'Detected'
        AWAITING_CONFIRMATION = 'awaiting_confirmation', 'Awaiting User Confirmation'
        CONFIRMED = 'confirmed', 'Confirmed Crash'
        FALSE_ALARM = 'false_alarm', 'False Alarm'
        EMERGENCY_NOTIFIED = 'emergency_notified', 'Emergency Services Notified'
        RESOLVED = 'resolved', 'Resolved'
    
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='crash_events',
        help_text="Vehicle involved in crash"
    )
    
    journey = models.ForeignKey(
        Journey,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='crash_events',
        help_text="Journey during which crash occurred"
    )
    
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        db_index=True,
        help_text="Crash severity"
    )
    
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.DETECTED,
        db_index=True,
        help_text="Event status"
    )
    
    latitude = models.FloatField(help_text="Crash location latitude")
    longitude = models.FloatField(help_text="Crash location longitude")
    
    accel_magnitude = models.FloatField(
        help_text="Acceleration magnitude that triggered detection (m/s²)"
    )
    
    speed_before = models.FloatField(
        null=True,
        blank=True,
        help_text="Vehicle speed before crash (m/s)"
    )
    
    speed_after = models.FloatField(
        null=True,
        blank=True,
        help_text="Vehicle speed after crash (m/s)"
    )
    
    speed_drop_percent = models.FloatField(
        null=True,
        blank=True,
        help_text="Percentage drop in speed"
    )
    
    pitch_angle = models.FloatField(
        null=True,
        blank=True,
        help_text="Vehicle pitch at crash (degrees)"
    )
    
    roll_angle = models.FloatField(
        null=True,
        blank=True,
        help_text="Vehicle roll at crash (degrees)"
    )
    
    g_force = models.FloatField(
        null=True,
        blank=True,
        help_text="G-force experienced (g)"
    )
    
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="When crash was detected"
    )
    
    # Confirmation flow
    confirmation_deadline = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Deadline for user to confirm (15 seconds after detection)"
    )
    
    user_confirmed = models.BooleanField(
        default=False,
        help_text="Whether user confirmed crash"
    )
    
    user_response_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When user responded"
    )
    
    # Notifications
    emergency_notified = models.BooleanField(
        default=False,
        help_text="Whether emergency services were notified"
    )
    
    ambulance_notified = models.BooleanField(
        default=False,
        help_text="Whether ambulance was notified"
    )
    
    police_notified = models.BooleanField(
        default=False,
        help_text="Whether police were notified"
    )
    
    nearby_vehicles_notified = models.BooleanField(
        default=False,
        help_text="Whether nearby vehicles were notified"
    )
    
    notes = models.TextField(
        blank=True,
        help_text="Additional notes or details"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'crash_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['vehicle', '-timestamp']),
            models.Index(fields=['status', '-timestamp']),
            models.Index(fields=['severity', '-timestamp']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"Crash: {self.vehicle.vehicle_id} - {self.severity} at {self.timestamp}"


# ============================================================
# ROAD SEGMENT MODEL - For congestion analysis
# ============================================================
class RoadSegment(models.Model):
    """
    Road segment for congestion tracking
    Divides city into grid segments for traffic analysis
    """
    
    segment_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="Unique segment identifier (e.g., SEG_28.61_77.21)"
    )
    
    name = models.CharField(
        max_length=200,
        help_text="Road/area name"
    )
    
    # Grid coordinates (rounded to 2 decimal places)
    lat_grid = models.FloatField(
        db_index=True,
        help_text="Latitude grid coordinate (rounded)"
    )
    
    lon_grid = models.FloatField(
        db_index=True,
        help_text="Longitude grid coordinate (rounded)"
    )
    
    # Bounding box for segment
    lat_min = models.FloatField(help_text="Minimum latitude")
    lat_max = models.FloatField(help_text="Maximum latitude")
    lon_min = models.FloatField(help_text="Minimum longitude")
    lon_max = models.FloatField(help_text="Maximum longitude")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'road_segments'
        indexes = [
            models.Index(fields=['segment_id']),
            models.Index(fields=['lat_grid', 'lon_grid']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.segment_id})"
    
    def contains_point(self, latitude, longitude):
        """Check if a GPS point is within this segment"""
        return (self.lat_min <= latitude <= self.lat_max and 
                self.lon_min <= longitude <= self.lon_max)


# ============================================================
# THEFT EVENT MODEL - For theft detection
# ============================================================
class TheftEvent(models.Model):
    """
    Theft event detection and tracking
    Triggered when parked vehicle moves without owner
    """
    
    class Status(models.TextChoices):
        DETECTED = 'detected', 'Detected'
        CONFIRMED = 'confirmed', 'Confirmed Theft'
        FALSE_ALARM = 'false_alarm', 'False Alarm'
        RECOVERED = 'recovered', 'Recovered'
    
    vehicle = models.ForeignKey(
        'Devices.Vehicle',
        on_delete=models.CASCADE,
        related_name='theft_events',
        help_text="Vehicle involved in theft"
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DETECTED,
        db_index=True,
        help_text="Theft event status"
    )
    
    # Detection conditions
    speed_detected = models.FloatField(
        help_text="Speed when theft was detected (m/s)"
    )
    
    duration_seconds = models.IntegerField(
        help_text="How long vehicle was moving (seconds)"
    )
    
    engine_was_off = models.BooleanField(
        default=True,
        help_text="Was engine off when theft detected"
    )
    
    owner_nearby = models.BooleanField(
        default=False,
        help_text="Was owner nearby (BLE proximity)"
    )
    
    # Location
    latitude = models.FloatField(help_text="Theft detection location latitude")
    longitude = models.FloatField(help_text="Theft detection location longitude")
    
    # Notifications
    owner_notified = models.BooleanField(
        default=False,
        help_text="Whether owner was notified"
    )
    
    police_notified = models.BooleanField(
        default=False,
        help_text="Whether police were notified"
    )
    
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="When theft was detected"
    )
    
    notes = models.TextField(
        blank=True,
        help_text="Additional notes"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'theft_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['vehicle', '-timestamp']),
            models.Index(fields=['status', '-timestamp']),
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"Theft: {self.vehicle.vehicle_id} - {self.status} at {self.timestamp}"
