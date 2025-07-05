import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Home, RefreshCw, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ErrorBoundary from '../ErrorBoundary';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
}

const AdminErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* Admin Error Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="relative">
                <Shield className="h-8 w-8 text-red-400" />
                <AlertTriangle className="h-4 w-4 text-red-400 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel Error</h1>
            <p className="text-gray-400">
              An error occurred in the admin panel. This incident has been logged for security purposes.
            </p>
          </div>

          {/* Error Summary */}
          <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-medium">Security Notice</h3>
                <p className="text-red-300 text-sm">
                  This error has been logged with your admin session details for security monitoring.
                </p>
              </div>
            </div>
          </div>

          {/* Error Details (if available) */}
          {error && process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
              <h3 className="text-gray-300 font-medium mb-2 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Error Details (Development)</span>
              </h3>
              <p className="text-red-300 text-sm mb-2">{error.message}</p>
              {error.stack && (
                <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          {/* Recovery Actions */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleRetry}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>

              <button
                onClick={handleGoToDashboard}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span>Secure Logout</span>
            </button>
          </div>

          {/* Security Information */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Error ID: {Date.now().toString(36).toUpperCase()} • 
                Time: {new Date().toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All admin panel errors are automatically logged for security monitoring
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminErrorBoundary: React.FC<AdminErrorBoundaryProps> = ({ children }) => {
  const { adminUser } = useAdminAuth();

  const handleAdminError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log admin-specific error details
    const adminErrorLog = {
      timestamp: new Date().toISOString(),
      adminId: adminUser?.id,
      adminEmail: adminUser?.email,
      adminRole: adminUser?.role,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionInfo: {
        isAuthenticated: !!adminUser,
        lastLogin: adminUser?.last_login
      }
    };

    // Log to console (in production, this would go to a security monitoring service)
    console.error('Admin Panel Error:', adminErrorLog);

    // Store in localStorage for debugging (in production, send to security service)
    const adminErrors = JSON.parse(localStorage.getItem('adminErrorLogs') || '[]');
    adminErrors.push(adminErrorLog);
    localStorage.setItem('adminErrorLogs', JSON.stringify(adminErrors.slice(-5))); // Keep last 5

    // In a real application, send to security monitoring service
    // sendToSecurityMonitoring(adminErrorLog);
  };

  return (
    <ErrorBoundary
      fallback={<AdminErrorFallback />}
      onError={handleAdminError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AdminErrorBoundary;