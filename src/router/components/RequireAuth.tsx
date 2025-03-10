import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { AuthService } from '../../auth/services/auth.service';
import { auth } from '../../config/firebase';
import { User } from 'firebase/auth';
import LoadingScreen from '../../presentation/components/common/LoadingScreen';

interface RequireAuthProps {
  children?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    let mounted = true;
    console.log('RequireAuth - Setting up auth listener');

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log('RequireAuth - Auth state changed:', {
        email: currentUser?.email,
        uid: currentUser?.uid,
        isAuthenticated: !!currentUser
      });

      if (mounted) {
        setUser(currentUser);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    console.log('RequireAuth - Loading...');
    return <LoadingScreen />;
  }

  if (!user) {
    console.log('RequireAuth - No user, redirecting to login');
    // Preserve the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('RequireAuth - User authenticated, rendering content');
  return children || <Outlet />;
}; 