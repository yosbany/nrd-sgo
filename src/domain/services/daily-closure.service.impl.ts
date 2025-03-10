import { DailyClosure } from '../models/daily-closure.model';
import { IDailyClosureService } from './interfaces/daily-closure.service.interface';
import { IDailyClosureRepository } from '../repositories/interfaces/daily-closure.repository.interface';
import { DailyClosureRepository } from '../repositories/daily-closure.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class DailyClosureServiceImpl extends BaseServiceImpl<DailyClosure, IDailyClosureRepository> implements IDailyClosureService {
  constructor() {
    super(DailyClosureRepository);
  }

  async findByDate(date: Date): Promise<DailyClosure[]> {
    return this.repository.findByDate(date);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<DailyClosure[]> {
    const closures = await this.repository.findAll();
    return closures.filter(closure => {
      const closureDate = new Date(closure.date);
      return closureDate >= startDate && closureDate <= endDate;
    });
  }

  async findByAccountCode(accountCode: string): Promise<DailyClosure[]> {
    const closures = await this.repository.findAll();
    return closures.filter(closure => 
      closure.accounts.some(account => account.accountCode === accountCode)
    );
  }

  async findByTransactionCode(transactionCode: string): Promise<DailyClosure[]> {
    const closures = await this.repository.findAll();
    return closures.filter(closure => 
      closure.transactions?.some(transaction => transaction.transactionCode === transactionCode)
    );
  }

  async getTotalsByDate(date: Date): Promise<{ [key: string]: number }> {
    const closures = await this.findByDate(date);
    const totals: { [key: string]: number } = {};

    closures.forEach(closure => {
      closure.transactions?.forEach(transaction => {
        const concept = transaction.concept;
        if (!totals[concept]) {
          totals[concept] = 0;
        }
        totals[concept] += transaction.amount;
      });
    });

    return totals;
  }

  async getBalanceByDate(date: Date): Promise<number> {
    const closures = await this.findByDate(date);
    return closures.reduce((total, closure) => {
      return total + (closure.transactions?.reduce((sum, transaction) => 
        sum + transaction.amount, 0) || 0);
    }, 0);
  }
}