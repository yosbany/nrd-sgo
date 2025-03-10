import { Role, TaskFrequency } from '../../models/role.model';
import { RoleServiceImpl } from '../role.service.impl';
import { RoleRepositoryImpl } from '../../repositories/role.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/role.repository.impl');
jest.mock('@/config/firebase');

describe('RoleService', () => {
  let service: RoleServiceImpl;
  let mockRepository: jest.Mocked<RoleRepositoryImpl>;

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
      findByName: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (RoleRepositoryImpl as jest.MockedClass<typeof RoleRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new RoleServiceImpl();
  });

  describe('findByName', () => {
    it('should return roles by name', async () => {
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'Test Role',
          isProduction: true,
          tasks: [
            {
              taskName: 'Task 1',
              frequency: TaskFrequency.DAILY
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByName.mockResolvedValue(mockRoles);

      const result = await service.findByName('Test Role');

      expect(result).toEqual(mockRoles);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Role');
    });
  });

  describe('inherited methods', () => {
    const mockRole: Role = {
      id: '1',
      name: 'Test Role',
      isProduction: true,
      tasks: [
        {
          taskName: 'Task 1',
          frequency: TaskFrequency.DAILY
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockRoles = [mockRole];
      mockRepository.findAll.mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockRole);

      const result = await service.findById('1');

      expect(result).toEqual(mockRole);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockRole);

      const result = await service.create(mockRole);

      expect(result).toEqual(mockRole);
      expect(mockRepository.create).toHaveBeenCalledWith(mockRole);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockRole);

      const result = await service.update('1', mockRole);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockRole);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockRole);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 