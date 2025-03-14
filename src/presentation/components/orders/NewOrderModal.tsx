import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/presentation/components/ui/dialog';
import { PlusCircle, Copy, Calculator } from 'lucide-react';
import { Input } from '@/presentation/components/ui/input';
import { Select } from '@/presentation/components/ui/select';
import { Button } from '@/presentation/components/ui/button';
import { Supplier } from '@/domain/models/supplier.model';
import { Customer } from '@/domain/models/customer.model';
import { Worker } from '@/domain/models/worker.model';

type OrderType = 'customer' | 'purchase' | 'production';

interface NewOrderModalProps {
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

export function NewOrderModal({
  open,
  onClose,
  onCreateEmpty,
  onCreateFromCopy,
  onCreateCalculated,
  orderType,
  suppliers = [],
  customers = [],
  workers = []
}: NewOrderModalProps) {
  const [selectedType, setSelectedType] = React.useState<OrderCreationType>(null);
  const [orderId, setOrderId] = React.useState('');
  const [entityId, setEntityId] = React.useState('');

  const handleCreate = () => {
    switch (selectedType) {
      case 'empty':
        onCreateEmpty();
        break;
      case 'copy':
        if (orderId) {
          onCreateFromCopy(orderId);
        }
        break;
      case 'calculated':
        if (entityId) {
          onCreateCalculated(entityId);
        }
        break;
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    setOrderId('');
    setEntityId('');
    onClose();
  };

  const getEntitySelectorConfig = () => {
    switch (orderType) {
      case 'customer':
        return {
          label: 'Cliente',
          placeholder: 'Seleccione un cliente',
          options: customers.map(customer => ({
            value: customer.id,
            label: customer.name
          }))
        };
      case 'purchase':
        return {
          label: 'Proveedor',
          placeholder: 'Seleccione un proveedor',
          options: suppliers.map(supplier => ({
            value: supplier.id,
            label: supplier.commercialName
          }))
        };
      case 'production':
        return {
          label: 'Trabajador',
          placeholder: 'Seleccione un trabajador',
          options: workers.map(worker => ({
            value: worker.id,
            label: worker.name
          }))
        };
    }
  };

  // Format current date
  const currentDate = new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const selectorConfig = getEntitySelectorConfig();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Orden: Nueva</DialogTitle>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              className={`aspect-square rounded-lg transition-colors flex flex-col items-center justify-center gap-2 ${
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
              <PlusCircle className="h-8 w-8" />
              <span className="font-medium">Vacía</span>
            </button>

            <button
              className={`aspect-square rounded-lg transition-colors flex flex-col items-center justify-center gap-2 ${
                selectedType === 'copy'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
              }`}
              onClick={() => setSelectedType(selectedType === 'copy' ? null : 'copy')}
            >
              <Copy className="h-8 w-8" />
              <span className="font-medium">Copiada</span>
            </button>

            <button
              className={`aspect-square rounded-lg transition-colors flex flex-col items-center justify-center gap-2 ${
                selectedType === 'calculated'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
              onClick={() => setSelectedType(selectedType === 'calculated' ? null : 'calculated')}
            >
              <Calculator className="h-8 w-8" />
              <span className="font-medium">Calculada</span>
            </button>
          </div>

          {selectedType === 'copy' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Orden</label>
                <Input
                  placeholder="Ingrese el número de la orden a copiar"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleCreate}
                disabled={!orderId}
              >
                Copiar Orden
              </Button>
            </div>
          )}

          {selectedType === 'calculated' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">{selectorConfig.label}</label>
                <Select
                  value={entityId}
                  onChange={(value) => setEntityId(value)}
                  options={selectorConfig.options}
                  placeholder={selectorConfig.placeholder}
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleCreate}
                disabled={!entityId}
              >
                Crear Orden Calculada
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 