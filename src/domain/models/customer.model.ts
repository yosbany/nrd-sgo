import { BaseEntity } from './base.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Customer extends BaseEntity {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status: CustomerStatus;
} 