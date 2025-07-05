import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Mail,
  Shield,
  Users,
  FileText,
  Globe,
  Database,
  Bell,
  Lock,
  Server,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Cpu,
  HardDrive,
  Trash2,
  Cloud,
  BarChart3,
  Archive,
  X,
  Info,
  Check,
  Clock,
  Copy,
  GitBranch
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface SystemSettings {
  site_name: string;
  site_description: string;
  admin_email: string;
  allow_registration: boolean;
  require_email_verification: boolean;
  max_file_size_mb: number;
  allowed_file_types: string[];
  maintenance_mode: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  backup_frequency: string;
  session_timeout_hours: number;
  password_min_length: number;
  enable_audit_logs: boolean;
  max_login_attempts: number;
  analytics_enabled: boolean;
  storage_provider: string;
  enable_resource_revisions: boolean;
  content_approval_required: boolean;
  auto_delete_temp_files_days: number;
}

interface BackupInfo {
  id: string;
  size: string;
  created_at: string;
  status: string;
}

const SystemSettings: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'VidyaSagar',
    site_description: 'Academic Resource Platform for IIT Kharagpur',
    admin_email: 'admin@vidyasagar.com',
    allow_registration: true,
    require_email_verification: true,
    max_file_size_mb: 100,
    allowed_file_types: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi'],
    maintenance_mode: false,
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    backup_frequency: 'daily',
    session_timeout_hours: 24,
    password_min_length: 8,
    enable_audit_logs: true,
    max_login_attempts: 5,
    analytics_enabled: true,
    storage_provider: 'supabase',
    enable_resource_revisions: true,
    content_approval_required: false,
    auto_delete_temp_files_days: 7
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [maintenanceScheduled, setMaintenanceScheduled] = useState(false);
  const [maintenanceDate, setMaintenanceDate] = useState('');

  // System information
  const [systemInfo, setSystemInfo] = useState({
    platform_version: 'v2.1.0',
    db_version: 'PostgreSQL 14.2',
    server_uptime: '15 days, 6 hours',
    storage_used: '45.2 GB',
    storage_total: '100 GB',
    environment: 'Production',
    last_updated: new Date().toLocaleString()
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Settings', icon: FileText },
    { id: 'system', label: 'System', icon: Server },
    { id: 'backup', label: 'Backup & Restore', icon: Archive }
  ];

  useEffect(() => {
    // In a real app, fetch settings from the backend
    fetchSystemSettings();
    fetchBackups();
  }, []);

  const fetchSystemSettings = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would fetch from the database
      setIsLoading(false);
    }, 500);
  };

  const fetchBackups = () => {
    // Simulate fetching backups
    const mockBackups = [
      { 
        id: 'backup-20240629-0200', 
        size: '1.2 GB', 
        created_at: '2024-06-29 02:00:00', 
        status: 'completed' 
      },
      { 
        id: 'backup-20240628-0200', 
        size: '1.15 GB', 
        created_at: '2024-06-28 02:00:00', 
        status: 'completed' 
      },
      { 
        id: 'backup-20240627-0200', 
        size: '1.17 GB', 
        created_at: '2024-06-27 02:00:00', 
        status: 'completed' 
      }
    ];
    
    setBackups(mockBackups);
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      // In a real implementation, this would save to a settings table
      // For now, we'll simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.smtp_host || !settings.smtp_username) {
      alert('Please fill in SMTP host and username first');
      return;
    }
    
    // In a real app, this would test the email configuration
    alert('Test email sent to ' + settings.admin_email);
  };

  const handleBackupDatabase = async () => {
    try {
      // In a real app, this would trigger a database backup
      alert('Database backup started. This may take a few minutes.');
      
      // Simulate backup completion
      setTimeout(() => {
        const newBackup = {
          id: `backup-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(new Date().getHours()).padStart(2, '0')}${String(new Date().getMinutes()).padStart(2, '0')}`,
          size: '1.21 GB',
          created_at: new Date().toLocaleString(),
          status: 'completed'
        };
        
        setBackups([newBackup, ...backups]);
      }, 3000);
    } catch (error) {
      console.error('Error starting backup:', error);
      alert('Failed to start backup. Please try again.');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    setSelectedBackupId(backupId);
    setShowConfirmRestore(true);
  };

  const confirmRestore = async () => {
    if (!selectedBackupId) return;
    
    try {
      // In a real app, this would restore from the selected backup
      alert(`Restoring from backup ${selectedBackupId}. This may take several minutes.`);
      setShowConfirmRestore(false);
      setSelectedBackupId(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Failed to restore backup. Please try again.');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      try {
        // In a real app, this would delete the backup
        setBackups(backups.filter(backup => backup.id !== backupId));
        alert('Backup deleted successfully.');
      } catch (error) {
        console.error('Error deleting backup:', error);
        alert('Failed to delete backup. Please try again.');
      }
    }
  };

  const handleDownloadBackup = (backupId: string) => {
    // In a real app, this would download the backup file
    alert(`Downloading backup ${backupId}`);
  };

  const confirmResetSystem = () => {
    // In a real app, this would reset the system to default settings
    alert('System reset initiated. This will take some time to complete.');
    setShowConfirmReset(false);
    
    // Simulate reset completion
    setTimeout(() => {
      alert('System reset completed. You will be logged out.');
    }, 3000);
  };

  const handleScheduleMaintenance = () => {
    if (!maintenanceDate) {
      alert('Please select a date and time for maintenance');
      return;
    }
    
    setMaintenanceScheduled(true);
    // In a real app, this would schedule system maintenance
    alert(`Maintenance scheduled for ${maintenanceDate}`);
  };

  if (!hasPermission('super_admin')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">You need Super Admin privileges to access system settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading || saveStatus === 'saving'}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>
              {saveStatus === 'saving' ? 'Saving...' : 
               saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
            </span>
          </button>
        </div>
      </div>

      {/* Maintenance Mode Warning */}
      {settings.maintenance_mode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <div>
              <h3 className="text-yellow-400 font-medium">Maintenance Mode Active</h3>
              <p className="text-yellow-300 text-sm">
                The platform is currently in maintenance mode. Only administrators can access the site.
              </p>
            </div>
            <button
              onClick={() => setSettings({...settings, maintenance_mode: false})}
              className="ml-auto px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
            >
              Disable
            </button>
          </div>
        </motion.div>
      )}

      {maintenanceScheduled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-400" />
            <div>
              <h3 className="text-blue-400 font-medium">Maintenance Scheduled</h3>
              <p className="text-blue-300 text-sm">
                System maintenance is scheduled for {new Date(maintenanceDate).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setMaintenanceScheduled(false)}
              className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-4 sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="bg-gray-750 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span>System Information</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version</span>
                    <span className="text-white">{systemInfo.platform_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Environment</span>
                    <span className="text-white">{systemInfo.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white">{systemInfo.last_updated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-xl p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.admin_email}
                      onChange={(e) => setSettings({...settings, admin_email: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.site_description}
                    onChange={(e) => setSettings({...settings, site_description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Maintenance Mode</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Maintenance Mode</h4>
                        <p className="text-gray-400 text-sm">Enable to prevent user access during updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenance_mode}
                          onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="bg-gray-750 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Schedule Maintenance</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Date and Time</label>
                          <input
                            type="datetime-local"
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <button
                          onClick={handleScheduleMaintenance}
                          disabled={!maintenanceDate}
                          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Schedule Maintenance
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Email Settings</h2>
                
                <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="text-yellow-400 font-medium">Important</h3>
                      <p className="text-yellow-300 text-sm">
                        These settings control all email communications from the platform. Make sure to test the configuration before saving.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.smtp_host}
                      onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.smtp_port}
                      onChange={(e) => setSettings({...settings, smtp_port: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.smtp_username}
                      onChange={(e) => setSettings({...settings, smtp_username: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SMTP Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.smtp_password}
                        onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Encryption
                    </label>
                    <select
                      value={settings.smtp_encryption}
                      onChange={(e) => setSettings({...settings, smtp_encryption: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="none">None</option>
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                    </select>
                  </div>
                </div>

                {/* Email Templates */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Email Templates</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Welcome Email</h4>
                        <Edit className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Sent to new users after registration</p>
                    </div>
                    
                    <div className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Password Reset</h4>
                        <Edit className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Sent when users request password reset</p>
                    </div>
                    
                    <div className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Email Verification</h4>
                        <Edit className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Sent to verify user email addresses</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleTestEmail}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Test Email Configuration</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.session_timeout_hours}
                      onChange={(e) => setSettings({...settings, session_timeout_hours: parseInt(e.target.value)})}
                      min="1"
                      max="168"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">How long user sessions remain active</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password Minimum Length
                    </label>
                    <input
                      type="number"
                      value={settings.password_min_length}
                      onChange={(e) => setSettings({...settings, password_min_length: parseInt(e.target.value)})}
                      min="6"
                      max="50"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Minimum characters required for passwords</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.max_login_attempts}
                      onChange={(e) => setSettings({...settings, max_login_attempts: parseInt(e.target.value)})}
                      min="3"
                      max="10"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Before temporary account lockout</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content Approval
                    </label>
                    <select
                      value={settings.content_approval_required.toString()}
                      onChange={(e) => setSettings({...settings, content_approval_required: e.target.value === 'true'})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="false">Not Required</option>
                      <option value="true">Required</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Require admin approval for user-generated content</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700 space-y-4">
                  <h3 className="text-lg font-medium text-white mb-4">Security Features</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">Enable Audit Logs</h3>
                        <p className="text-gray-400 text-sm">Track all admin actions and changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enable_audit_logs}
                          onChange={(e) => setSettings({...settings, enable_audit_logs: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">Resource Version History</h3>
                        <p className="text-gray-400 text-sm">Keep track of resource changes and enable rollbacks</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enable_resource_revisions}
                          onChange={(e) => setSettings({...settings, enable_resource_revisions: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">Require Email Verification</h3>
                        <p className="text-gray-400 text-sm">Users must verify their email before accessing the platform</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.require_email_verification}
                          onChange={(e) => setSettings({...settings, require_email_verification: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Password Policy */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Password Policy</h3>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require_uppercase"
                          checked={true}
                          className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                        />
                        <label htmlFor="require_uppercase" className="text-white text-sm">Require uppercase letters</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require_numbers"
                          checked={true}
                          className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                        />
                        <label htmlFor="require_numbers" className="text-white text-sm">Require numbers</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="require_special"
                          checked={true}
                          className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                        />
                        <label htmlFor="require_special" className="text-white text-sm">Require special characters</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enforce_expiry"
                          checked={false}
                          className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                        />
                        <label htmlFor="enforce_expiry" className="text-white text-sm">Enforce password expiration (90 days)</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authentication Settings */}
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Authentication Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">JWT Secret Rotation</h4>
                        <p className="text-gray-400 text-sm">Regularly rotate JWT secrets for enhanced security</p>
                      </div>
                      <button
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Rotate Now
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                        <p className="text-gray-400 text-sm">Require 2FA for administrator accounts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={false}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* User Management Settings */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">User Management Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Allow User Registration</h3>
                      <p className="text-gray-400 text-sm">Enable new users to create accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allow_registration}
                        onChange={(e) => setSettings({...settings, allow_registration: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Require Email Verification</h3>
                      <p className="text-gray-400 text-sm">Users must verify their email before accessing the platform</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.require_email_verification}
                        onChange={(e) => setSettings({...settings, require_email_verification: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Default User Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default User Role
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        defaultValue="student"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="guest">Guest</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Department
                      </label>
                      <input
                        type="text"
                        defaultValue="Ocean and Naval Architecture"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Profile Completion Required
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        defaultValue="basic"
                      >
                        <option value="none">Not Required</option>
                        <option value="basic">Basic Info Required</option>
                        <option value="complete">Complete Profile Required</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Auto-Delete Inactive Users
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        defaultValue="never"
                      >
                        <option value="never">Never</option>
                        <option value="6months">After 6 months</option>
                        <option value="1year">After 1 year</option>
                        <option value="2years">After 2 years</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Email Domain Restrictions</h3>
                  
                  <div className="bg-gray-750 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Allowed Email Domains</h4>
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
                        <span className="text-white">kgpian.iitkgp.ac.in</span>
                        <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-700 p-2 rounded">
                        <span className="text-white">iitkgp.ac.in</span>
                        <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-4">
                      Only users with email addresses from these domains can register
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Content Settings */}
            {activeTab === 'content' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Content Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.max_file_size_mb}
                    onChange={(e) => setSettings({...settings, max_file_size_mb: parseInt(e.target.value)})}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Allowed File Types
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov', 'jpg', 'png', 'gif', 'zip'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.allowed_file_types.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                allowed_file_types: [...settings.allowed_file_types, type]
                              });
                            } else {
                              setSettings({
                                ...settings,
                                allowed_file_types: settings.allowed_file_types.filter(t => t !== type)
                              });
                            }
                          }}
                          className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-white text-sm">.{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Content Organization</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Sort Order
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        defaultValue="latest"
                      >
                        <option value="latest">Latest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="alphabetical">Alphabetical (A-Z)</option>
                        <option value="popular">Most Popular</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Resources Per Page
                      </label>
                      <select
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        defaultValue="15"
                      >
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Media Storage</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Storage Provider
                      </label>
                      <select
                        value={settings.storage_provider}
                        onChange={(e) => setSettings({...settings, storage_provider: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="supabase">Supabase Storage</option>
                        <option value="s3">Amazon S3</option>
                        <option value="gcs">Google Cloud Storage</option>
                        <option value="local">Local Storage</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Where to store uploaded files</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Auto-Delete Temporary Files (days)
                      </label>
                      <input
                        type="number"
                        value={settings.auto_delete_temp_files_days}
                        onChange={(e) => setSettings({...settings, auto_delete_temp_files_days: parseInt(e.target.value)})}
                        min="1"
                        max="90"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">Automatically remove temporary files after specified days</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Content Analytics</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Enable Analytics</h4>
                      <p className="text-gray-400 text-sm">Collect usage data for resources and content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.analytics_enabled}
                        onChange={(e) => setSettings({...settings, analytics_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">System Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.backup_frequency}
                    onChange={(e) => setSettings({...settings, backup_frequency: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="manual">Manual Only</option>
                  </select>
                </div>

                <div className="bg-gray-750 rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">System Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Platform Version</p>
                      <p className="text-white">{systemInfo.platform_version}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Database Version</p>
                      <p className="text-white">{systemInfo.db_version}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Server Uptime</p>
                      <p className="text-white">{systemInfo.server_uptime}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Storage Used</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{systemInfo.storage_used} / {systemInfo.storage_total}</span>
                        <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full" 
                            style={{width: `${parseInt(systemInfo.storage_used) / parseInt(systemInfo.storage_total.split(' ')[0]) * 100}%`}}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400">Environment</p>
                      <p className="text-white">{systemInfo.environment}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Update</p>
                      <p className="text-white">{systemInfo.last_updated}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">System Maintenance</h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowConfirmReset(true)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-red-500 text-red-400 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="h-5 w-5" />
                        <span>Reset to Default Settings</span>
                      </div>
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleBackupDatabase()}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Database className="h-5 w-5" />
                      <span>Backup Database Now</span>
                    </button>
                    
                    <div className="bg-gray-750 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Schedule Maintenance</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Date and Time</label>
                          <input
                            type="datetime-local"
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <button
                          onClick={handleScheduleMaintenance}
                          disabled={!maintenanceDate}
                          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Schedule Maintenance
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Cache Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      className="flex flex-col items-center justify-center space-y-2 p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-6 w-6 text-blue-400" />
                      <span className="text-white text-sm">Clear System Cache</span>
                      <span className="text-gray-400 text-xs">Improves performance</span>
                    </button>
                    
                    <button
                      className="flex flex-col items-center justify-center space-y-2 p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-6 w-6 text-green-400" />
                      <span className="text-white text-sm">Rebuild Indexes</span>
                      <span className="text-gray-400 text-xs">Optimize database</span>
                    </button>
                    
                    <button
                      className="flex flex-col items-center justify-center space-y-2 p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <File className="h-6 w-6 text-red-400" />
                      <span className="text-white text-sm">Clear Temp Files</span>
                      <span className="text-gray-400 text-xs">Free up space</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Backup & Restore */}
            {activeTab === 'backup' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Backup & Restore</h2>
                
                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-blue-400 font-medium">Importance of Backups</h3>
                      <p className="text-blue-300 text-sm">
                        Regular backups ensure you can recover data in case of system failures, accidental deletions, or other issues. We recommend daily automated backups and additional manual backups before major updates.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Backup Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Backup Frequency
                        </label>
                        <select
                          value={settings.backup_frequency}
                          onChange={(e) => setSettings({...settings, backup_frequency: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="manual">Manual Only</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Maximum Backups to Keep
                        </label>
                        <select
                          defaultValue="7"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="3">3 backups</option>
                          <option value="7">7 backups</option>
                          <option value="14">14 backups</option>
                          <option value="30">30 backups</option>
                          <option value="0">Keep all backups</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Backup Storage Location
                        </label>
                        <select
                          defaultValue="cloud"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="local">Local Storage</option>
                          <option value="cloud">Cloud Storage</option>
                          <option value="both">Local and Cloud</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          What to Backup
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="backup_database"
                              checked={true}
                              className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <label htmlFor="backup_database" className="text-white text-sm">Database</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="backup_uploads"
                              checked={true}
                              className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <label htmlFor="backup_uploads" className="text-white text-sm">Uploaded Files</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="backup_config"
                              checked={true}
                              className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <label htmlFor="backup_config" className="text-white text-sm">Configuration Files</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="backup_logs"
                              checked={false}
                              className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <label htmlFor="backup_logs" className="text-white text-sm">System Logs</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Manual Backup</h3>
                    
                    <div className="bg-gray-750 rounded-lg p-4 mb-4">
                      <h4 className="text-white font-medium mb-3">Create Backup</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Last backup:</span>
                          <span className="text-sm text-white">{new Date().toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Database size:</span>
                          <span className="text-sm text-white">3.5 GB</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">File storage size:</span>
                          <span className="text-sm text-white">42.8 GB</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleBackupDatabase}
                        className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Archive className="h-4 w-4" />
                        <span>Create Manual Backup</span>
                      </button>
                    </div>
                    
                    <div className="bg-gray-750 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">Automated Backups</h4>
                        <div className="flex items-center space-x-1 bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded-full text-xs">
                          <Check className="h-3 w-3" />
                          <span>Enabled</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3">
                        Automatic backups are currently set to run {settings.backup_frequency}.
                      </p>
                      
                      <div className="flex justify-between">
                        <button
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm"
                        >
                          <Clock className="h-4 w-4" />
                          <span>Change Schedule</span>
                        </button>
                        
                        <button
                          className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
                        >
                          <GitBranch className="h-4 w-4" />
                          <span>Configure</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Backup History</h3>
                  
                  <div className="bg-gray-750 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-700 flex items-center font-medium text-sm">
                      <div className="w-1/3 text-gray-300">Backup ID</div>
                      <div className="w-1/4 text-gray-300">Size</div>
                      <div className="w-1/4 text-gray-300">Date</div>
                      <div className="w-1/6 text-gray-300">Status</div>
                      <div className="w-1/6 text-gray-300 text-right">Actions</div>
                    </div>
                    
                    <div className="divide-y divide-gray-700">
                      {backups.map((backup, index) => (
                        <div key={backup.id} className="px-4 py-3 flex items-center text-sm">
                          <div className="w-1/3 text-white">{backup.id}</div>
                          <div className="w-1/4 text-gray-400">{backup.size}</div>
                          <div className="w-1/4 text-gray-400">{backup.created_at}</div>
                          <div className="w-1/6">
                            <span className="inline-flex items-center space-x-1 text-green-400 bg-green-500 bg-opacity-10 px-2 py-1 rounded-full text-xs">
                              <CheckCircle className="h-3 w-3" />
                              <span>{backup.status}</span>
                            </span>
                          </div>
                          <div className="w-1/6 text-right flex items-center justify-end space-x-1">
                            <button 
                              onClick={() => handleRestoreBackup(backup.id)}
                              className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Restore"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadBackup(backup.id)}
                              className="p-1 text-green-400 hover:text-green-300 transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBackup(backup.id)}
                              className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      View All Backups
                    </button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-medium text-white mb-4">Import & Restore</h3>
                  
                  <div className="bg-gray-750 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Restore from Backup</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-650 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400">
                              <span className="font-medium">Click to upload</span> backup file
                            </p>
                            <p className="text-xs text-gray-500">SQL or .zip backup file</p>
                          </div>
                          <input type="file" className="hidden" />
                        </label>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="restore_database"
                              className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <label htmlFor="restore_database" className="text-white text-sm">Restore Database</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="restore_files"
                              className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <label htmlFor="restore_files" className="text-white text-sm">Restore Files</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="restore_settings"
                              className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <label htmlFor="restore_settings" className="text-white text-sm">Restore Settings</label>
                          </div>
                        </div>
                        
                        <button
                          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Upload & Restore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Restore Modal */}
      {showConfirmRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Confirm Restore</h2>
            
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-medium">Warning</h3>
                  <p className="text-red-300 text-sm">
                    Restoring from backup will replace all current data with the data from the backup. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to restore from backup <span className="text-white font-medium">{selectedBackupId}</span>?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmRestore(false);
                  setSelectedBackupId(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Yes, Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Reset System Settings</h2>
            
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-medium">Danger</h3>
                  <p className="text-red-300 text-sm">
                    This will reset ALL system settings to their default values. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Please type <span className="text-white font-mono">RESET</span> to confirm this action.
            </p>
            
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
              placeholder="Type RESET to confirm"
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetSystem}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Reset System Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom File icon component
const File = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M18 14v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
    <path d="M5 17a2 2 0 0 0-2 2v2" />
    <path d="M9 18a2 2 0 0 0-2 2v2" />
  </svg>
);

export default SystemSettings;