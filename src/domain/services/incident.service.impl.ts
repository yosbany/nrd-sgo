import { Incident } from '../models/incident.model';
import { IIncidentService } from './interfaces/incident.service.interface';
import { IIncidentRepository } from '../repositories/interfaces/incident.repository.interface';
import { IncidentRepositoryImpl } from '../repositories/incident.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { IncidentType } from '../enums/type-incident.enum';
import { IncidentStatus } from '../enums/incident-status.enum';

export class IncidentServiceImpl extends BaseServiceImpl<Incident, IIncidentRepository> implements IIncidentService {
  constructor() {
    super(IncidentRepositoryImpl, 'incidents');
  }

  async findByType(type: IncidentType): Promise<Incident[]> {
    return this.repository.findByType(type);
  }

  async findByStatus(status: IncidentStatus): Promise<Incident[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Incident[]> {
    const incidents = await this.repository.findAll();
    return incidents.filter(incident => {
      const incidentDate = new Date(incident.createdAt);
      return incidentDate >= startDate && incidentDate <= endDate;
    });
  }

  async findByTaskId(taskId: string): Promise<Incident[]> {
    const incidents = await this.repository.findAll();
    return incidents.filter(incident => incident.taskId === taskId);
  }

  async findByProductId(productId: string): Promise<Incident[]> {
    const incidents = await this.repository.findAll();
    return incidents.filter(incident => 
      incident.products?.some(product => product.productId === productId)
    );
  }

  async findByRecipeId(recipeId: string): Promise<Incident[]> {
    const incidents = await this.repository.findAll();
    return incidents.filter(incident => incident.recipeId === recipeId);
  }
} 