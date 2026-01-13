"""
YatriConnect - Navigate Module
Live location, congestion tracking, crash detection
Function-based views with role-based access control
"""

from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework import status
from django.utils import timezone
from django.db.models import Avg, Count
from django.core.cache import cache
from datetime import timedelta

from Devices.models import Vehicle, Device
from Devices.utils import (
    success_response, error_response, 
    filter_vehicles_by_access,
    apply_date_filter,
    police_or_admin
)
from sensorData.models import Telemetry
from sensorData.serializers import TelemetrySerializer, TelemetryCreateSerializer, LiveLocationSerializer
from Journey.models import CrashEvent, Congestion
from Journey.serializers import CrashEventSerializer, CongestionSerializer, CongestionPublicSerializer


# Custom throttle for telemetry ingestion (IoT devices)
class TelemetryRateThrottle(UserRateThrottle):
    """Higher rate limit for IoT telemetry ingestion"""
    rate = '10000/hour'


# ============================================================
# TELEMETRY INGESTION (IoT Devices)
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([TelemetryRateThrottle])
def ingest_telemetry(request):
    """
    Ingest Telemetry Data from IoT Device
    
    POST /api/navigate/telemetry/
    
    Body:
    {
        "device_id": "DEVICE123",
        "timestamp": "2024-01-15T10:30:00Z",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "speed": 15.5,
        "heading": 90,
        "pitch": 5.0,           # NEW: Vehicle pitch angle
        "roll": 2.0,            # NEW: Vehicle roll angle
        "accel_x": 0.5,
        "accel_y": 0.3,
        "accel_z": 9.8,
        "engine_status": true,  # NEW: Engine on/off
        "parking_status": false,# NEW: Parked or moving
        "ble_proximity": true   # NEW: Owner nearby via BLE
    }
    
    Flow:
    1. Validate device exists
    2. Create telemetry record
    3. Update device last_ping
    4. Check for CRASH detection (G-force, speed drop, pitch/roll)
    5. Check for THEFT detection (parked, engine off, owner away, moving)
    6. Update congestion data for road segment
    7. Invalidate live location cache
    
    CRASH DETECTION RULES:
    - G-force > 3.5g
    - Speed drops > 60% in 1-2 seconds
    - Pitch or roll > 45°
    - Acceleration spike > ±5 m/s²
    
    THEFT DETECTION RULES:
    - Vehicle status = PARKED
    - Engine = OFF
    - Owner not nearby (BLE = False)
    - Vehicle moves > 5 km/h for > 10 sec
    """
    serializer = TelemetryCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        telemetry = serializer.save()
        
        # ============================================================
        # CRASH DETECTION LOGIC
        # ============================================================
        crash_detected = False
        
        # Get previous telemetry for speed comparison
        previous_telemetry = Telemetry.objects.filter(
            device=telemetry.device
        ).exclude(id=telemetry.id).order_by('-timestamp').first()
        
        if previous_telemetry and telemetry.speed is not None:
            # Calculate time difference
            time_diff = (telemetry.timestamp - previous_telemetry.timestamp).total_seconds()
            
            # Check crash conditions (all must be true)
            if 1 <= time_diff <= 2:  # Within 1-2 seconds
                # 1. Check G-force > 3.5g
                g_force = None
                if telemetry.accel_magnitude:
                    g_force = telemetry.accel_magnitude / 9.8  # Convert to g
                
                # 2. Check speed drop > 60%
                speed_drop_percent = 0
                if previous_telemetry.speed and previous_telemetry.speed > 0:
                    speed_drop_percent = ((previous_telemetry.speed - telemetry.speed) / previous_telemetry.speed) * 100
                
                # 3. Check pitch or roll > 45°
                pitch_critical = telemetry.pitch and abs(telemetry.pitch) > 45
                roll_critical = telemetry.roll and abs(telemetry.roll) > 45
                
                # 4. Check acceleration spike > ±5 m/s²
                accel_spike = False
                if telemetry.accel_x or telemetry.accel_y:
                    accel_spike = (
                        (telemetry.accel_x and abs(telemetry.accel_x) > 5) or
                        (telemetry.accel_y and abs(telemetry.accel_y) > 5)
                    )
                
                # ALL conditions must be met
                if (g_force and g_force > 3.5 and
                    speed_drop_percent > 60 and
                    (pitch_critical or roll_critical) and
                    accel_spike):
                    
                    crash_detected = True
                    
                    # Determine severity based on G-force
                    if g_force > 8:
                        severity = CrashEvent.Severity.CRITICAL
                    elif g_force > 6:
                        severity = CrashEvent.Severity.HIGH
                    elif g_force > 4.5:
                        severity = CrashEvent.Severity.MEDIUM
                    else:
                        severity = CrashEvent.Severity.LOW
                    
                    # Calculate confirmation deadline (15 seconds)
                    from datetime import timedelta
                    confirmation_deadline = timezone.now() + timedelta(seconds=15)
                    
                    # Create crash event
                    CrashEvent.objects.create(
                        vehicle=telemetry.device.vehicle,
                        journey=None,  # Can be linked if journey is active
                        severity=severity,
                        status=CrashEvent.Status.AWAITING_CONFIRMATION,
                        latitude=telemetry.latitude,
                        longitude=telemetry.longitude,
                        accel_magnitude=telemetry.accel_magnitude,
                        speed_before=previous_telemetry.speed,
                        speed_after=telemetry.speed,
                        speed_drop_percent=speed_drop_percent,
                        pitch_angle=telemetry.pitch,
                        roll_angle=telemetry.roll,
                        g_force=g_force,
                        timestamp=telemetry.timestamp,
                        confirmation_deadline=confirmation_deadline
                    )
                    
                    # Update vehicle status
                    telemetry.device.vehicle.is_active = False
                    telemetry.device.vehicle.save()
        
        # ============================================================
        # THEFT DETECTION LOGIC
        # ============================================================
        theft_detected = False
        
        # Check theft conditions
        if (telemetry.parking_status and              # Vehicle is PARKED
            not telemetry.engine_status and           # Engine is OFF
            not telemetry.ble_proximity and           # Owner NOT nearby
            telemetry.speed and telemetry.speed > 1.39):  # Moving > 5 km/h (1.39 m/s)
            
            # Check if vehicle has been moving for > 10 seconds
            recent_telemetry = Telemetry.objects.filter(
                device=telemetry.device,
                timestamp__gte=telemetry.timestamp - timedelta(seconds=10),
                speed__gt=1.39  # > 5 km/h
            ).count()
            
            if recent_telemetry >= 5:  # At least 5 readings in 10 seconds
                theft_detected = True
                
                # Create theft event
                from Journey.models import TheftEvent
                TheftEvent.objects.create(
                    vehicle=telemetry.device.vehicle,
                    status=TheftEvent.Status.DETECTED,
                    speed_detected=telemetry.speed,
                    duration_seconds=10,
                    engine_was_off=not telemetry.engine_status,
                    owner_nearby=telemetry.ble_proximity,
                    latitude=telemetry.latitude,
                    longitude=telemetry.longitude,
                    owner_notified=True,  # Trigger notification
                    police_notified=True,  # Trigger police alert
                    timestamp=telemetry.timestamp
                )
                
                # Update vehicle status
                telemetry.device.vehicle.is_active = False
                telemetry.device.vehicle.save()
        
        # Invalidate live location cache
        cache_key = f"live_location_{telemetry.device.vehicle.vehicle_id}"
        cache.delete(cache_key)
        
        # Prepare response
        response_data = TelemetrySerializer(telemetry).data
        response_data['crash_detected'] = crash_detected
        response_data['theft_detected'] = theft_detected
        
        return success_response(
            data=response_data,
            message="Telemetry data received",
            status_code=status.HTTP_201_CREATED
        )
    
    return error_response(
        message="Invalid telemetry data",
        errors=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# LIVE LOCATION TRACKING
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_live_locations(request):
    """
    Get Live Locations of Vehicles
    
    GET /api/navigate/live-locations/
    
    Query params:
    - vehicle_type: public/private/government (filter by type)
    - minutes: time window for "live" data (default: 5 minutes)
    
    Access Control:
    - Admin/Police: All vehicles
    - Normal User: Only public vehicles
    - Vehicle Owner: Own vehicles + public
    
    Caching: 10 seconds TTL
    
    Flow:
    1. Check user access level
    2. Get recent telemetry (last 5 minutes)
    3. Filter by vehicle access permissions
    4. Return latest location per vehicle
    """
    from django.conf import settings
    
    # Get time window (default 5 minutes)
    minutes = int(request.GET.get('minutes', 5))
    cutoff_time = timezone.now() - timedelta(minutes=minutes)
    
    # Get vehicle type filter
    vehicle_type = request.GET.get('vehicle_type', None)
    
    # Build cache key
    cache_key = f"live_locations_{request.user.id}_{vehicle_type}_{minutes}"
    
    # Try cache first
    cached_data = cache.get(cache_key)
    if cached_data:
        return success_response(data=cached_data)
    
    # Get recent telemetry
    telemetry_qs = Telemetry.objects.filter(
        timestamp__gte=cutoff_time
    ).select_related('device__vehicle', 'device__vehicle__owner')
    
    # Filter by vehicle type if specified
    if vehicle_type:
        telemetry_qs = telemetry_qs.filter(device__vehicle__vehicle_type=vehicle_type)
    
    # Apply access control
    user = request.user
    if not (user.is_admin() or user.is_police()):
        # Normal users: only public vehicles
        if user.role == 'normal_user':
            telemetry_qs = telemetry_qs.filter(device__vehicle__vehicle_type='public')
        # Vehicle owners: own vehicles + public
        elif user.is_vehicle_owner():
            from django.db.models import Q
            telemetry_qs = telemetry_qs.filter(
                Q(device__vehicle__owner=user) | Q(device__vehicle__vehicle_type='public')
            )
    
    # Get latest telemetry per vehicle
    vehicles_data = {}
    for telemetry in telemetry_qs.order_by('device__vehicle', '-timestamp'):
        vehicle_id = telemetry.device.vehicle.vehicle_id
        if vehicle_id not in vehicles_data:
            vehicles_data[vehicle_id] = telemetry
    
    # Serialize
    latest_locations = list(vehicles_data.values())
    serializer = LiveLocationSerializer(latest_locations, many=True)
    
    # Cache for 10 seconds
    cache.set(cache_key, serializer.data, settings.CACHE_TTL['live_data'])
    
    return success_response(data=serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vehicle_location(request, vehicle_id):
    """
    Get Live Location of Specific Vehicle
    
    GET /api/navigate/live-locations/<vehicle_id>/
    
    Access Control: Based on vehicle ownership and type
    
    Caching: 10 seconds TTL per vehicle
    """
    from django.conf import settings
    
    # Check cache first
    cache_key = f"live_location_{vehicle_id}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return success_response(data=cached_data)
    
    # Get vehicle
    try:
        vehicle = Vehicle.objects.select_related('owner').get(vehicle_id=vehicle_id)
    except Vehicle.DoesNotExist:
        return error_response(
            message=f"Vehicle {vehicle_id} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Check access
    if not vehicle.can_be_viewed_by(request.user):
        return error_response(
            message="You don't have permission to view this vehicle",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    # Get latest telemetry (last 5 minutes)
    cutoff_time = timezone.now() - timedelta(minutes=5)
    telemetry = Telemetry.objects.filter(
        device__vehicle=vehicle,
        timestamp__gte=cutoff_time
    ).select_related('device').order_by('-timestamp').first()
    
    if not telemetry:
        return error_response(
            message=f"No recent location data for vehicle {vehicle_id}",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    serializer = LiveLocationSerializer(telemetry)
    
    # Cache for 10 seconds
    cache.set(cache_key, serializer.data, settings.CACHE_TTL['live_data'])
    
    return success_response(data=serializer.data)


# ============================================================
# CONGESTION TRACKING
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_congestion_data(request):
    """
    Get Congestion Data
    
    GET /api/navigate/congestion/
    
    Query params:
    - route_id: filter by route
    - level: filter by congestion level (low/moderate/high/severe)
    - minutes: time window (default: 30 minutes)
    
    Access Control:
    - Admin/Police: All congestion data
    - Others: Only public route congestion
    
    Caching: 5 minutes TTL
    """
    from django.conf import settings
    
    # Check cache
    cache_key = f"congestion_{request.user.role}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return success_response(data=cached_data)
    
    # Get time window
    minutes = int(request.GET.get('minutes', 30))
    cutoff_time = timezone.now() - timedelta(minutes=minutes)
    
    # Base query
    congestion_qs = Congestion.objects.filter(
        timestamp__gte=cutoff_time
    ).select_related('route')
    
    # Filter by route if specified
    route_id = request.GET.get('route_id')
    if route_id:
        congestion_qs = congestion_qs.filter(route__route_id=route_id)
    
    # Filter by level if specified
    level = request.GET.get('level')
    if level:
        congestion_qs = congestion_qs.filter(congestion_level=level)
    
    # Access control
    user = request.user
    if not (user.is_admin() or user.is_police()):
        # Non-privileged users: only public routes
        congestion_qs = congestion_qs.filter(route__is_public=True)
        serializer_class = CongestionPublicSerializer
    else:
        serializer_class = CongestionSerializer
    
    congestion_qs = congestion_qs.order_by('-timestamp')
    
    serializer = serializer_class(congestion_qs, many=True)
    
    # Cache for 5 minutes
    cache.set(cache_key, serializer.data, settings.CACHE_TTL['congestion'])
    
    return success_response(data=serializer.data)


# ============================================================
# CRASH DETECTION
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@police_or_admin
def get_crash_events(request):
    """
    Get Crash Events
    
    GET /api/navigate/crashes/
    
    Query params:
    - status: detected/verified/false_alarm/resolved
    - severity: low/medium/high/critical
    - start_date: filter by date
    - end_date: filter by date
    
    Access: Police and Admin only
    
    Flow:
    1. Filter crash events by query params
    2. Return with pagination support
    """
    crash_qs = CrashEvent.objects.select_related(
        'vehicle', 'vehicle__owner', 'journey'
    )
    
    # Apply filters
    crash_qs = apply_date_filter(crash_qs, 'timestamp', request)
    
    status_filter = request.GET.get('status')
    if status_filter:
        crash_qs = crash_qs.filter(status=status_filter)
    
    severity_filter = request.GET.get('severity')
    if severity_filter:
        crash_qs = crash_qs.filter(severity=severity_filter)
    
    crash_qs = crash_qs.order_by('-timestamp')
    
    serializer = CrashEventSerializer(crash_qs, many=True)
    
    return success_response(data=serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@police_or_admin
def get_crash_detail(request, crash_id):
    """
    Get Crash Event Detail
    
    GET /api/navigate/crashes/<id>/
    
    Access: Police and Admin only
    """
    try:
        crash = CrashEvent.objects.select_related(
            'vehicle', 'vehicle__owner', 'journey'
        ).get(id=crash_id)
    except CrashEvent.DoesNotExist:
        return error_response(
            message="Crash event not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CrashEventSerializer(crash)
    return success_response(data=serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@police_or_admin
def update_crash_status(request, crash_id):
    """
    Update Crash Event Status
    
    PATCH /api/navigate/crashes/<id>/status/
    
    Body:
    {
        "status": "verified",  // detected/verified/false_alarm/resolved
        "notes": "Police investigated, minor accident"
    }
    
    Access: Police and Admin only
    """
    try:
        crash = CrashEvent.objects.get(id=crash_id)
    except CrashEvent.DoesNotExist:
        return error_response(
            message="Crash event not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Update status
    new_status = request.data.get('status')
    if new_status and new_status in dict(CrashEvent.Status.choices):
        crash.status = new_status
    
    # Update notes
    notes = request.data.get('notes')
    if notes:
        crash.notes = notes
    
    crash.save()
    
    serializer = CrashEventSerializer(crash)
    return success_response(
        data=serializer.data,
        message="Crash status updated"
    )


# ============================================================
# DEVICE HEALTH MONITORING
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_device_health(request):
    """
    Get Device Health Status
    
    GET /api/navigate/device-health/
    
    Query params:
    - status: active/inactive/maintenance/faulty
    
    Returns devices with health indicators
    
    Access Control: Based on vehicle ownership
    """
    # Get all devices
    devices_qs = Device.objects.select_related('vehicle', 'vehicle__owner')
    
    # Filter by status if specified
    status_filter = request.GET.get('status')
    if status_filter:
        devices_qs = devices_qs.filter(status=status_filter)
    
    # Apply access control based on vehicles
    vehicles = Vehicle.objects.all()
    accessible_vehicles = filter_vehicles_by_access(request.user, vehicles)
    devices_qs = devices_qs.filter(vehicle__in=accessible_vehicles)
    
    # Prepare response
    from Devices.serializers import DeviceSerializer
    serializer = DeviceSerializer(devices_qs, many=True)
    
    return success_response(data=serializer.data)


# ============================================================
# EVENT CONFIRMATION & NOTIFICATION
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_crash_event(request, crash_id):
    """
    Confirm or Deny Crash Event (User Response)
    
    POST /api/navigate/crashes/<id>/confirm/
    
    Body:
    {
        "is_crash": false  // true = real crash, false = false alarm
    }
    
    Flow:
    1. Check if crash event exists and is awaiting confirmation
    2. Check if within 15-second deadline
    3. Update crash status based on user response
    4. If no response or real crash: trigger emergency cascade
    
    Emergency Cascade (if is_crash=true or no response):
    - Notify ambulance
    - Notify police
    - Notify nearby vehicles
    - Update crash status to EMERGENCY_NOTIFIED
    
    Academic Note: This demonstrates time-based conditional logic
    where user interaction within a deadline determines system behavior.
    """
    try:
        crash = CrashEvent.objects.select_related('vehicle', 'vehicle__owner').get(id=crash_id)
    except CrashEvent.DoesNotExist:
        return error_response(
            message="Crash event not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Verify user owns the vehicle
    if crash.vehicle.owner != request.user and not (request.user.is_admin() or request.user.is_police()):
        return error_response(
            message="You don't have permission to confirm this crash event",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    # Check if event is awaiting confirmation
    if crash.status != CrashEvent.Status.AWAITING_CONFIRMATION:
        return error_response(
            message=f"Crash event is not awaiting confirmation (current status: {crash.status})",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if within deadline
    if crash.confirmation_deadline and timezone.now() > crash.confirmation_deadline:
        # Deadline passed - auto-trigger emergency
        crash.status = CrashEvent.Status.EMERGENCY_NOTIFIED
        crash.user_confirmed = False
        crash.ambulance_notified = True
        crash.police_notified = True
        crash.nearby_vehicles_notified = True
        crash.save()
        
        return error_response(
            message="Confirmation deadline exceeded. Emergency services have been notified.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Get user response
    is_crash = request.data.get('is_crash', None)
    if is_crash is None:
        return error_response(
            message="'is_crash' field is required",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate response time
    response_time = (timezone.now() - crash.timestamp).total_seconds()
    crash.user_response_time = response_time
    crash.user_confirmed = True
    
    if is_crash:
        # User confirms it's a real crash
        crash.status = CrashEvent.Status.EMERGENCY_NOTIFIED
        crash.ambulance_notified = True
        crash.police_notified = True
        crash.nearby_vehicles_notified = True
        crash.save()
        
        return success_response(
            data=CrashEventSerializer(crash).data,
            message="Emergency services have been notified"
        )
    else:
        # User denies crash (false alarm)
        crash.status = CrashEvent.Status.FALSE_ALARM
        crash.save()
        
        # Reactivate vehicle
        crash.vehicle.is_active = True
        crash.vehicle.save()
        
        return success_response(
            data=CrashEventSerializer(crash).data,
            message="Crash event marked as false alarm"
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_theft_events(request):
    """
    Get Theft Events
    
    GET /api/navigate/theft/
    
    Query params:
    - status: detected/investigating/recovered/false_alarm
    - vehicle_id: filter by specific vehicle
    - start_date: YYYY-MM-DD
    - end_date: YYYY-MM-DD
    
    Access Control:
    - Admin/Police: All theft events
    - Vehicle Owner: Only their vehicles
    - Normal User: No access
    
    Flow:
    1. Apply access control filters
    2. Filter by query parameters
    3. Return with pagination
    
    Academic Note: Demonstrates role-based data filtering where
    different user types see different subsets of sensitive data.
    """
    from Journey.models import TheftEvent
    from Journey.serializers import TheftEventSerializer
    
    # Check access control
    user = request.user
    if user.role == 'normal_user':
        return error_response(
            message="You don't have permission to access theft events",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    # Build query
    theft_qs = TheftEvent.objects.select_related('vehicle', 'vehicle__owner')
    
    # Apply access control
    if not (user.is_admin() or user.is_police()):
        # Vehicle owners: only their vehicles
        theft_qs = theft_qs.filter(vehicle__owner=user)
    
    # Apply filters
    theft_qs = apply_date_filter(theft_qs, 'timestamp', request)
    
    status_filter = request.GET.get('status')
    if status_filter:
        theft_qs = theft_qs.filter(status=status_filter)
    
    vehicle_id = request.GET.get('vehicle_id')
    if vehicle_id:
        theft_qs = theft_qs.filter(vehicle__vehicle_id=vehicle_id)
    
    theft_qs = theft_qs.order_by('-timestamp')
    
    serializer = TheftEventSerializer(theft_qs, many=True)
    
    return success_response(data=serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@police_or_admin
def update_theft_status(request, theft_id):
    """
    Update Theft Event Status
    
    PATCH /api/navigate/theft/<id>/status/
    
    Body:
    {
        "status": "investigating",  // detected/investigating/recovered/false_alarm
        "notes": "Police dispatched to location"
    }
    
    Access: Police and Admin only
    
    Flow:
    1. Validate theft event exists
    2. Update status and notes
    3. If recovered: reactivate vehicle
    """
    from Journey.models import TheftEvent
    from Journey.serializers import TheftEventSerializer
    
    try:
        theft = TheftEvent.objects.select_related('vehicle').get(id=theft_id)
    except TheftEvent.DoesNotExist:
        return error_response(
            message="Theft event not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Update status
    new_status = request.data.get('status')
    if new_status and new_status in dict(TheftEvent.Status.choices):
        theft.status = new_status
        
        # If recovered, reactivate vehicle
        if new_status == TheftEvent.Status.RECOVERED:
            theft.vehicle.is_active = True
            theft.vehicle.save()
    
    # Update notes
    notes = request.data.get('notes')
    if notes:
        theft.notes = notes
    
    theft.save()
    
    serializer = TheftEventSerializer(theft)
    return success_response(
        data=serializer.data,
        message="Theft status updated"
    )


# ============================================================
# CONGESTION ANALYSIS
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_congestion_by_route(request):
    """
    Get Real-time Congestion Analysis for Route
    
    GET /api/navigate/congestion/route/
    
    Query params:
    - start_lat: Starting latitude
    - start_lon: Starting longitude
    - end_lat: Ending latitude
    - end_lon: Ending longitude
    - time_window: Minutes to consider (default: 10)
    
    Returns:
    {
        "segments": [
            {
                "segment_id": "28.61_77.21",
                "latitude": 28.61,
                "longitude": 77.21,
                "vehicle_count": 25,
                "avg_speed": 8.5,
                "congestion_level": "HIGH",
                "color": "#FF0000",
                "description": "Heavy traffic"
            }
        ],
        "overall_congestion": "MEDIUM",
        "overall_color": "#FFA500",
        "estimated_time_minutes": 45
    }
    
    Congestion Rules:
    - LOW: < 10 vehicles, avg speed > 25 km/h (GREEN: #00FF00)
    - MEDIUM: 10-20 vehicles, avg speed 15-25 km/h (YELLOW: #FFA500)
    - HIGH: > 20 vehicles, avg speed < 15 km/h (RED: #FF0000)
    
    Flow:
    1. Parse start/end coordinates
    2. Divide route into grid segments (0.01° resolution)
    3. Query recent telemetry for each segment
    4. Calculate vehicle count and average speed per segment
    5. Classify congestion level with color mapping
    6. Return segment-wise + overall analysis
    
    Academic Note: This demonstrates spatial analysis where continuous
    geographic space is discretized into grid cells for aggregation.
    """
    from Journey.models import RoadSegment
    
    # Parse coordinates
    try:
        start_lat = float(request.GET.get('start_lat'))
        start_lon = float(request.GET.get('start_lon'))
        end_lat = float(request.GET.get('end_lat'))
        end_lon = float(request.GET.get('end_lon'))
    except (TypeError, ValueError):
        return error_response(
            message="Invalid coordinates. Required: start_lat, start_lon, end_lat, end_lon",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Get time window
    time_window = int(request.GET.get('time_window', 10))
    cutoff_time = timezone.now() - timedelta(minutes=time_window)
    
    # Congestion thresholds
    CONGESTION_THRESHOLDS = {
        'LOW': {
            'max_vehicles': 10,
            'min_speed': 25,  # km/h
            'color': '#00FF00',
            'description': 'Light traffic - smooth flow'
        },
        'MEDIUM': {
            'max_vehicles': 20,
            'min_speed': 15,  # km/h
            'color': '#FFA500',
            'description': 'Moderate traffic - some delays'
        },
        'HIGH': {
            'max_vehicles': float('inf'),
            'min_speed': 0,  # km/h
            'color': '#FF0000',
            'description': 'Heavy traffic - significant delays'
        }
    }
    
    # Generate grid segments along route
    # Grid resolution: 0.01 degrees (~1.1 km)
    GRID_RESOLUTION = 0.01
    
    segments_data = []
    
    # Calculate number of segments
    lat_diff = abs(end_lat - start_lat)
    lon_diff = abs(end_lon - start_lon)
    num_segments = max(int(lat_diff / GRID_RESOLUTION), int(lon_diff / GRID_RESOLUTION), 1)
    
    # Interpolate points along route
    for i in range(num_segments + 1):
        ratio = i / max(num_segments, 1)
        seg_lat = start_lat + (end_lat - start_lat) * ratio
        seg_lon = start_lon + (end_lon - start_lon) * ratio
        
        # Round to grid
        grid_lat = round(seg_lat / GRID_RESOLUTION) * GRID_RESOLUTION
        grid_lon = round(seg_lon / GRID_RESOLUTION) * GRID_RESOLUTION
        
        segment_id = f"{grid_lat:.2f}_{grid_lon:.2f}"
        
        # Check if already processed
        if any(s['segment_id'] == segment_id for s in segments_data):
            continue
        
        # Get or create segment
        segment, _ = RoadSegment.objects.get_or_create(
            segment_id=segment_id,
            defaults={
                'lat_grid': grid_lat,
                'lon_grid': grid_lon,
                'min_lat': grid_lat - GRID_RESOLUTION / 2,
                'max_lat': grid_lat + GRID_RESOLUTION / 2,
                'min_lon': grid_lon - GRID_RESOLUTION / 2,
                'max_lon': grid_lon + GRID_RESOLUTION / 2
            }
        )
        
        # Query telemetry in this segment
        telemetry_in_segment = Telemetry.objects.filter(
            timestamp__gte=cutoff_time,
            latitude__gte=segment.min_lat,
            latitude__lte=segment.max_lat,
            longitude__gte=segment.min_lon,
            longitude__lte=segment.max_lon
        ).select_related('device__vehicle')
        
        # Calculate metrics
        vehicle_count = telemetry_in_segment.values('device__vehicle').distinct().count()
        
        # Calculate average speed (convert m/s to km/h)
        speeds = telemetry_in_segment.filter(speed__isnull=False).values_list('speed', flat=True)
        avg_speed_mps = sum(speeds) / len(speeds) if speeds else 0
        avg_speed_kmh = avg_speed_mps * 3.6  # Convert m/s to km/h
        
        # Classify congestion level
        if vehicle_count < CONGESTION_THRESHOLDS['LOW']['max_vehicles'] and avg_speed_kmh > CONGESTION_THRESHOLDS['LOW']['min_speed']:
            level = 'LOW'
        elif vehicle_count < CONGESTION_THRESHOLDS['MEDIUM']['max_vehicles'] and avg_speed_kmh > CONGESTION_THRESHOLDS['MEDIUM']['min_speed']:
            level = 'MEDIUM'
        else:
            level = 'HIGH'
        
        # Update segment congestion
        segment.vehicle_count = vehicle_count
        segment.avg_speed = avg_speed_kmh
        segment.congestion_level = level
        segment.last_updated = timezone.now()
        segment.save()
        
        # Add to response
        segments_data.append({
            'segment_id': segment_id,
            'latitude': grid_lat,
            'longitude': grid_lon,
            'vehicle_count': vehicle_count,
            'avg_speed': round(avg_speed_kmh, 2),
            'congestion_level': level,
            'color': CONGESTION_THRESHOLDS[level]['color'],
            'description': CONGESTION_THRESHOLDS[level]['description']
        })
    
    # Calculate overall congestion
    if segments_data:
        total_vehicles = sum(s['vehicle_count'] for s in segments_data)
        avg_vehicles_per_segment = total_vehicles / len(segments_data)
        overall_avg_speed = sum(s['avg_speed'] for s in segments_data) / len(segments_data)
        
        # Overall classification
        if avg_vehicles_per_segment < CONGESTION_THRESHOLDS['LOW']['max_vehicles'] and overall_avg_speed > CONGESTION_THRESHOLDS['LOW']['min_speed']:
            overall_level = 'LOW'
        elif avg_vehicles_per_segment < CONGESTION_THRESHOLDS['MEDIUM']['max_vehicles'] and overall_avg_speed > CONGESTION_THRESHOLDS['MEDIUM']['min_speed']:
            overall_level = 'MEDIUM'
        else:
            overall_level = 'HIGH'
        
        # Estimate travel time (very rough)
        from Devices.utils import haversine_distance
        distance_km = haversine_distance(start_lat, start_lon, end_lat, end_lon)
        estimated_time_minutes = (distance_km / max(overall_avg_speed, 1)) * 60
    else:
        overall_level = 'LOW'
        estimated_time_minutes = 0
    
    return success_response(data={
        'segments': segments_data,
        'overall_congestion': overall_level,
        'overall_color': CONGESTION_THRESHOLDS[overall_level]['color'],
        'overall_description': CONGESTION_THRESHOLDS[overall_level]['description'],
        'estimated_time_minutes': round(estimated_time_minutes, 1),
        'time_window_minutes': time_window,
        'total_segments': len(segments_data)
    })
