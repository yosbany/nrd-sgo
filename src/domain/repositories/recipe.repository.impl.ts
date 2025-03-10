import { Database } from 'firebase/database';
import { Recipe } from '../models/recipe.model';
import { IRecipeRepository } from './interfaces/recipe.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class RecipeRepositoryImpl extends BaseRepositoryImpl<Recipe> implements IRecipeRepository {
  constructor(db: Database) {
    super(db, 'recipes');
  }

  async findByName(name: string): Promise<Recipe[]> {
    return this.findByField('name', name);
  }

} 