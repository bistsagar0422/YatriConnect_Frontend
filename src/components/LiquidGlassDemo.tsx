import React from 'react';
import { 
  LiquidGlassIcon, 
  LiquidGlassIconBlue, 
  LiquidGlassIconGreen, 
  LiquidGlassIconAmber, 
  LiquidGlassIconRed 
} from './LiquidGlassIcon';
import { 
  Home, 
  MapPin, 
  Shield, 
  Zap, 
  Heart, 
  Star, 
  Bell, 
  Settings, 
  TrendingUp,
  Activity,
  Navigation,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

export function LiquidGlassDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF6F1] via-[#EDF2F7] to-[#E2E8F0] py-20 px-5 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#343A40] mb-3">
            Liquid Glass Icons
          </h1>
          <p className="text-[#6C757D] text-lg">
            iOS-style glassmorphism components with backdrop blur & light reflections
          </p>
        </div>

        {/* Color Variants */}
        <Section title="Color Variants" subtitle="Pre-built color themes">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            <IconShowcase 
              component={<LiquidGlassIconBlue icon={<Navigation size={40} className="text-white" strokeWidth={2} />} />}
              label="Sky Blue"
            />
            <IconShowcase 
              component={<LiquidGlassIconGreen icon={<Shield size={40} className="text-white" strokeWidth={2} />}/>}
              label="Success Green"
            />
            <IconShowcase 
              component={<LiquidGlassIconAmber icon={<AlertTriangle size={40} className="text-white" strokeWidth={2} />}/>}
              label="Warning Amber"
            />
            <IconShowcase 
              component={<LiquidGlassIconRed icon={<Zap size={40} className="text-white" strokeWidth={2} />}/>}
              label="Alert Red"
            />
          </div>
        </Section>

        {/* Size Variations */}
        <Section title="Size Variations" subtitle="Flexible sizing system">
          <div className="flex items-end justify-center gap-8 flex-wrap">
            <IconShowcase 
              component={<LiquidGlassIconBlue icon={<Home size={16} className="text-white" strokeWidth={2} />} size={60} />}
              label="Small (60px)"
            />
            <IconShowcase 
              component={<LiquidGlassIconBlue icon={<Home size={28} className="text-white" strokeWidth={2} />} size={90} />}
              label="Medium (90px)"
            />
            <IconShowcase 
              component={<LiquidGlassIconBlue icon={<Home size={48} className="text-white" strokeWidth={2} />} size={140} />}
              label="Large (140px)"
            />
          </div>
        </Section>

        {/* Icon Library */}
        <Section title="Icon Collection" subtitle="Various Lucide icons with liquid glass effect">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 justify-items-center">
            <LiquidGlassIconBlue icon={<MapPin size={36} className="text-white" strokeWidth={2} />} size={80} />
            <LiquidGlassIconGreen icon={<Activity size={36} className="text-white" strokeWidth={2} />} size={80} />
            <LiquidGlassIconAmber icon={<Bell size={36} className="text-white" strokeWidth={2} />} size={80} />
            <LiquidGlassIconRed icon={<Heart size={36} className="text-white" strokeWidth={2} />} size={80} />
            <LiquidGlassIconBlue icon={<Star size={36} className="text-white" strokeWidth={2} />} size={80} />
            <LiquidGlassIconGreen icon={<Settings size={36} className="text-white" strokeWidth={2} />} size={80} />
          </div>
        </Section>

        {/* Custom Tint Colors */}
        <Section title="Custom Tint Colors" subtitle="Use any color with custom rgba values">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            <IconShowcase 
              component={
                <LiquidGlassIcon 
                  icon={<TrendingUp size={40} className="text-white" strokeWidth={2} />}
                  tintColor="rgba(147, 51, 234, 0.35)"
                />
              }
              label="Purple"
            />
            <IconShowcase 
              component={
                <LiquidGlassIcon 
                  icon={<Heart size={40} className="text-white" strokeWidth={2} />}
                  tintColor="rgba(236, 72, 153, 0.35)"
                />
              }
              label="Pink"
            />
            <IconShowcase 
              component={
                <LiquidGlassIcon 
                  icon={<Star size={40} className="text-white" strokeWidth={2} />}
                  tintColor="rgba(251, 191, 36, 0.35)"
                />
              }
              label="Gold"
            />
            <IconShowcase 
              component={
                <LiquidGlassIcon 
                  icon={<Shield size={40} className="text-white" strokeWidth={2} />}
                  tintColor="rgba(20, 184, 166, 0.35)"
                />
              }
              label="Teal"
            />
          </div>
        </Section>

        {/* Interactive Demo */}
        <Section title="Interactive States" subtitle="Tap to see animations">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            <InteractiveIcon 
              icon={<Home size={40} className="text-white" strokeWidth={2} />}
              label="Scale"
            />
            <InteractiveIcon 
              icon={<Bell size={40} className="text-white" strokeWidth={2} />}
              label="Bounce"
              animation="bounce"
            />
            <InteractiveIcon 
              icon={<Heart size={40} className="text-white" strokeWidth={2} />}
              label="Pulse"
              animation="pulse"
            />
            <InteractiveIcon 
              icon={<Star size={40} className="text-white" strokeWidth={2} />}
              label="Rotate"
              animation="rotate"
            />
          </div>
        </Section>

        {/* Technical Features */}
        <div className="mt-16 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-[#343A40] mb-6 text-center">
            ✨ Technical Features
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Feature 
              title="Backdrop Blur" 
              description="20px sigma blur with saturation boost for authentic iOS glass effect"
            />
            <Feature 
              title="Gradient Overlay" 
              description="Diagonal gradient from 35% to 5% opacity for depth perception"
            />
            <Feature 
              title="Light Reflection" 
              description="SVG path-based reflection simulating light source from top-left"
            />
            <Feature 
              title="Border Highlight" 
              description="40% white border creating glass edge separation"
            />
            <Feature 
              title="Drop Shadow" 
              description="18px blur shadow with 10px offset for floating effect"
            />
            <Feature 
              title="Flexible Sizing" 
              description="Proportional border radius (25% of size) and responsive scaling"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#343A40] mb-2">{title}</h2>
        <p className="text-[#6C757D]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function IconShowcase({ component, label }: { component: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {component}
      <p className="text-[#6C757D] text-sm font-medium">{label}</p>
    </div>
  );
}

function InteractiveIcon({ 
  icon, 
  label, 
  animation = 'scale' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  animation?: 'scale' | 'bounce' | 'pulse' | 'rotate';
}) {
  const [isActive, setIsActive] = React.useState(false);

  const animations = {
    scale: { scale: isActive ? 1.15 : 1 },
    bounce: { y: isActive ? -10 : 0 },
    pulse: { scale: isActive ? [1, 1.1, 1] : 1 },
    rotate: { rotate: isActive ? 360 : 0 }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={animations[animation]}
        transition={{ duration: 0.3 }}
        onTap={() => setIsActive(!isActive)}
        className="cursor-pointer"
      >
        <LiquidGlassIconBlue icon={icon} />
      </motion.div>
      <p className="text-[#6C757D] text-sm font-medium">{label}</p>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-2 h-2 rounded-full bg-[#4DA8DA] mt-2 flex-shrink-0" />
      <div>
        <h4 className="text-[#343A40] font-semibold mb-1">{title}</h4>
        <p className="text-[#6C757D] text-sm">{description}</p>
      </div>
    </div>
  );
}
