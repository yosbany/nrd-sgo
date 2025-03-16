export enum EntityStatus {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

export const getLabel = (type: EntityStatus) => {
  switch (type) {
    case EntityStatus.ACTIVO:
      return 'ACTIVO';
    case EntityStatus.INACTIVO:
      return 'INACTIVO';
    default:
      return type;
  }
};

export const getOptions = () => [
  { value: EntityStatus.ACTIVO, label: 'ACTIVO' },
  { value: EntityStatus.INACTIVO, label: 'INACTIVO' }
];

export const getStatusOptions = () => [
  { 
    value: EntityStatus.ACTIVO, 
    label: 'ACTIVO', 
    color: 'success' as const 
  },
  { 
    value: EntityStatus.INACTIVO, 
    label: 'INACTIVO', 
    color: 'secondary' as const 
  }
];