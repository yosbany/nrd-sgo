import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { ProductionOrder } from '@/domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '@/domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '@/domain/services/worker.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderStatusLabel, getStatusColor } from '@/domain/models/order-status.enum';

export const MobileProductionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<ProductionOrder | null>(null);
  const [workers, setWorkers] = React.useState<Record<string, string>>({});
  const [recipes, setRecipes] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        const orderService = new ProductionOrderServiceImpl();
        const workerService = new WorkerServiceImpl();
        const recipeService = new RecipeServiceImpl();

        const [orderData, workersData, recipesData] = await Promise.all([
          orderService.findById(id),
          workerService.findAll(),
          recipeService.findAll()
        ]);

        setOrder(orderData);
        setWorkers(workersData.reduce((acc, worker) => ({
          ...acc,
          [worker.id]: worker.name
        }), {}));
        setRecipes(recipesData.reduce((acc, recipe) => ({
          ...acc,
          [recipe.id]: recipe.name
        }), {}));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Orden no encontrada</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Estado</span>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {OrderStatusLabel[order.status]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha de Producción</span>
            <span>{formatDate(order.orderDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Responsable</span>
            <span>{workers[order.responsibleWorkerId] || 'No asignado'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recetas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.recipes?.map((recipe, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                <div className="space-y-1">
                  <div className="font-medium">
                    {recipes[recipe.recipeId] || 'Receta no encontrada'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cantidad: {recipe.quantity}
                  </div>
                </div>
              </div>
            ))}
            {(!order.recipes || order.recipes.length === 0) && (
              <p className="text-muted-foreground text-center py-4">
                No hay recetas asignadas
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 