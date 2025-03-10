import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { Material, Recipe, RecipeType, YieldUnit } from '../../../domain/models/recipe.model';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { Product } from '../../../domain/models/product.model';

export function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const recipeService = new RecipeServiceImpl();
  const workerService = new WorkerServiceImpl();
  const unitService = new UnitServiceImpl();
  const productService = new ProductServiceImpl();
  const [workers, setWorkers] = React.useState<Record<string, string>>({});
  const [units, setUnits] = React.useState<Record<string, string>>({});
  const [products, setProducts] = React.useState<Record<string, Product>>({});
  const [recipes, setRecipes] = React.useState<Record<string, Recipe>>({});

  React.useEffect(() => {
    const loadData = async () => {
      const [workersData, unitsData, productsData, recipesData] = await Promise.all([
        workerService.findAll(),
        unitService.findAll(),
        productService.findAll(),
        recipeService.findAll()
      ]);

      const workersMap = workersData.reduce((acc, worker) => ({
        ...acc,
        [worker.id]: worker.name
      }), {});

      const unitsMap = unitsData.reduce((acc, unit) => ({
        ...acc,
        [unit.id]: unit.name
      }), {});

      const productsMap = productsData.reduce((acc, product) => ({
        ...acc,
        [product.id]: product
      }), {});

      const recipesMap = recipesData.reduce((acc, recipe) => ({
        ...acc,
        [recipe.id]: recipe
      }), {});

      setWorkers(workersMap);
      setUnits(unitsMap);
      setProducts(productsMap);
      setRecipes(recipesMap);
    };
    loadData();
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

  const getYieldUnitLabel = (unit: YieldUnit) => {
    switch (unit) {
      case YieldUnit.PIECES:
        return 'Piezas';
      case YieldUnit.KG:
        return 'Kilogramos';
      default:
        return unit;
    }
  };

  const renderMaterials = (materials: Recipe['materials']) => {
    const columns = [
      {
        header: 'Material',
        accessor: (material: Material) => {
          let materialName = 'Material no encontrado';
          if (material.materialId) {
            const product = products[material.materialId];
            const recipe = recipes[material.materialId];
            if (product) {
              materialName = product.name;
            }
            else if (recipe) {
              materialName = `R - ${recipe.name}`;
            }
          }
          return <div className="font-medium">{materialName}</div>;
        }
      },
      {
        header: 'Cantidad',
        accessor: (material: Material) => {
          let unitName = 'Unidad no encontrada';
          if (material.materialId) {
            const product = products[material.materialId];
            const recipe = recipes[material.materialId];
            if (product) {
              unitName = product.materialUnitId ? units[product.materialUnitId] : 'Unidad no encontrada';
            }
            else if (recipe) {
              unitName = units[recipe.yieldUnitId] || 'Unidad no encontrada';
            }
          }
          return `${material.quantity} ${unitName}`;
        }
      }
    ];

    return <ArrayTable data={materials || []} columns={columns} emptyMessage="No hay materiales" />;
  };

  const getFields = (recipe: Recipe) => [
    { label: 'Nombre', value: recipe.name },
    { label: 'Tipo', value: getRecipeTypeLabel(recipe.recipeType) },
    { label: 'Unidad de Rendimiento', value: units[recipe.yieldUnitId] || 'Unidad no encontrada' },
    { label: 'Rendimiento', value: recipe.yield },
    { label: 'Trabajador Principal', value: workers[recipe.primaryWorkerId] || 'Trabajador no encontrado' },
    { label: 'Notas', value: recipe.notes || '-' },
    { label: 'Materiales', value: renderMaterials(recipe.materials) },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Recipe>
      title="Receta"
      fields={getFields}
      editPath={`/recipes/${id}/edit`}
      backPath="/recipes"
      service={recipeService}
      id={id}
    />
  );
} 