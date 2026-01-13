"""
YatriConnect - Sensor Data URLs
Telemetry ingestion endpoints
"""

from django.urls import path
from . import views

urlpatterns = [
    # Simple endpoint - main telemetry handled by navigate module
    path('', views.display, name='telemetry_info'),
]
