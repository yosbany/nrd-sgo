import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Parameter } from '../../../domain/models/parameter.model';
import { ParameterServiceImpl } from '../../../domain/services/parameter.service.impl';
import { getOptions } from '@/domain/enums/entity-status.enum';

export function ParameterForm() {
  const { id } = useParams<{ id: string }>();
  const [parameter, setParameter] = React.useState<Partial<Parameter>>({});
  const parameterService = new ParameterServiceImpl();

  React.useEffect(() => {
    if (id) {
      parameterService.findById(id).then(data => {
        if (data) setParameter(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'code',
      label: 'Código',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'value',
      label: 'Valor',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: getOptions(),
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea' as const,
    },
  ];

  return (
    <GenericForm<Parameter>
      title={id ? 'Editar Parámetro' : 'Nuevo Parámetro'}
      fields={fields}
      initialValues={parameter}
      service={parameterService}
      backPath="/parameters"
    />
  );
} 