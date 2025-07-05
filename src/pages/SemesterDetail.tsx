import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Clock, 
  FileText, 
  Video, 
  Calendar,
  Heart,
  ChevronRight,
  Download,
  Eye,
  Play,
  ExternalLink,
  Share2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SemesterDetail: React.FC = () => {
  const { semesterNumber } = useParams<{ semesterNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([1, 2]);
  const [completedAssignments, setCompletedAssignments] = useState<number[]>([]);

  const semester = parseInt(semesterNumber || '6');

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCourses');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const semesterData = {
    1: {
      name: "Foundation Semester",
      courses: [
        {
          id: 11,
          code: 'NA10001',
          name: 'Introduction to Naval Architecture',
          credits: 4,
          type: 'CORE I',
          ltp: '3-1-0',
          instructor: 'Prof. A.K. Singh',
          enrolledStudents: 60,
          resources: 8,
          videos: 6,
          assignments: 2,
          progress: 100,
          nextClass: 'Completed',
          description: 'Foundational concepts of naval architecture and maritime engineering.',
          thumbnail: 'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
          classSchedule: []
        },
        {
          id: 12,
          code: 'NA10002',
          name: 'Fundamentals of Ship Design',
          credits: 4,
          type: 'CORE II',
          ltp: '3-1-0',
          instructor: 'Dr. P.K. Rao',
          enrolledStudents: 58,
          resources: 12,
          videos: 8,
          assignments: 3,
          progress: 100,
          nextClass: 'Completed',
          description: 'Basic principles and techniques of ship design and marine engineering.',
          thumbnail: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
          classSchedule: []
        }
      ]
    },
    6: {
      name: "Advanced Studies",
      courses: [
        {
          id: 1,
          code: 'NA31007',
          name: 'Vibration of Floating Structures',
          credits: 4,
          type: 'Depth CORE XLI',
          ltp: '3-1-0',
          instructor: 'Prof. R.K. Sharma',
          enrolledStudents: 45,
          resources: 12,
          videos: 8,
          assignments: 3,
          progress: 75,
          nextClass: 'Tomorrow 10:00 AM',
          description: 'Study of vibration characteristics of floating structures, wave-induced motions, and dynamic response analysis.',
          thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
          classSchedule: [
            { day: 'Monday', time: '10:00 AM - 11:00 AM', room: 'NA-201' },
            { day: 'Wednesday', time: '10:00 AM - 11:00 AM', room: 'NA-201' },
            { day: 'Friday', time: '10:00 AM - 11:00 AM', room: 'NA-201' }
          ]
        },
        {
          id: 2,
          code: 'NA31002',
          name: 'Marine Design',
          credits: 4,
          type: 'Depth CORE XLII',
          ltp: '3-1-0',
          instructor: 'Dr. A.K. Thakur',
          enrolledStudents: 42,
          resources: 15,
          videos: 6,
          assignments: 4,
          progress: 60,
          nextClass: 'Today 2:00 PM',
          description: 'Comprehensive marine design principles, ship design methodology, and optimization techniques.',
          thumbnail: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
          classSchedule: [
            { day: 'Tuesday', time: '2:00 PM - 3:00 PM', room: 'NA-301' },
            { day: 'Thursday', time: '2:00 PM - 3:00 PM', room: 'NA-301' }
          ]
        },
        {
          id: 3,
          code: 'NA30204',
          name: 'Seakeeping',
          credits: 3,
          type: 'Depth CORE XLIII',
          ltp: '3-0-0',
          instructor: 'Prof. S.K. Bhattacharya',
          enrolledStudents: 48,
          resources: 10,
          videos: 12,
          assignments: 2,
          progress: 45,
          nextClass: 'Wed 11:00 AM',
          description: 'Analysis of ship behavior in waves, seakeeping qualities, and motion prediction methods.',
          thumbnail: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
          classSchedule: [
            { day: 'Wednesday', time: '11:00 AM - 12:00 PM', room: 'NA-101' }
          ]
        }
      ]
    }
  };

  const currentSemesterData = semesterData[semester as keyof typeof semesterData] || {
    name: `Semester ${semester}`,
    courses: []
  };

  const upcomingDeadlines = [
    { 
      id: 1,
      course: 'NA31002', 
      assignment: 'Marine Design Project Phase 2', 
      dueDate: '3 days', 
      priority: 'high',
      onClick: () => handleAssignmentClick(1)
    },
    { 
      id: 2,
      course: 'NA31007', 
      assignment: 'Vibration Analysis Report', 
      dueDate: '1 week', 
      priority: 'medium',
      onClick: () => handleAssignmentClick(2)
    },
    { 
      id: 3,
      course: 'NA30204', 
      assignment: 'Seakeeping Calculations', 
      dueDate: '2 weeks', 
      priority: 'low',
      onClick: () => handleAssignmentClick(3)
    }
  ];

  const handleToggleFavorite = (courseId: number) => {
    const updatedFavorites = favorites.includes(courseId) 
      ? favorites.filter(id => id !== courseId)
      : [...favorites, courseId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteCourses', JSON.stringify(updatedFavorites));
    
    const course = currentSemesterData.courses.find(c => c.id === courseId);
    const action = favorites.includes(courseId) ? 'removed from' : 'added to';
    console.log(`"${course?.name}" ${action} favorites`);
  };

  const handleViewResources = (courseCode: string) => {
    navigate('/resources', { state: { filterByCourse: courseCode } });
  };

  const handleJoinClass = (course: any) => {
    console.log(`Joining class for ${course.code}`);
    alert(`Joining ${course.name} class with ${course.instructor}`);
  };

  const handleAssignmentClick = (assignmentId: number) => {
    setCompletedAssignments(prev => 
      prev.includes(assignmentId) 
        ? prev 
        : [...prev, assignmentId]
    );
    console.log(`Opening assignment ${assignmentId}`);
  };

  const handleShareCourse = (course: any) => {
    if (navigator.share) {
      navigator.share({
        title: course.name,
        text: `Check out this course: ${course.name} (${course.code})`,
        url: window.location.href + `?course=${course.code}`
      });
    } else {
      const shareUrl = window.location.href + `?course=${course.code}`;
      navigator.clipboard.writeText(shareUrl);
      console.log('Course link copied to clipboard');
    }
  };

  const semesterStats = {
    totalCourses: currentSemesterData.courses.length,
    totalCredits: currentSemesterData.courses.reduce((sum, course) => sum + course.credits, 0),
    avgProgress: currentSemesterData.courses.length > 0
      ? Math.round(currentSemesterData.courses.reduce((sum, course) => sum + course.progress, 0) / currentSemesterData.courses.length)
      : 0,
    totalResources: currentSemesterData.courses.reduce((sum, course) => sum + course.resources, 0)
  };

  if (!currentSemesterData.courses.length) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/courses')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Semester {semester}</h1>
            <p className="text-gray-400 mt-1">No courses available for this semester</p>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Courses Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            There are no courses available for Semester {semester} at the moment.
          </p>
          <button 
            onClick={() => navigate('/courses')} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/courses')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Semester {semester}</h1>
            <p className="text-gray-400 mt-1">{currentSemesterData.name} • Ocean and Naval Architecture</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/resources')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>All Resources</span>
          </button>
        </div>
      </div>

      {/* Semester Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{semesterStats.totalCourses}</span>
            </div>
            <p className="text-blue-100 text-sm">Total Courses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{semesterStats.totalCredits}</span>
            </div>
            <p className="text-blue-100 text-sm">Total Credits</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{semesterStats.avgProgress}%</span>
            </div>
            <p className="text-blue-100 text-sm">Avg Progress</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{semesterStats.totalResources}</span>
            </div>
            <p className="text-blue-100 text-sm">Resources</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Courses List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Course List
            </h2>
            <span className="text-gray-400 text-sm">
              {currentSemesterData.courses.length} courses
            </span>
          </div>

          {currentSemesterData.courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all cursor-pointer group"
            >
              <div className="flex">
                {/* Course Image */}
                <div className="w-48 h-32 flex-shrink-0 relative">
                  <img 
                    src={course.thumbnail} 
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(course.id);
                      }}
                      className={`p-2 rounded-full transition-all ${
                        favorites.includes(course.id)
                          ? 'bg-pink-400 bg-opacity-20 text-pink-400'
                          : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                      }`}
                      title={favorites.includes(course.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(course.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Course Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-blue-400 font-medium text-sm">{course.code}</span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">{course.credits} credits</span>
                      </div>
                      <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{course.type} • {course.ltp}</p>
                      <p className="text-gray-400 text-sm">{course.instructor}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolledStudents}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{course.resources}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Video className="h-4 w-4" />
                        <span>{course.videos}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Next: {course.nextClass}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewResources(course.code);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Resources</span>
                    </button>
                    
                    {course.nextClass !== 'Completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinClass(course);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Join Class</span>
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareCourse(course);
                      }}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <Share2 className="h-3 w-3" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-400 text-sm w-12">{course.progress}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-orange-400" />
              <h3 className="text-white font-semibold">Upcoming Deadlines</h3>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <motion.div 
                  key={deadline.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={deadline.onClick}
                  className="p-3 bg-gray-750 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">
                        {deadline.assignment}
                      </p>
                      <p className="text-gray-400 text-xs">{deadline.course}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {completedAssignments.includes(deadline.id) && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        deadline.priority === 'high' 
                          ? 'bg-red-500 bg-opacity-20 text-red-400'
                          : deadline.priority === 'medium'
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                          : 'bg-green-500 bg-opacity-20 text-green-400'
                      }`}>
                        {deadline.dueDate}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/resources')}
              className="w-full mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View All Assignments
            </button>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white text-sm">Completed lecture on wave theory</p>
                  <p className="text-gray-400 text-xs">NA31001 • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white text-sm">Submitted design assignment</p>
                  <p className="text-gray-400 text-xs">NA31002 • 1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white text-sm">Downloaded course materials</p>
                  <p className="text-gray-400 text-xs">NA31007 • 2 days ago</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile')}
              className="w-full mt-4 px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              View Full Activity
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SemesterDetail;