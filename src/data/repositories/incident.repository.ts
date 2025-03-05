import { FirebaseBaseRepository } from './base.repository';
import { Incident } from '../interfaces/entities.interface';
import { query, where, getDocs, orderBy } from 'firebase/firestore';

export class IncidentRepository extends FirebaseBaseRepository<Incident> {
  protected collectionName = 'incidents';

  async getByDateRange(startDate: Date, endDate: Date): Promise<Incident[]> {
    const q = query(
      this.collectionRef,
      where('dateReported', '>=', startDate),
      where('dateReported', '<=', endDate),
      orderBy('dateReported', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByType(type: string): Promise<Incident[]> {
    const q = query(
      this.collectionRef,
      where('type', '==', type),
      orderBy('dateReported', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByStatus(status: string): Promise<Incident[]> {
    const q = query(
      this.collectionRef,
      where('status', '==', status),
      orderBy('dateReported', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByReporter(workerId: string): Promise<Incident[]> {
    const q = query(
      this.collectionRef,
      where('reportedBy', '==', workerId),
      orderBy('dateReported', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByClassification(classification: number): Promise<Incident[]> {
    const q = query(
      this.collectionRef,
      where('classification', '==', classification),
      orderBy('dateReported', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async updateStatus(incidentId: string, status: string): Promise<void> {
    await this.update(incidentId, { status });
  }
} 