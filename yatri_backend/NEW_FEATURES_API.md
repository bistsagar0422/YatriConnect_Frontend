# New Features API Documentation

## Overview
This document covers the newly implemented features with OpenStreetMap integration for YatriConnect backend.

---

## 1. Destination Route Search API

**Endpoint**: `GET /api/navigate/route/search/`

**Description**: Search for destinations and get congestion-aware routes using actual road paths from OpenStreetMap.

**Authentication**: Required (JWT Token)

**Query Parameters**:
- `start_lat` (required): Starting latitude
- `start_lon` (required): Starting longitude
- `destination` (required): Destination keyword (e.g., "India Gate", "Connaught Place")
- `limit` (optional): Number of results, default: 5

**Response**:
```json
{
    "status": "success",
    "data": {
        "routes": [
            {
                "destination": "India Gate, New Delhi, India",
                "destination_lat": 28.6129,
                "destination_lon": 77.2295,
                "waypoints": [
                    [28.6000, 77.2000],
                    [28.6050, 77.2100],
                    ...
                ],
                "distance_meters": 5280,
                "distance_km": 5.28,
                "base_duration_seconds": 780,
                "base_duration_minutes": 13.0,
                "adjusted_duration_seconds": 897,
                "adjusted_duration_minutes": 15.0,
                "overall_congestion": "MEDIUM",
                "congestion_score": 12.5,
                "ranking_score": 77.5,
                "segments": [
                    {
                        "center_lat": 28.6050,
                        "center_lon": 77.2100,
                        "vehicle_count": 15,
                        "avg_speed_kmh": 22.5,
                        "congestion_level": "MEDIUM"
                    }
                ]
            }
        ],
        "total_found": 3
    }
}
```

**Key Features**:
- ✅ Uses OpenStreetMap OSRM for actual road routing (not straight lines)
- ✅ Returns waypoints for plotting on map
- ✅ Congestion-aware ranking
- ✅ Adjusts travel time based on real-time traffic
- ✅ Cached for 5 minutes

**Access Control**:
- Normal users: Public routes only
- Vehicle owners: Own routes + public
- Admin/Police: All routes

**Example Request**:
```bash
GET /api/navigate/route/search/?start_lat=28.6139&start_lon=77.2090&destination=India%20Gate
Authorization: Bearer <jwt_token>
```

---

## 2. Heat Map Computation API

**Endpoint**: `GET /api/navigate/heatmap/`

**Description**: Generate color-coded heat map of road usage based on travel frequency.

**Authentication**: Required (JWT Token)

**Query Parameters**:
- `vehicle_id` (optional): Filter by specific vehicle
- `user_id` (optional): Filter by user (Admin/Police only)
- `start_date` (optional): Start date YYYY-MM-DD
- `end_date` (optional): End date YYYY-MM-DD
- `grid_size` (optional): Grid resolution in degrees, default: 0.01 (~1.1km)

**Response**:
```json
{
    "status": "success",
    "data": {
        "segments": [
            {
                "segment_id": "28.6100_77.2100",
                "lat": 28.61,
                "lon": 77.21,
                "pass_count": 25,
                "color": "#FF0000",
                "usage_level": "MOST_USED"
            },
            {
                "segment_id": "28.6200_77.2200",
                "lat": 28.62,
                "lon": 77.22,
                "pass_count": 12,
                "color": "#FFA500",
                "usage_level": "FREQUENTLY_USED"
            },
            {
                "segment_id": "28.6300_77.2300",
                "lat": 28.63,
                "lon": 77.23,
                "pass_count": 7,
                "color": "#0000FF",
                "usage_level": "MEDIUM_USED"
            },
            {
                "segment_id": "28.6400_77.2400",
                "lat": 28.64,
                "lon": 77.24,
                "pass_count": 3,
                "color": "#00FF00",
                "usage_level": "RARELY_USED"
            }
        ],
        "total_segments": 142,
        "total_points": 3580,
        "max_passes": 25,
        "legend": {
            "RED": "Most used (>= 20 passes)",
            "ORANGE": "Frequently used (10-19 passes)",
            "BLUE": "Medium used (5-9 passes)",
            "GREEN": "Rarely used (< 5 passes)"
        }
    }
}
```

**Color Coding**:
| Color | Hex Code | Pass Count | Usage Level |
|-------|----------|------------|-------------|
| 🔴 Red | #FF0000 | >= 20 | MOST_USED |
| 🟠 Orange | #FFA500 | 10-19 | FREQUENTLY_USED |
| 🔵 Blue | #0000FF | 5-9 | MEDIUM_USED |
| 🟢 Green | #00FF00 | < 5 | RARELY_USED |

**Access Control**:
- Normal users: Public routes only
- Vehicle owners: Own vehicles only
- Admin/Police: All vehicles

**Example Request**:
```bash
GET /api/navigate/heatmap/?vehicle_id=DL01AB1234&start_date=2026-01-01&end_date=2026-01-13
Authorization: Bearer <jwt_token>
```

