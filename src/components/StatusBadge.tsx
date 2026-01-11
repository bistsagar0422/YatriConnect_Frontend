import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export function StatusBadge({ status }: { status: 'safe' | 'warning' | 'danger' }) {
  const configs = {
    safe: {
      icon: <CheckCircle size={20} strokeWidth={2} />,
      text: 'All Systems Secure',
      bgColor: 'bg-[#51CF66]/10',
      borderColor: 'border-[#51CF66]/30',
      textColor: 'text-[#2F9E44]',
      iconColor: 'text-[#51CF66]'
    },
    warning: {
      icon: <AlertTriangle size={20} strokeWidth={2} />,
      text: 'Attention Required',
      bgColor: 'bg-[#FFB547]/10',
      borderColor: 'border-[#FFB547]/30',
      textColor: 'text-[#E67700]',
      iconColor: 'text-[#FFB547]'
    },
    danger: {
      icon: <XCircle size={20} strokeWidth={2} />,
      text: 'Critical Alert',
      bgColor: 'bg-[#FF6B6B]/10',
      borderColor: 'border-[#FF6B6B]/30',
      textColor: 'text-[#E03131]',
      iconColor: 'text-[#FF6B6B]'
    }
  };

  const config = configs[status];

  return (
    <div className={`
      inline-flex items-center gap-2 
      px-4 py-2 
      rounded-full 
      ${config.bgColor} 
      border ${config.borderColor}
      backdrop-blur-sm
    `}>
      <div className={config.iconColor}>{config.icon}</div>
      <span className={`${config.textColor} text-sm font-semibold`}>
        {config.text}
      </span>
    </div>
  );
}
