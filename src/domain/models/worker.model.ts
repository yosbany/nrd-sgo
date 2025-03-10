import { BaseEntity } from './base.entity';

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
}

export enum PaymentConcept {
  SALARY = 'salary',
  LEAVE = 'leave',
}

export interface LeaveHistory {
  startDate: Date;
  endDate: Date;
  day: number;
}

export interface Payment {
  amount: number;
  status: PaymentStatus;
  concept: PaymentConcept;
  paymentDate: Date;
}

export interface Worker extends BaseEntity {
  name: string;
  primaryRoleId: string;
  hireDate: Date;
  monthlySalary: number;
  leaveBalance: number;
  leaveSalaryBalance: number;
  vacationSalaryBalance: number;
  bonusSalaryBalance: number;
  leaveHistory?: LeaveHistory[];
  payments?: Payment[];
} 