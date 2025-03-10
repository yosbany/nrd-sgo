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
import { Plus, Eye, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { OrderStatus } from '@/domain/models/base.entity';
import { Supplier } from '@/domain/models/supplier.model';

export const MobilePurchases: React.FC = () => {
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();
  const orderService = new PurchaseOrderServiceImpl();

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const [ordersData, suppliersData] = await Promise.all([
        orderService.findAll(),
        new SupplierServiceImpl().findAll()
      ]);
      
      // Ordenar por fecha de más reciente a más antigua
      const sortedOrders = ordersData.sort((a, b) => {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      });
      
      setOrders(sortedOrders);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, 'PPP', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-500 bg-yellow-500/10';
      case OrderStatus.COMPLETED:
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.COMPLETED:
        return 'Completado';
      default:
        return status;
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
          onClick={() => navigate('/mobile/purchases/new')}
        >
          <Plus className="h-4 w-4" />
          Nueva Orden de Compra
        </Button>

        <div className="space-y-4">
          {orders.map((order) => (
            <Dialog key={order.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium">Orden #{getShortId(order.id)}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(order.orderDate)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
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
                  <DialogTitle>Orden #{getShortId(order.id)}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => handleAction('view', order)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalles
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => handleAction('edit', order)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={() => {
                      const text = `*Orden de Compra #${getShortId(order.id)}*\n` +
                        `Fecha: ${formatDate(order.orderDate)}\n` +
                        `Estado: ${getStatusLabel(order.status)}\n` +
                        `Proveedor: ${getSupplierName(order.supplierId)}\n` +
                        `Productos: ${order.products?.length || 0}\n` +
                        `Total: ${order.totalItems || 0}`;
                      
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar por WhatsApp
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full flex items-center gap-2"
                    onClick={() => handleAction('delete', order)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
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