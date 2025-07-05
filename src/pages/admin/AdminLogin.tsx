import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, Wifi, WifiOff, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { motion } from 'framer-motion';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  const { isAuthenticated, login } = useAdminAuth();
  const location = useLocation();
  
  // Ensure we always redirect to dashboard after login
  const from = '/admin/dashboard';

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch(window.location.origin, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        setConnectionStatus('online');
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (connectionStatus === 'offline') {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    console.log('Starting admin login process...');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      } else {
        // Force navigation to dashboard on successful login
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message?.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setConnectionStatus('checking');
    window.location.reload();
  };

  const handleTestCredentials = () => {
    setEmail('dipeshgoel@kgpian.iitkgp.ac.in');
    setPassword('ADMIN@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="p-3 bg-red-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          </motion.div>
          <p className="text-gray-300">VidyaSagar Administration</p>
          <p className="text-gray-400 text-sm mt-2">Authorized access only</p>
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            {connectionStatus === 'online' ? (
              <div className="flex items-center space-x-1 text-green-400 text-sm">
                <Wifi className="h-4 w-4" />
                <span>Connected</span>
              </div>
            ) : connectionStatus === 'offline' ? (
              <div className="flex items-center space-x-1 text-red-400 text-sm">
                <WifiOff className="h-4 w-4" />
                <span>No Connection</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                <span>Checking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Regular User Login Link */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <ArrowLeft className="h-6 w-6 text-blue-400" />
            <div className="flex-1">
              <h3 className="text-blue-400 font-medium">Student/User Access</h3>
              <p className="text-blue-300 text-sm">
                For regular student access, use the{' '}
                <Link to="/login" className="text-blue-200 hover:text-blue-100 underline font-medium">
                  student login page
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Demo Notice */}
        <div className="mb-6 p-4 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-blue-400 font-medium text-sm">Demo Environment</p>
              <p className="text-blue-300 text-xs mb-2">
                This is a demo environment. Use the test credentials below.
              </p>
              <button
                onClick={handleTestCredentials}
                className="text-xs text-blue-300 hover:text-blue-200 underline"
              >
                Click to fill test credentials
              </button>
            </div>
          </div>
        </div>

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
                <div className="flex-1">
                  <span className="text-sm">{error}</span>
                  {(error.includes('connection') || error.includes('timeout')) && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="block text-xs text-red-300 hover:text-red-200 mt-1 underline"
                    >
                      Click to retry
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading || connectionStatus === 'offline'}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder="Enter admin password"
                  disabled={isLoading || connectionStatus === 'offline'}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || connectionStatus === 'offline'}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </div>
              ) : connectionStatus === 'offline' ? (
                'No Connection'
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium text-sm">Security Notice</p>
                <p className="text-yellow-300 text-xs">
                  This area is restricted to authorized administrators only. All access attempts are logged.
                </p>
              </div>
            </div>
          </div>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg text-xs">
              <p className="text-gray-300 mb-1">Debug Info:</p>
              <p className="text-gray-400">Email: dipeshgoel@kgpian.iitkgp.ac.in</p>
              <p className="text-gray-400">Password: ADMIN@123</p>
              <p className="text-gray-400">Connection: {connectionStatus}</p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-xs text-gray-400"
        >
          VidyaSagar Admin Portal • IIT Kharagpur
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;