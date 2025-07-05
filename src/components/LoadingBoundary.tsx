import React, { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingBoundaryProps {
  children: ReactNode;
  isLoading?: boolean;
  timeout?: number; // in milliseconds
  onTimeout?: () => void;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  retryFunction?: () => void;
  loadingText?: string;
}

interface LoadingState {
  isTimeout: boolean;
  hasTimedOut: boolean;
  startTime: number;
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  children,
  isLoading = false,
  timeout = 30000, // 30 seconds default
  onTimeout,
  loadingComponent,
  errorComponent,
  retryFunction,
  loadingText = 'Loading...'
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isTimeout: false,
    hasTimedOut: false,
    startTime: Date.now()
  });

  useEffect(() => {
    if (!isLoading) {
      setLoadingState({
        isTimeout: false,
        hasTimedOut: false,
        startTime: Date.now()
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoadingState(prev => ({
        ...prev,
        isTimeout: true,
        hasTimedOut: true
      }));
      
      if (onTimeout) {
        onTimeout();
      }
      
      // Log timeout event
      console.warn(`Loading timeout after ${timeout}ms`);
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isLoading, timeout, onTimeout]);

  const handleRetry = () => {
    setLoadingState({
      isTimeout: false,
      hasTimedOut: false,
      startTime: Date.now()
    });
    
    if (retryFunction) {
      retryFunction();
    }
  };

  // Show timeout error
  if (loadingState.isTimeout && isLoading) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
            <div className="w-16 h-16 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Loading Timeout</h2>
            <p className="text-gray-400 mb-6">
              The page is taking longer than expected to load. This might be due to a slow network connection.
            </p>
            
            <div className="space-y-3">
              {retryFunction && (
                <button
                  onClick={handleRetry}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Page</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Timeout after {timeout / 1000} seconds
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            {/* Animated circles */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-2 border-red-500 border-b-transparent rounded-full"
              />
            </div>
            
            <motion.h2
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl font-semibold text-white mb-2"
            >
              {loadingText}
            </motion.h2>
            
            <p className="text-gray-400 text-sm">
              Please wait while we load your content
            </p>
            
            {/* Progress indicator */}
            <div className="mt-4 w-48 h-1 bg-gray-700 rounded-full mx-auto overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-red-500 rounded-full"
              />
            </div>
            
            {/* Time indicator */}
            <p className="text-xs text-gray-500 mt-3">
              Loading for {Math.floor((Date.now() - loadingState.startTime) / 1000)}s
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingBoundary;