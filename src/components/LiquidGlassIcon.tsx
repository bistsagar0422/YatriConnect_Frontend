import React from 'react';

interface LiquidGlassIconProps {
  icon: React.ReactNode;
  size?: number;
  tintColor?: string;
  className?: string;
}

export function LiquidGlassIcon({ 
  icon, 
  size = 90, 
  tintColor = 'rgba(255, 255, 255, 0.35)',
  className = ''
}: LiquidGlassIconProps) {
  const borderRadius = size * 0.25;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Container with shadow */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: `${borderRadius}px`,
          boxShadow: '0 10px 18px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Glass layers */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: `${borderRadius}px`,
          }}
        >
          {/* Background blur layer */}
          <div
            className="absolute inset-0 backdrop-blur-[20px] backdrop-saturate-150"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
            }}
          />

          {/* Glass gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${tintColor}, ${tintColor.replace(/[\d.]+\)$/g, '0.05)')})`,
            }}
          />

          {/* Light reflection using SVG */}
          <svg
            className="absolute inset-0"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id={`glass-reflection-${size}`} x1="0%" y1="0%" x2="50%" y2="50%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 0 L ${size} 0 L ${size * 0.6} ${size * 0.4} L 0 ${size * 0.35} Z`}
              fill={`url(#glass-reflection-${size})`}
            />
          </svg>

          {/* Icon content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {icon}
          </div>

          {/* Border highlight */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: `${borderRadius}px`,
              border: '1.2px solid rgba(255, 255, 255, 0.4)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Preset variations for common use cases
export function LiquidGlassIconBlue({ icon, size }: { icon: React.ReactNode; size?: number }) {
  return (
    <LiquidGlassIcon 
      icon={icon} 
      size={size} 
      tintColor="rgba(77, 168, 218, 0.35)" 
    />
  );
}

export function LiquidGlassIconGreen({ icon, size }: { icon: React.ReactNode; size?: number }) {
  return (
    <LiquidGlassIcon 
      icon={icon} 
      size={size} 
      tintColor="rgba(81, 207, 102, 0.35)" 
    />
  );
}

export function LiquidGlassIconAmber({ icon, size }: { icon: React.ReactNode; size?: number }) {
  return (
    <LiquidGlassIcon 
      icon={icon} 
      size={size} 
      tintColor="rgba(255, 181, 71, 0.35)" 
    />
  );
}

export function LiquidGlassIconRed({ icon, size }: { icon: React.ReactNode; size?: number }) {
  return (
    <LiquidGlassIcon 
      icon={icon} 
      size={size} 
      tintColor="rgba(255, 107, 107, 0.35)" 
    />
  );
}
