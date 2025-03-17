import { formatDateToDisplay } from '@/lib/utils';

interface WhatsAppMessageProps {
  orderNumber: string | number;
  date: Date;
  contactName: string;
  businessName?: string;
  items: Array<{
    quantity: number;
    unit: string;
    description: string;
  }>;
  totals: {
    products: number;
    items: number;
  };
}

export const formatWhatsAppMessage = ({
  orderNumber,
  date,
  contactName,
  businessName = "Panadería Nueva Río D'or",
  items,
  totals,
}: WhatsAppMessageProps): string => {
  // Asegurar que el número de orden tenga 5 dígitos
  const paddedOrderNumber = orderNumber.toString().padStart(5, '0');
  const header = `Orden: #${paddedOrderNumber}`;
  const dateStr = `Fecha: ${formatDateToDisplay(date)}`;

  const itemsList = items
    .map(item => `•⁠  ⁠${item.quantity} ${item.unit.toUpperCase()} - ${item.description.toUpperCase()}`)
    .join('\n');

  const separator = '--------------------------------';
  const totalsLine = `Totales : ${totals.products} / ${totals.items}`;

  const message = [
    header,
    dateStr,
    businessName,
    '',
    separator,
    itemsList,
    '',
    separator,
    totalsLine
  ].join('\n');

  return encodeURIComponent(message);
};

export const sendWhatsAppMessage = (phone: string, message: string) => {
  // Eliminar todos los caracteres no numéricos
  let formattedPhone = phone.replace(/\D/g, '');
  
  // Si el número comienza con 0, eliminarlo
  if (formattedPhone.startsWith('0')) {
    formattedPhone = formattedPhone.slice(1);
  }
  
  // Si el número no comienza con 598, agregarlo
  if (!formattedPhone.startsWith('598')) {
    formattedPhone = '598' + formattedPhone;
  }

  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}; 