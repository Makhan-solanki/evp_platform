import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentCheckIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth, useAppDispatch } from '@/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { cn } from '@/utils';
import { ROUTES } from '@/utils/constants';

interface OrganizationNavigationProps {
  className?: string;
}

export const OrganizationNavigation: React.FC<OrganizationNavigationProps> = ({ className }) => {
  const { user, organization } = useAuth();
  const dispatch = useAppDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would typically dispatch to a theme store
    // For now, we'll just toggle the local state
  };

  const userDisplayName = organization?.name || user?.email || '';
  const userInitials = userDisplayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const navigationItems = [
    {
      name: 'Analytics',
      href: '/organization/analytics',
      icon: ChartBarIcon,
    },
    {
      name: 'Students',
      href: '/organization/students',
      icon: UsersIcon,
    },
    {
      name: 'Requests',
      href: '/organization/requests',
      icon: DocumentCheckIcon,
    },
  ];

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'approval',
      title: 'Request Approved',
      message: 'Sarah Johnson\'s Frontend Developer Internship has been approved',
      time: '2 minutes ago',
      read: false,
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
    },
    {
      id: 2,
      type: 'rejection',
      title: 'Request Rejected',
      message: 'Michael Chen\'s Backend Development Project has been rejected',
      time: '1 hour ago',
      read: false,
      icon: XCircleIcon,
      iconColor: 'text-red-400',
    },
    {
      id: 3,
      type: 'info',
      title: 'New Request Received',
      message: 'Emma Davis submitted a new verification request',
      time: '3 hours ago',
      read: true,
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
    },
    {
      id: 4,
      type: 'approval',
      title: 'Request Approved',
      message: 'James Wilson\'s Mobile App Development has been approved',
      time: '1 day ago',
      read: true,
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notificationId: number) => {
    // Mark notification as read
    console.log('Notification clicked:', notificationId);
    setShowNotifications(false);
  };

  const markAllAsRead = () => {
    // Mark all notifications as read
    console.log('Mark all as read');
  };

  return (
    <nav className={cn('bg-slate-900 border-b border-slate-800', className)}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">ExperienceHub</span>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-slate-800'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side - Actions and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Icon */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative"
              >
                <BellIcon className="h-5 w-5" />
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-lg ring-1 ring-slate-700 z-50">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
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
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${notification.iconColor}`}>
                              <notification.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm">{notification.title}</p>
                              <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                              <p className="text-gray-500 text-xs mt-2">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-gray-400 text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-slate-700">
                    <NavLink
                      to="/organization/notifications"
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View all notifications
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={handleThemeToggle}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
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
                          to={ROUTES.ORGANIZATION_PROFILE}
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
                          to={ROUTES.ORGANIZATION_SETTINGS}
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

                    {/* Additional Organization Options */}
                    <Menu.Item>
                      {({ active }) => (
                        <NavLink
                          to="/organization/notifications"
                          className={cn(
                            'flex items-center px-4 py-2 text-sm',
                            active ? 'bg-slate-700 text-white' : 'text-gray-300'
                          )}
                        >
                          <BellIcon className="mr-3 h-4 w-4" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
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
                          {isDarkMode ? (
                            <SunIcon className="mr-3 h-4 w-4" />
                          ) : (
                            <MoonIcon className="mr-3 h-4 w-4" />
                          )}
                          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
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
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800'
                )
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
