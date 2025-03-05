import { FirebaseBaseRepository } from './base.repository';
import { Customer } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class CustomerRepository extends FirebaseBaseRepository<Customer> {
  protected collectionName = 'customers';

  async searchByName(searchTerm: string): Promise<Customer[]> {
    const q = query(
      this.collectionRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByEmail(email: string): Promise<Customer | null> {
    const q = query(this.collectionRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    const customers = this.convertQuerySnapshot(querySnapshot);
    return customers.length > 0 ? customers[0] : null;
  }

  async getByPhone(phone: string): Promise<Customer | null> {
    const q = query(this.collectionRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    const customers = this.convertQuerySnapshot(querySnapshot);
    return customers.length > 0 ? customers[0] : null;
  }
} 