import React from 'react';
import { motion } from 'motion/react';
import { CarFront, Battery, Shield, MapPin, TrendingUp, Zap, User } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';

export function Home() {
  return (
    <div className="h-full overflow-y-auto px-5 pt-16 pb-8">
      {/* User Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          {/* User Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] flex items-center justify-center shadow-lg border-4 border-white/70">
              <User size={32} className="text-white" strokeWidth={2} />
            </div>
            {/* Active Status Indicator */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#51CF66] rounded-full border-4 border-white/70 shadow-md" />
          </div>

          {/* Welcome Message */}
          <div className="flex-1">
            <p className="text-[#6C757D] text-sm mb-1">Welcome back,</p>
            <h1 className="text-[#343A40] mb-1">Rajesh Kumar</h1>
            <p className="text-[#4DA8DA] text-sm font-semibold">Safe Driver • 87 Score</p>
          </div>
        </div>
        
        <StatusBadge status="safe" />
      </motion.div>

      {/* Primary Vehicle Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CarFront size={24} className="text-[#4DA8DA]" strokeWidth={2} />
                <h2 className="text-[#343A40]">Honda Civic</h2>
              </div>
              <p className="text-[#6C757D] text-sm">DL 01 AB 1234</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#51CF66]/10 border border-[#51CF66]/30">
              <p className="text-[#2F9E44] text-sm font-semibold">Secure</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatItem
              icon={<Battery size={20} className="text-[#4DA8DA]" />}
              label="Battery"
              value="87%"
            />
            <StatItem
              icon={<Shield size={20} className="text-[#6ACFCF]" />}
              label="Protection"
              value="Active"
            />
            <StatItem
              icon={<MapPin size={20} className="text-[#FFB547]" />}
              label="Location"
              value="Tracked"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* Live Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4 mb-6"
      >
        {/* Trip Summary */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#4DA8DA]/20 to-[#73C2FB]/20 border border-[#4DA8DA]/20">
                <TrendingUp size={24} className="text-[#4DA8DA]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[#6C757D] text-sm mb-1">Today's Travel</p>
                <p className="text-[#343A40] font-semibold">42.3 km</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#6C757D] text-sm mb-1">Duration</p>
              <p className="text-[#343A40] font-semibold">1h 23m</p>
            </div>
          </div>
        </GlassCard>

        {/* Security Alert */}
        <GlassCard className="p-5 border-l-4 border-[#4DA8DA]">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-[#4DA8DA]/10">
              <Zap size={24} className="text-[#4DA8DA]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[#343A40] font-semibold mb-1">Crash Detection Active</p>
              <p className="text-[#6C757D] text-sm leading-relaxed">
                Emergency services will be notified automatically if an impact is detected.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="text-[#343A40] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            label="Start Journey"
            gradient="from-[#4DA8DA] to-[#73C2FB]"
            icon={<MapPin size={24} />}
          />
          <ActionButton
            label="Lock Vehicle"
            gradient="from-[#6ACFCF] to-[#51CF66]"
            icon={<Shield size={24} />}
          />
        </div>
      </motion.div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-[#6C757D] text-xs mb-1">{label}</p>
      <p className="text-[#343A40] text-sm font-semibold">{value}</p>
    </div>
  );
}

function ActionButton({ label, gradient, icon }: { label: string; gradient: string; icon: React.ReactNode }) {
  return (
    <button className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-left shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 min-h-[88px] touch-manipulation`}>
      <div className="relative z-10">
        <div className="text-white mb-2">{icon}</div>
        <p className="text-white font-semibold">{label}</p>
      </div>
      <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300" />
    </button>
  );
}