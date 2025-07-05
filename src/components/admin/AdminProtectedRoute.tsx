import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'content_manager';
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'content_manager' 
}) => {
  const { isAuthenticated, isLoading, hasPermission } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!hasPermission(requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this resource.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};