import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Video,
  FolderTree,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminUser, logout, hasPermission } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      permission: 'content_manager'
    },
    { 
      path: '/admin/users', 
      icon: Users, 
      label: 'User Management',
      permission: 'content_manager'
    },
    { 
      path: '/admin/resources', 
      icon: FileText, 
      label: 'Resources',
      permission: 'content_manager'
    },
    { 
      path: '/admin/videos', 
      icon: Video, 
      label: 'Videos',
      permission: 'content_manager'
    },
    { 
      path: '/admin/categories', 
      icon: FolderTree, 
      label: 'Categories',
      permission: 'content_manager'
    },
    { 
      path: '/admin/analytics', 
      icon: BarChart3, 
      label: 'Analytics',
      permission: 'content_manager'
    },
    { 
      path: '/admin/settings', 
      icon: Settings, 
      label: 'Settings',
      permission: 'super_admin'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(item.permission as 'super_admin' | 'content_manager')
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 bottom-0 w-80 bg-gray-800 border-r border-gray-700 z-50 lg:translate-x-0 lg:static lg:z-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                  <p className="text-gray-400 text-sm">VidyaSagar</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Admin Info */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {adminUser?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{adminUser?.full_name}</p>
                <p className="text-gray-400 text-sm capitalize">
                  {adminUser?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {filteredMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Page Content */}
          <main className="p-6 overflow-y-auto">
            {/* Debug info in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                Current path: {location.pathname}
              </div>
            )}
            <Outlet />
          </main>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admin panel..."
                    className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  2
                </span>
              </button>

              {/* Admin Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {adminUser?.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="hidden sm:block text-white text-sm">
                  {adminUser?.full_name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;