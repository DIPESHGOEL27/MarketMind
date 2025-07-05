import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<number[]>([1, 2]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCourses');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const semesters = [
    { number: 1, courses: 18, completed: true, credits: 42, cgpa: 8.2 },
    { number: 3, courses: 8, completed: true, credits: 32, cgpa: 8.5 },
    { number: 4, courses: 8, completed: true, credits: 32, cgpa: 8.3 },
    { number: 5, courses: 8, completed: true, credits: 32, cgpa: 8.7 },
    { number: 6, courses: 9, completed: false, credits: 36, cgpa: 8.4 },
    { number: 7, courses: 6, completed: false, credits: 24, cgpa: null },
    { number: 8, courses: 7, completed: false, credits: 28, cgpa: null },
    { number: 9, courses: 4, completed: false, credits: 16, cgpa: null },
    { number: 10, courses: 4, completed: false, credits: 16, cgpa: null }
  ];

  const handleSemesterClick = (semesterNumber: number) => {
    navigate(`/courses/semester/${semesterNumber}`);
  };

  const overallStats = {
    totalCourses: semesters.reduce((sum, sem) => sum + sem.courses, 0),
    completedCourses: semesters.filter(sem => sem.completed).reduce((sum, sem) => sum + sem.courses, 0),
    totalCredits: semesters.reduce((sum, sem) => sum + sem.credits, 0),
    earnedCredits: semesters.filter(sem => sem.completed).reduce((sum, sem) => sum + sem.credits, 0),
    overallCGPA: 8.4,
    currentSemester: 6
  };

  const completionRate = Math.round((overallStats.earnedCredits / overallStats.totalCredits) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-gray-400 mt-1">Ocean and Naval Architecture Program</p>
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

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{overallStats.overallCGPA}</span>
            </div>
            <p className="text-blue-100 text-sm">Overall CGPA</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{completionRate}%</span>
            </div>
            <p className="text-blue-100 text-sm">Program Completion</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{overallStats.completedCourses}</span>
            </div>
            <p className="text-blue-100 text-sm">Courses Completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-blue-200 mr-2" />
              <span className="text-3xl font-bold">{overallStats.earnedCredits}</span>
            </div>
            <p className="text-blue-100 text-sm">Credits Earned</p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm">Overall Progress</span>
            <span className="text-blue-100 text-sm">{overallStats.earnedCredits}/{overallStats.totalCredits} credits</span>
          </div>
          <div className="w-full bg-blue-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-white h-3 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Semester Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Academic Progress</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <span>Upcoming</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map((semester, index) => (
            <motion.div
              key={semester.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => handleSemesterClick(semester.number)}
              className="bg-gray-800 rounded-xl p-6 cursor-pointer transition-all hover:bg-gray-750 hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    semester.completed 
                      ? 'bg-green-500' 
                      : semester.number === overallStats.currentSemester 
                      ? 'bg-blue-500' 
                      : 'bg-gray-600'
                  }`}></div>
                  <h3 className="text-white font-semibold">Semester {semester.number}</h3>
                </div>
                {semester.completed && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Courses</span>
                  <span className="text-white font-medium">{semester.courses}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Credits</span>
                  <span className="text-white font-medium">{semester.credits}</span>
                </div>
                {semester.cgpa && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">CGPA</span>
                    <span className="text-white font-medium">{semester.cgpa}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progress</span>
                  <span className="text-gray-400 text-sm">
                    {semester.completed ? '100%' : semester.number === overallStats.currentSemester ? '65%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      semester.completed 
                        ? 'bg-green-500' 
                        : semester.number === overallStats.currentSemester 
                        ? 'bg-blue-500' 
                        : 'bg-gray-600'
                    }`}
                    style={{ 
                      width: semester.completed 
                        ? '100%' 
                        : semester.number === overallStats.currentSemester 
                        ? '65%' 
                        : '0%' 
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {semester.completed 
                    ? 'Completed' 
                    : semester.number === overallStats.currentSemester 
                    ? 'In Progress' 
                    : 'Upcoming'}
                </span>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <Video className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/resources')}
            className="flex items-center space-x-3 p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <FileText className="h-6 w-6 text-blue-400" />
            <div>
              <h4 className="text-white font-medium">Browse Resources</h4>
              <p className="text-gray-400 text-sm">Access study materials and notes</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/profile?tab=favorites')}
            className="flex items-center space-x-3 p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <Heart className="h-6 w-6 text-pink-400 fill-current" />
            <div>
              <h4 className="text-white font-medium">Favorites</h4>
              <p className="text-gray-400 text-sm">View your saved courses and resources</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/courses/semester/${overallStats.currentSemester}`)}
            className="flex items-center space-x-3 p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <Calendar className="h-6 w-6 text-green-400" />
            <div>
              <h4 className="text-white font-medium">Current Semester</h4>
              <p className="text-gray-400 text-sm">Go to Semester {overallStats.currentSemester}</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Courses;