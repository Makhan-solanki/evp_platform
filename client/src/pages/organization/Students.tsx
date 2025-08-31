import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EllipsisVerticalIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  StarIcon,
  GlobeAltIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { OrganizationNavigation } from '@/components/layout/OrganizationNavigation';
import { Button } from '@/components/ui/Button';

const Students: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const students = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      course: 'Computer Science',
      year: 'Senior',
      status: 'active',
      joinDate: 'Fall 2023',
      experienceCount: 3,
      verified: 2,
      pending: 1,
      avatar: 'SJ',
      avatarColor: 'bg-blue-600',
      about: 'Passionate computer science student with a focus on web development and user experience design. Always eager to learn new technologies and contribute to meaningful projects.',
      skills: ['React', 'JavaScript', 'Python', 'Node.js', 'UI/UX Design'],
      experienceList: [
        {
          id: 1,
          company: 'Tech Solutions Inc.',
          position: 'Frontend Developer Intern',
          period: 'Summer 2023',
          description: 'Developed and maintained web applications using React and Node.js. Collaborated with a team of engineers to implement new features.',
          verified: true,
        },
        {
          id: 2,
          company: 'University Research Lab',
          position: 'Research Assistant',
          period: '2022 - 2023',
          description: 'Conducted research on machine learning algorithms and their applications in natural language processing.',
          verified: true,
        },
        {
          id: 3,
          company: 'Startup Project',
          position: 'UI/UX Designer',
          period: 'Spring 2024',
          description: 'Designing user interfaces for a new mobile application focused on student productivity.',
          verified: false,
        },
      ],
      socialLinks: [
        { platform: 'GitHub', url: 'github.com/sarah-johnson' },
        { platform: 'LinkedIn', url: 'linkedin.com/in/sarah-johnson' },
      ],
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@university.edu',
      course: 'Software Engineering',
      year: 'Junior',
      status: 'pending',
      joinDate: 'Spring 2024',
      experienceCount: 1,
      verified: 0,
      pending: 1,
      avatar: 'MC',
      avatarColor: 'bg-green-600',
      about: 'Software engineering student passionate about backend development and system architecture. Currently working on distributed systems and cloud computing.',
      skills: ['Java', 'Spring Boot', 'Docker', 'AWS', 'Microservices'],
      experienceList: [
        {
          id: 1,
          company: 'CloudTech Solutions',
          position: 'Backend Developer Intern',
          period: 'Summer 2023',
          description: 'Developed REST APIs and microservices using Spring Boot and Docker.',
          verified: false,
        },
      ],
      socialLinks: [
        { platform: 'GitHub', url: 'github.com/michael-chen' },
        { platform: 'LinkedIn', url: 'linkedin.com/in/michael-chen' },
      ],
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@university.edu',
      course: 'Data Science',
      year: 'Senior',
      status: 'active',
      joinDate: 'Fall 2022',
      experienceCount: 4,
      verified: 3,
      pending: 1,
      avatar: 'ER',
      avatarColor: 'bg-purple-600',
      about: 'Data science enthusiast with expertise in machine learning and statistical analysis. Passionate about using data to solve real-world problems.',
      skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Data Visualization'],
      experienceList: [
        {
          id: 1,
          company: 'DataCorp Analytics',
          position: 'Data Science Intern',
          period: 'Summer 2023',
          description: 'Developed predictive models for customer behavior analysis using Python and scikit-learn.',
          verified: true,
        },
        {
          id: 2,
          company: 'University Research Center',
          position: 'Research Assistant',
          period: '2022 - 2023',
          description: 'Conducted research on natural language processing and sentiment analysis.',
          verified: true,
        },
        {
          id: 3,
          company: 'Healthcare Analytics Project',
          position: 'Data Analyst',
          period: 'Spring 2024',
          description: 'Analyzed healthcare data to identify patterns and improve patient outcomes.',
          verified: true,
        },
        {
          id: 4,
          company: 'Startup Analytics',
          position: 'ML Engineer',
          period: 'Current',
          description: 'Building machine learning models for a fintech startup.',
          verified: false,
        },
      ],
      socialLinks: [
        { platform: 'GitHub', url: 'github.com/emma-rodriguez' },
        { platform: 'LinkedIn', url: 'linkedin.com/in/emma-rodriguez' },
      ],
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@university.edu',
      course: 'Business Administration',
      year: 'Junior',
      status: 'inactive',
      joinDate: 'Spring 2023',
      experienceCount: 2,
      verified: 1,
      pending: 1,
      avatar: 'DK',
      avatarColor: 'bg-red-600',
      about: 'Business student with a focus on entrepreneurship and digital marketing. Currently working on launching a startup.',
      skills: ['Marketing', 'Business Strategy', 'Digital Marketing', 'Analytics', 'Leadership'],
      experienceList: [
        {
          id: 1,
          company: 'Marketing Agency',
          position: 'Marketing Intern',
          period: 'Summer 2023',
          description: 'Managed social media campaigns and analyzed marketing performance metrics.',
          verified: true,
        },
        {
          id: 2,
          company: 'Student Startup',
          position: 'Founder',
          period: 'Current',
          description: 'Launching a digital platform for student services.',
          verified: false,
        },
      ],
      socialLinks: [
        { platform: 'LinkedIn', url: 'linkedin.com/in/david-kim' },
      ],
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'inactive':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-3 w-3" />;
      case 'pending':
        return <ClockIcon className="h-3 w-3" />;
      case 'inactive':
        return <XCircleIcon className="h-3 w-3" />;
      default:
        return <UserIcon className="h-3 w-3" />;
    }
  };

  const handleViewProfile = (student: any) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleViewPortfolio = (student: any) => {
    setSelectedStudent(student);
    setShowPortfolioModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <OrganizationNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Students</h1>
          <p className="text-gray-400">Manage and view student profiles and experiences</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, email, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Add Student Button */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Student
            </Button>
          </div>
        </motion.div>

        {/* Students Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {/* Student Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 ${student.avatarColor} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold">{student.avatar}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{student.name}</h3>
                  <p className="text-gray-400 text-sm">{student.course} • {student.year}</p>
                  <p className="text-gray-500 text-sm">{student.email}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                  {getStatusIcon(student.status)}
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </span>
              </div>

              {/* Experience Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-700 rounded-lg p-2">
                  <p className="text-lg font-bold text-white">{student.experienceCount}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-400">{student.verified}</p>
                  <p className="text-xs text-gray-400">Verified</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-400">{student.pending}</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => handleViewProfile(student)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => handleViewPortfolio(student)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  View Portfolio
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <UserIcon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-gray-400 font-medium mb-2">No students found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery ? 'Try adjusting your search or filter.' : 'Invite students to get started.'}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              <PlusIcon className="h-5 w-5 mr-2" />
              Invite Student
            </Button>
          </motion.div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Student Profile</h2>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${selectedStudent.avatarColor} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{selectedStudent.avatar}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{selectedStudent.name}</h3>
                  <p className="text-gray-400">{selectedStudent.email}</p>
                  <p className="text-gray-400 text-sm">{selectedStudent.course} • {selectedStudent.year}</p>
                </div>
              </div>

              {/* About */}
              <div>
                <h4 className="text-white font-semibold mb-2">About</h4>
                <p className="text-gray-300 text-sm">{selectedStudent.about}</p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-white font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-slate-700 text-blue-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">{selectedStudent.experienceCount}</p>
                  <p className="text-sm text-gray-400">Total Experiences</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{selectedStudent.verified}</p>
                  <p className="text-sm text-gray-400">Verified</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">{selectedStudent.pending}</p>
                  <p className="text-sm text-gray-400">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{selectedStudent.name}'s Portfolio</h2>
              <button 
                onClick={() => setShowPortfolioModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <div className={`w-20 h-20 ${selectedStudent.avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white font-bold text-xl">{selectedStudent.avatar}</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">{selectedStudent.name}</h3>
                <p className="text-gray-400">{selectedStudent.course} • {selectedStudent.year}</p>
                <p className="text-gray-500 text-sm mt-2">{selectedStudent.about}</p>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <StarIcon className="h-5 w-5" />
                  Skills & Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-2 bg-slate-700 text-blue-300 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experiences */}
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  Professional Experience
                </h4>
                <div className="space-y-4">
                  {selectedStudent.experienceList.map((exp: any) => (
                    <div key={exp.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="text-white font-semibold">{exp.position}</h5>
                          <p className="text-blue-400 text-sm">{exp.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">{exp.period}</p>
                          {exp.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                              <CheckCircleIcon className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5" />
                  Social Links
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.socialLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={`https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-700 text-blue-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
