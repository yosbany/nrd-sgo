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
  CollectionReference
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BaseEntity, BaseRepository } from '../interfaces/base.interface';

export abstract class FirebaseBaseRepository<T extends BaseEntity> implements BaseRepository<T> {
  protected abstract collectionName: string;
  protected db: Firestore;
  protected collectionRef!: CollectionReference;

  constructor() {
    this.db = db;
    this.initCollection();
  }

  protected initCollection(): void {
    this.collectionRef = collection(this.db, this.collectionName);
  }

  async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
    const docRef = doc(this.collectionRef);
    const now = new Date();
    const entity = {
      ...data,
      id: docRef.id,
      lastUpdated: now,
      creation: now
    } as T;

    await setDoc(docRef, entity);
    return entity;
  }

  async update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Document with id ${id} not found`);
    }

    await updateDoc(docRef, {
      ...data,
      lastUpdated: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.collectionRef, id);
    await deleteDoc(docRef);
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as T;
  }

  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(this.collectionRef);
    return this.convertQuerySnapshot(querySnapshot);
  }

  protected convertQuerySnapshot(querySnapshot: QuerySnapshot<DocumentData>): T[] {
    return querySnapshot.docs.map(doc => doc.data() as T);
  }
} 