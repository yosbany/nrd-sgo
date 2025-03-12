import React from 'react';
import { OrderStatus, OrderStatusLabel, OrderStatusColor } from '@/domain/models/order-status.enum';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const baseStyles = "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset";
  
  const colorStyles = {
    warning: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    info: "bg-blue-50 text-blue-700 ring-blue-700/10",
    success: "bg-green-50 text-green-700 ring-green-600/20",
    destructive: "bg-red-50 text-red-700 ring-red-600/10"
  };

  return (
    <span className={cn(
      baseStyles,
      colorStyles[OrderStatusColor[status]],
      className
    )}>
      {OrderStatusLabel[status]}
    </span>
  );
}; 