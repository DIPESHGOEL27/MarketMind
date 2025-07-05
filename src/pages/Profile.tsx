import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Trophy, 
  Clock,
  Settings,
  Edit,
  Download,
  Eye,
  MessageSquare,
  Heart,
  FileText,
  Video,
  Play,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [favoriteResources, setFavoriteResources] = useState<number[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<number[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedResourceFavorites = localStorage.getItem('favoriteResources');
    const savedCourseFavorites = localStorage.getItem('favoriteCourses');
    
    if (savedResourceFavorites) {
      setFavoriteResources(JSON.parse(savedResourceFavorites));
    }
    if (savedCourseFavorites) {
      setFavoriteCourses(JSON.parse(savedCourseFavorites));
    }
  }, []);

  const stats = [
    { label: 'Courses Completed', value: '12', icon: BookOpen, color: 'text-blue-400' },
    { label: 'Resources Downloaded', value: '234', icon: Download, color: 'text-green-400' },
    { label: 'Study Hours', value: '156', icon: Clock, color: 'text-purple-400' },
    { label: 'Forum Posts', value: '45', icon: MessageSquare, color: 'text-orange-400' }
  ];

  const achievements = [
    { name: 'Early Bird', description: 'Completed first assignment ahead of deadline', icon: '🌅', date: '2024-01-15' },
    { name: 'Knowledge Seeker', description: 'Downloaded 100+ resources', icon: '📚', date: '2024-01-10' },
    { name: 'Team Player', description: 'Active in 5+ study groups', icon: '🤝', date: '2024-01-05' },
    { name: 'Rising Star', description: 'Received 10+ likes on forum posts', icon: '⭐', date: '2024-01-01' }
  ];

  const recentActivity = [
    { action: 'Completed', item: 'Marine Hydrodynamics Quiz', course: 'NA31001', time: '2 hours ago', score: '95%' },
    { action: 'Downloaded', item: 'Ship Design Handbook', course: 'NA31002', time: '1 day ago', size: '15.2 MB' },
    { action: 'Posted', item: 'Question about wave theory', course: 'Discussion Forum', time: '2 days ago', replies: '3 replies' },
    { action: 'Submitted', item: 'Structural Analysis Report', course: 'NA21004', time: '3 days ago', status: 'Graded' }
  ];

  const coursesProgress = [
    { code: 'NA31007', name: 'Vibration of Floating Structures', progress: 75, grade: 'A-' },
    { code: 'NA31002', name: 'Marine Design', progress: 60, grade: 'B+' },
    { code: 'NA30204', name: 'Seakeeping', progress: 45, grade: 'In Progress' },
    { code: 'NA30202', name: 'Maneuvering and Control', progress: 80, grade: 'A' }
  ];

  // Mock data for favorites (in a real app, this would come from the backend)
  const allResources = [
    {
      id: 1,
      title: 'Marine Hydrodynamics - Complete Course Notes',
      course: 'NA31001',
      type: 'pdf',
      size: '15.2 MB',
      thumbnail: 'https://images.pexels.com/photos/159591/book-education-school-literature-159591.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2'
    },
    {
      id: 2,
      title: 'Ship Construction and Production Methods',
      course: 'NA20204',
      type: 'video',
      duration: '2h 15min',
      thumbnail: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2'
    },
    {
      id: 3,
      title: 'Offshore Technology and Platform Design',
      course: 'NA41001',
      type: 'pdf',
      size: '8.7 MB',
      thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2'
    }
  ];

  const allCourses = [
    {
      id: 1,
      code: 'NA31007',
      name: 'Vibration of Floating Structures',
      instructor: 'Prof. R.K. Sharma',
      thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2'
    },
    {
      id: 2,
      code: 'NA31002',
      name: 'Marine Design',
      instructor: 'Dr. A.K. Thakur',
      thumbnail: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=100&h=60&dpr=2'
    }
  ];

  const myFavoriteResources = allResources.filter(resource => favoriteResources.includes(resource.id));
  const myFavoriteCourses = allCourses.filter(course => favoriteCourses.includes(course.id));

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic Progress' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'activity', label: 'Recent Activity' },
    { id: 'achievements', label: 'Achievements' }
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-400" />;
      case 'video':
        return <Video className="h-4 w-4 text-blue-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white border-opacity-20"
                />
              ) : (
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
                <Edit className="h-4 w-4 text-white" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
              <div className="space-y-1 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{user?.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Semester {user?.semester} • Roll No: {user?.rollNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>IIT Kharagpur, West Bengal</span>
                </div>
              </div>
            </div>
          </div>
          <button className="p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
            <Settings className="h-6 w-6 text-white" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'favorites' && (myFavoriteResources.length + myFavoriteCourses.length) > 0 && (
                <span className="ml-2 px-2 py-1 bg-pink-500 bg-opacity-20 text-pink-400 text-xs rounded-full">
                  {myFavoriteResources.length + myFavoriteCourses.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Current Semester Progress */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Current Semester Progress</h3>
                <div className="space-y-4">
                  {coursesProgress.slice(0, 3).map((course, index) => (
                    <div key={course.code} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-white font-medium">{course.code}</h4>
                            <p className="text-gray-400 text-sm">{course.name}</p>
                          </div>
                          <span className="text-blue-400 font-medium">{course.grade}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-400 text-sm w-12">{course.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Achievements */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-6">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.slice(0, 4).map((achievement, index) => (
                    <div key={achievement.name} className="p-4 bg-gray-750 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className="text-white font-medium">{achievement.name}</h4>
                          <p className="text-gray-400 text-sm">{achievement.description}</p>
                          <p className="text-gray-500 text-xs mt-1">{achievement.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-white font-semibold mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">CGPA</span>
                    <span className="text-white font-medium">8.45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credits Earned</span>
                    <span className="text-white font-medium">156/200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Attendance</span>
                    <span className="text-green-400 font-medium">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank</span>
                    <span className="text-white font-medium">8/45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favorites</span>
                    <span className="text-pink-400 font-medium flex items-center space-x-1">
                      <Heart className="h-4 w-4 fill-current" />
                      <span>{myFavoriteResources.length + myFavoriteCourses.length}</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm">
                          <span className="text-blue-400">{activity.action}</span> {activity.item}
                        </p>
                        <p className="text-gray-400 text-xs">{activity.course} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Academic Progress</h3>
            <div className="space-y-6">
              {coursesProgress.map((course, index) => (
                <div key={course.code} className="p-6 bg-gray-750 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{course.code}</h4>
                      <p className="text-gray-400">{course.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-400">{course.grade}</span>
                      <p className="text-gray-400 text-sm">Current Grade</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-16">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Favorite Resources */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-400 fill-current" />
                  <span>Favorite Resources</span>
                  {myFavoriteResources.length > 0 && (
                    <span className="px-2 py-1 bg-pink-500 bg-opacity-20 text-pink-400 text-xs rounded-full">
                      {myFavoriteResources.length}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => window.location.href = '/resources'}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All Resources</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              
              {myFavoriteResources.length > 0 ? (
                <div className="space-y-4">
                  {myFavoriteResources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={resource.thumbnail} 
                          alt={resource.title}
                          className="w-16 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {resource.title}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {resource.course} • {resource.type === 'video' ? resource.duration : resource.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getResourceIcon(resource.type)}
                        <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                          {resource.type === 'video' ? (
                            <Play className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                          )}
                        </button>
                        <Heart className="h-4 w-4 text-pink-400 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-gray-400 font-medium mb-2">No Favorite Resources Yet</h4>
                  <p className="text-gray-500 text-sm mb-4">Start exploring resources and add them to your favorites</p>
                  <button
                    onClick={() => window.location.href = '/resources'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <span>Browse Resources</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Favorite Courses */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-400 fill-current" />
                  <span>Favorite Courses</span>
                  {myFavoriteCourses.length > 0 && (
                    <span className="px-2 py-1 bg-pink-500 bg-opacity-20 text-pink-400 text-xs rounded-full">
                      {myFavoriteCourses.length}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => window.location.href = '/courses'}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All Courses</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              
              {myFavoriteCourses.length > 0 ? (
                <div className="space-y-4">
                  {myFavoriteCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={course.thumbnail} 
                          alt={course.name}
                          className="w-16 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {course.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {course.code} • {course.instructor}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                        </button>
                        <Heart className="h-4 w-4 text-pink-400 fill-current" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-gray-400 font-medium mb-2">No Favorite Courses Yet</h4>
                  <p className="text-gray-500 text-sm mb-4">Explore courses and mark your favorites for quick access</p>
                  <button
                    onClick={() => window.location.href = '/courses'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <span>Browse Courses</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {activity.action.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        <span className="text-blue-400">{activity.action}</span> {activity.item}
                      </p>
                      <p className="text-gray-400 text-sm">{activity.course}</p>
                      <p className="text-gray-500 text-xs">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.score && (
                      <span className="text-green-400 font-medium">{activity.score}</span>
                    )}
                    {activity.size && (
                      <span className="text-gray-400 text-sm">{activity.size}</span>
                    )}
                    {activity.replies && (
                      <span className="text-blue-400 text-sm">{activity.replies}</span>
                    )}
                    {activity.status && (
                      <span className="text-green-400 text-sm">{activity.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {achievements.map((achievement, index) => (
              <div key={achievement.name} className="bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <h4 className="text-white font-semibold text-lg mb-2">{achievement.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                <p className="text-gray-500 text-xs">{achievement.date}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;