---

## 3. Profile Picture API

**Endpoint**: `GET/PUT/PATCH /api/auth/profile/picture/`

**Description**: Upload, update, or retrieve user profile picture.

**Authentication**: Required (JWT Token)

### GET - Retrieve Profile Picture

**Response**:
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "private_vehicle_owner",
        "profile_picture": "/media/profile_pictures/user_1_avatar.jpg",
        "profile_picture_url": "http://localhost:8000/media/profile_pictures/user_1_avatar.jpg",
        "bio": "Software developer and safe driver",
        "created_at": "2025-12-01T10:30:00Z"
    }
}
```

### PUT/PATCH - Upload Profile Picture

**Request**: Multipart form data
```
Content-Type: multipart/form-data

profile_picture: <image_file>
```

**Validation**:
- ✅ Max file size: 5MB
- ✅ Allowed formats: JPEG, PNG, WebP
- ✅ User can only modify own profile

**Response**:
```json
{
    "status": "success",
    "message": "Profile picture updated successfully",
    "data": {
        "id": 1,
        "username": "john_doe",
        "profile_picture": "/media/profile_pictures/user_1_avatar.jpg",
        "profile_picture_url": "http://localhost:8000/media/profile_pictures/user_1_avatar.jpg"
    }
}
```

**Example Request (cURL)**:
```bash
curl -X PUT http://localhost:8000/api/auth/profile/picture/ \
  -H "Authorization: Bearer <jwt_token>" \
  -F "profile_picture=@/path/to/image.jpg"
```

---

## 4. Safe Distance Aggregation API

**Endpoint**: `GET /api/navigate/distance/safe/`

**Description**: Calculate daily and weekly safe distance traveled (no harsh events).

**Authentication**: Required (JWT Token)

**Query Parameters**:
- `vehicle_id` (required for vehicle owners): Filter by vehicle
- `start_date` (optional): Start date YYYY-MM-DD, default: 7 days ago
- `end_date` (optional): End date YYYY-MM-DD, default: today

**Response**:
```json
{
    "status": "success",
    "data": {
        "start_date": "2026-01-06",
        "end_date": "2026-01-13",
        "daily_breakdown": [
            {
                "date": "2026-01-06",
                "safe_distance_km": 45.3,
                "trip_count": 3
            },
            {
                "date": "2026-01-07",
                "safe_distance_km": 52.1,
                "trip_count": 4
            },
            {
                "date": "2026-01-08",
                "safe_distance_km": 38.7,
                "trip_count": 2
            },
            {
                "date": "2026-01-09",
                "safe_distance_km": 61.4,
                "trip_count": 5
            },
            {
                "date": "2026-01-10",
                "safe_distance_km": 47.9,
                "trip_count": 3
            },
            {
                "date": "2026-01-11",
                "safe_distance_km": 0.0,
                "trip_count": 0
            },
            {
                "date": "2026-01-12",
                "safe_distance_km": 55.2,
                "trip_count": 4
            },
            {
                "date": "2026-01-13",
                "safe_distance_km": 43.8,
                "trip_count": 3
            }
        ],
        "total_safe_distance_km": 344.4,
        "weekly_average_km": 344.4,
        "total_safe_trips": 24,
        "vehicle_id": "DL01AB1234"
    }
}
```

**Harsh Events Excluded**:
- ❌ Crash detected
- ❌ Harsh braking (acceleration < -5 m/s²)
- ❌ Harsh acceleration (acceleration > 5 m/s²)
- ❌ Sudden turns

**Access Control**:
- Vehicle owners: Own vehicles only
- Admin/Police: All vehicles

**Example Request**:
```bash
GET /api/navigate/distance/safe/?vehicle_id=DL01AB1234&start_date=2026-01-01&end_date=2026-01-13
Authorization: Bearer <jwt_token>
```

---

## 5. Quick Insights Dashboard API

**Endpoint**: `GET /api/navigate/insights/quick/`

**Description**: Get comprehensive driving insights dashboard.

**Authentication**: Required (JWT Token)

**Query Parameters**:
- `vehicle_id` (required for vehicle owners): Filter by vehicle
- `start_date` (optional): Start date YYYY-MM-DD, default: 30 days ago
- `end_date` (optional): End date YYYY-MM-DD, default: today

**Response**:
```json
{
    "status": "success",
    "data": {
        "vehicle_id": "DL01AB1234",
        "date_range": {
            "start_date": "2025-12-14",
            "end_date": "2026-01-13",
            "days": 31
        },
        "safe_driver_streak_days": 5,
        "total_trips": 87,
        "total_distance_km": 1247.3,
        "average_speed_kmh": 34.5,
        "max_speed_kmh": 98.2,
        "total_duration_hours": 36.2,
        "top_routes": [
            {
                "route_name": "Home to Office",
                "trip_count": 42
            },
            {
                "route_name": "Shopping Mall Route",
                "trip_count": 15
            },
            {
                "route_name": "Airport Express",
                "trip_count": 8
            }
        ]
    }
}
```

**Metrics Explained**:
- **Safe Driver Streak**: Consecutive days with zero harsh events (calculated backwards from end_date)
- **Total Trips**: Count of completed journeys
- **Average Speed**: Total distance / total duration
- **Top Routes**: Most frequently used routes

**Access Control**:
- Vehicle owners: Own vehicles only
- Admin/Police: All vehicles

**Example Request**:
```bash
GET /api/navigate/insights/quick/?vehicle_id=DL01AB1234&start_date=2025-12-01
Authorization: Bearer <jwt_token>
```

---

## OpenStreetMap Integration Details

### OSRM (Open Source Routing Machine)

**Base URL**: `http://router.project-osrm.org`

