import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Role } from '../../../domain/models/role.model';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';

export function RoleList() {
  const roleService = new RoleServiceImpl();

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Role },
    {
      header: 'Tipo',
      accessor: 'isProduction' as keyof Role,
      render: (item: Role) => (item.isProduction ? 'Producción' : 'Administrativo'),
    },
    {
      header: 'Tareas',
      accessor: 'tasks' as keyof Role,
      render: (item: Role) => item.tasks?.length || 0,
    },
  ];

  return (
    <GenericList<Role>
      columns={columns}
      title="Roles"
      addPath="/roles/new"
      backPath="/roles"
      service={roleService}
    />
  );
} 