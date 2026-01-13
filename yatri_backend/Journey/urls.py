"""
YatriConnect - Journey Module URLs
Journey tracking, routes, analytics
"""

from django.urls import path
from . import views

urlpatterns = [
    # Journey management
    path('start/', views.start_journey, name='start_journey'),
    path('<str:journey_id>/end/', views.end_journey, name='end_journey'),
    path('history/', views.get_journey_history, name='get_journey_history'),
    path('<str:journey_id>/', views.get_journey_detail, name='get_journey_detail'),
    
    # Route management
    path('public-routes/', views.get_public_routes, name='get_public_routes'),
    path('routes/', views.get_all_routes, name='get_all_routes'),
    
    # Analytics with raw SQL
    path('analytics/routes-sql/', views.get_route_analytics_raw_sql, name='route_analytics_sql'),
    path('analytics/heatmap-sql/', views.get_congestion_heatmap_raw_sql, name='heatmap_sql'),
    path('analytics/density-sql/', views.get_vehicle_density_raw_sql, name='density_sql'),
]
