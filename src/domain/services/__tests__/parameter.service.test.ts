import { Parameter } from '../../models/parameter.model';
import { ParameterServiceImpl } from '../parameter.service.impl';
import { ParameterRepositoryImpl } from '../../repositories/parameter.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/parameter.repository.impl');
jest.mock('@/config/firebase');

describe('ParameterService', () => {
  let service: ParameterServiceImpl;
  let mockRepository: jest.Mocked<ParameterRepositoryImpl>;

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
    (ParameterRepositoryImpl as jest.MockedClass<typeof ParameterRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new ParameterServiceImpl();
  });

  describe('findByName', () => {
    it('should return parameters by name', async () => {
      const mockParameters: Parameter[] = [
        {
          id: '1',
          name: 'Test Parameter',
          value: 'test value',
          description: 'A test parameter',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByName.mockResolvedValue(mockParameters);

      const result = await service.findByName('Test Parameter');

      expect(result).toEqual(mockParameters);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Parameter');
    });
  });

  describe('inherited methods', () => {
    const mockParameter: Parameter = {
      id: '1',
      name: 'Test Parameter',
      value: 'test value',
      description: 'A test parameter',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockParameters = [mockParameter];
      mockRepository.findAll.mockResolvedValue(mockParameters);

      const result = await service.findAll();

      expect(result).toEqual(mockParameters);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockParameter);

      const result = await service.findById('1');

      expect(result).toEqual(mockParameter);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockParameter);

      const result = await service.create(mockParameter);

      expect(result).toEqual(mockParameter);
      expect(mockRepository.create).toHaveBeenCalledWith(mockParameter);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockParameter);

      const result = await service.update('1', mockParameter);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockParameter);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockParameter);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 