import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation as NavIcon, 
  Clock, 
  TrendingUp, 
  Wifi, 
  WifiOff,
  Shield,
  AlertCircle,
  Zap,
  ChevronUp,
  Car,
  Activity,
  Search,
  X,
  MapPin,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { GlassCard } from './GlassCard';

interface LiveNavigationProps {
  onTriggerCrash?: () => void;
}

export function LiveNavigation({ onTriggerCrash }: LiveNavigationProps = {}) {
  const [speed, setSpeed] = useState(42);
  const [isGPSActive, setIsGPSActive] = useState(true);
  const [vehicleStatus, setVehicleStatus] = useState<'connected' | 'armed' | 'moving'>('moving');
  const [tripTime, setTripTime] = useState(1247);
  const [distance, setDistance] = useState(12.4);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const moveIntervalRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>(null);
  const [currentPosition, setCurrentPosition] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi, India

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      initMap();
    };
    document.head.appendChild(script);

    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    if (typeof window !== 'undefined' && (window as any).L && !mapRef.current) {
      const L = (window as any).L;
      
      // Initialize map
      const map = L.map('map', {
        center: [currentPosition.lat, currentPosition.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon for current location
      const currentLocationIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
          <div class="relative">
            <div class="absolute inset-0 rounded-full bg-[#4DA8DA] opacity-30 animate-ping"></div>
            <div class="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] border-4 border-white shadow-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      // Add current location marker
      const marker = L.marker([currentPosition.lat, currentPosition.lng], {
        icon: currentLocationIcon
      }).addTo(map);

      // Add a route path (example route)
      const routeCoordinates = [
        [28.6139, 77.2090],
        [28.6145, 77.2100],
        [28.6155, 77.2115],
        [28.6165, 77.2130],
        [28.6175, 77.2145],
        [28.6185, 77.2160]
      ];

      const polyline = L.polyline(routeCoordinates, {
        color: '#4DA8DA',
        weight: 6,
        opacity: 0.8,
        smoothFactor: 1,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);

      // Add route start marker
      const startIcon = L.divIcon({
        className: 'route-marker',
        html: `
          <div class="w-4 h-4 rounded-full bg-[#51CF66] border-2 border-white shadow-lg"></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker(routeCoordinates[0], { icon: startIcon }).addTo(map);

      // Add route end marker
      const endIcon = L.divIcon({
        className: 'route-marker',
        html: `
          <div class="w-4 h-4 rounded-full bg-[#FF6B6B] border-2 border-white shadow-lg"></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker(routeCoordinates[routeCoordinates.length - 1], { icon: endIcon }).addTo(map);

      mapRef.current = map;
      markerRef.current = marker;

      // Simulate movement along route
      let index = 0;
      const moveInterval = setInterval(() => {
        if (index < routeCoordinates.length - 1) {
          index++;
          const newPos = routeCoordinates[index];
          marker.setLatLng(newPos);
          map.panTo(newPos, { animate: true, duration: 1 });
          setCurrentPosition({ lat: newPos[0], lng: newPos[1] });
        } else {
          clearInterval(moveInterval);
        }
      }, 3000);
      moveIntervalRef.current = moveInterval;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        setIsGPSActive(prev => !prev);
      }
      
      setSpeed(prev => Math.max(0, Math.min(80, prev + (Math.random() - 0.5) * 5)));
      setTripTime(prev => prev + 1);
      setDistance(prev => prev + 0.01);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Search functionality using Nominatim (OpenStreetMap)
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleSelectLocation = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15, {
        animate: true,
        duration: 1
      });

      // Add a marker at the searched location
      if ((window as any).L) {
        const L = (window as any).L;
        const searchMarkerIcon = L.divIcon({
          className: 'search-marker',
          html: `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFB547] to-[#E67700] border-3 border-white shadow-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });
        
        L.marker([lat, lng], { icon: searchMarkerIcon }).addTo(mapRef.current);
      }
    }
    
    setSearchQuery(result.display_name);
    setIsSearchFocused(false);
    setSearchResults([]);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#EDF2F7]">
      {/* OpenStreetMap Container */}
      <div id="map" className="absolute inset-0 w-full h-full z-0" />

      {/* Google Maps-Style Search Bar - Top Center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-8 left-5 right-5 z-30"
      >
        <div className="max-w-[280px] mx-auto">
          <GlassCard className="overflow-hidden">
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search size={18} className="text-[#6C757D]" strokeWidth={2.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search for places..."
                  className="flex-1 bg-transparent border-none outline-none text-[#343A40] placeholder:text-[#ADB5BD] text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearchFocused(false);
                    }}
                    className="p-1 hover:bg-[#E9ECEF] rounded-full transition-colors"
                  >
                    <X size={16} className="text-[#6C757D]" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/20 max-h-64 overflow-y-auto"
                  >
                    {searchResults.map((result, index) => (
                      <button
                        key={result.place_id || index}
                        onClick={() => handleSelectLocation(result)}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 text-left"
                      >
                        <MapPin size={16} className="text-[#4DA8DA] mt-0.5 flex-shrink-0" strokeWidth={2} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#343A40] text-sm font-medium truncate">
                            {result.display_name.split(',')[0]}
                          </p>
                          <p className="text-[#6C757D] text-xs truncate mt-0.5">
                            {result.display_name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading indicator */}
              {isSearching && (
                <div className="border-t border-white/20 px-4 py-3 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#4DA8DA] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[#6C757D] text-xs">Searching...</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* GPS Loss Overlay */}
      <AnimatePresence>
        {!isGPSActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#FFB547]/20 backdrop-blur-[2px] pointer-events-none z-10"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <GlassCard className="px-6 py-4 border-2 border-[#FFB547]/50">
                <div className="flex items-center gap-3">
                  <WifiOff size={24} className="text-[#E67700]" strokeWidth={2.5} />
                  <div>
                    <p className="text-[#343A40] font-semibold">GPS Signal Lost</p>
                    <p className="text-[#6C757D] text-sm">Using IMU sensors</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-Left Vehicle Status Widget */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-24 left-5 z-20"
      >
        <VehicleStatusWidget status={vehicleStatus} />
      </motion.div>

      {/* Top-Right Signal Indicator */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-24 right-5 z-20"
      >
        <SignalIndicator isGPSActive={isGPSActive} />
      </motion.div>

      {/* Left Side - Speed Indicator (Lowered) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute left-5 bottom-60 z-20"
      >
        <SpeedIndicator speed={speed} isGPSActive={isGPSActive} />
      </motion.div>

      {/* Right Side Controls - Vertical Stack */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {/* Recenter Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <RecenterButton 
            onRecenter={() => {
              if (mapRef.current) {
                mapRef.current.setView([currentPosition.lat, currentPosition.lng], 15, {
                  animate: true,
                  duration: 1
                });
              }
            }} 
          />
        </motion.div>

        {/* Map Layers Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <LayersButton />
        </motion.div>

        {/* Zoom Controls - Vertical */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ZoomButton 
            icon={<ZoomIn size={18} />} 
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.zoomIn();
              }
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <ZoomButton 
            icon={<ZoomOut size={18} />} 
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.zoomOut();
              }
            }}
          />
        </motion.div>
      </div>

      {/* Test Crash Button - For Demo */}
      {onTriggerCrash && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute bottom-44 left-5 z-30"
        >
          <button
            onClick={onTriggerCrash}
            className="px-4 py-2 rounded-full bg-[#FF6B6B]/90 backdrop-blur-xl text-white text-xs font-semibold shadow-lg border border-white/30 touch-manipulation active:scale-95"
          >
            Test Crash
          </button>
        </motion.div>
      )}

      {/* Bottom-Right Emergency SOS Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute bottom-44 right-5 z-30"
      >
        <EmergencyButton onTriggerCrash={onTriggerCrash} />
      </motion.div>

      {/* Floating Bottom Sheet with Trip Details */}
      <BottomSheet
        isExpanded={isBottomSheetExpanded}
        onToggle={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
        tripTime={formatTime(tripTime)}
        distance={distance}
        speed={speed}
        isGPSActive={isGPSActive}
      />

      {/* Custom CSS for map markers */}
      <style>{`
        .custom-location-marker {
          background: transparent;
          border: none;
        }
        .route-marker {
          background: transparent;
          border: none;
        }
        .search-marker {
          background: transparent;
          border: none;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        #map {
          background: #EDF2F7;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

function VehicleStatusWidget({ status }: { status: 'connected' | 'armed' | 'moving' }) {
  const statusConfig = {
    connected: {
      label: 'Connected',
      icon: <Car size={16} strokeWidth={2.5} />,
      bgClass: 'bg-[#51CF66]/10',
      borderClass: 'border-[#51CF66]/30',
      textClass: 'text-[#2F9E44]',
      dotClass: 'bg-[#51CF66]'
    },
    armed: {
      label: 'Armed',
      icon: <Shield size={16} strokeWidth={2.5} />,
      bgClass: 'bg-[#6ACFCF]/10',
      borderClass: 'border-[#6ACFCF]/30',
      textClass: 'text-[#0B7285]',
      dotClass: 'bg-[#6ACFCF]'
    },
    moving: {
      label: 'Moving',
      icon: <Activity size={16} strokeWidth={2.5} />,
      bgClass: 'bg-[#4DA8DA]/10',
      borderClass: 'border-[#4DA8DA]/30',
      textClass: 'text-[#1971C2]',
      dotClass: 'bg-[#4DA8DA]'
    }
  };

  const config = statusConfig[status];

  return (
    <GlassCard className={`px-4 py-3 ${config.borderClass} border`}>
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${config.dotClass}`}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className={config.textClass}>
          {config.icon}
        </div>
        <span className={`${config.textClass} text-sm font-semibold`}>
          {config.label}
        </span>
      </div>
    </GlassCard>
  );
}

function SignalIndicator({ isGPSActive }: { isGPSActive: boolean }) {
  return (
    <motion.div
      animate={{ 
        scale: !isGPSActive ? [1, 1.05, 1] : 1 
      }}
      transition={{ duration: 1, repeat: !isGPSActive ? Infinity : 0 }}
    >
      <GlassCard className={`px-4 py-3 border transition-all duration-500 ${
        isGPSActive 
          ? 'border-[#51CF66]/30 bg-[#51CF66]/5' 
          : 'border-[#FFB547]/50 bg-[#FFB547]/10'
      }`}>
        <div className="flex items-center gap-2">
          {isGPSActive ? (
            <>
              <Wifi size={16} className="text-[#2F9E44]" strokeWidth={2.5} />
              <span className="text-[#2F9E44] text-sm font-semibold">GPS</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-[#E67700]" strokeWidth={2.5} />
              <span className="text-[#E67700] text-sm font-semibold">IMU</span>
            </>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function SpeedIndicator({ speed, isGPSActive }: { speed: number; isGPSActive: boolean }) {
  const speedColor = speed > 60 ? 'from-[#FF6B6B] to-[#FFB547]' : 
                     speed > 40 ? 'from-[#4DA8DA] to-[#73C2FB]' : 
                     'from-[#51CF66] to-[#6ACFCF]';

  return (
    <GlassCard className="p-4 w-24 h-24">
      <div className="flex flex-col items-center justify-center h-full">
        <motion.div
          key={Math.round(speed)}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`text-3xl font-bold bg-gradient-to-br ${speedColor} bg-clip-text text-transparent`}
        >
          {Math.round(speed)}
        </motion.div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[#6C757D] text-xs">km/h</span>
        </div>
        {!isGPSActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <div className="w-3 h-3 rounded-full bg-[#FFB547] border-2 border-white" />
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

function RecenterButton({ onRecenter }: { onRecenter: () => void }) {
  return (
    <motion.button
      className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] shadow-2xl shadow-[#4DA8DA]/30 active:scale-90 touch-manipulation"
      whileTap={{ scale: 0.85 }}
      onClick={onRecenter}
    >
      {/* Pulsing outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#4DA8DA]"
        animate={{ 
          scale: [1, 1.4, 1.4],
          opacity: [0.4, 0, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Inner button with glass effect */}
      <div className="relative w-full h-full rounded-full border-3 border-white/30 flex items-center justify-center backdrop-blur-sm">
        <Crosshair size={20} className="text-white" strokeWidth={2.5} />
      </div>
    </motion.button>
  );
}

function LayersButton() {
  return (
    <motion.button
      className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] shadow-2xl shadow-[#4DA8DA]/30 active:scale-90 touch-manipulation"
      whileTap={{ scale: 0.85 }}
    >
      {/* Pulsing outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#4DA8DA]"
        animate={{ 
          scale: [1, 1.4, 1.4],
          opacity: [0.4, 0, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Inner button with glass effect */}
      <div className="relative w-full h-full rounded-full border-3 border-white/30 flex items-center justify-center backdrop-blur-sm">
        <Layers size={20} className="text-white" strokeWidth={2.5} />
      </div>
    </motion.button>
  );
}

function ZoomButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] shadow-2xl shadow-[#4DA8DA]/30 active:scale-90 touch-manipulation"
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
    >
      {/* Pulsing outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#4DA8DA]"
        animate={{ 
          scale: [1, 1.4, 1.4],
          opacity: [0.4, 0, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Inner button with glass effect */}
      <div className="relative w-full h-full rounded-full border-3 border-white/30 flex items-center justify-center backdrop-blur-sm text-white">
        {icon}
      </div>
    </motion.button>
  );
}

function EmergencyButton({ onTriggerCrash }: { onTriggerCrash?: () => void }) {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePressStart = () => {
    setIsPressed(true);
    const timer = setTimeout(() => {
      if (onTriggerCrash) {
        onTriggerCrash();
      }
    }, 2000); // Hold for 2 seconds to trigger crash detection
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  return (
    <motion.button
      className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#E03131] shadow-2xl shadow-[#FF6B6B]/30 active:scale-90 touch-manipulation"
      whileTap={{ scale: 0.85 }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      {/* Pulsing outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#FF6B6B]"
        animate={{ 
          scale: [1, 1.4, 1.4],
          opacity: [0.4, 0, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Inner button with glass effect */}
      <div className="relative w-full h-full rounded-full border-3 border-white/30 flex items-center justify-center backdrop-blur-sm">
        <Zap size={22} className="text-white" fill="white" strokeWidth={2} />
      </div>

      {/* Progress ring when holding */}
      {isPressed && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <motion.circle
            cx="50%"
            cy="50%"
            r="24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
            style={{
              strokeDasharray: 2 * Math.PI * 24
            }}
          />
        </svg>
      )}
    </motion.button>
  );
}

function BottomSheet({ 
  isExpanded, 
  onToggle, 
  tripTime, 
  distance, 
  speed,
  isGPSActive 
}: { 
  isExpanded: boolean; 
  onToggle: () => void;
  tripTime: string;
  distance: number;
  speed: number;
  isGPSActive: boolean;
}) {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="px-5 pb-2">
        <GlassCard className="overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
          {/* Compact Trip Info - Always Visible */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#6C757D] text-xs mb-1">Current Trip</p>
                <h3 className="text-[#343A40] text-lg font-semibold">Active Journey</h3>
              </div>
              <div className={`px-3 py-1.5 rounded-full border transition-all duration-500 ${
                isGPSActive 
                  ? 'bg-[#51CF66]/10 border-[#51CF66]/30' 
                  : 'bg-[#FFB547]/10 border-[#FFB547]/30'
              }`}>
                <p className={`text-xs font-semibold transition-colors duration-500 ${
                  isGPSActive ? 'text-[#2F9E44]' : 'text-[#E67700]'
                }`}>
                  {isGPSActive ? 'Tracking' : 'Estimating'}
                </p>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-3">
              <TripMetric
                icon={<Clock size={16} className="text-[#4DA8DA]" strokeWidth={2} />}
                label="Time"
                value={tripTime}
              />
              <TripMetric
                icon={<TrendingUp size={16} className="text-[#6ACFCF]" strokeWidth={2} />}
                label="Distance"
                value={`${distance.toFixed(1)} km`}
              />
              <TripMetric
                icon={<NavIcon size={16} className="text-[#FFB547]" strokeWidth={2} />}
                label="Avg Speed"
                value={`${Math.round(speed * 0.85)} km/h`}
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

function TripMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className="text-[#343A40] text-sm font-semibold mb-0.5">{value}</p>
      <p className="text-[#6C757D] text-[10px]">{label}</p>
    </div>
  );
}