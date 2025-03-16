import { GenericList } from '../../components/common/GenericList';
import { Incident } from '../../../domain/models/incident.model';
import { IncidentServiceImpl } from '../../../domain/services/incident.service.impl';
import { getStatusOptions } from '@/domain/enums/type-incident.enum';
import { getStatusOptionsIncident } from '@/domain/enums/incident-status.enum';

export function IncidentList() {
  const incidentService = new IncidentServiceImpl();

  const columns = [
    {
      header: 'Tipo',
      accessor: 'type' as keyof Incident,
      type: 'tag' as const,
      tags: getStatusOptions()
    },
    {
      header: 'Fecha',
      accessor: 'date' as keyof Incident,
      type: 'date' as const,
    },
    {
      header: 'Descripción',
      accessor: 'description' as keyof Incident,
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof Incident,
      type: 'tag' as const,
      tags: getStatusOptionsIncident()
    },
  ];

  return (
    <GenericList<Incident>
      columns={columns}
      title="Incidentes"
      addPath="/incidents/new"
      backPath="/incidents"
      service={incidentService}
    />
  );
}