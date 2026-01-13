"""
OpenStreetMap Routing Utilities
Handles actual road-based routing using OSRM (Open Source Routing Machine)
"""

import requests
from typing import List, Tuple, Dict, Optional
from django.core.cache import cache


# OSRM Public Server (Free tier - for development only)
OSRM_SERVER = "http://router.project-osrm.org"


def get_route_from_osm(
    start_lat: float, 
    start_lon: float, 
    end_lat: float, 
    end_lon: float,
    profile: str = "driving"
) -> Optional[Dict]:
    """
    Get actual road route from OpenStreetMap using OSRM
    
    Args:
        start_lat: Starting latitude
        start_lon: Starting longitude
        end_lat: Ending latitude
        end_lon: Ending longitude
        profile: Routing profile (driving, walking, cycling)
    
    Returns:
        Dictionary with:
        - geometry: List of [lat, lon] waypoints along actual roads
        - distance: Total distance in meters
        - duration: Estimated duration in seconds
        - steps: Turn-by-turn instructions
    
    Academic Note: This demonstrates integration with external routing APIs
    to get actual road paths instead of straight-line "crow flies" distances.
    """
    
    # Check cache first
    cache_key = f"osm_route_{start_lat}_{start_lon}_{end_lat}_{end_lon}_{profile}"
    cached_route = cache.get(cache_key)
    if cached_route:
        return cached_route
    
    try:
        # OSRM API endpoint
        # Format: /route/v1/{profile}/{lon,lat;lon,lat}?overview=full&geometries=geojson
        url = f"{OSRM_SERVER}/route/v1/{profile}/{start_lon},{start_lat};{end_lon},{end_lat}"
        
        params = {
            'overview': 'full',  # Full route geometry
            'geometries': 'geojson',  # GeoJSON format (easier to parse)
            'steps': 'true',  # Include turn-by-turn steps
            'annotations': 'true'  # Include additional data
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('code') != 'Ok':
            return None
        
        # Extract route information
        route = data['routes'][0]
        geometry = route['geometry']['coordinates']  # List of [lon, lat]
        
        # Convert to [lat, lon] format (standard for most map libraries)
        waypoints = [[coord[1], coord[0]] for coord in geometry]
        
        result = {
            'waypoints': waypoints,  # Actual road path
            'distance': route['distance'],  # meters
            'duration': route['duration'],  # seconds
            'steps': route.get('legs', [{}])[0].get('steps', [])
        }
        
        # Cache for 1 hour (routes don't change often)
        cache.set(cache_key, result, 3600)
        
        return result
        
    except requests.RequestException as e:
        print(f"OSRM API Error: {e}")
        return None
    except Exception as e:
        print(f"Route calculation error: {e}")
        return None


def geocode_location(query: str, limit: int = 5) -> List[Dict]:
    """
    Search for locations using Nominatim (OpenStreetMap geocoding)
    
    Args:
        query: Search query (e.g., "India Gate, Delhi")
        limit: Maximum number of results
    
    Returns:
        List of locations with:
        - display_name: Full address
        - lat, lon: Coordinates
        - place_id: Unique identifier
        - type: Location type (city, landmark, etc.)
    
    Academic Note: Geocoding converts human-readable addresses to coordinates.
    """
    
    cache_key = f"geocode_{query}_{limit}"
    cached_results = cache.get(cache_key)
    if cached_results:
        return cached_results
    
    try:
        url = "https://nominatim.openstreetmap.org/search"
        
        params = {
            'q': query,
            'format': 'json',
            'limit': limit,
            'addressdetails': 1
        }
        
        headers = {
            'User-Agent': 'YatriConnect/1.0'  # Nominatim requires User-Agent
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        results = response.json()
        
        locations = []
        for result in results:
            locations.append({
                'display_name': result.get('display_name'),
                'lat': float(result.get('lat')),
                'lon': float(result.get('lon')),
                'place_id': result.get('place_id'),
                'type': result.get('type'),
                'importance': result.get('importance', 0)
            })
        
        # Cache for 24 hours (addresses don't change often)
        cache.set(cache_key, locations, 86400)
        
        return locations
        
    except requests.RequestException as e:
        print(f"Nominatim API Error: {e}")
        return []
    except Exception as e:
        print(f"Geocoding error: {e}")
        return []


def reverse_geocode(lat: float, lon: float) -> Optional[Dict]:
    """
    Get address from coordinates (reverse geocoding)
    
    Args:
        lat: Latitude
        lon: Longitude
    
    Returns:
        Address information
    """
    
    cache_key = f"reverse_geocode_{lat}_{lon}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        
        params = {
            'lat': lat,
            'lon': lon,
            'format': 'json',
            'addressdetails': 1
        }
        
        headers = {
            'User-Agent': 'YatriConnect/1.0'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        
        address_info = {
            'display_name': result.get('display_name'),
            'address': result.get('address', {}),
            'lat': float(result.get('lat')),
            'lon': float(result.get('lon'))
        }
        
        # Cache for 24 hours
        cache.set(cache_key, address_info, 86400)
        
        return address_info
        
    except Exception as e:
        print(f"Reverse geocoding error: {e}")
        return None


def snap_to_road(lat: float, lon: float, radius: int = 50) -> Optional[Tuple[float, float]]:
    """
    Snap GPS coordinates to nearest road
    
    Args:
        lat: Latitude
        lon: Longitude
        radius: Search radius in meters
    
    Returns:
        Snapped (lat, lon) coordinates on actual road
    
    Academic Note: GPS coordinates may not fall exactly on roads due to
    signal noise. Snapping ensures coordinates align with actual road network.
    """
    
    try:
        url = f"{OSRM_SERVER}/nearest/v1/driving/{lon},{lat}"
        
        params = {
            'number': 1  # Return 1 nearest point
        }
        
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('code') == 'Ok' and data.get('waypoints'):
            waypoint = data['waypoints'][0]
            location = waypoint['location']
            return (location[1], location[0])  # Return as (lat, lon)
        
        return None
        
    except Exception as e:
        print(f"Road snapping error: {e}")
        return None


def calculate_road_distance(coordinates: List[Tuple[float, float]]) -> float:
    """
    Calculate total road distance for a series of coordinates
    Uses OSRM matching to snap to roads and calculate actual distance
    
    Args:
        coordinates: List of (lat, lon) tuples
    
    Returns:
        Total distance in meters along roads
    """
    
    if len(coordinates) < 2:
        return 0.0
    
    try:
        # Build coordinates string for OSRM
        coords_str = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
        
        url = f"{OSRM_SERVER}/match/v1/driving/{coords_str}"
        
        params = {
            'overview': 'full',
            'geometries': 'geojson'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get('code') == 'Ok' and data.get('matchings'):
            return data['matchings'][0]['distance']
        
        return 0.0
        
    except Exception as e:
        print(f"Road distance calculation error: {e}")
        return 0.0
