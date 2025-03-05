import { useState } from 'react';
import { Clock, MapPin, User, AlertTriangle, Edit2 } from 'react-feather';
import { Incident, UpdateIncidentData } from '../../../data/interfaces/entities.interface';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import IncidentForm from './IncidentForm';

interface IncidentDetailProps {
  incident: Incident;
  onUpdate: (incident: UpdateIncidentData) => Promise<void>;
}

const IncidentDetail = ({ incident, onUpdate }: IncidentDetailProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (updatedIncident: UpdateIncidentData) => {
    setIsUpdating(true);
    try {
      await onUpdate(updatedIncident);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating incident:', error);
      // TODO: Implement error handling
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Incident['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'resolved':
        return 'Resuelto';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: Incident['type']) => {
    switch (type) {
      case 'safety':
        return 'Seguridad';
      case 'maintenance':
        return 'Mantenimiento';
      case 'quality':
        return 'Calidad';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              incident.status
            )}`}
          >
            {getStatusLabel(incident.status)}
          </div>
          <span className="text-sm text-gray-500">
            ID: {incident.id.slice(0, 8)}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Edit2 />}
          onClick={() => setIsEditModalOpen(true)}
        >
          Editar
        </Button>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Detalles del Incidente
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Información principal del incidente reportado
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="text-sm text-gray-900">{getTypeLabel(incident.type)}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Clasificación
                  </dt>
                  <dd className="text-sm text-gray-900">
                    Nivel {incident.classification}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500">
                    Descripción
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {incident.description}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500">
                    Acciones Inmediatas
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {incident.immediateActions || 'No se registraron acciones inmediatas'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Información Adicional
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Detalles sobre la ubicación y el reporte
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <dl className="divide-y divide-gray-200">
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ubicación
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {incident.location}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500">
                    Área Afectada
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {incident.affectedArea}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Reportado por
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {incident.reporterName}
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Fecha de Reporte
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(incident.reportDate).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Incidente"
        size="lg"
      >
        <IncidentForm
          incident={incident}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isUpdating}
        />
      </Modal>
    </div>
  );
};

export default IncidentDetail; 