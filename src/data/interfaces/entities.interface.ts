import { BaseEntity, Task, LeaveRecord, Payment, SalesChannel, PriceHistory, SupplierProduct, AccountBalance, Transaction } from './base.interface';

export interface Role extends BaseEntity {
  name: string;
  tasks: Task[];
}

export interface Worker extends BaseEntity {
  name: string;
  primaryRole: string;
  hireDate: Date;
  monthlySalary: number;
  isProduction: boolean;
  leaveBalance: number;
  leaveSalaryBalance: number;
  vacationSalaryBalance: number;
  bonusSalaryBalance: number;
  leaveHistory: LeaveRecord[];
  payments: Payment[];
}

export interface ProductionOrder extends BaseEntity {
  responsible: string;
  productionDate: Date;
  recipes: Record<string, { quantity: number }>;
  laborEfficiency: number;
  ratios: {
    timePerBatch: string;
    wastePercentage: number;
  };
}

export interface PurchaseOrder extends BaseEntity {
  supplierId: string;
  orderDate: Date;
  status: string;
  items: Record<string, { quantity: number }>;
  totalItems: number;
  totalProducts: number;
}

export interface CustomerOrder extends BaseEntity {
  customerId: string;
  orderDate: Date;
  status: string;
  items: Record<string, { quantity: number }>;
  totalItems: number;
  totalProducts: number;
}

export interface Recipe extends BaseEntity {
  name: string;
  recipeType: string;
  yieldUnit: string;
  yield: number;
  materials: Array<{
    productId: string;
    quantity: number;
  }>;
  workers: string[];
  primaryWorker: string;
  notes: string;
}

export interface DailyClosure extends BaseEntity {
  date: Date;
  totalExpenses: number;
  totalIncome: number;
  totalDifference: number;
  observations: string;
  accounts: Record<string, AccountBalance>;
  transactions: Record<string, Transaction>;
}

export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Supplier extends BaseEntity {
  commercialName: string;
  legalName: string;
  rut: string;
  phone: string;
}

export interface Product extends BaseEntity {
  name: string;
  sku: string;
  imageUrl: string;
  isForSale: boolean;
  isMaterial: boolean;
  materialName: string;
  materialCode: string;
  salePrice: number;
  state: string;
  salesUnitCost: number;
  materialUnitCost: number;
  lastPurchasePrice: number;
  salesUnit: string;
  materialUnit: string;
  primarySupplier: string;
  sector: string;
  sectorOrder: number;
  desiredStock: number;
  averageStock: number;
  salesChannels: Record<string, SalesChannel>;
  priceHistory: PriceHistory[];
  suppliers: Record<string, SupplierProduct>;
}

export interface Unit extends BaseEntity {
  name: string;
  symbol: string;
  conversions: Record<string, number>;
}

export interface Incident extends BaseEntity {
  type: 'safety' | 'maintenance' | 'quality';
  description: string;
  classification: 1 | 2 | 3;
  status: 'pending' | 'in_progress' | 'resolved';
  reportDate: string;
  reporterId: string;
  reporterName: string;
  location: string;
  affectedArea: string;
  immediateActions?: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  assignedTo?: string;
  attachments?: string[];
}

export interface Parameter extends BaseEntity {
  value: string | number;
  description: string;
}

export type CreateIncidentData = Omit<Incident, keyof BaseEntity>;
export type UpdateIncidentData = Partial<CreateIncidentData>; 