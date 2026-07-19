import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';
import { RepoDetailPage } from './RepoDetailPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { AppShell } from '../shared/components/AppShell';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/repositories/:repositoryId', element: <RepoDetailPage /> },
        ],
      },
    ],
  },
]);
