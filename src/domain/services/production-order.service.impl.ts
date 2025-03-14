import { ProductionOrder } from '../models/production-order.model';
import { IProductionOrderService } from './interfaces/production-order.service.interface';
import { IProductionOrderRepository } from '../repositories/interfaces/production-order.repository.interface';
import { ProductionOrderRepositoryImpl } from '../repositories/production-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../enums/order-status.enum';

export class ProductionOrderServiceImpl extends BaseServiceImpl<ProductionOrder, IProductionOrderRepository> implements IProductionOrderService {
  constructor() {
    super(ProductionOrderRepositoryImpl, 'production-orders');
  }

  private calculateTotals(order: Partial<ProductionOrder>): void {
    if (!order.recipes) {
      order.recipes = [];
    }

    // Total de recetas diferentes
    order.totalProducts = order.recipes.length;
    
    // Total de items (suma de cantidades)
    order.totalItems = order.recipes.reduce((sum, recipe) => sum + (Number(recipe.quantity) || 0), 0);
  }

  private validateOrder(order: Partial<ProductionOrder>): void {
    if (!order.responsibleWorkerId) {
      throw new Error('La orden debe tener un trabajador responsable asignado');
    }

    if (!order.orderDate) {
      throw new Error('La orden debe tener una fecha');
    }

    if (!order.status) {
      throw new Error('La orden debe tener un estado');
    }

    if (!order.recipes || order.recipes.length === 0) {
      throw new Error('La orden debe tener al menos una receta');
    }

    // Validar que cada receta tenga cantidad válida
    order.recipes.forEach((recipe, index) => {
      if (!recipe.recipeId) {
        throw new Error(`La receta #${index + 1} debe tener un ID válido`);
      }
      if (!recipe.quantity || recipe.quantity <= 0) {
        throw new Error(`La receta #${index + 1} debe tener una cantidad válida mayor a 0`);
      }
    });
  }

  async create(order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    order.status = order.status || OrderStatus.PENDIENTE;
    this.calculateTotals(order);
    this.validateOrder(order);
    return super.create(order as ProductionOrder);
  }

  async update(id: string, order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    // Si se está actualizando parcialmente, obtener la orden actual
    if (!order.responsibleWorkerId || !order.orderDate || !order.status || !order.recipes) {
      const currentOrder = await this.findById(id);
      if (!currentOrder) {
        throw new Error('Orden no encontrada');
      }
      order = {
        ...currentOrder,
        ...order
      } as ProductionOrder;
    }
    
    this.calculateTotals(order);
    this.validateOrder(order);
    return super.update(id, order);
  }

  async findByResponsibleWorkerId(workerId: string): Promise<ProductionOrder[]> {
    return this.repository.findByResponsibleWorkerId(workerId);
  }

  async findByStatus(status: OrderStatus): Promise<ProductionOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }

  async findByNro(nro: string): Promise<ProductionOrder | null> {
    const orders = await this.findAll();
    return orders.find(order => order.nro === nro) || null;
  }

  async copyOrder(nro: string): Promise<Partial<ProductionOrder>> {
    const originalOrder = await this.findByNro(nro);
    if (!originalOrder) {
      throw new Error(`La orden número ${nro} no existe`);
    }

    // Crear una nueva orden con los datos de la original
    // excepto el id, nro y fecha
    const newOrder: Partial<ProductionOrder> = {
      orderDate: new Date(), // Fecha actual
      status: OrderStatus.PENDIENTE, // Siempre pendiente para nueva orden
      responsibleWorkerId: originalOrder.responsibleWorkerId,
      recipes: originalOrder.recipes,
      totalItems: originalOrder.totalItems,
      totalProducts: originalOrder.totalProducts
    };

    return newOrder;
  }
} 