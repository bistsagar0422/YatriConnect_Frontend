import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings as SettingsIcon,
  Smartphone,
  Bell,
  Users,
  Shield,
  Wifi,
  MapPin,
  Activity,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Radio,
  Bluetooth,
  Gauge,
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  Globe,
  Database,
  Download,
  Trash2,
  LogOut
} from 'lucide-react';
import { GlassCard } from './GlassCard';

export function Settings() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Device status
  const [gpsStatus, setGpsStatus] = useState<'active' | 'fallback' | 'offline'>('active');
  const [imuStatus, setImuStatus] = useState<'active' | 'offline'>('active');
  const [esp32Status, setEsp32Status] = useState<'connected' | 'disconnected'>('connected');
  
  // Settings states
  const [crashSensitivity, setCrashSensitivity] = useState(75);
  const [theftSensitivity, setTheftSensitivity] = useState(60);
  const [sosDelay, setSosDelay] = useState(30);
  const [dataSharing, setDataSharing] = useState({
    analytics: true,
    location: true,
    journey: true
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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
        <h1 className="text-[#343A40] mb-2">Settings</h1>
        <p className="text-[#6C757D]">Device, alerts, and privacy controls</p>
      </motion.div>

      {/* Device Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-[#4DA8DA]/10">
              <Smartphone size={24} className="text-[#4DA8DA]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[#343A40] text-lg font-semibold">Device Status</h3>
              <p className="text-[#6C757D] text-sm">Hardware & connectivity</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* ESP32 Connectivity */}
            <DeviceStatusRow
              icon={<Wifi size={18} className={esp32Status === 'connected' ? 'text-[#51CF66]' : 'text-[#FF6B6B]'} />}
              label="ESP32 Controller"
              value={esp32Status === 'connected' ? 'Connected' : 'Disconnected'}
              status={esp32Status === 'connected' ? 'online' : 'offline'}
              sublabel="Main processing unit"
            />

            {/* GPS NEO-6M */}
            <DeviceStatusRow
              icon={<MapPin size={18} className={gpsStatus === 'active' ? 'text-[#51CF66]' : gpsStatus === 'fallback' ? 'text-[#FFB547]' : 'text-[#FF6B6B]'} />}
              label="GPS (NEO-6M)"
              value={
                gpsStatus === 'active' ? 'Active • 12 satellites' :
                gpsStatus === 'fallback' ? 'IMU Fallback Mode' :
                'Offline'
              }
              status={gpsStatus === 'active' ? 'online' : gpsStatus === 'fallback' ? 'warning' : 'offline'}
              sublabel={gpsStatus === 'fallback' ? 'Using motion sensors for tracking' : 'Location tracking'}
            />

            {/* MPU6050 IMU */}
            <DeviceStatusRow
              icon={<Activity size={18} className={imuStatus === 'active' ? 'text-[#51CF66]' : 'text-[#FF6B6B]'} />}
              label="Motion Sensor (MPU6050)"
              value={imuStatus === 'active' ? 'Active • 100Hz' : 'Offline'}
              status={imuStatus === 'active' ? 'online' : 'offline'}
              sublabel="Accelerometer + Gyroscope"
            />
          </div>

          {/* GPS Fallback Info */}
          {gpsStatus === 'fallback' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-2xl bg-[#FFB547]/10 border border-[#FFB547]/30"
            >
              <div className="flex items-start gap-2">
                <Gauge size={16} className="text-[#FFB547] mt-0.5" />
                <div>
                  <p className="text-[#E67700] text-sm font-semibold mb-1">
                    GPS Unavailable - IMU Fallback Active
                  </p>
                  <p className="text-[#6C757D] text-xs">
                    Using MPU6050 motion sensors to estimate position based on acceleration and rotation. 
                    Accuracy: ±50m. GPS will auto-resume when signal available.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Test Controls */}
          <div className="mt-4 pt-4 border-t border-white/40">
            <p className="text-[#6C757D] text-xs mb-3">Simulate Sensor States:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setGpsStatus('active')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#51CF66]/10 text-[#2F9E44] border border-[#51CF66]/30"
              >
                GPS Active
              </button>
              <button
                onClick={() => setGpsStatus('fallback')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FFB547]/10 text-[#E67700] border border-[#FFB547]/30"
              >
                GPS Fallback
              </button>
              <button
                onClick={() => setGpsStatus('offline')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FF6B6B]/10 text-[#E03131] border border-[#FF6B6B]/30"
              >
                GPS Off
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mb-6"
      >
        <ExpandableCard
          icon={<User size={24} className="text-[#4DA8DA]" />}
          title="Account Settings"
          description="Profile & authentication"
          isExpanded={expandedSection === 'account'}
          onToggle={() => toggleSection('account')}
        >
          <div className="space-y-4">
            {/* Profile Information */}
            <div className="space-y-3">
              <p className="text-[#343A40] font-semibold text-sm mb-3">Profile Information</p>
              
              <AccountField
                icon={<User size={16} className="text-[#4DA8DA]" />}
                label="Full Name"
                value="Rajesh Kumar"
              />
              <AccountField
                icon={<Mail size={16} className="text-[#6ACFCF]" />}
                label="Email Address"
                value="rajesh.kumar@example.com"
              />
              <AccountField
                icon={<Phone size={16} className="text-[#51CF66]" />}
                label="Phone Number"
                value="+91 98765 43210"
              />
              <AccountField
                icon={<Calendar size={16} className="text-[#FFB547]" />}
                label="Member Since"
                value="January 2025"
              />
            </div>

            {/* Security Options */}
            <div className="pt-4 border-t border-white/40">
              <p className="text-[#343A40] font-semibold text-sm mb-3">Security</p>
              
              <button className="w-full p-4 rounded-2xl bg-[#E9ECEF]/50 border border-white/40 text-left flex items-center justify-between mb-3 hover:bg-[#E9ECEF] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/70">
                    <Key size={18} className="text-[#4DA8DA]" />
                  </div>
                  <div>
                    <p className="text-[#343A40] font-semibold text-sm">Change Password</p>
                    <p className="text-[#6C757D] text-xs">Last changed 30 days ago</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#6C757D]" />
              </button>

              <button className="w-full p-4 rounded-2xl bg-[#E9ECEF]/50 border border-white/40 text-left flex items-center justify-between hover:bg-[#E9ECEF] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/70">
                    <Fingerprint size={18} className="text-[#51CF66]" />
                  </div>
                  <div>
                    <p className="text-[#343A40] font-semibold text-sm">Biometric Authentication</p>
                    <p className="text-[#6C757D] text-xs">Use fingerprint or Face ID</p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#51CF66] flex items-center justify-center">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-white/40">
              <button className="w-full p-4 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-left flex items-center justify-between hover:bg-[#FF6B6B]/20 transition-colors">
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-[#FF6B6B]" />
                  <span className="text-[#FF6B6B] font-semibold text-sm">Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </ExpandableCard>
      </motion.div>

      {/* Alert Sensitivity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6"
      >
        <ExpandableCard
          icon={<Bell size={24} className="text-[#FFB547]" />}
          title="Alert Sensitivity"
          description="Configure detection thresholds"
          isExpanded={expandedSection === 'alerts'}
          onToggle={() => toggleSection('alerts')}
        >
          <div className="space-y-6">
            {/* Crash Detection Sensitivity */}
            <SensitivitySlider
              label="Crash Detection"
              value={crashSensitivity}
              onChange={setCrashSensitivity}
              icon={<Activity size={18} className="text-[#FF6B6B]" />}
              description="Higher = triggers on smaller impacts"
              min={0}
              max={100}
              color="#FF6B6B"
            />

            {/* Theft Detection Sensitivity */}
            <SensitivitySlider
              label="Theft Alert"
              value={theftSensitivity}
              onChange={setTheftSensitivity}
              icon={<Shield size={18} className="text-[#FFB547]" />}
              description="Higher = triggers on smaller movements"
              min={0}
              max={100}
              color="#FFB547"
            />

            {/* SOS Countdown */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bell size={18} className="text-[#4DA8DA]" />
                <label className="text-[#343A40] font-semibold text-sm">SOS Auto-Call Delay</label>
              </div>
              <p className="text-[#6C757D] text-xs mb-3">
                Time before auto-calling emergency services
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSosDelay(Math.max(10, sosDelay - 5))}
                  className="w-10 h-10 rounded-full bg-[#E9ECEF] flex items-center justify-center font-bold text-[#343A40]"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <p className="text-[#343A40] text-3xl font-bold">{sosDelay}s</p>
                </div>
                <button
                  onClick={() => setSosDelay(Math.min(60, sosDelay + 5))}
                  className="w-10 h-10 rounded-full bg-[#E9ECEF] flex items-center justify-center font-bold text-[#343A40]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Preset Profiles */}
            <div className="pt-4 border-t border-white/40">
              <p className="text-[#343A40] font-semibold text-sm mb-3">Quick Presets</p>
              <div className="grid grid-cols-3 gap-2">
                <PresetButton
                  label="Relaxed"
                  onClick={() => {
                    setCrashSensitivity(50);
                    setTheftSensitivity(40);
                  }}
                />
                <PresetButton
                  label="Balanced"
                  onClick={() => {
                    setCrashSensitivity(75);
                    setTheftSensitivity(60);
                  }}
                />
                <PresetButton
                  label="Sensitive"
                  onClick={() => {
                    setCrashSensitivity(90);
                    setTheftSensitivity(85);
                  }}
                />
              </div>
            </div>
          </div>
        </ExpandableCard>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-6"
      >
        <ExpandableCard
          icon={<Users size={24} className="text-[#4DA8DA]" />}
          title="Emergency Contacts"
          description="3 contacts configured"
          isExpanded={expandedSection === 'contacts'}
          onToggle={() => toggleSection('contacts')}
        >
          <div className="space-y-3">
            <EmergencyContact name="John Doe" relation="Primary" phone="+91 98765 43210" priority={1} />
            <EmergencyContact name="Jane Smith" relation="Secondary" phone="+91 98765 43211" priority={2} />
            <EmergencyContact name="Emergency Services" relation="Medical" phone="112" priority={3} />
            
            <button className="w-full py-3 px-4 rounded-2xl bg-[#4DA8DA]/10 border-2 border-dashed border-[#4DA8DA]/30 text-[#4DA8DA] font-semibold text-sm">
              + Add Emergency Contact
            </button>
          </div>
        </ExpandableCard>
      </motion.div>

      {/* Data Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-6"
      >
        <ExpandableCard
          icon={<Shield size={24} className="text-[#51CF66]" />}
          title="Data Privacy & Sharing"
          description="Control your data"
          isExpanded={expandedSection === 'privacy'}
          onToggle={() => toggleSection('privacy')}
        >
          <div className="space-y-4">
            {/* Data Collection Settings */}
            <div>
              <p className="text-[#343A40] font-semibold text-sm mb-3">Data Collection</p>
              
              <ToggleOption
                label="Usage Analytics"
                description="Help improve the app with anonymous usage data"
                enabled={dataSharing.analytics}
                onToggle={() => setDataSharing({ ...dataSharing, analytics: !dataSharing.analytics })}
              />
            </div>

            <div className="h-px bg-white/40" />

            {/* Location & Journey Privacy */}
            <div>
              <p className="text-[#343A40] font-semibold text-sm mb-3">Location & Journey</p>
              
              <div className="space-y-4">
                <ToggleOption
                  label="Location History"
                  description="Store journey data locally for insights"
                  enabled={dataSharing.location}
                  onToggle={() => setDataSharing({ ...dataSharing, location: !dataSharing.location })}
                />
                <ToggleOption
                  label="Journey Sharing"
                  description="Allow sharing trips with emergency contacts"
                  enabled={dataSharing.journey}
                  onToggle={() => setDataSharing({ ...dataSharing, journey: !dataSharing.journey })}
                />
                <ToggleOption
                  label="Background Location"
                  description="Track location when app is in background"
                  enabled={true}
                  onToggle={() => {}}
                />
              </div>
            </div>

            <div className="h-px bg-white/40" />

            {/* Advanced Privacy Controls */}
            <div>
              <p className="text-[#343A40] font-semibold text-sm mb-3">Advanced Privacy</p>
              
              <div className="space-y-3">
                <button className="w-full p-4 rounded-2xl bg-[#E9ECEF]/50 border border-white/40 text-left flex items-center justify-between hover:bg-[#E9ECEF] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/70">
                      <Eye size={18} className="text-[#4DA8DA]" />
                    </div>
                    <div>
                      <p className="text-[#343A40] font-semibold text-sm">Visible to Emergency Contacts</p>
                      <p className="text-[#6C757D] text-xs">Who can see your live location</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#6C757D]" />
                </button>

                <button className="w-full p-4 rounded-2xl bg-[#E9ECEF]/50 border border-white/40 text-left flex items-center justify-between hover:bg-[#E9ECEF] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/70">
                      <Lock size={18} className="text-[#51CF66]" />
                    </div>
                    <div>
                      <p className="text-[#343A40] font-semibold text-sm">Crash Data Encryption</p>
                      <p className="text-[#6C757D] text-xs">End-to-end encrypted alerts</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-[#51CF66] flex items-center justify-center">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                </button>

                <button className="w-full p-4 rounded-2xl bg-[#E9ECEF]/50 border border-white/40 text-left flex items-center justify-between hover:bg-[#E9ECEF] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/70">
                      <Globe size={18} className="text-[#6ACFCF]" />
                    </div>
                    <div>
                      <p className="text-[#343A40] font-semibold text-sm">Sensor Data Retention</p>
                      <p className="text-[#6C757D] text-xs">Keep data for 90 days</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#6C757D]" />
                </button>
              </div>
            </div>

            <div className="h-px bg-white/40" />

            {/* Data Management */}
            <div>
              <p className="text-[#343A40] font-semibold text-sm mb-3">Data Management</p>
              
              <div className="space-y-3">
                <button className="w-full p-4 rounded-2xl bg-[#4DA8DA]/10 border border-[#4DA8DA]/30 text-left flex items-center justify-between hover:bg-[#4DA8DA]/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Download size={18} className="text-[#4DA8DA]" />
                    <div>
                      <p className="text-[#4DA8DA] font-semibold text-sm">Export My Data</p>
                      <p className="text-[#6C757D] text-xs">Download all stored journey data</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 rounded-2xl bg-[#FFB547]/10 border border-[#FFB547]/30 text-left flex items-center justify-between hover:bg-[#FFB547]/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Database size={18} className="text-[#E67700]" />
                    <div>
                      <p className="text-[#E67700] font-semibold text-sm">Clear Cache</p>
                      <p className="text-[#6C757D] text-xs">Remove temporary files (234 MB)</p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-left flex items-center justify-between hover:bg-[#FF6B6B]/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Trash2 size={18} className="text-[#FF6B6B]" />
                    <div>
                      <p className="text-[#FF6B6B] font-semibold text-sm">Delete All Journey Data</p>
                      <p className="text-[#6C757D] text-xs">Permanently erase location history</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#E9ECEF]/50">
              <p className="text-[#343A40] font-semibold text-sm mb-2">
                🔒 Your Privacy Matters
              </p>
              <p className="text-[#6C757D] text-xs leading-relaxed">
                All sensor data (GPS NEO-6M, MPU6050) is processed locally on your ESP32 device. 
                We never collect personally identifiable information. Crash and theft alerts are 
                only sent to your configured emergency contacts. Your data stays on your device 
                unless you explicitly choose to share it.
              </p>
            </div>
          </div>
        </ExpandableCard>
      </motion.div>

      {/* Sensor Data Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-[#6ACFCF]/10">
              <Activity size={24} className="text-[#6ACFCF]" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[#343A40] text-lg font-semibold">Live Sensor Data</h3>
              <p className="text-[#6C757D] text-sm">Real-time readings from MPU6050</p>
            </div>
          </div>

          <div className="space-y-4">
            <SensorReading
              label="Acceleration (X/Y/Z)"
              value="0.12g / -0.05g / 1.02g"
              icon={<Activity size={16} className="text-[#4DA8DA]" />}
              status="normal"
            />
            <SensorReading
              label="Gyroscope (X/Y/Z)"
              value="2.1° / -0.8° / 0.3°"
              icon={<Radio size={16} className="text-[#6ACFCF]" />}
              status="normal"
            />
            <SensorReading
              label="Temperature"
              value="28.5°C"
              icon={<Gauge size={16} className="text-[#FFB547]" />}
              status="normal"
            />
          </div>
        </GlassCard>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <GlassCard className="p-6 text-center">
          <p className="text-[#6C757D] text-sm mb-2">Smart Mobility Platform</p>
          <p className="text-[#343A40] font-semibold mb-4">Version 1.0.0</p>
          <div className="flex items-center justify-center gap-2 text-[#6C757D] text-xs">
            <Smartphone size={14} />
            <span>ESP32</span>
            <span>•</span>
            <MapPin size={14} />
            <span>NEO-6M GPS</span>
            <span>•</span>
            <Activity size={14} />
            <span>MPU6050 IMU</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function DeviceStatusRow({ icon, label, value, status, sublabel }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'online' | 'warning' | 'offline';
  sublabel?: string;
}) {
  const statusColors = {
    online: 'bg-[#51CF66]/10 border-[#51CF66]/30',
    warning: 'bg-[#FFB547]/10 border-[#FFB547]/30',
    offline: 'bg-[#FF6B6B]/10 border-[#FF6B6B]/30'
  };

  return (
    <div className={`p-4 rounded-2xl border ${statusColors[status]}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/70">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[#343A40] font-semibold text-sm">{label}</p>
            <div className={`w-2 h-2 rounded-full ${
              status === 'online' ? 'bg-[#51CF66]' :
              status === 'warning' ? 'bg-[#FFB547]' :
              'bg-[#FF6B6B]'
            }`} />
          </div>
          <p className="text-[#343A40] text-xs font-medium">{value}</p>
          {sublabel && <p className="text-[#6C757D] text-[10px] mt-0.5">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

function ExpandableCard({ icon, title, description, isExpanded, onToggle, children }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between touch-manipulation active:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-white/60 to-white/30">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-[#343A40] font-semibold">{title}</h3>
            <p className="text-[#6C757D] text-sm">{description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight size={20} className="text-[#6C757D]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/40 overflow-hidden"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function SensitivitySlider({ label, value, onChange, icon, description, min, max, color }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  description: string;
  min: number;
  max: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-[#343A40] font-semibold text-sm">{label}</label>
        </div>
        <span className="text-[#343A40] text-lg font-bold">{value}%</span>
      </div>
      <p className="text-[#6C757D] text-xs mb-3">{description}</p>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-[#E9ECEF] cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #E9ECEF ${value}%, #E9ECEF 100%)`
          }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-[#6C757D] text-xs">Low</span>
        <span className="text-[#6C757D] text-xs">High</span>
      </div>
    </div>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="py-2 px-3 rounded-xl bg-[#E9ECEF]/50 text-[#343A40] text-xs font-semibold border border-white/40 hover:bg-[#E9ECEF] transition-colors"
    >
      {label}
    </button>
  );
}

function EmergencyContact({ name, relation, phone, priority }: {
  name: string;
  relation: string;
  phone: string;
  priority: number;
}) {
  return (
    <div className="p-4 rounded-2xl bg-[#E9ECEF]/50 border border-white/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#73C2FB] flex items-center justify-center text-white font-bold">
            {priority}
          </div>
          <div>
            <p className="text-[#343A40] font-semibold text-sm">{name}</p>
            <p className="text-[#6C757D] text-xs">{relation} • {phone}</p>
          </div>
        </div>
        <button className="p-2 rounded-xl bg-white/70">
          <ChevronRight size={16} className="text-[#6C757D]" />
        </button>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, enabled, onToggle }: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <p className="text-[#343A40] font-semibold text-sm mb-1">{label}</p>
        <p className="text-[#6C757D] text-xs">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
          enabled ? 'bg-[#51CF66]' : 'bg-[#DEE2E6]'
        }`}
      >
        <motion.div
          className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg"
          animate={{ x: enabled ? 30 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SensorReading({ label, value, icon, status }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  status: 'normal' | 'warning' | 'alert';
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[#E9ECEF]/30">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[#6C757D] text-xs font-medium">{label}</span>
      </div>
      <span className="text-[#343A40] text-sm font-bold font-mono">{value}</span>
    </div>
  );
}

function AccountField({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-[#E9ECEF]/50 border border-white/40">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/70">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[#6C757D] text-xs mb-0.5">{label}</p>
          <p className="text-[#343A40] font-semibold text-sm">{value}</p>
        </div>
      </div>
    </div>
  );
}