import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Parameter } from '../../../domain/models/parameter.model';
import { ParameterServiceImpl } from '../../../domain/services/parameter.service.impl';

export function ParameterDetails() {
  const { id } = useParams<{ id: string }>();
  const parameterService = new ParameterServiceImpl();

  const getFields = (parameter: Parameter) => [
    { label: 'Nombre', value: parameter.name },
    { label: 'Código', value: parameter.code },
    { label: 'Valor', value: parameter.value },
    { label: 'Descripción', value: parameter.description, colSpan: 2 },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Parameter>
      title="Parámetro"
      fields={getFields}
      editPath={`/parameters/${id}/edit`}
      backPath="/parameters"
      service={parameterService}
      id={id}
    />
  );
} 