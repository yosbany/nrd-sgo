import { Supplier, SupplierStatus } from '../../models/supplier.model';
import { SupplierServiceImpl } from '../supplier.service.impl';
import { SupplierRepositoryImpl } from '../../repositories/supplier.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/supplier.repository.impl');
jest.mock('@/config/firebase');

describe('SupplierService', () => {
  let service: SupplierServiceImpl;
  let mockRepository: jest.Mocked<SupplierRepositoryImpl>;

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
      findByCommercialName: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (SupplierRepositoryImpl as jest.MockedClass<typeof SupplierRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new SupplierServiceImpl();
  });

  describe('findByName', () => {
    it('should return suppliers by name', async () => {
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          commercialName: 'Test Supplier',
          legalName: 'Test Supplier Inc',
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Test St',
          rut: '123456789',
          status: SupplierStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByCommercialName.mockResolvedValue(mockSuppliers);

      const result = await service.findByName('Test Supplier');

      expect(result).toEqual(mockSuppliers);
      expect(mockRepository.findByCommercialName).toHaveBeenCalledWith('Test Supplier');
    });
  });

  describe('findByEmail', () => {
    it('should return suppliers by email', async () => {
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          commercialName: 'Test Supplier',
          legalName: 'Test Supplier Inc',
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Test St',
          rut: '123456789',
          status: SupplierStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByEmail.mockResolvedValue(mockSuppliers);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockSuppliers);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('findByPhone', () => {
    it('should return suppliers by phone', async () => {
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          commercialName: 'Test Supplier',
          legalName: 'Test Supplier Inc',
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Test St',
          rut: '123456789',
          status: SupplierStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByPhone.mockResolvedValue(mockSuppliers);

      const result = await service.findByPhone('1234567890');

      expect(result).toEqual(mockSuppliers);
      expect(mockRepository.findByPhone).toHaveBeenCalledWith('1234567890');
    });
  });

  describe('inherited methods', () => {
    const mockSupplier: Supplier = {
      id: '1',
      commercialName: 'Test Supplier',
      legalName: 'Test Supplier Inc',
      email: 'test@example.com',
      phone: '1234567890',
      address: '123 Test St',
      rut: '123456789',
      status: SupplierStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockSuppliers = [mockSupplier];
      mockRepository.findAll.mockResolvedValue(mockSuppliers);

      const result = await service.findAll();

      expect(result).toEqual(mockSuppliers);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockSupplier);

      const result = await service.findById('1');

      expect(result).toEqual(mockSupplier);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockSupplier);

      const result = await service.create(mockSupplier);

      expect(result).toEqual(mockSupplier);
      expect(mockRepository.create).toHaveBeenCalledWith(mockSupplier);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockSupplier);

      const result = await service.update('1', mockSupplier);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockSupplier);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockSupplier);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 