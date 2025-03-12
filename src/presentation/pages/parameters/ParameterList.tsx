import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Parameter } from '../../../domain/models/parameter.model';
import { ParameterServiceImpl } from '../../../domain/services/parameter.service.impl';

export function ParameterList() {
  const parameterService = new ParameterServiceImpl();

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Parameter },
    { header: 'Código', accessor: 'code' as keyof Parameter },
    { header: 'Valor', accessor: 'value' as keyof Parameter },
    {
      header: 'Descripción',
      accessor: 'description' as keyof Parameter,
      render: (item: Parameter) => item.description || '-',
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