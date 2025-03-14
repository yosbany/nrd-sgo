import { WorkOrder } from '../models/work-order.model';
import { IWorkOrderService } from './interfaces/work-order.service.interface';
import { IWorkOrderRepository } from '../repositories/interfaces/work-order.repository.interface';
import { WorkOrderRepositoryImpl } from '../repositories/work-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../models/order-status.enum';

export class WorkOrderServiceImpl extends BaseServiceImpl<WorkOrder, IWorkOrderRepository> implements IWorkOrderService {
  constructor() {
    super(WorkOrderRepositoryImpl);
  }

  private calculateTotals(order: Partial<WorkOrder>): void {
    if (!order.materials) {
      order.materials = [];
    }

    // Total de materiales diferentes
    order.totalMaterials = order.materials.length;
    
    // Total de items (suma de cantidades)
    order.totalItems = order.materials.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  private validateOrder(order: Partial<WorkOrder>): void {
    if (!order.workerId) {
      throw new Error('La orden debe tener un trabajador asignado');
    }

    if (!order.orderDate) {
      throw new Error('La orden debe tener una fecha');
    }

    if (!order.status) {
      throw new Error('La orden debe tener un estado');
    }

    if (!order.materials || order.materials.length === 0) {
      throw new Error('La orden debe tener al menos un material');
    }

    // Validar que cada material tenga cantidad válida
    order.materials.forEach((material, index) => {
      if (!material.materialId) {
        throw new Error(`El material #${index + 1} debe tener un ID válido`);
      }
      if (!material.quantity || material.quantity <= 0) {
        throw new Error(`El material #${index + 1} debe tener una cantidad válida mayor a 0`);
      }
    });
  }

  async create(order: Partial<WorkOrder>): Promise<WorkOrder> {
    order.status = order.status || OrderStatus.PENDIENTE;
    this.calculateTotals(order);
    this.validateOrder(order);
    return super.create(order as WorkOrder);
  }

  async update(id: string, order: Partial<WorkOrder>): Promise<WorkOrder> {
    // Si se está actualizando parcialmente, obtener la orden actual
    if (!order.workerId || !order.orderDate || !order.status || !order.materials) {
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

  async findByWorkerId(workerId: string): Promise<WorkOrder[]> {
    return this.repository.findByWorkerId(workerId);
  }

  async findByStatus(status: OrderStatus): Promise<WorkOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<WorkOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 