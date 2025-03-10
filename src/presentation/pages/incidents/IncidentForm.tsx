import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Incident, IncidentStatus, IncidentType } from '../../../domain/models/incident.model';
import { IncidentServiceImpl } from '../../../domain/services/incident.service.impl';
import { WorkerServiceImpl } from '@/domain/services/worker.service.impl';
import { RoleServiceImpl } from '@/domain/services/role.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';

export function IncidentForm() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = React.useState<Partial<Incident>>({});
  const [incidentType, setIncidentType] = React.useState<IncidentType | ''>('');
  const incidentService = new IncidentServiceImpl();

  React.useEffect(() => {
    if (id) {
      incidentService.findById(id).then(data => {
        if (data) {
          setIncident(data);
          setIncidentType(data.type);
        }
      });
    }
  }, [id]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value as IncidentType | '';
    setIncidentType(value);
  };

  const baseFields = [
    {
      name: 'type',
      label: 'Tipo',
      type: 'select' as const,
      required: true,
      options: [
        { value: IncidentType.PRODUCTION, label: 'Producción' },
        { value: IncidentType.TASK, label: 'Tarea' },
        { value: IncidentType.INVENTORY, label: 'Inventario' },
      ],
      onChange: handleTypeChange,
    },
    {
      name: 'reportedByWorkerId',
      label: 'Reportado Por',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new WorkerServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea' as const,
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: IncidentStatus.PENDING, label: 'Pendiente' },
        { value: IncidentStatus.RESOLVED, label: 'Resuelto' },
      ],
    },
  ];

  const getTypeSpecificField = () => {
    switch (incidentType) {
      case IncidentType.PRODUCTION:
        return {
          name: 'recipeId',
          label: 'Receta',
          type: 'select' as const,
          required: true,
          relatedService: {
            service: new RecipeServiceImpl(),
            labelField: 'name',
          },
        };
      case IncidentType.TASK:
        return {
          name: 'taskId',
          label: 'Tarea',
          type: 'select' as const,
          required: true,
          relatedService: {
            service: new RoleServiceImpl(),
            labelField: 'name',
          },
        };
      case IncidentType.INVENTORY:
        return {
          name: 'productId',
          label: 'Producto',
          type: 'select' as const,
          required: true,
          relatedService: {
            service: new ProductServiceImpl(),
            labelField: 'name',
          },
        };
      default:
        return null;
    }
  };

  const typeSpecificField = getTypeSpecificField();
  const fields = typeSpecificField 
    ? [...baseFields, typeSpecificField]
    : baseFields;

  return (
    <GenericForm<Incident>
      title={id ? 'Editar Incidente' : 'Nuevo Incidente'}
      fields={fields}
      initialValues={incident}
      service={incidentService}
      backPath="/incidents"
    />
  );
} 