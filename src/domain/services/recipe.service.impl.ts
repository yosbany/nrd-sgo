import { Recipe } from '../models/recipe.model';
import { RecipeType } from '../enums/recipe-type.enum';
import { IRecipeService } from './interfaces/recipe.service.interface';
import { IRecipeRepository } from '../repositories/interfaces/recipe.repository.interface';
import { RecipeRepositoryImpl } from '../repositories/recipe.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { ProductServiceImpl } from './product.service.impl';
import { TypeInventory } from '../enums/type-inventory.enum';

export class RecipeServiceImpl extends BaseServiceImpl<Recipe, IRecipeRepository> implements IRecipeService {
  private productService: ProductServiceImpl;

  constructor() {
    super(RecipeRepositoryImpl, 'recipes');
    this.productService = new ProductServiceImpl();
  }

  private async calculateTotals(recipe: Partial<Recipe>): Promise<void> {
    if (!recipe.materials) {
      recipe.materials = [];
    }

    // Filtrar valores nulos del array de materiales
    recipe.materials = recipe.materials.filter(material => material !== null);

    // Total de materiales diferentes
    recipe.totalMaterial = recipe.materials.length;

    // Total de items (suma de cantidades)
    recipe.totalItems = recipe.materials.reduce((sum, material) => {
      const quantity = typeof material.quantity === 'number' ? material.quantity : 0;
      return sum + quantity;
    }, 0);

    // Cálculo del costo unitario
    let totalCost = 0;
    for (const material of recipe.materials) {
      if (!material.materialId) continue;

      // Si no tiene typeMaterial, intentar inferirlo
      if (!material.typeMaterial) {
        const product = await this.productService.findById(material.materialId);
        if (product) {
          material.typeMaterial = TypeInventory.PRODUCTO;
        } else {
          const recipe = await this.findById(material.materialId);
          if (recipe) {
            material.typeMaterial = TypeInventory.RECETA;
          }
        }
      }

      const quantity = typeof material.quantity === 'number' ? material.quantity : 0;

      if (material.typeMaterial === TypeInventory.PRODUCTO) {
        const product = await this.productService.findById(material.materialId);
        if (product?.materialUnitCost) {
          totalCost += product.materialUnitCost * quantity;
        }
      } else if (material.typeMaterial === TypeInventory.RECETA) {
        const subRecipe = await this.findById(material.materialId);
        if (subRecipe?.unitCost) {
          totalCost += subRecipe.unitCost * quantity;
        }
      }
    }

    // Costo unitario = costo total / rendimiento
    const yield_ = typeof recipe.yield === 'number' ? recipe.yield : 0;
    recipe.unitCost = yield_ > 0 ? totalCost / yield_ : 0;

    // Calcular el margen si es una receta de venta y tiene precio de venta
    if (recipe.recipeType === RecipeType.RECETA_VENTA && recipe.salePrice && recipe.salePrice > 0) {
      recipe.margin = recipe.unitCost > 0 ? ((recipe.salePrice - recipe.unitCost) / recipe.salePrice) * 100 : 0;
      // Redondear a 2 decimales
      recipe.margin = Math.round(recipe.margin * 100) / 100;
    } else {
      recipe.margin = 0;
    }
  }

  async create(recipe: Omit<Recipe, 'id' | 'nro' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    await this.calculateTotals(recipe);
    return super.create(recipe);
  }

  async update(id: string, recipe: Partial<Recipe>): Promise<Recipe> {
    // Si estamos actualizando materiales o precio de venta, recalcular totales
    if (recipe.materials || recipe.salePrice || recipe.yield) {
      const currentRecipe = await this.findById(id);
      if (!currentRecipe) {
        throw new Error('Recipe not found');
      }
      // Combinar la receta actual con las actualizaciones
      const updatedRecipe = { ...currentRecipe, ...recipe };
      await this.calculateTotals(updatedRecipe);
      recipe = updatedRecipe;
    }
    
    const result = await super.update(id, recipe);
    if (!result) {
      throw new Error('Recipe not found');
    }
    return result;
  }

  async findByName(name: string): Promise<Recipe[]> {
    return this.repository.findByName(name);
  }

  async findByType(type: RecipeType): Promise<Recipe[]> {
    const recipes = await this.repository.findAll();
    return recipes.filter(recipe => recipe.recipeType === type);
  }

  async findByPrimaryWorkerId(workerId: string): Promise<Recipe[]> {
    const recipes = await this.repository.findAll();
    return recipes.filter(recipe => recipe.primaryWorkerId === workerId);
  }
} 