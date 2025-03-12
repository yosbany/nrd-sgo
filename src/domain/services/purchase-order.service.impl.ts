import { PurchaseOrder } from '../models/purchase-order.model';
import { IPurchaseOrderService } from './interfaces/purchase-order.service.interface';
import { IPurchaseOrderRepository } from '../repositories/interfaces/purchase-order.repository.interface';
import { PurchaseOrderRepositoryImpl } from '../repositories/purchase-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../models/order-status.enum';

export class PurchaseOrderServiceImpl extends BaseServiceImpl<PurchaseOrder, IPurchaseOrderRepository> implements IPurchaseOrderService {
  constructor() {
    super(PurchaseOrderRepositoryImpl);
  }

  private calculateTotals(order: Partial<PurchaseOrder>): void {
    if (!order.products) {
      order.products = [];
    }

    // Total de productos diferentes
    order.totalProducts = order.products.length;
    
    // Total de items (suma de cantidades)
    order.totalItems = order.products.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      return sum + quantity;
    }, 0);
  }

  private validateOrder(order: Partial<PurchaseOrder>): void {
    if (!order.supplierId) {
      throw new Error('La orden de compra debe tener un proveedor asignado');
    }

    if (!order.orderDate) {
      throw new Error('La orden de compra debe tener una fecha');
    }

    if (!order.status) {
      throw new Error('La orden de compra debe tener un estado');
    }

    if (!order.products || order.products.length === 0) {
      throw new Error('La orden de compra debe tener al menos un producto');
    }

    // Validar que cada producto tenga cantidad válida
    order.products.forEach((product, index) => {
      if (!product.productId) {
        throw new Error(`El producto #${index + 1} debe tener un ID válido`);
      }
      if (!product.quantity || product.quantity <= 0) {
        throw new Error(`El producto #${index + 1} debe tener una cantidad válida mayor a 0`);
      }
    });
  }

  async create(order: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    order.status = order.status || OrderStatus.PENDIENTE;
    this.calculateTotals(order);
    this.validateOrder(order);
    return super.create(order as PurchaseOrder);
  }

  async update(id: string, order: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    // Si se está actualizando parcialmente, obtener la orden actual
    if (!order.supplierId || !order.orderDate || !order.status || !order.products) {
      const currentOrder = await this.findById(id);
      order = {
        ...currentOrder,
        ...order
      };
    }
    
    this.calculateTotals(order);
    this.validateOrder(order);
    return super.update(id, order);
  }

  async findBySupplierId(supplierId: string): Promise<PurchaseOrder[]> {
    return this.repository.findBySupplierId(supplierId);
  }

  async findByStatus(status: OrderStatus): Promise<PurchaseOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<PurchaseOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 