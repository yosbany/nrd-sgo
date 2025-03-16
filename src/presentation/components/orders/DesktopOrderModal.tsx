import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { PlusCircle, Copy, Calculator } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Select } from '@/presentation/components/ui/select';
import { Button } from '@/presentation/components/ui/button';
import { Supplier } from '@/domain/models/supplier.model';
import { Customer } from '@/domain/models/customer.model';
import { Worker } from '@/domain/models/worker.model';
import { CustomerOrderServiceImpl } from '@/domain/services/customer-order.service.impl';
import { PurchaseOrderServiceImpl } from '@/domain/services/purchase-order.service.impl';
import { ProductionOrderServiceImpl } from '@/domain/services/production-order.service.impl';
import { toast } from 'sonner';

type OrderType = 'customer' | 'purchase' | 'production';

interface DesktopOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreateEmpty: () => void;
  onCreateFromCopy: (orderId: string) => void;
  onCreateCalculated: (entityId: string) => void;
  orderType: OrderType;
  suppliers?: Supplier[];
  customers?: Customer[];
  workers?: Worker[];
}

type OrderCreationType = 'empty' | 'copy' | 'calculated' | null;

export function DesktopOrderModal({
  open,
  onClose,
  onCreateEmpty,
  onCreateFromCopy,
  onCreateCalculated,
  orderType,
  suppliers = [],
  customers = [],
  workers = []
}: DesktopOrderModalProps) {
  const [selectedType, setSelectedType] = React.useState<OrderCreationType>(null);
  const [orderId, setOrderId] = React.useState('');
  const [entityId, setEntityId] = React.useState('');
  const [isValidating, setIsValidating] = React.useState(false);

  const handleCreate = async () => {
    switch (selectedType) {
      case 'empty':
        onCreateEmpty();
        handleClose();
        break;
      case 'copy':
        if (orderId) {
          setIsValidating(true);
          try {
            // Validar que la orden existe antes de cerrar el modal
            const service = orderType === 'customer' 
              ? new CustomerOrderServiceImpl()
              : orderType === 'purchase'
                ? new PurchaseOrderServiceImpl()
                : new ProductionOrderServiceImpl();

            const orderExists = await service.findByNro(orderId);
            if (!orderExists) {
              toast.error('La orden no existe');
              return;
            }

            onCreateFromCopy(orderId);
            handleClose();
          } catch (err) {
            toast.error('Error al validar la orden: ' + (err as Error).message);
          } finally {
            setIsValidating(false);
          }
        }
        break;
      case 'calculated':
        if (entityId) {
          onCreateCalculated(entityId);
          handleClose();
        }
        break;
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setOrderId('');
    setEntityId('');
    onClose();
  };

  // Format current date
  const currentDate = new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Nueva Orden</DialogTitle>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </DialogHeader>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <button
              className={`aspect-square rounded-lg transition-colors flex flex-col items-center justify-center gap-3 ${
                selectedType === 'empty' 
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              onClick={() => {
                if (selectedType === 'empty') {
                  setSelectedType(null);
                } else {
                  setSelectedType('empty');
                  onCreateEmpty();
                }
              }}
            >
              <PlusCircle className="h-10 w-10" />
              <span className="font-medium text-lg">Vacía</span>
            </button>

            <button
              className={`aspect-square rounded-lg transition-colors flex flex-col items-center justify-center gap-3 ${
                selectedType === 'copy'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
              }`}
              onClick={() => setSelectedType(selectedType === 'copy' ? null : 'copy')}
            >
              <Copy className="h-10 w-10" />
              <span className="font-medium text-lg">Copiada</span>
            </button>

            <button
              className={`aspect-square rounded-lg transition-colors flex flex-col items-center justify-center gap-3 ${
                selectedType === 'calculated'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
              onClick={() => setSelectedType(selectedType === 'calculated' ? null : 'calculated')}
            >
              <Calculator className="h-10 w-10" />
              <span className="font-medium text-lg">Calculada</span>
            </button>
          </div>

          {selectedType === 'copy' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Orden</label>
                <Input
                  placeholder="Ingrese el número de la orden a copiar"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button
                variant="primary"
                className="w-full h-11"
                onClick={handleCreate}
                disabled={!orderId || isValidating}
              >
                {isValidating ? 'Validando...' : 'Copiar Orden'}
              </Button>
            </div>
          )}

          {selectedType === 'calculated' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {orderType === 'customer'
                    ? 'Cliente'
                    : orderType === 'purchase'
                    ? 'Proveedor'
                    : 'Trabajador'}
                </label>
                <Select
                  placeholder="Seleccione una opción"
                  value={entityId}
                  onChange={setEntityId}
                  options={orderType === 'customer' 
                    ? customers.map(customer => ({
                        value: customer.id || '',
                        label: customer.name
                      }))
                    : orderType === 'purchase'
                      ? suppliers.map(supplier => ({
                          value: supplier.id || '',
                          label: supplier.commercialName
                        }))
                      : workers.map(worker => ({
                          value: worker.id || '',
                          label: worker.name
                        }))
                  }
                />
              </div>
              <Button
                variant="primary"
                className="w-full h-11"
                onClick={handleCreate}
                disabled={!entityId}
              >
                Calcular Orden
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 