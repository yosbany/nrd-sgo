import { Recipe, RecipeType, YieldUnit } from '../../models/recipe.model';
import { RecipeServiceImpl } from '../recipe.service.impl';
import { RecipeRepositoryImpl } from '../../repositories/recipe.repository.impl';
import { database } from '@/config/firebase';

jest.mock('../../repositories/recipe.repository.impl');
jest.mock('@/config/firebase');

describe('RecipeService', () => {
  let service: RecipeServiceImpl;
  let mockRepository: jest.Mocked<RecipeRepositoryImpl>;

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
    (RecipeRepositoryImpl as jest.MockedClass<typeof RecipeRepositoryImpl>).mockImplementation(() => mockRepository);

    // Crear el servicio (que internamente usará el repositorio mockeado)
    service = new RecipeServiceImpl();
  });

  describe('findByName', () => {
    it('should return recipes by name', async () => {
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          name: 'Test Recipe',
          recipeType: RecipeType.SALE_RECIPE,
          yieldUnit: YieldUnit.PIECES,
          yield: 10,
          materials: [
            {
              productId: 'product1',
              quantity: 2
            }
          ],
          primaryWorkerId: 'worker1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findByName.mockResolvedValue(mockRecipes);

      const result = await service.findByName('Test Recipe');

      expect(result).toEqual(mockRecipes);
      expect(mockRepository.findByName).toHaveBeenCalledWith('Test Recipe');
    });
  });

  describe('findByType', () => {
    it('should return recipes by type', async () => {
      const mockRecipes: Recipe[] = [
        {
          id: '1',
          name: 'Test Recipe',
          recipeType: RecipeType.SALE_RECIPE,
          yieldUnit: YieldUnit.PIECES,
          yield: 10,
          materials: [
            {
              productId: 'product1',
              quantity: 2
            }
          ],
          primaryWorkerId: 'worker1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockRepository.findAll.mockResolvedValue(mockRecipes);

      const result = await service.findByType(RecipeType.SALE_RECIPE);

      expect(result).toEqual(mockRecipes);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('inherited methods', () => {
    const mockRecipe: Recipe = {
      id: '1',
      name: 'Test Recipe',
      recipeType: RecipeType.SALE_RECIPE,
      yieldUnit: YieldUnit.PIECES,
      yield: 10,
      materials: [
        {
          productId: 'product1',
          quantity: 2
        }
      ],
      primaryWorkerId: 'worker1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should call findAll on repository', async () => {
      const mockRecipes = [mockRecipe];
      mockRepository.findAll.mockResolvedValue(mockRecipes);

      const result = await service.findAll();

      expect(result).toEqual(mockRecipes);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should call findById on repository', async () => {
      mockRepository.findById.mockResolvedValue(mockRecipe);

      const result = await service.findById('1');

      expect(result).toEqual(mockRecipe);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should call create on repository', async () => {
      mockRepository.create.mockResolvedValue(mockRecipe);

      const result = await service.create(mockRecipe);

      expect(result).toEqual(mockRecipe);
      expect(mockRepository.create).toHaveBeenCalledWith(mockRecipe);
    });

    it('should call update on repository', async () => {
      mockRepository.update.mockResolvedValue();
      mockRepository.findById.mockResolvedValue(mockRecipe);

      const result = await service.update('1', mockRecipe);

      expect(mockRepository.update).toHaveBeenCalledWith('1', mockRecipe);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockRecipe);
    });

    it('should call delete on repository', async () => {
      mockRepository.delete.mockResolvedValue();

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 