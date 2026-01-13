# Quick Setup Guide - New Features

## Installation Steps

### 1. Install New Dependencies

```powershell
cd e:\YatriConnect\yatri_backend
pip install requests==2.31.0 Pillow==10.2.0
```

### 2. Create Media Directories

```powershell
mkdir media
mkdir media\profile_pictures
```

### 3. Apply Migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 4. Test OpenStreetMap Connection

```powershell
python manage.py shell
```

Then in the shell:
```python
from navigate.osm_routing import geocode_location, get_route_from_osm

# Test geocoding
locations = geocode_location("India Gate")
print(f"Found {len(locations)} locations")
print(locations[0]['display_name'] if locations else "No results")

# Test routing
route = get_route_from_osm(28.6139, 77.2090, 28.6129, 77.2295)
if route:
    print(f"Route distance: {route['distance']} meters")
    print(f"Route duration: {route['duration']} seconds")
    print(f"Waypoints: {len(route['waypoints'])}")
else:
    print("Routing failed - check internet connection")

exit()
```

### 5. Start Server

```powershell
python manage.py runserver
```

---

## Quick Test Commands

### Test 1: Route Search with OSM

```powershell
# Login first to get JWT token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body (@{
    username = "test_user"
    password = "test_pass"
} | ConvertTo-Json) -ContentType "application/json"

$token = $loginResponse.data.access

# Search for destination
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/route/search/?start_lat=28.6139&start_lon=77.2090&destination=Connaught%20Place" -Method GET -Headers $headers
```

### Test 2: Heat Map Generation

```powershell
# Get heat map for your vehicle
Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/heatmap/?vehicle_id=TEST123&start_date=2026-01-01&end_date=2026-01-13" -Method GET -Headers $headers
```

### Test 3: Profile Picture Upload

```powershell
# Using PowerShell
$filePath = "C:\path\to\image.jpg"
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileContent = [System.Net.Http.ByteArrayContent]::new($fileBytes)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("image/jpeg")

$multipartContent = [System.Net.Http.MultipartFormDataContent]::new()
$multipartContent.Add($fileContent, "profile_picture", "image.jpg")

$client = [System.Net.Http.HttpClient]::new()
$client.DefaultRequestHeaders.Add("Authorization", "Bearer $token")

$response = $client.PutAsync("http://localhost:8000/api/auth/profile/picture/", $multipartContent).Result
$result = $response.Content.ReadAsStringAsync().Result
Write-Output $result
```

Or using cURL (if installed):
```bash
curl -X PUT "http://localhost:8000/api/auth/profile/picture/" \
  -H "Authorization: Bearer $token" \
  -F "profile_picture=@C:\path\to\image.jpg"
```

### Test 4: Safe Distance

```powershell
# Get safe distance for last 7 days
Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/distance/safe/?vehicle_id=TEST123" -Method GET -Headers $headers
```

### Test 5: Quick Insights

```powershell
# Get driving insights
Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/insights/quick/?vehicle_id=TEST123&start_date=2025-12-01" -Method GET -Headers $headers
```

---

## Testing with Sample Data

### Create Test Data

```powershell
python manage.py shell
```

```python
from Devices.models import User, Vehicle, device
from Journey.models import Journey
from sensorData.models import Telemetry
from django.utils import timezone
from datetime import timedelta

# Create test user
user = User.objects.create_user(
    username='test_driver',
    password='test_pass',
    email='driver@test.com',
    role='private_vehicle_owner'
)

# Create test vehicle
vehicle = Vehicle.objects.create(
    vehicle_id='TEST123',
    vehicle_type='private',
    owner=user,
    is_active=True
)

# Create test device
test_device = device.objects.create(
    device_id='DEVICE_TEST123',
    vehicle=vehicle,
    status='active'
)

# Create test telemetry points (simulate a journey)
import random

start_time = timezone.now() - timedelta(hours=2)
base_lat = 28.6139
base_lon = 77.2090

for i in range(100):
    Telemetry.objects.create(
        device=test_device,
        timestamp=start_time + timedelta(minutes=i),
        latitude=base_lat + (random.random() - 0.5) * 0.02,
        longitude=base_lon + (random.random() - 0.5) * 0.02,
        speed=random.uniform(5, 20),
        heading=random.randint(0, 360),
        accel_x=random.uniform(-2, 2),
        accel_y=random.uniform(-2, 2),
        accel_z=9.8,
        pitch=random.uniform(-10, 10),
        roll=random.uniform(-10, 10),
        engine_status=True,
        parking_status=False,
        ble_proximity=True
    )

# Create test journey
journey = Journey.objects.create(
    journey_id='JOURNEY_001',
    vehicle=vehicle,
    status='completed',
    start_location='Test Start',
    start_latitude=base_lat,
    start_longitude=base_lon,
    start_time=start_time,
    end_location='Test End',
    end_latitude=base_lat + 0.01,
    end_longitude=base_lon + 0.01,
    end_time=start_time + timedelta(hours=1),
    distance=5000,  # 5km
    duration=3600,  # 1 hour
    average_speed=1.39  # 5 km/h
)

print("Test data created successfully!")
print(f"User: {user.username}")
print(f"Vehicle: {vehicle.vehicle_id}")
print(f"Telemetry points: {Telemetry.objects.filter(device=test_device).count()}")

exit()
```

---

## Verify OpenStreetMap Integration

### Test Route Waypoints

