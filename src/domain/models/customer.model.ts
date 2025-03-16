import { EntityStatus } from '../enums/entity-status.enum';
import { BaseEntity } from './base.entity';


export interface Customer extends BaseEntity {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status: EntityStatus;
} 