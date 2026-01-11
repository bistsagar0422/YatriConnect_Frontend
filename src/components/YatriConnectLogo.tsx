import React from 'react';
import { motion } from 'motion/react';

interface YatriConnectLogoProps {
  size?: number;
  showText?: boolean;
  animated?: boolean;
}

export function YatriConnectLogo({ size = 80, showText = true, animated = true }: YatriConnectLogoProps) {
  const pinSize = size;
  const textSize = size * 0.45;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Map Pin Container */}
      <motion.div
        initial={animated ? { scale: 0, rotate: -180 } : false}
        animate={animated ? { scale: 1, rotate: 0 } : false}
        transition={{ 
          type: 'spring',
          stiffness: 200,
          damping: 15,
          duration: 0.8
        }}
        className="relative"
        style={{ width: pinSize, height: pinSize * 1.3 }}
      >
        {/* Shadow */}
        <motion.div
          initial={animated ? { opacity: 0, scale: 0.5 } : false}
          animate={animated ? { 
            opacity: [0, 0.25, 0.25],
            scale: [0.5, 1.1, 1.1]
          } : false}
          transition={{ duration: 1, times: [0, 0.5, 1] }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full blur-xl"
          style={{ 
            width: pinSize * 0.7,
            height: pinSize * 0.15,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, transparent 70%)'
          }}
        />

        {/* Main Pin SVG */}
        <svg
          width={pinSize}
          height={pinSize * 1.3}
          viewBox="0 0 100 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-2xl"
        >
          <defs>
            {/* Blue Gradient - Left Side */}
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2B7FCC" />
              <stop offset="50%" stopColor="#1E5FA1" />
              <stop offset="100%" stopColor="#164978" />
            </linearGradient>

            {/* Turquoise Gradient - Right Side */}
            <linearGradient id="turquoiseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FD1E1" />
              <stop offset="50%" stopColor="#2FB8C8" />
              <stop offset="100%" stopColor="#1A8A96" />
            </linearGradient>

            {/* Glossy shine gradient */}
            <linearGradient id="shineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Shadow gradient for depth */}
            <radialGradient id="innerShadow" cx="50%" cy="50%">
              <stop offset="70%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
            </radialGradient>

            {/* Clip path for split effect */}
            <clipPath id="leftHalf">
              <path d="M 0 0 L 50 0 Q 45 30, 50 60 Q 48 90, 50 120 L 0 120 Z" />
            </clipPath>
            <clipPath id="rightHalf">
              <path d="M 50 0 L 100 0 L 100 120 L 50 120 Q 52 90, 50 60 Q 55 30, 50 0 Z" />
            </clipPath>
          </defs>

          {/* Main Pin Shape - Blue Side */}
          <motion.path
            d="M 50 5 C 27 5, 12 20, 12 42 C 12 62, 35 95, 50 120 C 50 120, 50 120, 50 120 L 50 5 Z"
            fill="url(#blueGradient)"
            clipPath="url(#leftHalf)"
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : false}
            transition={{ duration: 0.6 }}
          />

          {/* Main Pin Shape - Turquoise Side */}
          <motion.path
            d="M 50 5 C 73 5, 88 20, 88 42 C 88 62, 65 95, 50 120 C 50 120, 50 120, 50 120 L 50 5 Z"
            fill="url(#turquoiseGradient)"
            clipPath="url(#rightHalf)"
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : false}
            transition={{ duration: 0.6, delay: 0.1 }}
          />

          {/* Wavy dividing line */}
          <motion.path
            d="M 50 10 Q 45 25, 50 40 Q 48 55, 50 70 Q 49 85, 50 100"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
            fill="none"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Inner shadow for depth */}
          <path
            d="M 50 5 C 27 5, 12 20, 12 42 C 12 62, 35 95, 50 120 C 65 95, 88 62, 88 42 C 88 20, 73 5, 50 5 Z"
            fill="url(#innerShadow)"
          />

          {/* Left glossy highlight - Blue side */}
          <motion.ellipse
            cx="32"
            cy="22"
            rx="14"
            ry="20"
            fill="url(#shineGradient)"
            transform="rotate(-25 32 22)"
            opacity="0.5"
            initial={animated ? { opacity: 0, scale: 0 } : false}
            animate={animated ? { opacity: 0.5, scale: 1 } : false}
            transition={{ delay: 0.6, duration: 0.5 }}
          />

          {/* Right glossy highlight - Turquoise side */}
          <motion.ellipse
            cx="68"
            cy="22"
            rx="14"
            ry="20"
            fill="url(#shineGradient)"
            transform="rotate(25 68 22)"
            opacity="0.4"
            initial={animated ? { opacity: 0, scale: 0 } : false}
            animate={animated ? { opacity: 0.4, scale: 1 } : false}
            transition={{ delay: 0.7, duration: 0.5 }}
          />

          {/* White Route Path - Diamond Pattern */}
          {/* Top to Left */}
          <motion.line
            x1="50" y1="28"
            x2="35" y2="40"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ delay: 0.8, duration: 0.4 }}
          />
          {/* Left to Bottom */}
          <motion.line
            x1="35" y1="40"
            x2="50" y2="55"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ delay: 0.9, duration: 0.4 }}
          />
          {/* Bottom to Right */}
          <motion.line
            x1="50" y1="55"
            x2="65" y2="43"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ delay: 1.0, duration: 0.4 }}
          />
          {/* Right curved extension */}
          <motion.path
            d="M 65 43 Q 72 38, 78 45"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 1 } : false}
            transition={{ delay: 1.1, duration: 0.4 }}
          />

          {/* Route Nodes (4 main nodes in diamond + 1 extension) */}
          {/* Top node */}
          <motion.circle
            cx="50" cy="28"
            r="6"
            fill="white"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.2, type: 'spring', stiffness: 400 }}
          />
          <motion.circle
            cx="50" cy="28"
            r="3"
            fill="#2B7FCC"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.25, type: 'spring', stiffness: 400 }}
          />

          {/* Left node */}
          <motion.circle
            cx="35" cy="40"
            r="6"
            fill="white"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.3, type: 'spring', stiffness: 400 }}
          />
          <motion.circle
            cx="35" cy="40"
            r="3"
            fill="#2B7FCC"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.35, type: 'spring', stiffness: 400 }}
          />

          {/* Bottom node */}
          <motion.circle
            cx="50" cy="55"
            r="6"
            fill="white"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.4, type: 'spring', stiffness: 400 }}
          />
          <motion.circle
            cx="50" cy="55"
            r="3"
            fill="#2B7FCC"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.45, type: 'spring', stiffness: 400 }}
          />

          {/* Right node */}
          <motion.circle
            cx="65" cy="43"
            r="6"
            fill="white"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.5, type: 'spring', stiffness: 400 }}
          />
          <motion.circle
            cx="65" cy="43"
            r="3"
            fill="#2FB8C8"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.55, type: 'spring', stiffness: 400 }}
          />

          {/* Extension node */}
          <motion.circle
            cx="78" cy="45"
            r="6"
            fill="white"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.6, type: 'spring', stiffness: 400 }}
          />
          <motion.circle
            cx="78" cy="45"
            r="3"
            fill="#2FB8C8"
            initial={animated ? { scale: 0 } : false}
            animate={animated ? { scale: 1 } : false}
            transition={{ delay: 1.65, type: 'spring', stiffness: 400 }}
          />

          {/* Outer glossy edge highlight */}
          <motion.path
            d="M 50 5 C 70 5, 85 18, 87 38"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={animated ? { pathLength: 1, opacity: 0.3 } : false}
            transition={{ delay: 1.7, duration: 0.6 }}
          />
        </svg>

        {/* Floating Animation */}
        {animated && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Text Logo */}
      {showText && (
        <motion.div
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="font-bold tracking-tight leading-none"
          style={{ fontSize: textSize }}
        >
          <span style={{ color: '#1E5FA1' }}>Yatri</span>
          <span style={{ color: '#2FB8C8' }}>Connect</span>
        </motion.div>
      )}
    </div>
  );
}
