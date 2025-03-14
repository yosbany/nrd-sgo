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
import { PurchaseOrder } from '@/domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '@/domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '@/domain/services/supplier.service.impl';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Supplier } from '@/domain/models/supplier.model';
import { OrderActions } from '@/presentation/components/OrderActions';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { OrderStatusLabel, getStatusColor } from '@/domain/enums/order-status.enum';
import { NewOrderModal } from '@/presentation/components/orders/NewOrderModal';

export const MobilePurchases: React.FC = () => {
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = React.useState<Array<Supplier & { phone?: string }>>([]);
  const [products, setProducts] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = React.useState(false);
  const navigate = useNavigate();
  const orderService = new PurchaseOrderServiceImpl();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, suppliersData, productsData] = await Promise.all([
        orderService.findAll(),
        new SupplierServiceImpl().findAll(),
        new ProductServiceImpl().findAll()
      ]);
      
      // Ordenar por fecha de más reciente a más antigua
      const sortedOrders = ordersData.sort((a, b) => {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      });
      
      setOrders(sortedOrders);
      setSuppliers(suppliersData);
      setProducts(productsData);
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

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.commercialName || 'No asignado';
  };

  const handleAction = (action: 'view' | 'edit' | 'delete', order: PurchaseOrder) => {
    const dialogElement = document.querySelector('[role="dialog"]');
    if (dialogElement) {
      const closeButton = dialogElement.querySelector('button[data-state="open"]');
      if (closeButton && closeButton instanceof HTMLButtonElement) {
        closeButton.click();
      }
    }

    switch (action) {
      case 'view':
        navigate(`/mobile/purchases/${order.id}/view`);
        break;
      case 'edit':
        navigate(`/mobile/purchases/${order.id}/edit`);
        break;
      case 'delete':
        navigate(`/mobile/purchases/${order.id}/delete`);
        break;
    }
  };

  const handleCreateEmpty = () => {
    navigate('/mobile/purchases/new');
  };

  const handleCreateFromCopy = (orderId: string) => {
    navigate(`/mobile/purchases/new?copy=${orderId}`);
  };

  const handleCreateCalculated = (supplierId: string) => {
    navigate(`/mobile/purchases/new?calculate=${supplierId}`);
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
          Nueva Orden de Compra
        </Button>

        <NewOrderModal
          open={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          onCreateEmpty={handleCreateEmpty}
          onCreateFromCopy={handleCreateFromCopy}
          onCreateCalculated={handleCreateCalculated}
          orderType="purchase"
          suppliers={suppliers}
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
                          <span className="font-medium">Compra #{getShortId(order.id)}</span>
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
                          <span className="text-muted-foreground">Proveedor:</span>
                          <span className="font-medium">{getSupplierName(order.supplierId)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Productos:</span>
                          <span className="font-medium">{order.products?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">{order.totalItems || 0}</span>
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
                      <span>Compra #{getShortId(order.id)}</span>
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
                  type="purchase"
                  supplierName={getSupplierName(order.supplierId)}
                  supplierPhone={suppliers.find(s => s.id === order.supplierId)?.phone}
                  products={products}
                />
              </DialogContent>
            </Dialog>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay órdenes de compra</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 