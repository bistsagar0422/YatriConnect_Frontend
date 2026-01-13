"""
YatriConnect - Main URL Configuration
All routes use explicit URL patterns (no routers)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin Panel (for Admin and Police)
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('Devices.urls')),          # Authentication & User Management
    path('api/telemetry/', include('sensorData.urls')),  # Telemetry ingestion
    path('api/navigate/', include('navigate.urls')),     # Live navigation & crash detection
    path('api/journey/', include('Journey.urls')),       # Journey tracking & analytics
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

