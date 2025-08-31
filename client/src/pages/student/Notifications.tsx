import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Verification', 'Messages'];

  const notifications = [
    {
      id: 1,
      type: 'verification',
      icon: CheckCircleIcon,
      iconColor: 'text-green-500',
      title: 'Verification Approved',
      message: 'Your verification request for the internship at Tech Innovators Inc. has been approved.',
      time: '2d',
      isRead: false,
    },
    {
      id: 2,
      type: 'message',
      icon: EnvelopeIcon,
      iconColor: 'text-blue-500',
      title: 'New Message',
      message: 'You have a new message from the Career Services team regarding upcoming workshops.',
      time: '3d',
      isRead: false,
    },
    {
      id: 3,
      type: 'verification',
      icon: XCircleIcon,
      iconColor: 'text-red-500',
      title: 'Verification Rejected',
      message: 'Your verification request for the volunteer work at Community Helpers has been rejected.',
      time: '4d',
      isRead: true,
    },
    {
      id: 4,
      type: 'message',
      icon: EnvelopeIcon,
      iconColor: 'text-blue-500',
      title: 'New Message',
      message: 'You have a new message from the Student Council regarding the upcoming elections.',
      time: '5d',
      isRead: true,
    },
    {
      id: 5,
      type: 'verification',
      icon: CheckCircleIcon,
      iconColor: 'text-green-500',
      title: 'Verification Approved',
      message: 'Your verification request for the part-time job at Retail Emporium has been approved.',
      time: '6d',
      isRead: true,
    },
    {
      id: 6,
      type: 'message',
      icon: EnvelopeIcon,
      iconColor: 'text-blue-500',
      title: 'New Message',
      message: 'You have a new message from the Alumni Network regarding mentorship opportunities.',
      time: '7d',
      isRead: true,
    },
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Verification') return notification.type === 'verification';
    if (activeTab === 'Messages') return notification.type === 'message';
    return true;
  });

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
            Notifications
          </h1>
          <p className="text-gray-400">
            Stay updated with the latest from CampusConnect.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="border-b border-slate-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                notification.isRead ? 'bg-slate-800/50' : 'bg-slate-800'
              } hover:bg-slate-700`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center`}>
                <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-medium ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-gray-500 text-sm flex-shrink-0 ml-2">
                    {notification.time}
                  </span>
                </div>
                <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-300'}`}>
                  {notification.message}
                </p>
              </div>
              
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {filteredNotifications.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-gray-400 font-medium mb-2">No notifications</h3>
            <p className="text-gray-500 text-sm">
              You're all caught up! Check back later for new updates.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
