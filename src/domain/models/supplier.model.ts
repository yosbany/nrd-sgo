import { EntityStatus } from '../enums/entity-status.enum';
import { BaseEntity } from './base.entity';


export interface Supplier extends BaseEntity {
  commercialName: string;
  legalName?: string;
  phone?: string;
  address?: string;
  email?: string;
  rut?: string;
  status: EntityStatus;
} 