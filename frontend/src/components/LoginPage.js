import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Handle OAuth callback and check existing session
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return;
        if (data.session) {
          if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          navigate('/dashboard');
          return;
        }
        const { data: storedSession } = await supabase.auth.getSession();
        if (storedSession.session) {
          navigate('/dashboard');
        }
      } catch (error) {}
    };
    handleAuthCallback();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          if (window.location.hash) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          navigate('/dashboard');
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.fullName } }
        });
        if (error) {
          setError(error.message);
        } else if (data.user) {
          if (data.user.email_confirmed_at) {
            navigate('/dashboard');
          } else {
            setError('Please check your email for confirmation link');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          setError(error.message);
        } else if (data.user) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login` }
      });
      if (error) {
        setError('Error with Google login: ' + error.message);
        setLoading(false);
      }
    } catch (error) {
      setError('An unexpected error occurred with Google login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white relative overflow-hidden px-4">
      {/* Shimmer effect overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-transparent to-purple-500/20 pointer-events-none z-0"
      />
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Back Button */}
        <motion.button
          className="flex items-center text-blue-300 hover:text-blue-400 transition-colors duration-300 mb-8"
          onClick={() => navigate('/')}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </motion.button>
        {/* Card */}
        <motion.div
          className="bg-gray-900/90 rounded-3xl p-8 shadow-2xl border border-gray-800"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0.7, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 10, delay: 0.1 }}
            className="mb-6 flex items-center justify-center"
          >
            <div className="bg-gray-950 rounded-2xl p-5 shadow-lg flex items-center justify-center">
              <Shield className="w-12 h-12 text-blue-400 drop-shadow-lg" />
            </div>
          </motion.div>
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-white">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-blue-300 mb-8 text-center">
            {isSignUp
              ? 'Create your SentryWallet account to get started'
              : 'Sign in to your SentryWallet account'}
          </p>
          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-900/80 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-blue-300 transition-all duration-200"
                    placeholder="Enter your full name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-blue-300 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-950 border border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-blue-300 transition-all duration-200"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  required
                  minLength={isSignUp ? 6 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-blue-400 mt-1">Password must be at least 6 characters long</p>
              )}
            </div>
            {/* Submit Button */}
            <motion.button
              type="submit"
              className={`w-full flex items-center justify-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                loading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
              }`}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </motion.button>
          </form>
          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-blue-400">OR</span>
            </div>
          </div>
          {/* Google Login Button */}
          <motion.button
            className={`w-full flex items-center justify-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 mb-6 ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-blue-400 text-blue-200'
            }`}
            onClick={handleGoogleLogin}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>
          {/* Toggle Login/Signup */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '', fullName: '' });
              }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
          {/* Security Note */}
          <div className="mt-6 text-sm text-blue-400 leading-relaxed text-center">
            <Shield className="w-4 h-4 inline mr-1" />
            Your account is secured with industry-standard encryption and social recovery features.
          </div>
        </motion.div>
        {/* Additional Info */}
        <motion.div
          className="mt-6 text-center text-xs text-blue-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;