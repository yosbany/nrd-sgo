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
import { ProductionOrder } from '@/domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '@/domain/services/production-order.service.impl';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { WorkerServiceImpl } from '@/domain/services/worker.service.impl';
import { OrderActions } from '@/presentation/components/OrderActions';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { OrderStatusLabel, getStatusColor } from '@/domain/enums/order-status.enum';
import { NewOrderModal } from '@/presentation/components/orders/NewOrderModal';

export const MobileProduction: React.FC = () => {
  const [orders, setOrders] = React.useState<ProductionOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [workers, setWorkers] = React.useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [recipes, setRecipes] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const orderService = new ProductionOrderServiceImpl();
  const workerService = new WorkerServiceImpl();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, workersData, recipesData] = await Promise.all([
        orderService.findAll(),
        workerService.findAll(),
        new RecipeServiceImpl().findAll()
      ]);
      // Ordenar por fecha de más reciente a más antigua
      const sortedOrders = ordersData.sort((a, b) => {
        const dateA = a.orderDate instanceof Date ? a.orderDate : new Date(a.orderDate);
        const dateB = b.orderDate instanceof Date ? b.orderDate : new Date(b.orderDate);
        return dateB.getTime() - dateA.getTime();
      });
      setOrders(sortedOrders);
      setWorkers(workersData);
      setRecipes(recipesData);
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
        // Handle Firebase Timestamp
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
    const start = id.slice(0, 3);
    const end = id.slice(-2);
    return `${start}${end}`.toUpperCase();
  };

  const handleAction = (action: 'view' | 'edit' | 'delete', order: ProductionOrder) => {
    const dialogElement = document.querySelector('[role="dialog"]');
    if (dialogElement) {
      const closeButton = dialogElement.querySelector('button[data-state="open"]');
      if (closeButton && closeButton instanceof HTMLButtonElement) {
        closeButton.click();
      }
    }

    switch (action) {
      case 'view':
        navigate(`/mobile/production/${order.id}/view`);
        break;
      case 'edit':
        navigate(`/mobile/production/${order.id}/edit`);
        break;
      case 'delete':
        navigate(`/mobile/production/${order.id}/delete`);
        break;
    }
  };

  const handleCreateEmpty = () => {
    navigate('/mobile/production/new');
  };

  const handleCreateFromCopy = (orderId: string) => {
    navigate(`/mobile/production/new?copy=${orderId}`);
  };

  const handleCreateCalculated = (workerId: string) => {
    navigate(`/mobile/production/new?calculate=${workerId}`);
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
          Nueva Orden de Producción
        </Button>

        <NewOrderModal
          open={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          onCreateEmpty={handleCreateEmpty}
          onCreateFromCopy={handleCreateFromCopy}
          onCreateCalculated={handleCreateCalculated}
          orderType="production"
          workers={workers}
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
                          <span className="font-medium">Producción #{order.nro}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(order.orderDate)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {OrderStatusLabel[order.status]}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Responsable:</span>
                          <span className="font-medium">
                            {workers.find(w => w.id === order.responsibleWorkerId)?.name || 'No asignado'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Recetas:</span>
                          <span className="font-medium">{order.recipes?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">
                            {order.recipes?.reduce((sum, recipe) => sum + (recipe.quantity || 0), 0) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    <div className="flex flex-col gap-1">
                      <span>Producción #{order.nro}</span>
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
                  type="production"
                  workerName={workers.find(w => w.id === order.responsibleWorkerId)?.name}
                  workerPhone={workers.find(w => w.id === order.responsibleWorkerId)?.phone}
                  recipes={recipes}
                />
              </DialogContent>
            </Dialog>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay órdenes de producción</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 