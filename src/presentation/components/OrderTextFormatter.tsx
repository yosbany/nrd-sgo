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
  products?: Array<{ id: string; name: string; purchaseUnit?: string; saleUnit?: string }>;
  recipes?: Array<{ id: string; name: string; unit?: string }>;
  format?: 'whatsapp' | 'print';
}

export class OrderTextFormatter {
  private order: CustomerOrder | ProductionOrder | PurchaseOrder;
  private type: 'customer' | 'production' | 'purchase';
  private customerName?: string;
  private workerName?: string;
  private supplierName?: string;
  private products?: Array<{ id: string; name: string; purchaseUnit?: string; saleUnit?: string }>;
  private recipes?: Array<{ id: string; name: string; unit?: string }>;
  private format: 'whatsapp' | 'print';

  constructor(props: OrderTextFormatterProps) {
    this.order = props.order;
    this.type = props.type;
    this.customerName = props.customerName;
    this.workerName = props.workerName;
    this.supplierName = props.supplierName;
    this.products = props.products;
    this.recipes = props.recipes;
    this.format = props.format || 'whatsapp';
  }

  private wrap(text: string, isHeader = false): string {
    if (this.format === 'print') {
      return isHeader ? `<div style="font-size: 14px;"><b>${text}</b></div>` : `<b>${text}</b>`;
    }
    return text;
  }

  private formatDate(date: Date | string) {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  }

  private getHeader() {
    const orderId = this.order.id.slice(-4).toUpperCase();
    let title = '';

    switch (this.type) {
      case 'customer':
        title = 'PEDIDO';
        break;
      case 'production':
        title = 'PRODUCCIÓN';
        break;
      case 'purchase':
        title = 'COMPRA';
        break;
    }

    const separator = this.format === 'print' 
      ? '<div style="border-bottom: 1px solid black; margin: 8px 0;"></div>'
      : '--------------------------------';

    return this.wrap(`${title} #${orderId}`, true) + '\n' +
           this.wrap(`Fecha: ${this.formatDate(this.order.orderDate)}`) + '\n' +
           (this.format === 'print' ? separator : `\n${separator}`) + '\n';
  }

  private formatItem(quantity: number, name: string, unit: string): string {
    const paddedQuantity = quantity.toString().padStart(2, ' ');
    return this.wrap(`${paddedQuantity} ${unit.padEnd(4)} ${name}`);
  }

  private getItems() {
    const items: string[] = [];
    
    if (this.type === 'customer') {
      const customerOrder = this.order as CustomerOrder;
      if (customerOrder.products?.length) {
        items.push(this.wrap('PRODUCTOS:'));
        customerOrder.products.forEach(product => {
          const productInfo = this.products?.find(p => p.id === product.productId);
          const productName = productInfo?.name || 'Producto no encontrado';
          const unit = productInfo?.saleUnit || 'und';
          items.push(this.formatItem(product.quantity, productName, unit));
        });
      }
      if (customerOrder.recipes?.length) {
        if (items.length > 0) items.push(''); // Línea en blanco entre secciones
        items.push(this.wrap('RECETAS:'));
        customerOrder.recipes.forEach(recipe => {
          const recipeInfo = this.recipes?.find(r => r.id === recipe.recipeId);
          const recipeName = recipeInfo?.name || 'Receta no encontrada';
          const unit = recipeInfo?.unit || 'und';
          items.push(this.formatItem(recipe.quantity, recipeName, unit));
        });
      }
    } else if (this.type === 'production') {
      const productionOrder = this.order as ProductionOrder;
      if (productionOrder.recipes?.length) {
        items.push(this.wrap('RECETAS:'));
        productionOrder.recipes.forEach(recipe => {
          const recipeInfo = this.recipes?.find(r => r.id === recipe.recipeId);
          const recipeName = recipeInfo?.name || 'Receta no encontrada';
          const unit = recipeInfo?.unit || 'und';
          items.push(this.formatItem(recipe.quantity, recipeName, unit));
        });
      }
    } else if (this.type === 'purchase') {
      const purchaseOrder = this.order as PurchaseOrder;
      if (purchaseOrder.products?.length) {
        items.push(this.wrap('PRODUCTOS:'));
        purchaseOrder.products.forEach(product => {
          const productInfo = this.products?.find(p => p.id === product.productId);
          const productName = productInfo?.name || 'Producto no encontrado';
          const unit = productInfo?.purchaseUnit || 'und';
          items.push(this.formatItem(product.quantity, productName, unit));
        });
      }
    }

    return items.length > 0 ? '\n' + items.join('\n') : '';
  }

  private getTotal() {
    let total = 0;
    let unit = 'und';

    if (this.type === 'customer') {
      const customerOrder = this.order as CustomerOrder;
      total = (customerOrder.products?.reduce((sum, p) => sum + p.quantity, 0) || 0) +
        (customerOrder.recipes?.reduce((sum, r) => sum + r.quantity, 0) || 0);
      unit = 'und';
    } else if (this.type === 'production') {
      const productionOrder = this.order as ProductionOrder;
      total = productionOrder.recipes?.reduce((sum, r) => sum + r.quantity, 0) || 0;
      unit = 'und';
    } else if (this.type === 'purchase') {
      const purchaseOrder = this.order as PurchaseOrder;
      total = purchaseOrder.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
      unit = 'und';
    }
    return total > 0 ? '\n\n' + this.wrap(`TOTAL: ${total} ${unit}`) : '';
  }

  toString() {
    return this.getHeader() + this.getItems() + this.getTotal();
  }
} 