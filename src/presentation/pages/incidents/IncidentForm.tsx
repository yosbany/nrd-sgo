import { useState, FormEvent } from 'react';
import { Incident, CreateIncidentData, UpdateIncidentData } from '../../../data/interfaces/entities.interface';
import { FormGroup, Input, Select, Textarea } from '../../components/common/Form';
import Button from '../../components/common/Button';

interface IncidentFormProps {
  incident?: Incident;
  onSubmit: (incident: CreateIncidentData | UpdateIncidentData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const IncidentForm = ({
  incident,
  onSubmit,
  onCancel,
  isLoading = false
}: IncidentFormProps) => {
  const [formData, setFormData] = useState<CreateIncidentData | UpdateIncidentData>(
    incident ? {
      type: incident.type,
      description: incident.description,
      classification: incident.classification,
      status: incident.status,
      reportDate: incident.reportDate,
      location: incident.location,
      affectedArea: incident.affectedArea,
      immediateActions: incident.immediateActions,
      reporterId: incident.reporterId,
      reporterName: incident.reporterName
    } : {
      type: 'safety',
      description: '',
      classification: 1,
      status: 'pending',
      reportDate: new Date().toISOString(),
      location: '',
      affectedArea: '',
      immediateActions: '',
      reporterId: '',
      reporterName: ''
    }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormGroup>
        <Select
          label="Tipo de Incidente"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'safety' | 'maintenance' | 'quality' })}
          required
          options={[
            { value: 'safety', label: 'Seguridad' },
            { value: 'maintenance', label: 'Mantenimiento' },
            { value: 'quality', label: 'Calidad' }
          ]}
        />
      </FormGroup>

      <FormGroup>
        <Select
          label="Clasificación"
          value={formData.classification}
          onChange={(e) => setFormData({ ...formData, classification: Number(e.target.value) as 1 | 2 | 3 })}
          required
          options={[
            { value: '1', label: 'Nivel 1' },
            { value: '2', label: 'Nivel 2' },
            { value: '3', label: 'Nivel 3' }
          ]}
        />
      </FormGroup>

      <FormGroup>
        <Input
          label="Ubicación"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </FormGroup>

      <FormGroup>
        <Input
          label="Área Afectada"
          value={formData.affectedArea}
          onChange={(e) => setFormData({ ...formData, affectedArea: e.target.value })}
          required
        />
      </FormGroup>

      <FormGroup>
        <Textarea
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={4}
        />
      </FormGroup>

      <FormGroup>
        <Textarea
          label="Acciones Inmediatas"
          value={formData.immediateActions || ''}
          onChange={(e) => setFormData({ ...formData, immediateActions: e.target.value })}
          rows={4}
        />
      </FormGroup>

      {incident && (
        <FormGroup>
          <Select
            label="Estado"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'in_progress' | 'resolved' })}
            required
            options={[
              { value: 'pending', label: 'Pendiente' },
              { value: 'in_progress', label: 'En Progreso' },
              { value: 'resolved', label: 'Resuelto' }
            ]}
          />
        </FormGroup>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {incident ? 'Actualizar' : 'Crear'} Incidente
        </Button>
      </div>
    </form>
  );
};

export default IncidentForm; 