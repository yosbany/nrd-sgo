import { Database } from 'firebase/database';
import { Incident, IncidentType, IncidentStatus } from '../models/incident.model';
import { IIncidentRepository } from './interfaces/incident.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class IncidentRepositoryImpl extends BaseRepositoryImpl<Incident> implements IIncidentRepository {
  protected modelProperties: (keyof Incident)[] = [
    'type',
    'description',
    'reportedByWorkerId',
    'status',
    'taskId',
    'productId',
    'recipeId'
  ];

  constructor(db: Database) {
    super(db, 'incidents');
  }

  async findByType(type: IncidentType): Promise<Incident[]> {
    return this.findByField('type', type);
  }

  async findByStatus(status: IncidentStatus): Promise<Incident[]> {
    return this.findByField('status', status);
  }

  async findByReportedBy(workerId: string): Promise<Incident[]> {
    return this.findByField('reportedByWorkerId', workerId);
  }
} 