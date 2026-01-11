import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Phone, 
  AlertTriangle,
  Activity,
  Navigation,
  Bell,
  Lock,
  Unlock,
  PhoneCall,
  Radio,
  TrendingUp,
  Move
} from 'lucide-react';
import { GlassCard } from './GlassCard';

type SecurityStatus = 'armed' | 'suspicious' | 'theft';

export function TheftDetection() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>('armed');
  const [tiltAngle, setTiltAngle] = useState(0);
  const [vibrationLevel, setVibrationLevel] = useState(0);
  const [isOwnerNearby, setIsOwnerNearby] = useState(true);
  const [motionData, setMotionData] = useState<number[]>(Array(20).fill(0));

  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate accelerometer readings
      const newVibration = Math.random() * (securityStatus === 'theft' ? 100 : securityStatus === 'suspicious' ? 50 : 10);
      const newTilt = Math.random() * (securityStatus === 'theft' ? 45 : securityStatus === 'suspicious' ? 15 : 5);
      
      setVibrationLevel(newVibration);
      setTiltAngle(newTilt);
      
      // Update motion graph
      setMotionData(prev => [...prev.slice(1), newVibration]);
    }, 500);

    return () => clearInterval(interval);
  }, [securityStatus]);

  const statusConfig = {
    armed: {
      color: '#51CF66',
      bgColor: 'bg-[#51CF66]',
      borderColor: 'border-[#51CF66]',
      textColor: 'text-[#2F9E44]',
      ringColor: '#51CF66',
      title: 'Armed & Stationary',
      description: 'Your vehicle is secure and being monitored',
      icon: <Shield size={32} className="text-[#51CF66]" strokeWidth={2} />
    },
    suspicious: {
      color: '#FFB547',
      bgColor: 'bg-[#FFB547]',
      borderColor: 'border-[#FFB547]',
      textColor: 'text-[#E67700]',
      ringColor: '#FFB547',
      title: 'Suspicious Activity',
      description: 'Unusual vibration detected near your vehicle',
      icon: <AlertTriangle size={32} className="text-[#FFB547]" strokeWidth={2} />
    },
    theft: {
      color: '#FF6B6B',
      bgColor: 'bg-[#FF6B6B]',
      borderColor: 'border-[#FF6B6B]',
      textColor: 'text-[#E03131]',
      ringColor: '#FF6B6B',
      title: 'THEFT CONFIRMED',
      description: 'Unauthorized movement detected! Take action immediately',
      icon: <Bell size={32} className="text-[#FF6B6B]" strokeWidth={2} />
    }
  };

  const config = statusConfig[securityStatus];

  const alerts = [
    {
      id: 1,
      type: 'info',
      message: 'Security system armed',
      time: '2 mins ago',
      icon: <Lock size={16} className="text-[#51CF66]" />
    },
    {
      id: 2,
      type: 'warning',
      message: 'Minor vibration detected',
      time: '15 mins ago',
      icon: <Activity size={16} className="text-[#FFB547]" />
    },
    {
      id: 3,
      type: 'info',
      message: 'Owner proximity verified',
      time: '1 hour ago',
      icon: <Radio size={16} className="text-[#4DA8DA]" />
    }
  ];

  return (
    <div className="h-full overflow-y-auto px-5 pt-16 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-[#343A40] mb-2">Theft Detection</h1>
        <p className="text-[#6C757D]">Real-time two-wheeler security monitoring</p>
      </motion.div>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <GlassCard className={`p-4 border-2 ${config.borderColor}`}>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                scale: securityStatus === 'theft' ? [1, 1.1, 1] : 1 
              }}
              transition={{ duration: 0.5, repeat: securityStatus === 'theft' ? Infinity : 0 }}
            >
              {config.icon}
            </motion.div>
            <div className="flex-1">
              <h3 className={`${config.textColor} font-semibold mb-0.5`}>
                {config.title}
              </h3>
              <p className="text-[#6C757D] text-sm">{config.description}</p>
            </div>
            <motion.div
              className={`w-3 h-3 rounded-full ${config.bgColor}`}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Vehicle Illustration with Security Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mb-6"
      >
        <GlassCard className="p-8 overflow-hidden">
          <div className="relative w-full aspect-square max-w-sm mx-auto">
            {/* Animated Security Rings */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={config.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={config.color} stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Outer pulsing ring */}
              <motion.circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke={config.color}
                strokeWidth="2"
                opacity="0.2"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: [0.9, 1, 0.9],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Main security ring */}
              <motion.circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="4"
                strokeDasharray={securityStatus === 'armed' ? "0" : "10 5"}
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  rotate: securityStatus !== 'armed' ? 360 : 0
                }}
                transition={{ 
                  pathLength: { duration: 1 },
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                }}
              />

              {/* Inner status indicators */}
              {[0, 90, 180, 270].map((angle, index) => (
                <motion.circle
                  key={angle}
                  cx="50%"
                  cy="50%"
                  r="2"
                  fill={config.color}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                  style={{
                    transform: `rotate(${angle}deg) translateY(-40%)`,
                    transformOrigin: '50% 50%'
                  }}
                />
              ))}
            </svg>

            {/* Vehicle Illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  rotate: securityStatus === 'theft' ? [0, -2, 2, -2, 2, 0] : 0,
                  y: securityStatus === 'suspicious' ? [0, -5, 0] : 0
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: securityStatus !== 'armed' ? Infinity : 0
                }}
              >
                {/* Simplified bike/scooter illustration */}
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  {/* Bike body */}
                  <path
                    d="M 30 70 Q 40 50, 60 50 L 80 50 Q 85 50, 85 55 L 85 65 Q 85 70, 80 70 Z"
                    fill="#343A40"
                    stroke="#495057"
                    strokeWidth="2"
                  />
                  
                  {/* Seat */}
                  <rect x="50" y="40" width="25" height="8" rx="4" fill="#6C757D" />
                  
                  {/* Handlebars */}
                  <path
                    d="M 80 50 L 85 45 M 80 50 L 85 55"
                    stroke="#495057"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  
                  {/* Front wheel */}
                  <circle cx="85" cy="85" r="15" fill="none" stroke="#343A40" strokeWidth="4" />
                  <circle cx="85" cy="85" r="8" fill="#495057" />
                  
                  {/* Rear wheel */}
                  <circle cx="30" cy="85" r="15" fill="none" stroke="#343A40" strokeWidth="4" />
                  <circle cx="30" cy="85" r="8" fill="#495057" />
                  
                  {/* Stand */}
                  <path
                    d="M 35 70 L 35 90"
                    stroke="#6C757D"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Security indicator on bike */}
                  <motion.circle
                    cx="60"
                    cy="55"
                    r="5"
                    fill={config.color}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </svg>
              </motion.div>
            </div>

            {/* Status text overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className={`${config.textColor} font-semibold text-sm`}>
                {securityStatus === 'armed' ? 'Secure' : securityStatus === 'suspicious' ? 'Alert' : 'DANGER'}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Real-time Sensor Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-6 space-y-3"
      >
        <h3 className="text-[#343A40]">Live Sensor Data</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Tilt Angle */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#4DA8DA]/10">
                <Navigation size={18} className="text-[#4DA8DA]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-[#6C757D] text-xs mb-0.5">Tilt Angle</p>
                <p className="text-[#343A40] font-semibold">{tiltAngle.toFixed(1)}°</p>
              </div>
            </div>
            <div className="h-1 bg-[#E9ECEF] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${tiltAngle > 30 ? 'bg-[#FF6B6B]' : tiltAngle > 10 ? 'bg-[#FFB547]' : 'bg-[#51CF66]'}`}
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(tiltAngle * 2, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </GlassCard>

          {/* Vibration Level */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#6ACFCF]/10">
                <Activity size={18} className="text-[#6ACFCF]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-[#6C757D] text-xs mb-0.5">Vibration</p>
                <p className="text-[#343A40] font-semibold">{vibrationLevel.toFixed(0)}%</p>
              </div>
            </div>
            <div className="h-1 bg-[#E9ECEF] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${vibrationLevel > 70 ? 'bg-[#FF6B6B]' : vibrationLevel > 40 ? 'bg-[#FFB547]' : 'bg-[#51CF66]'}`}
                initial={{ width: '0%' }}
                animate={{ width: `${vibrationLevel}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </GlassCard>
        </div>

        {/* BLE Owner Presence */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isOwnerNearby ? 'bg-[#51CF66]/10' : 'bg-[#FF6B6B]/10'}`}>
                <Radio size={18} className={isOwnerNearby ? 'text-[#51CF66]' : 'text-[#FF6B6B]'} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[#6C757D] text-xs mb-0.5">Owner Proximity (BLE)</p>
                <p className="text-[#343A40] font-semibold">
                  {isOwnerNearby ? 'Verified Nearby' : 'Not Detected'}
                </p>
              </div>
            </div>
            <motion.div
              className={`w-3 h-3 rounded-full ${isOwnerNearby ? 'bg-[#51CF66]' : 'bg-[#FF6B6B]'}`}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Real-time Motion Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-6"
      >
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#343A40]">Motion Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4DA8DA] animate-pulse" />
              <span className="text-[#6C757D] text-xs">Live</span>
            </div>
          </div>

          {/* Accelerometer Graph */}
          <div className="h-32 relative">
            <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="motionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4DA8DA" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4DA8DA" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y}
                  stroke="#E9ECEF"
                  strokeWidth="1"
                />
              ))}

              {/* Motion graph area */}
              <motion.path
                d={`M 0 100 ${motionData.map((value, index) => {
                  const x = (index / (motionData.length - 1)) * 400;
                  const y = 100 - value;
                  return `L ${x} ${y}`;
                }).join(' ')} L 400 100 Z`}
                fill="url(#motionGradient)"
              />

              {/* Motion graph line */}
              <motion.path
                d={`M ${motionData.map((value, index) => {
                  const x = (index / (motionData.length - 1)) * 400;
                  const y = 100 - value;
                  return `${x} ${y}`;
                }).join(' L ')}`}
                fill="none"
                stroke="#4DA8DA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#6C757D] -ml-8">
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
          </div>

          <p className="text-[#6C757D] text-xs mt-2 text-center">
            Last 10 seconds · Updates every 500ms
          </p>
        </GlassCard>
      </motion.div>

      {/* Emergency Actions - Only visible for suspicious/theft */}
      <AnimatePresence>
        {securityStatus !== 'armed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-6 space-y-3"
          >
            <h3 className={config.textColor}>Immediate Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-5 rounded-2xl bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 touch-manipulation">
                <PhoneCall size={24} className="text-white mb-2" strokeWidth={2} />
                <p className="text-white font-semibold text-sm">Call Owner</p>
              </button>

              <button className="p-5 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#E03131] shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 touch-manipulation">
                <Bell size={24} className="text-white mb-2" strokeWidth={2} />
                <p className="text-white font-semibold text-sm">Notify Police</p>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Alerts Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="space-y-3"
      >
        <h3 className="text-[#343A40]">Recent Alerts</h3>
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#E9ECEF]">
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[#343A40] text-sm font-medium">{alert.message}</p>
                  <p className="text-[#6C757D] text-xs mt-0.5">{alert.time}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Test Controls - For demo purposes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 pt-6 border-t border-[#E9ECEF]"
      >
        <p className="text-[#6C757D] text-xs mb-3 text-center">Demo Controls</p>
        <div className="flex gap-2">
          <button
            onClick={() => setSecurityStatus('armed')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              securityStatus === 'armed'
                ? 'bg-[#51CF66] text-white'
                : 'bg-[#E9ECEF] text-[#6C757D]'
            }`}
          >
            Armed
          </button>
          <button
            onClick={() => setSecurityStatus('suspicious')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              securityStatus === 'suspicious'
                ? 'bg-[#FFB547] text-white'
                : 'bg-[#E9ECEF] text-[#6C757D]'
            }`}
          >
            Suspicious
          </button>
          <button
            onClick={() => setSecurityStatus('theft')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              securityStatus === 'theft'
                ? 'bg-[#FF6B6B] text-white'
                : 'bg-[#E9ECEF] text-[#6C757D]'
            }`}
          >
            Theft
          </button>
        </div>
      </motion.div>
    </div>
  );
}