```python
from navigate.osm_routing import get_route_from_osm

# Test Delhi to Agra route
route = get_route_from_osm(28.6139, 77.2090, 27.1767, 78.0081)

if route:
    print(f"Distance: {route['distance']/1000:.2f} km")
    print(f"Duration: {route['duration']/60:.1f} minutes")
    print(f"Total waypoints: {len(route['waypoints'])}")
    print("\nFirst 5 waypoints:")
    for i, wp in enumerate(route['waypoints'][:5]):
        print(f"  {i+1}. Lat: {wp[0]:.4f}, Lon: {wp[1]:.4f}")
    print(f"\nThese waypoints follow actual roads!")
else:
    print("Route calculation failed - check internet connection")
```

### Test Geocoding

```python
from navigate.osm_routing import geocode_location

# Search for famous landmarks
landmarks = [
    "India Gate, Delhi",
    "Taj Mahal, Agra",
    "Gateway of India, Mumbai",
    "Hawa Mahal, Jaipur"
]

for landmark in landmarks:
    results = geocode_location(landmark, limit=1)
    if results:
        result = results[0]
        print(f"\n{landmark}")
        print(f"  Full name: {result['display_name']}")
        print(f"  Coordinates: {result['lat']:.4f}, {result['lon']:.4f}")
    else:
        print(f"\n{landmark} - Not found")
```

---

## API Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/navigate/route/search/` | Search destination with OSM routing |
| GET | `/api/navigate/heatmap/` | Generate road usage heat map |
| GET/PUT/PATCH | `/api/auth/profile/picture/` | Profile picture management |
| GET | `/api/navigate/distance/safe/` | Safe distance aggregation |
| GET | `/api/navigate/insights/quick/` | Quick driving insights |

---

## Troubleshooting

### Issue 1: OpenStreetMap API Not Working

**Symptoms**: Route search returns empty or errors

**Solutions**:
1. Check internet connection
2. Verify OSRM server is accessible:
   ```powershell
   Invoke-WebRequest -Uri "http://router.project-osrm.org/route/v1/driving/77.2090,28.6139;77.2295,28.6129"
   ```
3. Check rate limits (Nominatim: 1 req/sec)
4. Clear cache:
   ```python
   from django.core.cache import cache
   cache.clear()
   ```

### Issue 2: Profile Picture Upload Fails

**Symptoms**: 400 error on upload

**Solutions**:
1. Check file size (max 5MB)
2. Check file format (JPEG/PNG/WebP only)
3. Ensure media directory exists:
   ```powershell
   if (!(Test-Path "media\profile_pictures")) { mkdir "media\profile_pictures" }
   ```
4. Check Django settings for MEDIA_ROOT and MEDIA_URL

### Issue 3: Heat Map Returns Empty

**Symptoms**: No segments in response

**Solutions**:
1. Create test telemetry data (see above)
2. Check date range filters
3. Verify vehicle_id exists
4. Check access permissions

### Issue 4: Safe Distance Shows Zero

**Symptoms**: All distances are 0

**Solutions**:
1. Create completed journeys (status='completed')
2. Ensure journeys have distance field populated
3. Check date range includes journey dates
4. Verify no harsh events are blocking all journeys

---

## Performance Testing

### Test Route Search Performance

```python
import time
from navigate.osm_routing import get_route_from_osm

# Test multiple routes
routes = [
    (28.6139, 77.2090, 28.6129, 77.2295),  # Short route
    (28.7041, 77.1025, 28.5355, 77.3910),  # Medium route
    (28.6139, 77.2090, 27.1767, 78.0081),  # Long route (Delhi to Agra)
]

for i, (slat, slon, elat, elon) in enumerate(routes, 1):
    start = time.time()
    route = get_route_from_osm(slat, slon, elat, elon)
    elapsed = time.time() - start
    
    if route:
        print(f"Route {i}: {route['distance']/1000:.1f} km - {elapsed:.2f}s")
    else:
        print(f"Route {i}: Failed")
```

### Test Heat Map Performance

```python
import time
from django.test import RequestFactory
from navigate.additional_views import compute_heatmap
from Devices.models import User

# Create mock request
factory = RequestFactory()
user = User.objects.first()

request = factory.get('/api/navigate/heatmap/?vehicle_id=TEST123')
request.user = user

start = time.time()
response = compute_heatmap(request)
elapsed = time.time() - start

print(f"Heat map computed in {elapsed:.2f}s")
print(f"Segments: {response.data.get('data', {}).get('total_segments', 0)}")
```

---

## Next Steps

1. ✅ All features implemented
2. ✅ OpenStreetMap integration complete
3. ✅ Profile pictures working
4. ⏭️ Test with real mobile app
5. ⏭️ Deploy to production
6. ⏭️ Monitor API performance
7. ⏭️ Consider self-hosting OSRM for production

---

## Production Checklist

Before deploying to production:

- [ ] Self-host OSRM server (don't use public server)
- [ ] Set up CDN for profile pictures (AWS S3/Cloudinary)
- [ ] Add rate limiting for OSM calls
- [ ] Enable HTTPS for file uploads
- [ ] Add image compression for profile pictures
- [ ] Set up background jobs for heat maps (Celery)
- [ ] Add monitoring for API response times
- [ ] Implement proper error logging
- [ ] Add database backups
- [ ] Configure CORS for production domains only

---

## Resources

- **OSRM Documentation**: http://project-osrm.org/docs/
- **Nominatim API**: https://nominatim.org/release-docs/latest/api/Overview/
- **OpenStreetMap Wiki**: https://wiki.openstreetmap.org/
- **Django Media Files**: https://docs.djangoproject.com/en/4.2/topics/files/
