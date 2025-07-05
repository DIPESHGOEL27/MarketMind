import { useState, useEffect, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  hasTimedOut: boolean;
}

export interface UseLoadingStateOptions {
  timeout?: number;
  maxRetries?: number;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
  onRetry?: (retryCount: number) => void;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    timeout = 30000,
    maxRetries = 3,
    onError,
    onTimeout,
    onRetry
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    hasTimedOut: false
  });

  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Start loading
  const startLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      hasTimedOut: false
    }));

    // Set timeout
    if (timeout > 0) {
      const id = setTimeout(() => {
        setState(prev => ({
          ...prev,
          hasTimedOut: true,
          isLoading: false
        }));
        
        if (onTimeout) {
          onTimeout();
        }
      }, timeout);
      
      setTimeoutId(id);
    }
  }, [timeout, onTimeout]);

  // Stop loading
  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false
    }));

    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  // Set error
  const setError = useCallback((error: string | Error) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: errorMessage
    }));

    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (onError && typeof error !== 'string') {
      onError(error);
    }
  }, [timeoutId, onError]);

  // Retry function
  const retry = useCallback(() => {
    if (state.retryCount >= maxRetries) {
      setError('Maximum retry attempts reached');
      return;
    }

    setState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
      error: null,
      hasTimedOut: false
    }));

    if (onRetry) {
      onRetry(state.retryCount + 1);
    }

    startLoading();
  }, [state.retryCount, maxRetries, onRetry, startLoading, setError]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      hasTimedOut: false
    });

    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    retry,
    reset,
    canRetry: state.retryCount < maxRetries
  };
};

export default useLoadingState;