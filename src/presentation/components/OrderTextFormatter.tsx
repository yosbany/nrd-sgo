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
  outputFormat?: 'whatsapp' | 'print';
}

interface FormattedItem {
  quantity: number;
  unit: string;
  description: string;
}

export class OrderTextFormatter {
  private order: CustomerOrder | ProductionOrder | PurchaseOrder;
  private type: 'customer' | 'production' | 'purchase';
  private products?: Array<{ id: string; name: string; purchaseUnitId?: string; salesUnitId?: string }>;
  private recipes?: Array<{ id: string; name: string; yieldUnitId?: string }>;
  private outputFormat: 'whatsapp' | 'print';
  private units?: Array<{ id: string; name: string }>;
  private customerName?: string;

  constructor(props: OrderTextFormatterProps) {
    this.order = props.order;
    this.type = props.type;
    this.products = props.products;
    this.recipes = props.recipes;
    this.outputFormat = props.outputFormat || 'whatsapp';
    this.units = props.units;
    this.customerName = props.customerName;
  }

  private wrap(text: string, isHeader = false): string {
    if (this.outputFormat === 'print') {
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
    if (!unitId || !this.units) return 'Unidad';
    const unit = this.units.find(u => u.id === unitId);
    return unit?.name || 'Unidad';
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

    return this.outputFormat === 'print' 
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
    return this.outputFormat === 'print'
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
    if (this.type === 'customer') {
      const customerOrder = this.order as CustomerOrder;
      return customerOrder.items.map(item => {
        let description = '';
        let unit = 'Unidad';

        if (item.typeItem === 'product') {
          const productInfo = this.products?.find(p => p.id === item.itemId);
          unit = this.getUnitName(productInfo?.salesUnitId);
          description = productInfo?.name || 'Producto no encontrado';
        } else if (item.typeItem === 'recipe') {
          const recipeInfo = this.recipes?.find(r => r.id === item.itemId);
          unit = this.getUnitName(recipeInfo?.yieldUnitId);
          description = recipeInfo?.name || 'Receta no encontrada';
        }

        return `${item.quantity} ${unit} - ${description}`;
      }).join(this.outputFormat === 'print' ? '<br>' : '\n');
    }

    return '';
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
      const items: FormattedItem[] = customerOrder.items.map(item => {
        let description = '';
        let unit = 'Unidad';

        if (item.typeItem === 'product') {
          const productInfo = this.products?.find(p => p.id === item.itemId);
          unit = this.getUnitName(productInfo?.salesUnitId);
          description = productInfo?.name || 'Producto no encontrado';
        } else if (item.typeItem === 'recipe') {
          const recipeInfo = this.recipes?.find(r => r.id === item.itemId);
          unit = this.getUnitName(recipeInfo?.yieldUnitId);
          description = recipeInfo?.name || 'Receta no encontrada';
        }

        return {
          quantity: item.quantity,
          unit,
          description
        };
      });

      if (items.length > 0) {
        const firstItem = items[0];
        totalText = `Total Items: ${customerOrder.totalItems} ${firstItem.unit}`;
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

    return this.outputFormat === 'print'
      ? this.formatPrintTotal(totalText)
      : this.formatWhatsAppTotal(totalText);
  }

  public toString(): string {
    const date = format(new Date(this.order.orderDate), 'dd/MM/yyyy', { locale: es });
    const items = this.getItems();
    const total = this.getTotal();

    let header = '';
    if (this.type === 'customer') {
      header = `Pedido de Cliente #${this.order.id}\n`;
      header += `Cliente: ${this.customerName || 'No especificado'}\n`;
    }

    const body = `
Fecha: ${date}
${items}
${total}
`;

    return header + body;
  }
} 