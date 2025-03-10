import { Recipe, RecipeType } from '../../models/recipe.model';
import { IBaseService } from './base.service.interface';

export interface IRecipeService extends IBaseService<Recipe> {
  findByName(name: string): Promise<Recipe[]>;
  findByType(type: RecipeType): Promise<Recipe[]>;
  findByPrimaryWorkerId(workerId: string): Promise<Recipe[]>;
  
} 