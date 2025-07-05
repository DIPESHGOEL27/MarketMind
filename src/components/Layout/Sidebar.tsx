import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  MessageSquare, 
  User, 
  ChevronDown, 
  ChevronRight,
  FileText,
  GraduationCap,
  Menu,
  X,
  Heart,
  BookMarked,
  Clock,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    courses: true,
    semesters: true
  });
  const [activeSemester, setActiveSemester] = useState<number | null>(null);

  // Set active semester based on URL parameters
  useEffect(() => {
    // Check for /courses/semester/X in the URL
    const semesterMatch = location.pathname.match(/\/courses\/semester\/(\d+)/);
    if (semesterMatch && semesterMatch[1]) {
      setActiveSemester(parseInt(semesterMatch[1]));
    }
  }, [location]);

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/resources', icon: FileText, label: 'Resources' },
    { path: '/courses', icon: GraduationCap, label: 'Courses' },
    { path: '/messages', icon: MessageSquare, label: 'SamudraSetu' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const courses = [
    'Ocean Engineering',
    'Naval Architecture',
    'Marine Hydrodynamics',
    'Ship Construction',
    'Marine Structures'
  ];

  const semesters = [
    { number: 1, subjects: 18 },
    { number: 3, subjects: 8 },
    { number: 4, subjects: 8 },
    { number: 5, subjects: 8 },
    { number: 6, subjects: 9 },
    { number: 7, subjects: 6 },
    { number: 8, subjects: 7 },
    { number: 9, subjects: 4 },
    { number: 10, subjects: 4 }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof expandedSections]
    }));
  };

  const handleSemesterClick = (semesterNumber: number) => {
    if (activeSemester !== semesterNumber) {
      setActiveSemester(semesterNumber);
      navigate(`/courses/semester/${semesterNumber}`);
    }
  };

  const handleCourseClick = (course: string) => {
    navigate(`/resources?course=${encodeURIComponent(course)}`);
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-gray-800 border-r border-gray-700 flex flex-col min-h-screen"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <BookOpen className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-blue-400">VidyaSagar</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {!isCollapsed && (
            <>
              {/* Semesters Section */}
              <div className="pt-6">
                <button
                  onClick={() => toggleSection('semesters')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <span>Semesters</span>
                  {expandedSections.semesters ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.semesters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 space-y-1 overflow-hidden"
                    >
                      {semesters.map((semester) => (
                        <div
                          key={semester.number}
                          onClick={() => handleSemesterClick(semester.number)}
                          className={`flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer rounded ${
                            activeSemester === semester.number
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                        >
                          <span>Semester {semester.number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            activeSemester === semester.number
                              ? 'bg-blue-700 text-blue-100'
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {semester.subjects}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Access Courses */}
              <div className="pt-4">
                <button
                  onClick={() => toggleSection('courses')}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <span>Quick Access</span>
                  {expandedSections.courses ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.courses && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 space-y-1 overflow-hidden"
                    >
                      {courses.slice(0, 5).map((course) => (
                        <div
                          key={course}
                          onClick={() => handleCourseClick(course)}
                          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white cursor-pointer hover:bg-gray-700 rounded truncate"
                        >
                          {course}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shortcuts Section */}
              <div className="mt-6 p-4 bg-gray-750 rounded-lg">
                <h3 className="text-gray-300 text-sm font-medium mb-3">Shortcuts</h3>
                <div className="space-y-3">
                  <Link to="/profile?tab=favorites" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <span>Favorites</span>
                  </Link>
                  <Link to="/resources?filter=notes" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <BookMarked className="h-4 w-4 text-green-400" />
                    <span>Study Notes</span>
                  </Link>
                  <Link to="/courses?view=upcoming" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span>Upcoming Classes</span>
                  </Link>
                  <Link to="/resources?sort=recent" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span>Recent Resources</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </nav>
      </motion.div>
    </>
  );
};

export default Sidebar;