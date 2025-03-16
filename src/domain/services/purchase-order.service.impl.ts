import { PurchaseOrder } from '../models/purchase-order.model';
import { IPurchaseOrderService } from './interfaces/purchase-order.service.interface';
import { IPurchaseOrderRepository } from '../repositories/interfaces/purchase-order.repository.interface';
import { PurchaseOrderRepositoryImpl } from '../repositories/purchase-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../enums/order-status.enum';
import { SequenceServiceImpl } from './sequence.service.impl';

export class PurchaseOrderServiceImpl extends BaseServiceImpl<PurchaseOrder, IPurchaseOrderRepository> implements IPurchaseOrderService {
  private sequenceService: SequenceServiceImpl;

  constructor() {
    super(PurchaseOrderRepositoryImpl, 'purchase-orders');
    this.sequenceService = new SequenceServiceImpl();
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

    // Solo validar productos si no es una orden calculada
    if (!order.referenceOrderNumber && (!order.products || order.products.length === 0)) {
      throw new Error('La orden de compra debe tener al menos un producto');
    }

    // Validar que cada producto tenga cantidad válida
    if (order.products) {
      order.products.forEach((product, index) => {
        if (!product.productId) {
          throw new Error(`El producto #${index + 1} debe tener un ID válido`);
        }
        if (!product.quantity || product.quantity <= 0) {
          throw new Error(`El producto #${index + 1} debe tener una cantidad válida mayor a 0`);
        }
      });
    }
  }

  async create(order: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    order.status = order.status || OrderStatus.PENDIENTE;
    order.nro = await this.sequenceService.getNextNumber('purchase-orders');
    
    // Si es una orden calculada, cargar los productos de la orden de referencia
    if (order.referenceOrderNumber) {
      const referenceOrder = await this.findById(order.referenceOrderNumber);
      if (!referenceOrder) {
        throw new Error('La orden de referencia no existe');
      }
      order.products = referenceOrder.products;
    }

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
    const updated = await super.update(id, order);
    if (!updated) throw new Error('Order not found after update');
    return updated;
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

  async findByNro(nro: string): Promise<PurchaseOrder | null> {
    const orders = await this.findAll();
    return orders.find(order => order.nro === nro) || null;
  }

  async copyOrder(nro: string): Promise<Partial<PurchaseOrder>> {
    const originalOrder = await this.findByNro(nro);
    if (!originalOrder) {
      throw new Error(`La orden número ${nro} no existe`);
    }

    // Crear una nueva orden con los datos de la original
    // excepto el id, nro y fecha
    const newOrder: Partial<PurchaseOrder> = {
      orderDate: new Date(), // Fecha actual
      status: OrderStatus.PENDIENTE, // Siempre pendiente para nueva orden
      supplierId: originalOrder.supplierId,
      products: originalOrder.products,
      totalItems: originalOrder.totalItems,
      totalProducts: originalOrder.totalProducts
    };

    return newOrder;
  }
} 