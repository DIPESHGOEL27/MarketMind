import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MoreVertical,
  Plus,
  RefreshCw,
  FileDown,
  FileUp,
  Users,
  UserPlus,
  Shield,
  AlertCircle,
  CheckCircle,
  X,
  Phone,
  GraduationCap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
  email_verified: boolean;
  mobile_number?: string;
  department?: string;
  year_of_study?: string;
  semester?: number;
  roll_number?: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const usersPerPage = 15;

  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    mobile_number: '',
    department: 'Ocean and Naval Architecture',
    year_of_study: '',
    semester: 1
  });

  useEffect(() => {
    fetchUsers();
  }, [sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (!error) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, is_active: !currentStatus }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (!error) {
          setUsers(users.filter(user => user.id !== userId));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case 'activate':
          await supabase
            .from('users')
            .update({ is_active: true })
            .in('id', selectedUsers);
          break;
        case 'deactivate':
          await supabase
            .from('users')
            .update({ is_active: false })
            .in('id', selectedUsers);
          break;
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
            await supabase
              .from('users')
              .delete()
              .in('id', selectedUsers);
          }
          break;
        case 'verify':
          await supabase
            .from('users')
            .update({ email_verified: true })
            .in('id', selectedUsers);
          break;
      }
      
      setSelectedUsers([]);
      setShowBulkActions(false);
      fetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // In a real app, this would go through proper user creation API
      console.log('Creating user:', newUser);
      setShowUserModal(false);
      setNewUser({
        email: '',
        full_name: '',
        mobile_number: '',
        department: 'Ocean and Naval Architecture',
        year_of_study: '',
        semester: 1
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Roll Number', 'Department', 'Semester', 'Year of Study', 'Status', 'Email Verified', 'Created At'],
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.email || '',
        user.roll_number || '',
        user.department || '',
        user.semester?.toString() || '',
        user.year_of_study || '',
        user.is_active ? 'Active' : 'Inactive',
        user.email_verified ? 'Verified' : 'Unverified',
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.roll_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active) ||
      (filterStatus === 'verified' && user.email_verified) ||
      (filterStatus === 'unverified' && !user.email_verified);

    return matchesSearch && matchesFilter;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const userStats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    verified: users.filter(u => u.email_verified).length,
    newThisMonth: users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  };

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
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">
            Manage {filteredUsers.length} users across the platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportUsers}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowUserModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: userStats.total, icon: Users, color: 'text-blue-400' },
          { label: 'Active Users', value: userStats.active, icon: UserCheck, color: 'text-green-400' },
          { label: 'Verified Users', value: userStats.verified, icon: Shield, color: 'text-purple-400' },
          { label: 'New This Month', value: userStats.newThisMonth, icon: Calendar, color: 'text-orange-400' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Email Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="created_at">Registration Date</option>
              <option value="full_name">Name</option>
              <option value="email">Email</option>
              <option value="last_login">Last Login</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-400">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('verify')}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Verify Email
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(paginatedUsers.map(user => user.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">User</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Academic Info</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Registration</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Last Activity</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.full_name || 'No name'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        {user.mobile_number && (
                          <p className="text-gray-500 text-xs flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.mobile_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white text-sm">{user.roll_number || 'No roll number'}</p>
                      <p className="text-gray-400 text-xs">
                        {user.department || 'No department'} • Sem {user.semester || 'N/A'}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {user.year_of_study || 'No year specified'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-500 bg-opacity-20 text-green-400' 
                          : 'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                        user.email_verified 
                          ? 'bg-blue-500 bg-opacity-20 text-blue-400' 
                          : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      }`}>
                        {user.email_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-400 text-sm">
                      <p>{new Date(user.created_at).toLocaleDateString()}</p>
                      <p className="text-xs">{new Date(user.created_at).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-400 text-sm">
                      {user.last_login ? (
                        <>
                          <p>{new Date(user.last_login).toLocaleDateString()}</p>
                          <p className="text-xs">{new Date(user.last_login).toLocaleTimeString()}</p>
                        </>
                      ) : (
                        <p>Never</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-gray-400 hover:text-white" />
                      </button>
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.is_active ? (
                          <UserX className="h-4 w-4 text-yellow-400 hover:text-yellow-300" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-400 hover:text-green-300" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add New User</h2>
              <button 
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@kgpian.iitkgp.ac.in"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={newUser.mobile_number}
                  onChange={(e) => setNewUser({...newUser, mobile_number: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year of Study</label>
                  <select
                    value={newUser.year_of_study}
                    onChange={(e) => setNewUser({...newUser, year_of_study: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                    <option value="Third Year">Third Year</option>
                    <option value="Fourth Year">Fourth Year</option>
                    <option value="Fifth Year">Fifth Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                  <select
                    value={newUser.semester}
                    onChange={(e) => setNewUser({...newUser, semester: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">User Details</h2>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <p className="text-white">{editingUser.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <p className="text-white">{editingUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Mobile</label>
                    <p className="text-white">{editingUser.mobile_number || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Academic Information</h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Roll Number</label>
                    <p className="text-white">{editingUser.roll_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Department</label>
                    <p className="text-white">{editingUser.department || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Year of Study</label>
                    <p className="text-white">{editingUser.year_of_study || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Semester</label>
                    <p className="text-white">{editingUser.semester || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Account Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      editingUser.is_active 
                        ? 'bg-green-500 bg-opacity-20 text-green-400' 
                        : 'bg-red-500 bg-opacity-20 text-red-400'
                    }`}>
                      {editingUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email Verification</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      editingUser.email_verified 
                        ? 'bg-blue-500 bg-opacity-20 text-blue-400' 
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                    }`}>
                      {editingUser.email_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Registration Date</label>
                    <p className="text-white">{new Date(editingUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Last Login</label>
                    <p className="text-white">
                      {editingUser.last_login ? new Date(editingUser.last_login).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleToggleUserStatus(editingUser.id, editingUser.is_active)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    editingUser.is_active 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {editingUser.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDeleteUser(editingUser.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete User
                </button>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;