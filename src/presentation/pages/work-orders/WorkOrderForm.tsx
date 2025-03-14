import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { WorkOrder } from '../../../domain/models/work-order.model';
import { WorkOrderServiceImpl } from '../../../domain/services/work-order.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { OrderStatus } from '@/domain/enums/order-status.enum';

export function WorkOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<Partial<WorkOrder>>({
    orderDate: new Date(),
    status: OrderStatus.PENDIENTE,
  });
  const orderService = new WorkOrderServiceImpl();

  React.useEffect(() => {
    if (id) {
      orderService.findById(id).then(data => {
        if (data) setOrder(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'workerId',
      label: 'Trabajador',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new WorkerServiceImpl(),
        labelField: 'name',
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
      name: 'materials',
      label: 'Materiales',
      type: 'array' as const,
      visible: (values: Partial<WorkOrder>) => !!values.workerId,
      arrayConfig: {
        columns: [
          { 
            header: 'Material', 
            accessor: 'materialId',
            reference: {
              field: {
                name: 'materialId',
                label: 'Material',
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
              name: 'materialId',
              label: 'Material',
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
            title: 'No hay materiales agregados',
            description: 'Haga clic en el botón "Agregar" para comenzar a agregar materiales a la orden de trabajo.',
          },
          modalTitles: {
            add: 'Agregar Material',
            edit: 'Modificar Material',
          },
          addButtonText: 'Agregar Material',
          editButtonTooltip: 'Modificar este material',
          deleteButtonTooltip: 'Eliminar este material',
        },
      },
    },
  ];

  return (
    <GenericForm<WorkOrder>
      title={id ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
      fields={fields}
      initialValues={order}
      service={orderService}
      backPath="/work-orders"
    />
  );
} 