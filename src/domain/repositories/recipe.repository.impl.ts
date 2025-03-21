import { Database } from 'firebase/database';
import { Recipe } from '../models/recipe.model';
import { IRecipeRepository } from './interfaces/recipe.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class RecipeRepositoryImpl extends BaseRepositoryImpl<Recipe> implements IRecipeRepository {
  protected modelProperties: (keyof Recipe)[] = [
    'name', 
    'recipeType', 
    'yieldUnitId', 
    'yield', 
    'unitCost', 
    'materials', 
    'primaryWorkerId', 
    'notes',
    'state',
    'desiredProduction',
    'sku',
    'salePrice'
  ];

  constructor(db: Database) {
    super(db, 'recipes');
  }

  async findByName(name: string): Promise<Recipe[]> {
    return this.findByField('name', name);
  }
}