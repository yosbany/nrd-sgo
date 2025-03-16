import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Unit, UnitConversion } from '../../../domain/models/unit.model';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import React from 'react';
import { EntityStatus } from '@/domain/enums/entity-status.enum';

export function UnitDetails() {
  const { id } = useParams<{ id: string }>();
  const unitService = new UnitServiceImpl();
  const [units, setUnits] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadUnits = async () => {
      const unitsData = await unitService.findAll();
      const unitsMap = unitsData.reduce((acc, unit) => ({
        ...acc,
        [unit.id as string]: unit.name
      }), {});
      setUnits(unitsMap);
    };
    loadUnits();
  }, []);

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case 'multiply':
        return 'Multiplicar';
      case 'divide':
        return 'Dividir';
      default:
        return operation;
    }
  };

  const renderConversions = (conversions: UnitConversion[]) => {
    if (!conversions?.length) return 'No hay conversiones';
    return (
      <>
        {conversions.map((conversion, index) => (
          <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            <td className="p-4 align-middle">
              <div className="font-medium">{units[conversion.toUnitId] || 'Unidad no encontrada'}</div>
            </td>
            <td className="p-4 align-middle text-muted-foreground">
              {conversion.factor} ({getOperationLabel(conversion.operation)})
            </td>
          </tr>
        ))}
      </>
    );
  };

  const getFields = (unit: Unit) => [
    { label: 'Nombre', value: unit.name },
    { label: 'Símbolo', value: unit.symbol },
    { label: 'Estado', value: unit.status === EntityStatus.ACTIVO ? 'Activo' : 'Inactivo' },
    { label: 'Conversiones', value: unit.conversions?.length ? renderConversions(unit.conversions) : 'No hay conversiones' },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Unit>
      title="Unidad"
      fields={getFields}
      editPath={`/units/${id}/edit`}
      backPath="/units"
      service={unitService}
      id={id}
    />
  );
}