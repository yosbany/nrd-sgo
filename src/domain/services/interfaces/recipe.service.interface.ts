import { RecipeType } from '@/domain/enums/recipe-type.enum';
import { Recipe } from '../../models/recipe.model';
import { IBaseService } from './base.service.interface';

export interface IRecipeService extends IBaseService<Recipe> {
  findByName(name: string): Promise<Recipe[]>;
  findByType(type: RecipeType): Promise<Recipe[]>;
  
} 