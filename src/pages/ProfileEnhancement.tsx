import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Upload, 
  Linkedin, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  FileText,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfileEnhancement: React.FC = () => {
  const [formData, setFormData] = useState({
    bio: '',
    linkedinUrl: '',
    avatar: null as File | null
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();

  const calculateProgress = () => {
    let completed = 0;
    const total = 3;
    
    if (formData.bio.trim()) completed++;
    if (formData.avatar) completed++;
    if (formData.linkedinUrl.trim()) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const validateField = (name: string, value: string | File | null) => {
    switch (name) {
      case 'bio':
        if (typeof value === 'string' && value.length > 200) {
          return 'Bio must be 200 characters or less';
        }
        return '';
      
      case 'linkedinUrl':
        if (typeof value === 'string' && value.trim()) {
          const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
          if (!linkedinRegex.test(value)) {
            return 'Please enter a valid LinkedIn profile URL (linkedin.com/in/username)';
          }
        }
        return '';
      
      case 'avatar':
        if (value instanceof File) {
          if (value.size > 5 * 1024 * 1024) {
            return 'Image must be less than 5MB';
          }
          if (!['image/jpeg', 'image/png'].includes(value.type)) {
            return 'Only JPEG and PNG files are allowed';
          }
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateField('avatar', file);
      if (error) {
        setErrors(prev => ({ ...prev, avatar: error }));
        return;
      }

      setFormData(prev => ({ ...prev, avatar: file }));
      setErrors(prev => ({ ...prev, avatar: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, you would upload the file to a server
      let avatarUrl = '';
      if (formData.avatar) {
        // Mock upload - create a temporary URL
        avatarUrl = URL.createObjectURL(formData.avatar);
      }

      const success = await updateProfile({
        bio: formData.bio.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        avatar: avatarUrl || undefined
      });

      if (success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const skipProfile = () => {
    navigate('/dashboard');
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
            <p className="text-gray-300">
              Welcome, {user?.name}! Let's enhance your profile to get the most out of VidyaSagar.
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Profile Completion</span>
              <span className="text-sm text-blue-400 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Better Networking</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Personalized Experience</p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">Increased Visibility</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-red-400 bg-red-500 bg-opacity-10 p-3 rounded-lg border border-red-500 border-opacity-30"
              >
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{errors.general}</span>
              </motion.div>
            )}

            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Profile Picture
                <span className="text-gray-400 font-normal ml-2">(Optional)</span>
              </label>
              
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center border-4 border-gray-500">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    JPEG or PNG, max 5MB
                  </p>
                </div>
              </div>
              
              {errors.avatar && (
                <p className="mt-2 text-sm text-red-400">{errors.avatar}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                Professional Bio
                <span className="text-gray-400 font-normal ml-2">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell others about yourself, your interests, and academic goals..."
                  maxLength={200}
                  rows={4}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    errors.bio ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                {errors.bio ? (
                  <p className="text-sm text-red-400">{errors.bio}</p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Share your academic interests and career goals
                  </p>
                )}
                <span className="text-xs text-gray-400">
                  {formData.bio.length}/200
                </span>
              </div>
            </div>

            {/* LinkedIn URL */}
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn Profile
                <span className="text-gray-400 font-normal ml-2">(Optional)</span>
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/your-username"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.linkedinUrl ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
              </div>
              {errors.linkedinUrl && (
                <p className="mt-1 text-sm text-red-400">{errors.linkedinUrl}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Connect with peers and alumni in your professional network
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={skipProfile}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Skip for Now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Complete Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileEnhancement;