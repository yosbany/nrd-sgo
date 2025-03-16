import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Role, Task } from '../../../domain/models/role.model';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';
import { ArrayTable } from '../../components/common/ArrayTable';

export function RoleDetails() {
  const { id } = useParams<{ id: string }>();
  const roleService = new RoleServiceImpl();

  const renderTasks = (tasks: Task[]) => {
    const columns = [
      {
        header: 'Tarea',
        accessor: (task: Task) => (
          <div className="font-medium">{task.taskName}</div>
        )
      },
      {
        header: 'Frecuencia',
        accessor: (task: Task) => task.frequency
      }
    ];

    return <ArrayTable data={tasks} columns={columns} />;
  };

  const getFields = (role: Role) => [
    { label: 'Nombre', value: role.name },
    { label: 'Tipo', value: role.isProduction ? 'Producción' : 'Administrativo' },
    { label: 'Tareas', value: renderTasks(role.tasks || []) },
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