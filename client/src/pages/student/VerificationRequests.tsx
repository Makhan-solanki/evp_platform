import React from 'react';
import { motion } from 'framer-motion';

const VerificationRequests: React.FC = () => {
  const pendingRequests = [
    {
      id: 1,
      organization: 'Tech Innovators Inc.',
      status: 'Pending',
      date: 'July 15, 2024',
      logo: 'TCH',
      logoColor: 'bg-blue-600',
    },
    {
      id: 2,
      organization: 'Global Solutions Ltd.',
      status: 'Pending',
      date: 'July 10, 2024',
      logo: 'GS',
      logoColor: 'bg-purple-600',
    },
  ];

  const completedRequests = [
    {
      id: 3,
      organization: 'Creative Minds Agency',
      status: 'Approved',
      date: 'June 20, 2024',
      logo: 'CM',
      logoColor: 'bg-orange-500',
    },
    {
      id: 4,
      organization: 'Dynamic Systems Corp.',
      status: 'Rejected - Insufficient information provided.',
      date: 'June 15, 2024',
      logo: 'DS',
      logoColor: 'bg-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Verification Requests
          </h1>
          <p className="text-gray-400">
            Track the status of your verification requests to organizations.
          </p>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Pending Requests</h2>
          
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${request.logoColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-lg">{request.logo}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {request.organization}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Status: {request.status}</span>
                      <span className="text-gray-400">Request sent on {request.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Completed Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Completed Requests</h2>
          
          <div className="space-y-4">
            {completedRequests.map((request) => (
              <div key={request.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 ${request.logoColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-lg">{request.logo}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {request.organization}
                    </h3>
                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className={`font-medium ${
                        request.status.startsWith('Approved') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        Status: {request.status.split(' - ')[0]}
                      </span>
                      <span className="text-gray-400">Request sent on {request.date}</span>
                    </div>
                    {request.status.includes(' - ') && (
                      <p className="text-gray-400 text-sm">
                        {request.status.split(' - ')[1]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerificationRequests;
