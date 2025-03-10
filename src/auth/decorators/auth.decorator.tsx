import { FC, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { auth } from '../../config/firebase';
import LoadingScreen from '../../presentation/components/common/LoadingScreen';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    const authService = new AuthService();

    const checkAuth = async () => {
      try {
        // Esperar a que el estado de autenticación esté listo
        await authService.waitForAuthReady();
        
        unsubscribe = auth.onAuthStateChanged(async (user) => {
          console.log('Auth state changed in RequireAuth:', { 
            user: user?.email,
            isAuthenticated: !!user,
            wasRemembered: authService.wasRemembered(),
            pathname: location.pathname
          });
          
          if (!user && location.pathname !== '/login') {
            // Solo redirigir al login si no estamos ya en la página de login
            navigate('/login', { 
              replace: true,
              state: { from: location.pathname }
            });
          } else if (user) {
            setIsAuthenticated(true);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigate, location]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}; 