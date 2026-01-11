import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Clock,
  Navigation,
  Zap,
  Gauge,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar
} from 'lucide-react';
import { GlassCard } from './GlassCard';

export function Analytics() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Analytics data
  const behaviorScore = 87;
  const weeklyDistance = [12.4, 18.2, 15.7, 22.1, 19.8, 24.3, 20.5];
  const harshEvents = {
    braking: 12,
    acceleration: 8,
    cornering: 5
  };
  const idleRatio = 22; // percentage
  const movementRatio = 78; // percentage

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="h-full overflow-y-auto px-5 pt-16 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-[#343A40] mb-2">Analytics & Insights</h1>
        <p className="text-[#6C757D]">Track your driving behavior and performance</p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex gap-2 mb-6"
      >
        <button
          onClick={() => setTimeRange('week')}
          className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${
            timeRange === 'week'
              ? 'bg-[#4DA8DA] text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-xl text-[#6C757D] border border-white/40'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 ${
            timeRange === 'month'
              ? 'bg-[#4DA8DA] text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-xl text-[#6C757D] border border-white/40'
          }`}
        >
          This Month
        </button>
      </motion.div>

      {/* Behavior Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <BehaviorScoreCard score={behaviorScore} />
      </motion.div>

      {/* Distance Trends Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6"
      >
        <DistanceTrendsCard
          data={weeklyDistance}
          isExpanded={expandedCard === 'distance'}
          onToggle={() => toggleCard('distance')}
        />
      </motion.div>

      {/* Harsh Events Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-6"
      >
        <HarshEventsCard
          events={harshEvents}
          isExpanded={expandedCard === 'events'}
          onToggle={() => toggleCard('events')}
        />
      </motion.div>

      {/* Idle vs Movement Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-6"
      >
        <IdleMovementCard
          idleRatio={idleRatio}
          movementRatio={movementRatio}
          isExpanded={expandedCard === 'idle'}
          onToggle={() => toggleCard('idle')}
        />
      </motion.div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="space-y-3"
      >
        <h3 className="text-[#343A40] mb-4">Quick Insights</h3>
        <InsightCard
          icon={<Award size={20} className="text-[#51CF66]" />}
          title="Safe Driver Streak"
          value="12 days"
          trend="up"
          bgColor="bg-[#51CF66]/10"
        />
        <InsightCard
          icon={<Zap size={20} className="text-[#FFB547]" />}
          title="Avg Speed"
          value="42 km/h"
          trend="neutral"
          bgColor="bg-[#FFB547]/10"
        />
        <InsightCard
          icon={<Calendar size={20} className="text-[#4DA8DA]" />}
          title="Total Trips"
          value="28 trips"
          trend="up"
          bgColor="bg-[#4DA8DA]/10"
        />
      </motion.div>
    </div>
  );
}

function BehaviorScoreCard({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: '#51CF66', label: 'Excellent', text: 'text-[#2F9E44]' };
    if (score >= 60) return { color: '#FFB547', label: 'Good', text: 'text-[#E67700]' };
    return { color: '#FF6B6B', label: 'Needs Improvement', text: 'text-[#E03131]' };
  };

  const scoreConfig = getScoreColor(score);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[#6C757D] text-sm mb-1">Driving Behavior</p>
          <h2 className="text-[#343A40] text-xl font-semibold">Overall Score</h2>
        </div>
        <Gauge size={24} className="text-[#4DA8DA]" strokeWidth={2} />
      </div>

      <div className="flex items-center gap-8">
        {/* Radial Score Indicator */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="96"
              cy="96"
              r="90"
              fill="none"
              stroke="#E9ECEF"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <motion.circle
              cx="96"
              cy="96"
              r="90"
              fill="none"
              stroke={scoreConfig.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-center"
            >
              <p className={`text-6xl font-bold ${scoreConfig.text}`}>{score}</p>
              <p className="text-[#6C757D] text-sm mt-1">out of 100</p>
            </motion.div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="flex-1 space-y-3">
          <ScoreMetric label="Smooth Driving" value={92} color="#51CF66" />
          <ScoreMetric label="Speed Control" value={85} color="#4DA8DA" />
          <ScoreMetric label="Safe Distance" value={88} color="#6ACFCF" />
          <ScoreMetric label="Cornering" value={82} color="#FFB547" />
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-4 flex items-center gap-2">
        <div className={`px-4 py-2 rounded-full border ${
          score >= 80 ? 'bg-[#51CF66]/10 border-[#51CF66]/30' :
          score >= 60 ? 'bg-[#FFB547]/10 border-[#FFB547]/30' :
          'bg-[#FF6B6B]/10 border-[#FF6B6B]/30'
        }`}>
          <p className={`text-sm font-semibold ${scoreConfig.text}`}>
            {scoreConfig.label}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[#51CF66]">
          <TrendingUp size={16} strokeWidth={2.5} />
          <span className="text-sm font-semibold">+3 pts this week</span>
        </div>
      </div>
    </GlassCard>
  );
}

function ScoreMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[#6C757D] text-xs">{label}</p>
        <p className="text-[#343A40] text-sm font-semibold">{value}%</p>
      </div>
      <div className="h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function DistanceTrendsCard({ data, isExpanded, onToggle }: {
  data: number[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const maxValue = Math.max(...data);
  const totalDistance = data.reduce((sum, val) => sum + val, 0);
  const avgDistance = totalDistance / data.length;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left touch-manipulation active:bg-white/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#4DA8DA]/10">
              <TrendingUp size={24} className="text-[#4DA8DA]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[#6C757D] text-sm mb-1">Weekly Distance</p>
              <h3 className="text-[#343A40] text-xl font-semibold">
                {totalDistance.toFixed(1)} km
              </h3>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={24} className="text-[#6C757D]" />
          </motion.div>
        </div>

        {/* Mini line chart */}
        <div className="h-24 relative">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="distanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4DA8DA" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4DA8DA" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            <motion.path
              d={`M 0 100 ${data.map((value, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = 100 - ((value / maxValue) * 80);
                return `L ${x} ${y}`;
              }).join(' ')} L 400 100 Z`}
              fill="url(#distanceGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* Line */}
            <motion.path
              d={`M ${data.map((value, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = 100 - ((value / maxValue) * 80);
                return `${x} ${y}`;
              }).join(' L ')}`}
              fill="none"
              stroke="#4DA8DA"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />

            {/* Data points */}
            {data.map((value, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 100 - ((value / maxValue) * 80);
              return (
                <motion.circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#4DA8DA"
                  stroke="white"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                />
              );
            })}
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/40 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#E9ECEF]/50">
                  <p className="text-[#6C757D] text-xs mb-1">Daily Average</p>
                  <p className="text-[#343A40] text-2xl font-bold">{avgDistance.toFixed(1)} km</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#E9ECEF]/50">
                  <p className="text-[#6C757D] text-xs mb-1">Longest Trip</p>
                  <p className="text-[#343A40] text-2xl font-bold">{maxValue.toFixed(1)} km</p>
                </div>
              </div>

              {/* Daily breakdown */}
              <div className="space-y-2">
                <p className="text-[#343A40] font-semibold text-sm mb-3">Daily Breakdown</p>
                {data.map((value, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <p className="text-[#6C757D] text-sm w-12">{days[index]}</p>
                    <div className="flex-1 h-8 bg-[#E9ECEF] rounded-lg overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#4DA8DA] to-[#73C2FB] flex items-center justify-end pr-2"
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / maxValue) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      >
                        <span className="text-white text-xs font-semibold">{value.toFixed(1)} km</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function HarshEventsCard({ events, isExpanded, onToggle }: {
  events: { braking: number; acceleration: number; cornering: number };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const totalEvents = events.braking + events.acceleration + events.cornering;
  const maxEvent = Math.max(events.braking, events.acceleration, events.cornering);

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left touch-manipulation active:bg-white/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#FFB547]/10">
              <AlertTriangle size={24} className="text-[#FFB547]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[#6C757D] text-sm mb-1">Harsh Events</p>
              <h3 className="text-[#343A40] text-xl font-semibold">{totalEvents} events</h3>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={24} className="text-[#6C757D]" />
          </motion.div>
        </div>

        {/* Bar chart preview */}
        <div className="flex items-end justify-between gap-4 h-24">
          <EventBar label="Brake" value={events.braking} max={maxEvent} color="#FF6B6B" />
          <EventBar label="Accel" value={events.acceleration} max={maxEvent} color="#FFB547" />
          <EventBar label="Corner" value={events.cornering} max={maxEvent} color="#4DA8DA" />
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/40 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <EventDetail
                icon={<AlertTriangle size={18} className="text-[#FF6B6B]" />}
                label="Harsh Braking"
                count={events.braking}
                description="Sudden deceleration events detected"
                severity="high"
              />
              <EventDetail
                icon={<Zap size={18} className="text-[#FFB547]" />}
                label="Harsh Acceleration"
                count={events.acceleration}
                description="Rapid speed increase events"
                severity="medium"
              />
              <EventDetail
                icon={<Activity size={18} className="text-[#4DA8DA]" />}
                label="Sharp Cornering"
                count={events.cornering}
                description="Aggressive turning maneuvers"
                severity="low"
              />

              <div className="mt-4 p-4 rounded-2xl bg-[#51CF66]/10 border border-[#51CF66]/30">
                <p className="text-[#2F9E44] text-sm font-semibold">
                  💡 Tip: Reduce harsh events by 30% to improve your behavior score
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function EventBar({ label, value, max, color }: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const height = (value / max) * 100;

  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      {/* Value on top */}
      <p className="text-[#343A40] font-bold text-sm">{value}</p>
      
      {/* Bar */}
      <div className="relative w-full max-w-[70px] bg-[#E9ECEF] rounded-xl overflow-hidden" style={{ height: '72px' }}>
        <motion.div
          className="absolute bottom-0 w-full rounded-xl"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      
      {/* Label below */}
      <p className="text-[#6C757D] text-[10px] font-medium leading-tight">{label}</p>
    </div>
  );
}

function EventDetail({ icon, label, count, description, severity }: {
  icon: React.ReactNode;
  label: string;
  count: number;
  description: string;
  severity: 'high' | 'medium' | 'low';
}) {
  const severityColors = {
    high: 'border-[#FF6B6B]/30 bg-[#FF6B6B]/5',
    medium: 'border-[#FFB547]/30 bg-[#FFB547]/5',
    low: 'border-[#4DA8DA]/30 bg-[#4DA8DA]/5'
  };

  return (
    <div className={`p-4 rounded-2xl border ${severityColors[severity]}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/70">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[#343A40] font-semibold">{label}</p>
            <p className="text-[#343A40] text-xl font-bold">{count}</p>
          </div>
          <p className="text-[#6C757D] text-xs">{description}</p>
        </div>
      </div>
    </div>
  );
}

