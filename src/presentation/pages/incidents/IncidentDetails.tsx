import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Incident, IncidentStatus, IncidentType } from '../../../domain/models/incident.model';
import { IncidentServiceImpl } from '../../../domain/services/incident.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';

export function IncidentDetails() {
  const { id } = useParams<{ id: string }>();
  const incidentService = new IncidentServiceImpl();
  const workerService = new WorkerServiceImpl();
  const roleService = new RoleServiceImpl();
  const productService = new ProductServiceImpl();
  const recipeService = new RecipeServiceImpl();

  const [reportedByName, setReportedByName] = React.useState<string>('');
  const [roleName, setRoleName] = React.useState<string>('');
  const [productName, setProductName] = React.useState<string>('');
  const [recipeName, setRecipeName] = React.useState<string>('');

  React.useEffect(() => {
    if (!id) return;

    const loadRelatedData = async () => {
      const incident = await incidentService.findById(id);
      if (!incident) return;

      // Load worker name
      if (incident.reportedByWorkerId) {
        const worker = await workerService.findById(incident.reportedByWorkerId);
        if (worker) setReportedByName(worker.name);
      }

      // Load type-specific data
      switch (incident.type) {
        case IncidentType.TASK:
          if (incident.taskId) {
            const role = await roleService.findById(incident.taskId);
            if (role) setRoleName(role.name);
          }
          break;
        case IncidentType.INVENTORY:
          if (incident.productId) {
            const product = await productService.findById(incident.productId);
            if (product) setProductName(product.name);
          }
          break;
        case IncidentType.PRODUCTION:
          if (incident.recipeId) {
            const recipe = await recipeService.findById(incident.recipeId);
            if (recipe) setRecipeName(recipe.name);
          }
          break;
      }
    };

    loadRelatedData();
  }, [id]);

  const getIncidentTypeLabel = (type: IncidentType) => {
    switch (type) {
      case IncidentType.PRODUCTION:
        return 'Producción';
      case IncidentType.TASK:
        return 'Tarea';
      case IncidentType.INVENTORY:
        return 'Inventario';
      default:
        return type;
    }
  };

  const getTypeSpecificField = (incident: Incident) => {
    switch (incident.type) {
      case IncidentType.TASK:
        return { label: 'Tarea', value: roleName || 'Cargando...' };
      case IncidentType.INVENTORY:
        return { label: 'Producto', value: productName || 'Cargando...' };
      case IncidentType.PRODUCTION:
        return { label: 'Receta', value: recipeName || 'Cargando...' };
      default:
        return null;
    }
  };

  const getFields = (incident: Incident) => {
    const fields = [
      { label: 'Tipo', value: getIncidentTypeLabel(incident.type) },
      { label: 'Descripción', value: incident.description },
      { label: 'Reportado Por', value: reportedByName || 'Cargando...' },
      { label: 'Estado', value: incident.status === IncidentStatus.PENDING ? 'Pendiente' : 'Resuelto' },
    ];

    const typeSpecificField = getTypeSpecificField(incident);
    if (typeSpecificField) {
      fields.push(typeSpecificField);
    }

    return fields;
  };

  if (!id) return null;

  return (
    <GenericDetails<Incident>
      title="Incidente"
      fields={getFields}
      editPath={`/incidents/${id}/edit`}
      backPath="/incidents"
      service={incidentService}
      id={id}
    />
  );
} 