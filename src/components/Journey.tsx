import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, TrendingUp, Calendar, Navigation, ArrowLeft, CornerDownRight, Pause } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { JourneyDetail } from './JourneyDetail';

export function Journey() {
  const [selectedJourney, setSelectedJourney] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const journeys = [
    {
      id: 1,
      from: 'Home',
      to: 'Office',
      distance: '18.2 km',
      duration: '32 min',
      date: 'Today, 9:15 AM',
      avgSpeed: '34 km/h',
      status: 'completed',
      turns: 12,
      stops: 3,
      pathComplexity: 'Moderate',
      routePath: 'M 20 80 Q 40 60, 60 50 T 100 20 T 140 30',
      coordinates: [
        { lat: 28.6139, lng: 77.2090, time: 0 },
        { lat: 28.6289, lng: 77.2190, time: 480 },
        { lat: 28.6439, lng: 77.2290, time: 960 },
        { lat: 28.6589, lng: 77.2390, time: 1440 },
        { lat: 28.6739, lng: 77.2490, time: 1920 }
      ]
    },
    {
      id: 2,
      from: 'Office',
      to: 'City Mall',
      distance: '12.5 km',
      duration: '28 min',
      date: 'Yesterday, 6:30 PM',
      avgSpeed: '27 km/h',
      status: 'completed',
      turns: 8,
      stops: 5,
      pathComplexity: 'Simple',
      routePath: 'M 20 20 Q 50 40, 80 50 T 140 70',
      coordinates: [
        { lat: 28.6739, lng: 77.2490, time: 0 },
        { lat: 28.6639, lng: 77.2390, time: 420 },
        { lat: 28.6539, lng: 77.2290, time: 840 },
        { lat: 28.6439, lng: 77.2190, time: 1260 },
        { lat: 28.6339, lng: 77.2090, time: 1680 }
      ]
    },
    {
      id: 3,
      from: 'Home',
      to: 'Airport',
      distance: '24.8 km',
      duration: '45 min',
      date: 'Dec 8, 2:15 PM',
      avgSpeed: '33 km/h',
      status: 'completed',
      turns: 15,
      stops: 2,
      pathComplexity: 'Complex',
      routePath: 'M 10 70 Q 30 50, 50 60 T 90 40 T 130 50 T 150 30',
      coordinates: [
        { lat: 28.6139, lng: 77.2090, time: 0 },
        { lat: 28.6339, lng: 77.2290, time: 675 },
        { lat: 28.5539, lng: 77.0990, time: 1350 },
        { lat: 28.5639, lng: 77.1090, time: 2025 },
        { lat: 28.5560, lng: 77.1006, time: 2700 }
      ]
    },
    {
      id: 4,
      from: 'City Mall',
      to: 'Home',
      distance: '13.1 km',
      duration: '25 min',
      date: 'Dec 7, 8:45 PM',
      avgSpeed: '31 km/h',
      status: 'completed',
      turns: 7,
      stops: 4,
      pathComplexity: 'Simple',
      routePath: 'M 140 70 Q 110 60, 80 50 T 30 40',
      coordinates: [
        { lat: 28.6339, lng: 77.2090, time: 0 },
        { lat: 28.6439, lng: 77.2190, time: 375 },
        { lat: 28.6539, lng: 77.2290, time: 750 },
        { lat: 28.6139, lng: 77.2090, time: 1125 },
        { lat: 28.6039, lng: 77.1990, time: 1500 }
      ]
    }
  ];

  if (selectedJourney) {
    return (
      <JourneyDetail
        journey={selectedJourney}
        onBack={() => setSelectedJourney(null)}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto px-5 pt-16 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-[#343A40] mb-2">Journey Memory</h1>
        <p className="text-[#6C757D]">Your complete travel history and insights</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#6C757D]">This Week</p>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                showHeatmap
                  ? 'bg-[#4DA8DA] text-white'
                  : 'bg-[#E9ECEF] text-[#6C757D]'
              }`}
            >
              {showHeatmap ? 'Hide' : 'Show'} Heatmap
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp size={20} className="text-[#4DA8DA]" strokeWidth={2} />
              </div>
              <p className="text-[#343A40] font-semibold mb-1">248 km</p>
              <p className="text-[#6C757D] text-xs">Distance</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Clock size={20} className="text-[#6ACFCF]" strokeWidth={2} />
              </div>
              <p className="text-[#343A40] font-semibold mb-1">6h 42m</p>
              <p className="text-[#6C757D] text-xs">Drive Time</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Navigation size={20} className="text-[#FFB547]" strokeWidth={2} />
              </div>
              <p className="text-[#343A40] font-semibold mb-1">32 km/h</p>
              <p className="text-[#6C757D] text-xs">Avg Speed</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Heatmap Visualization */}
      <AnimatePresence>
        {showHeatmap && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <GlassCard className="p-5">
              <p className="text-[#343A40] font-semibold mb-4">Frequently Used Routes</p>
              <div className="relative h-48 bg-[#EDF2F7] rounded-2xl overflow-hidden">
                {/* Simplified map background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(73, 80, 87, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(73, 80, 87, 0.3) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }} />
                </div>

                {/* Heatmap paths - gradient intensity based on frequency */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="heatHigh" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#FFB547" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="heatMedium" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFB547" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#FFB547" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#FFB547" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="heatLow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#51CF66" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#6ACFCF" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#51CF66" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* High frequency route */}
                  <motion.path
                    d="M 20 140 Q 100 120, 180 100 T 340 80"
                    stroke="url(#heatHigh)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                  />

                  {/* Medium frequency route */}
                  <motion.path
                    d="M 30 160 Q 120 150, 200 140 T 350 130"
                    stroke="url(#heatMedium)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                  />

                  {/* Low frequency route */}
                  <motion.path
                    d="M 15 100 Q 90 70, 160 50 T 300 30"
                    stroke="url(#heatLow)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                  />
                </svg>

                {/* Legend */}
                <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
                    <span className="text-xs text-[#6C757D]">High</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FFB547]" />
                    <span className="text-xs text-[#6C757D]">Med</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#51CF66]" />
                    <span className="text-xs text-[#6C757D]">Low</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journey List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-[#343A40] mb-4">Recent Trips</h3>
        {journeys.map((journey, index) => (
          <motion.div
            key={journey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <JourneyCard
              journey={journey}
              onClick={() => setSelectedJourney(journey)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function JourneyCard({ journey, onClick }: { journey: any; onClick: () => void }) {
  const complexityColors = {
    'Simple': { bg: 'bg-[#51CF66]/10', text: 'text-[#2F9E44]', border: 'border-[#51CF66]/30' },
    'Moderate': { bg: 'bg-[#FFB547]/10', text: 'text-[#E67700]', border: 'border-[#FFB547]/30' },
    'Complex': { bg: 'bg-[#FF6B6B]/10', text: 'text-[#E03131]', border: 'border-[#FF6B6B]/30' }
  };

  const complexity = complexityColors[journey.pathComplexity as keyof typeof complexityColors];

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left touch-manipulation transition-transform duration-200"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlassCard className="overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Mini Route Map Preview */}
        <div className="relative h-32 bg-gradient-to-br from-[#EDF2F7] to-[#E9ECEF]">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(73, 80, 87, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(73, 80, 87, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Route path visualization */}
          <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id={`routeGrad-${journey.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4DA8DA" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#73C2FB" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            <motion.path
              d={journey.routePath}
              stroke={`url(#routeGrad-${journey.id})`}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />

            {/* Start marker */}
            <circle cx="20" cy="80" r="4" fill="#51CF66" stroke="white" strokeWidth="2" />
            {/* End marker */}
            <circle cx="140" cy="30" r="4" fill="#FF6B6B" stroke="white" strokeWidth="2" />
          </svg>

          {/* Complexity badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-2.5 py-1 rounded-full ${complexity.bg} border ${complexity.border} backdrop-blur-sm`}>
              <p className={`text-xs font-semibold ${complexity.text}`}>{journey.pathComplexity}</p>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="p-5">
          {/* Route */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#51CF66] shadow-sm" />
              <div className="w-0.5 h-6 bg-gradient-to-b from-[#4DA8DA] to-[#FF6B6B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[#343A40] font-semibold truncate">{journey.from}</p>
              </div>
              <p className="text-[#6C757D] text-sm truncate mb-3">{journey.to}</p>

              {/* Primary Stats */}
              <div className="flex items-center gap-4 text-sm mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#6C757D]" />
                  <span className="text-[#495057] font-medium">{journey.distance}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#6C757D]" />
                  <span className="text-[#495057] font-medium">{journey.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#6C757D]" />
                  <span className="text-[#495057] font-medium">{journey.avgSpeed}</span>
                </div>
              </div>

              {/* Path Complexity Info */}
              <div className="flex items-center gap-4 text-sm pt-3 border-t border-[#E9ECEF]">
                <div className="flex items-center gap-1.5">
                  <CornerDownRight size={14} className="text-[#6C757D]" />
                  <span className="text-[#6C757D] text-xs">{journey.turns} turns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Pause size={14} className="text-[#6C757D]" />
                  <span className="text-[#6C757D] text-xs">{journey.stops} stops</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#E9ECEF]">
            <Calendar size={14} className="text-[#6C757D]" />
            <p className="text-[#6C757D] text-sm">{journey.date}</p>
          </div>
        </div>
      </GlassCard>
    </motion.button>
  );
}