function IdleMovementCard({ idleRatio, movementRatio, isExpanded, onToggle }: {
  idleRatio: number;
  movementRatio: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left touch-manipulation active:bg-white/50 transition-colors"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#6ACFCF]/10">
              <Clock size={24} className="text-[#6ACFCF]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[#6C757D] text-sm mb-1">Time Analysis</p>
              <h3 className="text-[#343A40] text-xl font-semibold">Idle vs Movement</h3>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={24} className="text-[#6C757D]" />
          </motion.div>
        </div>

        {/* Donut chart */}
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90">
              {/* Movement arc */}
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#51CF66"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70 * (movementRatio / 100)} ${2 * Math.PI * 70}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {/* Idle arc */}
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#FFB547"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70 * (idleRatio / 100)} ${2 * Math.PI * 70}`}
                strokeDashoffset={-2 * Math.PI * 70 * (movementRatio / 100)}
                initial={{ strokeDashoffset: -2 * Math.PI * 70 }}
                animate={{ strokeDashoffset: -2 * Math.PI * 70 * (movementRatio / 100) }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[#343A40] text-3xl font-bold">{movementRatio}%</p>
              <p className="text-[#6C757D] text-xs">Moving</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#51CF66]" />
              <div className="flex-1">
                <p className="text-[#343A40] font-semibold">Movement</p>
                <p className="text-[#6C757D] text-sm">{movementRatio}% of total time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#FFB547]" />
              <div className="flex-1">
                <p className="text-[#343A40] font-semibold">Idle</p>
                <p className="text-[#6C757D] text-sm">{idleRatio}% of total time</p>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/40 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#51CF66]/10">
                  <p className="text-[#6C757D] text-xs mb-1">Active Time</p>
                  <p className="text-[#343A40] text-2xl font-bold">5h 14m</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FFB547]/10">
                  <p className="text-[#6C757D] text-xs mb-1">Idle Time</p>
                  <p className="text-[#343A40] text-2xl font-bold">1h 28m</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#4DA8DA]/10 border border-[#4DA8DA]/30">
                <p className="text-[#1971C2] text-sm font-semibold mb-2">
                  ⚡ Efficiency Score: Good
                </p>
                <p className="text-[#6C757D] text-xs">
                  Your idle time is within optimal range. Keep it under 25% for best efficiency.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function InsightCard({ icon, title, value, trend, bgColor }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  bgColor: string;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${bgColor}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[#6C757D] text-xs mb-1">{title}</p>
          <p className="text-[#343A40] text-lg font-bold">{value}</p>
        </div>
        {trend !== 'neutral' && (
          <div className={trend === 'up' ? 'text-[#51CF66]' : 'text-[#FF6B6B]'}>
            {trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
        )}
      </div>
    </GlassCard>
  );
}