import { EntityStatus } from '../enums/entity-status.enum';
import { RecipeType } from '../enums/recipe-type.enum';
import { TypeInventory } from '../enums/type-inventory.enum';
import { BaseEntity } from './base.entity';

export interface Material {
  materialId?: string;
  typeMaterial: TypeInventory
  quantity: number;
}

export interface Recipe extends BaseEntity {
  name: string;
  recipeType: RecipeType;
  yieldUnitId: string;
  yield: number;
  unitCost: number;
  totalMaterial: number;
  totalItems: number;
  margin: number;
  materials: Material[];
  primaryWorkerId: string;
  notes?: string;
  state: EntityStatus;
  desiredProduction: number;
  sku: string;
  salePrice: number;
  nameSale: string;
} 