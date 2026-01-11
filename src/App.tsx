import React, { useState } from 'react';
import { Home } from './components/Home';
import { LiveNavigation } from './components/LiveNavigation';
import { Journey } from './components/Journey';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { TheftDetection } from './components/TheftDetection';
import { CrashDetection } from './components/CrashDetection';
import { LiquidGlassDemo } from './components/LiquidGlassDemo';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { MapIcon, ClockIcon, ShieldAlertIcon, BarChart3, Settings as SettingsIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('navigate');
  const [showCrashDetection, setShowCrashDetection] = useState(false);
  const [showHomePanel, setShowHomePanel] = useState(false);

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in production, validate against backend
    console.log('Login:', { email, password });
    setIsAuthenticated(true);
  };

  const handleSignup = (data: { name: string; email: string; phone: string; password: string }) => {
    // Mock signup - in production, send to backend
    console.log('Signup:', data);
    setIsAuthenticated(true);
  };

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      );
    } else {
      return (
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'navigate':
        return <LiveNavigation onTriggerCrash={() => setShowCrashDetection(true)} />;
      case 'journey':
        return <Journey />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'demo':
        return <LiquidGlassDemo />;
      case 'alerts':
        return <TheftDetection />;
      default:
        return <LiveNavigation onTriggerCrash={() => setShowCrashDetection(true)} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF6F1] overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #D4A574 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* iPhone 17 Pro Max Container - Responsive to Orientation */}
      <div className="mx-auto w-screen h-screen portrait:max-w-[430px] landscape:max-h-[430px] landscape:max-w-[932px] relative bg-[#FAF6F1] shadow-2xl">
        {/* Floating User Profile Button - Top Right */}
        <motion.button
          onClick={() => setShowHomePanel(true)}
          className="fixed top-8 right-[35px] z-50 w-12 h-12 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] shadow-lg border-4 border-white/50 overflow-hidden touch-manipulation active:scale-95"
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
            alt="User"
            className="w-full h-full object-cover"
          />
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#51CF66] border-2 border-white rounded-full" />
        </motion.button>

        {/* Main Content Area */}
        <div className="relative h-full portrait:pb-28 landscape:pb-24">
          {renderScreen()}
        </div>

        {/* Bottom Navigation - Without Home Tab */}
        <nav className="fixed bottom-0 left-0 right-0 portrait:max-w-[430px] landscape:max-w-[932px] mx-auto bg-white/70 backdrop-blur-3xl backdrop-saturate-150 border-t border-white/40 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] z-40">
          <div className="flex items-center justify-around px-2 portrait:py-4 portrait:pb-6 landscape:py-2 landscape:pb-3">
            <TabButton
              icon={<MapIcon />}
              label="Navigate"
              active={activeTab === 'navigate'}
              onClick={() => setActiveTab('navigate')}
            />
            <TabButton
              icon={<ClockIcon />}
              label="Journey"
              active={activeTab === 'journey'}
              onClick={() => setActiveTab('journey')}
            />
            <TabButton
              icon={<BarChart3 />}
              label="Analytics"
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <TabButton
              icon={<SettingsIcon />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
          </div>
        </nav>

        {/* Home Panel Slide-in */}
        <AnimatePresence>
          {showHomePanel && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                onClick={() => setShowHomePanel(false)}
              />
              
              {/* Slide-in Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-full portrait:max-w-[430px] landscape:max-w-[932px] bg-[#FAF6F1] shadow-2xl z-[70] overflow-hidden mx-auto"
              >
                {/* Close Button */}
                <motion.button
                  onClick={() => setShowHomePanel(false)}
                  className="absolute top-8 right-5 z-10 w-10 h-10 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-lg touch-manipulation active:scale-90"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} className="text-[#343A40]" strokeWidth={2.5} />
                </motion.button>

                {/* Home Content */}
                <div className="h-full overflow-y-auto">
                  <Home />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Crash Detection Overlay */}
        {showCrashDetection && (
          <CrashDetection onDismiss={() => setShowCrashDetection(false)} />
        )}
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] touch-manipulation"
      aria-label={label}
    >
      <div className={`transition-all duration-300 ${
        active ? 'text-[#4DA8DA] scale-110' : 'text-[#6C757D]'
      }`}>
        {React.cloneElement(icon as React.ReactElement, { 
          size: 24,
          strokeWidth: active ? 2.5 : 2
        })}
      </div>
      <span className={`text-xs transition-all duration-300 ${
        active ? 'text-[#4DA8DA] font-semibold' : 'text-[#6C757D]'
      }`}>
        {label}
      </span>
    </button>
  );
}