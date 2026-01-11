import React from 'react';

export function GlassCard({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`
      relative
      bg-white/70 backdrop-blur-3xl backdrop-saturate-150
      border border-white/40
      rounded-[28px]
      shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]
      before:absolute before:inset-0 before:rounded-[28px]
      before:bg-gradient-to-br before:from-white/40 before:to-transparent
      before:pointer-events-none
      after:absolute after:inset-0 after:rounded-[28px]
      after:bg-gradient-to-t after:from-black/5 after:via-transparent after:to-white/10
      after:pointer-events-none
      ${className}
    `}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
