# YatriConnect - Smart Mobility Backend

**Academic/Research-Oriented Backend System**  
Django + Django REST Framework + JWT Authentication

---

## 🎯 Project Overview

YatriConnect is a learning-oriented backend system for Smart Mobility and Smart City applications. Built with Django and DRF, it demonstrates:

- **Function-based API views** (No ViewSets or class-based views)
- **JWT-based authentication** with role-based access control
- **PostgreSQL database** with indexing and optimization
- **Redis caching** for live data
- **Raw SQL examples** for analytics
- **Public route detection** from repeated trips
- **Real-time telemetry** ingestion from IoT devices
- **Crash detection** and emergency response
- **Congestion tracking** and heat maps

**Purpose**: Academic evaluation, research, and learning - NOT production deployment.

---

## 🏗️ Architecture

### Technology Stack
- **Backend**: Django 4.2+ / Python 3.10+
- **API Framework**: Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Admin Panel**: Django Admin

### Design Principles
1. **No Magic** - Every flow is explicit: URL → Auth → Role Check → Query → Response
2. **Function-Based Views** - All APIs use function-based views for clarity
3. **Explainable Code** - Every function is documented for viva/presentations
4. **Learning-Oriented** - Includes raw SQL examples and optimization techniques

---

## 📂 Project Structure

```
yatri_backend/
├── Devices/                 # Core models & authentication
│   ├── models.py           # User, Vehicle, Device, Route
│   ├── views.py            # Auth endpoints (login, register, profile)
│   ├── serializers.py      # DRF serializers
│   ├── utils.py            # Helper functions & decorators
│   ├── admin.py            # Admin panel configuration
│   └── urls.py             # Explicit URL patterns
│
├── sensorData/             # Telemetry data
│   ├── models.py           # Telemetry model
│   ├── serializers.py      # Telemetry serializers
│   └── urls.py
│
├── navigate/               # Live navigation module
│   ├── views.py            # Live location, congestion, crash detection
│   └── urls.py             # Navigate endpoints
│
├── Journey/                # Journey tracking & analytics
│   ├── models.py           # Journey, Congestion, CrashEvent
│   ├── views.py            # Journey APIs + Raw SQL analytics
│   ├── serializers.py      # Journey serializers
│   ├── admin.py            # Admin panel
│   └── urls.py             # Journey endpoints
│
└── yatri_backend/          # Main project settings
    ├── settings.py         # Django settings (JWT, Redis, PostgreSQL)
    ├── urls.py             # Main URL configuration
    └── wsgi.py
```

---

## 🔐 Authentication & Roles

### JWT Authentication
- **Access Token**: 1 hour validity
- **Refresh Token**: 7 days validity
- **Header**: `Authorization: Bearer <access_token>`

### User Roles

| Role | Access Rights |
|------|--------------|
| **Admin** | Full system access via Django Admin |
| **Police** | Accident/congestion/route visibility via Django Admin |
| **Normal User** | View public vehicle routes only |
| **Private Vehicle Owner** | View own vehicle data only |
| **Government Vehicle Owner** | Same as private, vehicle type = government |

### Vehicle Types
- **Public**: Visible to everyone (buses, trains, etc.)
- **Private**: Only owner can view
- **Government**: Only owner can view

---

## 📡 API Endpoints

### Authentication (`/api/auth/`)
```
POST   /register/              - User registration
POST   /login/                 - Login (returns JWT tokens)
POST   /logout/                - Logout (blacklist refresh token)
POST   /refresh/               - Refresh access token
GET    /profile/               - Get current user profile
PUT    /profile/update/        - Update profile
PUT    /profile/change-password/ - Change password
GET    /vehicles/              - Get user's vehicles
POST   /vehicles/add/          - Add vehicle to account
```

