import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';

import { loginSchema, LoginFormData } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await dispatch(loginUser({ 
        credentials: data, 
        rememberMe: data.rememberMe 
      })).unwrap();
      
      if (result.user) {
        const redirectTo = result.user.role === 'STUDENT' 
          ? ROUTES.STUDENT_DASHBOARD 
          : ROUTES.ORGANIZATION_DASHBOARD;
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      // Error is handled by the slice and shown in toast
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-white">Portfolify</span>
          </Link>
          
          <nav className="flex justify-center space-x-8 mb-8">
            <Link to={ROUTES.HOME} className="text-gray-400 hover:text-white text-sm">Home</Link>
            <Link to={ROUTES.ABOUT} className="text-gray-400 hover:text-white text-sm">About</Link>
            <Link to={ROUTES.CONTACT} className="text-gray-400 hover:text-white text-sm">Contact</Link>
            <Link to={ROUTES.REGISTER} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">
              Sign Up
            </Link>
          </nav>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h2>
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
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                             disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

                     <Button
             type="submit"
             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
             loading={isLoading}
           >
             Log in
           </Button>

          <div className="text-center">
            <Link 
              to={ROUTES.FORGOT_PASSWORD} 
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Forgot password?
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default LoginPage;
