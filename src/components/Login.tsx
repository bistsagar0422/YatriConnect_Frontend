import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { YatriConnectLogo } from './YatriConnectLogo';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignup: () => void;
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center p-5">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-[#4DA8DA]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-[#FFB547]/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <YatriConnectLogo size={100} showText={true} animated={true} />
          <h1 className="text-[#343A40] text-3xl font-bold mb-2 mt-6">Welcome Back</h1>
          <p className="text-[#6C757D]">Sign in to your safety platform</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-[#343A40] text-sm font-semibold mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C757D]">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh.kumar@example.com"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#E9ECEF]/50 border-2 border-transparent focus:border-[#4DA8DA] focus:bg-white transition-all text-[#343A40] placeholder:text-[#ADB5BD] outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-[#343A40] text-sm font-semibold mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C757D]">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-14 py-4 rounded-2xl bg-[#E9ECEF]/50 border-2 border-transparent focus:border-[#4DA8DA] focus:bg-white transition-all text-[#343A40] placeholder:text-[#ADB5BD] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#343A40] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-lg border-2 transition-all ${
                      rememberMe 
                        ? 'bg-[#4DA8DA] border-[#4DA8DA]' 
                        : 'bg-[#E9ECEF]/50 border-[#ADB5BD] group-hover:border-[#4DA8DA]'
                    }`}>
                      {rememberMe && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full text-white p-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[#343A40] text-sm">Remember me</span>
                </label>

                <button
                  type="button"
                  className="text-[#4DA8DA] text-sm font-semibold hover:text-[#3B8AB8] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4DA8DA] to-[#73C2FB] text-white font-bold text-lg shadow-lg shadow-[#4DA8DA]/30 hover:shadow-xl hover:shadow-[#4DA8DA]/40 transition-all flex items-center justify-center gap-2 group"
              >
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* Biometric Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DEE2E6]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/80 px-4 py-1 rounded-full text-[#6C757D]">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-4 rounded-2xl bg-[#E9ECEF]/50 border-2 border-white/40 text-[#343A40] font-semibold hover:bg-[#E9ECEF] transition-all"
              >
                🔐 Face ID / Touch ID
              </button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-[#6C757D]">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-[#4DA8DA] font-semibold hover:text-[#3B8AB8] transition-colors"
            >
              Sign up
            </button>
          </p>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#51CF66]/10">
                <Shield size={16} className="text-[#51CF66]" />
              </div>
              <div>
                <p className="text-[#343A40] font-semibold text-xs mb-1">
                  Your data is protected
                </p>
                <p className="text-[#6C757D] text-[10px] leading-relaxed">
                  End-to-end encrypted authentication. Your credentials are never stored on our servers.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}