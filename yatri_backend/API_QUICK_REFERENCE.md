# YatriConnect - Complete API Quick Reference

## 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (returns JWT tokens) |
| POST | `/api/auth/logout/` | Logout (blacklist token) |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/profile/` | Get user profile |
| PUT | `/api/auth/profile/update/` | Update profile |
| POST | `/api/auth/profile/change-password/` | Change password |
| GET/PUT/PATCH | `/api/auth/profile/picture/` | Profile picture |
| GET | `/api/auth/vehicles/` | Get user's vehicles |
| POST | `/api/auth/vehicles/add/` | Add new vehicle |

---

## 📍 Navigation & Telemetry Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/navigate/telemetry/` | Ingest telemetry data |
| GET | `/api/navigate/live-locations/` | Get all live locations |
| GET | `/api/navigate/live-locations/{vehicle_id}/` | Get vehicle location |
| GET | `/api/navigate/route/search/` | **NEW** Search destination with OSM routing |
| GET | `/api/navigate/congestion/` | Get congestion data |
| GET | `/api/navigate/congestion/route/` | Route congestion analysis |
| GET | `/api/navigate/device-health/` | Device health status |

---

## 🚨 Event Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/navigate/crashes/` | List crash events |
| GET | `/api/navigate/crashes/{id}/` | Crash event detail |
| PATCH | `/api/navigate/crashes/{id}/status/` | Update crash status |
| POST | `/api/navigate/crashes/{id}/confirm/` | Confirm/deny crash (15s timer) |
| GET | `/api/navigate/theft/` | List theft events |
| PATCH | `/api/navigate/theft/{id}/status/` | Update theft status |

---

## 🗺️ Journey & Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/journey/start/` | Start new journey |
| POST | `/api/journey/end/` | End ongoing journey |
| GET | `/api/journey/list/` | List journeys |
| GET | `/api/journey/{id}/` | Journey detail |
| GET | `/api/journey/analytics/route/` | Route analytics (raw SQL) |
| GET | `/api/journey/analytics/heatmap/` | Heatmap data (raw SQL) |
| GET | `/api/journey/analytics/density/` | Vehicle density (raw SQL) |
| GET | `/api/navigate/heatmap/` | **NEW** Road usage heat map |
| GET | `/api/navigate/distance/safe/` | **NEW** Safe distance aggregation |
| GET | `/api/navigate/insights/quick/` | **NEW** Quick insights dashboard |

---

## 🆕 New Features Summary

### 1. Route Search with OpenStreetMap
```
GET /api/navigate/route/search/?start_lat=28.6139&start_lon=77.2090&destination=India%20Gate
```
**Returns**: Actual road waypoints, congestion levels, adjusted travel time

### 2. Heat Map Generation
```
GET /api/navigate/heatmap/?vehicle_id=TEST123&start_date=2026-01-01&end_date=2026-01-13
```
**Returns**: Color-coded segments (RED/ORANGE/BLUE/GREEN) by usage frequency

### 3. Profile Picture Upload
```
PUT /api/auth/profile/picture/
Content-Type: multipart/form-data
Body: profile_picture=<image_file>
```
**Returns**: Updated profile with picture URL

### 4. Safe Distance Aggregation
```
GET /api/navigate/distance/safe/?vehicle_id=TEST123
```
**Returns**: Daily safe distance (no harsh events), weekly totals

### 5. Quick Insights Dashboard
```
GET /api/navigate/insights/quick/?vehicle_id=TEST123
```
**Returns**: Safe streak, total trips, avg speed, top routes

---

## 🔑 Authentication Header

All authenticated endpoints require:
```
Authorization: Bearer <jwt_access_token>
```

Get token from login response:
```json
{
    "status": "success",
    "data": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
}
```

---

## 👥 User Roles

| Role | Access Level |
|------|--------------|
| `admin` | Full access to all data |
| `police` | All vehicles, events, and routes |
| `normal_user` | Public routes only |
| `private_vehicle_owner` | Own vehicles + public routes |
| `government_vehicle_owner` | Own vehicles + public routes |

---

## 📊 Response Format

### Success Response
```json
{
    "status": "success",
    "data": { ... },
    "message": "Optional success message"
}
```

### Error Response
```json
{
    "status": "error",
    "message": "Error description",
    "errors": { ... },
    "status_code": 400
}
```

---

## 🎨 Heat Map Color Codes

| Color | Hex | Pass Count | Usage Level |
|-------|-----|------------|-------------|
| 🔴 Red | #FF0000 | >= 20 | MOST_USED |
| 🟠 Orange | #FFA500 | 10-19 | FREQUENTLY_USED |
| 🔵 Blue | #0000FF | 5-9 | MEDIUM_USED |
| 🟢 Green | #00FF00 | < 5 | RARELY_USED |

---

## 🚦 Congestion Levels

