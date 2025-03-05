import { FirebaseBaseRepository } from './base.repository';
import { Incident } from '../interfaces/entities.interface';
import { query, where, getDocs, orderBy, onSnapshot, FirestoreError } from 'firebase/firestore';
import { auth } from '../../config/firebase';
import { BaseEntity } from '../interfaces/base.interface';

export class IncidentRepository extends FirebaseBaseRepository<Incident> {
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super();
    // Reset collection reference when auth state changes
    auth.onAuthStateChanged((user) => {
      console.log('Auth state changed in IncidentRepository:', {
        user: user?.email,
        isAuthenticated: !!user,
        timestamp: new Date().toISOString()
      });
      
      this.resetCollectionRef();
      
      // Cleanup any existing subscription
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    });
  }

  protected get collectionName(): string {
    return 'incidents';
  }

  async create(data: Omit<Incident, keyof BaseEntity>): Promise<Incident> {
    console.log('Creating incident with data:', {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    try {
      const incident = await super.create(data);
      console.log('Incident created successfully:', {
        id: incident.id,
        type: incident.type,
        timestamp: new Date().toISOString()
      });
      return incident;
    } catch (error) {
      console.error('Error creating incident:', {
        error,
        data: { ...data, timestamp: new Date().toISOString() }
      });
      
      if (error instanceof FirestoreError) {
        switch (error.code) {
          case 'permission-denied':
            throw new Error('No tiene permisos para crear incidentes');
          case 'unavailable':
            throw new Error('Servicio no disponible. Por favor, intente nuevamente');
          default:
            throw new Error(`Error al crear el incidente: ${error.message}`);
        }
      }
      
      throw new Error('Error al crear el incidente. Por favor, intente nuevamente.');
    }
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Incident[]> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      console.log('Getting incidents by date range:', { startDate, endDate });
      const q = query(
        this.collectionRef,
        where('reportDate', '>=', startDate),
        where('reportDate', '<=', endDate),
        orderBy('reportDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const incidents = this.convertQuerySnapshot(querySnapshot);
      console.log(`Found ${incidents.length} incidents in date range`);
      return incidents;
    });
  }

  async getByType(type: string): Promise<Incident[]> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      console.log('Getting incidents by type:', type);
      const q = query(
        this.collectionRef,
        where('type', '==', type),
        orderBy('reportDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return this.convertQuerySnapshot(querySnapshot);
    });
  }

  async getByStatus(status: 'pending' | 'in_progress' | 'resolved'): Promise<Incident[]> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      console.log('Getting incidents by status:', status);
      const q = query(
        this.collectionRef,
        where('status', '==', status),
        orderBy('reportDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return this.convertQuerySnapshot(querySnapshot);
    });
  }

  async getByReporter(workerId: string): Promise<Incident[]> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      console.log('Getting incidents by reporter:', workerId);
      const q = query(
        this.collectionRef,
        where('reporterId', '==', workerId),
        orderBy('reportDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return this.convertQuerySnapshot(querySnapshot);
    });
  }

  async getByClassification(classification: number): Promise<Incident[]> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      console.log('Getting incidents by classification:', classification);
      const q = query(
        this.collectionRef,
        where('classification', '==', classification),
        orderBy('reportDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return this.convertQuerySnapshot(querySnapshot);
    });
  }

  async updateStatus(incidentId: string, status: 'pending' | 'in_progress' | 'resolved'): Promise<void> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      console.log('Updating incident status:', { incidentId, status });
      await this.update(incidentId, { status });
    });
  }
} 