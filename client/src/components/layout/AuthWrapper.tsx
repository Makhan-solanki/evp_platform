import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RoleSelectionModal } from '@/components/ui/RoleSelectionModal';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { 
    showRoleModal, 
    handleRoleSelection, 
    handleCloseRoleModal, 
    pendingFirebaseUser,
    isAuthenticated 
  } = useAuth();

  return (
    <>
      {children}
      
      {/* Role Selection Modal - Only show for authenticated Firebase users */}
      {isAuthenticated && (
        <RoleSelectionModal
          isOpen={showRoleModal}
          onRoleSelect={handleRoleSelection}
          onClose={handleCloseRoleModal}
          userEmail={pendingFirebaseUser?.email || ''}
          displayName={pendingFirebaseUser?.email || ''}
        />
      )}
    </>
  );
};
