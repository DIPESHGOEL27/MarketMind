import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  FileText,
  Video,
  Link as LinkIcon,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Upload,
  ExternalLink,
  Download,
  Tags,
  Clock,
  Users,
  TrendingUp,
  X,
  RefreshCw,
  BarChart3,
  CheckCircle,
  AlertCircle,
  FolderTree,
  Play,
  FileUp,
  ArrowUpRight,
  FileDown,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Info,
  Share2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: 'pdf' | 'video' | 'notes' | 'link';
  category_id?: string | null;
  file_url?: string | null;
  google_drive_url?: string | null;
  youtube_url?: string | null;
  youtube_playlist_id?: string | null;
  file_size?: number | null;
  file_format?: string | null;
  duration?: number | null;
  pages?: number | null;
  tags?: string[] | null;
  semester?: number | null;
  course_code?: string | null;
  is_published: boolean;
  scheduled_publish_at?: string | null;
  view_count: number;
  download_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
}

interface ResourceStats {
  totalResources: number;
  publishedResources: number;
  draftResources: number;
  pdfCount: number;
  videoCount: number;
  notesCount: number;
  linkCount: number;
  mostViewed: Resource | null;
  mostDownloaded: Resource | null;
  recentlyAdded: number;
}

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    semester: 'all',
    hasTag: '',
    dateRange: 'all',
    minViews: '',
    minDownloads: '',
    courseCode: ''
  });
  const [scheduledResources, setScheduledResources] = useState<Resource[]>([]);

  const navigate = useNavigate();
  const resourcesPerPage = 15;

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'pdf' as Resource['type'],
    category_id: '',
    file_url: '',
    google_drive_url: '',
    youtube_url: '',
    youtube_playlist_id: '',
    file_size: '',
    file_format: '',
    duration: '',
    pages: '',
    tags: '',
    semester: '',
    course_code: '',
    is_published: false,
    scheduled_publish_at: '',
    sort_order: '0'
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchResources();
    fetchCategories();
    fetchResourceStats();
    fetchScheduledResources();
  }, [sortBy, sortOrder]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) {
        console.error('Error fetching resources:', error);
      } else {
        setResources(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchResourceStats = () => {
    // In a real app, this would be a database query
    // For now, we'll calculate from the fetched resources
    const stats: ResourceStats = {
      totalResources: 0,
      publishedResources: 0,
      draftResources: 0,
      pdfCount: 0,
      videoCount: 0,
      notesCount: 0,
      linkCount: 0,
      mostViewed: null,
      mostDownloaded: null,
      recentlyAdded: 0
    };

    if (resources.length > 0) {
      stats.totalResources = resources.length;
      stats.publishedResources = resources.filter(r => r.is_published).length;
      stats.draftResources = resources.filter(r => !r.is_published).length;
      stats.pdfCount = resources.filter(r => r.type === 'pdf').length;
      stats.videoCount = resources.filter(r => r.type === 'video').length;
      stats.notesCount = resources.filter(r => r.type === 'notes').length;
      stats.linkCount = resources.filter(r => r.type === 'link').length;
      
      let maxViews = 0;
      let maxDownloads = 0;
      
      resources.forEach(resource => {
        if (resource.view_count > maxViews) {
          maxViews = resource.view_count;
          stats.mostViewed = resource;
        }
        if (resource.download_count > maxDownloads) {
          maxDownloads = resource.download_count;
          stats.mostDownloaded = resource;
        }
      });
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      stats.recentlyAdded = resources.filter(r => 
        new Date(r.created_at) > oneMonthAgo
      ).length;
    }
    
    setResourceStats(stats);
  };

  const fetchScheduledResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .not('scheduled_publish_at', 'is', null)
        .order('scheduled_publish_at', { ascending: true });

      if (!error && data) {
        setScheduledResources(data);
      }
    } catch (error) {
      console.error('Error fetching scheduled resources:', error);
    }
  };

  const handleCreateResource = async () => {
    try {
      setIsSubmitting(true);
      
      // Process tags
      const tagsArray = newResource.tags ? 
        newResource.tags.split(',').map(t => t.trim()).filter(Boolean) : null;
      
      // Upload file if provided
      let fileUrl = newResource.file_url;
      
      if (uploadedFile) {
        // In a real app, this would upload the file to storage
        // For now, we'll simulate a file upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        fileUrl = URL.createObjectURL(uploadedFile); // This would be a real URL in production
      }
      
      const resourceData = {
        title: newResource.title,
        description: newResource.description || null,
        type: newResource.type,
        category_id: newResource.category_id || null,
        file_url: fileUrl || null,
        google_drive_url: newResource.google_drive_url || null,
        youtube_url: newResource.youtube_url || null,
        youtube_playlist_id: newResource.youtube_playlist_id || null,
        file_size: newResource.file_size ? parseInt(newResource.file_size) : null,
        file_format: newResource.file_format || null,
        duration: newResource.duration ? parseInt(newResource.duration) : null,
        pages: newResource.pages ? parseInt(newResource.pages) : null,
        tags: tagsArray,
        semester: newResource.semester ? parseInt(newResource.semester) : null,
        course_code: newResource.course_code || null,
        is_published: newResource.is_published,
        scheduled_publish_at: newResource.scheduled_publish_at || null,
        sort_order: parseInt(newResource.sort_order)
      };

      const { error } = await supabase
        .from('resources')
        .insert([resourceData]);

      if (!error) {
        setShowCreateModal(false);
        resetResourceForm();
        fetchResources();
        fetchResourceStats();
        fetchScheduledResources();
      } else {
        console.error('Error creating resource:', error);
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      setUploadStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateResource = async () => {
    if (!editingResource) return;
    
    try {
      setIsSubmitting(true);
      
      // Process tags
      const tagsArray = typeof editingResource.tags === 'string' ? 
        (editingResource.tags as string).split(',').map(t => t.trim()).filter(Boolean) : 
        editingResource.tags;
      
      const resourceData = {
        title: editingResource.title,
        description: editingResource.description,
        type: editingResource.type,
        category_id: editingResource.category_id || null,
        file_url: editingResource.file_url,
        google_drive_url: editingResource.google_drive_url,
        youtube_url: editingResource.youtube_url,
        youtube_playlist_id: editingResource.youtube_playlist_id,
        file_size: editingResource.file_size,
        file_format: editingResource.file_format,
        duration: editingResource.duration,
        pages: editingResource.pages,
        tags: tagsArray,
        semester: editingResource.semester,
        course_code: editingResource.course_code,
        is_published: editingResource.is_published,
        scheduled_publish_at: editingResource.scheduled_publish_at,
        sort_order: editingResource.sort_order,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('resources')
        .update(resourceData)
        .eq('id', editingResource.id);

      if (!error) {
        setEditingResource(null);
        fetchResources();
        fetchResourceStats();
        fetchScheduledResources();
      } else {
        console.error('Error updating resource:', error);
      }
    } catch (error) {
      console.error('Error updating resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', resourceId);

        if (!error) {
          setResources(resources.filter(resource => resource.id !== resourceId));
          fetchResourceStats();
        } else {
          console.error('Error deleting resource:', error);
        }
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  const handleTogglePublished = async (resourceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', resourceId);

      if (!error) {
        setResources(resources.map(resource => 
          resource.id === resourceId 
            ? { ...resource, is_published: !currentStatus }
            : resource
        ));
        fetchResourceStats();
      } else {
        console.error('Error updating resource status:', error);
      }
    } catch (error) {
      console.error('Error updating resource status:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedResources.length === 0) return;
    
    let confirmMessage = '';
    switch(action) {
      case 'publish':
        confirmMessage = `Publish ${selectedResources.length} selected resources?`;
        break;
      case 'unpublish':
        confirmMessage = `Unpublish ${selectedResources.length} selected resources? They will no longer be visible to users.`;
        break;
      case 'delete':
        confirmMessage = `Delete ${selectedResources.length} selected resources? This action cannot be undone.`;
        break;
    }
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      switch (action) {
        case 'publish':
          await supabase
            .from('resources')
            .update({ is_published: true, updated_at: new Date().toISOString() })
            .in('id', selectedResources);
          break;
        case 'unpublish':
          await supabase
            .from('resources')
            .update({ is_published: false, updated_at: new Date().toISOString() })
            .in('id', selectedResources);
          break;
        case 'delete':
          await supabase
            .from('resources')
            .delete()
            .in('id', selectedResources);
          break;
      }
      
      setSelectedResources([]);
      fetchResources();
      fetchResourceStats();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const resetResourceForm = () => {
    setNewResource({
      title: '',
      description: '',
      type: 'pdf',
      category_id: '',
      file_url: '',
      google_drive_url: '',
      youtube_url: '',
      youtube_playlist_id: '',
      file_size: '',
      file_format: '',
      duration: '',
      pages: '',
      tags: '',
      semester: '',
      course_code: '',
      is_published: false,
      scheduled_publish_at: '',
      sort_order: '0'
    });
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setNewResource({
        ...newResource,
        file_size: String(Math.round(file.size / 1024)), // Convert to KB
        file_format: file.type.split('/')[1]
      });
    }
  };

  const simulateFileUpload = async () => {
    if (!uploadedFile) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 300);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('success');
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-400" />;
      case 'notes':
        return <BookOpen className="h-5 w-5 text-green-400" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-purple-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getResourceTypeName = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'video':
        return 'Video Content';
      case 'notes':
        return 'Study Notes';
      case 'link':
        return 'External Link';
      default:
        return 'Resource';
    }
  };

  const getCategoryName = (categoryId: string | undefined | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Filter resources based on search query and filters
  const filterResources = () => {
    return resources.filter(resource => {
      // Basic search
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (resource.course_code && resource.course_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      // Type filter
      const matchesType = filterType === 'all' || resource.type === filterType;
      
      // Category filter
      const matchesCategory = filterCategory === 'all' || resource.category_id === filterCategory;
      
      // Status filter
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'published' && resource.is_published) ||
        (filterStatus === 'draft' && !resource.is_published) ||
        (filterStatus === 'scheduled' && resource.scheduled_publish_at);

      // Advanced filters
      const matchesSemester = advancedFilters.semester === 'all' || 
        String(resource.semester) === advancedFilters.semester;
      
      const matchesTag = !advancedFilters.hasTag || 
        (resource.tags && resource.tags.some(tag => 
          tag.toLowerCase().includes(advancedFilters.hasTag.toLowerCase())
        ));
      
      const matchesCourseCode = !advancedFilters.courseCode || 
        (resource.course_code && resource.course_code.toLowerCase().includes(advancedFilters.courseCode.toLowerCase()));
      
      // Date range
      let matchesDateRange = true;
      if (advancedFilters.dateRange !== 'all') {
        const createdDate = new Date(resource.created_at);
        const now = new Date();
        
        if (advancedFilters.dateRange === 'today') {
          matchesDateRange = createdDate.toDateString() === now.toDateString();
        } else if (advancedFilters.dateRange === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDateRange = createdDate >= weekAgo;
        } else if (advancedFilters.dateRange === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDateRange = createdDate >= monthAgo;
        }
      }
      
      // View count
      const matchesViewCount = !advancedFilters.minViews || 
        resource.view_count >= parseInt(advancedFilters.minViews);
      
      // Download count
      const matchesDownloadCount = !advancedFilters.minDownloads || 
        resource.download_count >= parseInt(advancedFilters.minDownloads);
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus && 
             matchesSemester && matchesTag && matchesDateRange && 
             matchesViewCount && matchesDownloadCount && matchesCourseCode;
    });
  };

  const filteredResources = filterResources();
  
  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    const direction = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'title':
        return direction * a.title.localeCompare(b.title);
      case 'type':
        return direction * a.type.localeCompare(b.type);
      case 'view_count':
        return direction * (a.view_count - b.view_count);
      case 'download_count':
        return direction * (a.download_count - b.download_count);
      case 'created_at':
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'updated_at':
      default:
        return direction * (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    }
  });
  
  // Paginate resources
  const paginatedResources = sortedResources.slice(
    (currentPage - 1) * resourcesPerPage,
    currentPage * resourcesPerPage
  );
  
  const totalPages = Math.ceil(sortedResources.length / resourcesPerPage);

  const exportResources = () => {
    const csvContent = [
      ['ID', 'Title', 'Type', 'Category', 'Course Code', 'Semester', 'Views', 'Downloads', 'Status', 'Created At'],
      ...filteredResources.map(resource => [
        resource.id,
        resource.title,
        resource.type,
        getCategoryName(resource.category_id),
        resource.course_code || '',
        resource.semester?.toString() || '',
        resource.view_count.toString(),
        resource.download_count.toString(),
        resource.is_published ? 'Published' : 'Draft',
        new Date(resource.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resources_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-white">Resource Management</h1>
          <p className="text-gray-400 mt-1">
            Manage {filteredResources.length} resources across the platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={exportResources}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FileUp className="h-4 w-4" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Resource Stats */}
      {resourceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Resource Types</h3>
              <FileText className="h-5 w-5 text-red-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-red-400">{resourceStats.pdfCount}</div>
                <div className="text-sm text-gray-400">PDFs</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">{resourceStats.videoCount}</div>
                <div className="text-sm text-gray-400">Videos</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">{resourceStats.notesCount}</div>
                <div className="text-sm text-gray-400">Notes</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-400">{resourceStats.linkCount}</div>
                <div className="text-sm text-gray-400">Links</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Status Overview</h3>
              <Eye className="h-5 w-5 text-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">{resourceStats.publishedResources}</div>
                <div className="text-sm text-gray-400">Published</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">{resourceStats.draftResources}</div>
                <div className="text-sm text-gray-400">Drafts</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-400">{scheduledResources.length}</div>
                <div className="text-sm text-gray-400">Scheduled</div>
              </div>
              <div className="bg-gray-750 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">{resourceStats.recentlyAdded}</div>
                <div className="text-sm text-gray-400">Recent</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Performance Highlights</h3>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {resourceStats.mostViewed && (
                <div className="col-span-1 bg-gray-750 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <div className="text-sm font-medium text-white">Most Viewed</div>
                  </div>
                  <div className="text-white text-sm truncate">{resourceStats.mostViewed.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-gray-400 text-xs">{getResourceTypeName(resourceStats.mostViewed.type)}</div>
                    <div className="text-blue-400 font-medium text-sm">{resourceStats.mostViewed.view_count} views</div>
                  </div>
                </div>
              )}
              
              {resourceStats.mostDownloaded && (
                <div className="col-span-1 bg-gray-750 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Download className="h-4 w-4 text-green-400" />
                    <div className="text-sm font-medium text-white">Most Downloaded</div>
                  </div>
                  <div className="text-white text-sm truncate">{resourceStats.mostDownloaded.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-gray-400 text-xs">{getResourceTypeName(resourceStats.mostDownloaded.type)}</div>
                    <div className="text-green-400 font-medium text-sm">{resourceStats.mostDownloaded.download_count} downloads</div>
                  </div>
                </div>
              )}
              
              <div className="col-span-2 bg-gray-750 rounded-lg p-3">
                {scheduledResources.length > 0 ? (
                  <>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-orange-400" />
                      <div className="text-sm font-medium text-white">Upcoming Scheduled Resource</div>
                    </div>
                    <div className="text-white text-sm truncate">{scheduledResources[0].title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-gray-400 text-xs">{getResourceTypeName(scheduledResources[0].type)}</div>
                      <div className="text-orange-400 font-medium text-sm">
                        {new Date(scheduledResources[0].scheduled_publish_at!).toLocaleString()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400 text-sm">No scheduled resources</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Basic Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="video">Video Content</option>
              <option value="notes">Study Notes</option>
              <option value="link">External Links</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
              <option value="null">Uncategorized</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-700 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Semester</label>
                <select
                  value={advancedFilters.semester}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, semester: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(semester => (
                    <option key={semester} value={String(semester)}>Semester {semester}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Has Tag</label>
                <input
                  type="text"
                  value={advancedFilters.hasTag}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, hasTag: e.target.value})}
                  placeholder="Enter tag..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                <select
                  value={advancedFilters.dateRange}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Minimum Views</label>
                <input
                  type="number"
                  value={advancedFilters.minViews}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, minViews: e.target.value})}
                  min="0"
                  placeholder="Any"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Minimum Downloads</label>
                <input
                  type="number"
                  value={advancedFilters.minDownloads}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, minDownloads: e.target.value})}
                  min="0"
                  placeholder="Any"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Course Code</label>
                <input
                  type="text"
                  value={advancedFilters.courseCode}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, courseCode: e.target.value})}
                  placeholder="e.g., NA31001"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => {
                  setAdvancedFilters({
                    semester: 'all',
                    hasTag: '',
                    dateRange: 'all',
                    minViews: '',
                    minDownloads: '',
                    courseCode: ''
                  });
                }}
                className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Bulk Actions */}
        {selectedResources.length > 0 && (
          <div className="mt-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-400">
                  {selectedResources.length} resource{selectedResources.length > 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('unpublish')}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                >
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedResources([])}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-gray-400 text-sm">
            Showing {filteredResources.length} of {resources.length} resources
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(direction as 'asc' | 'desc');
              }}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="updated_at-desc">Last Updated</option>
              <option value="created_at-desc">Recently Added</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="view_count-desc">Most Viewed</option>
              <option value="download_count-desc">Most Downloaded</option>
              <option value="type-asc">Resource Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedResources.length === paginatedResources.length && paginatedResources.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedResources(paginatedResources.map(r => r.id));
                      } else {
                        setSelectedResources([]);
                      }
                    }}
                    className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Resource</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Type</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Category</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Stats</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedResources.length > 0 ? (
                paginatedResources.map((resource, index) => (
                  <motion.tr
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedResources([...selectedResources, resource.id]);
                          } else {
                            setSelectedResources(selectedResources.filter(id => id !== resource.id));
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-700 rounded-lg">
                          {getTypeIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate cursor-pointer hover:text-blue-400" onClick={() => { 
                            setViewingResource(resource);
                            setShowViewModal(true);
                          }}>
                            {resource.title}
                          </h3>
                          {resource.description && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{resource.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            {resource.course_code && (
                              <span className="text-xs bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded">
                                {resource.course_code}
                              </span>
                            )}
                            {resource.semester && (
                              <span className="text-xs bg-purple-500 bg-opacity-20 text-purple-400 px-2 py-1 rounded">
                                Sem {resource.semester}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        resource.type === 'pdf' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                        resource.type === 'video' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                        resource.type === 'notes' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                        'bg-purple-500 bg-opacity-20 text-purple-400'
                      }`}>
                        {resource.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 text-sm">
                        {getCategoryName(resource.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Eye className="h-4 w-4" />
                          <span>{resource.view_count}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Download className="h-4 w-4" />
                          <span>{resource.download_count}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {resource.scheduled_publish_at ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500 bg-opacity-20 text-orange-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Scheduled
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          resource.is_published 
                            ? 'bg-green-500 bg-opacity-20 text-green-400' 
                            : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        }`}>
                          {resource.is_published ? 'Published' : 'Draft'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setViewingResource(resource);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleTogglePublished(resource.id, resource.is_published)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title={resource.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {resource.is_published ? (
                            <EyeOff className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingResource(resource)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Resources Found</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      {searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                        ? 'No resources match your current filter criteria. Try adjusting your filters or search query.'
                        : 'You haven\'t added any resources yet. Get started by creating your first resource.'}
                    </p>
                    {searchQuery || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all' ? (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterType('all');
                          setFilterCategory('all');
                          setFilterStatus('all');
                          setAdvancedFilters({
                            semester: 'all',
                            hasTag: '',
                            dateRange: 'all',
                            minViews: '',
                            minDownloads: '',
                            courseCode: ''
                          });
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add First Resource</span>
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {((currentPage - 1) * resourcesPerPage) + 1} to {Math.min(currentPage * resourcesPerPage, filteredResources.length)} of {filteredResources.length} resources
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

      {/* Create Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add New Resource</h2>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  resetResourceForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({...newResource, type: e.target.value as Resource['type']})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video Content</option>
                      <option value="notes">Study Notes</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={newResource.category_id}
                      onChange={(e) => setNewResource({...newResource, category_id: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Type-specific fields */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-white">Resource Content</h3>
                
                {newResource.type === 'pdf' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload PDF File</label>
                        <div className="flex items-center space-x-2">
                          <label className="flex-1 cursor-pointer">
                            <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center flex items-center justify-center space-x-2">
                              <Upload className="h-4 w-4" />
                              <span>Select PDF File</span>
                            </div>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          {uploadedFile && (
                            <button
                              onClick={() => {
                                setUploadedFile(null);
                                setUploadStatus('idle');
                                setUploadProgress(0);
                                setNewResource({
                                  ...newResource,
                                  file_size: '',
                                  file_format: ''
                                });
                              }}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </button>
                          )}
                        </div>
                        {uploadedFile && (
                          <div className="mt-2">
                            <p className="text-sm text-white">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-400">
                              {Math.round(uploadedFile.size / 1024)} KB • {uploadedFile.type}
                            </p>
                            {uploadStatus === 'uploading' && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{uploadProgress}% uploaded</p>
                              </div>
                            )}
                            {uploadStatus === 'success' && (
                              <div className="flex items-center space-x-2 mt-2 text-green-400 text-sm">
                                <CheckCircle className="h-4 w-4" />
                                <span>Upload complete</span>
                              </div>
                            )}
                            {uploadStatus === 'error' && (
                              <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>Upload failed</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Google Drive URL</label>
                        <input
                          type="url"
                          value={newResource.google_drive_url}
                          onChange={(e) => setNewResource({...newResource, google_drive_url: e.target.value})}
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Provide either a file upload or Google Drive link
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">File Size (KB)</label>
                        <input
                          type="number"
                          value={newResource.file_size}
                          onChange={(e) => setNewResource({...newResource, file_size: e.target.value})}
                          min="0"
                          placeholder="e.g., 1024"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Number of Pages</label>
                        <input
                          type="number"
                          value={newResource.pages}
                          onChange={(e) => setNewResource({...newResource, pages: e.target.value})}
                          min="0"
                          placeholder="e.g., 42"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {newResource.type === 'video' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL *</label>
                      <input
                        type="url"
                        value={newResource.youtube_url}
                        onChange={(e) => setNewResource({...newResource, youtube_url: e.target.value})}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        required={newResource.type === 'video'}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">YouTube Playlist ID</label>
                        <input
                          type="text"
                          value={newResource.youtube_playlist_id}
                          onChange={(e) => setNewResource({...newResource, youtube_playlist_id: e.target.value})}
                          placeholder="Optional playlist ID"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          value={newResource.duration}
                          onChange={(e) => setNewResource({...newResource, duration: e.target.value})}
                          min="0"
                          placeholder="e.g., 45"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {newResource.type === 'notes' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload Notes File</label>
                        <div className="flex items-center space-x-2">
                          <label className="flex-1 cursor-pointer">
                            <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center flex items-center justify-center space-x-2">
                              <Upload className="h-4 w-4" />
                              <span>Select File</span>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          {uploadedFile && (
                            <button
                              onClick={() => {
                                setUploadedFile(null);
                                setUploadStatus('idle');
                                setUploadProgress(0);
                                setNewResource({
                                  ...newResource,
                                  file_size: '',
                                  file_format: ''
                                });
                              }}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </button>
                          )}
                        </div>
                        {uploadedFile && (
                          <div className="mt-2">
                            <p className="text-sm text-white">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-400">
                              {Math.round(uploadedFile.size / 1024)} KB • {uploadedFile.type}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Google Drive URL</label>
                        <input
                          type="url"
                          value={newResource.google_drive_url}
                          onChange={(e) => setNewResource({...newResource, google_drive_url: e.target.value})}
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {newResource.type === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">External URL *</label>
                    <input
                      type="url"
                      value={newResource.file_url}
                      onChange={(e) => setNewResource({...newResource, file_url: e.target.value})}
                      placeholder="https://example.com/resource"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required={newResource.type === 'link'}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Link to external content like blog posts, articles, or research papers
                    </p>
                  </div>
                )}
              </div>

              {/* Academic Information */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-white">Academic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Course Code</label>
                    <input
                      type="text"
                      value={newResource.course_code}
                      onChange={(e) => setNewResource({...newResource, course_code: e.target.value})}
                      placeholder="e.g., NA31001"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                    <select
                      value={newResource.semester}
                      onChange={(e) => setNewResource({...newResource, semester: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select Semester</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <input
                    type="text"
                    value={newResource.tags}
                    onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
                </div>
              </div>

              {/* Publishing Options */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-white">Publishing Options</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={newResource.is_published}
                    onChange={(e) => setNewResource({...newResource, is_published: e.target.checked})}
                    className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="is_published" className="text-white">
                    Publish immediately
                  </label>
                </div>
                
                {!newResource.is_published && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Publication</label>
                    <input
                      type="datetime-local"
                      value={newResource.scheduled_publish_at}
                      onChange={(e) => setNewResource({...newResource, scheduled_publish_at: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Leave blank to save as draft without scheduling
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={newResource.sort_order}
                    onChange={(e) => setNewResource({...newResource, sort_order: e.target.value})}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Lower numbers appear first in listings
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetResourceForm();
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResource}
                disabled={isSubmitting || !newResource.title || (newResource.type === 'video' && !newResource.youtube_url) || (newResource.type === 'link' && !newResource.file_url)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Resource"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Edit Resource</h2>
              <button 
                onClick={() => setEditingResource(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Resource Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(editingResource.type)}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    editingResource.is_published 
                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                      : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  }`}>
                    {editingResource.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  ID: {editingResource.id.substring(0, 8)}...
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={editingResource.title}
                    onChange={(e) => setEditingResource({...editingResource, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingResource.description || ''}
                    onChange={(e) => setEditingResource({...editingResource, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      value={editingResource.type}
                      onChange={(e) => setEditingResource({...editingResource, type: e.target.value as Resource['type']})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video Content</option>
                      <option value="notes">Study Notes</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={editingResource.category_id || ''}
                      onChange={(e) => setEditingResource({...editingResource, category_id: e.target.value || null})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Type-specific fields */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-white">Resource Content</h3>
                
                {editingResource.type === 'pdf' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">File URL</label>
                      <input
                        type="url"
                        value={editingResource.file_url || ''}
                        onChange={(e) => setEditingResource({...editingResource, file_url: e.target.value})}
                        placeholder="https://example.com/file.pdf"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Google Drive URL</label>
                      <input
                        type="url"
                        value={editingResource.google_drive_url || ''}
                        onChange={(e) => setEditingResource({...editingResource, google_drive_url: e.target.value})}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">File Size (KB)</label>
                        <input
                          type="number"
                          value={editingResource.file_size || ''}
                          onChange={(e) => setEditingResource({...editingResource, file_size: e.target.value ? parseInt(e.target.value) : null})}
                          min="0"
                          placeholder="e.g., 1024"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Number of Pages</label>
                        <input
                          type="number"
                          value={editingResource.pages || ''}
                          onChange={(e) => setEditingResource({...editingResource, pages: e.target.value ? parseInt(e.target.value) : null})}
                          min="0"
                          placeholder="e.g., 42"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {editingResource.type === 'video' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL *</label>
                      <input
                        type="url"
                        value={editingResource.youtube_url || ''}
                        onChange={(e) => setEditingResource({...editingResource, youtube_url: e.target.value})}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        required={editingResource.type === 'video'}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">YouTube Playlist ID</label>
                        <input
                          type="text"
                          value={editingResource.youtube_playlist_id || ''}
                          onChange={(e) => setEditingResource({...editingResource, youtube_playlist_id: e.target.value})}
                          placeholder="Optional playlist ID"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          value={editingResource.duration || ''}
                          onChange={(e) => setEditingResource({...editingResource, duration: e.target.value ? parseInt(e.target.value) : null})}
                          min="0"
                          placeholder="e.g., 45"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {editingResource.type === 'notes' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">File URL</label>
                      <input
                        type="url"
                        value={editingResource.file_url || ''}
                        onChange={(e) => setEditingResource({...editingResource, file_url: e.target.value})}
                        placeholder="https://example.com/file.pdf"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Google Drive URL</label>
                      <input
                        type="url"
                        value={editingResource.google_drive_url || ''}
                        onChange={(e) => setEditingResource({...editingResource, google_drive_url: e.target.value})}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}
                
                {editingResource.type === 'link' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">External URL *</label>
                    <input
                      type="url"
                      value={editingResource.file_url || ''}
                      onChange={(e) => setEditingResource({...editingResource, file_url: e.target.value})}
                      placeholder="https://example.com/resource"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      required={editingResource.type === 'link'}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Link to external content like blog posts, articles, or research papers
                    </p>
                  </div>
                )}
              </div>

              {/* Academic Information */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-white">Academic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Course Code</label>
                    <input
                      type="text"
                      value={editingResource.course_code || ''}
                      onChange={(e) => setEditingResource({...editingResource, course_code: e.target.value})}
                      placeholder="e.g., NA31001"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                    <select
                      value={editingResource.semester || ''}
                      onChange={(e) => setEditingResource({...editingResource, semester: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select Semester</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <input
                    type="text"
                    value={Array.isArray(editingResource.tags) ? editingResource.tags.join(', ') : editingResource.tags || ''}
                    onChange={(e) => setEditingResource({...editingResource, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-white">Resource Statistics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-750 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Views</span>
                      <Eye className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-xl font-bold text-white">{editingResource.view_count}</p>
                  </div>
                  
                  <div className="bg-gray-750 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Downloads</span>
                      <Download className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-xl font-bold text-white">{editingResource.download_count}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Created At</label>
                    <p className="text-sm text-white">{new Date(editingResource.created_at).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Last Updated</label>
                    <p className="text-sm text-white">{new Date(editingResource.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Publishing Options */}
              <div className="pt-4 border-t border-gray-700 space-y-4">
                <h3 className="text-lg font-medium text-white">Publishing Options</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_published"
                    checked={editingResource.is_published}
                    onChange={(e) => setEditingResource({...editingResource, is_published: e.target.checked})}
                    className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="edit_is_published" className="text-white">
                    Published
                  </label>
                </div>
                
                {!editingResource.is_published && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Schedule Publication</label>
                    <input
                      type="datetime-local"
                      value={editingResource.scheduled_publish_at || ''}
                      onChange={(e) => setEditingResource({...editingResource, scheduled_publish_at: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Leave blank to save as draft without scheduling
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={editingResource.sort_order}
                    onChange={(e) => setEditingResource({...editingResource, sort_order: parseInt(e.target.value)})}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Lower numbers appear first in listings
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-between">
              <button
                onClick={() => handleDeleteResource(editingResource.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Resource
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateResource}
                  disabled={isSubmitting || !editingResource.title}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Resource Modal */}
      {showViewModal && viewingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Resource Details</h2>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  setViewingResource(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Resource Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 rounded-full bg-gray-700">
                  {getTypeIcon(viewingResource.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{viewingResource.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      viewingResource.type === 'pdf' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                      viewingResource.type === 'video' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                      viewingResource.type === 'notes' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                      'bg-purple-500 bg-opacity-20 text-purple-400'
                    }`}>
                      {getResourceTypeName(viewingResource.type)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      viewingResource.is_published 
                        ? 'bg-green-500 bg-opacity-20 text-green-400' 
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                    }`}>
                      {viewingResource.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {viewingResource.description && (
                <div className="bg-gray-750 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-white mb-2">Description</h4>
                  <p className="text-gray-400 text-sm">{viewingResource.description}</p>
                </div>
              )}
              
              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Content Details</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category</span>
                      <span className="text-white">{getCategoryName(viewingResource.category_id)}</span>
                    </div>
                    
                    {viewingResource.course_code && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Course</span>
                        <span className="text-white">{viewingResource.course_code}</span>
                      </div>
                    )}
                    
                    {viewingResource.semester && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Semester</span>
                        <span className="text-white">{viewingResource.semester}</span>
                      </div>
                    )}
                    
                    {viewingResource.type === 'pdf' && (
                      <>
                        {viewingResource.pages && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pages</span>
                            <span className="text-white">{viewingResource.pages}</span>
                          </div>
                        )}
                        
                        {viewingResource.file_size && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Size</span>
                            <span className="text-white">{viewingResource.file_size} KB</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {viewingResource.type === 'video' && viewingResource.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-white">{viewingResource.duration} minutes</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {viewingResource.tags && viewingResource.tags.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-white mb-2">Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(viewingResource.tags) ? viewingResource.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 rounded-md text-gray-300 text-xs">
                            #{tag}
                          </span>
                        )) : (
                          <span className="text-gray-400">No tags</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Performance Metrics</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-750 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">Views</span>
                        <Eye className="h-4 w-4 text-blue-400" />
                      </div>
                      <p className="text-xl font-bold text-white">{viewingResource.view_count}</p>
                    </div>
                    
                    <div className="bg-gray-750 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">Downloads</span>
                        <Download className="h-4 w-4 text-green-400" />
                      </div>
                      <p className="text-xl font-bold text-white">{viewingResource.download_count}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">{new Date(viewingResource.created_at).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-white">{new Date(viewingResource.updated_at).toLocaleString()}</span>
                    </div>
                    
                    {viewingResource.scheduled_publish_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Scheduled to Publish</span>
                        <span className="text-orange-400">{new Date(viewingResource.scheduled_publish_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Resource Links */}
              <div className="space-y-4 mb-6">
                <h4 className="text-lg font-medium text-white">Resource Access</h4>
                
                {viewingResource.type === 'pdf' && (
                  <div className="space-y-2">
                    {viewingResource.file_url && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Direct File Link</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={viewingResource.file_url}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none"
                          />
                          <a 
                            href={viewingResource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 text-white" />
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {viewingResource.google_drive_url && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Google Drive Link</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={viewingResource.google_drive_url}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none"
                          />
                          <a 
                            href={viewingResource.google_drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 text-white" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {viewingResource.type === 'video' && viewingResource.youtube_url && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">YouTube URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={viewingResource.youtube_url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none"
                      />
                      <a 
                        href={viewingResource.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-white" />
                      </a>
                    </div>
                  </div>
                )}
                
                {viewingResource.type === 'link' && viewingResource.file_url && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">External URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={viewingResource.file_url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none"
                      />
                      <a 
                        href={viewingResource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-white" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Admin Actions */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-lg font-medium text-white mb-4">Admin Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setEditingResource(viewingResource);
                    }}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                    <span className="text-sm">Edit</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleTogglePublished(viewingResource.id, viewingResource.is_published);
                      setViewingResource({
                        ...viewingResource,
                        is_published: !viewingResource.is_published
                      });
                    }}
                    className={`flex flex-col items-center justify-center space-y-2 p-4 ${
                      viewingResource.is_published 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white rounded-lg transition-colors`}
                  >
                    {viewingResource.is_published ? (
                      <>
                        <EyeOff className="h-5 w-5" />
                        <span className="text-sm">Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-5 w-5" />
                        <span className="text-sm">Publish</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Do you want to duplicate this resource?')) {
                        // In a real app, this would create a duplicate
                        console.log('Duplicating resource:', viewingResource);
                        setShowViewModal(false);
                      }
                    }}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Copy className="h-5 w-5" />
                    <span className="text-sm">Duplicate</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setTimeout(() => handleDeleteResource(viewingResource.id), 300);
                    }}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingResource(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Import Resources</h2>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* CSV Upload */}
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Upload CSV File</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Upload a CSV file with resource data. The file should have the following columns:
                  title, type, description, category_id, file_url, etc.
                </p>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-750 hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV file only</p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" />
                </label>
              </div>
              
              {/* Import from Google Drive */}
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Import from Google Drive</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Connect to your Google Drive to import resources in bulk.
                </p>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Connect to Google Drive</span>
                </button>
              </div>
              
              {/* Manual Entry */}
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-medium text-white mb-2">Manual Entry</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Add resources one by one with full details.
                </p>
                
                <button 
                  onClick={() => {
                    setShowImportModal(false);
                    setShowCreateModal(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Resource</span>
                </button>
              </div>
              
              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-300 text-sm">
                    Need help with importing? Check the 
                    <a href="#" className="text-blue-400 underline ml-1">documentation</a> 
                    for file format requirements.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
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

// Custom Copy icon component
const Copy = ({ className }: { className?: string }) => (
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
    <rect x="8" y="8" width="12" height="12" rx="2" ry="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);

export default ResourceManagement;