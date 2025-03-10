import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../presentation/pages/auth/LoginPage';
import { ResponsiveLayout } from '../presentation/components/Layout/ResponsiveLayout';
import { RequireAuth } from './components/RequireAuth';
import { AuthService } from '../auth/services/auth.service';
import React from 'react';

const AppRouter = () => {
  // Initialize AuthService once at the app level
  React.useEffect(() => {
    new AuthService();
  }, []);

  // Determine initial route based on screen width
  const isMobile = window.innerWidth <= 768;
  const defaultRoute = isMobile ? '/dashboard' : '/dashboard';

  return (
    <Router basename='/nrd-sgo'>
      <Routes>
        {/* Public Routes */}
        <Route path="login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/*" element={<ResponsiveLayout />} />
        </Route>

        {/* Default redirect - using relative paths */}
        <Route path="" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter; 