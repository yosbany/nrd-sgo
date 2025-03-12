import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { ProductionOrder } from '../../../domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '../../../domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { OrderStatus } from '@/domain/models/order-status.enum';
import { Recipe } from '@/domain/models/recipe.model';

export function ProductionOrderList() {
  const orderService = new ProductionOrderServiceImpl();
  const workerService = new WorkerServiceImpl();
  const recipeService = new RecipeServiceImpl();
  const unitService = new UnitServiceImpl();

  const [workers, setWorkers] = React.useState<Record<string, string>>({});
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [workersData, recipesData, unitsData] = await Promise.all([
          workerService.findAll(),
          recipeService.findAll(),
          unitService.findAll()
        ]);

        const workersMap = workersData.reduce((acc, worker) => {
          acc[worker.id] = worker.name;
          return acc;
        }, {} as Record<string, string>);

        const unitsMap = unitsData.reduce((acc, unit) => {
          acc[unit.id] = unit.name;
          return acc;
        }, {} as Record<string, string>);

        setWorkers(workersMap);
        setRecipes(recipesData);
        setUnits(unitsMap);
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
      render: (item: ProductionOrder) => {
        const firstRecipe = item.recipes?.[0];
        if (firstRecipe) {
          const recipe = recipes.find(r => r.id === firstRecipe.recipeId);
          if (recipe && recipe.yieldUnitId) {
            return `${item.totalItems} ${units[recipe.yieldUnitId] || 'Unidad no encontrada'}`;
          }
        }
        return item.totalItems;
      },
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof ProductionOrder,
      type: 'tag' as const,
      tags: [
        { 
          value: OrderStatus.PENDIENTE, 
          label: 'Pendiente', 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.ENVIADA, 
          label: 'Enviada', 
          color: 'info' as const 
        },
        { 
          value: OrderStatus.COMPLETADA, 
          label: 'Completada', 
          color: 'success' as const 
        },
        { 
          value: OrderStatus.CANCELADA, 
          label: 'Cancelada', 
          color: 'danger' as const 
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
      units={units}
    />
  );
} 