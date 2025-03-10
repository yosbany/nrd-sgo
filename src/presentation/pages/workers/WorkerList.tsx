import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Worker } from '../../../domain/models/worker.model';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';

export function WorkerList() {
  const workerService = new WorkerServiceImpl();
  const roleService = new RoleServiceImpl();
  const [roles, setRoles] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadRoles = async () => {
      const rolesData = await roleService.findAll();
      const rolesMap = rolesData.reduce((acc, role) => ({
        ...acc,
        [role.id]: role.name
      }), {});
      setRoles(rolesMap);
    };
    loadRoles();
  }, []);

  const calculateYearsOfService = (hireDate: Date) => {
    const today = new Date();
    const hire = new Date(hireDate);
    let years = today.getFullYear() - hire.getFullYear();
    const monthDiff = today.getMonth() - hire.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hire.getDate())) {
      years--;
    }
    
    return years;
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Worker },
    {
      header: 'Fecha de Contratación',
      accessor: 'hireDate' as keyof Worker,
      render: (item: Worker) => {
        const hireDate = new Date(item.hireDate);
        const years = calculateYearsOfService(hireDate);
        return `${hireDate.toLocaleDateString()} (${years} ${years === 1 ? 'año' : 'años'})`;
      },
    },
    {
      header: 'Rol Principal',
      accessor: 'primaryRoleId' as keyof Worker,
      render: (item: Worker) => roles[item.primaryRoleId] || 'Rol no encontrado',
    },
  ];

  return (
    <GenericList<Worker>
      columns={columns}
      title="Colaboradores"
      addPath="/workers/new"
      backPath="/workers"
      service={workerService}
    />
  );
} 