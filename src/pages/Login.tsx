import React, { useState, useEffect } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, login, user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  const signupSuccess = searchParams.get('signup') === 'success';
  const emailVerified = searchParams.get('verified') === 'true';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Clear URL parameters after showing success messages
    if (signupSuccess || emailVerified || errorParam) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/login');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [signupSuccess, emailVerified, errorParam]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Check if user needs to complete profile
    if (user?.isFirstLogin) {
      return <Navigate to="/profile-enhancement" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.endsWith('@kgpian.iitkgp.ac.in')) {
      setError('Please use your official @kgpian.iitkgp.ac.in email address');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'verification_failed':
        return 'Email verification failed. Please try the verification link again.';
      case 'invalid_link':
        return 'Invalid verification link. Please check your email for a valid link.';
      case 'auth_failed':
        return 'Authentication failed. Please try logging in again.';
      case 'unexpected':
        return 'An unexpected error occurred. Please try again.';
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage(errorParam);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <BookOpen className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">VidyaSagar</h1>
          </motion.div>
          <p className="text-gray-300 text-lg">Academic Resource Platform</p>
          <p className="text-gray-400 text-sm mt-2">IIT Kharagpur</p>
        </div>

        {/* Success Messages */}
        {signupSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-green-400 font-medium">Account created successfully!</h3>
                <p className="text-green-300 text-sm">Please check your email and click the verification link to complete your registration.</p>
              </div>
            </div>
          </motion.div>
        )}

        {emailVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <div>
                <h3 className="text-green-400 font-medium">Email verified successfully!</h3>
                <p className="text-green-300 text-sm">You can now sign in with your credentials.</p>
              </div>
            </div>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-medium">Authentication Error</h3>
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Login Link */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-orange-400" />
            <div className="flex-1">
              <h3 className="text-orange-400 font-medium">Admin Access</h3>
              <p className="text-orange-300 text-sm">
                If you are an administrator, please use the{' '}
                <Link to="/admin/login" className="text-orange-200 hover:text-orange-100 underline font-medium">
                  admin login page
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-red-400 bg-red-500 bg-opacity-10 p-3 rounded-lg border border-red-500 border-opacity-30"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@kgpian.iitkgp.ac.in"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                Create one here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Use your official @kgpian.iitkgp.ac.in email address
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 grid grid-cols-2 gap-4 text-center"
        >
          <>
            <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4">
              <h3 className="text-blue-400 font-medium mb-1">10,000+</h3>
              <p className="text-gray-400 text-sm">Resources</p>
            </div>
            <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4">
              <h3 className="text-blue-400 font-medium mb-1">500+</h3>
              <p className="text-gray-400 text-sm">Students</p>
            </div>
          </>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;