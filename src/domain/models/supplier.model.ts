import { BaseEntity } from './base.entity';

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Supplier extends BaseEntity {
  commercialName: string;
  legalName?: string;
  phone?: string;
  address?: string;
  email?: string;
  rut?: string;
  status: SupplierStatus;
} 