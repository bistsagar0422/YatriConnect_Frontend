"""
YatriConnect - Journey Admin
Admin interface for journeys, congestion, and crash events
"""

from django.contrib import admin
from .models import Journey, Congestion, CrashEvent


@admin.register(Journey)
class JourneyAdmin(admin.ModelAdmin):
    """Admin interface for Journey management"""
    
    list_display = ['journey_id', 'vehicle', 'status', 'start_location', 'end_location', 
                   'start_time', 'end_time', 'distance', 'duration']
    list_filter = ['status', 'start_time', 'vehicle__vehicle_type']
    search_fields = ['journey_id', 'vehicle__vehicle_id', 'start_location', 'end_location']
    list_editable = ['status']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('journey_id', 'vehicle', 'route', 'status')
        }),
        ('Start Details', {
            'fields': ('start_location', 'start_latitude', 'start_longitude', 'start_time')
        }),
        ('End Details', {
            'fields': ('end_location', 'end_latitude', 'end_longitude', 'end_time')
        }),
        ('Statistics', {
            'fields': ('distance', 'duration', 'average_speed', 'max_speed')
        }),
    )


@admin.register(Congestion)
class CongestionAdmin(admin.ModelAdmin):
    """Admin interface for Congestion monitoring"""
    
    list_display = ['location_name', 'route', 'congestion_level', 'vehicle_count', 
                   'average_speed', 'timestamp']
    list_filter = ['congestion_level', 'timestamp']
    search_fields = ['location_name', 'route__name']
    
    fieldsets = (
        ('Location', {
            'fields': ('route', 'location_name', 'latitude', 'longitude')
        }),
        ('Congestion Data', {
            'fields': ('congestion_level', 'vehicle_count', 'average_speed', 'timestamp')
        }),
    )


@admin.register(CrashEvent)
class CrashEventAdmin(admin.ModelAdmin):
    """Admin interface for Crash Event management"""
    
    list_display = ['vehicle', 'severity', 'status', 'timestamp', 'emergency_notified', 
                   'accel_magnitude']
    list_filter = ['severity', 'status', 'emergency_notified', 'timestamp']
    search_fields = ['vehicle__vehicle_id', 'notes']
    list_editable = ['status']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('vehicle', 'journey', 'timestamp')
        }),
        ('Crash Details', {
            'fields': ('severity', 'status', 'latitude', 'longitude', 
                      'accel_magnitude', 'speed_before')
        }),
        ('Emergency Response', {
            'fields': ('emergency_notified', 'notes')
        }),
    )
