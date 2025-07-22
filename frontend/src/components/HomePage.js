import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const LoadingScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white relative overflow-hidden">
      {/* Animated central icon */}
      <motion.div
        initial={{ scale: 0.7, rotate: -30, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 10 }}
        className="mb-8"
      >
        <div className="bg-gray-900 rounded-3xl p-8 shadow-xl flex items-center justify-center">
          <Shield className="w-20 h-20 text-blue-400 drop-shadow-lg" />
        </div>
      </motion.div>

      {/* Animated tagline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="text-3xl md:text-4xl font-bold mb-4 text-center"
      >
        SentryWallet
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-lg md:text-xl text-blue-300 mb-8 text-center"
      >
        Securing your assets...
      </motion.p>

      {/* Spinner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"
      />

      {/* Shimmer effect overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-transparent to-purple-500/20 pointer-events-none"
      />
    </div>
  );
};

export default LoadingScreen;