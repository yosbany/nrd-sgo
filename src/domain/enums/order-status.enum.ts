export enum OrderStatus {
  PENDIENTE = 'PENDIENTE',
  ENVIADA = 'ENVIADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA'
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case OrderStatus.PENDIENTE:
      return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.ENVIADA:
      return 'bg-blue-100 text-blue-800';
    case OrderStatus.COMPLETADA:
      return 'bg-green-100 text-green-800';
    case OrderStatus.CANCELADA:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDIENTE]: 'PENDIENTE',
  [OrderStatus.ENVIADA]: 'ENVIADA',
  [OrderStatus.COMPLETADA]: 'COMPLETADA',
  [OrderStatus.CANCELADA]: 'CANCELADA'
};

export const OrderStatusColor: Record<OrderStatus, string> = {
  [OrderStatus.PENDIENTE]: 'warning',
  [OrderStatus.ENVIADA]: 'info',
  [OrderStatus.COMPLETADA]: 'success',
  [OrderStatus.CANCELADA]: 'destructive'
} as const; 