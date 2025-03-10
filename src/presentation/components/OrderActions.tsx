import React from 'react';
import { Button } from '@/presentation/components/ui/button';
import { Eye, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { OrderTextFormatter } from './OrderTextFormatter';
import { toast } from 'sonner';

interface OrderActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  order: any;
  type: 'customer' | 'production' | 'purchase';
  customerName?: string;
  customerPhone?: string;
  workerName?: string;
  workerPhone?: string;
  supplierName?: string;
  supplierPhone?: string;
  products?: Array<{ id: string; name: string }>;
  recipes?: Array<{ id: string; name: string }>;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  order,
  type,
  customerName,
  customerPhone,
  workerName,
  workerPhone,
  supplierName,
  supplierPhone,
  products,
  recipes,
}) => {
  const handleShare = () => {
    let phone = '';
    let recipientName = '';

    switch (type) {
      case 'customer':
        phone = customerPhone || '';
        recipientName = customerName || 'cliente';
        break;
      case 'production':
        phone = workerPhone || '';
        recipientName = workerName || 'trabajador';
        break;
      case 'purchase':
        phone = supplierPhone || '';
        recipientName = supplierName || 'proveedor';
        break;
    }

    const formattedText = new OrderTextFormatter({
      order,
      type,
      customerName,
      workerName,
      supplierName,
      products,
      recipes,
    }).toString();

    // Formatear el número de teléfono
    let formattedPhone = phone.replace(/\D/g, '');
    
    // Si hay un número de teléfono, asegurarse de que tenga el formato correcto
    if (formattedPhone) {
      // Si el número comienza con 0, eliminarlo
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.slice(1);
      }
      
      // Si el número no comienza con el código de país, agregar 598
      if (!formattedPhone.startsWith('598')) {
        formattedPhone = '598' + formattedPhone;
      }
    }
    
    // Construir la URL de WhatsApp
    const whatsappUrl = formattedPhone 
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(formattedText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Button
        variant="outline"
        className="aspect-square flex flex-col items-center justify-center gap-3 min-h-[140px]"
        onClick={onView}
      >
        <Eye className="h-8 w-8" />
        <span className="text-base">Ver</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square flex flex-col items-center justify-center gap-3 min-h-[140px] bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
        onClick={onEdit}
      >
        <Pencil className="h-8 w-8" />
        <span className="text-base">Editar</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square flex flex-col items-center justify-center gap-3 min-h-[140px] bg-green-500 hover:bg-green-600 text-white border-green-500"
        onClick={handleShare}
      >
        <MessageCircle className="h-8 w-8" />
        <span className="text-base">WhatsApp</span>
      </Button>
      <Button
        variant="outline"
        className="aspect-square flex flex-col items-center justify-center gap-3 min-h-[140px] bg-red-500 hover:bg-red-600 text-white border-red-500"
        onClick={onDelete}
      >
        <Trash2 className="h-8 w-8" />
        <span className="text-base">Eliminar</span>
      </Button>
    </div>
  );
}; 