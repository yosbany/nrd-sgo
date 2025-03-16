import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { Worker, PaymentStatus, PaymentConcept, LeaveHistory, Payment } from '../../../domain/models/worker.model';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';

export function WorkerDetails() {
  const { id } = useParams<{ id: string }>();
  const workerService = new WorkerServiceImpl();
  const roleService = React.useMemo(() => new RoleServiceImpl(), []);
  const [roles, setRoles] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadRoles = async () => {
      const rolesData = await roleService.findAll();
      const rolesMap = rolesData.reduce((acc, role) => ({
        ...acc,
        [role.id as string]: role.name
      }), {});
      setRoles(rolesMap);
    };
    loadRoles();
  }, [roleService]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderLeaveHistory = (history: LeaveHistory[]) => {
    const columns = [
      {
        header: 'Fecha Inicio',
        accessor: (item: LeaveHistory) => formatDate(item.startDate)
      },
      {
        header: 'Fecha Fin',
        accessor: (item: LeaveHistory) => formatDate(item.endDate)
      },
      {
        header: 'Días',
        accessor: (item: LeaveHistory) => item.day
      }
    ];

    return <ArrayTable data={history} columns={columns} emptyMessage="No hay historial de licencias tomadas" />;
  };

  const renderPayments = (payments: Payment[]) => {
    const columns = [
      {
        header: 'Fecha',
        accessor: (item: Payment) => formatDate(item.paymentDate)
      },
      {
        header: 'Concepto',
        accessor: (item: Payment) => {
          switch (item.concept) {
            case PaymentConcept.SALARY:
              return 'Salario';
            case PaymentConcept.LEAVE:
              return 'Permiso';
            default:
              return item.concept;
          }
        }
      },
      {
        header: 'Estado',
        accessor: (item: Payment) => {
          switch (item.status) {
            case PaymentStatus.PAID:
              return 'Pagado';
            case PaymentStatus.PENDING:
              return 'Pendiente';
            default:
              return item.status;
          }
        }
      },
      {
        header: 'Monto',
        accessor: (item: Payment) => formatCurrency(item.amount)
      }
    ];

    return <ArrayTable data={payments} columns={columns} emptyMessage="No hay pagos" />;
  };

  const getFields = (worker: Worker) => [
    { label: 'Nombre', value: worker.name },
    { label: 'Rol Principal', value: roles[worker.primaryRoleId] || 'Rol no encontrado' },
    { label: 'Fecha de Contratación', value: formatDate(worker.hireDate) },
    { label: 'Salario Mensual', value: formatCurrency(worker.monthlySalary) },
    { label: 'Balance de Licencias', value: worker.leaveBalance },
    { label: 'Balance de Salario por Licencias', value: formatCurrency(worker.leaveSalaryBalance) },
    { label: 'Balance de Salario por Vacaciones', value: formatCurrency(worker.vacationSalaryBalance) },
    { label: 'Balance de Aguinaldo', value: formatCurrency(worker.bonusSalaryBalance) },
    { label: 'Historial de Licencias Tomadas', value: renderLeaveHistory(worker.leaveHistory || []) },
    { label: 'Historial de Pagos', value: renderPayments(worker.payments || []) },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Worker>
      title="Trabajador"
      fields={getFields}
      editPath={`/workers/${id}/edit`}
      backPath="/workers"
      service={workerService}
      id={id}
    />
  );
} 