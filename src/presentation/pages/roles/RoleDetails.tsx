import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Role, Task } from '../../../domain/models/role.model';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';

export function RoleDetails() {
  const { id } = useParams<{ id: string }>();
  const roleService = new RoleServiceImpl();

  const renderTasks = (tasks: Task[]) => {
    if (!tasks?.length) return 'No hay tareas';
    return (
      <>
        {tasks.map((task, index) => (
          <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td className="p-4 align-middle">
              <div className="font-medium">{task.taskName}</div>
            </td>
            <td className="p-4 align-middle text-muted-foreground">
              {task.frequency}
            </td>
          </tr>
        ))}
      </>
    );
  };

  const getFields = (role: Role) => [
    { label: 'Nombre', value: role.name },
    { label: 'Tipo', value: role.isProduction ? 'Producción' : 'Administrativo' },
    { label: 'Tareas', value: role.tasks?.length ? renderTasks(role.tasks) : 'No hay tareas' },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Role>
      title="Rol"
      fields={getFields}
      editPath={`/roles/${id}/edit`}
      backPath="/roles"
      service={roleService}
      id={id}
    />
  );
} 