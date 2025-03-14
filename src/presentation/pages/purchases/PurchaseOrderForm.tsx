import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { PurchaseOrder } from '../../../domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../../../domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { Product } from '@/domain/models/product.model';
import { useLogger } from '@/lib/logger';
import { Supplier } from '@/domain/models/supplier.model';
import { toast } from 'sonner';

export function PurchaseOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const log = useLogger('PurchaseOrderForm');
  const orderType = React.useMemo(() => {
    const calculate = searchParams.get('calculate');
    const copy = searchParams.get('copy');
    return calculate || copy ? 'calculated' : 'manual';
  }, [searchParams]);
  const [order, setOrder] = React.useState<Partial<PurchaseOrder>>({
    orderDate: new Date(),
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
          log.info('Copiando orden existente', { copyNro });
          try {
            const copiedOrder = await orderService.copyOrder(copyNro);
            setOrder(copiedOrder);

            // Cargar los productos del proveedor de la orden copiada
            if (copiedOrder.supplierId) {
              const supplierProducts = await productService.findByPrimarySupplierId(copiedOrder.supplierId);
              setProducts(supplierProducts);
              log.debug('Productos cargados del proveedor de la orden copiada', { 
                supplierId: copiedOrder.supplierId,
                productsCount: supplierProducts.length 
              });
            }
          } catch (error) {
            log.error('Error al copiar orden', { error });
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
          log.info('Configurando orden de cálculo', { calculateId });
          setOrder(prev => ({ ...prev, supplierId: calculateId }));
          // Cargar productos del proveedor seleccionado
          const supplierProducts = await productService.findByPrimarySupplierId(calculateId);
          setProducts(supplierProducts);
          log.debug('Productos cargados para cálculo', { count: supplierProducts.length });
        }
      } catch (error) {
        log.error('Error al cargar datos iniciales', { error });
        toast.error('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [id, orderService, productService, searchParams, log, navigate]);

  const handleReferenceOrderChange = (value: unknown) => {
    log.info('Cambiando orden de referencia', { value });
    orderService.findById(value as string)
      .then(referenceOrder => {
        if (referenceOrder) {
          setOrder(prev => ({ 
            ...prev, 
            referenceOrderNumber: value as string,
            products: referenceOrder.products
          }));
          log.debug('Orden de referencia actualizada', { 
            orderId: referenceOrder.id,
            productsCount: referenceOrder.products.length 
          });
        }
      })
      .catch(error => {
        log.error('Error al cargar orden de referencia', { error });
      });
  };

  const handleSupplierChange = (value: unknown) => {
    const supplierId = value as string;
    log.info('Iniciando cambio de proveedor', { 
      supplierId,
      currentProductsCount: products.length,
      currentOrderProductsCount: order.products?.length || 0
    });
    
    // Primero actualizamos el supplierId
    setOrder(prev => {
      log.debug('Actualizando estado de la orden', { 
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
      log.debug('Iniciando carga de productos del proveedor', { supplierId });
      productService.findByPrimarySupplierId(supplierId)
        .then(supplierProducts => {
          log.info('Productos cargados exitosamente del proveedor', { 
            supplierId,
            productsCount: supplierProducts.length,
            products: supplierProducts.map(p => ({ id: p.id, name: p.name }))
          });
          setProducts(supplierProducts);
        })
        .catch(error => {
          log.error('Error al cargar productos del proveedor', { 
            error,
            supplierId,
            errorMessage: error instanceof Error ? error.message : 'Error desconocido'
          });
          setProducts([]); // En caso de error, limpiamos la lista
        });
    } else {
      log.debug('Limpieza de productos - sin proveedor seleccionado', {
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
          visible: () => true,
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
                  options: products.map(product => ({
                    value: product.id || '',
                    label: product.name
                  })),
                  onChange: (value: unknown) => {
                    log.debug('Producto seleccionado', { value });
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
        visible: () => true,
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
                options: products.map(product => ({
                  value: product.id || '',
                  label: product.name
                })),
                onChange: (value: unknown) => {
                  log.debug('Producto seleccionado', { value });
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
  }, [id, orderType, suppliers, products, handleReferenceOrderChange, handleSupplierChange, searchParams]);

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
      />
    </div>
  );
} 