import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeSlashIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/hooks';
import { registerUser } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, RegisterFormData } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';
import { RegisterCredentials } from '@/types';

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Filter out fields that the server doesn't expect
      const serverData: RegisterCredentials = {
        email: data.email,
        password: data.password,
        role: data.role,
        fullName: data.fullName,
        organizationName: data.organizationName,
      };
      
      const result = await dispatch(registerUser(serverData)).unwrap();
      
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
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-white">SkillStamp</span>
          </Link>
          
          <nav className="flex justify-center space-x-8 mb-8">
            <Link to={ROUTES.HOME} className="text-gray-400 hover:text-white text-sm">Home</Link>
            <Link to={ROUTES.ABOUT} className="text-gray-400 hover:text-white text-sm">About</Link>
            <Link to={ROUTES.CONTACT} className="text-gray-400 hover:text-white text-sm">Contact</Link>
            <Link to={ROUTES.LOGIN} className="text-gray-400 hover:text-white text-sm">
              Log In
            </Link>
          </nav>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              {watchedRole === 'ORGANIZATION' ? 'Register your organization' : 'Create your account'}
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
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              I am registering as <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  {...register('role')}
                  type="radio"
                  value="STUDENT"
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  watchedRole === 'STUDENT' 
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
                  {...register('role')}
                  type="radio"
                  value="ORGANIZATION"
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  watchedRole === 'ORGANIZATION' 
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
            {errors.role && (
              <p className="text-red-400 text-sm">{errors.role.message}</p>
            )}
          </div>

          {/* Name Fields */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              {watchedRole === 'ORGANIZATION' ? 'Organization Name' : 'Full Name'} <span className="text-red-400">*</span>
            </label>
            <input
              {...register('fullName')}
              type="text"
              placeholder={watchedRole === 'ORGANIZATION' ? 'Enter your organization name' : 'Enter your full name'}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm">{errors.fullName.message}</p>
            )}
          </div>

          {/* Organization Name (when role is ORGANIZATION) */}
          {watchedRole === 'ORGANIZATION' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-white">
                Contact Person Name <span className="text-red-400">*</span>
              </label>
              <input
                {...register('organizationName')}
                type="text"
                placeholder="Enter contact person name"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.organizationName && (
                <p className="text-red-400 text-sm">{errors.organizationName.message}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
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
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              {...register('acceptTerms')}
              id="accept-terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-800 mt-1"
              disabled={isLoading}
            />
            <label htmlFor="accept-terms" className="ml-3 text-sm text-gray-300">
              I agree to the{' '}
              <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </a>
              <span className="text-red-400 ml-1">*</span>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-400 text-sm">{errors.acceptTerms.message}</p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            loading={isLoading}

          >
            Register
          </Button>



          {/* Sign In Link */}
          <div className="text-center">
            <span className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="text-blue-400 hover:text-blue-300 underline">
                Log in
              </Link>
            </span>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default RegisterPage;
