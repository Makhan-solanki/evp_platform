import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/utils/constants';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectIfAuthenticated = true,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && redirectIfAuthenticated && user) {
    const dashboardRoute = user.role === 'STUDENT' ? ROUTES.STUDENT_DASHBOARD : ROUTES.ORGANIZATION_DASHBOARD;
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};
