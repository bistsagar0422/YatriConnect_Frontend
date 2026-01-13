"""
YatriConnect - Journey Module
Journey tracking, route management, public route detection
Function-based views with raw SQL examples
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.db.models import Q, Avg, Count, Max, Min
from django.core.cache import cache
from django.db import connection
from datetime import timedelta
import uuid

from Devices.models import Vehicle, Route
from Devices.utils import (
    success_response, error_response,
    apply_pagination, apply_date_filter,
    apply_vehicle_filter, apply_ordering,
    calculate_distance, is_location_near,
    police_or_admin
)
from Journey.models import Journey, Congestion
from Journey.serializers import (
    JourneySerializer, JourneyCreateSerializer, 
    JourneyListSerializer
)


# ============================================================
# JOURNEY MANAGEMENT
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_journey(request):
    """
    Start a New Journey
    
    POST /api/journey/start/
    
    Body:
    {
        "vehicle_id": "ABC123",
        "start_location": "Location Name",
        "start_latitude": 28.6139,
        "start_longitude": 77.2090
    }
    
    Flow:
    1. Validate vehicle ownership
    2. Create new journey record
    3. Return journey ID for tracking
    """
    # Get vehicle
    vehicle_id = request.data.get('vehicle_id')
    try:
        vehicle = Vehicle.objects.get(vehicle_id=vehicle_id)
    except Vehicle.DoesNotExist:
        return error_response(
            message="Vehicle not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Check access
    if not vehicle.can_be_viewed_by(request.user):
        return error_response(
            message="You don't have permission for this vehicle",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    # Create journey
    data = request.data.copy()
    data['journey_id'] = f"J{timezone.now().strftime('%Y%m%d%H%M%S')}_{vehicle_id}"
    data['vehicle'] = vehicle.id
    
    serializer = JourneyCreateSerializer(data=data)
    
    if serializer.is_valid():
        journey = serializer.save()
        return success_response(
            data=JourneySerializer(journey).data,
            message="Journey started",
            status_code=status.HTTP_201_CREATED
        )
    
    return error_response(
        message="Failed to start journey",
        errors=serializer.errors
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_journey(request, journey_id):
    """
    End a Journey
    
    POST /api/journey/<journey_id>/end/
    
    Body:
    {
        "end_location": "Destination Name",
        "end_latitude": 28.6200,
        "end_longitude": 77.2100,
        "distance": 5000,  // meters
        "max_speed": 20.5  // m/s
    }
    
    Flow:
    1. Find journey
    2. Update end details
    3. Mark as completed
    4. Check for public route detection
    """
    try:
        journey = Journey.objects.select_related('vehicle').get(journey_id=journey_id)
    except Journey.DoesNotExist:
        return error_response(
            message="Journey not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Check access
    if not journey.vehicle.can_be_viewed_by(request.user):
        return error_response(
            message="Access denied",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    # Update journey
    journey.end_location = request.data.get('end_location', '')
    journey.end_latitude = request.data.get('end_latitude')
    journey.end_longitude = request.data.get('end_longitude')
    journey.end_time = timezone.now()
    journey.distance = request.data.get('distance')
    journey.max_speed = request.data.get('max_speed')
    journey.complete_journey()
    
    # Detect public routes (for public vehicles only)
    if journey.vehicle.is_public():
        detect_public_route(journey)
    
    return success_response(
        data=JourneySerializer(journey).data,
        message="Journey completed"
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_journey_history(request):
    """
    Get Journey History
    
    GET /api/journey/history/
    
    Query params:
    - vehicle_id: filter by vehicle
    - status: ongoing/completed/cancelled
    - start_date: date filter
    - end_date: date filter
    - ordering: field to order by (start_time, distance, duration)
    
    Pagination: 20 per page
    
    Access Control: Based on vehicle ownership
    """
    # Base query
    journeys_qs = Journey.objects.select_related('vehicle', 'route')
    
    # Apply access control
    user = request.user
    if not (user.is_admin() or user.is_police()):
        # Filter vehicles user can access
        if user.role == 'normal_user':
            journeys_qs = journeys_qs.filter(vehicle__vehicle_type='public')
        elif user.is_vehicle_owner():
            journeys_qs = journeys_qs.filter(
                Q(vehicle__owner=user) | Q(vehicle__vehicle_type='public')
            )
    
    # Apply filters
    journeys_qs = apply_vehicle_filter(journeys_qs, request)
    journeys_qs = apply_date_filter(journeys_qs, 'start_time', request)
    
    status_filter = request.GET.get('status')
    if status_filter:
        journeys_qs = journeys_qs.filter(status=status_filter)
    
    # Apply ordering
    journeys_qs = apply_ordering(
        journeys_qs, 
        ['start_time', 'distance', 'duration', 'average_speed'],
        request
    )
    
    # Default ordering
    if not request.GET.get('ordering'):
        journeys_qs = journeys_qs.order_by('-start_time')
    
    # Apply pagination
    return apply_pagination(request, journeys_qs, JourneyListSerializer)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_journey_detail(request, journey_id):
    """
    Get Journey Detail
    
    GET /api/journey/<journey_id>/
    
    Includes: Full journey information
    """
    try:
        journey = Journey.objects.select_related(
            'vehicle', 'vehicle__owner', 'route'
        ).get(journey_id=journey_id)
    except Journey.DoesNotExist:
        return error_response(
            message="Journey not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Check access
    if not journey.vehicle.can_be_viewed_by(request.user):
        return error_response(
            message="Access denied",
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    serializer = JourneySerializer(journey)
    return success_response(data=serializer.data)


# ============================================================
# PUBLIC ROUTE DETECTION & MANAGEMENT
# ============================================================

def detect_public_route(journey):
    """
    Detect if journey belongs to a public route
    
    Logic:
    1. Find routes with similar start and end locations (within 50m)
    2. If found and trip_count >= 5, mark as public route
    3. Otherwise, create new route or increment trip count
    
    This is a helper function called after journey completion
    """
    from django.conf import settings
    
    threshold = settings.PUBLIC_ROUTE_CONFIG['location_threshold']
    min_trips = settings.PUBLIC_ROUTE_CONFIG['min_trip_count']
    
    # Find existing routes with similar endpoints
    potential_routes = Route.objects.all()
    
    for route in potential_routes:
        start_match = is_location_near(
            journey.start_latitude, journey.start_longitude,
            route.start_latitude, route.start_longitude,
            threshold
        )
        
        end_match = is_location_near(
            journey.end_latitude, journey.end_longitude,
            route.end_latitude, route.end_longitude,
            threshold
        )
        
        if start_match and end_match:
            # Found matching route
            route.trip_count += 1
            
            # Update average speed and duration
            if journey.average_speed:
                if route.average_speed:
                    route.average_speed = (route.average_speed + journey.average_speed) / 2
                else:
                    route.average_speed = journey.average_speed
            
            if journey.duration:
                if route.average_duration:
                    route.average_duration = (route.average_duration + journey.duration) / 2
                else:
                    route.average_duration = journey.duration
            
            # Mark as public if threshold reached
            if route.trip_count >= min_trips:
                route.is_public = True
            
            route.save()
            
            # Link journey to route
            journey.route = route
            journey.save()
            
            return
    
    # No matching route found - create new one
    route_id = f"R{timezone.now().strftime('%Y%m%d')}_{journey.vehicle.vehicle_id}"
    
    Route.objects.create(
        route_id=route_id,
        name=f"{journey.start_location} to {journey.end_location}",
        start_location=journey.start_location,
        start_latitude=journey.start_latitude,
        start_longitude=journey.start_longitude,
        end_location=journey.end_location,
        end_latitude=journey.end_latitude,
        end_longitude=journey.end_longitude,
        trip_count=1,
        average_speed=journey.average_speed,
        average_duration=journey.duration,
        is_public=False
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_public_routes(request):
    """
    Get All Public Routes
    
    GET /api/journey/public-routes/
    
    Query params:
    - search: search by location name
    - ordering: order by average_speed, trip_count
    
    Returns: Routes marked as public
    Caching: 5 minutes
    """
    from django.conf import settings
    from Devices.serializers import PublicRouteSerializer
    from Devices.utils import apply_search
    
    # Check cache
    cache_key = "public_routes"
    cached_data = cache.get(cache_key)
    if cached_data:
        return success_response(data=cached_data)
    
    # Query public routes
    routes_qs = Route.objects.filter(is_public=True)
    
    # Apply search
    routes_qs = apply_search(routes_qs, ['name', 'start_location', 'end_location'], request)
    
    # Apply ordering
    routes_qs = apply_ordering(
        routes_qs,
        ['trip_count', 'average_speed', 'average_duration'],
        request
    )
    
    # Default ordering
    if not request.GET.get('ordering'):
        routes_qs = routes_qs.order_by('-trip_count')
    
    serializer = PublicRouteSerializer(routes_qs, many=True)
    
    # Cache for 5 minutes
    cache.set(cache_key, serializer.data, settings.CACHE_TTL['public_routes'])
    
    return success_response(data=serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@police_or_admin
def get_all_routes(request):
    """
    Get All Routes (Public and Private)
    
    GET /api/journey/routes/
    
    Access: Police and Admin only
    
    Query params:
    - is_public: true/false
    - search: search by location
    """
    from Devices.serializers import RouteSerializer
    from Devices.utils import apply_search
    
    routes_qs = Route.objects.all()
    
    # Filter by public/private
    is_public = request.GET.get('is_public')
    if is_public is not None:
        routes_qs = routes_qs.filter(is_public=is_public.lower() == 'true')
    
    # Apply search
    routes_qs = apply_search(routes_qs, ['name', 'start_location', 'end_location'], request)
    
    serializer = RouteSerializer(routes_qs, many=True)
    return success_response(data=serializer.data)


# ============================================================
# RAW SQL ANALYTICS - For Learning & Performance
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@police_or_admin
def get_route_analytics_raw_sql(request):
    """
    Route Analytics using RAW SQL
    
    GET /api/journey/analytics/routes-sql/
    
    Demonstrates:
    - Raw SQL usage in Django
    - Aggregation queries
    - Performance optimization
    
    Returns: Route statistics with vehicle counts and speeds
    """
    # Raw SQL query for route analytics
    # This demonstrates how to use raw SQL for complex aggregations
    
    sql_query = """
    SELECT 
        r.route_id,
        r.name,
        r.start_location,
        r.end_location,
        r.is_public,
        r.trip_count,
        r.average_speed,
        r.average_duration,
        COUNT(j.id) as journey_count,
        AVG(j.average_speed) as calculated_avg_speed,
        MAX(j.max_speed) as max_speed_recorded,
        SUM(j.distance) as total_distance
    FROM routes r
    LEFT JOIN journeys j ON j.route_id = r.id
    WHERE r.is_public = true
    GROUP BY r.id, r.route_id, r.name, r.start_location, r.end_location, 
             r.is_public, r.trip_count, r.average_speed, r.average_duration
    ORDER BY journey_count DESC
    LIMIT 50
    """
    
    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        columns = [col[0] for col in cursor.description]
        results = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
    
    return success_response(
        data=results,
        message="Route analytics (raw SQL)"
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@police_or_admin
def get_congestion_heatmap_raw_sql(request):
    """
    Congestion Heat Map Data using RAW SQL
    
    GET /api/journey/analytics/heatmap-sql/
    
    Demonstrates:
    - Geospatial grouping with SQL
    - Time-based aggregation
    - Heat map data preparation
    
    Returns: Grid-based congestion data for mapping
    """
    # Get time range (default: last 24 hours)
    hours = int(request.GET.get('hours', 24))
    
    # Raw SQL for congestion heat map
    # Groups locations into grid cells and calculates average congestion
    
    sql_query = """
    WITH recent_congestion AS (
        SELECT 
            ROUND(latitude::numeric, 2) as lat_grid,
            ROUND(longitude::numeric, 2) as lon_grid,
            congestion_level,
            average_speed,
            vehicle_count,
            timestamp
        FROM congestion
        WHERE timestamp >= NOW() - INTERVAL '%s hours'
    )
    SELECT 
        lat_grid as latitude,
        lon_grid as longitude,
        COUNT(*) as data_points,
        AVG(average_speed) as avg_speed,
        SUM(vehicle_count) as total_vehicles,
        MODE() WITHIN GROUP (ORDER BY congestion_level) as dominant_congestion_level,
        MAX(timestamp) as last_updated
    FROM recent_congestion
    GROUP BY lat_grid, lon_grid
    HAVING COUNT(*) >= 3
    ORDER BY total_vehicles DESC
    LIMIT 200
    """
    
    with connection.cursor() as cursor:
        cursor.execute(sql_query, [hours])
        columns = [col[0] for col in cursor.description]
        results = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
    
    return success_response(
        data=results,
        message=f"Congestion heatmap (last {hours} hours)"
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@police_or_admin
def get_vehicle_density_raw_sql(request):
    """
    Vehicle Density per Route using RAW SQL
    
    GET /api/journey/analytics/density-sql/
    
    Demonstrates:
    - Complex JOIN operations
    - Window functions
    - Density calculations
    
    Returns: Vehicle density statistics per route
    """
    sql_query = """
    WITH route_activity AS (
        SELECT 
            r.route_id,
            r.name,
            j.vehicle_id,
            j.start_time,
            j.end_time,
            j.duration
        FROM routes r
        INNER JOIN journeys j ON j.route_id = r.id
        WHERE j.start_time >= NOW() - INTERVAL '7 days'
            AND j.status = 'completed'
    ),
    hourly_density AS (
        SELECT 
            route_id,
            name,
            DATE_TRUNC('hour', start_time) as hour_bucket,
            COUNT(DISTINCT vehicle_id) as unique_vehicles,
            COUNT(*) as trip_count
        FROM route_activity
        GROUP BY route_id, name, DATE_TRUNC('hour', start_time)
    )
    SELECT 
        route_id,
        name,
        AVG(unique_vehicles) as avg_vehicles_per_hour,
        MAX(unique_vehicles) as peak_vehicles,
        AVG(trip_count) as avg_trips_per_hour,
        COUNT(*) as hours_active
    FROM hourly_density
    GROUP BY route_id, name
    ORDER BY avg_vehicles_per_hour DESC
    LIMIT 30
    """
    
    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        columns = [col[0] for col in cursor.description]
        results = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
    
    return success_response(
        data=results,
        message="Vehicle density analysis (last 7 days)"
    )
