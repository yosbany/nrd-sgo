import { IncidentType } from '@/domain/enums/type-incident.enum';
import { Incident } from '../../models/incident.model';
import { IBaseRepository } from './base.repository.interface';
import { IncidentStatus } from '@/domain/enums/incident-status.enum';

export interface IIncidentRepository extends IBaseRepository<Incident> {
  findByType(type: IncidentType): Promise<Incident[]>;
  findByStatus(status: IncidentStatus): Promise<Incident[]>;
} 