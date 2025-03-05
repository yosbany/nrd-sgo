import { NavLink } from 'react-router-dom';
import {
  Home,
  AlertTriangle,
  Users,
  Package,
  Settings,
  X,
  BarChart2,
  Calendar,
  FileText,
  Tool
} from 'react-feather';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/',
      badge: null
    },
    {
      title: 'Incidentes',
      icon: <AlertTriangle className="h-5 w-5" />,
      path: '/incidents',
      badge: '3'
    },
    {
      title: 'Personal',
      icon: <Users className="h-5 w-5" />,
      path: '/employees',
      badge: null
    },
    {
      title: 'Inventario',
      icon: <Package className="h-5 w-5" />,
      path: '/inventory',
      badge: null
    },
    {
      title: 'Producción',
      icon: <BarChart2 className="h-5 w-5" />,
      path: '/production',
      badge: null
    },
    {
      title: 'Mantenimiento',
      icon: <Tool className="h-5 w-5" />,
      path: '/maintenance',
      badge: '2'
    },
    {
      title: 'Calendario',
      icon: <Calendar className="h-5 w-5" />,
      path: '/calendar',
      badge: null
    },
    {
      title: 'Reportes',
      icon: <FileText className="h-5 w-5" />,
      path: '/reports',
      badge: null
    }
  ];

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-800 flex flex-col">
      {/* Logo section */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">SGO App</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 relative group ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`
              }
            >
              <span className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </span>
              {item.badge && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-500 px-2 py-0.5 rounded-full text-xs font-medium">
                  {item.badge}
                </span>
              )}
              <div className="absolute inset-y-0 left-0 w-1 rounded-r-lg bg-blue-600 dark:bg-blue-500 transform scale-y-0 transition-transform duration-200 origin-left group-hover:scale-y-100" />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Settings section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
              isActive
                ? 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`
          }
        >
          <Settings className="h-5 w-5" />
          <span className="ml-3">Configuración</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar; 