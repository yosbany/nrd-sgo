import { CustomerOrder } from '@/domain/models/customer-order.model';
import { ProductionOrder } from '@/domain/models/production-order.model';
import { PurchaseOrder } from '@/domain/models/purchase-order.model';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderTextFormatterProps {
  order: CustomerOrder | ProductionOrder | PurchaseOrder;
  type: 'customer' | 'production' | 'purchase';
  customerName?: string;
  workerName?: string;
  supplierName?: string;
  products?: Array<{ id: string; name: string }>;
  recipes?: Array<{ id: string; name: string }>;
}

export class OrderTextFormatter {
  private order: CustomerOrder | ProductionOrder | PurchaseOrder;
  private type: 'customer' | 'production' | 'purchase';
  private customerName?: string;
  private workerName?: string;
  private supplierName?: string;
  private products?: Array<{ id: string; name: string }>;
  private recipes?: Array<{ id: string; name: string }>;

  constructor(props: OrderTextFormatterProps) {
    this.order = props.order;
    this.type = props.type;
    this.customerName = props.customerName;
    this.workerName = props.workerName;
    this.supplierName = props.supplierName;
    this.products = props.products;
    this.recipes = props.recipes;
  }

  private formatDate(date: Date | string) {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, 'PPP', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  }

  private getStatusLabel(status: string) {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'COMPLETED':
        return 'Completado';
      default:
        return status;
    }
  }

  private getHeader() {
    switch (this.type) {
      case 'customer':
        return `*PEDIDO #${this.order.id.slice(0, 3).toUpperCase()}${this.order.id.slice(-2).toUpperCase()}*\n` +
          `Fecha: ${this.formatDate(this.order.orderDate)}\n` +
          `Estado: ${this.getStatusLabel(this.order.status)}\n` +
          `Cliente: ${this.customerName || 'No asignado'}\n`;
      case 'production':
        return `*ORDEN DE PRODUCCIÓN #${this.order.id.slice(0, 3).toUpperCase()}${this.order.id.slice(-2).toUpperCase()}*\n` +
          `Fecha: ${this.formatDate(this.order.orderDate)}\n` +
          `Estado: ${this.getStatusLabel(this.order.status)}\n` +
          `Responsable: ${this.workerName || 'No asignado'}\n`;
      case 'purchase':
        return `*ORDEN DE COMPRA #${this.order.id.slice(0, 3).toUpperCase()}${this.order.id.slice(-2).toUpperCase()}*\n` +
          `Fecha: ${this.formatDate(this.order.orderDate)}\n` +
          `Estado: ${this.getStatusLabel(this.order.status)}\n` +
          `Proveedor: ${this.supplierName || 'No asignado'}\n`;
      default:
        return '';
    }
  }

  private getItems() {
    let items = '\n*DETALLE:*\n';
    
    if (this.type === 'customer') {
      const customerOrder = this.order as CustomerOrder;
      if (customerOrder.products?.length) {
        items += '\n*Productos:*\n';
        customerOrder.products.forEach(product => {
          const productName = this.products?.find(p => p.id === product.productId)?.name || 'Producto no encontrado';
          items += `• ${productName}: ${product.quantity}\n`;
        });
      }
      if (customerOrder.recipes?.length) {
        items += '\n*Recetas:*\n';
        customerOrder.recipes.forEach(recipe => {
          const recipeName = this.recipes?.find(r => r.id === recipe.recipeId)?.name || 'Receta no encontrada';
          items += `• ${recipeName}: ${recipe.quantity}\n`;
        });
      }
    } else if (this.type === 'production') {
      const productionOrder = this.order as ProductionOrder;
      if (productionOrder.recipes?.length) {
        productionOrder.recipes.forEach(recipe => {
          const recipeName = this.recipes?.find(r => r.id === recipe.recipeId)?.name || 'Receta no encontrada';
          items += `• ${recipeName}: ${recipe.quantity}\n`;
        });
      }
    } else if (this.type === 'purchase') {
      const purchaseOrder = this.order as PurchaseOrder;
      if (purchaseOrder.products?.length) {
        purchaseOrder.products.forEach(product => {
          const productName = this.products?.find(p => p.id === product.productId)?.name || 'Producto no encontrado';
          items += `• ${productName}: ${product.quantity}\n`;
        });
      }
    }

    return items;
  }

  private getTotal() {
    let total = 0;
    if (this.type === 'customer') {
      const customerOrder = this.order as CustomerOrder;
      total = (customerOrder.products?.reduce((sum, p) => sum + p.quantity, 0) || 0) +
        (customerOrder.recipes?.reduce((sum, r) => sum + r.quantity, 0) || 0);
    } else if (this.type === 'production') {
      const productionOrder = this.order as ProductionOrder;
      total = productionOrder.recipes?.reduce((sum, r) => sum + r.quantity, 0) || 0;
    } else if (this.type === 'purchase') {
      const purchaseOrder = this.order as PurchaseOrder;
      total = purchaseOrder.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
    }
    return total > 0 ? `\n*Total: ${total}*` : '';
  }

  toString() {
    return this.getHeader() + this.getItems() + this.getTotal();
  }
} 