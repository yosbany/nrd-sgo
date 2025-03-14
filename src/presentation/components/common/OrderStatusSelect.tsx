import React from 'react';
import { Select } from '@/presentation/components/ui/select';
import { OrderStatus, OrderStatusLabel } from '@/domain/enums/order-status.enum';

interface OrderStatusSelectProps {
  value: OrderStatus;
  onChange: (value: string) => void;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
}

export const OrderStatusSelect: React.FC<OrderStatusSelectProps> = ({
  value,
  onChange,
  readOnly,
  required,
  className
}) => {
  const options = Object.values(OrderStatus).map(status => ({
    value: status,
    label: OrderStatusLabel[status]
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      readOnly={readOnly}
      required={required}
      className={className}
      placeholder="Seleccione un estado"
    />
  );
}; 