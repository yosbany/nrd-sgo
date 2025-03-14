import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';
import { TypeInventory } from '../../../domain/enums/type-inventory.enum';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { useLogger } from '@/lib/logger';
import { toast } from 'sonner';

export function CustomerOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const log = useLogger('CustomerOrderForm');
  const [order, setOrder] = React.useState<Partial<CustomerOrder>>({
    orderDate: new Date(),
    status: OrderStatus.PENDIENTE,
    items: []
  });
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const orderService = React.useMemo(() => new CustomerOrderServiceImpl(), []);
  const customerService = React.useMemo(() => new CustomerServiceImpl(), []);
  const productService = React.useMemo(() => new ProductServiceImpl(), []);
  const recipeService = React.useMemo(() => new RecipeServiceImpl(), []);

  // Cargar datos iniciales
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productsData, recipesData] = await Promise.all([
          productService.findAll(),
          recipeService.findAll()
        ]);

        // Si hay un número de orden para copiar, usar el método copyOrder
        const copyNro = searchParams.get('copy');
        if (copyNro) {
          log.info('Copiando orden existente', { copyNro });
          try {
            const copiedOrder = await orderService.copyOrder(copyNro);
            setOrder(copiedOrder);
            setProducts(productsData);
            setRecipes(recipesData);
            log.debug('Orden copiada exitosamente', { 
              customerId: copiedOrder.customerId,
              itemsCount: copiedOrder.items?.length || 0
            });
          } catch (error) {
            log.error('Error al copiar orden', { error });
            toast.error('La orden no existe o no se puede copiar');
            navigate('/customer-orders');
            return;
          }
          return;
        }

        // Para órdenes normales, cargar todos los productos y recetas
        setProducts(productsData);
        setRecipes(recipesData);
      } catch (error) {
        log.error('Error al cargar datos iniciales', { error });
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [id, orderService, productService, recipeService, searchParams, log, navigate]);

  const fields = React.useMemo(() => {
    // Si es una orden copiada, mostrar solo cliente, fecha e items
    if (searchParams.get('copy')) {
      return [
        {
          name: 'customerId',
          label: 'Cliente',
          type: 'select' as const,
          required: true,
          readOnly: true, // El cliente no se puede cambiar en una orden copiada
          relatedService: {
            service: customerService,
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
          name: 'items',
          label: 'Items',
          type: 'array' as const,
          visible: () => true,
          arrayConfig: {
            columns: [
              { 
                header: 'Item', 
                accessor: 'itemId',
                render: (value: unknown, item: any) => {
                  if (item.typeItem === 'PRODUCT') {
                    const product = products.find(p => p.id === value);
                    return product?.name || 'Producto no encontrado';
                  } else {
                    const recipe = recipes.find(r => r.id === value);
                    return recipe?.name || 'Receta no encontrada';
                  }
                }
              },
              { header: 'Cantidad', accessor: 'quantity' }
            ],
            form: {
              fields: [
                {
                  name: 'typeItem',
                  label: 'Tipo',
                  type: 'select' as const,
                  required: true,
                  options: [
                    { value: 'PRODUCT', label: 'Producto' },
                    { value: 'RECIPE', label: 'Receta' }
                  ]
                },
                {
                  name: 'itemId',
                  label: 'Item',
                  type: 'select' as const,
                  required: true,
                  options: (formData: any) => {
                    if (formData.typeItem === 'PRODUCT') {
                      return products.map(product => ({
                        value: product.id || '',
                        label: product.name
                      }));
                    } else {
                      return recipes.map(recipe => ({
                        value: recipe.id || '',
                        label: recipe.name
                      }));
                    }
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
                title: 'No hay items agregados',
                description: 'Haga clic en el botón "Agregar" para comenzar a agregar items al pedido.',
              },
              modalTitles: {
                add: 'Agregar Item',
                edit: 'Modificar Item',
              },
              addButtonText: 'Agregar Item',
              editButtonTooltip: 'Modificar este item',
              deleteButtonTooltip: 'Eliminar este item',
              dialogDescription: 'Complete los detalles del item para el pedido.',
            },
          },
        }
      ];
    }

    // Para otros tipos de órdenes, mantener la configuración original
    return [
      {
        name: 'customerId',
        label: 'Cliente',
        type: 'select' as const,
        required: true,
        relatedService: {
          service: customerService,
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
        name: 'items',
        label: 'Items',
        type: 'array' as const,
        visible: () => true,
        arrayConfig: {
          columns: [
            { 
              header: 'Item', 
              accessor: 'itemId',
              render: (value: unknown, item: any) => {
                if (item.typeItem === 'PRODUCT') {
                  const product = products.find(p => p.id === value);
                  return product?.name || 'Producto no encontrado';
                } else {
                  const recipe = recipes.find(r => r.id === value);
                  return recipe?.name || 'Receta no encontrada';
                }
              }
            },
            { header: 'Cantidad', accessor: 'quantity' }
          ],
          form: {
            fields: [
              {
                name: 'typeItem',
                label: 'Tipo',
                type: 'select' as const,
                required: true,
                options: [
                  { value: 'PRODUCT', label: 'Producto' },
                  { value: 'RECIPE', label: 'Receta' }
                ]
              },
              {
                name: 'itemId',
                label: 'Item',
                type: 'select' as const,
                required: true,
                options: (formData: any) => {
                  if (formData.typeItem === 'PRODUCT') {
                    return products.map(product => ({
                      value: product.id || '',
                      label: product.name
                    }));
                  } else {
                    return recipes.map(recipe => ({
                      value: recipe.id || '',
                      label: recipe.name
                    }));
                  }
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
              title: 'No hay items agregados',
              description: 'Haga clic en el botón "Agregar" para comenzar a agregar items al pedido.',
            },
            modalTitles: {
              add: 'Agregar Item',
              edit: 'Modificar Item',
            },
            addButtonText: 'Agregar Item',
            editButtonTooltip: 'Modificar este item',
            deleteButtonTooltip: 'Eliminar este item',
            dialogDescription: 'Complete los detalles del item para el pedido.',
          },
        },
      }
    ];
  }, [id, products, recipes, customerService, searchParams]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <GenericForm<CustomerOrder>
        title={id ? 'Editar Pedido' : 'Nuevo Pedido'}
        fields={fields}
        initialValues={order}
        service={orderService}
        backPath="/customer-orders"
      />
    </div>
  );
} 