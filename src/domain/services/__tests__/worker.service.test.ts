import { Worker } from '../../models/worker.model';
import { WorkerServiceImpl } from '../worker.service.impl';
import { WorkerRepositoryImpl } from '../../repositories/worker.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/worker.repository.impl');
jest.mock('@/config/firebase');

describe('WorkerService', () => {
  let service: WorkerServiceImpl;
  let mockRepository: jest.Mocked<WorkerRepositoryImpl>;

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
      findByName: jest.fn(),
      findByPrimaryRole: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (WorkerRepositoryImpl as jest.MockedClass<typeof WorkerRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new WorkerServiceImpl();
  });

  describe('findByName', () => {
    it('should return workers by name', async () => {
      const mockWorkers: Worker[] = [
        {
          id: '1',
          name: 'Test Worker',
          primaryRoleId: 'role1',
          hireDate: new Date(),
          monthlySalary: 1000,
          leaveBalance: 10,
          leaveSalaryBalance: 1000,
          vacationSalaryBalance: 1000,
          bonusSalaryBalance: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByName.mockResolvedValue(mockWorkers);

      const result = await service.findByName('Test Worker');

      expect(result).toEqual(mockWorkers);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Worker');
    });
  });

  describe('findByPrimaryRole', () => {
    it('should return workers by primary role', async () => {
      const mockWorkers: Worker[] = [
        {
          id: '1',
          name: 'Test Worker',
          primaryRoleId: 'role1',
          hireDate: new Date(),
          monthlySalary: 1000,
          leaveBalance: 10,
          leaveSalaryBalance: 1000,
          vacationSalaryBalance: 1000,
          bonusSalaryBalance: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByPrimaryRole.mockResolvedValue(mockWorkers);

      const result = await service.findByPrimaryRoleId('role1');

      expect(result).toEqual(mockWorkers);
      expect(mockRepository.findByPrimaryRole).toHaveBeenCalledWith('role1');
    });
  });

  describe('inherited methods', () => {
    const mockWorker: Worker = {
      id: '1',
      name: 'Test Worker',
      primaryRoleId: 'role1',
      hireDate: new Date(),
      monthlySalary: 1000,
      leaveBalance: 10,
      leaveSalaryBalance: 1000,
      vacationSalaryBalance: 1000,
      bonusSalaryBalance: 1000,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockWorkers = [mockWorker];
      mockRepository.findAll.mockResolvedValue(mockWorkers);

      const result = await service.findAll();

      expect(result).toEqual(mockWorkers);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockWorker);

      const result = await service.findById('1');

      expect(result).toEqual(mockWorker);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockWorker);

      const result = await service.create(mockWorker);

      expect(result).toEqual(mockWorker);
      expect(mockRepository.create).toHaveBeenCalledWith(mockWorker);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockWorker);

      const result = await service.update('1', mockWorker);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockWorker);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockWorker);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 