import React from 'react';
import { motion } from 'framer-motion';


const ExperienceVerification: React.FC = () => {
  const experiences = [
    {
      id: 1,
      experience: 'Software Engineering Internship',
      organization: 'Tech Innovators Inc.',
      status: 'Pending',
      comments: 'Awaiting approval from supervisor.',
      statusColor: 'bg-yellow-500',
    },
    {
      id: 2,
      experience: 'Marketing Assistant',
      organization: 'Global Marketing Solutions',
      status: 'Approved',
      comments: 'Verified by Olivia Carter.',
      statusColor: 'bg-green-500',
    },
    {
      id: 3,
      experience: 'Volunteer Coordinator',
      organization: 'Community Outreach Center',
      status: 'Rejected',
      comments: 'Please provide additional details about your role.',
      statusColor: 'bg-red-500',
    },
    {
      id: 4,
      experience: 'Research Assistant',
      organization: 'University Research Lab',
      status: 'Pending',
      comments: 'Under review by Dr. Thompson.',
      statusColor: 'bg-yellow-500',
    },
    {
      id: 5,
      experience: 'Event Planner',
      organization: 'Eventful Creations LLC',
      status: 'Approved',
      comments: 'Confirmed by Sophia Bennett.',
      statusColor: 'bg-green-500',
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500 text-white';
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'Rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Experience Verification Status
          </h1>
        </motion.div>

        {/* Verification Table */}
        <motion.div
          className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Table Header */}
          <div className="bg-slate-700 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
              <div className="col-span-3">Experience</div>
              <div className="col-span-3">Organization</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-4">Comments</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-700">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className="px-6 py-4 hover:bg-slate-700/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <p className="text-white font-medium">{exp.experience}</p>
                  </div>
                  
                  <div className="col-span-3">
                    <p className="text-gray-300">{exp.organization}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(exp.status)}`}>
                      {exp.status}
                    </span>
                  </div>
                  
                  <div className="col-span-4">
                    <p className="text-gray-400 text-sm">{exp.comments}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          className="mt-6 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">Rejected</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExperienceVerification;
