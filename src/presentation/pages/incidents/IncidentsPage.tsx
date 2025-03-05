import { useState, useEffect } from 'react';
import { Plus, Filter } from 'react-feather';
import { IncidentRepository } from '../../../data/repositories/incident.repository';
import { Incident, CreateIncidentData, UpdateIncidentData } from '../../../data/interfaces/entities.interface';
import { AuthService } from '../../../auth/services/auth.service';
import PageTitle from '../../components/common/PageTitle';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { FormGroup, Select } from '../../components/common/Form';
import IncidentForm from './IncidentForm';
import IncidentDetail from './IncidentDetail';

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    classification: 'all'
  });

  const incidentRepository = new IncidentRepository();
  const authService = new AuthService();

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Wait for authentication to be ready and check if authenticated
      await authService.waitForAuthReady();
      const isAuthed = await authService.isAuthenticated();
      
      if (!isAuthed) {
        throw new Error('Usuario no autenticado');
      }
      
      let filteredIncidents = await incidentRepository.getAll();

      if (filters.status !== 'all') {
        filteredIncidents = filteredIncidents.filter(incident => incident.status === filters.status);
      }
      if (filters.type !== 'all') {
        filteredIncidents = filteredIncidents.filter(incident => incident.type === filters.type);
      }
      if (filters.classification !== 'all') {
        filteredIncidents = filteredIncidents.filter(incident => 
          incident.classification === Number(filters.classification)
        );
      }

      setIncidents(filteredIncidents);
    } catch (error) {
      console.error('Error loading incidents:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los incidentes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [filters]);

  const handleCreateIncident = async (incidentData: Partial<CreateIncidentData>) => {
    setIsCreating(true);
    setError(null);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('Usuario no autenticado');

      const newIncident: CreateIncidentData = {
        ...incidentData,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName || 'Usuario',
        type: incidentData.type || 'safety',
        description: incidentData.description || '',
        classification: incidentData.classification || 1,
        status: 'pending',
        reportDate: new Date().toISOString(),
        location: incidentData.location || '',
        affectedArea: incidentData.affectedArea || ''
      };

      await incidentRepository.create(newIncident);
      setIsCreateModalOpen(false);
      loadIncidents();
    } catch (error) {
      console.error('Error creating incident:', error);
      setError('Error al crear el incidente. Por favor, intente nuevamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateIncident = async (updatedIncident: UpdateIncidentData) => {
    if (!selectedIncident) return;
    
    try {
      await incidentRepository.update(selectedIncident.id, updatedIncident);
      setSelectedIncident(null);
      loadIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
      setError('Error al actualizar el incidente. Por favor, intente nuevamente.');
    }
  };

  const columns = [
    {
      header: 'Fecha',
      accessor: (incident: Incident) => new Date(incident.reportDate).toLocaleDateString()
    },
    {
      header: 'Tipo',
      accessor: (incident: Incident) => {
        const types = {
          safety: 'Seguridad',
          maintenance: 'Mantenimiento',
          quality: 'Calidad'
        };
        return types[incident.type];
      }
    },
    {
      header: 'Descripción',
      accessor: (incident: Incident) => incident.description
    },
    {
      header: 'Estado',
      accessor: (incident: Incident) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            incident.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : incident.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {incident.status === 'pending'
            ? 'Pendiente'
            : incident.status === 'in_progress'
            ? 'En Progreso'
            : 'Resuelto'}
        </span>
      )
    },
    {
      header: 'Clasificación',
      accessor: (incident: Incident) => `Nivel ${incident.classification}`
    },
    {
      header: 'Reportado por',
      accessor: (incident: Incident) => incident.reporterName
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-300">
          Cargando incidentes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          {error}
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => loadIncidents()}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Incidentes"
        subtitle="Gestiona los incidentes reportados"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuevo Incidente
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>

          <FormGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select
                label="Estado"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'pending', label: 'Pendiente' },
                  { value: 'in_progress', label: 'En Progreso' },
                  { value: 'resolved', label: 'Resuelto' }
                ]}
              />
              <Select
                label="Tipo"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'safety', label: 'Seguridad' },
                  { value: 'maintenance', label: 'Mantenimiento' },
                  { value: 'quality', label: 'Calidad' }
                ]}
              />
              <Select
                label="Clasificación"
                value={filters.classification}
                onChange={(e) => setFilters({ ...filters, classification: e.target.value })}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: '1', label: 'Nivel 1' },
                  { value: '2', label: 'Nivel 2' },
                  { value: '3', label: 'Nivel 3' }
                ]}
              />
            </div>
          </FormGroup>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={incidents}
          isLoading={isLoading}
          emptyMessage="No hay incidentes que mostrar"
          onRowClick={(incident) => setSelectedIncident(incident)}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Incidente"
        size="lg"
      >
        <IncidentForm
          onSubmit={handleCreateIncident}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Detail Modal */}
      {selectedIncident && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedIncident(null)}
          title="Detalles del Incidente"
          size="xl"
        >
          <IncidentDetail
            incident={selectedIncident}
            onUpdate={handleUpdateIncident}
          />
        </Modal>
      )}
    </div>
  );
};

export default IncidentsPage; 