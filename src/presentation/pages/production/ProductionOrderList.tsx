import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { ProductionOrder,  } from '../../../domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '../../../domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';

export function ProductionOrderList() {
  const orderService = new ProductionOrderServiceImpl();
  const workerService = new WorkerServiceImpl();
  const [workers, setWorkers] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadWorkers = async () => {
      const workersData = await workerService.findAll();
      const workersMap = workersData.reduce((acc, worker) => {
        acc[worker.id] = worker.name;
        return acc;
      }, {} as Record<string, string>);
      setWorkers(workersMap);
    };
    loadWorkers();
  }, []);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.COMPLETED:
        return 'Completada';
      default:
        return status;
    }
  };

  const columns = [
    {
      header: 'Trabajador Responsable',
      accessor: 'responsibleWorkerId' as keyof ProductionOrder,
      render: (item: ProductionOrder) =>
        workers[item.responsibleWorkerId] || 'Trabajador no encontrado',
    },
    {
      header: 'Fecha de Producción',
      accessor: 'productionDate' as keyof ProductionOrder,
      render: (item: ProductionOrder) =>
        new Date(item.orderDate).toLocaleDateString(),
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof ProductionOrder,
      render: (item: ProductionOrder) => getStatusLabel(item.status),
    },
    {
      header: 'Recetas',
      accessor: 'recipes' as keyof ProductionOrder,
      render: (item: ProductionOrder) => item.recipes.length,
    },
  ];

  return (
    <GenericList<ProductionOrder>
      columns={columns}
      title="Órdenes de Producción"
      addPath="/production-orders/new"
      backPath="/production-orders"
      service={orderService}
    />
  );
} 