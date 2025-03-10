import { FC, ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  X,
  Sun,
  Moon,
  LogOut,
  Users,
  ShoppingCart,
  Package,
  Settings,
  Building2,
  UserCircle,
  ScrollText,
  Ruler,
  AlertCircle,
  Store,
  ClipboardList,
  Factory,
  Boxes,
  ChefHat,
  Calculator
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Card } from '@/presentation/components/ui/card';
import logo from '@/assets/logo.jpg';
import { BASE_PATH } from '@/router/constants';

interface MainLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  label: string;
  path?: string;
  icon?: React.ElementType;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Administración',
    icon: Settings,
    submenu: [
      { label: 'Clientes', path: '/customers', icon: Users },
      { label: 'Proveedores', path: '/suppliers', icon: Building2 },
      { label: 'Colaboradores', path: '/workers', icon: UserCircle },
      { label: 'Roles', path: '/roles', icon: ScrollText },
      { label: 'Unidades', path: '/units', icon: Ruler },
      { label: 'Parámetros', path: '/parameters', icon: Settings },
      { label: 'Incidentes', path: '/incidents', icon: AlertCircle },
    ],
  },
  {
    label: 'Operación',
    icon: Store,
    submenu: [
      { label: 'Compras', path: '/purchase-orders', icon: ShoppingCart },
      { label: 'Pedidos', path: '/customer-orders', icon: ClipboardList },
      { label: 'Producción', path: '/production-orders', icon: Factory },
      { label: 'Cierres Diarios', path: '/daily-closures', icon: Calculator },
    ],
  },
  {
    label: 'Inventario',
    icon: Package,
    submenu: [
      { label: 'Productos', path: '/products', icon: Boxes },
      { label: 'Recetas', path: '/recipes', icon: ChefHat },
    ],
  },
];

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const handleMenuClick = (index: number) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveMenu(null);
  };

  return (
    <div className="min-h-screen bg-background" onClick={() => setActiveMenu(null)}>
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40rem] left-1/2 -z-10 transform -translate-x-1/2">
          <div className="aspect-[1200/800] w-[80rem] bg-gradient-to-tr from-primary/20 to-primary-foreground/20 opacity-30 blur-3xl" />
        </div>
      </div>

      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link 
              to="/dashboard"
              className="flex items-center space-x-3 cursor-pointer"
              onClick={closeMenu}
            >
              <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
              <span className="text-xl font-bold">Sistema de Gestión Operativa</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center gap-1">
                {menuItems.map((item, index) => (
                  <div key={index} className="relative group px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(index);
                      }}
                      className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary py-2"
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </button>
                    {item.submenu && activeMenu === index && (
                      <div 
                        className="absolute right-0 top-full w-56 pt-2 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Card className="p-2 shadow-lg">
                          <nav className="grid gap-1">
                            {item.submenu.map((subItem, subIndex) => (
                              <Link
                                key={subIndex}
                                to={subItem.path || '#'}
                                onClick={closeMenu}
                                className="flex w-full items-center space-x-2 rounded-md p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                              >
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                <span>{subItem.label}</span>
                              </Link>
                            ))}
                          </nav>
                        </Card>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 border-l border-border/40 pl-4 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {menuItems.map((item, index) => (
                <div key={index} className="py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(index);
                    }}
                    className="flex items-center space-x-2 font-medium mb-1 w-full text-left"
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </button>
                  {item.submenu && activeMenu === index && (
                    <div className="pl-4 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path || '#'}
                          onClick={closeMenu}
                          className="flex items-center space-x-2 py-2 text-sm text-muted-foreground hover:text-primary cursor-pointer"
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4" />}
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-border/40">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground hover:text-primary"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 