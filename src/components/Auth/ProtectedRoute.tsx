import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingBoundary from '../LoadingBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Temporarily bypass authentication for demo purposes
  const BYPASS_AUTH = true; // Set to false to re-enable authentication

  if (BYPASS_AUTH) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <LoadingBoundary 
      isLoading={true} 
      timeout={15000}
      loadingText="Authenticating..."
      retryFunction={() => window.location.reload()}
    />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};