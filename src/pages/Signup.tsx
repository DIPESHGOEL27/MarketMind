import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Phone, Mail, Lock, GraduationCap, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    yearOfStudy: ''
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const yearOptions = [
    { value: '', label: 'Select Year of Study' },
    { value: 'First Year', label: 'First Year' },
    { value: 'Second Year', label: 'Second Year' },
    { value: 'Third Year', label: 'Third Year' },
    { value: 'Fourth Year', label: 'Fourth Year' },
    { value: 'Fifth Year', label: 'Fifth Year' },
    { value: 'Alumni', label: 'Alumni' }
  ];

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        return '';
      
      case 'mobile':
        if (!value) return 'Mobile number is required';
        if (!/^\d{10}$/.test(value)) return 'Mobile number must be exactly 10 digits';
        return '';
      
      case 'email':
        if (!value) return 'Email is required';
        if (!value.endsWith('@kgpian.iitkgp.ac.in')) {
          return 'Please use your official @kgpian.iitkgp.ac.in email address';
        }
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character (@$!%*?&)';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      case 'yearOfStudy':
        if (!value) return 'Please select your year of study';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signup({
        name: formData.name.trim(),
        mobile: formData.mobile,
        email: formData.email.toLowerCase(),
        password: formData.password,
        yearOfStudy: formData.yearOfStudy
      });

      if (result.success) {
        setShowSuccess(true);
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Check Your Email!</h1>
            <p className="text-gray-300 mb-4">
              We've sent a verification link to
            </p>
            <p className="text-blue-400 font-medium mb-6">{formData.email}</p>
          </div>

          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Check your inbox</p>
                  <p className="text-gray-400 text-sm">Look for an email from VidyaSagar</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Click the verification link</p>
                  <p className="text-gray-400 text-sm">This will confirm your email address</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Complete your login</p>
                  <p className="text-gray-400 text-sm">You'll be redirected to your dashboard</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-400 font-medium text-sm">Didn't receive the email?</p>
                  <p className="text-blue-300 text-xs">
                    Check your spam folder or contact support if the email doesn't arrive within 5 minutes.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 block text-center"
            >
              Go to Login Page
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <BookOpen className="h-12 w-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">VidyaSagar</h1>
          </motion.div>
          <p className="text-gray-300 text-lg">Create Your Account</p>
          <p className="text-gray-400 text-sm mt-2">Join the academic community at IIT Kharagpur</p>
        </div>

        {/* Signup Form */}
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

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Enter your full name as per official records</p>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-300 mb-2">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.mobile ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-400">{errors.mobile}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">10-digit mobile number for account verification</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Institute Email ID *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="your.name@kgpian.iitkgp.ac.in"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Use your official IIT Kharagpur email address</p>
            </div>

            {/* Year of Study */}
            <div>
              <label htmlFor="yearOfStudy" className="block text-sm font-medium text-gray-300 mb-2">
                Year of Study *
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="yearOfStudy"
                  name="yearOfStudy"
                  required
                  value={formData.yearOfStudy}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none ${
                    errors.yearOfStudy ? 'border-red-500' : 'border-gray-600'
                  }`}
                >
                  {yearOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-700">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.yearOfStudy && (
                <p className="mt-1 text-sm text-red-400">{errors.yearOfStudy}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Select your current academic year</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1 text-gray-400">
                    Password strength: {
                      passwordStrength <= 2 ? 'Weak' :
                      passwordStrength <= 3 ? 'Medium' : 
                      passwordStrength <= 4 ? 'Strong' : 'Very Strong'
                    }
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Must contain: 8+ characters, uppercase, lowercase, number, special character
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center text-xs text-gray-400"
        >
          By creating an account, you agree to our{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;