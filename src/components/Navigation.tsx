import React from 'react';
import { motion } from 'motion/react';
import { Navigation as NavIcon, MapPin, TrendingUp, Wifi, WifiOff, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function Navigation() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Map Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-96 bg-[#EDF2F7]"
      >
        {/* Map Placeholder with Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(73, 80, 87, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(73, 80, 87, 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Simulated Route Line */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M 50 350 Q 150 280, 200 200 T 350 80"
            stroke="url(#gradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4DA8DA" />
              <stop offset="100%" stopColor="#73C2FB" />
            </linearGradient>
          </defs>
        </svg>

        {/* Current Location Marker */}
        <motion.div
          className="absolute top-32 right-16"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#4DA8DA] rounded-full blur-xl opacity-50" />
            <div className="relative bg-[#4DA8DA] rounded-full p-3 border-4 border-white shadow-xl">
              <NavIcon size={20} className="text-white" fill="white" />
            </div>
          </div>
        </motion.div>

        {/* GPS Mode Indicator */}
        <div className="absolute top-14 left-5 right-5">
          <GlassCard className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-full bg-[#51CF66]/10">
              <Wifi size={18} className="text-[#2F9E44]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[#343A40] text-sm font-semibold">GPS + Offline Mode Active</p>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Navigation Details */}
      <div className="px-5 py-6 space-y-4">
        {/* Primary Direction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4DA8DA]/20 to-[#73C2FB]/20 border border-[#4DA8DA]/20">
                <TrendingUp size={32} className="text-[#4DA8DA]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-[#6C757D] text-sm mb-1">In 450 meters</p>
                <h2 className="text-[#343A40]">Turn right on MG Road</h2>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#E9ECEF]">
              <div>
                <p className="text-[#6C757D] text-sm mb-1">ETA</p>
                <p className="text-[#343A40] font-semibold">12:45 PM</p>
              </div>
              <div className="text-center">
                <p className="text-[#6C757D] text-sm mb-1">Distance</p>
                <p className="text-[#343A40] font-semibold">8.3 km</p>
              </div>
              <div className="text-right">
                <p className="text-[#6C757D] text-sm mb-1">Time</p>
                <p className="text-[#343A40] font-semibold">18 min</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Route Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-[#343A40]">Alternative Routes</h3>
          <RouteOption
            name="Via Highway"
            time="15 min"
            distance="12.1 km"
            tag="Fastest"
            tagColor="green"
          />
          <RouteOption
            name="Avoid Tolls"
            time="22 min"
            distance="9.8 km"
            tag="Scenic"
            tagColor="blue"
          />
        </motion.div>

        {/* Journey Recording */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassCard className="p-5 border-l-4 border-[#FFB547]">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-[#FFB547]/10">
                <Clock size={24} className="text-[#FFB547]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <p className="text-[#343A40] font-semibold mb-1">Journey Recording</p>
                <p className="text-[#6C757D] text-sm leading-relaxed">
                  Your trip is being automatically logged with GPS and sensor data.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function RouteOption({ name, time, distance, tag, tagColor }: {
  name: string;
  time: string;
  distance: string;
  tag: string;
  tagColor: string;
}) {
  const colorClasses = {
    green: 'bg-[#51CF66]/10 border-[#51CF66]/30 text-[#2F9E44]',
    blue: 'bg-[#4DA8DA]/10 border-[#4DA8DA]/30 text-[#1971C2]'
  };

  return (
    <button className="w-full text-left touch-manipulation active:scale-98 transition-transform duration-200">
      <GlassCard className="p-4 hover:bg-[#E9ECEF]/40 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-[#4DA8DA]" strokeWidth={2} />
            <div>
              <p className="text-[#343A40] font-semibold mb-1">{name}</p>
              <p className="text-[#6C757D] text-sm">{distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[#343A40] font-semibold">{time}</p>
            <div className={`px-2 py-1 rounded-full border ${colorClasses[tagColor as keyof typeof colorClasses]}`}>
              <p className="text-xs font-semibold">{tag}</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </button>
  );
}