### Navigate (`/api/navigate/`)
```
POST   /telemetry/             - Ingest telemetry from IoT devices
GET    /live-locations/        - Get live vehicle locations
GET    /live-locations/<id>/   - Get specific vehicle location
GET    /congestion/            - Get congestion data
GET    /crashes/               - Get crash events (Police/Admin)
GET    /crashes/<id>/          - Get crash detail
PATCH  /crashes/<id>/status/   - Update crash status
GET    /device-health/         - Get device health status
```

### Journey (`/api/journey/`)
```
POST   /start/                 - Start a new journey
POST   /<id>/end/              - End a journey
GET    /history/               - Get journey history (paginated)
GET    /<id>/                  - Get journey detail
GET    /public-routes/         - Get all public routes
GET    /routes/                - Get all routes (Police/Admin)
GET    /analytics/routes-sql/  - Route analytics (Raw SQL)
GET    /analytics/heatmap-sql/ - Congestion heatmap (Raw SQL)
GET    /analytics/density-sql/ - Vehicle density (Raw SQL)
```

---

## 🔍 Advanced Features

### 1. Pagination
- **Default Page Size**: 20 items
- **Query Param**: `?page=2&page_size=50`
- **Max Page Size**: 100
- Applied to: Journey history, routes, telemetry

### 2. Filtering
```
?start_date=2024-01-01          # Date range start
?end_date=2024-01-31            # Date range end
?vehicle_id=ABC123              # Filter by vehicle
?status=completed               # Filter by status
?severity=high                  # Filter by severity
```

### 3. Searching
```
?search=Delhi                   # Search in location/route names
```

### 4. Ordering
```
?ordering=start_time            # Ascending
?ordering=-speed                # Descending
```

### 5. Throttling (Rate Limiting)
- **Anonymous**: 100 requests/hour
- **Authenticated Users**: 1000 requests/hour
- **Telemetry Ingestion**: 10,000 requests/hour
- **Public API**: 500 requests/hour

### 6. Caching (Redis)
- **Live Data**: 10 seconds TTL
- **Public Routes**: 5 minutes TTL
- **Analytics**: 1 hour TTL
- **Congestion**: 5 minutes TTL

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- PostgreSQL 15+
- Redis 7+

### 1. Clone Repository
```bash
cd yatri_backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb yatriconnect_db

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser
```bash
python manage.py createsuperuser
```

### 5. Start Redis
```bash
redis-server
```

### 6. Run Server
```bash
python manage.py runserver
```

### 7. Access Admin Panel
```
http://localhost:8000/admin/
```

---

## 📊 Database Design

### Key Models

#### User (Custom)
- Fields: username, email, role, phone, emergency_contact
- Indexes: role, username, email

#### Vehicle
- Fields: vehicle_id, owner, vehicle_type, make, model
- Indexes: vehicle_type, owner, vehicle_id

#### Device (IoT)
- Fields: device_id, vehicle, status, firmware_version, last_ping
- Indexes: device_id, vehicle, last_ping

#### Telemetry
- Fields: device, timestamp, lat/lon, speed, acceleration
- Indexes: device+timestamp, lat/lon, timestamp

#### Journey
- Fields: journey_id, vehicle, route, start/end locations, statistics
- Indexes: vehicle+start_time, route, status

#### Route
- Fields: route_id, name, start/end locations, is_public, trip_count
- Indexes: route_id, is_public, lat/lon

### Query Optimization
- **select_related()**: For ForeignKey (single query with JOIN)
- **prefetch_related()**: For reverse relations (separate queries)
- **Database Indexing**: On frequently queried fields

---

## 🔥 Public Route Detection

### Logic
1. **Monitor Journeys**: Track all completed public vehicle trips
2. **Detect Patterns**: Find repeated trips with same start/end (within 50m)
3. **Count Trips**: Increment trip_count for matching routes
4. **Mark Public**: If trip_count >= 5, mark route as public
5. **Calculate Stats**: Update average speed and duration

### Configuration (settings.py)
```python
PUBLIC_ROUTE_CONFIG = {
    'min_trip_count': 5,        # Minimum trips to mark as public
    'location_threshold': 50,   # meters
}
```

---

## 📈 Raw SQL Examples

### Route Analytics
```python
# File: Journey/views.py -> get_route_analytics_raw_sql()
# Demonstrates: Aggregation, JOINs, GROUP BY
SELECT r.route_id, COUNT(j.id) as journey_count,
       AVG(j.average_speed) as avg_speed
