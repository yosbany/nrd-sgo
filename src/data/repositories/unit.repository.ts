import { FirebaseBaseRepository } from './base.repository';
import { Unit } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class UnitRepository extends FirebaseBaseRepository<Unit> {
  protected collectionName = 'units';

  async searchByName(searchTerm: string): Promise<Unit[]> {
    const q = query(
      this.collectionRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getBySymbol(symbol: string): Promise<Unit | null> {
    const q = query(this.collectionRef, where('symbol', '==', symbol));
    const querySnapshot = await getDocs(q);
    const units = this.convertQuerySnapshot(querySnapshot);
    return units.length > 0 ? units[0] : null;
  }

  async addConversion(
    unitId: string,
    targetUnitId: string,
    conversionFactor: number
  ): Promise<void> {
    const unit = await this.getById(unitId);
    if (!unit) throw new Error('Unit not found');

    const conversions = {
      ...unit.conversions,
      [targetUnitId]: conversionFactor
    };

    await this.update(unitId, { conversions });
  }

  async removeConversion(
    unitId: string,
    targetUnitId: string
  ): Promise<void> {
    const unit = await this.getById(unitId);
    if (!unit) throw new Error('Unit not found');

    const { [targetUnitId]: removed, ...conversions } = unit.conversions;
    await this.update(unitId, { conversions });
  }
} 