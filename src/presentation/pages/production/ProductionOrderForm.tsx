import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { ProductionOrder } from '../../../domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '../../../domain/services/production-order.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { Recipe } from '@/domain/models/recipe.model';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { toast } from 'sonner';

export function ProductionOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Partial<ProductionOrder>>({
    orderDate: new Date(),
    status: OrderStatus.PENDIENTE,
    recipes: []
  });
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const orderService = React.useMemo(() => new ProductionOrderServiceImpl(), []);
  const recipeService = React.useMemo(() => new RecipeServiceImpl(), []);
  const workerService = React.useMemo(() => new WorkerServiceImpl(), []);

  // Cargar datos iniciales
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const recipesData = await recipeService.findAll();

        // Si hay un número de orden para copiar, usar el método copyOrder
        const copyNro = searchParams.get('copy');
        if (copyNro) {
          console.log('Copiando orden existente', { copyNro });
          try {
            const copiedOrder = await orderService.copyOrder(copyNro);
            setOrder(copiedOrder);
            setRecipes(recipesData);
            console.log('Orden copiada exitosamente', { 
              recipesCount: copiedOrder.recipes?.length || 0
            });
          } catch (error) {
            console.error('Error al copiar orden', { error });
            toast.error('La orden no existe o no se puede copiar');
            navigate('/production-orders');
            return;
          }
          return;
        }

        // Si estamos en modo edición, cargar la orden existente
        if (id) {
          console.log('Cargando orden existente', { id });
          try {
            const existingOrder = await orderService.findById(id);
            if (existingOrder) {
              console.log('Orden cargada exitosamente', { 
                recipesCount: existingOrder.recipes?.length || 0
              });
              setOrder(existingOrder);
              setRecipes(recipesData);
            } else {
              console.warn('Orden no encontrada', { id });
              toast.error('La orden no existe');
              navigate('/production-orders');
              return;
            }
          } catch (error) {
            console.error('Error al cargar la orden', { error });
            toast.error('Error al cargar la orden');
            navigate('/production-orders');
            return;
          }
        }

        // Para órdenes normales, cargar todas las recetas
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error al cargar datos iniciales', { error });
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [id, orderService, recipeService, searchParams, navigate]);

  const fields = React.useMemo(() => {
    // Si es una orden copiada, mostrar solo empleado, fecha e items
    if (searchParams.get('copy')) {
      return [
        {
          name: 'responsibleWorkerId',
          label: 'Empleado Responsable',
          type: 'select' as const,
          required: true,
          readOnly: true, // El empleado no se puede cambiar en una orden copiada
          relatedService: {
            service: workerService,
            labelField: 'name',
          }
        },
        {
          name: 'orderDate',
          label: 'Fecha',
          type: 'date' as const,
          required: true,
          readOnly: false,
        },
        {
          name: 'recipes',
          label: 'Recetas',
          type: 'array' as const,
          visible: (): boolean => true,
          arrayConfig: {
            columns: [
              { 
                header: 'Receta', 
                accessor: 'recipeId',
                render: (value: unknown) => {
                  const recipe = recipes.find(r => r.id === value);
                  return recipe?.name || 'Receta no encontrada';
                }
              },
              { header: 'Cantidad', accessor: 'quantity' }
            ],
            form: {
              fields: [
                {
                  name: 'recipeId',
                  label: 'Receta',
                  type: 'select' as const,
                  required: true,
                  options: recipes
                    .filter(recipe => {
                      // Obtener los IDs de las recetas ya agregadas
                      const existingRecipeIds = new Set(
                        (order.recipes || []).map(r => r.recipeId)
                      );
                      // Filtrar la receta si no está en la lista de recetas ya agregadas
                      return !existingRecipeIds.has(recipe.id || '');
                    })
                    .map(recipe => ({
                      value: recipe.id || '',
                      label: recipe.name
                    })),
                  onChange: (value: unknown) => {
                    const selectedRecipe = recipes.find(r => r.id === value);
                    if (selectedRecipe?.desiredProduction) {
                      return {
                        quantity: selectedRecipe.desiredProduction
                      };
                    }
                    return {};
                  }
                },
                {
                  name: 'quantity',
                  label: 'Cantidad',
                  type: 'number' as const,
                  required: true,
                  placeholder: 'Ej: 5',
                }
              ],
              emptyState: {
                title: 'No hay recetas agregadas',
                description: 'Haga clic en el botón "Agregar" para comenzar a agregar recetas a la orden.',
              },
              modalTitles: {
                add: 'Agregar Receta',
                edit: 'Modificar Receta',
              },
              addButtonText: 'Agregar Receta',
              editButtonTooltip: 'Modificar esta receta',
              deleteButtonTooltip: 'Eliminar esta receta',
              dialogDescription: 'Complete los detalles de la receta para la orden.',
            },
          },
        }
      ];
    }

    // Para otros tipos de órdenes, mantener la configuración original
    return [
      {
        name: 'responsibleWorkerId',
        label: 'Empleado Responsable',
        type: 'select' as const,
        required: true,
        relatedService: {
          service: workerService,
          labelField: 'name',
        }
      },
      {
        name: 'orderDate',
        label: 'Fecha',
        type: 'date' as const,
        required: true,
        readOnly: false,
      },
      ...(id ? [{
        name: 'status',
        label: 'Estado',
        type: 'select' as const,
        required: true,
        readOnly: !id,
        options: Object.values(OrderStatus).map(status => ({
          value: status,
          label: status
        })),
      }] : []),
      {
        name: 'recipes',
        label: 'Recetas',
        type: 'array' as const,
        visible: (): boolean => true,
        arrayConfig: {
          columns: [
            { 
              header: 'Receta', 
              accessor: 'recipeId',
              render: (value: unknown) => {
                const recipe = recipes.find(r => r.id === value);
                return recipe?.name || 'Receta no encontrada';
              }
            },
            { header: 'Cantidad', accessor: 'quantity' }
          ],
          form: {
            fields: [
              {
                name: 'recipeId',
                label: 'Receta',
                type: 'select' as const,
                required: true,
                options: recipes
                  .filter(recipe => {
                    // Obtener los IDs de las recetas ya agregadas
                    const existingRecipeIds = new Set(
                      (order.recipes || []).map(r => r.recipeId)
                    );
                    // Filtrar la receta si no está en la lista de recetas ya agregadas
                    return !existingRecipeIds.has(recipe.id || '');
                  })
                  .map(recipe => ({
                    value: recipe.id || '',
                    label: recipe.name
                  })),
                onChange: (value: unknown) => {
                  const selectedRecipe = recipes.find(r => r.id === value);
                  if (selectedRecipe?.desiredProduction) {
                    return {
                      quantity: selectedRecipe.desiredProduction
                    };
                  }
                  return {};
                }
              },
              {
                name: 'quantity',
                label: 'Cantidad',
                type: 'number' as const,
                required: true,
                placeholder: 'Ej: 5',
              }
            ],
            emptyState: {
              title: 'No hay recetas agregadas',
              description: 'Haga clic en el botón "Agregar" para comenzar a agregar recetas a la orden.',
            },
            modalTitles: {
              add: 'Agregar Receta',
              edit: 'Modificar Receta',
            },
            addButtonText: 'Agregar Receta',
            editButtonTooltip: 'Modificar esta receta',
            deleteButtonTooltip: 'Eliminar esta receta',
            dialogDescription: 'Complete los detalles de la receta para la orden.',
          },
        },
      }
    ];
  }, [id, recipes, recipeService, workerService, searchParams]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <GenericForm<ProductionOrder>
        title={id ? 'Editar Orden de Producción' : 'Nueva Orden de Producción'}
        fields={fields}
        initialValues={order}
        service={orderService}
        backPath="/production-orders"
      />
    </div>
  );
} 