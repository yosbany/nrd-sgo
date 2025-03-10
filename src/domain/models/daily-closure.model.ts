import { BaseEntity } from './base.entity';

export interface AccountBalance {
  accountCode: string;
  accountName: string;
  initialBalance: number;
  finalBalance: number;
  difference: number;
}

export interface Transaction {
  transactionCode: string;
  concept: string;
  accountCode: string;
  amount: number;
  tagDescription?: string;
  currentBalance: number;
}

export interface DailyClosure extends BaseEntity {
  date: Date;
  totalExpenses: number;
  totalIncome: number;
  totalDifference: number;
  observations?: string;
  accounts: AccountBalance[];
  transactions?: Transaction[];
} 