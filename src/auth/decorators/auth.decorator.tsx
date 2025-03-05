import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { auth } from '../../config/firebase';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authService = new AuthService();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed in RequireAuth:', { 
        user: user?.email,
        isAuthenticated: !!user 
      });
      
      if (!user) {
        navigate('/login', { replace: true });
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-600 dark:text-gray-300">
          Cargando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}; 