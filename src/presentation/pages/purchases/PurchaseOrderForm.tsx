import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { PurchaseOrder } from '../../../domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../../../domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { Product } from '@/domain/models/product.model';
import { Supplier } from '@/domain/models/supplier.model';
import { toast } from 'sonner';

export function PurchaseOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const orderType = React.useMemo(() => {
    const calculate = searchParams.get('calculate');
    const copy = searchParams.get('copy');
    return calculate || copy ? 'calculated' : 'manual';
  }, [searchParams]);
  const [order, setOrder] = React.useState<Partial<PurchaseOrder>>({
    orderDate: new Date(new Date().setHours(0, 0, 0, 0)),
    status: OrderStatus.PENDIENTE,
    products: []
  });
  const [products, setProducts] = React.useState<Product[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const orderService = React.useMemo(() => new PurchaseOrderServiceImpl(), []);
  const productService = React.useMemo(() => new ProductServiceImpl(), []);
  const supplierService = React.useMemo(() => new SupplierServiceImpl(), []);

  // Cargar datos iniciales
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [suppliersData, productsData] = await Promise.all([
          supplierService.findAll(),
          productService.findAll()
        ]);

        setSuppliers(suppliersData);

        // Si hay un número de orden para copiar, usar el nuevo método copyOrder
        const copyNro = searchParams.get('copy');
        if (copyNro) {
          console.log('Copiando orden existente', { copyNro });
          try {
            const copiedOrder = await orderService.copyOrder(copyNro);
            // Ajustar la fecha a medianoche local
            const orderDate = copiedOrder.orderDate instanceof Date 
              ? copiedOrder.orderDate 
              : new Date(copiedOrder.orderDate || new Date());
            
            const localDate = new Date(orderDate.getTime() + orderDate.getTimezoneOffset() * 60000);
            localDate.setHours(0, 0, 0, 0);

            setOrder({
              ...copiedOrder,
              orderDate: localDate
            });

            // Cargar los productos del proveedor de la orden copiada
            if (copiedOrder.supplierId) {
              const supplierProducts = await productService.findByPrimarySupplierId(copiedOrder.supplierId);
              setProducts(supplierProducts);
              console.log('Productos cargados del proveedor de la orden copiada', { 
                supplierId: copiedOrder.supplierId,
                productsCount: supplierProducts.length 
              });
            }
          } catch (error) {
            console.error('Error al copiar orden', { error });
            toast.error('La orden no existe o no se puede copiar');
            // Redirigir al listado de órdenes
            navigate('/purchase-orders');
            return;
          }
          return;
        }

        // Para otros tipos de órdenes, cargar todos los productos
        setProducts(productsData);

        // Si hay un ID de cálculo, establecer el proveedor
        const calculateId = searchParams.get('calculate');
        if (calculateId) {
          console.log('Configurando orden de cálculo', { calculateId });
          setOrder(prev => ({ ...prev, supplierId: calculateId }));
          // Cargar productos del proveedor seleccionado
          const supplierProducts = await productService.findByPrimarySupplierId(calculateId);
          setProducts(supplierProducts);
          console.log('Productos cargados para cálculo', { count: supplierProducts.length });
        }

        // Si estamos editando una orden existente, cargar sus datos
        if (id) {
          try {
            const existingOrder = await orderService.findById(id);
            if (existingOrder) {
              console.log('Cargando orden existente', { 
                id,
                supplierId: existingOrder.supplierId,
                productsCount: existingOrder.products?.length || 0
              });
              
              // Asegurarnos de que la fecha esté en la zona horaria local y sin tiempo
              const orderDate = existingOrder.orderDate instanceof Date 
                ? existingOrder.orderDate 
                : new Date(existingOrder.orderDate);
              
              const localDate = new Date(orderDate.getTime() + orderDate.getTimezoneOffset() * 60000);
              localDate.setHours(0, 0, 0, 0);

              // Cargar los productos del proveedor de la orden existente
              let supplierProducts = productsData;
              if (existingOrder.supplierId) {
                supplierProducts = await productService.findByPrimarySupplierId(existingOrder.supplierId);
                console.log('Productos cargados del proveedor de la orden existente', {
                  supplierId: existingOrder.supplierId,
                  productsCount: supplierProducts.length
                });
              }
              
              setProducts(supplierProducts);
              setOrder({
                ...existingOrder,
                orderDate: localDate
              });
            }
          } catch (error) {
            console.error('Error al cargar la orden', { error });
            toast.error('Error al cargar la orden');
            navigate('/purchase-orders');
            return;
          }
        }

      } catch (error) {
        console.error('Error al cargar datos iniciales', { error });
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [id, orderService, productService, supplierService, searchParams, navigate]);

  const handleReferenceOrderChange = (value: unknown) => {
    console.log('Cambiando orden de referencia', { value });
    orderService.findById(value as string)
      .then(referenceOrder => {
        if (referenceOrder) {
          setOrder(prev => ({ 
            ...prev, 
            referenceOrderNumber: value as string,
            products: referenceOrder.products
          }));
          console.log('Orden de referencia actualizada', { 
            orderId: referenceOrder.id,
            productsCount: referenceOrder.products.length 
          });
        }
      })
      .catch(error => {
        console.error('Error al cargar orden de referencia', { error });
      });
  };

  const handleSupplierChange = (value: unknown) => {
    const supplierId = value as string;
    console.log('Iniciando cambio de proveedor', { 
      supplierId,
      currentProductsCount: products.length,
      currentOrderProductsCount: order.products?.length || 0
    });
    
    // Primero actualizamos el supplierId
    setOrder(prev => {
      console.log('Actualizando estado de la orden', { 
        previousSupplierId: prev.supplierId,
        newSupplierId: supplierId,
        previousProductsCount: prev.products?.length || 0
      });
      return { 
        ...prev, 
        supplierId,
        products: [] // Limpiamos los productos cuando cambia el proveedor
      };
    });

    // Luego cargamos los productos del nuevo proveedor
    if (supplierId) {
      console.log('Iniciando carga de productos del proveedor', { supplierId });
      productService.findByPrimarySupplierId(supplierId)
        .then(supplierProducts => {
          console.log('Productos cargados exitosamente del proveedor', { 
            supplierId,
            productsCount: supplierProducts.length,
            products: supplierProducts.map(p => ({ id: p.id, name: p.name }))
          });
          setProducts(supplierProducts);
        })
        .catch(error => {
          console.error('Error al cargar productos del proveedor', { 
            error,
            supplierId,
            errorMessage: error instanceof Error ? error.message : 'Error desconocido'
          });
          setProducts([]); // En caso de error, limpiamos la lista
        });
    } else {
      console.log('Limpieza de productos - sin proveedor seleccionado', {
        previousProductsCount: products.length
      });
      setProducts([]); // Si no hay proveedor seleccionado, limpiamos la lista
    }
  };

  const fields = React.useMemo(() => {
    // Si es una orden copiada, mostrar solo proveedor, fecha y productos
    if (searchParams.get('copy')) {
      return [
        {
          name: 'supplierId',
          label: 'Proveedor',
          type: 'select' as const,
          required: true,
          readOnly: true, // El proveedor no se puede cambiar en una orden copiada
          relatedService: {
            service: supplierService,
            labelField: 'commercialName',
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
          name: 'products',
          label: 'Productos',
          type: 'array' as const,
          visible: (): boolean => true,
          arrayConfig: {
            columns: [
              { 
                header: 'Producto', 
                accessor: 'productId',
                render: (value: unknown) => {
                  const product = products.find(p => p.id === value);
                  return product?.name || 'Producto no encontrado';
                }
              },
              { header: 'Cantidad', accessor: 'quantity' }
            ],
            form: {
              fields: [
                {
                  name: 'productId',
                  label: 'Producto',
                  type: 'select' as const,
                  required: true,
                  options: products
                    .filter(product => {
                      // Obtener los IDs de los productos ya agregados
                      const existingProductIds = new Set(
                        (order.products || []).map(p => p.productId)
                      );
                      // Filtrar el producto si no está en la lista de productos ya agregados
                      return !existingProductIds.has(product.id || '');
                    })
                    .map(product => ({
                      value: product.id || '',
                      label: product.name
                    })),
                  onChange: (value: unknown) => {
                    const selectedProduct = products.find(p => p.id === value);
                    if (selectedProduct?.desiredStock) {
                      return {
                        quantity: selectedProduct.desiredStock
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
                title: 'No hay productos agregados',
                description: 'Haga clic en el botón "Agregar" para comenzar a agregar productos a la orden de compra.',
              },
              modalTitles: {
                add: 'Agregar Producto',
                edit: 'Modificar Producto',
              },
              addButtonText: 'Agregar Producto',
              editButtonTooltip: 'Modificar este producto',
              deleteButtonTooltip: 'Eliminar este producto',
              dialogDescription: 'Complete los detalles del producto para la orden de compra.',
            },
          },
        }
      ];
    }

    // Para otros tipos de órdenes, mantener la configuración original
    return [
      ...(orderType === 'calculated' ? [
        {
          name: 'referenceOrderNumber',
          label: 'Orden de Referencia',
          type: 'select' as const,
          required: true,
          options: suppliers.map(supplier => ({
            value: supplier.id || '',
            label: `Proveedor: ${supplier.commercialName}`
          })),
          onChange: handleReferenceOrderChange
        }
      ] : []),
      {
        name: 'supplierId',
        label: 'Proveedor',
        type: 'select' as const,
        required: true,
        relatedService: {
          service: supplierService,
          labelField: 'commercialName',
        },
        onChange: handleSupplierChange
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
      ...(orderType === 'manual' ? [{
        name: 'products',
        label: 'Productos',
        type: 'array' as const,
        visible: (): boolean => true,
        arrayConfig: {
          columns: [
            { 
              header: 'Producto', 
              accessor: 'productId',
              render: (value: unknown) => {
                const product = products.find(p => p.id === value);
                return product?.name || 'Producto no encontrado';
              }
            },
            { header: 'Cantidad', accessor: 'quantity' }
          ],
          form: {
            fields: [
              {
                name: 'productId',
                label: 'Producto',
                type: 'select' as const,
                required: true,
                options: products
                  .filter(product => {
                    // Obtener los IDs de los productos ya agregados
                    const existingProductIds = new Set(
                      (order.products || []).map(p => p.productId)
                    );
                    // Filtrar el producto si no está en la lista de productos ya agregados
                    return !existingProductIds.has(product.id || '');
                  })
                  .map(product => ({
                    value: product.id || '',
                    label: product.name
                  })),
                onChange: (value: unknown) => {
                  const selectedProduct = products.find(p => p.id === value);
                  if (selectedProduct?.desiredStock) {
                    return {
                      quantity: selectedProduct.desiredStock
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
              title: 'No hay productos agregados',
              description: 'Haga clic en el botón "Agregar" para comenzar a agregar productos a la orden de compra.',
            },
            modalTitles: {
              add: 'Agregar Producto',
              edit: 'Modificar Producto',
            },
            addButtonText: 'Agregar Producto',
            editButtonTooltip: 'Modificar este producto',
            deleteButtonTooltip: 'Eliminar este producto',
            dialogDescription: 'Complete los detalles del producto para la orden de compra.',
          },
        },
      }] : [])
    ];
  }, [id, orderType, suppliers, products, handleReferenceOrderChange, handleSupplierChange, searchParams, supplierService]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <GenericForm<PurchaseOrder>
        title={id ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
        fields={fields}
        initialValues={order}
        service={orderService}
        backPath="/purchase-orders"
        transformValues={(values) => {
          // Asegurarnos de que la fecha se guarde correctamente en UTC
          const orderDate = values.orderDate instanceof Date 
            ? values.orderDate 
            : new Date(values.orderDate);
          
          orderDate.setHours(12, 0, 0, 0); // Establecer mediodía para evitar problemas de zona horaria
          
          return {
            ...values,
            orderDate
          };
        }}
      />
    </div>
  );
} 