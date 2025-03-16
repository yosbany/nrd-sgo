export enum InventoryAffectType {
  PERDIDA = 'PERDIDA',
  DANIO = 'DANIO',
  VENCIMIENTO = 'VENCIMIENTO',
  FACTURACION = 'FACTURACION'
}

export const getInventoryAffectTypeOptions = () => [
  { value: InventoryAffectType.PERDIDA, label: 'PERDIDA' },
  { value: InventoryAffectType.DANIO, label: 'DAÑO' },
  { value: InventoryAffectType.VENCIMIENTO, label: 'VENCIMIENTO' },
  { value: InventoryAffectType.FACTURACION, label: 'FACTURACIÓN' }
]; 