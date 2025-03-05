import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../presentation/layouts/MainLayout';
import LoginPage from '../presentation/pages/auth/LoginPage';
import DashboardPage from '../presentation/pages/dashboard/DashboardPage';
import IncidentsPage from '../presentation/pages/incidents/IncidentsPage';
import { AuthService } from '../auth/services/auth.service';
import ErrorBoundary from '../presentation/components/common/ErrorBoundary';
// ... other imports ...

const authService = new AuthService();

const PrivateRoute = () => {
  const isAuthenticated = authService.getCurrentUser() !== null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const ErrorPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          404 - Página no encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          La página que estás buscando no existe.
        </p>
        <a
          href="/sgo-app"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  </div>
);

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: (
        <ErrorBoundary>
          <LoginPage />
        </ErrorBoundary>
      )
    },
    {
      element: (
        <ErrorBoundary>
          <PrivateRoute />
        </ErrorBoundary>
      ),
      children: [
        {
          path: '/',
          element: (
            <ErrorBoundary>
              <MainLayout />
            </ErrorBoundary>
          ),
          children: [
            {
              index: true,
              element: <Navigate to="/dashboard" replace />
            },
            {
              path: 'dashboard',
              element: (
                <ErrorBoundary>
                  <DashboardPage />
                </ErrorBoundary>
              )
            },
            {
              path: 'incidents',
              element: (
                <ErrorBoundary>
                  <IncidentsPage />
                </ErrorBoundary>
              )
            }
          ]
        }
      ]
    },
    {
      path: '*',
      element: (
        <ErrorBoundary>
          <ErrorPage />
        </ErrorBoundary>
      )
    }
  ],
  {
    basename: '/sgo-app'
  }
); 