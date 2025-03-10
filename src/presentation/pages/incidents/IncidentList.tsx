import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Incident, IncidentStatus, IncidentType } from '../../../domain/models/incident.model';
import { IncidentServiceImpl } from '../../../domain/services/incident.service.impl';
import { WorkerServiceImpl } from '@/domain/services/worker.service.impl';

export function IncidentList() {
  const incidentService = new IncidentServiceImpl();
  const workerService = new WorkerServiceImpl();
  const [workerNames, setWorkerNames] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadWorkerNames = async () => {
      try {
        const workers = await workerService.findAll();
        const namesMap: Record<string, string> = {};
        workers.forEach(worker => {
          namesMap[worker.id] = worker.name;
        });
        setWorkerNames(namesMap);
      } catch (error) {
        console.error('Error loading worker names:', error);
      }
    };

    loadWorkerNames();
  }, []);

  const getIncidentTypeLabel = (type: IncidentType) => {
    switch (type) {
      case IncidentType.PRODUCTION:
        return 'Producción';
      case IncidentType.TASK:
        return 'Tarea';
      case IncidentType.INVENTORY:
        return 'Inventario';
      default:
        return type;
    }
  };

  const columns = [
    {
      header: 'Tipo',
      accessor: 'type' as keyof Incident,
      render: (item: Incident) => getIncidentTypeLabel(item.type),
    },
    {
      header: 'Descripción',
      accessor: 'description' as keyof Incident,
    },
    {
      header: 'Reportado Por',
      accessor: 'reportedByWorkerId' as keyof Incident,
      render: (item: Incident) => workerNames[item.reportedByWorkerId] || 'Cargando...',
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof Incident,
      render: (item: Incident) =>
        item.status === IncidentStatus.PENDING ? 'Pendiente' : 'Resuelto',
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