| Level | Vehicle Count | Avg Speed | Color | Description |
|-------|---------------|-----------|-------|-------------|
| LOW | < 10 | > 25 km/h | 🟢 Green (#00FF00) | Light traffic |
| MEDIUM | 10-20 | 15-25 km/h | 🟡 Yellow (#FFA500) | Moderate traffic |
| HIGH | > 20 | < 15 km/h | 🔴 Red (#FF0000) | Heavy traffic |

---

## ⚡ Rate Limits

| User Type | Requests/Hour |
|-----------|---------------|
| Normal User | 100 |
| Vehicle Owner | 1,000 |
| Admin/Police | 10,000 |

---

## 🗺️ OpenStreetMap Services

### OSRM (Routing)
- **Base URL**: `http://router.project-osrm.org`
- **Cache**: 1 hour
- **Services**: Route, Nearest, Match

### Nominatim (Geocoding)
- **Base URL**: `https://nominatim.openstreetmap.org`
- **Cache**: 24 hours
- **Rate Limit**: 1 request/second

---

## 🧪 Quick Test Commands (PowerShell)

### Login
```powershell
$login = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body (@{username="test_user"; password="test_pass"} | ConvertTo-Json) -ContentType "application/json"
$token = $login.data.access
```

### Search Route
```powershell
$headers = @{"Authorization" = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/route/search/?start_lat=28.6139&start_lon=77.2090&destination=India%20Gate" -Headers $headers
```

### Get Heat Map
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/heatmap/?vehicle_id=TEST123" -Headers $headers
```

### Get Safe Distance
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/distance/safe/?vehicle_id=TEST123" -Headers $headers
```

### Get Quick Insights
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/navigate/insights/quick/?vehicle_id=TEST123" -Headers $headers
```

---

## 📁 File Structure

```
yatri_backend/
├── Devices/              # Auth & User Management
│   ├── models.py        # User, Vehicle, Device, Route
│   ├── serializers.py   # User serializers (with profile pic)
│   ├── views.py         # Auth APIs
│   └── urls.py          # Auth endpoints
├── sensorData/          # Telemetry
│   ├── models.py        # Telemetry model
│   ├── serializers.py   # Telemetry serializers
│   └── views.py         # Telemetry ingestion
├── Journey/             # Trips & Events
│   ├── models.py        # Journey, CrashEvent, TheftEvent, RoadSegment
│   ├── serializers.py   # Journey serializers
│   ├── views.py         # Journey tracking APIs
│   └── urls.py          # Journey endpoints
├── navigate/            # Navigation & Analytics
│   ├── views.py         # Navigate APIs (crashes, theft, congestion)
│   ├── additional_views.py  # NEW: Route search, heat map, insights
│   ├── osm_routing.py   # NEW: OpenStreetMap utilities
│   └── urls.py          # Navigate endpoints
└── media/               # Uploaded files
    └── profile_pictures/
```

---

## 💡 Pro Tips

### 1. Cache Clearing
```python
from django.core.cache import cache
cache.clear()
```

### 2. Test OSM Connection
```python
from navigate.osm_routing import get_route_from_osm
route = get_route_from_osm(28.6139, 77.2090, 28.6129, 77.2295)
print(f"Distance: {route['distance']/1000:.2f} km")
```

### 3. Create Test Data
```python
from Devices.models import User, Vehicle
from Journey.models import Journey

user = User.objects.create_user(username='test', password='test', role='private_vehicle_owner')
vehicle = Vehicle.objects.create(vehicle_id='TEST123', vehicle_type='private', owner=user)
```

### 4. Check Telemetry Count
```python
from sensorData.models import Telemetry
print(f"Total telemetry points: {Telemetry.objects.count()}")
```

### 5. Monitor Performance
```python
import time
start = time.time()
# Your API call here
print(f"Response time: {time.time() - start:.2f}s")
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `README.md` | Project overview |
| `SETUP_GUIDE.md` | Initial setup instructions |
| `API_DOCUMENTATION.md` | Complete API reference |
| `ENHANCED_FEATURES.md` | Theft & crash detection details |
| `NEW_FEATURES_API.md` | New features documentation |
| `SETUP_NEW_FEATURES.md` | Setup guide for new features |
| `IMPLEMENTATION_SUMMARY_NEW_FEATURES.md` | Implementation summary |
| `MIGRATION_GUIDE.md` | Database migration guide |

---

## 🚀 Production Checklist

- [ ] Self-host OSRM server
- [ ] Configure CDN for profile pictures
- [ ] Set up HTTPS
- [ ] Enable Redis persistence
- [ ] Configure PostgreSQL backups
- [ ] Set up monitoring (Sentry, New Relic)
- [ ] Add rate limiting
- [ ] Configure CORS for production domains
- [ ] Set DEBUG=False
- [ ] Use strong SECRET_KEY
- [ ] Set up CI/CD pipeline

---

## 📞 Support

- **GitHub**: [YatriConnect Repository]
- **Email**: support@yatriconnect.com
- **Documentation**: See README.md and API docs

---

**Total Endpoints**: 32 (26 original + 6 new)
**Total Models**: 11
**Database**: PostgreSQL
**Cache**: Redis
**Authentication**: JWT
**External APIs**: OpenStreetMap (OSRM + Nominatim)
