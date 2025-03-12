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
  units?: Array<{ id: string; name: string }>
  supplierName?: string;
  products?: Array<{ id: string; name: string; purchaseUnit?: string; saleUnit?: string }>;
  recipes?: Array<{ id: string; name: string; unit?: string }>;
  format?: 'whatsapp' | 'print';
}

export class OrderTextFormatter {
  private order: CustomerOrder | ProductionOrder | PurchaseOrder;
  private type: 'customer' | 'production' | 'purchase';
  private products?: Array<{ id: string; name: string; purchaseUnitId?: string; salesUnitId?: string }>;
  private recipes?: Array<{ id: string; name: string; yieldUnitId?: string }>;
  private format: 'whatsapp' | 'print';
  private units?: Array<{ id: string; name: string }>;

  constructor(props: OrderTextFormatterProps) {
    this.order = props.order;
    this.type = props.type;
    this.products = props.products;
    this.recipes = props.recipes;
    this.format = props.format || 'whatsapp';
    this.units = props.units;
  }

  private wrap(text: string, isHeader = false): string {
    if (this.format === 'print') {
      return isHeader ? `<div style="font-size: 14px;"><b>${text}</b></div>` : text;
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

  private getUnitName(unitId?: string): string {
    if (!unitId) return 'und';
    return this.units?.find(u => u.id === unitId)?.name || 'und';
  }

  private formatWhatsAppHeader(title: string, orderId: string): string {
    return `${title} #${orderId}\n` +
           `Fecha: ${this.formatDate(this.order.orderDate)}\n` +
           '--------------------------------';
  }

  private formatPrintHeader(title: string, orderId: string): string {
    return `<div style="font-size: 14px;"><b>${title} #${orderId}</b></div><br>` +
           `Fecha: ${this.formatDate(this.order.orderDate)}<br>` +
           '<div style="border-bottom: 1px solid black; margin: 2px 0;"></div>';
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

    return this.format === 'print' 
      ? this.formatPrintHeader(title, orderId)
      : this.formatWhatsAppHeader(title, orderId);
  }

  private formatWhatsAppItem(quantity: number, name: string, unit: string): string {
    const paddedQuantity = quantity.toString().padStart(2, ' ');
    const prefix = `${paddedQuantity} ${unit} `;
    const indent = ' '.repeat(prefix.length);
    
    if (name.length > 35) {
      const words = name.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        if ((currentLine + ' ' + word).length <= 35) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      return prefix + lines.join('\n' + indent);
    }
    
    return `${prefix}${name}`;
  }

  private formatPrintItem(quantity: number, name: string, unit: string): string {
    const paddedQuantity = quantity.toString().padStart(2, ' ');
    const words = name.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= 35) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    return `<tr>
      <td style="text-align: right; white-space: nowrap; padding: 0;"><b>${paddedQuantity}</b></td>
      <td style="white-space: nowrap; padding: 0 4px;"><b>${unit}</b></td>
      <td style="text-align: left; padding: 0;"><b>${lines.join('<br>')}</b></td>
    </tr>`;
  }

  private formatItem(quantity: number, name: string, unit: string): string {
    return this.format === 'print'
      ? this.formatPrintItem(quantity, name, unit)
      : this.formatWhatsAppItem(quantity, name, unit);
  }

  private formatWhatsAppItems(items: string[]): string {
    return items.length > 0 ? '\n' + items.join('\n') : '';
  }

  private formatPrintItems(items: string[]): string {
    if (items.length === 0) return '';
    return '<br><table style="border-collapse: collapse; width: 100%;"><tbody>' +
           items.join('') +
           '</tbody></table>';
  }

  private getItems() {
    const items: string[] = [];
    
    if (this.type === 'customer') {
      const customerOrder = this.order as CustomerOrder;
      if (customerOrder.products?.length) {
        customerOrder.products.forEach(product => {
          const productInfo = this.products?.find(p => p.id === product.productId);
          const productName = productInfo?.name || 'Producto no encontrado';
          const unit = this.getUnitName(productInfo?.salesUnitId);
          items.push(this.formatItem(product.quantity, productName, unit));
        });
      }
      if (customerOrder.recipes?.length) {
        if (items.length > 0 && this.format === 'whatsapp') items.push('');
        customerOrder.recipes.forEach(recipe => {
          const recipeInfo = this.recipes?.find(r => r.id === recipe.recipeId);
          const recipeName = recipeInfo?.name || 'Receta no encontrada';
          const unit = this.getUnitName(recipeInfo?.yieldUnitId);
          items.push(this.formatItem(recipe.quantity, recipeName, unit));
        });
      }
    } else if (this.type === 'production') {
      const productionOrder = this.order as ProductionOrder;
      if (productionOrder.recipes?.length) {
        productionOrder.recipes.forEach(recipe => {
          const recipeInfo = this.recipes?.find(r => r.id === recipe.recipeId);
          const recipeName = recipeInfo?.name || 'Receta no encontrada';
          const unit = this.getUnitName(recipeInfo?.yieldUnitId);
          items.push(this.formatItem(recipe.quantity, recipeName, unit));
        });
      }
    } else if (this.type === 'purchase') {
      const purchaseOrder = this.order as PurchaseOrder;
      if (purchaseOrder.products?.length) {
        purchaseOrder.products.forEach(product => {
          const productInfo = this.products?.find(p => p.id === product.productId);
          const productName = productInfo?.name || 'Producto no encontrado';
          const unit = this.getUnitName(productInfo?.purchaseUnitId);
          items.push(this.formatItem(product.quantity, productName, unit));
        });
      }
    }

    return this.format === 'print'
      ? this.formatPrintItems(items)
      : this.formatWhatsAppItems(items);
  }

  private formatWhatsAppTotal(totalText: string): string {
    return totalText ? '\n\n' + totalText : '';
  }

  private formatPrintTotal(totalText: string): string {
    return totalText ? '<br><br>' + totalText : '';
  }

  private getTotal() {
    let total = 0;
    let unit = 'und';
    let totalText = '';

    if (this.type === 'customer') {
      const customerOrder = this.order as CustomerOrder;
      const productsTotal = customerOrder.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
      const recipesTotal = customerOrder.recipes?.reduce((sum, r) => sum + r.quantity, 0) || 0;
      
      if (productsTotal > 0) {
        const firstProduct = customerOrder.products?.[0];
        const productInfo = this.products?.find(p => p.id === firstProduct?.productId);
        const productUnit = this.getUnitName(productInfo?.salesUnitId);
        totalText += `Total Productos: ${productsTotal} ${productUnit}`;
      }
      
      if (recipesTotal > 0) {
        const firstRecipe = customerOrder.recipes?.[0];
        const recipeInfo = this.recipes?.find(r => r.id === firstRecipe?.recipeId);
        const recipeUnit = this.getUnitName(recipeInfo?.yieldUnitId);
        if (totalText) totalText += this.format === 'print' ? '<br>' : '\n';
        totalText += `Total Items: ${recipesTotal} ${recipeUnit}`;
      }
    } else if (this.type === 'production') {
      const productionOrder = this.order as ProductionOrder;
      total = productionOrder.recipes?.reduce((sum, r) => sum + r.quantity, 0) || 0;
      const firstRecipe = productionOrder.recipes?.[0];
      if (firstRecipe) {
        const recipeInfo = this.recipes?.find(r => r.id === firstRecipe.recipeId);
        unit = this.getUnitName(recipeInfo?.yieldUnitId);
      }
      if (total > 0) {
        totalText = `Total Items: ${total} ${unit}`;
      }
    } else if (this.type === 'purchase') {
      const purchaseOrder = this.order as PurchaseOrder;
      total = purchaseOrder.products?.reduce((sum, p) => sum + p.quantity, 0) || 0;
      const firstProduct = purchaseOrder.products?.[0];
      if (firstProduct) {
        const productInfo = this.products?.find(p => p.id === firstProduct.productId);
        unit = this.getUnitName(productInfo?.purchaseUnitId);
      }
      if (total > 0) {
        totalText = `Total Productos: ${total} ${unit}`;
      }
    }

    return this.format === 'print'
      ? this.formatPrintTotal(totalText)
      : this.formatWhatsAppTotal(totalText);
  }

  toString() {
    const content = this.getHeader() + this.getItems() + this.getTotal();
    return this.format === 'print' ? '<body>' + content + '</body>' : content;
  }
} 