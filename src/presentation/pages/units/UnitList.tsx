import { GenericList } from '../../components/common/GenericList';
import { Unit } from '../../../domain/models/unit.model';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';

export function UnitList() {
  const unitService = new UnitServiceImpl();

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Unit },
    { header: 'Símbolo', accessor: 'symbol' as keyof Unit },
    {
      header: 'Conversiones',
      accessor: 'conversions' as keyof Unit,
      render: (item: Unit) => item.conversions?.length || 0,
    },
  ];

  return (
    <GenericList<Unit>
      columns={columns}
      title="Unidades"
      addPath="/units/new"
      backPath="/units"
      service={unitService}
    />
  );
} 