**Services Used**:
1. **Route Service**: Get actual road paths between coordinates
2. **Nearest Service**: Snap GPS coordinates to nearest road
3. **Match Service**: Calculate road distance for series of points

### Nominatim Geocoding

**Base URL**: `https://nominatim.openstreetmap.org`

**Services Used**:
1. **Search**: Convert keywords to coordinates
2. **Reverse**: Convert coordinates to addresses

### Caching Strategy

All OpenStreetMap API calls are cached:
- **Routes**: 1 hour (3600 seconds)
- **Geocoding**: 24 hours (86400 seconds)
- **Road snapping**: No cache (real-time)

---

## Error Handling

### Common Error Responses

**Invalid Coordinates**:
```json
{
    "status": "error",
    "message": "Invalid coordinates. Required: start_lat, start_lon",
    "status_code": 400
}
```

**No Data Found**:
```json
{
    "status": "error",
    "message": "No telemetry data found for specified filters",
    "status_code": 404
}
```

**Access Denied**:
```json
{
    "status": "error",
    "message": "You don't have access to this vehicle",
    "status_code": 403
}
```

**File Upload Error**:
```json
{
    "status": "error",
    "message": "Invalid data",
    "errors": {
        "profile_picture": ["Image file size cannot exceed 5MB."]
    },
    "status_code": 400
}
```

---

## Rate Limiting

All endpoints respect standard throttling:
- Normal users: 100 requests/hour
- Vehicle owners: 1,000 requests/hour
- Admin/Police: 10,000 requests/hour

---

## Testing Examples

### 1. Test Route Search
```bash
# Search for India Gate from current location
curl -X GET "http://localhost:8000/api/navigate/route/search/?start_lat=28.5355&start_lon=77.3910&destination=India%20Gate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Heat Map
```bash
# Get heat map for your vehicle
curl -X GET "http://localhost:8000/api/navigate/heatmap/?vehicle_id=DL01AB1234&start_date=2026-01-01&end_date=2026-01-13" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Profile Picture Upload
```bash
# Upload profile picture
curl -X PUT "http://localhost:8000/api/auth/profile/picture/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profile_picture=@avatar.jpg"
```

### 4. Test Safe Distance
```bash
# Get safe distance for last 7 days
curl -X GET "http://localhost:8000/api/navigate/distance/safe/?vehicle_id=DL01AB1234" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Test Quick Insights
```bash
# Get driving insights for last 30 days
curl -X GET "http://localhost:8000/api/navigate/insights/quick/?vehicle_id=DL01AB1234" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Database Requirements

No additional models required - uses existing:
- `User` (profile_picture field already exists)
- `Journey` (trip tracking)
- `Telemetry` (location data)
- `CrashEvent` (harsh events)
- `RoadSegment` (congestion data)

---

## Setup Instructions

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run Migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Create Media Directory**:
```bash
mkdir media
mkdir media/profile_pictures
```

4. **Test OpenStreetMap Connection**:
```python
from navigate.osm_routing import geocode_location
results = geocode_location("India Gate")
print(results)
```

5. **Start Server**:
```bash
python manage.py runserver
```

---

## Performance Considerations

### OpenStreetMap API Limits

- OSRM: No rate limit on public server (fair use)
- Nominatim: Max 1 request/second (enforced by caching)

### Optimization Tips

1. **Caching**: All OSM calls are cached automatically
2. **Batch Processing**: Heat maps process data in memory
3. **Indexes**: Ensure lat/lon indexes exist on Telemetry table
4. **Grid Size**: Larger grid_size = faster heat map computation

---

## Production Recommendations

For production deployment:

1. **Self-host OSRM**:
```bash
docker run -p 5000:5000 osrm/osrm-backend osrm-routed --algorithm mld /data/india-latest.osrm
```

2. **Use CDN for Profile Pictures**: Store in AWS S3 or Cloudinary

3. **Add Rate Limiting**: Implement stricter limits on OSM calls

4. **Background Jobs**: Process heat maps asynchronously with Celery

5. **Database Optimization**: Partition Telemetry table by date

---

## Support & Contact

For issues or questions:
- Check error logs: `tail -f yatri_backend/logs/error.log`
- Review API documentation: `API_DOCUMENTATION.md`
- Check enhanced features: `ENHANCED_FEATURES.md`
