import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Recipe } from '../../../domain/models/recipe.model';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { getStatusOptions } from '@/domain/enums/entity-status.enum';

export function RecipeList() {
  const recipeService = new RecipeServiceImpl();
  const unitService = React.useMemo(() => new UnitServiceImpl(), []);
  const [units, setUnits] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadUnits = async () => {
      try {
        const unitsData = await unitService.findAll();
        const unitsMap = unitsData.reduce((acc, unit) => ({
          ...acc,
          [unit.id!]: unit.name
        }), {} as Record<string, string>);
        setUnits(unitsMap);
      } catch (error) {
        console.error('Error loading units:', error);
      }
    };

    loadUnits();
  }, [unitService]);

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Recipe },
    {
      header: 'Estado',
      accessor: 'status' as keyof Recipe,
      type: 'tag' as const,
      tags: getStatusOptions()
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