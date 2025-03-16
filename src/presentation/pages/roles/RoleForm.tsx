import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Role } from '../../../domain/models/role.model';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';
import { getTaskFrequencyOptions } from '@/domain/enums/task-frequency.enum';

export function RoleForm() {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = React.useState<Partial<Role>>({});
  const roleService = React.useMemo(() => new RoleServiceImpl(), []);

  React.useEffect(() => {
    if (id) {
      roleService.findById(id).then(data => {
        if (data) setRole(data);
      });
    }
  }, [id, roleService]);

  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'isProduction',
      label: '¿Es de Producción?',
      type: 'boolean' as const,
      required: true,
      placeholder: 'Marque si el rol es de producción',
    },
    {
      name: 'tasks',
      label: 'Tareas',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { header: 'Tarea', accessor: 'taskName' },
          { 
            header: 'Frecuencia', 
            accessor: 'frequency',
            render: (value: unknown) => {
              if (typeof value !== 'string') return 'N/A';
              const option = getTaskFrequencyOptions().find(opt => opt.value === value);
              return option?.label || 'N/A';
            }
          },
        ],
        form: {
          fields: [
            {
              name: 'taskName',
              label: 'Nombre de la Tarea',
              type: 'text' as const,
              required: true,
              placeholder: 'Ej: Limpiar área de trabajo',
            },
            {
              name: 'frequency',
              label: 'Frecuencia',
              type: 'select' as const,
              required: true,
              options: getTaskFrequencyOptions(),
            },
          ],
          emptyState: {
            title: 'No hay tareas definidas',
            description: 'Haga clic en el botón "Agregar" para comenzar a definir las tareas de este rol.',
          },
          modalTitles: {
            add: 'Agregar Tarea',
            edit: 'Modificar Tarea',
          },
          addButtonText: 'Agregar Tarea',
          editButtonTooltip: 'Modificar esta tarea',
          deleteButtonTooltip: 'Eliminar esta tarea',
        },
      },
    },
  ];

  return (
    <GenericForm<Role>
      title={id ? 'Editar Rol' : 'Nuevo Rol'}
      fields={fields}
      initialValues={role}
      service={roleService}
      backPath="/roles"
    />
  );
} 