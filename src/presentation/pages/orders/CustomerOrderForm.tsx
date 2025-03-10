import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';

export function CustomerOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<Partial<CustomerOrder>>({});
  const orderService = new CustomerOrderServiceImpl();

  React.useEffect(() => {
    if (id) {
      orderService.findById(id).then(data => {
        if (data) setOrder(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'customerId',
      label: 'Cliente',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new CustomerServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'orderDate',
      label: 'Fecha',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: OrderStatus.PENDING, label: 'Pendiente' },
        { value: OrderStatus.COMPLETED, label: 'Completada' }
      ],
    },
    {
      name: 'items',
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
            description: 'Haga clic en el botón "Agregar" para comenzar a agregar productos al pedido.',
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
    <GenericForm<CustomerOrder>
      title={id ? 'Editar Pedido de Cliente' : 'Nuevo Pedido de Cliente'}
      fields={fields}
      initialValues={order}
      service={orderService}
      backPath="/customer-orders"
    />
  );
} 