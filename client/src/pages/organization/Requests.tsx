import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { OrganizationNavigation } from '@/components/layout/OrganizationNavigation';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const Requests: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMoreInfoModal, setShowMoreInfoModal] = useState(false);
  const [moreInfoMessage, setMoreInfoMessage] = useState('');
  const [loading, setLoading] = useState<number | null>(null);

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,
      student: 'Sarah Johnson',
      studentEmail: 'sarah.johnson@university.edu',
      experience: 'Frontend Developer Internship',
      type: 'Internship',
      submittedDate: 'February 15, 2024',
      description: 'Worked on React components and user interface development for the main company website.',
      duration: 'June 2023 - August 2023',
      skills: ['React', 'JavaScript', 'CSS', 'HTML'],
      documents: ['completion_certificate.pdf', 'project_screenshots.png'],
      priority: 'high',
      avatar: 'SJ',
      avatarColor: 'bg-blue-600',
      status: 'pending',
    },
    {
      id: 2,
      student: 'Michael Chen',
      studentEmail: 'michael.chen@university.edu',
      experience: 'Backend Development Project',
      type: 'Project',
      submittedDate: 'February 10, 2024',
      description: 'Developed REST APIs and database management system for internal company tools.',
      duration: 'January 2024 - February 2024',
      skills: ['Node.js', 'Express', 'MongoDB', 'API Design'],
      documents: ['project_report.pdf'],
      priority: 'medium',
      avatar: 'MC',
      avatarColor: 'bg-green-600',
      status: 'pending',
    },
    {
      id: 3,
      student: 'Emma Davis',
      studentEmail: 'emma.davis@university.edu',
      experience: 'Data Analysis Consultation',
      type: 'Consultation',
      submittedDate: 'February 8, 2024',
      description: 'Provided data analysis and visualization services for marketing campaign optimization.',
      duration: 'December 2023 - January 2024',
      skills: ['Python', 'Pandas', 'Matplotlib', 'Data Visualization'],
      documents: ['analysis_report.pdf', 'visualizations.png'],
      priority: 'low',
      avatar: 'ED',
      avatarColor: 'bg-purple-600',
      status: 'pending',
    },
  ]);

  const [reviewedRequests, setReviewedRequests] = useState([
    {
      id: 4,
      student: 'James Wilson',
      studentEmail: 'james.wilson@university.edu',
      experience: 'Mobile App Development',
      type: 'Project',
      submittedDate: 'January 25, 2024',
      reviewedDate: 'February 5, 2024',
      status: 'approved',
      description: 'Developed cross-platform mobile application using React Native.',
      duration: 'October 2023 - December 2023',
      skills: ['React Native', 'JavaScript', 'Mobile Development'],
      reviewerNotes: 'Excellent work on the mobile application. All requirements met.',
      avatar: 'JW',
      avatarColor: 'bg-orange-600',
    },
    {
      id: 5,
      student: 'Olivia Bennett',
      studentEmail: 'olivia.bennett@university.edu',
      experience: 'UI/UX Design Internship',
      type: 'Internship',
      submittedDate: 'January 20, 2024',
      reviewedDate: 'February 1, 2024',
      status: 'rejected',
      description: 'Worked on user interface design and user experience improvements.',
      duration: 'Summer 2023',
      skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
      reviewerNotes: 'Please provide more detailed documentation of your design process and user research.',
      avatar: 'OB',
      avatarColor: 'bg-pink-600',
    },
  ]);

  const tabs = [
    { id: 'pending', name: 'Pending Review', count: pendingRequests.length },
    { id: 'reviewed', name: 'Reviewed', count: reviewedRequests.length },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleApprove = async (requestId: number) => {
    setLoading(requestId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the request status
      setPendingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'approved', reviewedDate: new Date().toLocaleDateString() }
            : req
        )
      );
      
      // Move to reviewed requests
      const approvedRequest = pendingRequests.find(req => req.id === requestId);
      if (approvedRequest) {
        setReviewedRequests(prev => [...prev, { ...approvedRequest, status: 'approved', reviewedDate: new Date().toLocaleDateString() }]);
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      }
      
      toast.success('Request approved successfully!');
    } catch (error) {
      toast.error('Failed to approve request');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setLoading(requestId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the request status
      setPendingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected', reviewedDate: new Date().toLocaleDateString() }
            : req
        )
      );
      
      // Move to reviewed requests
      const rejectedRequest = pendingRequests.find(req => req.id === requestId);
      if (rejectedRequest) {
        setReviewedRequests(prev => [...prev, { ...rejectedRequest, status: 'rejected', reviewedDate: new Date().toLocaleDateString() }]);
        setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      }
      
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    } finally {
      setLoading(null);
    }
  };

  const handleRequestMoreInfo = async (requestId: number) => {
    if (!moreInfoMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setLoading(requestId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('More information requested successfully!');
      setMoreInfoMessage('');
      setShowMoreInfoModal(false);
    } catch (error) {
      toast.error('Failed to request more information');
    } finally {
      setLoading(null);
    }
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const activeRequests = activeTab === 'pending' ? pendingRequests : reviewedRequests;

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
            Verification Requests
          </h1>
          <p className="text-gray-400">
            Review and process student experience verification requests.
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
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.name}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Requests List */}
        <div className="space-y-6">
          {activeRequests.map((request, index) => (
            <motion.div
              key={request.id}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="p-6">
                {/* Request Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${request.avatarColor} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold">{request.avatar}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{request.experience}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <UserIcon className="h-4 w-4" />
                        <span>{request.student}</span>
                        <span>•</span>
                        <span>{request.studentEmail}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {activeTab === 'pending' && request.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                    )}
                    {activeTab === 'reviewed' && (
                      <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Description</h4>
                      <p className="text-gray-300 text-sm">{request.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Duration: {request.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <DocumentTextIcon className="h-4 w-4" />
                        <span>Type: {request.type}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {request.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-slate-700 text-blue-300 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <ClockIcon className="h-4 w-4" />
                          <span>Submitted: {request.submittedDate}</span>
                        </div>
                        {request.reviewedDate && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Reviewed: {request.reviewedDate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.documents && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Documents</h4>
                        <div className="space-y-1">
                          {request.documents.map((doc, docIndex) => (
                            <div key={docIndex} className="flex items-center gap-2 text-sm">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">{doc}</span>
                              <EyeIcon className="h-4 w-4 text-gray-400 cursor-pointer" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {request.reviewerNotes && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Reviewer Notes</h4>
                        <p className="text-gray-300 text-sm bg-slate-700 p-3 rounded">{request.reviewerNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {activeTab === 'pending' && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      disabled={loading === request.id}
                    >
                      {loading === request.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      disabled={loading === request.id}
                    >
                      {loading === request.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <XCircleIcon className="h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button 
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowMoreInfoModal(true);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      disabled={loading === request.id}
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      Request More Info
                    </Button>
                    <Button 
                      onClick={() => handleViewDetails(request)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {activeRequests.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-gray-400 font-medium mb-2">No requests found</h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'pending' 
                ? 'No pending verification requests at the moment.' 
                : 'No reviewed requests to display.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Request Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Student Information</h3>
                <p className="text-gray-300">Name: {selectedRequest.student}</p>
                <p className="text-gray-300">Email: {selectedRequest.studentEmail}</p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">Experience Details</h3>
                <p className="text-gray-300">Title: {selectedRequest.experience}</p>
                <p className="text-gray-300">Type: {selectedRequest.type}</p>
                <p className="text-gray-300">Duration: {selectedRequest.duration}</p>
                <p className="text-gray-300">Description: {selectedRequest.description}</p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-slate-700 text-blue-300 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedRequest.documents && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Documents</h3>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-blue-400">
                        <DocumentTextIcon className="h-4 w-4" />
                        <span className="cursor-pointer hover:text-blue-300">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request More Info Modal */}
      {showMoreInfoModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Request More Information</h2>
              <button 
                onClick={() => setShowMoreInfoModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2">
                  Requesting more information from <strong>{selectedRequest.student}</strong> for:
                </p>
                <p className="text-blue-400 font-medium">{selectedRequest.experience}</p>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Message</label>
                <textarea
                  value={moreInfoMessage}
                  onChange={(e) => setMoreInfoMessage(e.target.value)}
                  placeholder="Please provide more details about..."
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleRequestMoreInfo(selectedRequest.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  disabled={loading === selectedRequest.id}
                >
                  {loading === selectedRequest.id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <InformationCircleIcon className="h-4 w-4" />
                  )}
                  Send Request
                </Button>
                <Button
                  onClick={() => setShowMoreInfoModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
