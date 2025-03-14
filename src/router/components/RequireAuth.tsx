import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
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

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
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
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children || <Outlet />;
}; 