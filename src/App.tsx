import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MarketDataProvider } from './contexts/MarketDataContext';
import { SentimentProvider } from './contexts/SentimentContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StockAnalysis from './pages/StockAnalysis';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingBoundary from './components/LoadingBoundary';

// Add error fallback component
const AppErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center">
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">MarketMind Error</h1>
        <p className="text-gray-400 mb-6">
          Something went wrong while loading the market data.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-10 rounded-lg text-left">
            <p className="text-red-400 text-sm font-mono">{error.message}</p>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reload Application
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  </div>
);
function App() {
  return (
    <ErrorBoundary fallback={<AppErrorFallback />}>
      <AuthProvider>
        <MarketDataProvider>
          <SentimentProvider>
            <Router>
              <div className="min-h-screen bg-gray-900 text-white">
                <LoadingBoundary timeout={20000}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Protected Routes */}
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <LoadingBoundary>
                            <Layout>
                              <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/analysis" element={<StockAnalysis />} />
                                <Route path="/portfolio" element={<Portfolio />} />
                                <Route path="/news" element={<News />} />
                                <Route path="/watchlist" element={<Watchlist />} />
                                <Route path="/profile" element={<Profile />} />
                                {/* Catch-all for invalid routes */}
                                <Route path="*" element={
                                  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                                    <div className="text-center">
                                      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                                      <p className="text-gray-400 mb-6">Page not found</p>
                                      <button
                                        onClick={() => window.history.back()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                      >
                                        Go Back
                                      </button>
                                    </div>
                                  </div>
                                } />
                              </Routes>
                            </Layout>
                          </LoadingBoundary>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </LoadingBoundary>
              </div>
            </Router>
          </SentimentProvider>
        </MarketDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;