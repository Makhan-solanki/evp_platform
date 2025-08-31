import React from 'react';
import { motion } from 'framer-motion';
import { OrganizationNavigation } from '@/components/layout/OrganizationNavigation';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const Analytics: React.FC = () => {
  const stats = [
    {
      name: 'Total Students',
      value: '248',
      change: '+12 this month',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-blue-600',
    },
    {
      name: 'Verified Experiences',
      value: '156',
      change: '+23 this week',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'bg-green-600',
    },
    {
      name: 'Pending Reviews',
      value: '18',
      change: '5 urgent',
      changeType: 'neutral',
      icon: ClockIcon,
      color: 'bg-yellow-600',
    },
    {
      name: 'Response Rate',
      value: '94%',
      change: '+2% this month',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'verification',
      student: 'Sarah Johnson',
      action: 'Experience verified',
      experience: 'Frontend Developer Intern',
      time: '2 hours ago',
      status: 'approved',
    },
    {
      id: 2,
      type: 'application',
      student: 'Michael Chen',
      action: 'New application submitted',
      experience: 'Backend Developer Position',
      time: '4 hours ago',
      status: 'pending',
    },
    {
      id: 3,
      type: 'verification',
      student: 'Emma Davis',
      action: 'Experience rejected',
      experience: 'Marketing Assistant',
      time: '1 day ago',
      status: 'rejected',
    },
    {
      id: 4,
      type: 'application',
      student: 'James Wilson',
      action: 'Profile updated',
      experience: 'Software Engineering Intern',
      time: '2 days ago',
      status: 'updated',
    },
  ];

  const monthlyData = [
    { month: 'Jan', applications: 45, verifications: 38 },
    { month: 'Feb', applications: 52, verifications: 44 },
    { month: 'Mar', applications: 48, verifications: 42 },
    { month: 'Apr', applications: 61, verifications: 55 },
    { month: 'May', applications: 55, verifications: 48 },
    { month: 'Jun', applications: 67, verifications: 58 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      case 'updated':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-400';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <OrganizationNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor your organization's student engagement and verification metrics.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-sm ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            className="bg-slate-800 rounded-lg border border-slate-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{activity.student}</p>
                    <p className="text-gray-400 text-sm">{activity.action}</p>
                    <p className="text-gray-500 text-xs">{activity.experience}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="text-gray-500 text-xs">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Overview */}
          <motion.div
            className="bg-slate-800 rounded-lg border border-slate-700 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-6">Monthly Overview</h2>
            
            <div className="space-y-4">
              {monthlyData.map((data, _index) => (
                <div key={data.month} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-white font-medium">{data.month}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-blue-400 font-medium">{data.applications}</p>
                      <p className="text-gray-500 text-xs">Applications</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-medium">{data.verifications}</p>
                      <p className="text-gray-500 text-xs">Verified</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left transition-colors">
            <ChartBarIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold mb-2">Export Analytics</h3>
            <p className="text-blue-100 text-sm">Download detailed reports</p>
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left transition-colors">
            <UsersIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold mb-2">Manage Students</h3>
            <p className="text-green-100 text-sm">View and organize students</p>
          </button>
          
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-left transition-colors">
            <CheckCircleIcon className="h-8 w-8 mb-3" />
            <h3 className="font-semibold mb-2">Review Queue</h3>
            <p className="text-purple-100 text-sm">Process pending requests</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
