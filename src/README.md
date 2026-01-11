# YatriConnect - Smart Mobility Platform

Premium iOS mobile application for next-generation smart mobility and vehicle safety platform combining live navigation, journey memory, theft detection, and crash intelligence.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- VS Code (recommended)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open in browser:**
Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📱 Features

- **Authentication System**
  - Login with email/password
  - Signup with profile creation
  - Biometric authentication support
  - Password strength validation

- **Live Navigation**
  - Interactive OpenStreetMap with Leaflet
  - Real-time GPS tracking (NEO-6M)
  - Route visualization
  - SOS emergency button
  - Location recenter

- **Journey Tracking**
  - Daily trip memory
  - Journey statistics
  - Location history

- **Analytics Dashboard**
  - Travel insights
  - Safety metrics
  - Performance data

- **Settings & Privacy**
  - Device status monitoring
  - Alert sensitivity controls
  - Emergency contacts management
  - Data privacy settings
  - Account management

- **Safety Features**
  - Crash detection (MPU6050 IMU)
  - Theft detection
  - Emergency SOS
  - Auto-call emergency services

## 🎨 Design System

- **Colors:**
  - Background: `#FAF6F1` (Creamy)
  - Primary: `#4DA8DA` (Sky Blue)
  - Warning: `#FFB547` (Amber)
  - Alert: `#FF6B6B` (Coral Red)
  - Success: `#51CF66` (Green)

- **UI Style:** iOS glassmorphism with backdrop blur
- **Target Device:** iPhone XS Max (414 × 896)
- **Navigation:** Bottom tab bar + floating user avatar

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Maps:** Leaflet + React Leaflet
- **Build Tool:** Vite

## 🔧 Hardware Integration

- **ESP32 Controller:** Main processing unit
- **GPS NEO-6M:** Location tracking with IMU fallback
- **MPU6050 IMU:** Accelerometer + Gyroscope for crash detection
- **Sensors:** Real-time motion and position sensing

## 📂 Project Structure

```
/
├── App.tsx              # Main app component with auth flow
├── components/
│   ├── Login.tsx        # Login screen
│   ├── Signup.tsx       # Signup screen
│   ├── Home.tsx         # Home dashboard
│   ├── LiveNavigation.tsx  # Map & navigation
│   ├── Journey.tsx      # Trip history
│   ├── Analytics.tsx    # Insights dashboard
│   ├── Settings.tsx     # App settings
│   ├── CrashDetection.tsx  # Crash alert overlay
│   ├── TheftDetection.tsx  # Theft alert overlay
│   ├── YatriConnectLogo.tsx  # Animated logo
│   └── GlassCard.tsx    # Reusable glass card
├── styles/
│   └── globals.css      # Global styles + Tailwind
└── package.json         # Dependencies

```

## 🔐 Security & Privacy

- End-to-end encryption for crash data
- Local data processing
- No PII collection
- User-controlled data sharing
- Secure biometric authentication

## 📱 Responsive Design

Optimized for:
- iPhone XS Max (414 × 896)
- iOS Safari
- Touch-friendly interactions
- Bottom-reachable navigation

## 🚨 Emergency Features

- **SOS Button:** One-tap emergency call
- **Auto-Detect:** Automatic crash detection
- **Emergency Contacts:** Quick notification system
- **Location Sharing:** Real-time position sharing

## 📄 License

Proprietary - All rights reserved

## 👨‍💻 Development

**Login Credentials (Demo):**
- Any email/password combination works (mock auth)
- Default user: Rajesh Kumar

**Test Features:**
- Use GPS status buttons in Settings to simulate sensor states
- Test crash detection from Navigation screen
- Explore glassmorphism UI effects

---

Built with ❤️ for smart mobility and vehicle safety
