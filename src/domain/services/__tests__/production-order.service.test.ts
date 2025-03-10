import { ProductionOrder, ProductionOrderStatus } from '../../models/production-order.model';
import { ProductionOrderServiceImpl } from '../production-order.service.impl';
import { ProductionOrderRepositoryImpl } from '../../repositories/production-order.repository.impl';

jest.mock('../../repositories/production-order.repository.impl');

describe('ProductionOrderService', () => {
  let service: ProductionOrderServiceImpl;
  let mockRepository: jest.Mocked<ProductionOrderRepositoryImpl>;

  beforeEach(() => {
    // Limpiar todos los mocks
    jest.clearAllMocks();
    
    // Crear una instancia mock del repositorio
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (ProductionOrderRepositoryImpl as jest.MockedClass<typeof ProductionOrderRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new ProductionOrderServiceImpl();
  });

  describe('inherited methods', () => {
    const mockOrder: ProductionOrder = {
      id: '1',
      responsibleWorkerId: 'worker1',
      productionDate: new Date(),
      recipes: [],
      status: ProductionOrderStatus.PLANNED,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockOrders = [mockOrder];
      mockRepository.findAll.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toEqual(mockOrders);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.findById('1');

      expect(result).toEqual(mockOrder);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockOrder);

      const result = await service.create(mockOrder);

      expect(result).toEqual(mockOrder);
      expect(mockRepository.create).toHaveBeenCalledWith(mockOrder);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.update('1', mockOrder);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockOrder);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockOrder);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 