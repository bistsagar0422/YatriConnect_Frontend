"""
YatriConnect - Navigate Module URLs
Live navigation, congestion, crash detection, theft detection, route search, heat maps
"""

from django.urls import path
from . import views
from . import additional_views

urlpatterns = [
    # ============================================================
    # TELEMETRY INGESTION
    # ============================================================
    path('telemetry/', views.ingest_telemetry, name='ingest_telemetry'),
    
    # ============================================================
    # LIVE LOCATION
    # ============================================================
    path('live-locations/', views.get_live_locations, name='get_live_locations'),
    path('live-locations/<str:vehicle_id>/', views.get_vehicle_location, name='get_vehicle_location'),
    
    # ============================================================
    # CONGESTION ANALYSIS
    # ============================================================
    path('congestion/', views.get_congestion_data, name='get_congestion_data'),
    path('congestion/route/', views.get_congestion_by_route, name='get_congestion_by_route'),
    
    # ============================================================
    # CRASH EVENTS
    # ============================================================
    path('crashes/', views.get_crash_events, name='get_crash_events'),
    path('crashes/<int:crash_id>/', views.get_crash_detail, name='get_crash_detail'),
    path('crashes/<int:crash_id>/status/', views.update_crash_status, name='update_crash_status'),
    path('crashes/<int:crash_id>/confirm/', views.confirm_crash_event, name='confirm_crash_event'),
    
    # ============================================================
    # THEFT EVENTS
    # ============================================================
    path('theft/', views.get_theft_events, name='get_theft_events'),
    path('theft/<int:theft_id>/status/', views.update_theft_status, name='update_theft_status'),
    
    # ============================================================
    # DEVICE HEALTH
    # ============================================================
    path('device-health/', views.get_device_health, name='get_device_health'),
    
    # ============================================================
    # ROUTE SEARCH & NAVIGATION
    # ============================================================
    path('route/search/', additional_views.search_destination_route, name='search_destination_route'),
    
    # ============================================================
    # HEAT MAP & ANALYTICS
    # ============================================================
    path('heatmap/', additional_views.compute_heatmap, name='compute_heatmap'),
    path('distance/safe/', additional_views.safe_distance_aggregation, name='safe_distance'),
    path('insights/quick/', additional_views.quick_insights, name='quick_insights'),
]
