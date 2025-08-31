import React from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { OrganizationLayout } from '@/components/layout/OrganizationLayout';
import { Image } from '@/components/ui/Image';

const OrganizationDashboard: React.FC = () => {
  const recentStudents = [
    {
      id: '1',
      name: 'Sophia Clark',
      course: 'Computer Science',
      joinDate: '2023',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '2',
      name: 'Michael Chen',
      course: 'Engineering',
      joinDate: '2023',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      course: 'Business',
      joinDate: '2023',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
  ];

  const verificationQueue = [
    {
      id: '1',
      title: 'Marketing Intern at Tech Innovators Inc.',
      student: 'Sophia Clark',
      type: 'Internship',
      submittedDate: '2 days ago',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '2',
      title: 'Volunteer at Community Outreach Program',
      student: 'Michael Chen',
      type: 'Volunteer',
      submittedDate: '1 week ago',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
  ];

  const quickActions = [
    {
      title: 'Review Verification Requests',
      description: 'Process pending verification requests from students',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      buttonText: 'Review Requests',
    },
    {
      title: 'Manage Students',
      description: 'View and manage student profiles and data',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      buttonText: 'Manage Students',
    },
    {
      title: 'Analytics Dashboard',
      description: 'View detailed analytics and insights',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      buttonText: 'View Analytics',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <OrganizationLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Organization Dashboard</h1>
            <p className="text-gray-400">Manage student verifications and organization data</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Recent Students</h2>
              
              <div className="space-y-6">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">
                        {student.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {student.course} • {student.joinDate}
                      </p>
                    </div>
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                      <Image 
                        src={student.image}
                        alt={student.name}
                        className="w-full h-full object-cover"
                        fallbackIcon="user"
                        fallbackClassName="w-8 h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-6 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Invite New Students
              </button>
            </motion.div>

            {/* Verification Queue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Verification Queue</h2>
              
              <div className="space-y-6">
                {verificationQueue.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-400 text-sm font-medium">Pending Review</span>
                      </div>
                      <h3 className="text-white font-medium mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {item.student} • {item.type} • {item.submittedDate}
                      </p>
                    </div>
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                      <Image 
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        fallbackIcon="photo"
                        fallbackClassName="w-8 h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-6 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Review All Requests
              </button>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="w-full h-32 rounded-lg overflow-hidden mb-4 bg-slate-700 flex items-center justify-center">
                    <Image 
                      src={action.image}
                      alt={action.title}
                      className="w-full h-full object-cover"
                      fallbackIcon="photo"
                      fallbackClassName="w-12 h-12"
                    />
                  </div>
                  <h3 className="text-white font-medium mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {action.description}
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full">
                    {action.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </OrganizationLayout>
    </div>
  );
};

export default OrganizationDashboard;
