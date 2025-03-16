import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Incident } from '../../../domain/models/incident.model';
import { IncidentServiceImpl } from '../../../domain/services/incident.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { RoleServiceImpl } from '../../../domain/services/role.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { getLabel, IncidentType } from '@/domain/enums/type-incident.enum';
import { getLabel as getStatusLabel } from '@/domain/enums/incident-status.enum';


export function IncidentDetails() {
  const { id } = useParams<{ id: string }>();
  const incidentService = React.useMemo(() => new IncidentServiceImpl(), []);
  const workerService = React.useMemo(() => new WorkerServiceImpl(), []);
  const roleService = React.useMemo(() => new RoleServiceImpl(), []);
  const productService = React.useMemo(() => new ProductServiceImpl(), []);
  const recipeService = React.useMemo(() => new RecipeServiceImpl(), []);

  const [reportedByName] = React.useState<string>('');
  const [roleName, setRoleName] = React.useState<string>('');
  const [productName, setProductName] = React.useState<string>('');
  const [recipeName, setRecipeName] = React.useState<string>('');

  React.useEffect(() => {
    if (!id) return;

    const loadRelatedData = async () => {
      const incident = await incidentService.findById(id);
      if (!incident) return;

      // Load type-specific data
      switch (incident.type) {
        case IncidentType.TAREAS:
          if (incident.taskId) {
            const role = await roleService.findById(incident.taskId);
            if (role) setRoleName(role.name);
          }
          break;
        case IncidentType.INVENTARIOS:
          if (incident.products?.length) {
            const productNames = await Promise.all(
              incident.products.map(async (item) => {
                const product = await productService.findById(item.productId);
                return product?.name || '';
              })
            );
            setProductName(productNames.join(', '));
          }
          break;
        case IncidentType.PRODUCCIONES:
          if (incident.recipeId) {
            const recipe = await recipeService.findById(incident.recipeId);
            if (recipe) setRecipeName(recipe.name);
          }
          break;
      }
    };

    loadRelatedData();
  }, [id, incidentService, workerService, roleService, productService, recipeService]);

  const getFields = (incident: Incident) => {
    const fields = [
      { label: 'Tipo', value: getLabel(incident.type) },
      { label: 'Fecha', value: incident.date instanceof Date ? incident.date.toLocaleDateString() : 'No disponible' },
      { label: 'Descripción', value: incident.description },
      { label: 'Reportado Por', value: reportedByName || 'Cargando...' },
      { label: 'Estado', value: getStatusLabel(incident.status) },
    ];

    const typeSpecificField = (() => {
      switch (incident.type) {
        case IncidentType.TAREAS:
          return { label: 'Tarea', value: roleName || 'Cargando...' };
        case IncidentType.INVENTARIOS:
          return { label: 'Productos', value: productName || 'Cargando...' };
        case IncidentType.PRODUCCIONES:
          return { label: 'Receta', value: recipeName || 'Cargando...' };
        default:
          return null;
      }
    })();

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