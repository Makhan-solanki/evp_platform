import React from 'react';
import { StudentNavigation } from './StudentNavigation';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <StudentNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
