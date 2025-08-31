import React from 'react';
import { OrganizationNavigation } from './OrganizationNavigation';

interface OrganizationLayoutProps {
  children: React.ReactNode;
}

export const OrganizationLayout: React.FC<OrganizationLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <OrganizationNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
