import { EntityStatus } from '../enums/entity-status.enum';
import { BaseEntity } from './base.entity';

export interface Parameter extends BaseEntity {
  name: string;
  code: string;
  value: string | number;
  description?: string;
  status: EntityStatus;
}
