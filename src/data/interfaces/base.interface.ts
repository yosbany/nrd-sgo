export interface BaseEntity {
  id: string;
  lastUpdated: Date;
  creation: Date;
}

export interface BaseEntityInput extends Omit<BaseEntity, 'id' | 'lastUpdated'> {
  id?: never;
  lastUpdated?: never;
}

export interface BaseRepository<T extends BaseEntity> {
  create(data: Omit<T, keyof BaseEntity>): Promise<T>;
  update(id: string, data: Partial<Omit<T, keyof BaseEntity>>): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
}

export interface Task {
  taskName: string;
  frequency: 'daily' | 'hourly' | 'end_of_shift';
}

export interface LeaveRecord {
  startDate: Date;
  endDate: Date;
}

export interface Payment {
  amount: number;
  status: 'paid' | 'pending';
  concept: string;
  paymentDate: Date;
}

export interface SalesChannel {
  productName: string;
  price: number;
}

export interface PriceHistory {
  date: Date;
  price: number;
  type: 'purchase' | 'sale';
}

export interface SupplierProduct {
  supplierProductCode: string;
  supplierProductName: string;
  purchaseUnit: string;
  purchasePrice: number;
  lastPurchaseDate: Date;
}

export interface AccountBalance {
  initialBalance: number;
  finalBalance: number;
  difference: number;
}

export interface Transaction {
  concept: string;
  accountId: string;
  amount: number;
  tagDescription: string;
  currentBalance: number;
} 