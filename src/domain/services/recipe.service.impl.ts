import { Recipe, RecipeType } from '../models/recipe.model';
import { IRecipeService } from './interfaces/recipe.service.interface';
import { IRecipeRepository } from '../repositories/interfaces/recipe.repository.interface';
import { RecipeRepositoryImpl } from '../repositories/recipe.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class RecipeServiceImpl extends BaseServiceImpl<Recipe, IRecipeRepository> implements IRecipeService {
  constructor() {
    super(RecipeRepositoryImpl);
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