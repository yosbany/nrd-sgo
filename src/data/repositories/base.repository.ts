import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  QuerySnapshot,
  DocumentData,
  Firestore,
  CollectionReference,
  waitForPendingWrites,
  enableNetwork,
  disableNetwork,
  FirestoreError
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { BaseEntity, BaseRepository } from '../interfaces/base.interface';

export abstract class FirebaseBaseRepository<T extends BaseEntity> implements BaseRepository<T> {
  protected abstract get collectionName(): string;
  protected db: Firestore;
  private _collectionRef: CollectionReference | null = null;
  private retryAttempts = 5;
  private retryDelay = 2000;

  constructor() {
    this.db = db;
  }

  protected async ensureAuthenticated() {
    let attempts = 0;
    while (attempts < this.retryAttempts) {
      if (auth.currentUser) {
        return;
      }
      
      console.log(`Authentication attempt ${attempts + 1}/${this.retryAttempts}`);
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      attempts++;
    }
    
    throw new Error('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
  }

  private async toggleNetwork(enable: boolean): Promise<void> {
    try {
      if (enable) {
        await enableNetwork(this.db);
        console.log('Firestore network connection enabled');
      } else {
        await disableNetwork(this.db);
        console.log('Firestore network connection disabled');
      }
    } catch (error) {
      if (error instanceof FirestoreError) {
        console.warn('Error toggling network:', error.message);
      }
    }
  }

  protected async withRetry<R>(operation: () => Promise<R>, isWrite: boolean = false): Promise<R> {
    let lastError: FirestoreError | Error | null = null;
    let attempts = 0;
    const maxDelay = 10000;

    while (attempts < this.retryAttempts) {
      try {
        if (isWrite) {
          await this.toggleNetwork(true);
        }

        const result = await operation();
        
        if (isWrite) {
          await waitForPendingWrites(this.db);
        }
        
        return result;
      } catch (error) {
        console.warn(`Operation failed, attempt ${attempts + 1}/${this.retryAttempts}:`, error);
        lastError = error instanceof FirestoreError ? error : new Error(String(error));

        if (error instanceof FirestoreError) {
          if (error.code === 'permission-denied') {
            throw new Error('No tiene permisos para realizar esta operación');
          }

          if (error.code === 'unavailable' || error.code === 'internal') {
            console.log('Problema de conexión detectado, reintentando...');
            await this.toggleNetwork(false);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.toggleNetwork(true);
          }
        }
        
        const delay = Math.min(this.retryDelay * Math.pow(2, attempts), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        this.resetCollectionRef();
        attempts++;
      }
    }

    if (lastError instanceof FirestoreError) {
      if (lastError.code === 'permission-denied') {
        throw new Error('No tiene permisos para realizar esta operación');
      }
      if (lastError.code === 'unavailable' || lastError.code === 'internal') {
        throw new Error('Problema de conexión. Por favor, verifique su conexión e intente nuevamente.');
      }
    }

    throw new Error('La operación falló después de varios intentos. Por favor, intente nuevamente.');
  }

  protected get collectionRef(): CollectionReference {
    if (!this._collectionRef) {
      if (!this.collectionName) {
        throw new Error('El nombre de la colección debe estar definido en la clase derivada');
      }
      this._collectionRef = collection(this.db, this.collectionName);
    }
    return this._collectionRef;
  }

  protected resetCollectionRef() {
    this._collectionRef = null;
  }

  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      console.log('Creating document in collection:', this.collectionName);
      
      const docRef = doc(this.collectionRef);
      const now = new Date();
      const entity = {
        ...data,
        id: docRef.id,
        lastUpdated: now,
        creation: now
      } as T;

      try {
        await setDoc(docRef, entity);
        console.log('Document created successfully:', docRef.id);
        return entity;
      } catch (error) {
        console.error('Error creating document:', error);
        throw error;
      }
    }, true);
  }

  async update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<void> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error(`Document with id ${id} not found`);
      }

      await updateDoc(docRef, {
        ...data,
        lastUpdated: new Date()
      });
    }, true);
  }

  async delete(id: string): Promise<void> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      const docRef = doc(this.collectionRef, id);
      await deleteDoc(docRef);
    }, true);
  }

  async getById(id: string): Promise<T | null> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      const docRef = doc(this.collectionRef, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as T;
    });
  }

  async getAll(): Promise<T[]> {
    return this.withRetry(async () => {
      await this.ensureAuthenticated();
      const querySnapshot = await getDocs(this.collectionRef);
      return this.convertQuerySnapshot(querySnapshot);
    });
  }

  protected convertQuerySnapshot(querySnapshot: QuerySnapshot<DocumentData>): T[] {
    return querySnapshot.docs.map(doc => doc.data() as T);
  }
} 