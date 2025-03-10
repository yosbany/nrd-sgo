export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
} 