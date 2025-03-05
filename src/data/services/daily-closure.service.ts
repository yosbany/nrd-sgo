import { DailyClosure } from '../interfaces/entities.interface';
import { BaseEntity, Transaction, AccountBalance } from '../interfaces/base.interface';
import { DailyClosureRepository } from '../repositories/daily-closure.repository';

export class DailyClosureService {
  private repository: DailyClosureRepository;

  constructor() {
    this.repository = new DailyClosureRepository();
  }

  async createClosure(closureData: Omit<DailyClosure, keyof BaseEntity>): Promise<DailyClosure> {
    // Check if a closure already exists for this date
    const existingClosure = await this.repository.getByDate(closureData.date);
    if (existingClosure) {
      throw new Error('A closure already exists for this date');
    }

    const closure = {
      ...closureData,
      accounts: closureData.accounts || {},
      transactions: closureData.transactions || {},
      totalExpenses: closureData.totalExpenses || 0,
      totalIncome: closureData.totalIncome || 0,
      totalDifference: closureData.totalDifference || 0,
      observations: closureData.observations || ''
    };

    return await this.repository.create(closure);
  }

  async addTransaction(
    closureId: string,
    transaction: Transaction & { id: string }
  ): Promise<void> {
    await this.repository.addTransaction(closureId, transaction.id, transaction);
  }

  async updateAccountBalance(
    closureId: string,
    accountId: string,
    balance: AccountBalance
  ): Promise<void> {
    // Validate balance calculation
    if (balance.difference !== balance.finalBalance - balance.initialBalance) {
      throw new Error('Invalid balance difference');
    }

    await this.repository.updateAccountBalance(closureId, accountId, balance);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<DailyClosure[]> {
    if (startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }
    return await this.repository.getByDateRange(startDate, endDate);
  }

  async getByDate(date: Date): Promise<DailyClosure | null> {
    return await this.repository.getByDate(date);
  }

  async updateObservations(
    closureId: string,
    observations: string
  ): Promise<void> {
    const closure = await this.repository.getById(closureId);
    if (!closure) throw new Error('Daily closure not found');

    await this.repository.update(closureId, { observations });
  }

  async deleteClosure(closureId: string): Promise<void> {
    const closure = await this.repository.getById(closureId);
    if (!closure) throw new Error('Daily closure not found');

    // Only allow deletion if there are no transactions
    if (Object.keys(closure.transactions).length > 0) {
      throw new Error('Cannot delete closure with transactions');
    }

    await this.repository.delete(closureId);
  }

  async calculateTotals(closureId: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    totalDifference: number;
  }> {
    const closure = await this.repository.getById(closureId);
    if (!closure) throw new Error('Daily closure not found');

    const totalIncome = Object.values(closure.transactions)
      .reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);

    const totalExpenses = Object.values(closure.transactions)
      .reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);

    const totalDifference = totalIncome - totalExpenses;

    await this.repository.update(closureId, {
      totalIncome,
      totalExpenses,
      totalDifference
    });

    return { totalIncome, totalExpenses, totalDifference };
  }
} 