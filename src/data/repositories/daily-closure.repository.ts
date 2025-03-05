import { FirebaseBaseRepository } from './base.repository';
import { DailyClosure } from '../interfaces/entities.interface';
import { query, where, getDocs, orderBy } from 'firebase/firestore';

export class DailyClosureRepository extends FirebaseBaseRepository<DailyClosure> {
  protected collectionName = 'daily_closures';

  async getByDateRange(startDate: Date, endDate: Date): Promise<DailyClosure[]> {
    const q = query(
      this.collectionRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByDate(date: Date): Promise<DailyClosure | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      this.collectionRef,
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );
    const querySnapshot = await getDocs(q);
    const closures = this.convertQuerySnapshot(querySnapshot);
    return closures.length > 0 ? closures[0] : null;
  }

  async addTransaction(
    closureId: string,
    transactionId: string,
    transaction: DailyClosure['transactions'][string]
  ): Promise<void> {
    const closure = await this.getById(closureId);
    if (!closure) throw new Error('Daily closure not found');

    const transactions = {
      ...closure.transactions,
      [transactionId]: transaction
    };

    const totalIncome = Object.values(transactions)
      .reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);

    const totalExpenses = Object.values(transactions)
      .reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);

    await this.update(closureId, {
      transactions,
      totalIncome,
      totalExpenses,
      totalDifference: totalIncome - totalExpenses
    });
  }

  async updateAccountBalance(
    closureId: string,
    accountId: string,
    balance: DailyClosure['accounts'][string]
  ): Promise<void> {
    const closure = await this.getById(closureId);
    if (!closure) throw new Error('Daily closure not found');

    const accounts = {
      ...closure.accounts,
      [accountId]: balance
    };

    await this.update(closureId, { accounts });
  }
} 