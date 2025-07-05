import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  FileText, 
  Video, 
  Link as LinkIcon,
  Download,
  Eye,
  Heart,
  BookOpen,
  Calendar,
  User,
  Share2,
  ExternalLink
} from 'lucide-react';

const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewedResources, setViewedResources] = useState<number[]>([]);
  const [downloadedResources, setDownloadedResources] = useState<number[]>([]);

  const filters = [
    { id: 'all', label: 'All Resources', count: 1247 },
    { id: 'pdf', label: 'PDF Documents', count: 856 },
    { id: 'video', label: 'Video Lectures', count: 234 },
    { id: 'notes', label: 'Study Notes', count: 157 }
  ];

  const semesters = [
    { id: 'all', label: 'All Semesters' },
    { id: '1', label: 'Semester 1' },
    { id: '3', label: 'Semester 3' },
    { id: '4', label: 'Semester 4' },
    { id: '5', label: 'Semester 5' },
    { id: '6', label: 'Semester 6' },
    { id: '7', label: 'Semester 7' },
    { id: '8', label: 'Semester 8' }
  ];

  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Marine Hydrodynamics - Complete Course Notes',
      course: 'NA31001',
      courseName: 'Elements of Ocean Engineering',
      type: 'pdf',
      semester: 5,
      size: '15.2 MB',
      pages: 145,
      author: 'Prof. R.K. Sharma',
      uploadDate: '2024-01-15',
      downloads: 234,
      views: 1567,
      rating: 4.8,
      description: 'Comprehensive notes covering wave theory, fluid dynamics, and marine structures analysis.',
      tags: ['hydrodynamics', 'waves', 'theory'],
      thumbnail: 'https://images.pexels.com/photos/159591/book-education-school-literature-159591.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      downloadUrl: 'https://example.com/marine-hydrodynamics.pdf'
    },
    {
      id: 2,
      title: 'Ship Construction and Production Methods',
      course: 'NA20204',
      courseName: 'Ship Construction and Production',
      type: 'video',
      semester: 4,
      duration: '2h 15min',
      author: 'Dr. A.K. Thakur',
      uploadDate: '2024-01-10',
      views: 1567,
      rating: 4.6,
      description: 'Video lecture series on modern shipbuilding techniques and production processes.',
      tags: ['construction', 'production', 'shipbuilding'],
      thumbnail: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      videoUrl: 'https://example.com/ship-construction-video'
    },
    {
      id: 3,
      title: 'Offshore Technology and Platform Design',
      course: 'NA41001',
      courseName: 'Offshore Technology',
      type: 'pdf',
      semester: 8,
      size: '8.7 MB',
      pages: 98,
      author: 'Prof. S.K. Bhattacharya',
      uploadDate: '2024-01-08',
      downloads: 89,
      views: 456,
      rating: 4.9,
      description: 'Advanced concepts in offshore platform design and installation procedures.',
      tags: ['offshore', 'platform', 'design'],
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      downloadUrl: 'https://example.com/offshore-technology.pdf'
    },
    {
      id: 4,
      title: 'Resistance and Propulsion Analysis',
      course: 'NA30203',
      courseName: 'Resistance',
      type: 'notes',
      semester: 5,
      size: '3.4 MB',
      pages: 45,
      author: 'Student Notes',
      uploadDate: '2024-01-05',
      downloads: 156,
      views: 789,
      rating: 4.3,
      description: 'Student-compiled notes on ship resistance calculations and propulsion systems.',
      tags: ['resistance', 'propulsion', 'calculations'],
      thumbnail: 'https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
      downloadUrl: 'https://example.com/resistance-propulsion.pdf'
    }
  ]);

  // Handler functions
  const handleToggleFavorite = (resourceId: number) => {
    setFavorites(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
    
    // Store in localStorage for persistence
    const updatedFavorites = favorites.includes(resourceId) 
      ? favorites.filter(id => id !== resourceId)
      : [...favorites, resourceId];
    localStorage.setItem('favoriteResources', JSON.stringify(updatedFavorites));
    
    const resource = resources.find(r => r.id === resourceId);
    const action = favorites.includes(resourceId) ? 'removed from' : 'added to';
    console.log(`"${resource?.title}" ${action} favorites`);
  };

  const handleViewResource = (resourceId: number) => {
    setViewedResources(prev => [...prev, resourceId]);
    
    // Update view count
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, views: resource.views + 1 }
        : resource
    ));
    
    const resource = resources.find(r => r.id === resourceId);
    if (resource?.type === 'video' && resource.videoUrl) {
      window.open(resource.videoUrl, '_blank');
    } else if (resource?.downloadUrl) {
      window.open(resource.downloadUrl, '_blank');
    }
    
    console.log(`Viewing resource: ${resource?.title}`);
  };

  const handleDownloadResource = (resourceId: number) => {
    setDownloadedResources(prev => [...prev, resourceId]);
    
    // Update download count
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, downloads: resource.downloads + 1 }
        : resource
    ));
    
    const resource = resources.find(r => r.id === resourceId);
    if (resource?.downloadUrl) {
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = resource.downloadUrl;
      link.download = `${resource.title}.${resource.type === 'pdf' ? 'pdf' : 'mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    console.log(`Downloaded resource: ${resource?.title}`);
  };

  const handleShareResource = (resourceId: number) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      if (navigator.share) {
        navigator.share({
          title: resource.title,
          text: resource.description,
          url: window.location.href + `?resource=${resourceId}`
        });
      } else {
        // Fallback: copy to clipboard
        const shareUrl = window.location.href + `?resource=${resourceId}`;
        navigator.clipboard.writeText(shareUrl);
        console.log(`Share link copied to clipboard: ${shareUrl}`);
      }
    }
  };

  const handleLoadMore = () => {
    // Simulate loading more resources
    const newResources = [
      {
        id: 5,
        title: 'Advanced Marine Engineering Principles',
        course: 'NA31003',
        courseName: 'Advanced Marine Engineering',
        type: 'pdf',
        semester: 6,
        size: '12.8 MB',
        pages: 180,
        author: 'Prof. M.K. Das',
        uploadDate: '2024-01-03',
        downloads: 67,
        views: 234,
        rating: 4.7,
        description: 'Advanced principles in marine engineering systems and design.',
        tags: ['advanced', 'engineering', 'marine'],
        thumbnail: 'https://images.pexels.com/photos/159591/book-education-school-literature-159591.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
        downloadUrl: 'https://example.com/advanced-marine.pdf'
      }
    ];
    
    setResources(prev => [...prev, ...newResources]);
    console.log('Loaded more resources');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Searching for: ${searchQuery}`);
    // In a real app, this would filter the resources based on the search query
  };

  // Load favorites from localStorage on component mount
  React.useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteResources');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-400" />;
      case 'notes':
        return <BookOpen className="h-5 w-5 text-green-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-500 bg-opacity-20 text-red-400 border-red-500 border-opacity-30';
      case 'video':
        return 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500 border-opacity-30';
      case 'notes':
        return 'bg-green-500 bg-opacity-20 text-green-400 border-green-500 border-opacity-30';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-400 border-gray-500 border-opacity-30';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || resource.type === selectedFilter;
    const matchesSemester = selectedSemester === 'all' || resource.semester.toString() === selectedSemester;
    
    return matchesSearch && matchesFilter && matchesSemester;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'views':
        return b.views - a.views;
      default:
        return 0; // relevance - keep original order
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Resource Library</h1>
          <p className="text-gray-400 mt-1">
            Explore {resources.length} academic resources across all courses
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, courses, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.label} ({filter.count})
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {sortedResources.length} of {resources.length} resources
          {favorites.length > 0 && (
            <span className="ml-2 text-pink-400">
              • {favorites.length} favorited
            </span>
          )}
        </p>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="relevance">Sort by Relevance</option>
          <option value="date">Sort by Date</option>
          <option value="rating">Sort by Rating</option>
          <option value="downloads">Sort by Downloads</option>
          <option value="views">Sort by Views</option>
        </select>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={resource.thumbnail} 
                alt={resource.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(resource.type)}`}>
                  {resource.type.toUpperCase()}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(resource.id);
                  }}
                  className={`p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all ${
                    favorites.includes(resource.id) 
                      ? 'text-pink-400 bg-pink-400 bg-opacity-20' 
                      : 'text-white'
                  }`}
                  title={favorites.includes(resource.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(resource.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(resource.type)}
                  <span className="text-blue-400 text-sm font-medium">{resource.course}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-pink-400 fill-current" />
                  <span className="text-sm text-gray-300">{resource.rating}</span>
                </div>
              </div>

              <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {resource.title}
              </h3>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {resource.description}
              </p>

              <div className="flex items-center text-gray-400 text-sm space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{resource.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Sem {resource.semester}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-gray-400 text-sm">
                  {resource.type === 'video' ? (
                    <span>{resource.duration} • {resource.views} views</span>
                  ) : (
                    <span>{resource.size} • {resource.downloads} downloads</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewResource(resource.id);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors group/btn"
                    title="View resource"
                  >
                    <Eye className="h-4 w-4 text-gray-400 group-hover/btn:text-blue-400" />
                  </button>
                  
                  {resource.type !== 'video' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadResource(resource.id);
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors group/btn"
                      title="Download resource"
                    >
                      <Download className="h-4 w-4 text-gray-400 group-hover/btn:text-green-400" />
                    </button>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareResource(resource.id);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors group/btn"
                    title="Share resource"
                  >
                    <Share2 className="h-4 w-4 text-gray-400 group-hover/btn:text-purple-400" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {resource.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Status indicators */}
              <div className="flex items-center space-x-2 mt-3">
                {viewedResources.includes(resource.id) && (
                  <span className="text-xs text-blue-400 flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>Viewed</span>
                  </span>
                )}
                {downloadedResources.includes(resource.id) && (
                  <span className="text-xs text-green-400 flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>Downloaded</span>
                  </span>
                )}
                {favorites.includes(resource.id) && (
                  <span className="text-xs text-pink-400 flex items-center space-x-1">
                    <Heart className="h-3 w-3 fill-current" />
                    <span>Favorited</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button 
          onClick={handleLoadMore}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
        >
          <span>Load More Resources</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* Favorites Summary */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-pink-500 bg-opacity-10 border border-pink-500 border-opacity-30 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-pink-400 fill-current" />
            <div>
              <h3 className="text-pink-400 font-medium">
                {favorites.length} Resource{favorites.length > 1 ? 's' : ''} Favorited
              </h3>
              <p className="text-pink-300 text-sm">
                Access your favorite resources anytime from your profile
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Resources;