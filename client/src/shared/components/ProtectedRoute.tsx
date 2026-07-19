import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

export function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="p-6 text-gray-500" role="status">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
