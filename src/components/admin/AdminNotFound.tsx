import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Search, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminNotFound: React.FC = () => {
  const navigate = useNavigate();
  const { adminUser, hasPermission } = useAdminAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const availableRoutes = [
    { path: '/admin/dashboard', label: 'Dashboard', permission: 'content_manager' },
    { path: '/admin/users', label: 'User Management', permission: 'content_manager' },
    { path: '/admin/resources', label: 'Resource Management', permission: 'content_manager' },
    { path: '/admin/categories', label: 'Category Management', permission: 'content_manager' },
    { path: '/admin/analytics', label: 'Analytics', permission: 'content_manager' },
    { path: '/admin/settings', label: 'System Settings', permission: 'super_admin' }
  ].filter(route => hasPermission(route.permission as 'super_admin' | 'content_manager'));

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* 404 Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="relative">
                <Shield className="h-10 w-10 text-orange-400" />
                <Search className="h-5 w-5 text-orange-400 absolute -bottom-1 -right-1" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Admin Page Not Found</h2>
            <p className="text-gray-400">
              The admin page you're looking for doesn't exist or you don't have permission to access it.
            </p>
          </div>

          {/* Admin Info */}
          {adminUser && (
            <div className="mb-6 p-4 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {adminUser.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">{adminUser.full_name}</p>
                  <p className="text-blue-300 text-sm capitalize">
                    {adminUser.role?.replace('_', ' ')} • Logged in
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="text-yellow-400 font-medium">Security Notice</h3>
                <p className="text-yellow-300 text-sm">
                  This access attempt has been logged. Unauthorized access attempts are monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Available Routes */}
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-4">Available Admin Pages:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => navigate(route.path)}
                  className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                >
                  <span className="text-white text-sm">{route.label}</span>
                  <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>

            <button
              onClick={handleGoToDashboard}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </button>
          </div>

          {/* Error ID */}
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-500">
              Access Attempt ID: {Date.now().toString(36).toUpperCase()} • 
              Time: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminNotFound;