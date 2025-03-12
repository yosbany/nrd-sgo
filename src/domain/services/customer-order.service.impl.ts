import { CustomerOrder } from '../models/customer-order.model';
import { ICustomerOrderService } from './interfaces/customer-order.service.interface';
import { ICustomerOrderRepository } from '../repositories/interfaces/customer-order.repository.interface';
import { CustomerOrderRepositoryImpl } from '../repositories/customer-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../models/order-status.enum';

export class CustomerOrderServiceImpl extends BaseServiceImpl<CustomerOrder, ICustomerOrderRepository> implements ICustomerOrderService {
  constructor() {
    super(CustomerOrderRepositoryImpl);
  }

  private calculateTotals(order: Partial<CustomerOrder>): void {
    if (!order.products) {
      order.products = [];
    }

    if (!order.recipes) {
      order.recipes = [];
    }

    // Total de productos y recetas diferentes
    order.totalProducts = order.products.length + order.recipes.length;
    
    // Total de items (suma de cantidades de productos y recetas)
    const productsTotal = order.products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const recipesTotal = order.recipes.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    order.totalItems = productsTotal + recipesTotal;
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

    if ((!order.products || order.products.length === 0) && (!order.recipes || order.recipes.length === 0)) {
      throw new Error('La orden debe tener al menos un producto o receta');
    }

    // Validar que cada producto tenga cantidad válida
    order.products?.forEach((product, index) => {
      if (!product.productId) {
        throw new Error(`El producto #${index + 1} debe tener un ID válido`);
      }
      if (!product.quantity || product.quantity <= 0) {
        throw new Error(`El producto #${index + 1} debe tener una cantidad válida mayor a 0`);
      }
    });

    // Validar que cada receta tenga cantidad válida
    order.recipes?.forEach((recipe, index) => {
      if (!recipe.recipeId) {
        throw new Error(`La receta #${index + 1} debe tener un ID válido`);
      }
      if (!recipe.quantity || recipe.quantity <= 0) {
        throw new Error(`La receta #${index + 1} debe tener una cantidad válida mayor a 0`);
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
    if (!order.customerId || !order.orderDate || !order.status || !order.products || !order.recipes) {
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

  async findByCustomerId(customerId: string): Promise<CustomerOrder[]> {
    return this.repository.findByCustomerId(customerId);
  }

  async findByStatus(status: OrderStatus): Promise<CustomerOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 