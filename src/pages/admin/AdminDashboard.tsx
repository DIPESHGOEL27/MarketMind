import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Eye,
  Download,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Globe,
  Shield,
  Database,
  Settings,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Bell,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_resources: number;
  published_resources: number;
  total_views: number;
  total_downloads: number;
  recent_signups: number;
  most_viewed_resources: any[];
}

interface SystemHealth {
  database_status: 'healthy' | 'warning' | 'error';
  storage_usage: number;
  api_response_time: number;
  active_sessions: number;
  error_rate: number;
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { adminUser } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchSystemHealth();
    fetchRecentActivity();
    fetchPendingActions();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_analytics', { days_back: 30 });
      
      if (error) {
        console.error('Error fetching analytics:', error);
      } else if (data && data.length > 0) {
        setAnalytics(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    // Simulate system health data - in real app, this would come from monitoring APIs
    setSystemHealth({
      database_status: 'healthy',
      storage_usage: 67,
      api_response_time: 145,
      active_sessions: 1234,
      error_rate: 0.02
    });
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select(`
          *,
          admin_users!inner(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchPendingActions = async () => {
    // Mock pending actions - in real app, this would come from various tables
    setPendingActions([
      { id: 1, type: 'user_verification', count: 5, description: 'Users pending email verification' },
      { id: 2, type: 'resource_approval', count: 3, description: 'Resources pending approval' },
      { id: 3, type: 'scheduled_content', count: 8, description: 'Content scheduled for publishing' },
      { id: 4, type: 'reported_content', count: 2, description: 'Content reported by users' }
    ]);
  };

  const fetchNotifications = async () => {
    setNotifications([
      { id: 1, type: 'warning', message: 'High server load detected', time: '5 minutes ago' },
      { id: 2, type: 'info', message: 'Weekly backup completed successfully', time: '2 hours ago' },
      { id: 3, type: 'success', message: '50 new users registered today', time: '4 hours ago' }
    ]);
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(),
      fetchSystemHealth(),
      fetchRecentActivity(),
      fetchPendingActions(),
      fetchNotifications()
    ]);
    setRefreshing(false);
  };

  const quickActions = [
    { 
      label: 'Add User', 
      icon: Users, 
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => navigate('/admin/users')
    },
    { 
      label: 'Upload Resource', 
      icon: FileText, 
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => navigate('/admin/resources')
    },
    { 
      label: 'Create Category', 
      icon: Plus, 
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/admin/categories')
    },
    { 
      label: 'View Analytics', 
      icon: BarChart3, 
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => navigate('/admin/analytics')
    },
    { 
      label: 'System Settings', 
      icon: Settings, 
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => navigate('/admin/settings')
    }
  ];

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.total_users || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const,
      onClick: () => navigate('/admin/users')
    },
    {
      label: 'Active Users (30d)',
      value: analytics?.active_users || 0,
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500',
      change: '+8%',
      changeType: 'positive' as const,
      onClick: () => navigate('/admin/analytics')
    },
    {
      label: 'Total Resources',
      value: analytics?.total_resources || 0,
      icon: FileText,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500',
      change: '+5%',
      changeType: 'positive' as const,
      onClick: () => navigate('/admin/resources')
    },
    {
      label: 'Total Views',
      value: analytics?.total_views || 0,
      icon: Eye,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500',
      change: '+23%',
      changeType: 'positive' as const,
      onClick: () => navigate('/admin/analytics')
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {adminUser?.full_name} • {adminUser?.role?.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefreshData}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>View Site</span>
          </button>
        </div>
      </div>

      {/* System Health Status */}
      {systemHealth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>System Health</span>
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">All systems operational</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-lg font-bold text-white">DB</span>
              </div>
              <p className="text-green-400 text-sm">Healthy</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-white">{systemHealth.storage_usage}%</span>
              </div>
              <p className="text-gray-400 text-sm">Storage Used</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-white">{systemHealth.api_response_time}ms</span>
              </div>
              <p className="text-gray-400 text-sm">API Response</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-white">{systemHealth.active_sessions}</span>
              </div>
              <p className="text-gray-400 text-sm">Active Sessions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-lg font-bold text-white">{(systemHealth.error_rate * 100).toFixed(2)}%</span>
              </div>
              <p className="text-gray-400 text-sm">Error Rate</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white p-4 rounded-lg transition-colors flex flex-col items-center space-y-2 hover:scale-105 transform duration-200`}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={stat.onClick}
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <span className={`text-sm ml-1 ${
                    stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 ${stat.bgColor} bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Admin Activity</h2>
            <button 
              onClick={() => navigate('/admin/logs')}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.slice(0, 8).map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {activity.admin_users?.full_name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm">
                      <span className="font-medium">{activity.admin_users?.full_name}</span>
                      <span className="text-gray-400 ml-1">{activity.action}</span>
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-xs">{activity.table_name}</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent admin activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-400" />
              <span>Pending Actions</span>
            </h3>
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                  <div>
                    <p className="text-white text-sm font-medium">{action.description}</p>
                    <p className="text-gray-400 text-xs">{action.type.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-400 font-bold">{action.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              <span>System Notifications</span>
            </h3>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 bg-gray-750 rounded-lg">
                  <div className="flex items-start space-x-2">
                    {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />}
                    {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />}
                    {notification.type === 'info' && <Globe className="h-4 w-4 text-blue-400 mt-0.5" />}
                    <div>
                      <p className="text-white text-sm">{notification.message}</p>
                      <p className="text-gray-400 text-xs">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Resource Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              <span>Top Resources</span>
            </h3>
            <div className="space-y-3">
              {analytics?.most_viewed_resources?.slice(0, 5).map((resource, index) => (
                <div key={resource.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400 font-bold text-sm">{index + 1}</span>
                    <div>
                      <p className="text-white text-sm truncate">{resource.title}</p>
                      <p className="text-gray-400 text-xs">{resource.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium text-sm">{resource.view_count}</p>
                    <p className="text-gray-400 text-xs">views</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-400">
                  <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;