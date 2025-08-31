import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: 'STUDENT' | 'ORGANIZATION', fullName: string) => void;
  onClose: () => void;
  userEmail: string;
  displayName?: string;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onRoleSelect,
  onClose,
  userEmail,
  displayName = '',
}) => {
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'ORGANIZATION'>('STUDENT');
  const [fullName, setFullName] = useState(displayName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onRoleSelect(selectedRole, fullName.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-400 text-sm">
                Please select your role and provide your name to complete registration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  I am registering as <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      value="STUDENT"
                      checked={selectedRole === 'STUDENT'}
                      onChange={(e) => setSelectedRole(e.target.value as 'STUDENT')}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRole === 'STUDENT' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <div className="text-center">
                        <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm font-medium text-white">Student</span>
                      </div>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      value="ORGANIZATION"
                      checked={selectedRole === 'ORGANIZATION'}
                      onChange={(e) => setSelectedRole(e.target.value as 'ORGANIZATION')}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedRole === 'ORGANIZATION' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <div className="text-center">
                        <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm font-medium text-white">Organization</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-white">
                  {selectedRole === 'ORGANIZATION' ? 'Organization Name' : 'Full Name'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={selectedRole === 'ORGANIZATION' ? 'Enter your organization name' : 'Enter your full name'}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Email Display */}
              <div className="text-sm text-gray-400">
                Email: {userEmail}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-400 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!fullName.trim() || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
