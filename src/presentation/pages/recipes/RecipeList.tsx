import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Recipe, RecipeType } from '../../../domain/models/recipe.model';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';

export function RecipeList() {
  const recipeService = new RecipeServiceImpl();
  const unitService = new UnitServiceImpl();
  const [units, setUnits] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadUnits = async () => {
      try {
        const unitsData = await unitService.findAll();
        const unitsMap = unitsData.reduce((acc, unit) => ({
          ...acc,
          [unit.id]: unit.symbol
        }), {});
        setUnits(unitsMap);
      } catch (error) {
        console.error('Error loading units:', error);
      }
    };

    loadUnits();
  }, []);

  const getRecipeTypeLabel = (type: RecipeType) => {
    switch (type) {
      case RecipeType.SALE_RECIPE:
        return 'Receta de Venta';
      case RecipeType.INTERNAL_USE:
        return 'Uso Interno';
      default:
        return type;
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Recipe },
    {
      header: 'Tipo',
      accessor: 'recipeType' as keyof Recipe,
      render: (item: Recipe) => getRecipeTypeLabel(item.recipeType),
    },
    {
      header: 'Rendimiento',
      accessor: 'yield' as keyof Recipe,
      render: (item: Recipe) =>
        `${item.yield} ${units[item.yieldUnitId] || ''}`,
    },
    {
      header: 'Materiales',
      accessor: 'materials' as keyof Recipe,
      render: (item: Recipe) => item.materials?.length || 0,
    },
  ];

  return (
    <GenericList<Recipe>
      columns={columns}
      title="Recetas"
      addPath="/recipes/new"
      backPath="/recipes"
      service={recipeService}
    />
  );
} 