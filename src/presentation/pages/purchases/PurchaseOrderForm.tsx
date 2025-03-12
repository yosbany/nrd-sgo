import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { PurchaseOrder } from '../../../domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../../../domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { OrderStatus } from '@/domain/models/order-status.enum';

export function PurchaseOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<Partial<PurchaseOrder>>({
    orderDate: new Date(),
    status: OrderStatus.PENDIENTE,
  });
  const orderService = new PurchaseOrderServiceImpl();

  React.useEffect(() => {
    if (id) {
      orderService.findById(id).then(data => {
        if (data) setOrder(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'supplierId',
      label: 'Proveedor',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new SupplierServiceImpl(),
        labelField: 'commercialName',
      },
    },
    {
      name: 'orderDate',
      label: 'Fecha',
      type: 'date' as const,
      required: true,
      readOnly: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      readOnly: !id,
      options: Object.values(OrderStatus).map(status => ({
        value: status,
        label: status
      })),
    },
    {
      name: 'products',
      label: 'Productos',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { 
            header: 'Producto', 
            accessor: 'productId',
            reference: {
              field: {
                name: 'productId',
                label: 'Producto',
                type: 'select' as const,
                relatedService: {
                  service: new ProductServiceImpl(),
                  labelField: 'name',
                },
              },
              displayField: 'name',
            },
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
              relatedService: {
                service: new ProductServiceImpl(),
                labelField: 'name',
              },
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
        },
      },
    },
  ];

  return (
    <GenericForm<PurchaseOrder>
      title={id ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
      fields={fields}
      initialValues={order}
      service={orderService}
      backPath="/purchase-orders"
    />
  );
} 