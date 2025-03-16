import { EntityStatus } from "../enums/entity-status.enum";
import { Sector } from "../enums/sector.enum";
import { BaseEntity } from "./base.entity";

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
  status: EntityStatus;
  salesUnitCost?: number;
  materialUnitCost?: number;
  purchasePrice?: number;
  salesUnitId?: string;
  nameSale: string;
  materialUnitId?: string;
  purchaseUnitId?: string;
  primarySupplierId?: string;
  sector: Sector;
  sectorOrder?: number;
  desiredStock?: number;
  salesChannels?: SaleChannel[];
  priceHistory?: PriceHistory[];
  margin?: number;
} 