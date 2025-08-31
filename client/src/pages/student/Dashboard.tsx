import React from 'react';
import { Link } from 'react-router-dom';
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
import { StudentLayout } from '@/components/layout/StudentLayout';

import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils';

const StudentDashboard: React.FC = () => {
  const { student } = useAuth();

  const recentExperiences = [
    {
      id: '1',
      title: 'Marketing Intern at Tech Innovators Inc.',
      date: 'Summer 2023',
      status: 'verified',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
      id: '2',
      title: 'Volunteer at Community Outreach Program',
      date: 'Fall 2022',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
  ];

  const quickActions = [
    {
      title: 'View/Edit Portfolio',
      description: 'Showcase your skills and experiences',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      buttonText: 'Go to Portfolio',
    },
    {
      title: 'Verification Requests',
      description: 'Manage pending requests',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      buttonText: 'Manage Requests',
    },
    {
      title: 'Suggested Skills',
      description: 'Based on your experiences',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      buttonText: 'View Skills',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center mr-6 overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80" 
              alt={student?.fullName || 'Student Profile'}
              className="w-full h-full rounded-full object-cover"
              fallbackIcon="user"
              fallbackClassName="w-10 h-10 text-white"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {student?.fullName || 'Sophia Clark'}
            </h1>
            <p className="text-gray-400">
              Student at Stanford University
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Experiences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">Recent Experiences</h2>
            
            <div className="space-y-6">
              {recentExperiences.map((experience) => (
                <div key={experience.id} className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {experience.status === 'verified' && (
                        <span className="text-green-400 text-sm font-medium">Verified</span>
                      )}
                      {experience.status === 'pending' && (
                        <span className="text-yellow-400 text-sm font-medium">Pending Verification</span>
                      )}
                    </div>
                    <h3 className="text-white font-medium mb-1">
                      {experience.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {experience.date}
                    </p>
                  </div>
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                    <Image 
                      src={experience.image}
                      alt={experience.title}
                      className="w-full h-full object-cover"
                      fallbackIcon="photo"
                      fallbackClassName="w-8 h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-6 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Add New Experience
            </button>
          </motion.div>

          {/* Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">Quick Access</h2>
            
            <div className="space-y-6">
              {quickActions.map((action, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {action.description}
                    </p>
                    <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {action.buttonText}
                    </button>
                  </div>
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                    <Image 
                      src={action.image}
                      alt={action.title}
                      className="w-full h-full object-cover"
                      fallbackIcon="photo"
                      fallbackClassName="w-8 h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
