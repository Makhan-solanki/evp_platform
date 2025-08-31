import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  HomeIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  SunIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  AcademicCapIcon,
  PlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useAuth, useAppDispatch } from '@/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { cn } from '@/utils';
import { ROUTES } from '@/utils/constants';

interface StudentNavigationProps {
  className?: string;
}

export const StudentNavigation: React.FC<StudentNavigationProps> = ({ className }) => {
  const { user, student } = useAuth();
  const dispatch = useAppDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Add theme toggle logic here
  };

  const userDisplayName = student?.fullName || user?.email || '';
  const userInitials = userDisplayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'Portfolio Updated',
      message: 'Your portfolio has been successfully updated',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'New Verification Request',
      message: 'You have a new verification request from ABC Company',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      title: 'Experience Approved',
      message: 'Your internship experience has been approved',
      time: '3 days ago',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId: number) => {
    console.log('Notification clicked:', notificationId);
    // Add notification handling logic
  };

  const markAllAsRead = () => {
    console.log('Mark all as read');
    // Add mark all as read logic
  };

  return (
    <nav className={cn('bg-slate-900 border-b border-slate-800', className)}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">ExperienceHub</span>
          </div>

          {/* Right side - Navigation, Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* Navigation Items - Moved to right side */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink
                to={ROUTES.STUDENT_DASHBOARD}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  )
                }
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </NavLink>
              
              <NavLink
                to={ROUTES.STUDENT_PORTFOLIO}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  )
                }
              >
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                Portfolio
              </NavLink>
              
              <NavLink
                to={ROUTES.STUDENT_VERIFICATION}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  )
                }
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Verification
              </NavLink>
            </div>

            {/* Portfolio Builder Button */}
            <NavLink
              to={ROUTES.STUDENT_PORTFOLIO_BUILDER}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Build Portfolio
            </NavLink>

            {/* Notification Icon with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{unreadCount}</span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700 z-10">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={cn(
                            'p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors',
                            !notification.read && 'bg-slate-750'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{notification.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-400">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search Icon */}
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Profile Icon with Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {userInitials}
                  </span>
                </div>
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700 focus:outline-none z-10">
                  <div className="p-4 border-b border-slate-700">
                    <p className="text-sm font-medium text-white">{userDisplayName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <NavLink
                          to={ROUTES.STUDENT_PROFILE}
                          className={cn(
                            'flex items-center px-4 py-2 text-sm',
                            active ? 'bg-slate-700 text-white' : 'text-gray-300'
                          )}
                        >
                          <UserIcon className="mr-3 h-4 w-4" />
                          Profile
                        </NavLink>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <NavLink
                          to={ROUTES.STUDENT_EXPERIENCES}
                          className={cn(
                            'flex items-center px-4 py-2 text-sm',
                            active ? 'bg-slate-700 text-white' : 'text-gray-300'
                          )}
                        >
                          <BriefcaseIcon className="mr-3 h-4 w-4" />
                          Experiences
                        </NavLink>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <NavLink
                          to={ROUTES.STUDENT_PORTFOLIO_BUILDER}
                          className={cn(
                            'flex items-center px-4 py-2 text-sm',
                            active ? 'bg-slate-700 text-white' : 'text-gray-300'
                          )}
                        >
                          <DocumentTextIcon className="mr-3 h-4 w-4" />
                          Portfolio Builder
                        </NavLink>
                      )}
                    </Menu.Item>
                    
                    <Menu.Item>
                      {({ active }) => (
                        <NavLink
                          to={ROUTES.STUDENT_SETTINGS}
                          className={cn(
                            'flex items-center px-4 py-2 text-sm',
                            active ? 'bg-slate-700 text-white' : 'text-gray-300'
                          )}
                        >
                          <Cog6ToothIcon className="mr-3 h-4 w-4" />
                          Settings
                        </NavLink>
                      )}
                    </Menu.Item>

                    {/* Theme Toggle */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleThemeToggle}
                          className={cn(
                            'flex items-center w-full px-4 py-2 text-sm text-left',
                            active ? 'bg-slate-700 text-white' : 'text-gray-300'
                          )}
                        >
                          <SunIcon className="mr-3 h-4 w-4" />
                          Toggle Theme
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  
                  <div className="py-1 border-t border-slate-700">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={cn(
                            'flex items-center w-full px-4 py-2 text-sm text-left',
                            active ? 'bg-slate-700 text-white' : 'text-gray-300'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-800">
        <div className="px-4 py-3 space-y-1">
          <NavLink
            to={ROUTES.STUDENT_DASHBOARD}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <HomeIcon className="h-5 w-5 mr-3" />
            Home
          </NavLink>
          
          <NavLink
            to={ROUTES.STUDENT_PORTFOLIO}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <BriefcaseIcon className="h-5 w-5 mr-3" />
            Portfolio
          </NavLink>
          
          <NavLink
            to={ROUTES.STUDENT_VERIFICATION}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <ShieldCheckIcon className="h-5 w-5 mr-3" />
            Verification
          </NavLink>

          <NavLink
            to={ROUTES.STUDENT_PORTFOLIO_BUILDER}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
          >
            <PlusIcon className="h-5 w-5 mr-3" />
            Build Portfolio
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
