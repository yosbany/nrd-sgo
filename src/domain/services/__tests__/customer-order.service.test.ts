import { CustomerOrder, CustomerOrderStatus } from '../../models/customer-order.model';
import { CustomerOrderServiceImpl } from '../customer-order.service.impl';
import { CustomerOrderRepositoryImpl } from '../../repositories/customer-order.repository.impl';

jest.mock('../../repositories/customer-order.repository.impl');

describe('CustomerOrderService', () => {
  let service: CustomerOrderServiceImpl;
  let mockRepository: jest.Mocked<CustomerOrderRepositoryImpl>;

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
      findByCustomerId: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (CustomerOrderRepositoryImpl as jest.MockedClass<typeof CustomerOrderRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new CustomerOrderServiceImpl();
  });

  describe('findByStatus', () => {
    it('should return customer orders by status', async () => {
      const mockOrders: CustomerOrder[] = [
        {
          id: '1',
          customerId: 'customer1',
          orderDate: new Date(),
          items: [
            {
              productId: 'product1',
              quantity: 10
            }
          ],
          status: CustomerOrderStatus.PENDING,
          totalItems: 1,
          totalProducts: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByStatus.mockResolvedValue(mockOrders);

      const result = await service.findByStatus(CustomerOrderStatus.PENDING);

      expect(result).toEqual(mockOrders);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(CustomerOrderStatus.PENDING);
    });
  });

  describe('findByCustomerId', () => {
    it('should return customer orders by customer', async () => {
      const mockOrders: CustomerOrder[] = [
        {
          id: '1',
          customerId: 'customer1',
          orderDate: new Date(),
          items: [
            {
              productId: 'product1',
              quantity: 10
            }
          ],
          status: CustomerOrderStatus.PENDING,
          totalItems: 1,
          totalProducts: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByCustomerId.mockResolvedValue(mockOrders);

      const result = await service.findByCustomerId('customer1');

      expect(result).toEqual(mockOrders);
      expect(mockRepository.findByCustomerId).toHaveBeenCalledWith('customer1');
    });
  });

  describe('inherited methods', () => {
    const mockOrder: CustomerOrder = {
      id: '1',
      customerId: 'customer1',
      orderDate: new Date(),
      items: [
        {
          productId: 'product1',
          quantity: 10
        }
      ],
      status: CustomerOrderStatus.PENDING,
      totalItems: 1,
      totalProducts: 10,
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