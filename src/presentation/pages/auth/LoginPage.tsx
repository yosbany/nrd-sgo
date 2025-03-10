import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Sun, Moon, User, Lock } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/presentation/components/ui/card';
import { AuthService } from '@/auth/services/auth.service';
import { toast } from 'sonner';
import logo from '@/assets/logo.jpg';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const authService = new AuthService();
      await authService.login(formData.email, formData.password);
      
      console.log('Login successful');
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión. Por favor, verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40rem] left-1/2 -z-10 transform -translate-x-1/2">
          <div className="aspect-[1200/800] w-[80rem] bg-gradient-to-tr from-primary/20 to-primary-foreground/20 opacity-30 blur-3xl" />
        </div>
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-[90%] sm:max-w-md backdrop-blur-sm bg-card/80 shadow-xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center">
              <img 
                src={logo} 
                alt="Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg shadow-lg object-cover" 
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                Sistema de Gestión Operativa
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Inicie sesión para continuar
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 h-11"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10 h-11"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Iniciar sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="py-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sistema de Gestión Operativa. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 