FROM routes r
LEFT JOIN journeys j ON j.route_id = r.id
WHERE r.is_public = true
GROUP BY r.id
ORDER BY journey_count DESC
```

### Congestion Heatmap
```python
# File: Journey/views.py -> get_congestion_heatmap_raw_sql()
# Demonstrates: Geospatial grouping, INTERVAL, MODE()
SELECT ROUND(latitude::numeric, 2) as lat_grid,
       AVG(average_speed), SUM(vehicle_count)
FROM congestion
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY lat_grid, lon_grid
```

---

## 🛡️ Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Role-Based Access**: Decorators enforce permissions
3. **Password Hashing**: Django's built-in PBKDF2
4. **CORS Configured**: Cross-origin request handling
5. **Throttling**: Rate limiting prevents abuse
6. **SQL Injection Prevention**: Parameterized queries

---

## 📝 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_pass",
    "password2": "secure_pass",
    "role": "private_vehicle_owner"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_pass"
  }'
```

### Ingest Telemetry
```bash
curl -X POST http://localhost:8000/api/navigate/telemetry/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE123",
    "timestamp": "2024-01-15T10:30:00Z",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "speed": 15.5,
    "accel_x": 0.5,
    "accel_y": 0.3,
    "accel_z": 9.8
  }'
```

### Get Live Locations
```bash
curl -X GET "http://localhost:8000/api/navigate/live-locations/?vehicle_type=public" \
  -H "Authorization: Bearer <access_token>"
```

---

## 🎓 Learning Resources

### Key Concepts Demonstrated
1. **Function-Based Views**: Clean, explicit API handlers
2. **JWT Authentication**: Token-based auth flow
3. **Role-Based Access Control**: Custom decorators
4. **Database Indexing**: Performance optimization
5. **Raw SQL in Django**: Using `connection.cursor()`
6. **Redis Caching**: TTL-based caching strategies
7. **Pagination & Filtering**: DRF utilities
8. **Throttling**: Rate limiting implementation

### For Viva/Documentation
- All code is self-documenting with docstrings
- Flow explained in every view: Input → Process → Output
- No hidden magic - explicit URL patterns
- Raw SQL queries show database mastery

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Database connection error  
**Solution**: Check PostgreSQL is running and credentials in settings.py

**Issue**: Redis connection error  
**Solution**: Start Redis with `redis-server`

**Issue**: Token authentication fails  
**Solution**: Check Authorization header format: `Bearer <token>`

**Issue**: Migrations error  
**Solution**: Delete db and migration files, recreate: `python manage.py makemigrations`

---

## 📌 Important Notes

1. **Not for Production**: This is a learning/academic project
2. **Secret Key**: Change SECRET_KEY before any deployment
3. **Debug Mode**: DEBUG = True for development only
4. **Database Password**: Use environment variables in production
5. **CORS**: Currently allows all origins - restrict in production

---

## 🤝 Contributing

This is an academic project. Modifications should maintain:
- Function-based views only
- Clear documentation
- Explainable code structure
- Learning-oriented approach

---

## 📄 License

Educational/Academic Use Only

---

## 👥 Authors

YatriConnect Development Team  
Smart Mobility & Smart City Project

---

## 📞 Support

For academic queries and documentation:
- Review inline code comments
- Check docstrings in each function
- Refer to this README for architecture

---

**Built with ❤️ for Learning & Research**
