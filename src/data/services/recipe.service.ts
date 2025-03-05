import { Recipe } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { RecipeRepository } from '../repositories/recipe.repository';

export class RecipeService {
  private repository: RecipeRepository;

  constructor() {
    this.repository = new RecipeRepository();
  }

  async createRecipe(recipeData: Omit<Recipe, keyof BaseEntity>): Promise<Recipe> {
    const recipe = {
      ...recipeData,
      materials: recipeData.materials || [],
      workers: recipeData.workers || [],
      notes: recipeData.notes || ''
    };

    return await this.repository.create(recipe);
  }

  async addMaterial(
    recipeId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const recipe = await this.repository.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const existingMaterialIndex = recipe.materials.findIndex(
      m => m.productId === productId
    );

    let materials = [...recipe.materials];
    if (existingMaterialIndex >= 0) {
      materials[existingMaterialIndex] = { productId, quantity };
    } else {
      materials.push({ productId, quantity });
    }

    await this.repository.updateMaterials(recipeId, materials);
  }

  async removeMaterial(
    recipeId: string,
    productId: string
  ): Promise<void> {
    const recipe = await this.repository.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const materials = recipe.materials.filter(m => m.productId !== productId);
    await this.repository.updateMaterials(recipeId, materials);
  }

  async addWorker(recipeId: string, workerId: string): Promise<void> {
    await this.repository.addWorker(recipeId, workerId);
  }

  async removeWorker(recipeId: string, workerId: string): Promise<void> {
    const recipe = await this.repository.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    if (recipe.primaryWorker === workerId) {
      throw new Error('Cannot remove primary worker');
    }

    await this.repository.removeWorker(recipeId, workerId);
  }

  async updatePrimaryWorker(recipeId: string, workerId: string): Promise<void> {
    const recipe = await this.repository.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    if (!recipe.workers.includes(workerId)) {
      await this.repository.addWorker(recipeId, workerId);
    }

    await this.repository.update(recipeId, { primaryWorker: workerId });
  }

  async getByType(recipeType: string): Promise<Recipe[]> {
    return await this.repository.getByType(recipeType);
  }

  async getByWorker(workerId: string): Promise<Recipe[]> {
    return await this.repository.getByWorker(workerId);
  }

  async getByPrimaryWorker(workerId: string): Promise<Recipe[]> {
    return await this.repository.getByPrimaryWorker(workerId);
  }

  async updateYield(
    recipeId: string,
    yield_: number,
    yieldUnit: string
  ): Promise<void> {
    await this.repository.update(recipeId, {
      yield: yield_,
      yieldUnit
    });
  }

  async deleteRecipe(recipeId: string): Promise<void> {
    await this.repository.delete(recipeId);
  }
} 