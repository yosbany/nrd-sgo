import { FirebaseBaseRepository } from './base.repository';
import { Parameter } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class ParameterRepository extends FirebaseBaseRepository<Parameter> {
  protected collectionName = 'parameters';

  async getByDescription(searchTerm: string): Promise<Parameter[]> {
    const q = query(
      this.collectionRef,
      where('description', '>=', searchTerm),
      where('description', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByValue(value: string | number): Promise<Parameter[]> {
    const q = query(
      this.collectionRef,
      where('value', '==', value)
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }
} 