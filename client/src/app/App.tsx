import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '../features/auth/store/authStore';
import { fetchCurrentUser } from '../features/auth/api';

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return <RouterProvider router={router} />;
}
