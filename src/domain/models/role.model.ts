import { BaseEntity } from './base.entity';
import { TaskFrequency } from '../enums/task-frequency.enum';

export interface Task {
  taskName: string;
  frequency: TaskFrequency;
}

export interface Role extends BaseEntity {
  name: string;
  isProduction: boolean;
  tasks?: Task[];
}