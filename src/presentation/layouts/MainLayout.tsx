import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthService } from '../../auth/services/auth.service';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';
import { RequireAuth } from '../../auth/decorators/auth.decorator';
import { auth } from '../../config/firebase';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const authService = new AuthService();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', { 
        isAuthenticated: !!user,
        uid: user?.uid,
        email: user?.email
      });
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <RequireAuth>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Sidebar with blur effect */}
        <div className={`fixed inset-y-0 left-0 z-30 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl -z-10" />
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Navbar with glass effect */}
          <div className="sticky top-0 z-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
            <Navbar 
              onMenuClick={toggleSidebar}
              onLogout={handleLogout}
              userName={authService.getCurrentUser()?.displayName || 'Usuario'}
            />
          </div>

          {/* Page Content with smooth scrolling */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="container mx-auto px-4 py-6 transition-all duration-300 ease-in-out">
              {/* Content wrapper with animation */}
              <div className="animate-fadeIn">
                <Outlet />
              </div>
            </div>
          </main>
        </div>

        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </RequireAuth>
  );
};

export default MainLayout; 