import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Worker, PaymentStatus, PaymentConcept } from '../../../domain/models/worker.model';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';
import { getOptions } from '@/domain/enums/entity-status.enum';

export function WorkerForm() {
  const { id } = useParams<{ id: string }>();
  const [worker, setWorker] = React.useState<Partial<Worker>>({});
  const workerService = React.useMemo(() => new WorkerServiceImpl(), []);

  React.useEffect(() => {
    if (id) {
      workerService.findById(id).then(data => {
        if (data) setWorker(data);
      });
    }
  }, [id, workerService]);

  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'primaryRoleId',
      label: 'Rol Principal',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new RoleServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text' as const,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: getOptions(),
    },
    {
      name: 'hireDate',
      label: 'Fecha de Contratación',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'monthlySalary',
      label: 'Salario Mensual',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'leaveBalance',
      label: 'Saldo de Licencias',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'leaveSalaryBalance',
      label: 'Saldo de Salario por Licencias',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'vacationSalaryBalance',
      label: 'Saldo de Salario por Vacaciones',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'bonusSalaryBalance',
      label: 'Saldo de Aguinaldos',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'leaveHistory',
      label: 'Historial de Licencias Tomadas',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { 
            header: 'Fecha de Inicio', 
            accessor: 'startDate',
            render: (value: unknown) => new Date(value as Date).toLocaleDateString('es-UY')
          },
          { 
            header: 'Fecha de Fin', 
            accessor: 'endDate',
            render: (value: unknown) => new Date(value as Date).toLocaleDateString('es-UY')
          },
          { header: 'Días', accessor: 'day' },
        ],
        form: {
          fields: [
            {
              name: 'startDate',
              label: 'Fecha de Inicio',
              type: 'date' as const,
              required: true,
            },
            {
              name: 'endDate',
              label: 'Fecha de Fin',
              type: 'date' as const,
              required: true,
            },
            {
              name: 'day',
              label: 'Días',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 5',
            },
          ],
          emptyState: {
            title: 'No hay licencias registrados',
            description: 'Haga clic en el botón "Agregar" para comenzar a registrar las licencias tomadas del trabajador.',
          },
          modalTitles: {
            add: 'Agregar Licencias Tomadas',
            edit: 'Modificar Licencias Tomada',
          },
          addButtonText: 'Agregar Licencias Tomada',
          editButtonTooltip: 'Modificar este Licencias Tomada',
          deleteButtonTooltip: 'Eliminar este Licencias Tomada',
        },
      },
    },
    {
      name: 'payments',
      label: 'Pagos',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { 
            header: 'Monto', 
            accessor: 'amount',
            render: (value: unknown) => (value as number)?.toLocaleString('es-UY', {
              style: 'currency',
              currency: 'UYU',
              currencyDisplay: 'symbol',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }) || 'N/A'
          },
          { 
            header: 'Estado', 
            accessor: 'status',
            render: (value: unknown) => {
              switch (value as PaymentStatus) {
                case PaymentStatus.PENDING:
                  return 'Pendiente';
                case PaymentStatus.PAID:
                  return 'Pagado';
                default:
                  return 'N/A';
              }
            }
          },
          { 
            header: 'Concepto', 
            accessor: 'concept',
            render: (value: unknown) => {
              switch (value as PaymentConcept) {
                case PaymentConcept.SALARY:
                  return 'Salario';
                case PaymentConcept.LEAVE:
                  return 'Permiso';
                default:
                  return 'N/A';
              }
            }
          },
          { 
            header: 'Fecha de Pago', 
            accessor: 'paymentDate',
            render: (value: unknown) => new Date(value as Date).toLocaleDateString('es-UY')
          },
        ],
        form: {
          fields: [
            {
              name: 'amount',
              label: 'Monto',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 500000',
            },
            {
              name: 'status',
              label: 'Estado',
              type: 'select' as const,
              required: true,
              options: [
                { value: PaymentStatus.PENDING, label: 'Pendiente' },
                { value: PaymentStatus.PAID, label: 'Pagado' },
              ],
            },
            {
              name: 'concept',
              label: 'Concepto',
              type: 'select' as const,
              required: true,
              options: [
                { value: PaymentConcept.SALARY, label: 'Salario' },
                { value: PaymentConcept.LEAVE, label: 'Permiso' },
              ],
            },
            {
              name: 'paymentDate',
              label: 'Fecha de Pago',
              type: 'date' as const,
              required: true,
            },
          ],
          emptyState: {
            title: 'No hay pagos registrados',
            description: 'Haga clic en el botón "Agregar" para comenzar a registrar los pagos del trabajador.',
          },
          modalTitles: {
            add: 'Agregar Pago',
            edit: 'Modificar Pago',
          },
          addButtonText: 'Agregar Pago',
          editButtonTooltip: 'Modificar este pago',
          deleteButtonTooltip: 'Eliminar este pago',
        },
      },
    },
  ];

  return (
    <GenericForm<Worker>
      title={id ? 'Editar Trabajador' : 'Nuevo Trabajador'}
      fields={fields}
      initialValues={worker}
      service={workerService}
      backPath="/workers"
    />
  );
} 