import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Unit, UnitConversion } from '../../../domain/models/unit.model';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { EntityStatus, getStatusOptions } from '@/domain/enums/entity-status.enum';

export function UnitForm() {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = React.useState<Partial<Unit>>({
    status: EntityStatus.ACTIVO
  });
  const unitService = React.useMemo(() => new UnitServiceImpl(), []);

  React.useEffect(() => {
    if (id) {
      unitService.findById(id).then(data => {
        if (data) setUnit(data);
      });
    }
  }, [id, unitService]);

  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'symbol',
      label: 'Símbolo',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: getStatusOptions(),
    },
    {
      name: 'conversions',
      label: 'Conversiones',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { 
            header: 'Unidad Destino', 
            accessor: 'toUnitId',
            reference: {
              field: {
                name: 'toUnitId',
                label: 'Unidad Destino',
                type: 'select' as const,
                relatedService: {
                  service: new UnitServiceImpl(),
                  labelField: 'name',
                },
              },
              displayField: 'name',
            },
          },
          { header: 'Factor', accessor: 'factor' },
          { 
            header: 'Operación', 
            accessor: 'operation',
            render: (value: unknown) => (value as string) === 'multiply' ? 'Multiplicar' : 'Dividir'
          },
        ],
        form: {
          fields: [
            {
              name: 'toUnitId',
              label: 'Unidad Destino',
              type: 'select' as const,
              required: true,
              relatedService: {
                service: new UnitServiceImpl(),
                labelField: 'name',
              },
            },
            {
              name: 'factor',
              label: 'Factor',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 1000',
            },
            {
              name: 'operation',
              label: 'Operación',
              type: 'select' as const,
              required: true,
              options: [
                { value: 'multiply', label: 'Multiplicar' },
                { value: 'divide', label: 'Dividir' },
              ],
            },
          ],
          emptyState: {
            title: 'No hay conversiones definidas',
            description: 'Haga clic en el botón "Agregar" para comenzar a definir las conversiones de esta unidad.',
          },
          modalTitles: {
            add: 'Agregar Conversión',
            edit: 'Modificar Conversión',
          },
          addButtonText: 'Agregar Conversión',
          editButtonTooltip: 'Modificar esta conversión',
          deleteButtonTooltip: 'Eliminar esta conversión',
          disableEditIf: (item: Partial<UnitConversion>) => item.isDefault === true,
          disableDeleteIf: (item: Partial<UnitConversion>) => item.isDefault === true,
        },
      },
    },
  ];

  return (
    <GenericForm<Unit>
      title={id ? 'Editar Unidad' : 'Nueva Unidad'}
      fields={fields}
      initialValues={unit}
      service={unitService}
      backPath="/units"
    />
  );
} 