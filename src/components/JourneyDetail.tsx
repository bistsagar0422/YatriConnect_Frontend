import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  MapPin,
  Clock,
  TrendingUp,
  Navigation,
  CornerDownRight,
  Pause as StopIcon
} from 'lucide-react';
import { GlassCard } from './GlassCard';

interface JourneyDetailProps {
  journey: any;
  onBack: () => void;
}

export function JourneyDetail({ journey, onBack }: JourneyDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = parseInt(journey.duration) * 60; // Convert minutes to seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 100); // Update every 100ms for smooth animation
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, totalDuration]);

  const progress = (currentTime / totalDuration) * 100;

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current position along the path
  const getCurrentPathProgress = () => {
    return Math.min(progress / 100, 1);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-16 pb-4 bg-white/80 backdrop-blur-xl border-b border-[#E9ECEF] shadow-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-[#E9ECEF] transition-colors touch-manipulation"
          >
            <ArrowLeft size={24} className="text-[#343A40]" strokeWidth={2} />
          </button>
          <div className="flex-1">
            <h2 className="text-[#343A40] font-semibold">Journey Replay</h2>
            <p className="text-[#6C757D] text-sm">{journey.date}</p>
          </div>
        </div>
      </motion.div>

      {/* Map Visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#EDF2F7] to-[#E9ECEF]">
          {/* Map grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(73, 80, 87, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(73, 80, 87, 0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Route visualization */}
          <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="journeyRoute" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4DA8DA" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#73C2FB" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#4DA8DA" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="completedRoute" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#51CF66" stopOpacity="1" />
                <stop offset="100%" stopColor="#6ACFCF" stopOpacity="1" />
              </linearGradient>

              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Full route path (grayed out) */}
            <path
              d="M 40 250 Q 60 200, 80 180 T 120 140 T 160 100 T 180 50"
              stroke="#CED4DA"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Completed portion of route */}
            <motion.path
              d="M 40 250 Q 60 200, 80 180 T 120 140 T 160 100 T 180 50"
              stroke="url(#completedRoute)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: getCurrentPathProgress() }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* Start marker */}
            <g>
              <circle cx="40" cy="250" r="8" fill="#51CF66" stroke="white" strokeWidth="3" />
              <text x="40" y="275" textAnchor="middle" className="text-xs fill-[#343A40] font-semibold">
                Start
              </text>
            </g>

            {/* End marker */}
            <g>
              <circle cx="180" cy="50" r="8" fill="#FF6B6B" stroke="white" strokeWidth="3" />
              <text x="180" y="40" textAnchor="middle" className="text-xs fill-[#343A40] font-semibold">
                End
              </text>
            </g>

            {/* Current position marker - animated */}
            <AnimatePresence>
              {isPlaying && (
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  {/* Pulsing ring */}
                  <motion.circle
                    cx="40"
                    cy="250"
                    r="12"
                    fill="none"
                    stroke="#4DA8DA"
                    strokeWidth="2"
                    opacity="0.5"
                    animate={{ 
                      r: [12, 18, 12],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <circle cx="40" cy="250" r="6" fill="#4DA8DA" stroke="white" strokeWidth="2" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Waypoint markers */}
            {[
              { cx: 80, cy: 180 },
              { cx: 120, cy: 140 },
              { cx: 160, cy: 100 }
            ].map((point, index) => (
              <motion.circle
                key={index}
                cx={point.cx}
                cy={point.cy}
                r="4"
                fill={getCurrentPathProgress() * 3 > index ? "#4DA8DA" : "#CED4DA"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
              />
            ))}
          </svg>
        </div>
      </motion.div>

      {/* Journey Info Cards */}
      <div className="px-5 py-4 space-y-3 bg-[#F8F9FA]">
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#4DA8DA]/10">
                <MapPin size={18} className="text-[#4DA8DA]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[#6C757D] text-xs mb-0.5">Distance</p>
                <p className="text-[#343A40] font-semibold">{journey.distance}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#6ACFCF]/10">
                <Clock size={18} className="text-[#6ACFCF]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[#6C757D] text-xs mb-0.5">Duration</p>
                <p className="text-[#343A40] font-semibold">{journey.duration}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FFB547]/10">
                <TrendingUp size={18} className="text-[#FFB547]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[#6C757D] text-xs mb-0.5">Avg Speed</p>
                <p className="text-[#343A40] font-semibold">{journey.avgSpeed}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#51CF66]/10">
                <CornerDownRight size={18} className="text-[#51CF66]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[#6C757D] text-xs mb-0.5">Complexity</p>
                <p className="text-[#343A40] font-semibold">{journey.pathComplexity}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-5 pb-6 bg-[#F8F9FA]"
      >
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#343A40] font-semibold">Journey Timeline</p>
            <p className="text-[#6C757D] text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </p>
          </div>

          {/* Progress Bar / Scrubber */}
          <div className="mb-4">
            <div className="relative h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4DA8DA] to-[#73C2FB] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Scrubber handle */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#4DA8DA] rounded-full shadow-lg cursor-pointer"
                style={{ left: `${progress}%`, marginLeft: '-8px' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0}
                onDrag={(event, info) => {
                  const element = event.currentTarget.parentElement;
                  if (element) {
                    const rect = element.getBoundingClientRect();
                    const x = Math.max(0, Math.min(info.point.x - rect.left, rect.width));
                    const newProgress = (x / rect.width) * 100;
                    setCurrentTime((newProgress / 100) * totalDuration);
                  }
                }}
                whileHover={{ scale: 1.2 }}
                whileDrag={{ scale: 1.3 }}
              />
            </div>

            {/* Time markers */}
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[#6C757D]">0:00</span>
              <span className="text-xs text-[#6C757D]">{formatTime(totalDuration / 2)}</span>
              <span className="text-xs text-[#6C757D]">{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-[#E9ECEF] hover:bg-[#CED4DA] transition-colors touch-manipulation"
            >
              <RotateCcw size={20} className="text-[#495057]" strokeWidth={2} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] hover:shadow-lg transition-all duration-300 touch-manipulation active:scale-95"
            >
              {isPlaying ? (
                <Pause size={24} className="text-white" fill="white" strokeWidth={2} />
              ) : (
                <Play size={24} className="text-white" fill="white" strokeWidth={2} />
              )}
            </button>

            <button
              onClick={() => setCurrentTime(totalDuration)}
              className="p-3 rounded-xl bg-[#E9ECEF] hover:bg-[#CED4DA] transition-colors touch-manipulation"
            >
              <Navigation size={20} className="text-[#495057]" strokeWidth={2} />
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
