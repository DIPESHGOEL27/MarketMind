import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  FileText,
  Eye,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

interface TopResource {
  id: string;
  title: string;
  type: string;
  view_count: number;
  download_count: number;
  category_name?: string;
}

interface UserActivity {
  date: string;
  new_users: number;
  active_users: number;
  total_views: number;
  total_downloads: number;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topResources, setTopResources] = useState<TopResource[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchTopResources();
    fetchUserActivity();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_analytics', {
        days_back: parseInt(timeRange)
      });
      
      if (error) {
        console.error('Error fetching analytics:', error);
      } else if (data && data.length > 0) {
        setAnalytics(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTopResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          type,
          view_count,
          download_count,
          categories (
            name
          )
        `)
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(10);

      if (!error && data) {
        setTopResources(data.map(item => ({
          ...item,
          category_name: item.categories?.name
        })));
      }
    } catch (error) {
      console.error('Error fetching top resources:', error);
    }
  };

  const fetchUserActivity = async () => {
    try {
      // Generate sample data for the last 30 days
      const days = parseInt(timeRange);
      const activityData: UserActivity[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        activityData.push({
          date: date.toISOString().split('T')[0],
          new_users: Math.floor(Math.random() * 10) + 1,
          active_users: Math.floor(Math.random() * 50) + 10,
          total_views: Math.floor(Math.random() * 200) + 50,
          total_downloads: Math.floor(Math.random() * 50) + 10
        });
      }
      
      setUserActivity(activityData);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAnalytics(),
      fetchTopResources(),
      fetchUserActivity()
    ]);
    setRefreshing(false);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.total_users || 0,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      label: 'Active Users',
      value: analytics?.active_users || 0,
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      label: 'Total Views',
      value: analytics?.total_views || 0,
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500',
      change: '+23%',
      changeType: 'positive' as const
    },
    {
      label: 'Total Downloads',
      value: analytics?.total_downloads || 0,
      icon: Download,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500',
      change: '+15%',
      changeType: 'positive' as const
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
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Platform insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stat.value.toLocaleString()}
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
              <div className={`p-3 ${stat.bgColor} bg-opacity-20 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">User Activity Trend</h2>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 text-sm">Daily Activity</span>
            </div>
          </div>
          
          {/* Simple Bar Chart Representation */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
              <span>Date</span>
              <span>New Users</span>
              <span>Active Users</span>
              <span>Views</span>
            </div>
            
            {userActivity.slice(-7).map((day, index) => (
              <div key={day.date} className="grid grid-cols-4 gap-4 items-center">
                <span className="text-gray-300 text-sm">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(day.new_users / 10) * 100}%`, minWidth: '8px' }}
                  ></div>
                  <span className="text-white text-sm">{day.new_users}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(day.active_users / 60) * 100}%`, minWidth: '8px' }}
                  ></div>
                  <span className="text-white text-sm">{day.active_users}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(day.total_views / 250) * 100}%`, minWidth: '8px' }}
                  ></div>
                  <span className="text-white text-sm">{day.total_views}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Resources */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Top Resources</h2>
            <PieChart className="h-5 w-5 text-orange-400" />
          </div>
          
          <div className="space-y-4">
            {topResources.slice(0, 8).map((resource, index) => (
              <div key={resource.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-red-600 rounded-full text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white text-sm font-medium truncate">{resource.title}</h3>
                    <p className="text-gray-400 text-xs capitalize">
                      {resource.type} • {resource.category_name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{resource.view_count}</p>
                  <p className="text-gray-400 text-xs">views</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Content Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Content Performance</h2>
          <div className="flex items-center space-x-4">
            <button className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center space-x-1">
              <ExternalLink className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Resource Types Distribution */}
          <div className="bg-gray-750 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Resource Types</h3>
            <div className="space-y-3">
              {[
                { type: 'PDF Documents', count: 856, color: 'bg-red-500' },
                { type: 'Video Content', count: 234, color: 'bg-blue-500' },
                { type: 'Study Notes', count: 157, color: 'bg-green-500' },
                { type: 'External Links', count: 89, color: 'bg-purple-500' }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="text-gray-300 text-sm">{item.type}</span>
                  </div>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-gray-750 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Engagement</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Avg. Session Duration</span>
                <span className="text-white font-medium">12m 34s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Pages per Session</span>
                <span className="text-white font-medium">4.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Bounce Rate</span>
                <span className="text-white font-medium">23%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Return Users</span>
                <span className="text-white font-medium">68%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-750 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Recent Highlights</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-white text-sm">Peak traffic: 2.3k active users</p>
                  <p className="text-gray-400 text-xs">Today at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-white text-sm">New record: 1.2k downloads</p>
                  <p className="text-gray-400 text-xs">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-white text-sm">Resource uploaded: Marine Design</p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;