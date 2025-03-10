import { Incident, IncidentStatus, IncidentType } from '../../models/incident.model';
import { IncidentServiceImpl } from '../incident.service.impl';
import { IncidentRepositoryImpl } from '../../repositories/incident.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/incident.repository.impl');
jest.mock('@/config/firebase');

describe('IncidentService', () => {
  let service: IncidentServiceImpl;
  let mockRepository: jest.Mocked<IncidentRepositoryImpl>;

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear una instancia mock del repositorio
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByType: jest.fn(),
      findByStatus: jest.fn(),
      findByReportedBy: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (IncidentRepositoryImpl as jest.MockedClass<typeof IncidentRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new IncidentServiceImpl();
  });

  describe('findByType', () => {
    it('should return incidents by type', async () => {
      const mockIncidents: Incident[] = [
        {
          id: '1',
          type: IncidentType.TASK,
          classification: 1,
          description: 'A test incident',
          reportedBy: 'user1',
          status: IncidentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByType.mockResolvedValue(mockIncidents);

      const result = await service.findByType(IncidentType.TASK);

      expect(result).toEqual(mockIncidents);
      expect(mockRepository.findByType).toHaveBeenCalledWith(IncidentType.TASK);
    });
  });

  describe('findByStatus', () => {
    it('should return incidents by status', async () => {
      const mockIncidents: Incident[] = [
        {
          id: '1',
          type: IncidentType.TASK,
          classification: 1,
          description: 'A test incident',
          reportedBy: 'user1',
          status: IncidentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByStatus.mockResolvedValue(mockIncidents);

      const result = await service.findByStatus(IncidentStatus.PENDING);

      expect(result).toEqual(mockIncidents);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(IncidentStatus.PENDING);
    });
  });

  describe('findByReportedBy', () => {
    it('should return incidents by reported user', async () => {
      const mockIncidents: Incident[] = [
        {
          id: '1',
          type: IncidentType.TASK,
          classification: 1,
          description: 'A test incident',
          reportedBy: 'user1',
          status: IncidentStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByReportedBy.mockResolvedValue(mockIncidents);

      const result = await service.findByReportedBy('user1');

      expect(result).toEqual(mockIncidents);
      expect(mockRepository.findByReportedBy).toHaveBeenCalledWith('user1');
    });
  });

  describe('inherited methods', () => {
    const mockIncident: Incident = {
      id: '1',
      type: IncidentType.TASK,
      classification: 1,
      description: 'A test incident',
      reportedBy: 'user1',
      status: IncidentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockIncidents = [mockIncident];
      mockRepository.findAll.mockResolvedValue(mockIncidents);

      const result = await service.findAll();

      expect(result).toEqual(mockIncidents);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockIncident);

      const result = await service.findById('1');

      expect(result).toEqual(mockIncident);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockIncident);

      const result = await service.create(mockIncident);

      expect(result).toEqual(mockIncident);
      expect(mockRepository.create).toHaveBeenCalledWith(mockIncident);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockIncident);

      const result = await service.update('1', mockIncident);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockIncident);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockIncident);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 