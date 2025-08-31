import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/hooks';
import { sendPasswordReset } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await dispatch(sendPasswordReset(data.email)).unwrap();
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the slice and shown in toast
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-success-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to{' '}
              <span className="font-medium text-gray-900">
                {getValues('email')}
              </span>
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  try again
                </button>
              </p>
              
              <Link 
                to={ROUTES.LOGIN}
                className="flex items-center justify-center text-primary-600 hover:text-primary-500 font-medium"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-white">Acme Co</span>
          </Link>
          
          <nav className="flex justify-center space-x-8 mb-8">
            <Link to={ROUTES.HOME} className="text-gray-400 hover:text-white text-sm">Home</Link>
            <Link to={ROUTES.ABOUT} className="text-gray-400 hover:text-white text-sm">About</Link>
            <Link to={ROUTES.CONTACT} className="text-gray-400 hover:text-white text-sm">Contact</Link>
            <Link to={ROUTES.LOGIN} className="text-blue-400 hover:text-blue-300 text-sm">
              Sign In
            </Link>
          </nav>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Forgot Password
            </h2>
            <p className="text-gray-400 text-center max-w-sm mx-auto">
              Enter your email address below and we'll send you instructions to reset your password.
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.form 
          className="space-y-6" 
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            loading={isLoading}
          >
            Send Reset Instructions
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
