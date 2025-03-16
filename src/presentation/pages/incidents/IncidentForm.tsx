import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Incident, ProductItem } from '../../../domain/models/incident.model';
import { IncidentServiceImpl } from '../../../domain/services/incident.service.impl';
import { RoleServiceImpl } from '@/domain/services/role.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { Product } from '@/domain/models/product.model';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { getOptions, IncidentType } from '@/domain/enums/type-incident.enum';
import { getStatusOptionsIncident, IncidentStatus } from '@/domain/enums/incident-status.enum';
import { getInventoryAffectTypeOptions } from '@/domain/enums/inventory-affect-type.enum';

interface SelectOption {
  value: string;
  label: string;
}

export function IncidentForm() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = React.useState<Partial<Incident>>({
    type: undefined,
    status: IncidentStatus.PENDIENTE,
    date: new Date()
  });
  const [incidentType, setIncidentType] = React.useState<IncidentType | ''>('');
  const [taskOptions, setTaskOptions] = React.useState<SelectOption[]>([]);
  const incidentService = React.useMemo(() => new IncidentServiceImpl(), []);
  const roleService = React.useMemo(() => new RoleServiceImpl(), []);

  React.useEffect(() => {
    if (id) {
      incidentService.findById(id).then(data => {
        if (data) {
          setIncident(data);
          setIncidentType(data.type);
        }
      });
    }
  }, [id, incidentService]);

  React.useEffect(() => {
    const loadTaskOptions = async () => {
      try {
        const roles = await roleService.findAll();
        console.log('Roles cargados:', roles);
        
        if (!roles || !Array.isArray(roles)) {
          console.error('No se recibieron roles válidos');
          return;
        }

        const options: SelectOption[] = [];
        
        for (const role of roles) {
          if (role?.id && role?.name && role?.tasks && Array.isArray(role.tasks)) {
            role.tasks.forEach(task => {
              if (task?.taskName) {
                options.push({
                  value: String(role.id),
                  label: `${role.name} - ${task.taskName}`
                });
              }
            });
          }
        }
        
        console.log('Opciones de tareas generadas:', options);
        setTaskOptions(options);
      } catch (error) {
        console.error('Error al cargar las tareas:', error);
        setTaskOptions([]);
      }
    };

    loadTaskOptions();
  }, [roleService]);

  const baseFields = [
    {
      name: 'type',
      label: 'Tipo',
      type: 'select' as const,
      required: true,
      options: getOptions(),
      onChange: (value: unknown) => {
        const newType = value as IncidentType;
        console.log('Cambiando tipo a:', newType);
        console.log('Opciones de tareas disponibles:', taskOptions);
        setIncidentType(newType);
        setIncident(prev => ({ ...prev, type: newType }));
      },
    },
    {
      name: 'date',
      label: 'Fecha',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: getStatusOptionsIncident(),
    },
  ];

  const getTypeSpecificField = () => {
    switch (incidentType) {
      case IncidentType.PRODUCCIONES:
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
      case IncidentType.TAREAS:
        return {
          name: 'taskId',
          label: 'Tarea',
          type: 'select' as const,
          required: true,
          placeholder: 'Seleccione una tarea',
          options: taskOptions,
          onChange: (value: unknown) => {
            console.log('Valor seleccionado:', value);
            if (!value || typeof value !== 'string') {
              console.log('Valor inválido');
              return { taskId: '' };
            }
            console.log('RoleId:', value);
            return { taskId: value };
          }
        };
      case IncidentType.INVENTARIOS:
        return {
          name: 'products',
          label: 'Productos Afectados',
          type: 'array' as const,
          required: true,
          arrayConfig: {
            columns: [
              {
                header: 'Producto',
                accessor: 'productId',
                reference: {
                  field: {
                    name: 'productId',
                    label: 'Producto',
                    type: 'select' as const,
                    required: true,
                    relatedService: {
                      service: new ProductServiceImpl(),
                      labelField: 'name',
                      transform: async (products: Product[], currentValues?: ProductItem[]) => {
                        const existingProductIds = currentValues?.map(item => item.productId) || [];
                        return products.filter(product => product.id && !existingProductIds.includes(product.id));
                      }
                    },
                  },
                  displayField: 'name'
                }
              },
              {
                header: 'Ajuste de Stock',
                accessor: 'stockAdjustment'
              },
              {
                header: 'Tipo de Afectación',
                accessor: 'type',
                render: (value: unknown) => {
                  if (typeof value !== 'string') return '';
                  const option = getInventoryAffectTypeOptions().find(opt => opt.value === value);
                  return option?.label || value;
                }
              }
            ],
            form: {
              fields: [
                {
                  name: 'productId',
                  label: 'Producto',
                  type: 'select' as const,
                  required: true,
                  relatedService: {
                    service: new ProductServiceImpl(),
                    labelField: 'name',
                    transform: async (products: Product[], currentValues?: ProductItem[]) => {
                      const existingProductIds = currentValues?.map(item => item.productId) || [];
                      return products.filter(product => product.id && !existingProductIds.includes(product.id));
                    }
                  },
                },
                {
                  name: 'stockAdjustment',
                  label: 'Ajuste de Stock',
                  type: 'number' as const,
                  required: true,
                },
                {
                  name: 'type',
                  label: 'Tipo de Afectación',
                  type: 'select' as const,
                  required: true,
                  options: getInventoryAffectTypeOptions()
                }
              ],
              modalTitles: {
                add: 'Agregar Producto Afectado',
                edit: 'Editar Producto Afectado'
              },
              addButtonText: 'Agregar Producto',
              editButtonTooltip: 'Editar Producto',
              deleteButtonTooltip: 'Eliminar Producto'
            }
          }
        };
      default:
        return null;
    }
  };

  const typeSpecificField = getTypeSpecificField();
  const fields = typeSpecificField 
    ? [...baseFields, typeSpecificField, {
        name: 'description',
        label: 'Descripción',
        type: 'textarea' as const,
        required: true,
      }]
    : [...baseFields, {
        name: 'description',
        label: 'Descripción',
        type: 'textarea' as const,
        required: true,
      }];

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