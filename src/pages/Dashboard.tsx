import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  Heart,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  ArrowRight,
  ExternalLink,
  Play,
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<number[]>([1, 3]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteResources');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const stats = [
    { 
      label: 'Resources Accessed', 
      value: '124', 
      icon: FileText, 
      color: 'text-blue-400',
      onClick: () => navigate('/resources')
    },
    { 
      label: 'Courses Enrolled', 
      value: '8', 
      icon: BookOpen, 
      color: 'text-green-400',
      onClick: () => navigate('/courses')
    },
    { 
      label: 'Study Hours', 
      value: '32', 
      icon: Clock, 
      color: 'text-purple-400',
      onClick: () => navigate('/profile')
    },
    { 
      label: 'Messages', 
      value: '12', 
      icon: MessageSquare, 
      color: 'text-orange-400',
      onClick: () => navigate('/messages')
    }
  ];

  const recentResources = [
    {
      id: 1,
      title: 'Marine Hydrodynamics - Wave Theory',
      course: 'NA31001',
      type: 'PDF',
      size: '2.4 MB',
      lastAccessed: '2 hours ago',
      progress: 75,
      thumbnail: 'https://images.pexels.com/photos/159591/book-education-school-literature-159591.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2',
      downloadUrl: 'https://example.com/marine-hydrodynamics.pdf'
    },
    {
      id: 2,
      title: 'Ship Construction Methods',
      course: 'NA20204',
      type: 'Video',
      size: '45 min',
      lastAccessed: '1 day ago',
      progress: 45,
      thumbnail: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2',
      videoUrl: 'https://example.com/ship-construction-video'
    },
    {
      id: 3,
      title: 'Offshore Technology Handbook',
      course: 'NA41001',
      type: 'PDF',
      size: '5.2 MB',
      lastAccessed: '3 days ago',
      progress: 90,
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2',
      downloadUrl: 'https://example.com/offshore-technology.pdf'
    }
  ];

  const upcomingDeadlines = [
    { 
      id: 1,
      title: 'Marine Design Project', 
      course: 'NA31002', 
      dueDate: '2 days', 
      priority: 'high',
      onClick: () => navigate('/courses')
    },
    { 
      id: 2,
      title: 'Hydrodynamics Assignment', 
      course: 'NA31001', 
      dueDate: '5 days', 
      priority: 'medium',
      onClick: () => navigate('/courses')
    },
    { 
      id: 3,
      title: 'Structural Analysis Report', 
      course: 'NA21004', 
      dueDate: '1 week', 
      priority: 'low',
      onClick: () => navigate('/courses')
    }
  ];

  const activities = [
    { 
      action: 'Downloaded', 
      resource: 'Wave Theory Notes', 
      time: '2 hours ago',
      onClick: () => navigate('/resources')
    },
    { 
      action: 'Completed', 
      resource: 'Ship Design Tutorial', 
      time: '1 day ago',
      onClick: () => navigate('/courses')
    },
    { 
      action: 'Bookmarked', 
      resource: 'Ocean Engineering Basics', 
      time: '2 days ago',
      onClick: () => navigate('/resources')
    },
    { 
      action: 'Shared', 
      resource: 'Marine Structures Guide', 
      time: '3 days ago',
      onClick: () => navigate('/resources')
    }
  ];

  const handleToggleFavorite = (resourceId: number) => {
    const updatedFavorites = favorites.includes(resourceId) 
      ? favorites.filter(id => id !== resourceId)
      : [...favorites, resourceId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteResources', JSON.stringify(updatedFavorites));
    
    const resource = recentResources.find(r => r.id === resourceId);
    const action = favorites.includes(resourceId) ? 'removed from' : 'added to';
    console.log(`"${resource?.title}" ${action} favorites`);
  };

  const handleViewResource = (resource: any) => {
    if (resource.type === 'Video' && resource.videoUrl) {
      window.open(resource.videoUrl, '_blank');
    } else if (resource.downloadUrl) {
      window.open(resource.downloadUrl, '_blank');
    }
  };

  const handleDownloadResource = (resource: any) => {
    if (resource.downloadUrl) {
      const link = document.createElement('a');
      link.href = resource.downloadUrl;
      link.download = `${resource.title}.${resource.type === 'PDF' ? 'pdf' : 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareResource = (resource: any) => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Check out this ${resource.type} from ${resource.course}`,
        url: window.location.href + `?resource=${resource.id}`
      });
    } else {
      const shareUrl = window.location.href + `?resource=${resource.id}`;
      navigator.clipboard.writeText(shareUrl);
      console.log('Share link copied to clipboard');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100">
              {user?.department} • Semester {user?.semester}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              You have 3 upcoming deadlines this week
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Current Semester</p>
            <p className="text-3xl font-bold">{user?.semester}</p>
            <button 
              onClick={() => navigate('/courses')}
              className="mt-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm transition-colors"
            >
              View Courses
            </button>
          </div>
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
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="mt-3 flex items-center text-sm text-gray-400 group-hover:text-blue-400">
              <span>View details</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Resources */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Resources</h2>
            <button 
              onClick={() => navigate('/resources')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={resource.thumbnail} 
                    alt={resource.title}
                    className="w-16 h-10 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {resource.course} • {resource.type} • {resource.size}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${resource.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">{resource.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(resource.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(resource.id)
                        ? 'text-pink-400 bg-pink-400 bg-opacity-20'
                        : 'text-gray-400 hover:text-pink-400 hover:bg-gray-600'
                    }`}
                    title={favorites.includes(resource.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(resource.id) ? 'fill-current' : ''}`} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResource(resource);
                    }}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    title="View resource"
                  >
                    {resource.type === 'Video' ? (
                      <Play className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                    )}
                  </button>
                  
                  {resource.type === 'PDF' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadResource(resource);
                      }}
                      className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-gray-400 hover:text-green-400" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareResource(resource);
                    }}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4 text-gray-400 hover:text-purple-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Upcoming Deadlines */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <motion.div 
                  key={deadline.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={deadline.onClick}
                  className="flex items-center justify-between p-3 bg-gray-750 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors group"
                >
                  <div>
                    <p className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">
                      {deadline.title}
                    </p>
                    <p className="text-gray-400 text-xs">{deadline.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{deadline.dueDate}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      deadline.priority === 'high' 
                        ? 'bg-red-500 bg-opacity-20 text-red-400'
                        : deadline.priority === 'medium'
                        ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        : 'bg-green-500 bg-opacity-20 text-green-400'
                    }`}>
                      {deadline.priority}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/courses')}
              className="w-full mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View All Assignments
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={activity.onClick}
                  className="flex items-start space-x-3 cursor-pointer hover:bg-gray-750 p-2 rounded-lg transition-colors group"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm group-hover:text-blue-400 transition-colors">
                      <span className="text-blue-400">{activity.action}</span> {activity.resource}
                    </p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full mt-4 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              View Full Activity
            </button>
          </div>

          {/* Favorites Preview */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5 text-pink-400 fill-current" />
              <h3 className="text-lg font-semibold text-white">Favorites</h3>
            </div>
            <div className="space-y-3">
              {favorites.length > 0 ? (
                <>
                  {recentResources
                    .filter(resource => favorites.includes(resource.id))
                    .slice(0, 2)
                    .map((resource, index) => (
                      <div key={resource.id} className="flex items-center space-x-2 p-2 hover:bg-gray-750 rounded-lg transition-colors">
                        <img 
                          src={resource.thumbnail} 
                          alt={resource.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{resource.title}</p>
                          <p className="text-gray-400 text-xs">{resource.course}</p>
                        </div>
                      </div>
                    ))
                  }
                  <button 
                    onClick={() => navigate('/profile?tab=favorites')}
                    className="w-full mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>View All Favorites</span>
                    <Heart className="h-3 w-3 fill-current" />
                  </button>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-400 text-sm">No favorites yet</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Use the heart icon to save your favorite resources and courses
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;