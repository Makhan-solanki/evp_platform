import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { setCredentials, clearCredentials } from '@/store/slices/authSlice';
import { apiService } from '@/services/api';
import { User } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in (has token in localStorage)
    const token = localStorage.getItem('authToken');
    if (token) {
      apiService.setAuthToken(token);
      // Try to get user profile
      apiService.get('/auth/profile')
        .then((response) => {
          if (response.success) {
            const { user, student, organization } = response.data;
            dispatch(setCredentials({ user, student, organization, token }));
          } else {
            // Invalid token, clear it
            localStorage.removeItem('authToken');
            apiService.clearAuthToken();
            dispatch(clearCredentials());
          }
        })
        .catch(() => {
          // Error getting profile, clear token
          localStorage.removeItem('authToken');
          apiService.clearAuthToken();
          dispatch(clearCredentials());
        });
    }
  }, [dispatch]);

  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const student = auth.student;
  const organization = auth.organization;
  const loading = auth.loading;
  const error = auth.error;

  const isStudent = user?.role === 'STUDENT';
  const isOrganization = user?.role === 'ORGANIZATION';
  const isAdmin = user?.role === 'ADMIN';

  const handleRoleSelection = (role: 'STUDENT' | 'ORGANIZATION') => {
    // Handle role selection logic
    setShowRoleModal(false);
  };

  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setPendingFirebaseUser(null);
  };

  return {
    isAuthenticated,
    user,
    student,
    organization,
    loading,
    error,
    isStudent,
    isOrganization,
    isAdmin,
    showRoleModal,
    handleRoleSelection,
    handleCloseRoleModal,
    pendingFirebaseUser,
  };
};
