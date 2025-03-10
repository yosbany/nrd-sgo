import { FC } from 'react';
import {
  ShoppingCart, Package, DollarSign, Factory,
  Clock, Calculator, Apple, RefreshCcw,
  ShoppingBag, Truck, Users, Building2
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';

const DashboardPage: FC = () => {
  const tools = [
    { name: 'Calculadora de Precios', icon: Calculator, color: 'bg-blue-500/10 text-blue-500' },
    { name: 'Frutas y Verduras', icon: Apple, color: 'bg-green-500/10 text-green-500' },
    { name: 'Actualización de Precios', icon: RefreshCcw, color: 'bg-purple-500/10 text-purple-500' },
  ];

  const modelStats = [
    { 
      name: 'Total Productos', 
      value: '1,234', 
      icon: Package,
      color: 'bg-blue-500/10 text-blue-500',
      description: 'Productos registrados'
    },
    { 
      name: 'Total Pedidos', 
      value: '456', 
      icon: ShoppingBag,
      color: 'bg-green-500/10 text-green-500',
      description: 'Pedidos procesados'
    },
    { 
      name: 'Total Compras', 
      value: '789', 
      icon: ShoppingCart,
      color: 'bg-purple-500/10 text-purple-500',
      description: 'Compras realizadas'
    },
    { 
      name: 'Total Proveedores', 
      value: '45', 
      icon: Truck,
      color: 'bg-orange-500/10 text-orange-500',
      description: 'Proveedores activos'
    },
    { 
      name: 'Total Clientes', 
      value: '328', 
      icon: Users,
      color: 'bg-pink-500/10 text-pink-500',
      description: 'Clientes registrados'
    },
    { 
      name: 'Total Empresas', 
      value: '67', 
      icon: Building2,
      color: 'bg-indigo-500/10 text-indigo-500',
      description: 'Empresas asociadas'
    }
  ];

  const topProducts = {
    purchased: [
      { name: 'Tomate', quantity: '500 kg', amount: '$15,000', trend: '+12%' },
      { name: 'Cebolla', quantity: '300 kg', amount: '$9,000', trend: '+8%' },
      { name: 'Papa', quantity: '800 kg', amount: '$12,000', trend: '+15%' },
    ],
    produced: [
      { name: 'Ensalada Mixta', quantity: '200 u', amount: '$20,000', trend: '+25%' },
      { name: 'Sopa de Verduras', quantity: '150 u', amount: '$18,000', trend: '+10%' },
      { name: 'Puré de Papa', quantity: '180 u', amount: '$15,000', trend: '+18%' },
    ],
    ordered: [
      { name: 'Ensalada César', quantity: '180 u', amount: '$21,600', trend: '+30%' },
      { name: 'Vegetales Mixtos', quantity: '150 u', amount: '$13,500', trend: '+20%' },
      { name: 'Papas Fritas', quantity: '250 u', amount: '$17,500', trend: '+22%' },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Tools Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.name} className="backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-colors cursor-pointer">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {modelStats.map((stat) => (
          <Card key={stat.name} className="backdrop-blur-sm bg-card/80">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-lg ${stat.color} mb-1`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div>
                  <p className="text-sm font-medium leading-none">{stat.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-none">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Productos más Comprados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.purchased.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity}</p>
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
            <CardTitle className="text-xl font-semibold">Productos más Producidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.produced.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Factory className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity}</p>
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
            <CardTitle className="text-xl font-semibold">Productos más Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.ordered.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity}</p>
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
    </div>
  );
};

export default DashboardPage; 