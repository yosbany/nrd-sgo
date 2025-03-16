export enum Sector {
    GENERAL = 'GENERAL',
    ALMACEN = 'ALMACEN',
    PRODUCCION = 'PRODUCCION',
    VENTAS = 'VENTAS',
}

export const getLabel = (type: Sector) => {
    switch (type) {
      case Sector.GENERAL:
        return 'GENERAL';
      case Sector.ALMACEN:
        return 'ALMACÉN';
    case Sector.PRODUCCION:
        return 'PRODUCCIÓN';
    case Sector.VENTAS:
        return 'VENTAS';
      default:
        return type;
    }
};

export const getOptions = () => [
    { value: Sector.GENERAL, label: 'GENERAL' },
    { value: Sector.ALMACEN, label: 'ALMACÉN' },
    { value: Sector.PRODUCCION, label: 'PRODUCCIÓN' },
    { value: Sector.VENTAS, label: 'VENTAS' }
];