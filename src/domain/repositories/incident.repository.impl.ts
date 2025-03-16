import { Database } from 'firebase/database';
import { Incident } from '../models/incident.model';
import { IIncidentRepository } from './interfaces/incident.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';
import { IncidentType } from '../enums/type-incident.enum';
import { IncidentStatus } from '../enums/incident-status.enum';

export class IncidentRepositoryImpl extends BaseRepositoryImpl<Incident> implements IIncidentRepository {
  protected modelProperties: (keyof Incident)[] = [
    'type',
    'description',
    'status',
    'taskId',
    'products',
    'recipeId',
    'date'
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
} 