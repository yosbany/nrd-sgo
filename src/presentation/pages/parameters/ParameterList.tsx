import { GenericList } from '../../components/common/GenericList';
import { Parameter } from '../../../domain/models/parameter.model';
import { ParameterServiceImpl } from '../../../domain/services/parameter.service.impl';
import { getStatusOptions } from '@/domain/enums/entity-status.enum';

export function ParameterList() {
  const parameterService = new ParameterServiceImpl();

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Parameter },
    { header: 'Código', accessor: 'code' as keyof Parameter },
    { header: 'Valor', accessor: 'value' as keyof Parameter },
     {
      header: 'Estado',
      accessor: 'status' as keyof Parameter,
      type: 'tag' as const,
      tags: getStatusOptions()
    },
  ];

  return (
    <GenericList<Parameter>
      columns={columns}
      title="Parámetros"
      addPath="/parameters/new"
      backPath="/parameters"
      service={parameterService}
    />
  );
} 