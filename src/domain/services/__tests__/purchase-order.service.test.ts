import { PurchaseOrder, PurchaseOrderStatus } from '../../models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../purchase-order.service.impl';
import { PurchaseOrderRepositoryImpl } from '../../repositories/purchase-order.repository.impl';

jest.mock('../../repositories/purchase-order.repository.impl');

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderServiceImpl;
  let mockRepository: jest.Mocked<PurchaseOrderRepositoryImpl>;

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
      findByStatus: jest.fn(),
      findBySupplierId: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (PurchaseOrderRepositoryImpl as jest.MockedClass<typeof PurchaseOrderRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new PurchaseOrderServiceImpl();
  });

  describe('findByStatus', () => {
    it('should return purchase orders by status', async () => {
      const mockOrders: PurchaseOrder[] = [
        {
          id: '1',
          supplierId: 'supplier1',
          orderDate: new Date(),
          items: [
            {
              productId: 'product1',
              quantity: 10
            }
          ],
          status: PurchaseOrderStatus.PENDING,
          totalItems: 1,
          totalProducts: 10,
          totalProductoSupplier: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByStatus.mockResolvedValue(mockOrders);

      const result = await service.findByStatus(PurchaseOrderStatus.PENDING);

      expect(result).toEqual(mockOrders);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(PurchaseOrderStatus.PENDING);
    });
  });

  describe('findBySupplierId', () => {
    it('should return purchase orders by supplier', async () => {
      const mockOrders: PurchaseOrder[] = [
        {
          id: '1',
          supplierId: 'supplier1',
          orderDate: new Date(),
          items: [
            {
              productId: 'product1',
              quantity: 10
            }
          ],
          status: PurchaseOrderStatus.PENDING,
          totalItems: 1,
          totalProducts: 10,
          totalProductoSupplier: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findBySupplierId.mockResolvedValue(mockOrders);

      const result = await service.findBySupplierId('supplier1');

      expect(result).toEqual(mockOrders);
      expect(mockRepository.findBySupplierId).toHaveBeenCalledWith('supplier1');
    });
  });

  describe('inherited methods', () => {
    const mockOrder: PurchaseOrder = {
      id: '1',
      supplierId: 'supplier1',
      orderDate: new Date(),
      items: [
        {
          productId: 'product1',
          quantity: 10
        }
      ],
      status: PurchaseOrderStatus.PENDING,
      totalItems: 1,
      totalProducts: 10,
      totalProductoSupplier: 1000,
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