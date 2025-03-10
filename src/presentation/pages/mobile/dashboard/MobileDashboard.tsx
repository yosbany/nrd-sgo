import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaClipboardList, FaIndustry } from 'react-icons/fa';
import { CustomerOrderServiceImpl } from '@/domain/services/customer-order.service.impl';
import { ProductionOrderServiceImpl } from '@/domain/services/production-order.service.impl';
import { PurchaseOrderServiceImpl } from '@/domain/services/purchase-order.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';


export const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orderCounts, setOrderCounts] = React.useState({
    purchases: 0,
    customerOrders: 0,
    production: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadOrderCounts();
  }, []);

  const loadOrderCounts = async () => {
    try {
      const customerOrderService = new CustomerOrderServiceImpl();
      const productionOrderService = new ProductionOrderServiceImpl();
      const purchaseOrderService = new PurchaseOrderServiceImpl();

      const [customerOrders, productionOrders, purchaseOrders] = await Promise.all([
        customerOrderService.findByStatus(OrderStatus.PENDING),
        productionOrderService.findByStatus(OrderStatus.PENDING),
        purchaseOrderService.findByStatus(OrderStatus.PENDING)
      ]);

      setOrderCounts({
        purchases: purchaseOrders.length,
        customerOrders: customerOrders.length,
        production: productionOrders.length
      });
    } catch (error) {
      console.error('Error loading order counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Compras',
      icon: FaShoppingCart,
      path: '/mobile/purchases',
      description: 'Gestión de órdenes de compra',
      count: orderCounts.purchases,
      status: 'Pendientes'
    },
    {
      title: 'Pedidos',
      icon: FaClipboardList,
      path: '/mobile/orders',
      description: 'Gestión de pedidos de clientes',
      count: orderCounts.customerOrders,
      status: 'Pendientes'
    },
    {
      title: 'Producción',
      icon: FaIndustry,
      path: '/mobile/production',
      description: 'Control de órdenes de producción',
      count: orderCounts.production,
      status: 'En Progreso'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {menuItems.map((item, index) => (
          <Card
            key={index}
            className="hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  {React.createElement(item.icon, { className: "w-5 h-5 text-primary" })}
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </div>
              {item.count > 0 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <span className="text-sm font-medium text-primary">{item.count}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.count > 0 && (
                  <p className="text-sm font-medium text-primary">
                    {item.count} {item.status}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 