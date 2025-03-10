import { BaseEntity } from "./base.entity";

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum ProductSector {
  GENERAL = 'general',
  OTHER = 'other'
}

export type PriceChangeType = 'purchase' | 'sale';

export interface SaleChannel {
  code: string;
  name: string;
  salePrice: number;
}

export interface PriceHistory {
  date: Date;
  price: number;
  type: PriceChangeType;
}

export interface Product extends BaseEntity {
  name: string;
  sku: string;
  imageUrl?: string;
  isForSale: boolean;
  isMaterial: boolean;
  materialName?: string;
  materialCode?: string;
  salePrice: number;
  state: ProductStatus;
  salesUnitCost?: number;
  materialUnitCost?: number;
  purchasePrice?: number;
  salesUnitId?: string;
  materialUnitId?: string;
  purchaseUnitId?: string;
  primarySupplierId?: string;
  sector?: ProductSector;
  sectorOrder?: number;
  desiredStock?: number;
  salesChannels?: SaleChannel[];
  priceHistory?: PriceHistory[];
} 