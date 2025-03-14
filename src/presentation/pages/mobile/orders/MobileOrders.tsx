import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import { CustomerOrder } from '@/domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '@/domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '@/domain/services/customer.service.impl';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { OrderActions } from '@/presentation/components/OrderActions';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { OrderStatusLabel, getStatusColor } from '@/domain/enums/order-status.enum';
import { NewOrderModal } from '@/presentation/components/orders/NewOrderModal';
import { SupplierServiceImpl } from '@/domain/services/supplier.service.impl';
import { Supplier } from '@/domain/models/supplier.model';

export const MobileOrders: React.FC = () => {
  const [orders, setOrders] = React.useState<CustomerOrder[]>([]);
  const [customers, setCustomers] = React.useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [products, setProducts] = React.useState<Array<{ id: string; name: string }>>([]);
  const [recipes, setRecipes] = React.useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const orderService = new CustomerOrderServiceImpl();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, customersData, productsData, recipesData, suppliersData] = await Promise.all([
        orderService.findAll(),
        new CustomerServiceImpl().findAll(),
        new ProductServiceImpl().findAll(),
        new RecipeServiceImpl().findAll(),
        new SupplierServiceImpl().findAll()
      ]);
      
      // Ordenar por fecha de más reciente a más antigua
      const sortedOrders = ordersData.sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();
        return dateB - dateA;
      });
      
      setOrders(sortedOrders);
      setCustomers(customersData);
      setProducts(productsData);
      setRecipes(recipesData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string | { seconds: number, nanoseconds: number }) => {
    try {
      if (!date) return 'Fecha no disponible';

      let dateObj: Date;

      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = parseISO(date);
      } else if (typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date(date.seconds * 1000);
      } else {
        throw new Error('Invalid date format');
      }

      if (!isNaN(dateObj.getTime())) {
        return format(dateObj, 'PPP', { locale: es });
      }
      
      return 'Fecha inválida';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  const getShortId = (id: string) => {
    if (!id) return '';
    // Tomar los primeros 3 y últimos 2 caracteres
    const start = id.slice(0, 3);
    const end = id.slice(-2);
    return `${start}${end}`.toUpperCase();
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'No asignado';
  };

  const handleAction = (action: 'view' | 'edit' | 'delete', order: CustomerOrder) => {
    const dialogElement = document.querySelector('[role="dialog"]');
    if (dialogElement) {
      const closeButton = dialogElement.querySelector('button[data-state="open"]');
      if (closeButton && closeButton instanceof HTMLButtonElement) {
        closeButton.click();
      }
    }

    switch (action) {
      case 'view':
        navigate(`/mobile/orders/${order.id}/view`);
        break;
      case 'edit':
        navigate(`/mobile/orders/${order.id}/edit`);
        break;
      case 'delete':
        navigate(`/mobile/orders/${order.id}/delete`);
        break;
    }
  };

  const handleCreateEmpty = () => {
    navigate('/mobile/orders/new');
  };

  const handleCreateFromCopy = (orderId: string) => {
    navigate(`/mobile/orders/new?copy=${orderId}`);
  };

  const handleCreateCalculated = (supplierId: string) => {
    navigate(`/mobile/orders/new?calculate=${supplierId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      <div className="p-4 space-y-4">
        <Button
          className="w-full flex items-center gap-2"
          onClick={() => setIsNewOrderModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo Pedido
        </Button>

        <NewOrderModal
          open={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          onCreateEmpty={handleCreateEmpty}
          onCreateFromCopy={handleCreateFromCopy}
          onCreateCalculated={handleCreateCalculated}
          orderType="customer"
          customers={customers}
        />

        <div className="space-y-4">
          {orders.map((order) => (
            <Dialog key={order.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium">Pedido #{getShortId(order.id)}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(order.orderDate)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {OrderStatusLabel[order.status]}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cliente: {getCustomerName(order.customerId)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    <div className="flex flex-col gap-1">
                      <span>Pedido #{getShortId(order.id)}</span>
                      <span className="text-sm font-normal text-gray-500">
                        {formatDate(order.orderDate)}
                      </span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <OrderActions
                  onView={() => handleAction('view', order)}
                  onEdit={() => handleAction('edit', order)}
                  onDelete={() => handleAction('delete', order)}
                  onShare={() => {}}
                  order={order}
                  type="customer"
                  customerName={getCustomerName(order.customerId)}
                  customerPhone={customers.find(c => c.id === order.customerId)?.phone}
                  products={products}
                  recipes={recipes}
                />
              </DialogContent>
            </Dialog>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay pedidos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 