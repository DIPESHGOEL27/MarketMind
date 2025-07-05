import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  Hash,
  FileText,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
  AlertCircle,
  Folder,
  FolderPlus,
  FolderOpen
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  resource_count?: number;
  level?: number;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'sort_order' | 'created_at'>('sort_order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, [sortField, sortDirection, showInactive]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          resources!inner(id)
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        // Process categories
        const flatCategories = (data || []).map(cat => ({
          ...cat,
          resource_count: cat.resources?.length || 0,
          level: 0
        }));
        
        setAllCategories(flatCategories);
        
        // Build hierarchy
        const rootCategories: Category[] = [];
        const categoryMap = new Map<string, Category>();

        flatCategories.forEach(cat => {
          categoryMap.set(cat.id, { ...cat, children: [] });
        });

        flatCategories.forEach(cat => {
          if (cat.parent_id && categoryMap.has(cat.parent_id)) {
            const parent = categoryMap.get(cat.parent_id)!;
            if (!parent.children) parent.children = [];
            const childWithLevel = { ...categoryMap.get(cat.id)!, level: (parent.level || 0) + 1 };
            parent.children.push(childWithLevel);
          } else {
            rootCategories.push(categoryMap.get(cat.id)!);
          }
        });

        setCategories(rootCategories);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreateCategory = async () => {
    try {
      const categoryData = {
        name: newCategory.name,
        slug: newCategory.slug || generateSlug(newCategory.name),
        description: newCategory.description || null,
        parent_id: newCategory.parent_id || null,
        is_active: newCategory.is_active,
        sort_order: newCategory.sort_order,
        created_by: 'admin' // This should be the actual admin user ID
      };

      const { error } = await supabase
        .from('categories')
        .insert([categoryData]);

      if (!error) {
        setShowCreateModal(false);
        setNewCategory({
          name: '',
          slug: '',
          description: '',
          parent_id: '',
          is_active: true,
          sort_order: 0
        });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          parent_id: editingCategory.parent_id || null,
          is_active: editingCategory.is_active,
          sort_order: editingCategory.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCategory.id);

      if (!error) {
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all subcategories and remove category associations from resources.')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);

        if (!error) {
          fetchCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);

      if (!error) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDragStart = (categoryId: string) => {
    setDraggedCategory(categoryId);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (draggedCategory !== categoryId) {
      setDropTarget(categoryId);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory === targetCategoryId) {
      setIsDragging(false);
      setDraggedCategory(null);
      setDropTarget(null);
      return;
    }

    try {
      // Get the target category to set as parent
      const targetCategory = findCategoryById(categories, targetCategoryId);
      
      // Update the dragged category's parent_id
      const { error } = await supabase
        .from('categories')
        .update({ 
          parent_id: targetCategoryId,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggedCategory);

      if (!error) {
        // If the target was expanded, keep it expanded
        if (!expandedCategories.includes(targetCategoryId)) {
          setExpandedCategories([...expandedCategories, targetCategoryId]);
        }
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category parent:', error);
    } finally {
      setIsDragging(false);
      setDraggedCategory(null);
      setDropTarget(null);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedCategory(null);
    setDropTarget(null);
  };

  const findCategoryById = (cats: Category[], id: string): Category | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.includes(category.id);
    const isDragTarget = dropTarget === category.id;
    const isBeingDragged = draggedCategory === category.id;

    if (!showInactive && !category.is_active) {
      return null;
    }

    return (
      <React.Fragment key={category.id}>
        <motion.tr
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`hover:bg-gray-750 transition-colors ${isDragTarget ? 'bg-blue-900 bg-opacity-20' : ''} ${isBeingDragged ? 'opacity-50' : ''}`}
          draggable
          onDragStart={() => handleDragStart(category.id)}
          onDragOver={(e) => handleDragOver(e, category.id)}
          onDrop={(e) => handleDrop(e, category.id)}
          onDragEnd={handleDragEnd}
        >
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 24}px` }}>
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              )}
              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                ) : (
                  <Folder className="h-5 w-5 text-blue-400" />
                )
              ) : (
                <FolderTree className="h-5 w-5 text-blue-400" />
              )}
            </div>
          </td>
          <td className="px-6 py-4">
            <div>
              <h3 className="text-white font-medium">{category.name}</h3>
              <p className="text-gray-400 text-sm">/{category.slug}</p>
              {category.description && (
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{category.description}</p>
              )}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-white">{category.resource_count || 0}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              category.is_active 
                ? 'bg-green-500 bg-opacity-20 text-green-400' 
                : 'bg-red-500 bg-opacity-20 text-red-400'
            }`}>
              {category.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4">
            <span className="text-gray-400 text-sm">
              {new Date(category.created_at).toLocaleDateString()}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleToggleActive(category.id, category.is_active)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title={category.is_active ? 'Deactivate' : 'Activate'}
              >
                {category.is_active ? (
                  <EyeOff className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Eye className="h-4 w-4 text-green-400" />
                )}
              </button>
              <button
                onClick={() => setEditingCategory(category)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4 text-blue-400" />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </td>
        </motion.tr>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && 
          category.children!.map(child => renderCategory(child, level + 1))
        }
      </React.Fragment>
    );
  };

  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const traverse = (categories: Category[]) => {
      categories.forEach(cat => {
        result.push(cat);
        if (cat.children) {
          traverse(cat.children);
        }
      });
    };
    traverse(cats);
    return result;
  };

  const filteredCategories = categories.filter(category => {
    const allCategories = flattenCategories([category]);
    return allCategories.some(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const categoryStats = {
    total: allCategories.length,
    active: allCategories.filter(c => c.is_active).length,
    inactive: allCategories.filter(c => !c.is_active).length,
    topLevel: categories.length,
    withResources: allCategories.filter(c => (c.resource_count || 0) > 0).length
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
          <h1 className="text-2xl font-bold text-white">Category Management</h1>
          <p className="text-gray-400 mt-1">
            Organize content with hierarchical categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Total Categories', value: categoryStats.total, icon: FolderTree, color: 'text-blue-400' },
          { label: 'Active', value: categoryStats.active, icon: Eye, color: 'text-green-400' },
          { label: 'Inactive', value: categoryStats.inactive, icon: EyeOff, color: 'text-yellow-400' },
          { label: 'Top Level', value: categoryStats.topLevel, icon: Folder, color: 'text-purple-400' },
          { label: 'With Resources', value: categoryStats.withResources, icon: FileText, color: 'text-orange-400' }
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

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="showInactive" className="text-white text-sm">Show Inactive</label>
            </div>
            
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as 'name' | 'sort_order' | 'created_at');
                setSortDirection(direction as 'asc' | 'desc');
              }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="sort_order-asc">Sort Order (Low to High)</option>
              <option value="sort_order-desc">Sort Order (High to Low)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Order</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Category</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Resources</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Status</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Created</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => renderCategory(category))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FolderTree className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Categories Found</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      {searchQuery
                        ? 'No categories match your search criteria. Try a different search term.'
                        : 'You haven\'t created any categories yet. Get started by adding your first category.'}
                    </p>
                    <button
                      onClick={() => {
                        if (searchQuery) {
                          setSearchQuery('');
                        } else {
                          setShowCreateModal(true);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                    >
                      {searchQuery ? (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          <span>Clear Search</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Add First Category</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add New Category</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCategory({
                      ...newCategory, 
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">URL-friendly version of the name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Parent Category</label>
                <select
                  value={newCategory.parent_id}
                  onChange={(e) => setNewCategory({...newCategory, parent_id: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">None (Root Category)</option>
                  {flattenCategories(categories).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={newCategory.sort_order}
                    onChange={(e) => setNewCategory({...newCategory, sort_order: parseInt(e.target.value)})}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newCategory.is_active}
                      onChange={(e) => setNewCategory({...newCategory, is_active: e.target.checked})}
                      className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-white text-sm">Active</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Edit Category</h2>
              <button 
                onClick={() => setEditingCategory(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderTree className="h-5 w-5 text-blue-400" />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    editingCategory.is_active 
                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                      : 'bg-red-500 bg-opacity-20 text-red-400'
                  }`}>
                    {editingCategory.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  ID: {editingCategory.id.substring(0, 8)}...
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Parent Category</label>
                <select
                  value={editingCategory.parent_id || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, parent_id: e.target.value || undefined})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">None (Root Category)</option>
                  {flattenCategories(categories)
                    .filter(cat => cat.id !== editingCategory.id) // Can't be its own parent
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={editingCategory.sort_order}
                    onChange={(e) => setEditingCategory({...editingCategory, sort_order: parseInt(e.target.value)})}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_active}
                      onChange={(e) => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                      className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-white text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-750 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Category Stats</h3>
                  <span className="text-gray-400 text-sm">
                    {editingCategory.resource_count || 0} resources
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-white">{new Date(editingCategory.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Updated</p>
                    <p className="text-white">{new Date(editingCategory.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex justify-between">
              <button
                onClick={() => handleDeleteCategory(editingCategory.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete Category
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;