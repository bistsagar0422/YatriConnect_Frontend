"""
YatriConnect - Journey Serializers
"""

from rest_framework import serializers
from Journey.models import Journey, Congestion, CrashEvent, RoadSegment, TheftEvent


# ============================================================
# JOURNEY SERIALIZERS
# ============================================================
class JourneySerializer(serializers.ModelSerializer):
    """Complete journey serializer"""
    
    vehicle_id = serializers.CharField(source='vehicle.vehicle_id', read_only=True)
    vehicle_type = serializers.CharField(source='vehicle.vehicle_type', read_only=True)
    route_name = serializers.CharField(source='route.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Journey
        fields = [
            'id', 'journey_id', 'vehicle', 'vehicle_id', 'vehicle_type',
            'route', 'route_name', 'status', 'status_display',
            'start_location', 'start_latitude', 'start_longitude', 'start_time',
            'end_location', 'end_latitude', 'end_longitude', 'end_time',
            'distance', 'duration', 'average_speed', 'max_speed',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class JourneyCreateSerializer(serializers.ModelSerializer):
    """Serializer for starting a journey"""
    
    class Meta:
        model = Journey
        fields = [
            'journey_id', 'vehicle', 'start_location', 
            'start_latitude', 'start_longitude', 'start_time'
        ]


class JourneyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for journey lists"""
    
    vehicle_id = serializers.CharField(source='vehicle.vehicle_id', read_only=True)
    
    class Meta:
        model = Journey
        fields = [
            'journey_id', 'vehicle_id', 'start_location', 'end_location',
            'start_time', 'end_time', 'distance', 'duration', 'status'
        ]


# ============================================================
# CONGESTION SERIALIZERS
# ============================================================
class CongestionSerializer(serializers.ModelSerializer):
    """Congestion data serializer"""
    
    route_name = serializers.CharField(source='route.name', read_only=True, allow_null=True)
    congestion_level_display = serializers.CharField(source='get_congestion_level_display', read_only=True)
    
    class Meta:
        model = Congestion
        fields = [
            'id', 'route', 'route_name', 'location_name',
            'latitude', 'longitude', 'congestion_level', 'congestion_level_display',
            'vehicle_count', 'average_speed', 'timestamp'
        ]
        read_only_fields = ['id']


class CongestionPublicSerializer(serializers.ModelSerializer):
    """Public congestion data - only for public routes"""
    
    class Meta:
        model = Congestion
        fields = [
            'location_name', 'latitude', 'longitude',
            'congestion_level', 'average_speed', 'timestamp'
        ]


# ============================================================
# ROAD SEGMENT SERIALIZERS
# ============================================================
class RoadSegmentSerializer(serializers.ModelSerializer):
    """Road segment serializer for congestion analysis"""
    
    class Meta:
        model = RoadSegment
        fields = [
            'id', 'segment_id', 'lat_grid', 'lon_grid',
            'min_lat', 'max_lat', 'min_lon', 'max_lon',
            'vehicle_count', 'avg_speed', 'congestion_level',
            'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


# ============================================================
# CRASH EVENT SERIALIZERS
# ============================================================
class CrashEventSerializer(serializers.ModelSerializer):
    """Crash event serializer with confirmation flow"""
    
    vehicle_id = serializers.CharField(source='vehicle.vehicle_id', read_only=True)
    vehicle_owner = serializers.CharField(source='vehicle.owner.username', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = CrashEvent
        fields = [
            'id', 'vehicle', 'vehicle_id', 'vehicle_owner', 'journey',
            'severity', 'severity_display', 'status', 'status_display',
            'latitude', 'longitude', 
            'accel_magnitude', 'g_force', 
            'speed_before', 'speed_after', 'speed_drop_percent',
            'pitch_angle', 'roll_angle',
            'timestamp', 
            'confirmation_deadline', 'user_confirmed', 'user_response_time',
            'emergency_notified', 'ambulance_notified', 'police_notified', 
            'nearby_vehicles_notified',
            'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CrashEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating crash events"""
    
    class Meta:
        model = CrashEvent
        fields = [
            'vehicle', 'journey', 'severity', 'latitude', 'longitude',
            'accel_magnitude', 'g_force', 
            'speed_before', 'speed_after', 'speed_drop_percent',
            'pitch_angle', 'roll_angle',
            'timestamp', 'confirmation_deadline'
        ]


# ============================================================
# THEFT EVENT SERIALIZERS
# ============================================================
class TheftEventSerializer(serializers.ModelSerializer):
    """Theft event serializer"""
    
    vehicle_id = serializers.CharField(source='vehicle.vehicle_id', read_only=True)
    vehicle_owner = serializers.CharField(source='vehicle.owner.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TheftEvent
        fields = [
            'id', 'vehicle', 'vehicle_id', 'vehicle_owner',
            'status', 'status_display',
            'speed_detected', 'duration_seconds',
            'engine_was_off', 'owner_nearby',
            'latitude', 'longitude',
            'timestamp',
            'owner_notified', 'police_notified',
            'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TheftEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating theft events"""
    
    class Meta:
        model = TheftEvent
        fields = [
            'vehicle', 'speed_detected', 'duration_seconds',
            'engine_was_off', 'owner_nearby',
            'latitude', 'longitude', 'timestamp'
        ]
