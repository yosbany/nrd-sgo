import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericList } from '../../components/common/GenericList';
import { ProductionOrder } from '../../../domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '../../../domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { Recipe } from '@/domain/models/recipe.model';
import { DesktopOrderModal } from '@/presentation/components/orders/DesktopOrderModal';
import { Worker } from '@/domain/models/worker.model';
import { PrintOrder } from '@/presentation/components/PrintOrder';
import { createRoot } from 'react-dom/client';
import { formatWhatsAppMessage, sendWhatsAppMessage } from '@/presentation/components/orders/WhatsAppMessage';
import { ConfirmDialog } from '@/presentation/components/common/ConfirmDialog';

export function ProductionOrderList() {
  const navigate = useNavigate();
  const orderService = new ProductionOrderServiceImpl();
  const workerService = new WorkerServiceImpl();
  const recipeService = new RecipeServiceImpl();
  const unitService = new UnitServiceImpl();

  const [workers, setWorkers] = React.useState<Record<string, string>>({});
  const [workersData, setWorkersData] = React.useState<Worker[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Record<string, string>>({});
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = React.useState(false);
  const [noPhoneDialogOpen, setNoPhoneDialogOpen] = React.useState(false);
  const [currentOrder, setCurrentOrder] = React.useState<ProductionOrder | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [workersData, recipesData, unitsData] = await Promise.all([
          workerService.findAll(),
          recipeService.findAll(),
          unitService.findAll()
        ]);

        const workersMap = workersData.reduce((acc, worker) => {
          if (worker.id) acc[worker.id] = worker.name;
          return acc;
        }, {} as Record<string, string>);

        const unitsMap = unitsData.reduce((acc, unit) => {
          if (unit.id) acc[unit.id] = unit.name;
          return acc;
        }, {} as Record<string, string>);

        setWorkers(workersMap);
        setWorkersData(workersData);
        setRecipes(recipesData);
        setUnits(unitsMap);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleCreateEmpty = () => {
    navigate('/production-orders/new');
  };

  const handleCreateFromCopy = (orderId: string) => {
    navigate(`/production-orders/new?copy=${orderId}`);
  };

  const handleCreateCalculated = (workerId: string) => {
    navigate(`/production-orders/new?calculate=${workerId}`);
  };

  const handlePrint = (order: ProductionOrder) => {
    const items = order.recipes.map(recipe => {
      const recipeData = recipes.find(r => r.id === recipe.recipeId);
      const unit = units[recipeData?.yieldUnitId || ''] || 'Unidad';
      return {
        quantity: recipe.quantity,
        unit,
        description: recipeData?.name || 'Receta no encontrada'
      };
    });

    const worker = workersData.find(w => w.id === order.responsibleWorkerId);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write('<html><head><title>Orden de Producción</title></head><body>');
      printWindow.document.write('<div id="print-root"></div>');
      printWindow.document.write('</body></html>');
      
      const root = printWindow.document.getElementById('print-root');
      if (root) {
        const reactRoot = createRoot(root);
        reactRoot.render(
          <PrintOrder
            orderNumber={order.nro!}
            date={new Date(order.orderDate)}
            contactType="empleado"
            contactName={worker?.name || 'Empleado no encontrado'}
            items={items}
          />
        );
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleWhatsApp = (order: ProductionOrder) => {
    const items = order.recipes.map(recipe => {
      const recipeData = recipes.find(r => r.id === recipe.recipeId);
      const unit = units[recipeData?.yieldUnitId || ''] || 'Unidad';
      return {
        quantity: recipe.quantity,
        unit,
        description: recipeData?.name || 'Receta no encontrada'
      };
    });

    const worker = workersData.find(w => w.id === order.responsibleWorkerId);
    
    if (!worker?.phone) {
      setCurrentOrder(order);
      setNoPhoneDialogOpen(true);
      return;
    }

    const message = formatWhatsAppMessage({
      orderNumber: order.nro || '',
      date: new Date(order.orderDate),
      contactName: worker.name,
      items,
      totals: {
        products: order.totalProducts || 0,
        items: order.totalItems || 0
      }
    });

    sendWhatsAppMessage(worker.phone, message);
  };

  const columns = [
    {
      header: 'Trabajador',
      accessor: 'responsibleWorkerId' as keyof ProductionOrder,
      render: (item: ProductionOrder) => {
        const workerId = item.responsibleWorkerId;
        return workerId && workers[workerId] ? workers[workerId] : 'Trabajador no encontrado';
      },
    },
    {
      header: 'Fecha',
      accessor: 'orderDate' as keyof ProductionOrder,
      type: 'date' as const,
    },
    {
      header: 'Totales',
      accessor: 'totalProducts' as keyof ProductionOrder,
      render: (item: ProductionOrder) => {
        const totalProducts = item.totalProducts || 0;
        const totalItems = item.totalItems || 0;
        return `${totalProducts} / ${totalItems}`;
      },
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof ProductionOrder,
      type: 'tag' as const,
      tags: [
        { 
          value: OrderStatus.PENDIENTE, 
          label: OrderStatus.PENDIENTE, 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.ENVIADA, 
          label: OrderStatus.ENVIADA, 
          color: 'info' as const 
        },
        { 
          value: OrderStatus.COMPLETADA, 
          label: OrderStatus.COMPLETADA, 
          color: 'success' as const 
        },
        { 
          value: OrderStatus.CANCELADA, 
          label: OrderStatus.CANCELADA, 
          color: 'danger' as const 
        }
      ]
    },
  ];

  return (
    <>
      <DesktopOrderModal
        open={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onCreateEmpty={handleCreateEmpty}
        onCreateFromCopy={handleCreateFromCopy}
        onCreateCalculated={handleCreateCalculated}
        orderType="production"
        workers={workersData}
      />

      <ConfirmDialog
        open={noPhoneDialogOpen}
        onOpenChange={setNoPhoneDialogOpen}
        title="No hay teléfono registrado"
        description={`El trabajador ${workersData.find(w => w.id === currentOrder?.responsibleWorkerId)?.name || ''} no tiene número de teléfono registrado. Por favor, actualice los datos del trabajador antes de enviar el mensaje.`}
        onConfirm={() => {
          setNoPhoneDialogOpen(false);
          if (currentOrder?.responsibleWorkerId) {
            navigate(`/workers/${currentOrder.responsibleWorkerId}/edit`);
          }
        }}
        onCancel={() => setNoPhoneDialogOpen(false)}
        confirmText="Editar Trabajador"
        cancelText="Cerrar"
      />

      <GenericList<ProductionOrder>
        columns={columns}
        title="Órdenes de Producción"
        onAddClick={() => setIsNewOrderModalOpen(true)}
        backPath="/production-orders"
        service={orderService}
        type="production"
        onPrint={handlePrint}
        onWhatsApp={handleWhatsApp}
      />
    </>
  );
} 