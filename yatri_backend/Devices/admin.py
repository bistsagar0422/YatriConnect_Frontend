from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Vehicle, Device, Route


# ============================================================
# USER ADMIN
# ============================================================
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model with role management"""
    
    list_display = ['username', 'email', 'role', 'is_staff', 'is_active', 'created_at']
    list_filter = ['role', 'is_staff', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'phone']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('YatriConnect Info', {
            'fields': ('role', 'phone', 'emergency_contact')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('YatriConnect Info', {
            'fields': ('role', 'phone', 'emergency_contact')
        }),
    )


# ============================================================
# VEHICLE ADMIN
# ============================================================
@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """Admin interface for Vehicle management"""
    
    list_display = ['vehicle_id', 'owner', 'vehicle_type', 'make', 'model', 'is_active', 'created_at']
    list_filter = ['vehicle_type', 'is_active', 'created_at']
    search_fields = ['vehicle_id', 'make', 'model', 'owner__username']
    list_editable = ['is_active']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('vehicle_id', 'owner', 'vehicle_type')
        }),
        ('Vehicle Details', {
            'fields': ('make', 'model', 'year')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


# ============================================================
# DEVICE ADMIN
# ============================================================
@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    """Admin interface for Device management"""
    
    list_display = ['device_id', 'vehicle', 'status', 'is_healthy', 'last_ping', 'created_at']
    list_filter = ['status', 'created_at', 'last_ping']
    search_fields = ['device_id', 'vehicle__vehicle_id']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('device_id', 'vehicle')
        }),
        ('Status', {
            'fields': ('status', 'last_ping')
        }),
        ('Technical', {
            'fields': ('firmware_version',)
        }),
    )
    
    def is_healthy(self, obj):
        """Display health status"""
        return obj.is_healthy()
    is_healthy.boolean = True
    is_healthy.short_description = 'Healthy'


# ============================================================
# ROUTE ADMIN
# ============================================================
@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    """Admin interface for Route management"""
    
    list_display = ['route_id', 'name', 'start_location', 'end_location', 'is_public', 'trip_count', 'average_speed']
    list_filter = ['is_public', 'created_at']
    search_fields = ['route_id', 'name', 'start_location', 'end_location']
    list_editable = ['is_public']
    
    fieldsets = (
        ('Route Info', {
            'fields': ('route_id', 'name')
        }),
        ('Locations', {
            'fields': ('start_location', 'start_latitude', 'start_longitude',
                      'end_location', 'end_latitude', 'end_longitude')
        }),
        ('Statistics', {
            'fields': ('is_public', 'trip_count', 'average_speed', 'average_duration')
        }),
    )
