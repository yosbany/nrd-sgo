import { BaseEntity } from './base.entity';

export enum RecipeType {
  SALE_RECIPE = 'sale_recipe',
  INTERNAL_USE = 'internal_use'
}

export enum YieldUnit {
  PIECES = 'pieces',
  KG = 'kg'
}

export interface Material {
  materialId?: string;
  quantity: number;
}

export interface Recipe extends BaseEntity {
  name: string;
  recipeType: RecipeType;
  yieldUnitId: YieldUnit;
  yield: number;
  cost: number;
  materials: Material[];
  primaryWorkerId: string;
  notes?: string;
} 