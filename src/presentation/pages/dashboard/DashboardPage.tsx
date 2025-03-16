import { FC, useEffect, useState } from 'react';
import {
  ShoppingCart, Package, Factory, Calculator, Apple, RefreshCcw,
  ShoppingBag, Truck, Users, HardHat
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { DashboardServiceImpl, DashboardData } from '@/domain/services/dashboard.service.impl';
import { PriceCalculator } from '@/presentation/components/ui/price-calculator';
import { ProduceCalculator } from '@/presentation/components/ui/produce-calculator';
import { DataImportExport } from '@/presentation/components/ui/data-import-export';
import { OrderStatus } from '@/domain/enums/order-status.enum';

const DashboardPage: FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isProduceCalculatorOpen, setIsProduceCalculatorOpen] = useState(false);
  const [isDataImportExportOpen, setIsDataImportExportOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const service = new DashboardServiceImpl();
        const data = await service.getDashboardData();
        console.log('Debug - Dashboard Data:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const tools = [
    { 
      name: 'Calculadora de Precios', 
      icon: Calculator, 
      color: 'bg-blue-500/10 text-blue-500',
      onClick: () => setIsCalculatorOpen(true)
    },
    { 
      name: 'Frutas y Verduras', 
      icon: Apple, 
      color: 'bg-green-500/10 text-green-500',
      onClick: () => setIsProduceCalculatorOpen(true)
    },
    { 
      name: 'Actualización de Datos', 
      icon: RefreshCcw, 
      color: 'bg-purple-500/10 text-purple-500',
      onClick: () => setIsDataImportExportOpen(true)
    },
  ];

  const modelStats = [
    {
      title: 'Inventarios',
      icon: Package,
      color: 'bg-blue-500/10 text-blue-500',
      total: (dashboardData?.stats.totalProducts || 0) + (dashboardData?.stats.totalRecipes || 0),
      items: [
        {
          name: 'Productos',
          value: dashboardData?.stats.totalProducts || 0,
          icon: Package,
          color: 'text-blue-500'
        },
        {
          name: 'Recetas',
          value: dashboardData?.stats.totalRecipes || 0,
          icon: Factory,
          color: 'text-blue-500'
        }
      ]
    },
    {
      title: 'Órdenes',
      icon: ShoppingBag,
      color: 'bg-green-500/10 text-green-500',
      total: (dashboardData?.stats.totalOrders || 0) + 
             (dashboardData?.stats.totalPurchases || 0) + 
             (dashboardData?.stats.totalProduction || 0),
      items: [
        {
          name: 'Pedidos',
          value: dashboardData?.stats.totalOrders || 0,
          icon: ShoppingBag,
          color: 'text-green-500'
        },
        {
          name: 'Compras',
          value: dashboardData?.stats.totalPurchases || 0,
          icon: ShoppingCart,
          color: 'text-green-500'
        },
        {
          name: 'Producción',
          value: dashboardData?.stats.totalProduction || 0,
          icon: Factory,
          color: 'text-green-500'
        }
      ]
    },
    {
      title: 'Contactos',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-500',
      total: (dashboardData?.stats.totalCustomers || 0) + 
             (dashboardData?.stats.totalSuppliers || 0) + 
             (dashboardData?.stats.totalWorkers || 0),
      items: [
        {
          name: 'Clientes',
          value: dashboardData?.stats.totalCustomers || 0,
          icon: Users,
          color: 'text-purple-500'
        },
        {
          name: 'Proveedores',
          value: dashboardData?.stats.totalSuppliers || 0,
          icon: Truck,
          color: 'text-purple-500'
        },
        {
          name: 'Colaboradores',
          value: dashboardData?.stats.totalWorkers || 0,
          icon: HardHat,
          color: 'text-purple-500'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-destructive text-lg">{error}</p>
        <Button onClick={() => window.location.reload()} variant="secondary">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tools Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card 
            key={tool.name} 
            className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-colors cursor-pointer"
            onClick={tool.onClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${tool.color}`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{tool.name}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelStats.map((stat) => (
          <Card key={stat.title} className="backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-0 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{stat.title}</CardTitle>
                </div>
                <p className="text-xl font-bold">{stat.total}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-3 px-4">
              <div className="space-y-1">
                {stat.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Más Comprados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {dashboardData?.topPurchased.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-1 px-2 rounded-lg bg-background/50">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${
                    product.status === OrderStatus.PENDIENTE ? 'bg-yellow-500/10' :
                    product.status === OrderStatus.ENVIADA ? 'bg-blue-500/10' :
                    product.status === OrderStatus.COMPLETADA ? 'bg-green-500/10' :
                    'bg-red-500/10'
                  }`}>
                    <ShoppingCart className={`h-5 w-5 ${
                      product.status === OrderStatus.PENDIENTE ? 'text-yellow-500' :
                      product.status === OrderStatus.ENVIADA ? 'text-blue-500' :
                      product.status === OrderStatus.COMPLETADA ? 'text-green-500' :
                      'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Cantidad: {product.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{product.amount}</p>
                  <p className="text-xs text-green-500">{product.trend}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Más Producidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {dashboardData?.topProduced && dashboardData.topProduced.length > 0 ? (
              dashboardData.topProduced.map((recipe, index) => (
                <div key={index} className="flex items-center justify-between py-1 px-2 rounded-lg bg-background/50">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-green-500/10 rounded-lg">
                      <Factory className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{recipe.name}</p>
                      <p className="text-xs text-muted-foreground">Cantidad: {recipe.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{recipe.amount}</p>
                    <p className="text-xs text-green-500">{recipe.trend}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Factory className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No hay datos de producción disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Más Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {dashboardData?.topOrdered.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-1 px-2 rounded-lg bg-background/50">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${
                    product.status === OrderStatus.PENDIENTE ? 'bg-yellow-500/10' :
                    product.status === OrderStatus.ENVIADA ? 'bg-blue-500/10' :
                    product.status === OrderStatus.COMPLETADA ? 'bg-green-500/10' :
                    'bg-red-500/10'
                  }`}>
                    <ShoppingBag className={`h-5 w-5 ${
                      product.status === OrderStatus.PENDIENTE ? 'text-yellow-500' :
                      product.status === OrderStatus.ENVIADA ? 'text-blue-500' :
                      product.status === OrderStatus.COMPLETADA ? 'text-green-500' :
                      'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Cantidad: {product.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{product.amount}</p>
                  <p className="text-xs text-green-500">{product.trend}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Price Calculator Modal */}
      <PriceCalculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />

      {/* Produce Calculator Modal */}
      <ProduceCalculator 
        isOpen={isProduceCalculatorOpen} 
        onClose={() => setIsProduceCalculatorOpen(false)} 
      />

      {/* Data Import/Export Modal */}
      <DataImportExport
        isOpen={isDataImportExportOpen}
        onClose={() => setIsDataImportExportOpen(false)}
      />
    </div>
  );
};

export default DashboardPage; 