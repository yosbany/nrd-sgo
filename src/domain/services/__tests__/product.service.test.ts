import { Product, ProductStatus, ProductSector } from '../../models/product.model';
import { ProductServiceImpl } from '../product.service.impl';
import { ProductRepositoryImpl } from '../../repositories/product.repository.impl';

jest.mock('../../repositories/product.repository.impl');

describe('ProductService', () => {
  let service: ProductServiceImpl;
  let mockRepository: jest.Mocked<ProductRepositoryImpl>;

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
      findByState: jest.fn(),
      findBySector: jest.fn()
    } as any;

    // Asignar el mock al constructor del repositorio
    (ProductRepositoryImpl as jest.MockedClass<typeof ProductRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new ProductServiceImpl();
  });

  describe('findByName', () => {
    it('should return products by name', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Test Product',
          sku: 'SKU123',
          imageUrl: 'http://example.com/image.jpg',
          isForSale: true,
          isMaterial: false,
          salePrice: 100,
          state: ProductStatus.ACTIVE,
          sector: ProductSector.GENERAL,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByName.mockResolvedValue(mockProducts);

      const result = await service.findByName('Test Product');

      expect(result).toEqual(mockProducts);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Product');
    });
  });

  describe('findByState', () => {
    it('should return products by state', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Test Product',
          sku: 'SKU123',
          imageUrl: 'http://example.com/image.jpg',
          isForSale: true,
          isMaterial: false,
          salePrice: 100,
          state: ProductStatus.ACTIVE,
          sector: ProductSector.GENERAL,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByState.mockResolvedValue(mockProducts);

      const result = await service.findByState(ProductStatus.ACTIVE);

      expect(result).toEqual(mockProducts);
      expect(mockRepository.findByState).toHaveBeenCalledWith(ProductStatus.ACTIVE);
    });
  });

  describe('findBySector', () => {
    it('should return products by sector', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Test Product',
          sku: 'SKU123',
          imageUrl: 'http://example.com/image.jpg',
          isForSale: true,
          isMaterial: false,
          salePrice: 100,
          state: ProductStatus.ACTIVE,
          sector: ProductSector.GENERAL,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findBySector.mockResolvedValue(mockProducts);

      const result = await service.findBySector(ProductSector.GENERAL);

      expect(result).toEqual(mockProducts);
      expect(mockRepository.findBySector).toHaveBeenCalledWith(ProductSector.GENERAL);
    });
  });

  describe('inherited methods', () => {
    const mockProduct: Product = {
      id: '1',
      name: 'Test Product',
      sku: 'SKU123',
      imageUrl: 'http://example.com/image.jpg',
      isForSale: true,
      isMaterial: false,
      salePrice: 100,
      state: ProductStatus.ACTIVE,
      sector: ProductSector.GENERAL,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockProducts = [mockProduct];
      mockRepository.findAll.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.findById('1');

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockProduct);

      const result = await service.create(mockProduct);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(mockProduct);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.update('1', mockProduct);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockProduct);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProduct);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 