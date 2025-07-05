import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import LoadingBoundary from '../LoadingBoundary';
import AdminErrorBoundary from './AdminErrorBoundary';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'content_manager' | 'user_manager' | 'analytics_viewer';
  requirePermission?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredRole = 'content_manager',
  requirePermission
}) => {
  const { isAuthenticated, isLoading, hasPermission, adminUser } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <LoadingBoundary
        isLoading={true}
        timeout={20000}
        loadingText="Verifying admin access..."
        retryFunction={() => window.location.reload()}
      />
    );
  }

  if (!isAuthenticated) {
    console.log('Admin not authenticated, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(requiredRole)) {
    console.log('Admin lacks permission:', requiredRole);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
            <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400 mb-6">
              You don't have the required permissions to access this area.
            </p>
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                <p>Required Role: <span className="text-red-400 capitalize">{requiredRole.replace('_', ' ')}</span></p>
                <p>Your Role: <span className="text-blue-400 capitalize">{adminUser?.role?.replace('_', ' ')}</span></p>
              </div>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Admin authenticated with role:', adminUser?.role);
  
  // Ensure we're on a valid admin route
  if (location.pathname === '/admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return (
    <AdminErrorBoundary>
      {children}
    </AdminErrorBoundary>
  );
};

export default AdminRoute;