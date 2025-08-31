import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

const UnauthorizedAccess: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support ticket or contact form
    window.location.href = 'mailto:support@experiencehub.com';
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="h-12 w-12 text-red-500" />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            You do not have the necessary permissions to view this page. Please contact support if you believe this is an error.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={handleGoBack}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </Button>
          
          <Button
            onClick={handleContactSupport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contact Support
          </Button>
        </motion.div>

        {/* Additional Links */}
        <motion.div
          className="mt-8 pt-8 border-t border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-500 text-sm mb-4">
            Need help? Try these options:
          </p>
          <div className="flex flex-col space-y-2">
            <Link 
              to={ROUTES.HOME} 
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Return to Home Page
            </Link>
            <Link 
              to={ROUTES.LOGIN} 
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Login with Different Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
