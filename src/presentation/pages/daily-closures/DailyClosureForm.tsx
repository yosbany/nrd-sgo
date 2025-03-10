import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { DailyClosure } from '../../../domain/models/daily-closure.model';
import { DailyClosureServiceImpl } from '../../../domain/services/daily-closure.service.impl';

export function DailyClosureForm() {
  const { id } = useParams<{ id: string }>();
  const [closure, setClosure] = React.useState<Partial<DailyClosure>>({});
  const closureService = new DailyClosureServiceImpl();

  React.useEffect(() => {
    if (id) {
      closureService.findById(id).then(data => {
        if (data) setClosure(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'date',
      label: 'Fecha',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'totalExpenses',
      label: 'Total de Gastos',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'totalIncome',
      label: 'Total de Ingresos',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'totalDifference',
      label: 'Diferencia Total',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'observations',
      label: 'Observaciones',
      type: 'textarea' as const,
    },
    {
      name: 'accounts',
      label: 'Cuentas',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { header: 'Nombre', accessor: 'name' },
          { 
            header: 'Saldo', 
            accessor: 'balance',
            render: (value: number) => value?.toLocaleString('es-CL', {
              style: 'currency',
              currency: 'CLP'
            }) || 'N/A'
          },
        ],
        form: {
          fields: [
            {
              name: 'name',
              label: 'Nombre',
              type: 'text' as const,
              required: true,
              placeholder: 'Ej: Caja Principal',
            },
            {
              name: 'balance',
              label: 'Saldo',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 100000',
            },
          ],
          emptyState: {
            title: 'No hay cuentas registradas',
            description: 'Haga clic en el botón "Agregar" para comenzar a registrar las cuentas del cierre diario.',
          },
          modalTitles: {
            add: 'Agregar Cuenta',
            edit: 'Modificar Cuenta',
          },
          addButtonText: 'Agregar Cuenta',
          editButtonTooltip: 'Modificar esta cuenta',
          deleteButtonTooltip: 'Eliminar esta cuenta',
        },
      },
    },
    {
      name: 'transactions',
      label: 'Transacciones',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { header: 'Descripción', accessor: 'description' },
          { 
            header: 'Monto', 
            accessor: 'amount',
            render: (value: number) => value?.toLocaleString('es-CL', {
              style: 'currency',
              currency: 'CLP'
            }) || 'N/A'
          },
          { header: 'Tipo', accessor: 'type' },
        ],
        form: {
          fields: [
            {
              name: 'description',
              label: 'Descripción',
              type: 'text' as const,
              required: true,
              placeholder: 'Ej: Venta de pan',
            },
            {
              name: 'amount',
              label: 'Monto',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 5000',
            },
            {
              name: 'type',
              label: 'Tipo',
              type: 'select' as const,
              required: true,
              options: [
                { value: 'income', label: 'Ingreso' },
                { value: 'expense', label: 'Gasto' },
              ],
            },
          ],
          emptyState: {
            title: 'No hay transacciones registradas',
            description: 'Haga clic en el botón "Agregar" para comenzar a registrar las transacciones del cierre diario.',
          },
          modalTitles: {
            add: 'Agregar Transacción',
            edit: 'Modificar Transacción',
          },
          addButtonText: 'Agregar Transacción',
          editButtonTooltip: 'Modificar esta transacción',
          deleteButtonTooltip: 'Eliminar esta transacción',
        },
      },
    },
  ];

  return (
    <GenericForm<DailyClosure>
      title={id ? 'Editar Cierre Diario' : 'Nuevo Cierre Diario'}
      fields={fields}
      initialValues={closure}
      service={closureService}
      backPath="/daily-closures"
    />
  );
} 