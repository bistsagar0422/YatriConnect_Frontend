"""
YatriConnect - Telemetry Serializers
"""

from rest_framework import serializers
from sensorData.models import Telemetry


class TelemetrySerializer(serializers.ModelSerializer):
    """
    Telemetry data serializer
    Used for displaying telemetry data including IMU and vehicle status
    """
    
    device_id = serializers.CharField(source='device.device_id', read_only=True)
    vehicle_id = serializers.CharField(source='device.vehicle.vehicle_id', read_only=True)
    
    class Meta:
        model = Telemetry
        fields = [
            'id', 'device', 'device_id', 'vehicle_id', 'timestamp',
            'latitude', 'longitude', 'altitude', 'speed', 'heading',
            'accel_x', 'accel_y', 'accel_z', 'accel_magnitude',
            'pitch', 'roll',  # IMU data for crash detection
            'engine_status', 'parking_status', 'ble_proximity',  # Vehicle status for theft detection
            'received_at'
        ]
        read_only_fields = ['id', 'accel_magnitude', 'received_at']


class TelemetryCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for receiving telemetry data from IoT devices
    Includes IMU (pitch, roll) and vehicle status fields
    """
    
    device_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Telemetry
        fields = [
            'device_id', 'timestamp', 'latitude', 'longitude', 
            'altitude', 'speed', 'heading', 
            'accel_x', 'accel_y', 'accel_z',
            'pitch', 'roll',  # NEW: IMU data
            'engine_status', 'parking_status', 'ble_proximity'  # NEW: Vehicle status
        ]
    
    def validate_device_id(self, value):
        """Validate device exists"""
        from Devices.models import Device
        try:
            Device.objects.get(device_id=value)
        except Device.DoesNotExist:
            raise serializers.ValidationError(f"Device with ID {value} does not exist.")
        return value
    
    def create(self, validated_data):
        """Create telemetry and update device ping"""
        from Devices.models import Device
        
        device_id = validated_data.pop('device_id')
        device_obj = Device.objects.get(device_id=device_id)
        
        # Update device last ping
        device_obj.update_ping()
        
        # Create telemetry
        telemetry = Telemetry.objects.create(
            device=device_obj,
            **validated_data
        )
        
        return telemetry


class LiveLocationSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for live location display
    Only essential fields for map display
    """
    
    device_id = serializers.CharField(source='device.device_id', read_only=True)
    vehicle_id = serializers.CharField(source='device.vehicle.vehicle_id', read_only=True)
    vehicle_type = serializers.CharField(source='device.vehicle.vehicle_type', read_only=True)
    
    class Meta:
        model = Telemetry
        fields = ['device_id', 'vehicle_id', 'vehicle_type', 
                 'latitude', 'longitude', 'speed', 'heading', 'timestamp']
