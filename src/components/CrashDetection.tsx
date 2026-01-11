import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle,
  MapPin,
  Navigation,
  Phone,
  X,
  TrendingUp,
  Shield,
  ArrowLeft
} from 'lucide-react';

interface CrashDetectionProps {
  onDismiss: () => void;
}

export function CrashDetection({ onDismiss }: CrashDetectionProps) {
  const [countdown, setCountdown] = useState(30);
  const [impactForce, setImpactForce] = useState(8.4); // G-force
  const [impactDirection, setImpactDirection] = useState('Front-Right');
  const [vehicleTilt, setVehicleTilt] = useState(42); // degrees
  const [vehicleRoll, setVehicleRoll] = useState(38); // degrees
  const [isEmergencySent, setIsEmergencySent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-trigger emergency after countdown
          handleEmergency();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSafe = () => {
    onDismiss();
  };

  const handleEmergency = () => {
    setIsEmergencySent(true);
    // In real app: trigger emergency services API
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A] flex flex-col overflow-hidden">
      {/* Back Button - Top Left */}
      <motion.button
        onClick={onDismiss}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-6 left-5 z-50 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all touch-manipulation"
      >
        <ArrowLeft size={24} strokeWidth={2.5} />
      </motion.button>

      <div className="flex-1 overflow-y-auto px-5 py-20">
        <div className="flex flex-col items-center justify-start min-h-full">
          {/* Countdown Timer - Prominent & Centered */}
          <motion.div
            className="relative mb-8 z-20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <svg width="240" height="240" className="transform -rotate-90">
              <circle
                cx="120"
                cy="120"
                r="110"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              <motion.circle
                cx="120"
                cy="120"
                r="110"
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: countdown / 30 }}
                transition={{ duration: 0.5 }}
                style={{
                  strokeDasharray: 2 * Math.PI * 110,
                  strokeDashoffset: 0
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="text-7xl font-bold text-white mb-2">{countdown}</div>
                <div className="text-white/80 text-sm">seconds</div>
              </motion.div>
            </div>

            {/* Pulsing Alert Icon in Background */}
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0 rounded-full border-4 border-[#FF6B6B]"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 2.5],
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Alert Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8 z-10"
          >
            <AlertTriangle size={64} className="text-[#FF6B6B] mx-auto mb-4" strokeWidth={2.5} />
            <h1 className="text-white text-3xl font-bold mb-2">CRASH DETECTED</h1>
            <p className="text-[#FF6B6B] text-sm font-semibold">Emergency Response Active</p>
          </motion.div>

          {/* Impact Data Cards */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Impact Force */}
              <div className="relative overflow-hidden rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 p-5">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={20} className="text-[#FFB547]" strokeWidth={2.5} />
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Impact Force</p>
                  </div>
                  <p className="text-white text-4xl font-bold mb-1">{impactForce}G</p>
                  <p className="text-white/60 text-xs">High severity</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFB547]/10 to-transparent pointer-events-none" />
              </div>

              {/* Direction */}
              <div className="relative overflow-hidden rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 p-5">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation size={20} className="text-[#4DA8DA]" strokeWidth={2.5} />
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Direction</p>
                  </div>
                  <p className="text-white text-2xl font-bold mb-1">{impactDirection}</p>
                  <p className="text-white/60 text-xs">Point of impact</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#4DA8DA]/10 to-transparent pointer-events-none" />
              </div>

              {/* Vehicle Tilt */}
              <div className="relative overflow-hidden rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 p-5">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={20} className="text-[#FF6B6B]" strokeWidth={2.5} />
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Vehicle Tilt</p>
                  </div>
                  <p className="text-white text-4xl font-bold mb-1">{vehicleTilt}°</p>
                  <p className="text-white/60 text-xs">Forward angle</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-transparent pointer-events-none" />
              </div>

              {/* Vehicle Roll */}
              <div className="relative overflow-hidden rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 p-5">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={20} className="text-[#FF6B6B]" strokeWidth={2.5} />
                    <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Vehicle Roll</p>
                  </div>
                  <p className="text-white text-4xl font-bold mb-1">{vehicleRoll}°</p>
                  <p className="text-white/60 text-xs">Side angle</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Location - Full Width */}
            <div className="relative overflow-hidden rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 p-5 mt-3">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={20} className="text-[#51CF66]" strokeWidth={2.5} />
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wide">Last Known Location</p>
                </div>
                <p className="text-white text-xl font-bold mb-1">28.6139°N, 77.2090°E</p>
                <p className="text-white/60 text-sm">Connaught Place, New Delhi</p>
                <p className="text-white/40 text-xs mt-2">GPS signal: Strong • Accuracy: ±5m</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#51CF66]/10 to-transparent pointer-events-none" />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <AnimatePresence mode="wait">
            {!isEmergencySent ? (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {/* I am Safe Button - LARGE */}
                <motion.button
                  onClick={handleSafe}
                  className="w-full h-24 rounded-[32px] bg-gradient-to-br from-[#51CF66] to-[#2F9E44] shadow-[0_12px_48px_rgba(81,207,102,0.5)] border-4 border-white/40 relative overflow-hidden touch-manipulation"
                  whileTap={{ scale: 0.96 }}
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-xl" />
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                    <X size={40} className="text-white" strokeWidth={3} />
                    <span className="text-white text-3xl font-black tracking-tight">I AM SAFE</span>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                </motion.button>

                {/* Emergency Help Button - LARGE */}
                <motion.button
                  onClick={handleEmergency}
                  className="w-full h-24 rounded-[32px] bg-gradient-to-br from-[#FF6B6B] to-[#E03131] shadow-[0_12px_48px_rgba(255,107,107,0.6)] border-4 border-white/40 relative overflow-hidden touch-manipulation"
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      '0 12px 48px rgba(255,107,107,0.6)',
                      '0 12px 64px rgba(255,107,107,0.9)',
                      '0 12px 48px rgba(255,107,107,0.6)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-xl" />
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                    <Phone size={40} className="text-white" strokeWidth={3} />
                    <span className="text-white text-2xl font-black tracking-tight">SEND EMERGENCY HELP</span>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                </motion.button>

                {/* Countdown Warning */}
                <motion.div
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <p className="text-white text-lg font-bold">
                    Auto-sending help in {countdown}s
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    Emergency services will be contacted automatically
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#51CF66] to-[#2F9E44] mx-auto shadow-[0_0_48px_rgba(81,207,102,0.6)]"
                >
                  <Phone size={64} className="text-white" strokeWidth={2.5} />
                </motion.div>
                
                <div>
                  <h2 className="text-white text-4xl font-black mb-3">Help is Coming</h2>
                  <p className="text-white/90 text-xl font-semibold mb-2">
                    Emergency services notified
                  </p>
                  <p className="text-white/70 text-lg">
                    ETA: 8-12 minutes
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                  <p className="text-white text-sm font-semibold mb-2">
                    ✓ Location shared with responders
                  </p>
                  <p className="text-white text-sm font-semibold mb-2">
                    ✓ Medical team dispatched
                  </p>
                  <p className="text-white text-sm font-semibold">
                    ✓ Emergency contacts notified
                  </p>
                </div>

                <button
                  onClick={handleSafe}
                  className="mt-8 px-12 py-5 rounded-full bg-white/15 backdrop-blur-xl border-2 border-white/30 text-white text-xl font-bold hover:bg-white/20 transition-all touch-manipulation"
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}