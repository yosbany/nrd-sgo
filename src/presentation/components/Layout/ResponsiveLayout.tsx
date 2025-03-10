import React from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { mainRoutes } from '../../../router/main.routes';
import { mobileRoutes } from '../../../router/mobile.routes';
import MainLayout from './MainLayout';
import { MobileLayout } from './MobileLayout';

interface ResponsiveLayoutState {
  isMobile: boolean;
}

interface ResponsiveLayoutProps {
  navigate: (to: string) => void;
}

class ResponsiveLayoutBase extends React.Component<ResponsiveLayoutProps, ResponsiveLayoutState> {
  private resizeObserver: ResizeObserver | null = null;

  state = {
    isMobile: window.innerWidth <= 768
  };

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const newIsMobile = width <= 768;
        
        if (this.state.isMobile !== newIsMobile) {
          this.setState({ isMobile: newIsMobile }, () => {
            // Redirigir al dashboard correspondiente
            const targetPath = newIsMobile ? '/mobile' : '/dashboard';
            this.props.navigate(targetPath);
          });
        }
      }
    });

    this.resizeObserver.observe(document.body);
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  render() {
    const { isMobile } = this.state;
    const Layout = isMobile ? MobileLayout : MainLayout;

    return (
      <Routes>
        <Route element={<Layout><Outlet /></Layout>}>
          {/* Rutas específicas para móvil */}
          {isMobile && mobileRoutes}
          
          {/* Rutas de escritorio */}
          {!isMobile && mainRoutes}
          
          {/* Redirección por defecto */}
          <Route path="*" element={
            <Navigate to={isMobile ? "/mobile" : "/dashboard"} replace />
          } />
        </Route>
      </Routes>
    );
  }
}

// Wrapper funcional para proporcionar el hook useNavigate
export const ResponsiveLayout: React.FC = () => {
  const navigate = useNavigate();
  return <ResponsiveLayoutBase navigate={navigate} />;
}; 