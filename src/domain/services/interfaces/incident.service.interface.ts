import { Incident, IncidentType, IncidentStatus } from '../../models/incident.model';
import { IBaseService } from './base.service.interface';

export interface IIncidentService extends IBaseService<Incident> {
  findByType(type: IncidentType): Promise<Incident[]>;
  findByStatus(status: IncidentStatus): Promise<Incident[]>;
  findByReportedBy(reportedBy: string): Promise<Incident[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Incident[]>;
  findByTaskId(taskId: string): Promise<Incident[]>;
  findByProductId(productId: string): Promise<Incident[]>;
  findByRecipeId(recipeId: string): Promise<Incident[]>;
} 