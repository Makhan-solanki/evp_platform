import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireEmailVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireEmailVerified = false,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute = user.role === 'STUDENT' ? ROUTES.STUDENT_DASHBOARD : ROUTES.ORGANIZATION_DASHBOARD;
    return <Navigate to={dashboardRoute} replace />;
  }

  // Check if email verification is required
  if (requireEmailVerified && user && !user.emailVerified) {
    return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
  }

  return <>{children}</>;
};
