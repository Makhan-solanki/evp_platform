import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import { ROUTES } from '@/utils/constants';


// Layout Components
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicRoute } from '@/components/layout/PublicRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import StudentDashboard from '@/pages/student/Dashboard';
import OrganizationDashboard from '@/pages/organization/Dashboard';

// Student Pages
import StudentPortfolio from '@/pages/student/Portfolio';
import StudentNotifications from '@/pages/student/Notifications';
import StudentVerificationRequests from '@/pages/student/VerificationRequests';
import StudentExperienceVerification from '@/pages/student/ExperienceVerification';
import StudentPortfolioBuilder from '@/pages/student/PortfolioBuilder';

// Error Pages
import UnauthorizedAccess from '@/pages/error/UnauthorizedAccess';

// Organization Pages
import OrganizationAnalytics from '@/pages/organization/Analytics';
import OrganizationStudents from '@/pages/organization/Students';
import OrganizationRequests from '@/pages/organization/Requests';

// Public Pages
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path={ROUTES.HOME} 
              element={
                <PublicRoute redirectIfAuthenticated={false}>
                  <LandingPage />
                </PublicRoute>
              } 
            />
            
            {/* Auth Routes */}
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path={ROUTES.REGISTER} 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            <Route 
              path={ROUTES.FORGOT_PASSWORD} 
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } 
            />
            
            {/* Student Protected Routes */}
            <Route 
              path={ROUTES.STUDENT_DASHBOARD} 
              element={
                <ProtectedRoute requiredRoles={['STUDENT']}>
                  <StudentLayout>
                    <StudentDashboard />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Organization Protected Routes */}
            <Route 
              path={ROUTES.ORGANIZATION_DASHBOARD} 
              element={
                <ProtectedRoute requiredRoles={['ORGANIZATION']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route 
              path={ROUTES.STUDENT_PORTFOLIO} 
              element={
                <ProtectedRoute requiredRoles={['STUDENT']}>
                  <StudentLayout>
                    <StudentPortfolio />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/notifications" 
              element={
                <ProtectedRoute requiredRoles={['STUDENT']}>
                  <StudentLayout>
                    <StudentNotifications />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/verification-requests" 
              element={
                <ProtectedRoute requiredRoles={['STUDENT']}>
                  <StudentLayout>
                    <StudentVerificationRequests />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/experience-verification" 
              element={
                <ProtectedRoute requiredRoles={['STUDENT']}>
                  <StudentLayout>
                    <StudentExperienceVerification />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path={ROUTES.STUDENT_PORTFOLIO_BUILDER} 
              element={
                <ProtectedRoute requiredRoles={['STUDENT']}>
                  <StudentLayout>
                    <StudentPortfolioBuilder />
                  </StudentLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Organization Routes */}
            <Route 
              path="/organization/students" 
              element={
                <ProtectedRoute requiredRoles={['ORGANIZATION']}>
                  <OrganizationStudents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/organization/requests" 
              element={
                <ProtectedRoute requiredRoles={['ORGANIZATION']}>
                  <OrganizationRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/organization/analytics" 
              element={
                <ProtectedRoute requiredRoles={['ORGANIZATION']}>
                  <OrganizationAnalytics />
                </ProtectedRoute>
              } 
            />
            
            {/* Public Routes */}
            <Route path={ROUTES.ABOUT} element={<AboutPage />} />
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={<UnauthorizedAccess />} />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <a 
                      href={ROUTES.HOME}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              } 
            />
                      </Routes>
          
          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;