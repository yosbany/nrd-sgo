import { FirebaseBaseRepository } from './base.repository';
import { Recipe } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class RecipeRepository extends FirebaseBaseRepository<Recipe> {
  protected collectionName = 'recipes';

  async getByType(recipeType: string): Promise<Recipe[]> {
    const q = query(this.collectionRef, where('recipeType', '==', recipeType));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByWorker(workerId: string): Promise<Recipe[]> {
    const q = query(this.collectionRef, where('workers', 'array-contains', workerId));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByPrimaryWorker(workerId: string): Promise<Recipe[]> {
    const q = query(this.collectionRef, where('primaryWorker', '==', workerId));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async addWorker(recipeId: string, workerId: string): Promise<void> {
    const recipe = await this.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    if (!recipe.workers.includes(workerId)) {
      const workers = [...recipe.workers, workerId];
      await this.update(recipeId, { workers });
    }
  }

  async removeWorker(recipeId: string, workerId: string): Promise<void> {
    const recipe = await this.getById(recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const workers = recipe.workers.filter(id => id !== workerId);
    await this.update(recipeId, { workers });
  }

  async updateMaterials(recipeId: string, materials: Recipe['materials']): Promise<void> {
    await this.update(recipeId, { materials });
  }
} 