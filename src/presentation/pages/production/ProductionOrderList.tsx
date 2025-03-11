import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { ProductionOrder } from '../../../domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '../../../domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';
import { Recipe } from '@/domain/models/recipe.model';

export function ProductionOrderList() {
  const orderService = new ProductionOrderServiceImpl();
  const workerService = new WorkerServiceImpl();
  const recipeService = new RecipeServiceImpl();

  const [workers, setWorkers] = React.useState<Record<string, string>>({});
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [workersData, recipesData] = await Promise.all([
          workerService.findAll(),
          recipeService.findAll()
        ]);

        const workersMap = workersData.reduce((acc, worker) => {
          acc[worker.id] = worker.name;
          return acc;
        }, {} as Record<string, string>);

        setWorkers(workersMap);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const columns = [
    {
      header: 'Trabajador',
      accessor: 'responsibleWorkerId' as keyof ProductionOrder,
      render: (item: ProductionOrder) =>
        workers[item.responsibleWorkerId] || 'Trabajador no encontrado',
    },
    {
      header: 'Fecha',
      accessor: 'orderDate' as keyof ProductionOrder,
      type: 'date' as const,
    },
    {
      header: 'Total Recetas',
      accessor: 'totalProducts' as keyof ProductionOrder,
    },
    {
      header: 'Total Items',
      accessor: 'totalItems' as keyof ProductionOrder,
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof ProductionOrder,
      type: 'tag' as const,
      tags: [
        { 
          value: OrderStatus.PENDING, 
          label: 'Pendiente', 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.COMPLETED, 
          label: 'Completada', 
          color: 'success' as const 
        }
      ]
    },
  ];

  return (
    <GenericList<ProductionOrder>
      columns={columns}
      title="Órdenes de Producción"
      addPath="/production-orders/new"
      backPath="/production-orders"
      service={orderService}
      type="production"
      recipes={recipes}
      workerName={workers}
    />
  );
} 