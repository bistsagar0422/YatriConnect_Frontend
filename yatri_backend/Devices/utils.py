"""
YatriConnect - Authentication & Helper Utilities
Role-based access control and common helper functions
"""

from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from Devices.models import User, Vehicle


# ============================================================
# ROLE-BASED ACCESS DECORATORS
# ============================================================

def role_required(allowed_roles):
    """
    Decorator to check if user has required role
    Usage: @role_required(['admin', 'police'])
    
    Flow: Extract user from request -> Check if authenticated -> Check role
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Check if user is authenticated
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check if user has required role
            user_role = request.user.role
            if user_role not in allowed_roles and not request.user.is_superuser:
                return Response(
                    {'error': f'Access denied. Required roles: {allowed_roles}'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def admin_only(view_func):
    """
    Decorator for admin-only views
    Usage: @admin_only
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not request.user.is_admin():
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return view_func(request, *args, **kwargs)
    return wrapper


def police_or_admin(view_func):
    """
    Decorator for police or admin access
    Usage: @police_or_admin
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not (request.user.is_admin() or request.user.is_police()):
            return Response(
                {'error': 'Police or Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return view_func(request, *args, **kwargs)
    return wrapper


# ============================================================
# VEHICLE ACCESS CONTROL
# ============================================================

def check_vehicle_access(user, vehicle):
    """
    Check if user can access vehicle data
    
    Rules:
    - Admin/Police: Full access
    - Normal User: Only public vehicles
    - Vehicle Owner: Own vehicles only
    
    Returns: (has_access: bool, reason: str)
    """
    # Admin and police have full access
    if user.is_admin() or user.is_police():
        return True, "Admin/Police access"
    
    # Public vehicles are accessible to everyone
    if vehicle.is_public():
        return True, "Public vehicle"
    
    # Vehicle owners can access their own vehicles
    if vehicle.owner == user:
        return True, "Vehicle owner"
    
    return False, "Access denied"


def filter_vehicles_by_access(user, queryset):
    """
    Filter vehicle queryset based on user access
    
    Usage in views:
    vehicles = Vehicle.objects.all()
    accessible_vehicles = filter_vehicles_by_access(request.user, vehicles)
    """
    # Admin and police see all vehicles
    if user.is_admin() or user.is_police():
        return queryset
    
    # Normal users see only public vehicles
    if user.role == User.Role.NORMAL_USER:
        return queryset.filter(vehicle_type=Vehicle.VehicleType.PUBLIC)
    
    # Vehicle owners see their own vehicles + public
    if user.is_vehicle_owner():
        from django.db.models import Q
        return queryset.filter(
            Q(owner=user) | Q(vehicle_type=Vehicle.VehicleType.PUBLIC)
        )
    
    # Default: only public
    return queryset.filter(vehicle_type=Vehicle.VehicleType.PUBLIC)


# ============================================================
# PAGINATION HELPER
# ============================================================

class StandardPagination(PageNumberPagination):
    """
    Standard pagination for all list APIs
    Page size: 20 (configurable via ?page_size=)
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


def apply_pagination(request, queryset, serializer_class):
    """
    Apply pagination to queryset and return paginated response
    
    Usage in views:
    return apply_pagination(request, queryset, MySerializer)
    """
    paginator = StandardPagination()
    paginated_queryset = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(paginated_queryset, many=True)
    return paginator.get_paginated_response(serializer.data)


# ============================================================
# FILTERING HELPERS
# ============================================================

def apply_date_filter(queryset, field_name, request):
    """
    Apply date range filtering
    
    Query params: ?start_date=2024-01-01&end_date=2024-01-31
    
    Usage:
    queryset = apply_date_filter(queryset, 'timestamp', request)
    """
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if start_date:
        queryset = queryset.filter(**{f'{field_name}__gte': start_date})
    
    if end_date:
        queryset = queryset.filter(**{f'{field_name}__lte': end_date})
    
    return queryset


def apply_vehicle_filter(queryset, request):
    """
    Filter by vehicle_id
    Query param: ?vehicle_id=ABC123
    """
    vehicle_id = request.GET.get('vehicle_id')
    if vehicle_id:
        queryset = queryset.filter(vehicle__vehicle_id=vehicle_id)
    return queryset


def apply_search(queryset, search_fields, request):
    """
    Apply keyword search across multiple fields
    
    Query param: ?search=keyword
    
    Usage:
    queryset = apply_search(queryset, ['name', 'location'], request)
    """
    from django.db.models import Q
    
    search_term = request.GET.get('search', '').strip()
    if not search_term:
        return queryset
    
    # Build Q objects for OR search
    q_objects = Q()
    for field in search_fields:
        q_objects |= Q(**{f'{field}__icontains': search_term})
    
    return queryset.filter(q_objects)


def apply_ordering(queryset, allowed_fields, request):
    """
    Apply ordering to queryset
    
    Query param: ?ordering=field_name or ?ordering=-field_name
    
    Usage:
    queryset = apply_ordering(queryset, ['created_at', 'speed'], request)
    """
    ordering = request.GET.get('ordering', '').strip()
    if not ordering:
        return queryset
    
    # Remove leading '-' for validation
    field = ordering.lstrip('-')
    
    if field in allowed_fields:
        return queryset.order_by(ordering)
    
    return queryset


# ============================================================
# LOCATION HELPERS
# ============================================================

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two GPS coordinates using Haversine formula
    Returns distance in meters
    
    Used for: Route detection, proximity checks
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371000  # Earth radius in meters
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c


def is_location_near(lat1, lon1, lat2, lon2, threshold_meters=50):
    """
    Check if two locations are within threshold distance
    Used for: Public route detection
    """
    distance = calculate_distance(lat1, lon1, lat2, lon2)
    return distance <= threshold_meters


# ============================================================
# RESPONSE HELPERS
# ============================================================

def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """Standard success response format"""
    response = {
        'success': True,
        'message': message,
    }
    if data is not None:
        response['data'] = data
    return Response(response, status=status_code)


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Standard error response format"""
    response = {
        'success': False,
        'error': message,
    }
    if errors:
        response['details'] = errors
    return Response(response, status=status_code)
