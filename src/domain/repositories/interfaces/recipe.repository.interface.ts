import { Recipe } from '../../models/recipe.model';
import { IBaseRepository } from './base.repository.interface';

export interface IRecipeRepository extends IBaseRepository<Recipe> {
  findByName(name: string): Promise<Recipe[]>;
} 