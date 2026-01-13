# YatriConnect API Documentation

**Base URL**: `http://localhost:8000`  
**API Version**: 1.0  
**Authentication**: JWT Bearer Token

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Navigate APIs](#navigate-apis)
3. [Journey APIs](#journey-apis)
4. [Response Format](#response-format)
5. [Error Codes](#error-codes)

---

## 🔐 Authentication

### Register User
**Endpoint**: `POST /api/auth/register/`  
**Auth Required**: No  
**Throttle**: 100/hour (anonymous)

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "role": "private_vehicle_owner",
  "phone": "1234567890",
  "emergency_contact": "0987654321",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Roles**: `admin`, `police`, `normal_user`, `private_vehicle_owner`, `government_vehicle_owner`

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "private_vehicle_owner",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  }
}
```

---

### Login
**Endpoint**: `POST /api/auth/login/`  
**Auth Required**: No  
**Throttle**: 100/hour (anonymous)

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "private_vehicle_owner"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  }
}
```

**Token Usage**:
```bash
# Add to headers
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

### Logout
**Endpoint**: `POST /api/auth/logout/`  
**Auth Required**: Yes  
**Roles**: All authenticated users

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Refresh Token
**Endpoint**: `POST /api/auth/refresh/`  
**Auth Required**: No  
**Throttle**: 100/hour

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### Get Profile
**Endpoint**: `GET /api/auth/profile/`  
**Auth Required**: Yes  
**Roles**: All authenticated users

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "private_vehicle_owner",
    "phone": "1234567890",
    "emergency_contact": "0987654321",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### Update Profile
**Endpoint**: `PUT /api/auth/profile/update/`  
**Auth Required**: Yes  
**Roles**: All authenticated users

**Request Body**:
```json
{
  "phone": "9876543210",
  "emergency_contact": "1234567890",
  "email": "newemail@example.com",
  "first_name": "Jonathan",
  "last_name": "Doe"
}
```

**Note**: Cannot change username or role via this endpoint

---

### Change Password
**Endpoint**: `PUT /api/auth/profile/change-password/`  
**Auth Required**: Yes  
**Roles**: All authenticated users

**Request Body**:
```json
{
  "old_password": "OldPass123!",
  "new_password": "NewPass123!",
  "new_password2": "NewPass123!"
}
```

---

### Get User Vehicles
**Endpoint**: `GET /api/auth/vehicles/`  
**Auth Required**: Yes  
**Roles**: Vehicle owners only

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vehicle_id": "ABC123",
      "owner": 1,
      "owner_name": "john_doe",
      "vehicle_type": "private",
      "vehicle_type_display": "Private",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Add Vehicle
**Endpoint**: `POST /api/auth/vehicles/add/`  
**Auth Required**: Yes  
**Roles**: Vehicle owners only

**Request Body**:
```json
{
  "vehicle_id": "ABC123",
  "vehicle_type": "private",
  "make": "Toyota",
  "model": "Camry",
  "year": 2022
}
```

**Vehicle Types**: `public`, `private`, `government`

---

## 🧭 Navigate APIs

### Ingest Telemetry
**Endpoint**: `POST /api/navigate/telemetry/`  
**Auth Required**: Yes  
**Throttle**: 10,000/hour (telemetry devices)

**Request Body**:
```json
{
  "device_id": "DEVICE123",
  "timestamp": "2024-01-15T10:30:00Z",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "altitude": 200.5,
  "speed": 15.5,
  "heading": 90.0,
  "accel_x": 0.5,
  "accel_y": 0.3,
  "accel_z": 9.8
}
```

**Auto-Detection**:
- If `accel_magnitude > 20 m/s²`, crash event is created
- Device `last_ping` is updated
- Live location cache is invalidated

**Response**:
```json
{
  "success": true,
  "message": "Telemetry data received",
  "data": {
    "id": 1234,
    "device_id": "DEVICE123",
    "vehicle_id": "ABC123",
    "timestamp": "2024-01-15T10:30:00Z",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "speed": 15.5,
    "accel_magnitude": 9.84
  }
}
```

---

### Get Live Locations
**Endpoint**: `GET /api/navigate/live-locations/`  
**Auth Required**: Yes  
**Roles**: All users (filtered by access)

**Query Parameters**:
- `vehicle_type`: Filter by type (`public`, `private`, `government`)
- `minutes`: Time window for live data (default: 5)

**Access Control**:
- Admin/Police: All vehicles
- Normal User: Public vehicles only
- Vehicle Owner: Own + public vehicles

**Example**: `GET /api/navigate/live-locations/?vehicle_type=public&minutes=10`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "device_id": "DEVICE123",
      "vehicle_id": "ABC123",
      "vehicle_type": "public",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "speed": 15.5,
      "heading": 90.0,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Cache**: 10 seconds TTL

---

### Get Vehicle Location
**Endpoint**: `GET /api/navigate/live-locations/<vehicle_id>/`  
**Auth Required**: Yes  
**Roles**: Based on vehicle access

**Example**: `GET /api/navigate/live-locations/ABC123/`

**Response**: Same as live locations but single vehicle

---

### Get Congestion Data
**Endpoint**: `GET /api/navigate/congestion/`  
**Auth Required**: Yes  
**Roles**: All users (public routes only for non-privileged)

**Query Parameters**:
- `route_id`: Filter by route
- `level`: Filter by level (`low`, `moderate`, `high`, `severe`)
- `minutes`: Time window (default: 30)

**Example**: `GET /api/navigate/congestion/?level=high&minutes=60`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "route": 1,
      "route_name": "Delhi to Noida",
      "location_name": "DND Flyway",
      "latitude": 28.5729,
      "longitude": 77.3490,
      "congestion_level": "high",
      "congestion_level_display": "High",
      "vehicle_count": 150,
      "average_speed": 5.5,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Cache**: 5 minutes TTL

---

### Get Crash Events
**Endpoint**: `GET /api/navigate/crashes/`  
**Auth Required**: Yes  
**Roles**: Police, Admin only

**Query Parameters**:
- `status`: Filter by status (`detected`, `verified`, `false_alarm`, `resolved`)
- `severity`: Filter by severity (`low`, `medium`, `high`, `critical`)
- `start_date`: Date filter (YYYY-MM-DD)
- `end_date`: Date filter (YYYY-MM-DD)

**Example**: `GET /api/navigate/crashes/?severity=high&status=detected`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vehicle": 1,
      "vehicle_id": "ABC123",
      "vehicle_owner": "john_doe",
      "journey": 10,
      "severity": "high",
      "severity_display": "High",
      "status": "detected",
      "status_display": "Detected",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "accel_magnitude": 35.5,
      "speed_before": 20.0,
      "timestamp": "2024-01-15T10:30:00Z",
      "emergency_notified": false,
      "notes": ""
    }
  ]
}
```

---

### Get Crash Detail
**Endpoint**: `GET /api/navigate/crashes/<crash_id>/`  
**Auth Required**: Yes  
**Roles**: Police, Admin only

**Example**: `GET /api/navigate/crashes/1/`

---

### Update Crash Status
**Endpoint**: `PATCH /api/navigate/crashes/<crash_id>/status/`  
**Auth Required**: Yes  
**Roles**: Police, Admin only

**Request Body**:
```json
{
  "status": "verified",
  "notes": "Police investigated. Minor accident, no injuries."
}
```

**Status Values**: `detected`, `verified`, `false_alarm`, `resolved`

---

### Get Device Health
**Endpoint**: `GET /api/navigate/device-health/`  
**Auth Required**: Yes  
**Roles**: Based on vehicle access

**Query Parameters**:
- `status`: Filter by status (`active`, `inactive`, `maintenance`, `faulty`)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "device_id": "DEVICE123",
      "vehicle": 1,
      "vehicle_id": "ABC123",
      "status": "active",
      "status_display": "Active",
      "is_healthy": true,
      "firmware_version": "v1.2.3",
      "last_ping": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Health Criteria**: Device is healthy if `last_ping` within last 10 minutes

---

## 🗺️ Journey APIs

### Start Journey
**Endpoint**: `POST /api/journey/start/`  
**Auth Required**: Yes  
**Roles**: Vehicle owners

**Request Body**:
```json
{
  "vehicle_id": "ABC123",
  "start_location": "Connaught Place, Delhi",
  "start_latitude": 28.6139,
  "start_longitude": 77.2090,
  "start_time": "2024-01-15T10:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Journey started",
  "data": {
    "id": 1,
    "journey_id": "J20240115100000_ABC123",
    "vehicle": 1,
    "vehicle_id": "ABC123",
    "status": "ongoing",
    "start_location": "Connaught Place, Delhi",
    "start_latitude": 28.6139,
    "start_longitude": 77.2090,
    "start_time": "2024-01-15T10:00:00Z"
  }
}
```

---

### End Journey
**Endpoint**: `POST /api/journey/<journey_id>/end/`  
**Auth Required**: Yes  
**Roles**: Vehicle owners

**Example**: `POST /api/journey/J20240115100000_ABC123/end/`

**Request Body**:
```json
{
  "end_location": "India Gate, Delhi",
  "end_latitude": 28.6129,
  "end_longitude": 77.2295,
  "distance": 5000,
  "max_speed": 20.5
}
```

**Auto-Detection**:
- Calculates duration and average speed
- For public vehicles: Triggers public route detection
- Matches with existing routes (within 50m threshold)
- Creates new route or increments trip_count

**Response**: Complete journey data with statistics

---

### Get Journey History
**Endpoint**: `GET /api/journey/history/`  
**Auth Required**: Yes  
**Roles**: All users (filtered by vehicle access)

**Query Parameters**:
- `vehicle_id`: Filter by vehicle
- `status`: Filter by status (`ongoing`, `completed`, `cancelled`)
- `start_date`: Date filter (YYYY-MM-DD)
- `end_date`: Date filter (YYYY-MM-DD)
- `ordering`: Sort field (`start_time`, `-distance`, `duration`)
- `page`: Page number
- `page_size`: Items per page (max 100)

**Example**: `GET /api/journey/history/?vehicle_id=ABC123&status=completed&page=1&page_size=20&ordering=-start_time`

**Response** (Paginated):
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/journey/history/?page=2",
  "previous": null,
  "results": [
    {
      "journey_id": "J20240115100000_ABC123",
      "vehicle_id": "ABC123",
      "start_location": "Connaught Place",
      "end_location": "India Gate",
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": "2024-01-15T10:30:00Z",
      "distance": 5000,
      "duration": 1800,
      "status": "completed"
    }
  ]
}
```

---

### Get Journey Detail
**Endpoint**: `GET /api/journey/<journey_id>/`  
**Auth Required**: Yes  
**Roles**: Based on vehicle access

**Example**: `GET /api/journey/J20240115100000_ABC123/`

**Response**: Complete journey information including route details

---

### Get Public Routes
**Endpoint**: `GET /api/journey/public-routes/`  
**Auth Required**: Yes  
**Roles**: All users

**Query Parameters**:
- `search`: Search in route/location names
- `ordering`: Sort field (`trip_count`, `-average_speed`)

**Example**: `GET /api/journey/public-routes/?search=Delhi&ordering=-trip_count`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "route_id": "R20240115_BUS001",
      "name": "Connaught Place to India Gate",
      "start_location": "Connaught Place",
      "end_location": "India Gate",
      "average_speed": 12.5,
      "average_duration": 1800,
      "trip_count": 25
    }
  ]
}
```

**Cache**: 5 minutes TTL

---

### Get All Routes (Admin)
**Endpoint**: `GET /api/journey/routes/`  
**Auth Required**: Yes  
**Roles**: Police, Admin only

**Query Parameters**:
- `is_public`: Filter by public status (`true`/`false`)
- `search`: Search in names

**Response**: Complete route information including private routes

---

### Route Analytics (Raw SQL)
**Endpoint**: `GET /api/journey/analytics/routes-sql/`  
**Auth Required**: Yes  
**Roles**: Police, Admin only

**Demonstrates**:
- Raw SQL in Django
- Aggregation with GROUP BY
- LEFT JOIN operations

**Response**:
```json
{
  "success": true,
  "message": "Route analytics (raw SQL)",
  "data": [
    {
      "route_id": "R20240115_BUS001",
      "name": "Connaught Place to India Gate",
      "start_location": "Connaught Place",
      "end_location": "India Gate",
      "is_public": true,
      "trip_count": 25,
      "journey_count": 28,
      "calculated_avg_speed": 12.8,
      "max_speed_recorded": 25.5,
      "total_distance": 140000
    }
  ]
}
```

---

### Congestion Heatmap (Raw SQL)
**Endpoint**: `GET /api/journey/analytics/heatmap-sql/`  
**Auth Required**: Yes  
**Roles**: Police, Admin only

**Query Parameters**:
- `hours`: Time window (default: 24)

**Example**: `GET /api/journey/analytics/heatmap-sql/?hours=48`

**Demonstrates**:
- Geospatial grouping (rounding lat/lon)
- TIME INTERVAL queries
- MODE() aggregate function

**Response**:
```json
{
  "success": true,
  "message": "Congestion heatmap (last 24 hours)",
  "data": [
    {
      "latitude": 28.61,
      "longitude": 77.21,
      "data_points": 15,
      "avg_speed": 8.5,
      "total_vehicles": 450,
      "dominant_congestion_level": "high",
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Vehicle Density (Raw SQL)
**Endpoint**: `GET /api/journey/analytics/density-sql/`  
**Auth Required**: Yes  
**Roles**: Police, Admin only

**Demonstrates**:
- Window functions
- Complex JOINs
- Hourly aggregation

**Response**:
```json
{
  "success": true,
  "message": "Vehicle density analysis (last 7 days)",
  "data": [
    {
      "route_id": "R20240115_BUS001",
      "name": "Connaught Place to India Gate",
      "avg_vehicles_per_hour": 12.5,
      "peak_vehicles": 25,
      "avg_trips_per_hour": 15.3,
      "hours_active": 168
    }
  ]
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { /* error details */ }
}
```

### Paginated Response
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [ /* array of items */ ]
}
```

---

## ❌ Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## 🔑 Authentication Headers

**All authenticated endpoints require**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Token Lifetime**:
- Access Token: 1 hour
- Refresh Token: 7 days

**Token Refresh Flow**:
1. Access token expires (401 error)
2. Use refresh token at `/api/auth/refresh/`
3. Receive new access token
4. Continue with new token

---

## 🚦 Rate Limiting

| User Type | Rate Limit |
|-----------|------------|
| Anonymous | 100/hour |
| Authenticated | 1000/hour |
| Telemetry | 10000/hour |
| Public API | 500/hour |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

---

## 📚 Additional Resources

- **Setup Guide**: See `SETUP_GUIDE.md`
- **Main README**: See `README.md`
- **Admin Panel**: `http://localhost:8000/admin/`
- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/

---

**Last Updated**: January 2024  
**API Version**: 1.0  
**Project**: YatriConnect Smart Mobility Backend
