import { Customer, CustomerStatus } from '../../models/customer.model';
import { CustomerServiceImpl } from '../customer.service.impl';
import { CustomerRepositoryImpl } from '../../repositories/customer.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/customer.repository.impl');
jest.mock('@/config/firebase');

describe('CustomerService', () => {
  let service: CustomerServiceImpl;
  let mockRepository: jest.Mocked<CustomerRepositoryImpl>;

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
      findByEmail: jest.fn(),
      findByPhone: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (CustomerRepositoryImpl as jest.MockedClass<typeof CustomerRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new CustomerServiceImpl();
  });

  describe('findByName', () => {
    it('should return customers by name', async () => {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '1234567890',
          status: CustomerStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByName.mockResolvedValue(mockCustomers);

      const result = await service.findByName('Test Customer');

      expect(result).toEqual(mockCustomers);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Customer');
    });
  });

  describe('findByEmail', () => {
    it('should return customers by email', async () => {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '1234567890',
          status: CustomerStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByEmail.mockResolvedValue(mockCustomers);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockCustomers);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('findByPhone', () => {
    it('should return customers by phone', async () => {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '1234567890',
          status: CustomerStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByPhone.mockResolvedValue(mockCustomers);

      const result = await service.findByPhone('1234567890');

      expect(result).toEqual(mockCustomers);
      expect(mockRepository.findByPhone).toHaveBeenCalledWith('1234567890');
    });
  });

  describe('findByStatus', () => {
    it('should return customers by status', async () => {
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '1234567890',
          status: CustomerStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findAll.mockResolvedValue(mockCustomers);

      const result = await service.findByStatus(CustomerStatus.ACTIVE);

      expect(result).toEqual(mockCustomers);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('inherited methods', () => {
    const mockCustomer: Customer = {
      id: '1',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890',
      status: CustomerStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockCustomers = [mockCustomer];
      mockRepository.findAll.mockResolvedValue(mockCustomers);

      const result = await service.findAll();

      expect(result).toEqual(mockCustomers);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.findById('1');

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockCustomer);

      const result = await service.create(mockCustomer);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.create).toHaveBeenCalledWith(mockCustomer);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockCustomer);

      const result = await service.update('1', mockCustomer);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockCustomer);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCustomer);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 