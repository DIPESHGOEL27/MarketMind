import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Eye,
  BookOpen,
  MessageSquare,
  Calendar,
  Download,
  Heart,
  Trash2,
  MoreHorizontal,
  Check,
  X,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Mail,
  Smartphone,
  Globe,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'assignment',
      title: 'New Assignment Posted',
      description: 'Marine Design Project Phase 2 has been uploaded',
      course: 'NA31002',
      time: '2 hours ago',
      read: false,
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      description: 'Rahul Sharma sent you a message in Ocean Engineering group',
      time: '4 hours ago',
      read: false,
      icon: MessageSquare,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'deadline',
      title: 'Assignment Deadline Reminder',
      description: 'Hydrodynamics calculations due in 2 days',
      course: 'NA31001',
      time: '1 day ago',
      read: true,
      icon: Calendar,
      color: 'text-orange-400'
    },
    {
      id: 4,
      type: 'resource',
      title: 'New Resource Available',
      description: 'Ship Construction Methods video lecture uploaded',
      course: 'NA20204',
      time: '2 days ago',
      read: true,
      icon: Download,
      color: 'text-purple-400'
    },
    {
      id: 5,
      type: 'like',
      title: 'Post Liked',
      description: 'Someone liked your question about wave theory',
      time: '3 days ago',
      read: true,
      icon: Heart,
      color: 'text-red-400'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    // In a real app, this would update the notification status in the backend
    console.log('Mark notification as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    // In a real app, this would mark all notifications as read
    console.log('Mark all notifications as read');
  };

  const handleDeleteNotification = (notificationId: number) => {
    // In a real app, this would delete the notification
    console.log('Delete notification:', notificationId);
  };

  const handleViewProfile = () => {
    setShowProfileMenu(false);
    navigate('/profile');
  };

  const handleEditProfile = () => {
    setShowProfileMenu(false);
    navigate('/profile-enhancement');
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: -10,
      transition: { duration: 0.15 }
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.15 }
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 relative">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources, courses, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">Notifications</h3>
                      <p className="text-gray-400 text-sm">{unreadCount} unread</p>
                    </div>
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                          !notification.read ? 'bg-blue-500 bg-opacity-5' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-700 ${notification.color}`}>
                            <notification.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                                <p className="text-gray-400 text-sm mt-1">{notification.description}</p>
                                {notification.course && (
                                  <span className="inline-block mt-2 px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                                    {notification.course}
                                  </span>
                                )}
                                <p className="text-gray-500 text-xs mt-2">{notification.time}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-1 hover:bg-gray-600 rounded"
                                    title="Mark as read"
                                  >
                                    <Check className="h-3 w-3 text-green-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="p-1 hover:bg-gray-600 rounded"
                                  title="Delete"
                                >
                                  <X className="h-3 w-3 text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-gray-700">
                    <button className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium py-2">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-6 w-6" />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Settings</h3>
                    <p className="text-gray-400 text-sm">Customize your experience</p>
                  </div>
                  
                  <div className="p-2">
                    {/* Theme Settings */}
                    <div className="p-3 hover:bg-gray-750 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">Theme</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white rounded text-xs">
                          <Moon className="h-3 w-3" />
                          <span>Dark</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-1 hover:bg-gray-600 text-gray-400 rounded text-xs">
                          <Sun className="h-3 w-3" />
                          <span>Light</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-1 hover:bg-gray-600 text-gray-400 rounded text-xs">
                          <Monitor className="h-3 w-3" />
                          <span>Auto</span>
                        </button>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="p-3 hover:bg-gray-750 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-gray-400" />
                          <span className="text-white text-sm">Push Notifications</span>
                        </div>
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                          <div className="absolute right-0 top-0 h-5 w-5 bg-white rounded-full border-2 border-blue-600"></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 hover:bg-gray-750 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-white text-sm">Email Notifications</span>
                        </div>
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                          <div className="absolute right-0 top-0 h-5 w-5 bg-white rounded-full border-2 border-blue-600"></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 hover:bg-gray-750 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-gray-400" />
                          <span className="text-white text-sm">SMS Notifications</span>
                        </div>
                        <div className="w-10 h-5 bg-gray-600 rounded-full relative">
                          <div className="absolute left-0 top-0 h-5 w-5 bg-white rounded-full border-2 border-gray-600"></div>
                        </div>
                      </div>
                    </div>

                    {/* Other Settings */}
                    <div className="border-t border-gray-700 my-2"></div>
                    
                    <button className="w-full flex items-center space-x-2 p-3 hover:bg-gray-750 rounded-lg text-left">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-white text-sm">Language & Region</span>
                    </button>

                    <button className="w-full flex items-center space-x-2 p-3 hover:bg-gray-750 rounded-lg text-left">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-white text-sm">Privacy & Security</span>
                    </button>

                    <button className="w-full flex items-center space-x-2 p-3 hover:bg-gray-750 rounded-lg text-left">
                      <Volume2 className="h-4 w-4 text-gray-400" />
                      <span className="text-white text-sm">Sound Settings</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.department}</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold">{user?.name}</p>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                        <p className="text-gray-500 text-xs">{user?.department}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button 
                      onClick={handleViewProfile}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-750 rounded-lg text-left transition-colors"
                    >
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="text-white text-sm">View Profile</span>
                    </button>
                    
                    <button 
                      onClick={handleEditProfile}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-750 rounded-lg text-left transition-colors"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-white text-sm">Edit Profile</span>
                    </button>
                    
                    <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-750 rounded-lg text-left transition-colors">
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span className="text-white text-sm">Account Settings</span>
                    </button>
                    
                    <div className="border-t border-gray-700 my-2"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-750 rounded-lg text-left transition-colors text-red-400 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showProfileMenu || showNotifications || showSettings) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
            setShowSettings(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;