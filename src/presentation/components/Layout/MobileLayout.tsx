import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaClipboardList, FaIndustry, FaHome, FaChevronLeft } from 'react-icons/fa';
import { Button } from '@/presentation/components/ui/button';
import { MobileDashboard } from '@/presentation/pages/mobile/dashboard/MobileDashboard';
import { cn } from '@/lib/utils';
import { Plus, ClipboardList } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/mobile' || location.pathname === '/mobile/dashboard';

  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        const docElement = document.documentElement;
        if (docElement.requestFullscreen) {
          await docElement.requestFullscreen();
        } else if ((docElement as any).webkitRequestFullscreen) {
          await (docElement as any).webkitRequestFullscreen();
        } else if ((docElement as any).msRequestFullscreen) {
          await (docElement as any).msRequestFullscreen();
        }
      } catch (error) {
        console.log('No se pudo activar el modo pantalla completa:', error);
      }
    };

    requestFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.log('Error al salir de pantalla completa:', err);
        });
      }
    };
  }, []);

  const getPageInfo = () => {
    const currentPath = location.pathname;
    if (isHome) return { 
      title: 'Inicio', 
      icon: FaHome,
      showBack: false,
      action: null
    };

    if (currentPath.includes('/mobile/production')) {
      if (currentPath.includes('/new')) {
        return { 
          title: 'Nueva Producción', 
          icon: FaIndustry,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/edit')) {
        return { 
          title: 'Editar Producción', 
          icon: FaIndustry,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/view')) {
        return { 
          title: 'Ver Producción', 
          icon: FaIndustry,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/delete')) {
        return { 
          title: 'Eliminar Producción', 
          icon: FaIndustry,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      return { 
        title: 'Producciones', 
        icon: FaIndustry,
        showBack: false,
        action: () => navigate('/mobile/production/new'),
        actionIcon: Plus
      };
    }

    if (currentPath.includes('/mobile/purchases')) {
      if (currentPath.includes('/new')) {
        return { 
          title: 'Nueva Compra', 
          icon: FaShoppingCart,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/edit')) {
        return { 
          title: 'Editar Compra', 
          icon: FaShoppingCart,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/view')) {
        return { 
          title: 'Ver Compra', 
          icon: FaShoppingCart,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/delete')) {
        return { 
          title: 'Eliminar Compra', 
          icon: FaShoppingCart,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      return { 
        title: 'Compras', 
        icon: FaShoppingCart,
        showBack: false,
        action: () => navigate('/mobile/purchases/new'),
        actionIcon: Plus
      };
    }

    if (currentPath.includes('/mobile/orders')) {
      if (currentPath.includes('/new')) {
        return { 
          title: 'Nuevo Pedido', 
          icon: FaClipboardList,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/edit')) {
        return { 
          title: 'Editar Pedido', 
          icon: FaClipboardList,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/view')) {
        return { 
          title: 'Ver Pedido', 
          icon: FaClipboardList,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      if (currentPath.includes('/delete')) {
        return { 
          title: 'Eliminar Pedido', 
          icon: FaClipboardList,
          showBack: true,
          action: () => null,
          actionIcon: ClipboardList
        };
      }
      return { 
        title: 'Pedidos', 
        icon: FaClipboardList,
        showBack: false,
        action: () => navigate('/mobile/orders/new'),
        actionIcon: Plus
      };
    }

    return { 
      title: 'SGO', 
      icon: FaHome,
      showBack: false,
      action: null
    };
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Status Bar Area */}
      <div className="h-[env(safe-area-inset-top)] bg-background" />

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl",
        "transition-all duration-200 ease-in-out",
        "border-b border-border/40"
      )}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {pageInfo.showBack && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(-1)}
              >
                <FaChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              {React.createElement(pageInfo.icon, { 
                className: cn(
                  "h-5 w-5",
                  location.pathname.includes('/mobile/production') ? 'text-primary' : '',
                  location.pathname.includes('/mobile/purchases') ? 'text-primary' : '',
                  location.pathname.includes('/mobile/orders') ? 'text-primary' : '',
                  isHome ? 'text-primary' : ''
                )
              })}
              <h1 className="text-lg font-medium">
                {pageInfo.title}
              </h1>
            </div>
          </div>
          {pageInfo.action && pageInfo.actionIcon && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={pageInfo.action}
            >
              {React.createElement(pageInfo.actionIcon, { className: "h-5 w-5" })}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {isHome ? <MobileDashboard /> : <Outlet />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
        <div className="flex justify-around items-center h-14">
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-0.5 h-full px-2 rounded-none relative ${
              isHome ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => navigate('/mobile')}
          >
            <FaHome className="h-5 w-5" />
            <span className="text-[10px] font-medium">Inicio</span>
            {isHome && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-0.5 h-full px-2 rounded-none relative ${
              location.pathname.includes('/mobile/purchases') ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => navigate('/mobile/purchases')}
          >
            <FaShoppingCart className="h-5 w-5" />
            <span className="text-[10px] font-medium">Compras</span>
            {location.pathname.includes('/mobile/purchases') && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-0.5 h-full px-2 rounded-none relative ${
              location.pathname.includes('/mobile/orders') ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => navigate('/mobile/orders')}
          >
            <FaClipboardList className="h-5 w-5" />
            <span className="text-[10px] font-medium">Pedidos</span>
            {location.pathname.includes('/mobile/orders') && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-0.5 h-full px-2 rounded-none relative ${
              location.pathname.includes('/mobile/production') ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => navigate('/mobile/production')}
          >
            <FaIndustry className="h-5 w-5" />
            <span className="text-[10px] font-medium">Producción</span>
            {location.pathname.includes('/mobile/production') && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </Button>
        </div>
      </nav>

      {/* Bottom Safe Area Spacer */}
      <div className="h-[calc(env(safe-area-inset-bottom)+3.5rem)]" />
    </div>
  );
}; 