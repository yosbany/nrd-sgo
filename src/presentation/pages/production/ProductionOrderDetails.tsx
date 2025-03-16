import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { ProductionOrder, RecipeItems } from '../../../domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '../../../domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '@/domain/services/worker.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { OrderStatusLabel } from '@/domain/enums/order-status.enum';

export function ProductionOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const orderService = new ProductionOrderServiceImpl();
  const workerService = new WorkerServiceImpl();
  const recipeService = new RecipeServiceImpl();
  const [workers, setWorkers] = React.useState<Record<string, string>>({});
  const [recipes, setRecipes] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadData = async () => {
      const [workersData, recipesData] = await Promise.all([
        workerService.findAll(),
        recipeService.findAll()
      ]);

      const workersMap = workersData.reduce((acc, worker) => {
        if (worker.id && worker.name) {
          acc[worker.id] = worker.name;
        }
        return acc;
      }, {} as Record<string, string>);

      const recipesMap = recipesData.reduce((acc, recipe) => {
        if (recipe.id && recipe.name) {
          acc[recipe.id] = recipe.name;
        }
        return acc;
      }, {} as Record<string, string>);

      setWorkers(workersMap);
      setRecipes(recipesMap);
    };
    loadData();
  }, []);

  const renderRecipes = (orderRecipes: ProductionOrder['recipes']) => {
    const columns = [
      {
        header: 'Receta',
        accessor: (recipe: RecipeItems) => {
          return <div className="font-medium">{recipes[recipe.recipeId] || 'Receta no encontrada'}</div>;
        }
      },
      {
        header: 'Cantidad',
        accessor: (recipe: RecipeItems) => {
          return `${recipe.quantity}`;
        }
      }
    ];

    return <ArrayTable data={orderRecipes} columns={columns} emptyMessage="No hay recetas" />;
  };

  const renderRatios = (ratios: ProductionOrder['ratios']) => {
    if (!ratios?.length) return 'No hay ratios definidos';
    return (
      <table className="w-full">
        <tbody>
          {ratios.map((ratio, index) => (
            <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle">
                <div className="font-medium">
                  {ratio.name}
                </div>
              </td>
              <td className="p-4 align-middle text-muted-foreground">
                Valor: {ratio.value || 'No especificado'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const getFields = (order: ProductionOrder) => [
    { label: 'Trabajador Responsable', value: workers[order.responsibleWorkerId] || 'Trabajador no encontrado' },
    { label: 'Estado', value: OrderStatusLabel[order.status] },
    { label: 'Fecha', value: new Date(order.orderDate).toLocaleDateString() },
    { label: 'Total de Recetas', value: order.totalProducts },
    { label: 'Total de Items', value: order.totalItems },
    { label: 'Recetas', value: renderRecipes(order.recipes) },
    { label: 'Ratios de Producción', value: renderRatios(order.ratios) }
  ];

  if (!id) return null;

  return (
    <GenericDetails<ProductionOrder>
      title="Orden de Producción"
      fields={getFields}
      editPath={`/production-orders/${id}/edit`}
      backPath="/production-orders"
      service={orderService}
      id={id}
    />
  );
}