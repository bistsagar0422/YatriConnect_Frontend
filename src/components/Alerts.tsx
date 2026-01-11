import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertTriangle, Zap, Bell, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { GlassCard } from './GlassCard';

export function Alerts() {
  const activeAlerts = [
    {
      id: 1,
      type: 'crash',
      title: 'Crash Detection Active',
      description: 'Automatic emergency response enabled. Will contact services if impact detected.',
      icon: <Zap size={24} className="text-[#4DA8DA]" />,
      color: 'blue',
      status: 'active',
      time: 'Now'
    },
    {
      id: 2,
      type: 'theft',
      title: 'Anti-Theft Protection',
      description: 'Vehicle is being monitored 24/7. You\'ll be alerted of any unauthorized movement.',
      icon: <ShieldAlert size={24} className="text-[#6ACFCF]" />,
      color: 'mint',
      status: 'active',
      time: 'Now'
    }
  ];

  const recentAlerts = [
    {
      id: 3,
      type: 'warning',
      title: 'Unusual Movement Detected',
      description: 'Your vehicle moved 50m while parked. Location: Sector 18 Parking.',
      icon: <AlertTriangle size={20} className="text-[#FFB547]" />,
      color: 'amber',
      status: 'resolved',
      time: '2 hours ago'
    },
    {
      id: 4,
      type: 'info',
      title: 'Parking Location Saved',
      description: 'Vehicle parked at City Mall, Level 3, Zone B.',
      icon: <MapPin size={20} className="text-[#4DA8DA]" />,
      color: 'blue',
      status: 'info',
      time: 'Yesterday, 6:45 PM'
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
        <h1 className="text-[#343A40] mb-2">Safety & Alerts</h1>
        <p className="text-[#6C757D]">Real-time security and incident monitoring</p>
      </motion.div>

      {/* Safety Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-6 border-2 border-[#51CF66]/20 bg-[#51CF66]/5">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-[#51CF66]/10">
              <CheckCircle size={32} className="text-[#51CF66]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-[#343A40] mb-2">All Systems Secure</h2>
              <p className="text-[#495057] text-sm leading-relaxed mb-4">
                Your vehicle is protected with crash detection, theft alerts, and continuous GPS tracking.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#51CF66] animate-pulse" />
                <p className="text-[#2F9E44] text-sm font-semibold">Active Monitoring</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Active Protection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6 space-y-4"
      >
        <h3 className="text-[#343A40]">Active Protection</h3>
        {activeAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <AlertCard alert={alert} />
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-4"
      >
        <h3 className="text-[#343A40]">Recent Activity</h3>
        {recentAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <AlertCard alert={alert} compact />
          </motion.div>
        ))}
      </motion.div>

      {/* Emergency Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8"
      >
        <button className="w-full rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#E03131] p-6 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 touch-manipulation border border-[#FF6B6B]/20">
          <div className="flex items-center justify-center gap-3">
            <Bell size={24} className="text-white" strokeWidth={2} />
            <p className="text-white font-semibold">Emergency SOS</p>
          </div>
          <p className="text-white/90 text-sm mt-2">
            Press and hold to trigger emergency response
          </p>
        </button>
      </motion.div>
    </div>
  );
}

function AlertCard({ alert, compact = false }: { alert: any; compact?: boolean }) {
  const colorClasses = {
    blue: {
      bg: 'bg-[#4DA8DA]/10',
      border: 'border-[#4DA8DA]/20',
      text: 'text-[#1971C2]'
    },
    mint: {
      bg: 'bg-[#6ACFCF]/10',
      border: 'border-[#6ACFCF]/20',
      text: 'text-[#0B7285]'
    },
    amber: {
      bg: 'bg-[#FFB547]/10',
      border: 'border-[#FFB547]/20',
      text: 'text-[#E67700]'
    }
  };

  const colors = colorClasses[alert.color as keyof typeof colorClasses];

  return (
    <GlassCard className={`p-5 ${alert.status === 'active' ? `border-l-4 ${colors.border}` : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-${compact ? '2' : '3'} rounded-2xl ${colors.bg}`}>
          {alert.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <p className={`text-[#343A40] ${compact ? 'text-sm' : ''} font-semibold`}>{alert.title}</p>
            {alert.status === 'active' && (
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.bg} animate-pulse`} />
              </div>
            )}
          </div>
          <p className={`text-[#6C757D] ${compact ? 'text-xs' : 'text-sm'} leading-relaxed mb-2`}>
            {alert.description}
          </p>
          <p className="text-[#ADB5BD] text-xs">{alert.time}</p>
        </div>
      </div>
    </GlassCard>
  );
}
