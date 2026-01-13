"""
YatriConnect - Sensor Data Models
Telemetry data from IoT devices
"""

from django.db import models
from django.utils import timezone
from Devices.models import Device, Vehicle


# ============================================================
# TELEMETRY MODEL - Raw sensor data from devices
# ============================================================
class Telemetry(models.Model):
    """
    Real-time telemetry data from IoT devices
    Includes GPS, speed, acceleration, and other sensor data
    """
    
    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        related_name='telemetry_data',
        db_index=True,
        help_text="The device that sent this telemetry data"
    )

    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="Time when the data was recorded by the device"
    )
    
    # GPS Data
    latitude = models.FloatField(help_text="GPS latitude in decimal degrees")
    longitude = models.FloatField(help_text="GPS longitude in decimal degrees")
    altitude = models.FloatField(
        null=True,
        blank=True,
        help_text="Altitude in meters"
    )
    
    # Movement Data
    speed = models.FloatField(
        null=True,
        blank=True,
        help_text="Speed in meters per second"
    )

    heading = models.FloatField(
        null=True,
        blank=True,
        help_text="Direction of travel in degrees (0-360)"
    )
    
    # IMU Data (for crash detection)
    pitch = models.FloatField(
        null=True,
        blank=True,
        help_text="Vehicle pitch angle in degrees (-90 to +90)"
    )
    
    roll = models.FloatField(
        null=True,
        blank=True,
        help_text="Vehicle roll angle in degrees (-180 to +180)"
    )
    
    # Acceleration Data (for crash/harsh event detection)
    accel_x = models.FloatField(
        null=True,
        blank=True,
        help_text="Acceleration in X-axis (m/s²)"
    )

    accel_y = models.FloatField(
        null=True,
        blank=True,
        help_text="Acceleration in Y-axis (m/s²)"
    )

    accel_z = models.FloatField(
        null=True,
        blank=True,
        help_text="Acceleration in Z-axis (m/s²)"
    )

    accel_magnitude = models.FloatField(
        null=True,
        blank=True,
        help_text="Magnitude of acceleration vector (m/s²)"
    )
    
    # Vehicle Status (for theft detection)
    engine_status = models.BooleanField(
        default=False,
        help_text="True if engine is ON, False if OFF"
    )
    
    parking_status = models.BooleanField(
        default=False,
        help_text="True if vehicle is PARKED"
    )
    
    ble_proximity = models.BooleanField(
        default=False,
        help_text="True if owner's phone is nearby via BLE"
    )
    
    received_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Time when the server received this data"
    )
    
    class Meta:
        db_table = 'telemetry'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['device', '-timestamp']),
            models.Index(fields=['-timestamp']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['device', 'timestamp']),  # For time-range queries
        ]
        verbose_name_plural = "Telemetry"
    
    def __str__(self):
        return f"{self.device.device_id} at {self.timestamp}"
    
    def calculate_accel_magnitude(self):
        """
        Calculate acceleration magnitude from X, Y, Z components
        Formula: magnitude = sqrt(x² + y² + z²)
        Used for harsh event detection
        """
        if self.accel_x is not None and self.accel_y is not None and self.accel_z is not None:
            import math
            self.accel_magnitude = math.sqrt(
                self.accel_x**2 + self.accel_y**2 + self.accel_z**2
            )
        return self.accel_magnitude
    
    @classmethod
    def get_recent_device(cls, device_obj, minutes=5):
        """
        Get recent telemetry for a device
        Used for live location tracking
        """
        from datetime import timedelta
        cutoff_time = timezone.now() - timedelta(minutes=minutes)
        return cls.objects.filter(
            device=device_obj,
            timestamp__gte=cutoff_time
        ).order_by('-timestamp')
    
    def save(self, *args, **kwargs):
        """Override save to calculate acceleration magnitude"""
        self.calculate_accel_magnitude()
        super().save(*args, **kwargs)
    
