import { Unit } from '../../models/unit.model';
import { UnitServiceImpl } from '../unit.service.impl';
import { UnitRepositoryImpl } from '../../repositories/unit.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/unit.repository.impl');
jest.mock('@/config/firebase');

describe('UnitService', () => {
  let service: UnitServiceImpl;
  let mockRepository: jest.Mocked<UnitRepositoryImpl>;

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
    (UnitRepositoryImpl as jest.MockedClass<typeof UnitRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new UnitServiceImpl();
  });

  describe('findByName', () => {
    it('should return units by name', async () => {
      const mockUnits: Unit[] = [
        {
          id: '1',
          name: 'Test Unit',
          symbol: 'TU',
          conversions: [
            {
              unitId: '2',
              factor: 1000
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByName.mockResolvedValue(mockUnits);

      const result = await service.findByName('Test Unit');

      expect(result).toEqual(mockUnits);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Unit');
    });
  });

  describe('inherited methods', () => {
    const mockUnit: Unit = {
      id: '1',
      name: 'Test Unit',
      symbol: 'TU',
      conversions: [
        {
          unitId: '2',
          factor: 1000
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockUnits = [mockUnit];
      mockRepository.findAll.mockResolvedValue(mockUnits);

      const result = await service.findAll();

      expect(result).toEqual(mockUnits);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockUnit);

      const result = await service.findById('1');

      expect(result).toEqual(mockUnit);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockUnit);

      const result = await service.create(mockUnit);

      expect(result).toEqual(mockUnit);
      expect(mockRepository.create).toHaveBeenCalledWith(mockUnit);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockUnit);

      const result = await service.update('1', mockUnit);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockUnit);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUnit);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 