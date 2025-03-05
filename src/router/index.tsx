import React from 'react';
import { createBrowserRouter, Link } from 'react-router-dom';
import LoginPage from '../presentation/pages/auth/LoginPage';
import MainLayout from '../presentation/layouts/MainLayout';
import DashboardPage from '../presentation/pages/dashboard/DashboardPage';
import IncidentsPage from '../presentation/pages/incidents/IncidentsPage';
import IncidentDetail from '../presentation/pages/incidents/IncidentDetail';
import IncidentForm from '../presentation/pages/incidents/IncidentForm';
import ErrorBoundary from '../presentation/components/common/ErrorBoundary';
import { RequireAuth } from '../auth/decorators/auth.decorator';
import { AuthService } from '../auth/services/auth.service';
import { Navigate, Outlet } from 'react-router-dom';

const authService = new AuthService();

const PrivateRoute = () => {
  const isAuthenticated = authService.getCurrentUser() !== null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
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
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/app',
    element: <RequireAuth><MainLayout /></RequireAuth>,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        element: <DashboardPage />
      },
      {
        path: 'incidents',
        element: <IncidentsPage />
      },
      {
        path: 'incidents/new',
        element: <IncidentForm />
      },
      {
        path: 'incidents/:id',
        element: <IncidentDetail />
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
], {
  basename: '/nrd-sgo'
}); 