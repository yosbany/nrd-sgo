import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { ProductionOrder } from '../../../domain/models/production-order.model';
import { ProductionOrderServiceImpl } from '../../../domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';

export function ProductionOrderForm() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<Partial<ProductionOrder>>({});
  const orderService = new ProductionOrderServiceImpl();

  React.useEffect(() => {
    if (id) {
      orderService.findById(id).then(data => {
        if (data) setOrder(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'responsibleWorkerId',
      label: 'Trabajador Responsable',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new WorkerServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'orderDate',
      label: 'Fecha de Producción',
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
      name: 'recipes',
      label: 'Recetas',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { 
            header: 'Receta', 
            accessor: 'recipeId',
            reference: {
              field: {
                name: 'recipeId',
                label: 'Receta',
                type: 'select' as const,
                relatedService: {
                  service: new RecipeServiceImpl(),
                  labelField: 'name',
                },
              },
              displayField: 'name',
            },
          },
          { header: 'Cantidad', accessor: 'quantity' },
          { header: 'Ratio', accessor: 'ratio' },
        ],
        form: {
          fields: [
            {
              name: 'recipeId',
              label: 'Receta',
              type: 'select' as const,
              required: true,
              relatedService: {
                service: new RecipeServiceImpl(),
                labelField: 'name',
              },
            },
            {
              name: 'quantity',
              label: 'Cantidad',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 10',
            },
            {
              name: 'ratio',
              label: 'Ratio',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 1.5',
            },
          ],
          emptyState: {
            title: 'No hay recetas agregadas',
            description: 'Haga clic en el botón "Agregar" para comenzar a agregar recetas a la orden de producción.',
          },
          modalTitles: {
            add: 'Agregar Receta',
            edit: 'Modificar Receta',
          },
          addButtonText: 'Agregar Receta',
          editButtonTooltip: 'Modificar esta receta',
          deleteButtonTooltip: 'Eliminar esta receta',
        },
      },
    },
  ];

  return (
    <GenericForm<ProductionOrder>
      title={id ? 'Editar Orden de Producción' : 'Nueva Orden de Producción'}
      fields={fields}
      initialValues={order}
      service={orderService}
      backPath="/production-orders"
    />
  );
} 