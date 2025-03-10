import { Incident, IncidentType, IncidentStatus } from '../../models/incident.model';
import { IBaseRepository } from './base.repository.interface';

export interface IIncidentRepository extends IBaseRepository<Incident> {
  findByType(type: IncidentType): Promise<Incident[]>;
  findByStatus(status: IncidentStatus): Promise<Incident[]>;
  findByReportedBy(reportedBy: string): Promise<Incident[]>;
} 