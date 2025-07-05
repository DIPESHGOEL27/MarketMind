import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console and external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error tracking service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error tracking service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || 'anonymous'
    };

    // Example: Send to error tracking service
    console.log('Error logged:', errorData);
    
    // Store in localStorage for debugging
    const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    errors.push(errorData);
    localStorage.setItem('errorLogs', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: this.state.retryCount + 1
        });
      }, this.retryDelay * (this.state.retryCount + 1));
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private sendErrorReport = () => {
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };

    // In a real app, this would send to your support system
    console.log('Error report sent:', errorReport);
    alert('Error report sent successfully!');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
              {/* Error Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                <p className="text-gray-400">
                  We encountered an unexpected error. Our team has been notified.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {isDevelopment && this.state.error && (
                <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-red-500 border-opacity-30">
                  <h3 className="text-red-400 font-medium mb-2">Error Details (Dev Mode)</h3>
                  <p className="text-red-300 text-sm mb-2">{this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Try Again ({this.maxRetries - this.state.retryCount} left)</span>
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reload Page</span>
                </button>
              </div>

              {/* Support Actions */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.sendErrorReport}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Send Error Report</span>
                  </button>
                  
                  <div className="flex-1 text-center text-sm text-gray-400">
                    Error ID: {Date.now().toString(36).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Retry Information */}
              {!canRetry && this.state.retryCount >= this.maxRetries && (
                <div className="mt-4 p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Maximum retry attempts reached. Please reload the page or contact support.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;