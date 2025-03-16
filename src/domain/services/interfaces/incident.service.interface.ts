import { Incident } from '../../models/incident.model';
import { IBaseService } from './base.service.interface';
import { IncidentType } from '../../enums/type-incident.enum';
import { IncidentStatus } from '../../enums/incident-status.enum';

export interface IIncidentService extends IBaseService<Incident> {
  findByType(type: IncidentType): Promise<Incident[]>;
  findByStatus(status: IncidentStatus): Promise<Incident[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Incident[]>;
  findByTaskId(taskId: string): Promise<Incident[]>;
  findByProductId(productId: string): Promise<Incident[]>;
  findByRecipeId(recipeId: string): Promise<Incident[]>;
} 