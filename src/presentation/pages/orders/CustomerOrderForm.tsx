import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GenericForm, Field } from '../../components/common/GenericForm';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';
import { TypeInventory } from '../../../domain/enums/type-inventory.enum';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { toast } from 'sonner';

export function CustomerOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [order, setOrder] = React.useState<Partial<CustomerOrder>>({
    orderDate: new Date(new Date().setHours(0, 0, 0, 0)),
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
          console.log('Copiando orden existente', { copyNro });
          try {
            const copiedOrder = await orderService.copyOrder(copyNro);
            setOrder(copiedOrder);
            setProducts(productsData);
            setRecipes(recipesData);
            console.log('Orden copiada exitosamente', { 
              customerId: copiedOrder.customerId,
              itemsCount: copiedOrder.items?.length || 0
            });
          } catch (error) {
            console.error('Error al copiar orden', { error });
            toast.error('La orden no existe o no se puede copiar');
            navigate('/customer-orders');
            return;
          }
          return;
        }

        // Si estamos editando una orden existente, cargar sus datos
        if (id) {
          try {
            const existingOrder = await orderService.findById(id);
            if (existingOrder) {
              console.log('Cargando orden existente', { 
                id,
                customerId: existingOrder.customerId,
                itemsCount: existingOrder.items?.length || 0,
                orderDate: existingOrder.orderDate
              });
              
              let orderDate;
              try {
                // Intentar crear una fecha válida desde el valor recibido
                if (existingOrder.orderDate) {
                  console.log('Fecha recibida del servidor:', {
                    raw: existingOrder.orderDate,
                    type: typeof existingOrder.orderDate
                  });
                  
                  orderDate = new Date(existingOrder.orderDate);
                  // Verificar si la fecha es válida
                  if (isNaN(orderDate.getTime())) {
                    throw new Error('Fecha inválida');
                  }
                  
                  // Establecer la hora en mediodía UTC
                  orderDate.setUTCHours(12, 0, 0, 0);
                  
                  console.log('Fecha procesada en carga:', {
                    date: orderDate,
                    iso: orderDate.toISOString(),
                    local: orderDate.toLocaleString()
                  });
                } else {
                  // Si no hay fecha, usar la fecha actual
                  orderDate = new Date();
                  orderDate.setUTCHours(12, 0, 0, 0);
                }
              } catch (error) {
                console.error('Error al procesar la fecha', { error, receivedDate: existingOrder.orderDate });
                // En caso de error, usar la fecha actual
                orderDate = new Date();
                orderDate.setUTCHours(12, 0, 0, 0);
              }

              setOrder({
                ...existingOrder,
                orderDate
              });
            }
          } catch (error) {
            console.error('Error al cargar la orden', { error });
            toast.error('Error al cargar la orden');
            navigate('/customer-orders');
            return;
          }
        }

        // Para órdenes normales, cargar todos los productos y recetas
        setProducts(productsData);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error al cargar datos iniciales', { error });
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [id, orderService, productService, recipeService, searchParams, navigate]);

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
          visible: (): boolean => true,
          arrayConfig: {
            columns: [
              { 
                header: 'Item', 
                accessor: 'itemId',
                render: (value: unknown, item: Record<string, unknown>) => {
                  if ((item as { typeItem: TypeInventory }).typeItem === TypeInventory.PRODUCTO) {
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
                  name: 'itemId',
                  label: 'Item',
                  type: 'select' as const,
                  required: true,
                  isOptionGroup: true,
                  options: [
                    {
                      label: 'Recetas',
                      options: recipes
                        .filter(recipe => {
                          // Obtener los IDs de los items ya agregados que son recetas
                          const existingRecipeIds = new Set(
                            (order.items || [])
                              .filter(item => item.typeItem === TypeInventory.RECETA)
                              .map(item => item.itemId)
                          );
                          // Filtrar la receta si no está en la lista de recetas ya agregadas
                          return !existingRecipeIds.has(recipe.id || '');
                        })
                        .map(recipe => ({
                          value: `recipe:${recipe.id}`,
                          label: recipe.name
                        }))
                    },
                    {
                      label: 'Productos',
                      options: products
                        .filter(product => {
                          // Obtener los IDs de los items ya agregados que son productos
                          const existingProductIds = new Set(
                            (order.items || [])
                              .filter(item => item.typeItem === TypeInventory.PRODUCTO)
                              .map(item => item.itemId)
                          );
                          // Filtrar el producto si no está en la lista de productos ya agregados
                          return !existingProductIds.has(product.id || '');
                        })
                        .map(product => ({
                          value: `product:${product.id}`,
                          label: product.name
                        }))
                    }
                  ],
                  onChange: (value: string) => {
                    if (!value) return;
                    const [type, id] = value.split(':');
                    return {
                      itemId: id,
                      typeItem: type === 'recipe' ? TypeInventory.RECETA : TypeInventory.PRODUCTO,
                      value
                    };
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
        visible: (): boolean => true,
        arrayConfig: {
          columns: [
            { 
              header: 'Item', 
              accessor: 'itemId',
              render: (value: unknown, item: Record<string, unknown>) => {
                if ((item as { typeItem: TypeInventory }).typeItem === TypeInventory.PRODUCTO) {
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
                name: 'itemId',
                label: 'Item',
                type: 'select' as const,
                required: true,
                isOptionGroup: true,
                options: [
                  {
                    label: 'Recetas',
                    options: recipes
                      .filter(recipe => {
                        // Obtener los IDs de los items ya agregados que son recetas
                        const existingRecipeIds = new Set(
                          (order.items || [])
                            .filter(item => item.typeItem === TypeInventory.RECETA)
                            .map(item => item.itemId)
                        );
                        // Filtrar la receta si no está en la lista de recetas ya agregadas
                        return !existingRecipeIds.has(recipe.id || '');
                      })
                      .map(recipe => ({
                        value: `recipe:${recipe.id}`,
                        label: recipe.name
                      }))
                  },
                  {
                    label: 'Productos',
                    options: products
                      .filter(product => {
                        // Obtener los IDs de los items ya agregados que son productos
                        const existingProductIds = new Set(
                          (order.items || [])
                            .filter(item => item.typeItem === TypeInventory.PRODUCTO)
                            .map(item => item.itemId)
                        );
                        // Filtrar el producto si no está en la lista de productos ya agregados
                        return !existingProductIds.has(product.id || '');
                      })
                      .map(product => ({
                        value: `product:${product.id}`,
                        label: product.name
                      }))
                  }
                ],
                onChange: (value: string) => {
                  if (!value) return;
                  const [type, id] = value.split(':');
                  return {
                    itemId: id,
                    typeItem: type === 'recipe' ? TypeInventory.RECETA : TypeInventory.PRODUCTO,
                    value
                  };
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
  }, [id, products, recipes, customerService, searchParams, order.items]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <GenericForm<CustomerOrder>
        title={id ? 'Editar Pedido' : 'Nuevo Pedido'}
        fields={fields as Field<CustomerOrder>[]}
        initialValues={order}
        service={orderService}
        backPath="/customer-orders"
        transformValues={(values) => {
          console.log('Iniciando transformación de valores:', {
            orderDate: values.orderDate,
            type: typeof values.orderDate,
            isDate: values.orderDate instanceof Date
          });

          // Asegurarnos de que la fecha se guarde correctamente
          let orderDate;
          try {
            if (typeof values.orderDate === 'string') {
              console.log('Fecha es string, convirtiendo a Date');
              orderDate = new Date(values.orderDate);
            } else if (values.orderDate instanceof Date) {
              console.log('Fecha ya es un objeto Date');
              orderDate = values.orderDate;
            } else {
              console.log('Fecha no es string ni Date, usando fecha actual');
              orderDate = new Date(); // Fallback a fecha actual
            }

            // Verificar si la fecha es válida
            if (isNaN(orderDate.getTime())) {
              console.log('Fecha inválida, usando fecha actual como fallback');
              orderDate = new Date();
            }

            // Establecer la hora en mediodía UTC
            orderDate.setUTCHours(12, 0, 0, 0);

            console.log('Fecha procesada:', {
              original: values.orderDate,
              processed: orderDate,
              processedTime: orderDate.getTime(),
              processedISO: orderDate.toISOString(),
              processedLocal: orderDate.toLocaleString()
            });

            const result = {
              ...values,
              orderDate
            };

            console.log('Objeto final a guardar:', {
              orderDate: result.orderDate,
              type: typeof result.orderDate,
              isDate: result.orderDate instanceof Date,
              completeObject: result
            });

            return result;
          } catch (error) {
            console.error('Error procesando la fecha:', error);
            const now = new Date();
            now.setUTCHours(12, 0, 0, 0);
            return {
              ...values,
              orderDate: now
            };
          }
        }}
      />
    </div>
  );
} 