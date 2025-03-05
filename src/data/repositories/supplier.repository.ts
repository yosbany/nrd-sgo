import { FirebaseBaseRepository } from './base.repository';
import { Supplier } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class SupplierRepository extends FirebaseBaseRepository<Supplier> {
  protected collectionName = 'suppliers';

  async searchByName(searchTerm: string): Promise<Supplier[]> {
    const commercialNameQuery = query(
      this.collectionRef,
      where('commercialName', '>=', searchTerm),
      where('commercialName', '<=', searchTerm + '\uf8ff')
    );
    const legalNameQuery = query(
      this.collectionRef,
      where('legalName', '>=', searchTerm),
      where('legalName', '<=', searchTerm + '\uf8ff')
    );

    const [commercialResults, legalResults] = await Promise.all([
      getDocs(commercialNameQuery),
      getDocs(legalNameQuery)
    ]);

    const results = new Map<string, Supplier>();
    
    [...this.convertQuerySnapshot(commercialResults),
     ...this.convertQuerySnapshot(legalResults)].forEach(supplier => {
      results.set(supplier.id, supplier);
    });

    return Array.from(results.values());
  }

  async getByRut(rut: string): Promise<Supplier | null> {
    const q = query(this.collectionRef, where('rut', '==', rut));
    const querySnapshot = await getDocs(q);
    const suppliers = this.convertQuerySnapshot(querySnapshot);
    return suppliers.length > 0 ? suppliers[0] : null;
  }

  async getByPhone(phone: string): Promise<Supplier | null> {
    const q = query(this.collectionRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    const suppliers = this.convertQuerySnapshot(querySnapshot);
    return suppliers.length > 0 ? suppliers[0] : null;
  }
} 