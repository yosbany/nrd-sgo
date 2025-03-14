import { CustomerOrder } from '../models/customer-order.model';
import { ICustomerOrderService } from './interfaces/customer-order.service.interface';
import { ICustomerOrderRepository } from '../repositories/interfaces/customer-order.repository.interface';
import { CustomerOrderRepositoryImpl } from '../repositories/customer-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../enums/order-status.enum';

export class CustomerOrderServiceImpl extends BaseServiceImpl<CustomerOrder, ICustomerOrderRepository> implements ICustomerOrderService {
  constructor() {
    super(CustomerOrderRepositoryImpl, 'customer-orders');
  }

  private calculateTotals(order: Partial<CustomerOrder>): void {
    if (!order.items) {
      order.items = [];
    }

    // Total de items diferentes (por tipo)
    order.totalProducts = order.items.length;
    
    // Total de items (suma de cantidades)
    order.totalItems = order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  private validateOrder(order: Partial<CustomerOrder>): void {
    if (!order.customerId) {
      throw new Error('La orden debe tener un cliente asignado');
    }

    if (!order.orderDate) {
      throw new Error('La orden debe tener una fecha');
    }

    if (!order.status) {
      throw new Error('La orden debe tener un estado');
    }

    if (!order.items || order.items.length === 0) {
      throw new Error('La orden debe tener al menos un item');
    }

    // Validar que cada item tenga cantidad válida
    order.items.forEach((item, index) => {
      if (!item.itemId) {
        throw new Error(`El item #${index + 1} debe tener un ID válido`);
      }
      if (!item.typeItem) {
        throw new Error(`El item #${index + 1} debe tener un tipo válido`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`El item #${index + 1} debe tener una cantidad válida mayor a 0`);
      }
    });
  }

  async create(order: Partial<CustomerOrder>): Promise<CustomerOrder> {
    order.status = order.status || OrderStatus.PENDIENTE;
    this.calculateTotals(order);
    this.validateOrder(order);
    return super.create(order as CustomerOrder);
  }

  async update(id: string, order: Partial<CustomerOrder>): Promise<CustomerOrder> {
    // Si se está actualizando parcialmente, obtener la orden actual
    if (!order.customerId || !order.orderDate || !order.status || !order.items) {
      const currentOrder = await this.findById(id);
      if (!currentOrder) {
        throw new Error('Orden no encontrada');
      }
      order = {
        ...currentOrder,
        ...order
      } as CustomerOrder;
    }
    
    this.calculateTotals(order);
    this.validateOrder(order);
    return super.update(id, order);
  }

  async findByCustomerId(customerId: string): Promise<CustomerOrder[]> {
    return this.repository.findByCustomerId(customerId);
  }

  async findByStatus(status: OrderStatus): Promise<CustomerOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }

  async findByNro(nro: string): Promise<CustomerOrder | null> {
    const orders = await this.findAll();
    return orders.find(order => order.nro === nro) || null;
  }

  async copyOrder(nro: string): Promise<Partial<CustomerOrder>> {
    const originalOrder = await this.findByNro(nro);
    if (!originalOrder) {
      throw new Error(`La orden número ${nro} no existe`);
    }

    // Crear una nueva orden con los datos de la original
    // excepto el id, nro y fecha
    const newOrder: Partial<CustomerOrder> = {
      orderDate: new Date(), // Fecha actual
      status: OrderStatus.PENDIENTE, // Siempre pendiente para nueva orden
      customerId: originalOrder.customerId,
      items: originalOrder.items,
      totalItems: originalOrder.totalItems,
      totalProducts: originalOrder.totalProducts
    };

    return newOrder;
  }
} 