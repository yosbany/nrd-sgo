export enum RecipeType {
    RECETA_VENTA = 'RECETA_VENTA',
    RECETA_INTERNA = 'RECETA_INTERNA'
}

export const getLabel = (type: RecipeType) => {
    switch (type) {
      case RecipeType.RECETA_VENTA:
        return 'RECETA EN VENTA';
      case RecipeType.RECETA_INTERNA:
        return 'RECETA INTERNA';
      default:
        return type;
    }
};

export const getOptions = () => [
    { value: RecipeType.RECETA_VENTA, label: 'RECETA EN VENTA' },
    { value: RecipeType.RECETA_INTERNA, label: 'RECETA INTERNA' }
];