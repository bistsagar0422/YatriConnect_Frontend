import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, User, Phone, Shield, Check, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { YatriConnectLogo } from './YatriConnectLogo';

interface SignupProps {
  onSignup: (data: { name: string; email: string; phone: string; password: string }) => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : 
    password.length < 6 ? 1 : 
    password.length < 10 ? 2 : 3;

  const strengthColors = ['#E9ECEF', '#FF6B6B', '#FFB547', '#51CF66'];
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    onSignup({ name, email, phone, password });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center p-5 overflow-y-auto">
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
        className="w-full max-w-md relative z-10 my-8"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <YatriConnectLogo size={100} showText={true} animated={true} />
          <h1 className="text-[#343A40] text-3xl font-bold mb-2 mt-6">Create Account</h1>
          <p className="text-[#6C757D]">Join the smart mobility platform</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <label className="text-[#343A40] text-sm font-semibold mb-2 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C757D]">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rajesh Kumar"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#E9ECEF]/50 border-2 border-transparent focus:border-[#4DA8DA] focus:bg-white transition-all text-[#343A40] placeholder:text-[#ADB5BD] outline-none"
                  />
                </div>
              </div>

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

              {/* Phone Input */}
              <div>
                <label className="text-[#343A40] text-sm font-semibold mb-2 block">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C757D]">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
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
                    placeholder="Create a strong password"
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
                
                {/* Password Strength Indicator */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: passwordStrength >= level ? strengthColors[passwordStrength] : '#E9ECEF'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-[#343A40] text-sm font-semibold mb-2 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6C757D]">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-12 pr-14 py-4 rounded-2xl bg-[#E9ECEF]/50 border-2 border-transparent focus:border-[#4DA8DA] focus:bg-white transition-all text-[#343A40] placeholder:text-[#ADB5BD] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#343A40] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#FF6B6B] text-xs mt-1"
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-lg border-2 transition-all ${
                    agreeToTerms 
                      ? 'bg-[#4DA8DA] border-[#4DA8DA]' 
                      : 'bg-[#E9ECEF]/50 border-[#ADB5BD] group-hover:border-[#4DA8DA]'
                  }`}>
                    {agreeToTerms && (
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
                <span className="text-[#343A40] text-sm leading-relaxed">
                  I agree to the{' '}
                  <button type="button" className="text-[#4DA8DA] font-semibold hover:underline">
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" className="text-[#4DA8DA] font-semibold hover:underline">
                    Privacy Policy
                  </button>
                </span>
              </label>

              {/* Sign Up Button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={!agreeToTerms || password !== confirmPassword}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4DA8DA] to-[#73C2FB] text-white font-bold text-lg shadow-lg shadow-[#4DA8DA]/30 hover:shadow-xl hover:shadow-[#4DA8DA]/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-[#6C757D]">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#4DA8DA] font-semibold hover:text-[#3B8AB8] transition-colors"
            >
              Sign in
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
                  Privacy-first platform
                </p>
                <p className="text-[#6C757D] text-[10px] leading-relaxed">
                  Your data is encrypted and stored locally. We never share your personal information.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}