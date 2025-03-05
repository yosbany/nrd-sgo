import { Incident } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { IncidentRepository } from '../repositories/incident.repository';

type IncidentType = 'task' | 'equipment' | 'safety' | 'quality' | 'other';
type IncidentStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export class IncidentService {
  private repository: IncidentRepository;

  constructor() {
    this.repository = new IncidentRepository();
  }

  async createIncident(incidentData: Omit<Incident, keyof BaseEntity>): Promise<Incident> {
    // Validate incident type
    if (!this.isValidType(incidentData.type)) {
      throw new Error(`Invalid incident type. Must be one of: ${this.getValidTypes().join(', ')}`);
    }

    // Validate classification (1-5)
    if (!this.isValidClassification(incidentData.classification)) {
      throw new Error('Classification must be between 1 and 5');
    }

    const incident = {
      ...incidentData,
      status: incidentData.status || 'pending',
      dateReported: incidentData.dateReported || new Date()
    };

    return await this.repository.create(incident);
  }

  async updateStatus(
    incidentId: string,
    newStatus: IncidentStatus
  ): Promise<void> {
    const validStatuses: IncidentStatus[] = ['pending', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const incident = await this.repository.getById(incidentId);
    if (!incident) throw new Error('Incident not found');

    // Validate status transitions
    const currentStatus = incident.status as IncidentStatus;
    if (currentStatus === 'closed') {
      throw new Error('Cannot update status of closed incident');
    }

    // Validate status flow
    const statusFlow: Record<IncidentStatus, IncidentStatus[]> = {
      pending: ['in_progress', 'closed'],
      in_progress: ['resolved', 'closed'],
      resolved: ['closed'],
      closed: []
    };

    if (!statusFlow[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    await this.repository.updateStatus(incidentId, newStatus);
  }

  async updateIncident(
    incidentId: string,
    updates: Partial<Omit<Incident, keyof BaseEntity | 'dateReported'>>
  ): Promise<void> {
    const incident = await this.repository.getById(incidentId);
    if (!incident) throw new Error('Incident not found');

    if (incident.status === 'closed') {
      throw new Error('Cannot update closed incident');
    }

    // Validate type if being updated
    if (updates.type && !this.isValidType(updates.type)) {
      throw new Error(`Invalid incident type. Must be one of: ${this.getValidTypes().join(', ')}`);
    }

    // Validate classification if being updated
    if (updates.classification && !this.isValidClassification(updates.classification)) {
      throw new Error('Classification must be between 1 and 5');
    }

    await this.repository.update(incidentId, updates);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Incident[]> {
    if (startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }
    return await this.repository.getByDateRange(startDate, endDate);
  }

  async getByType(type: IncidentType): Promise<Incident[]> {
    if (!this.isValidType(type)) {
      throw new Error(`Invalid incident type. Must be one of: ${this.getValidTypes().join(', ')}`);
    }
    return await this.repository.getByType(type);
  }

  async getByStatus(status: IncidentStatus): Promise<Incident[]> {
    return await this.repository.getByStatus(status);
  }

  async getByReporter(workerId: string): Promise<Incident[]> {
    return await this.repository.getByReporter(workerId);
  }

  async getByClassification(classification: number): Promise<Incident[]> {
    if (!this.isValidClassification(classification)) {
      throw new Error('Classification must be between 1 and 5');
    }
    return await this.repository.getByClassification(classification);
  }

  async deleteIncident(incidentId: string): Promise<void> {
    const incident = await this.repository.getById(incidentId);
    if (!incident) throw new Error('Incident not found');

    if (incident.status !== 'pending') {
      throw new Error('Can only delete pending incidents');
    }

    await this.repository.delete(incidentId);
  }

  private isValidType(type: string): type is IncidentType {
    return this.getValidTypes().includes(type as IncidentType);
  }

  private getValidTypes(): IncidentType[] {
    return ['task', 'equipment', 'safety', 'quality', 'other'];
  }

  private isValidClassification(classification: number): boolean {
    return Number.isInteger(classification) && classification >= 1 && classification <= 5;
  }
} 