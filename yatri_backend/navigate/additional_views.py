"""
YatriConnect - Additional Feature APIs
Route Search, Heat Map, Safe Distance, Quick Insights
"""

from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from typing import List, Dict

from Devices.models import User, Vehicle, Route
from Journey.models import Journey, RoadSegment
from sensorData.models import Telemetry
from Devices.utils import success_response, error_response, apply_date_filter
from navigate.osm_routing import get_route_from_osm, geocode_location


# ============================================================
# DESTINATION ROUTE SEARCH API
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_destination_route(request):
    """
    Destination Route Search with Congestion-Aware Ranking
    
    GET /api/route/search/
    
    Query params:
    - start_lat: Starting latitude (required)
    - start_lon: Starting longitude (required)
    - destination: Destination keyword (required)
    - limit: Number of results (default: 5)
    
    Returns:
    - List of routes with:
      - Actual road path (from OpenStreetMap)
      - Congestion level (LOW/MEDIUM/HIGH)
      - Average speed per segment
      - Vehicle count per segment
      - Estimated travel time
    
    Logic:
    1. Geocode destination keyword to get coordinates
    2. Get actual road route from OpenStreetMap (OSRM)
    3. Divide route into road segments
    4. Calculate congestion for each segment
    5. Rank routes by total congestion + travel time
    6. Return top routes
    
    Access Control:
    - Normal users: Only public routes
    - Vehicle owners: Own routes + public routes
    - Admin/Police: All routes
    
    Academic Note: This demonstrates integration of external APIs (OSM)
    with internal data (telemetry) to provide intelligent route suggestions.
    """
    
    # Parse input
    try:
        start_lat = float(request.GET.get('start_lat'))
        start_lon = float(request.GET.get('start_lon'))
    except (TypeError, ValueError):
        return error_response(
            message="Invalid coordinates. Required: start_lat, start_lon",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    destination = request.GET.get('destination')
    if not destination:
        return error_response(
            message="Destination keyword is required",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    limit = int(request.GET.get('limit', 5))
    
    # Check cache
    cache_key = f"route_search_{start_lat}_{start_lon}_{destination}_{request.user.id}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return success_response(data=cached_result)
    
    # Step 1: Geocode destination
    destinations = geocode_location(destination, limit=limit)
    
    if not destinations:
        return error_response(
            message=f"No locations found for '{destination}'",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Step 2: Get routes for each destination
    routes_data = []
    
    for dest in destinations:
        end_lat = dest['lat']
        end_lon = dest['lon']
        
        # Get actual road route from OpenStreetMap
        osm_route = get_route_from_osm(start_lat, start_lon, end_lat, end_lon)
        
        if not osm_route:
            continue
        
        # Step 3: Analyze congestion along route
        waypoints = osm_route['waypoints']
        total_distance = osm_route['distance']
        base_duration = osm_route['duration']
        
        # Divide into segments (every ~500 meters)
        segment_size = 10  # Process every 10th waypoint
        segments_analysis = []
        total_congestion_score = 0
        
        for i in range(0, len(waypoints), segment_size):
            segment_waypoints = waypoints[i:i+segment_size]
            if len(segment_waypoints) < 2:
                continue
            
            # Get center of segment
            center_lat = sum(wp[0] for wp in segment_waypoints) / len(segment_waypoints)
            center_lon = sum(wp[1] for wp in segment_waypoints) / len(segment_waypoints)
            
            # Check congestion in this area
            # Query recent telemetry (last 10 minutes)
            cutoff_time = timezone.now() - timedelta(minutes=10)
            
            # Find telemetry within 0.01 degrees (~1.1 km) of segment center
            nearby_telemetry = Telemetry.objects.filter(
                timestamp__gte=cutoff_time,
                latitude__gte=center_lat - 0.01,
                latitude__lte=center_lat + 0.01,
                longitude__gte=center_lon - 0.01,
                longitude__lte=center_lon + 0.01
            ).select_related('device__vehicle')
            
            # Calculate metrics
            vehicle_count = nearby_telemetry.values('device__vehicle').distinct().count()
            speeds = nearby_telemetry.filter(speed__isnull=False).values_list('speed', flat=True)
            avg_speed_mps = sum(speeds) / len(speeds) if speeds else 20  # Default 20 m/s
            avg_speed_kmh = avg_speed_mps * 3.6
            
            # Classify congestion
            if vehicle_count < 10 and avg_speed_kmh > 25:
                congestion_level = 'LOW'
                congestion_score = 1
            elif vehicle_count < 20 and avg_speed_kmh > 15:
                congestion_level = 'MEDIUM'
                congestion_score = 2
            else:
                congestion_level = 'HIGH'
                congestion_score = 3
            
            total_congestion_score += congestion_score
            
            segments_analysis.append({
                'center_lat': center_lat,
                'center_lon': center_lon,
                'vehicle_count': vehicle_count,
                'avg_speed_kmh': round(avg_speed_kmh, 1),
                'congestion_level': congestion_level
            })
        
        # Calculate adjusted travel time based on congestion
        congestion_multiplier = 1 + (total_congestion_score * 0.15)  # 15% delay per congestion point
        adjusted_duration = base_duration * congestion_multiplier
        
        # Overall congestion
        avg_congestion_score = total_congestion_score / max(len(segments_analysis), 1)
        if avg_congestion_score < 1.5:
            overall_congestion = 'LOW'
        elif avg_congestion_score < 2.5:
            overall_congestion = 'MEDIUM'
        else:
            overall_congestion = 'HIGH'
        
        routes_data.append({
            'destination': dest['display_name'],
            'destination_lat': end_lat,
            'destination_lon': end_lon,
            'waypoints': waypoints,  # Actual road path
            'distance_meters': total_distance,
            'distance_km': round(total_distance / 1000, 2),
            'base_duration_seconds': base_duration,
            'base_duration_minutes': round(base_duration / 60, 1),
            'adjusted_duration_seconds': round(adjusted_duration),
            'adjusted_duration_minutes': round(adjusted_duration / 60, 1),
            'overall_congestion': overall_congestion,
            'congestion_score': round(total_congestion_score, 2),
            'segments': segments_analysis[:10]  # Return first 10 segments
        })
    
    # Step 4: Rank routes by congestion + time
    # Lower score is better
    for route in routes_data:
        route['ranking_score'] = (
            route['adjusted_duration_seconds'] / 60 +  # Duration in minutes
            route['congestion_score'] * 5  # Congestion penalty
        )
    
    routes_data.sort(key=lambda x: x['ranking_score'])
    
    # Cache for 5 minutes
    cache.set(cache_key, routes_data, 300)
    
    return success_response(data={
        'routes': routes_data,
        'total_found': len(routes_data)
    })


# ============================================================
# HEAT MAP COMPUTATION API
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compute_heatmap(request):
    """
    Road Usage Heat Map - Color-coded by frequency
    
    GET /api/heatmap/
    
    Query params:
    - vehicle_id: Filter by vehicle (optional)
    - user_id: Filter by user (optional)
    - start_date: YYYY-MM-DD (optional)
    - end_date: YYYY-MM-DD (optional)
    - grid_size: Grid resolution (default: 0.01 degrees ~1.1km)
    
    Returns:
    - Road segments with color codes:
      - RED: Most used (>= 20 passes)
      - ORANGE: Frequently used (10-19 passes)
      - BLUE: Medium used (5-9 passes)
      - GREEN: Rarely used (< 5 passes)
    
    Logic:
    1. Fetch telemetry data for user/vehicle/date range
    2. Divide into grid segments
    3. Count passes per segment
    4. Determine thresholds (most/medium/rare)
    5. Assign colors
    
    Access Control:
    - Normal users: Only public routes
    - Vehicle owners: Own vehicles only
    - Admin/Police: All vehicles
    
    Academic Note: Heat maps visualize spatial patterns by aggregating
    point data into grid cells and applying color gradients.
    """
    
    user = request.user
    
    # Parse filters
    vehicle_id = request.GET.get('vehicle_id')
    user_id = request.GET.get('user_id')
    grid_size = float(request.GET.get('grid_size', 0.01))
    
    # Build query
    telemetry_qs = Telemetry.objects.all()
    
    # Apply date filter
    telemetry_qs = apply_date_filter(telemetry_qs, 'timestamp', request)
    
    # Apply access control
    if user.role == 'normal_user':
        # Normal users: only public vehicle routes
        telemetry_qs = telemetry_qs.filter(device__vehicle__vehicle_type='public')
    elif user.is_vehicle_owner() and not (user.is_admin() or user.is_police()):
        # Vehicle owners: own vehicles only
        if vehicle_id:
            telemetry_qs = telemetry_qs.filter(
                device__vehicle__vehicle_id=vehicle_id,
                device__vehicle__owner=user
            )
        else:
            telemetry_qs = telemetry_qs.filter(device__vehicle__owner=user)
    else:
        # Admin/Police: can filter by vehicle_id or user_id
        if vehicle_id:
            telemetry_qs = telemetry_qs.filter(device__vehicle__vehicle_id=vehicle_id)
        if user_id:
            telemetry_qs = telemetry_qs.filter(device__vehicle__owner_id=user_id)
    
    # Fetch telemetry
    telemetry_data = telemetry_qs.values('latitude', 'longitude')
    
    if not telemetry_data.exists():
        return error_response(
            message="No telemetry data found for specified filters",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Grid segmentation
    # Group coordinates into grid cells
    segment_counts = {}
    
    for point in telemetry_data:
        lat = point['latitude']
        lon = point['longitude']
        
        # Round to grid
        grid_lat = round(lat / grid_size) * grid_size
        grid_lon = round(lon / grid_size) * grid_size
        
        segment_id = f"{grid_lat:.4f}_{grid_lon:.4f}"
        
        if segment_id in segment_counts:
            segment_counts[segment_id]['count'] += 1
        else:
            segment_counts[segment_id] = {
                'lat': grid_lat,
                'lon': grid_lon,
                'count': 1
            }
    
    # Determine thresholds
    counts = [seg['count'] for seg in segment_counts.values()]
    max_count = max(counts) if counts else 1
    
    # Color coding
    segments_colored = []
    
    for segment_id, data in segment_counts.items():
        count = data['count']
        
        # Determine color based on frequency
        if count >= 20:
            color = '#FF0000'  # RED - Most used
            usage = 'MOST_USED'
        elif count >= 10:
            color = '#FFA500'  # ORANGE - Frequently used
            usage = 'FREQUENTLY_USED'
        elif count >= 5:
            color = '#0000FF'  # BLUE - Medium used
            usage = 'MEDIUM_USED'
        else:
            color = '#00FF00'  # GREEN - Rarely used
            usage = 'RARELY_USED'
        
        segments_colored.append({
            'segment_id': segment_id,
            'lat': data['lat'],
            'lon': data['lon'],
            'pass_count': count,
            'color': color,
            'usage_level': usage
        })
    
    # Sort by count (descending)
    segments_colored.sort(key=lambda x: x['pass_count'], reverse=True)
    
    return success_response(data={
        'segments': segments_colored,
        'total_segments': len(segments_colored),
        'total_points': len(telemetry_data),
        'max_passes': max_count,
        'legend': {
            'RED': 'Most used (>= 20 passes)',
            'ORANGE': 'Frequently used (10-19 passes)',
            'BLUE': 'Medium used (5-9 passes)',
            'GREEN': 'Rarely used (< 5 passes)'
        }
    })


# ============================================================
# PROFILE PICTURE API
# ============================================================

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_picture(request):
    """
    User Profile Picture Upload/Retrieve
    
    GET /api/profile/picture/ - Get current profile picture
    PUT/PATCH /api/profile/picture/ - Upload new profile picture
    
    Body (for PUT/PATCH):
    {
        "profile_picture": <file>
    }
    
    Access Control: Users can only modify their own profile
    
    Academic Note: File uploads in REST APIs use multipart/form-data
    encoding. Django's ImageField handles file storage and validation.
    """
    
    user = request.user
    
    if request.method == 'GET':
        # Return current profile picture
        from Devices.serializers import UserSerializer
        serializer = UserSerializer(user, context={'request': request})
        return success_response(data=serializer.data)
    
    else:  # PUT or PATCH
        # Upload new profile picture
        from Devices.serializers import UserProfileUpdateSerializer
        
        serializer = UserProfileUpdateSerializer(
            user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Return updated user data
            user.refresh_from_db()
            response_serializer = UserSerializer(user, context={'request': request})
            
            return success_response(
                data=response_serializer.data,
                message="Profile picture updated successfully"
            )
        
        return error_response(
            message="Invalid data",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# SAFE DISTANCE AGGREGATION API
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def safe_distance_aggregation(request):
    """
    Daily and Weekly Safe Distance Traveled
    
    GET /api/distance/safe/
    
    Query params:
    - vehicle_id: Filter by vehicle (required for normal users)
    - start_date: YYYY-MM-DD (default: 7 days ago)
    - end_date: YYYY-MM-DD (default: today)
    
    Returns:
    - Daily safe distance (no harsh events)
    - Weekly total
    - Daily breakdown array
    
    Logic:
    1. Fetch journey data for date range
    2. Filter out journeys with harsh events (crashes, harsh braking)
    3. Sum distance per day
    4. Calculate weekly total
    
    Harsh events definition:
    - Crash detected
    - Sudden acceleration/braking (accel > 5 m/s²)
    - Overspeed (speed > route speed limit)
    - Sharp turns (heading change > 45° in 1 sec)
    
    Access Control:
    - Vehicle owners: Own vehicles only
    - Admin/Police: All vehicles
    
    Academic Note: Demonstrates aggregation with conditional filtering
    to calculate safety metrics.
    """
    
    user = request.user
    vehicle_id = request.GET.get('vehicle_id')
    
    # Access control
    if not vehicle_id:
        if user.is_vehicle_owner() and not (user.is_admin() or user.is_police()):
            # Vehicle owners must specify vehicle
            return error_response(
                message="vehicle_id is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    # Parse date range
    end_date = request.GET.get('end_date')
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    else:
        end_date = timezone.now().date()
    
    start_date = request.GET.get('start_date')
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    else:
        start_date = end_date - timedelta(days=7)
    
    # Build query
    journeys_qs = Journey.objects.filter(
        status='completed',
        start_time__date__gte=start_date,
        start_time__date__lte=end_date
    )
    
    # Apply vehicle filter
    if vehicle_id:
        vehicle = Vehicle.objects.filter(vehicle_id=vehicle_id).first()
        if not vehicle:
            return error_response(
                message=f"Vehicle {vehicle_id} not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check access
        if user.is_vehicle_owner() and not (user.is_admin() or user.is_police()):
            if vehicle.owner != user:
                return error_response(
                    message="You don't have access to this vehicle",
                    status_code=status.HTTP_403_FORBIDDEN
                )
        
        journeys_qs = journeys_qs.filter(vehicle=vehicle)
    else:
        # Admin/Police viewing all vehicles
        pass
    
    # Identify harsh events
    # Get crash events for these journeys
    from Journey.models import CrashEvent
    journeys_with_crashes = CrashEvent.objects.filter(
        vehicle__journeys__in=journeys_qs
    ).values_list('journey_id', flat=True)
    
    # Get telemetry with harsh braking/acceleration
    harsh_telemetry = Telemetry.objects.filter(
        device__vehicle__journeys__in=journeys_qs,
        timestamp__date__gte=start_date,
        timestamp__date__lte=end_date
    ).filter(
        Q(accel_x__gt=5) | Q(accel_x__lt=-5) |
        Q(accel_y__gt=5) | Q(accel_y__lt=-5)
    ).values('device__vehicle__journeys__id').distinct()
    
    harsh_journey_ids = set(journeys_with_crashes) | set(
        [t['device__vehicle__journeys__id'] for t in harsh_telemetry if t['device__vehicle__journeys__id']]
    )
    
    # Safe journeys = all journeys - harsh journeys
    safe_journeys = journeys_qs.exclude(id__in=harsh_journey_ids)
    
    # Aggregate by day
    from django.db.models.functions import TruncDate
    
    daily_data = safe_journeys.annotate(
        date=TruncDate('start_time')
    ).values('date').annotate(
        total_distance=Sum('distance'),
        trip_count=Count('id')
    ).order_by('date')
    
    # Format response
    daily_breakdown = []
    total_safe_distance = 0
    
    for entry in daily_data:
        distance_km = (entry['total_distance'] or 0) / 1000
        total_safe_distance += distance_km
        
        daily_breakdown.append({
            'date': entry['date'].strftime('%Y-%m-%d'),
            'safe_distance_km': round(distance_km, 2),
            'trip_count': entry['trip_count']
        })
    
    # Calculate weekly total
    days_in_range = (end_date - start_date).days + 1
    weeks = days_in_range / 7
    
    return success_response(data={
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': end_date.strftime('%Y-%m-%d'),
        'daily_breakdown': daily_breakdown,
        'total_safe_distance_km': round(total_safe_distance, 2),
        'weekly_average_km': round(total_safe_distance / max(weeks, 1), 2),
        'total_safe_trips': sum(d['trip_count'] for d in daily_breakdown),
        'vehicle_id': vehicle_id
    })


# ============================================================
# QUICK INSIGHTS API
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quick_insights(request):
    """
    Quick Insights Dashboard
    
    GET /api/insights/quick/
    
    Query params:
    - vehicle_id: Filter by vehicle (required for normal users)
    - start_date: YYYY-MM-DD (default: 30 days ago)
    - end_date: YYYY-MM-DD (default: today)
    
    Returns:
    - Safe driver streak (consecutive days with zero harsh events)
    - Average speed over trips
    - Total trips in date range
    - Total distance traveled
    - Top routes used
    
    Logic:
    - Streak: Count consecutive days with no harsh events
    - Avg speed: sum(distance) / sum(duration)
    - Total trips: count of journeys
    
    Access Control:
    - Vehicle owners: Own vehicles only
    - Admin/Police: All vehicles
    
    Academic Note: Dashboards aggregate multiple metrics into
    a single API response for efficient frontend rendering.
    """
    
    user = request.user
    vehicle_id = request.GET.get('vehicle_id')
    
    # Access control
    if not vehicle_id:
        if user.is_vehicle_owner() and not (user.is_admin() or user.is_police()):
            return error_response(
                message="vehicle_id is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    # Parse date range
    end_date = request.GET.get('end_date')
    if end_date:
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    else:
        end_date = timezone.now().date()
    
    start_date = request.GET.get('start_date')
    if start_date:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    else:
        start_date = end_date - timedelta(days=30)
    
    # Get vehicle
    if vehicle_id:
        vehicle = Vehicle.objects.filter(vehicle_id=vehicle_id).first()
        if not vehicle:
            return error_response(
                message=f"Vehicle {vehicle_id} not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check access
        if user.is_vehicle_owner() and not (user.is_admin() or user.is_police()):
            if vehicle.owner != user:
                return error_response(
                    message="You don't have access to this vehicle",
                    status_code=status.HTTP_403_FORBIDDEN
                )
    else:
        vehicle = None
    
    # Build queries
    journeys_qs = Journey.objects.filter(
        status='completed',
        start_time__date__gte=start_date,
        start_time__date__lte=end_date
    )
    
    if vehicle:
        journeys_qs = journeys_qs.filter(vehicle=vehicle)
    
    # Total trips and distance
    trip_stats = journeys_qs.aggregate(
        total_trips=Count('id'),
        total_distance=Sum('distance'),
        total_duration=Sum('duration'),
        avg_speed=Avg('average_speed'),
        max_speed_overall=Avg('max_speed')
    )
    
    total_trips = trip_stats['total_trips'] or 0
    total_distance_km = (trip_stats['total_distance'] or 0) / 1000
    total_duration_hours = (trip_stats['total_duration'] or 0) / 3600
    
    # Calculate average speed
    if total_duration_hours > 0:
        avg_speed_kmh = total_distance_km / total_duration_hours
    else:
        avg_speed_kmh = 0
    
    # Safe driver streak
    # Get crash events
    from Journey.models import CrashEvent
    crash_dates = CrashEvent.objects.filter(
        vehicle=vehicle,
        timestamp__date__gte=start_date,
        timestamp__date__lte=end_date
    ).values_list('timestamp__date', flat=True).distinct()
    
    # Get harsh braking dates
    harsh_dates = Telemetry.objects.filter(
        device__vehicle=vehicle,
        timestamp__date__gte=start_date,
        timestamp__date__lte=end_date
    ).filter(
        Q(accel_x__gt=5) | Q(accel_x__lt=-5) |
        Q(accel_y__gt=5) | Q(accel_y__lt=-5)
    ).values_list('timestamp__date', flat=True).distinct()
    
    unsafe_dates = set(crash_dates) | set(harsh_dates)
    
    # Calculate streak from end_date backwards
    current_streak = 0
    check_date = end_date
    
    while check_date >= start_date:
        if check_date not in unsafe_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    # Top routes
    top_routes = journeys_qs.filter(
        route__isnull=False
    ).values(
        'route__name', 'route__id'
    ).annotate(
        trip_count=Count('id')
    ).order_by('-trip_count')[:5]
    
    return success_response(data={
        'vehicle_id': vehicle_id,
        'date_range': {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'days': (end_date - start_date).days + 1
        },
        'safe_driver_streak_days': current_streak,
        'total_trips': total_trips,
        'total_distance_km': round(total_distance_km, 2),
        'average_speed_kmh': round(avg_speed_kmh, 1),
        'max_speed_kmh': round((trip_stats['max_speed_overall'] or 0) * 3.6, 1),
        'total_duration_hours': round(total_duration_hours, 1),
        'top_routes': [
            {
                'route_name': route['route__name'],
                'trip_count': route['trip_count']
            }
            for route in top_routes
        ]
    })
