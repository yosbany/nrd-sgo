import { BaseEntity } from './base.entity';

export enum TaskFrequency {
  DAILY = 'daily',
  HOURLY = 'hourly',
  END_OF_SHIFT = 'end_of_shift'
}

export interface Task {
  taskName: string;
  frequency: TaskFrequency;
}

export interface Role extends BaseEntity {
  name: string;
  isProduction: boolean;
  tasks?: Task[];
}