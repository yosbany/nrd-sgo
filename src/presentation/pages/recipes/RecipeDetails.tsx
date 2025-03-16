import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { Material, Recipe } from '../../../domain/models/recipe.model';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { Product } from '../../../domain/models/product.model';
import { getLabel, RecipeType } from '@/domain/enums/recipe-type.enum';

export function RecipeDetails() {
  const { id } = useParams<{ id: string }>();
  const recipeService = React.useMemo(() => new RecipeServiceImpl(), []);
  const workerService = React.useMemo(() => new WorkerServiceImpl(), []);
  const unitService = React.useMemo(() => new UnitServiceImpl(), []);
  const productService = React.useMemo(() => new ProductServiceImpl(), []);
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
        [worker.id as string]: worker.name
      }), {});

      const unitsMap = unitsData.reduce((acc, unit) => ({
        ...acc,
        [unit.id as string]: unit.name
      }), {});

      const productsMap = productsData.reduce((acc, product) => ({
        ...acc,
        [product.id as string]: product
      }), {});

      const recipesMap = recipesData.reduce((acc, recipe) => ({
        ...acc,
        [recipe.id as string]: recipe
      }), {});

      setWorkers(workersMap);
      setUnits(unitsMap);
      setProducts(productsMap);
      setRecipes(recipesMap);
    };
    loadData();
  }, [productService, recipeService, unitService, workerService]);

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

  const getFields = (recipe: Recipe) => {
    const generalInfo = (
      <div className="space-y-4">
        <div className="flex flex-col space-y-1.5 pb-4 border-b">
          <h3 className="text-lg font-semibold">Información General</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Nombre:</dt>
            <dd className="text-base">{recipe.name}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Tipo:</dt>
            <dd className="text-base">{getLabel(recipe.recipeType)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Unidad de Rendimiento:</dt>
            <dd className="text-base">{units[recipe.yieldUnitId] || 'Unidad no encontrada'}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Rendimiento:</dt>
            <dd className="text-base">{recipe.yield}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Producción Deseada:</dt>
            <dd className="text-base">{recipe.desiredProduction || '-'}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Trabajador Principal:</dt>
            <dd className="text-base">{workers[recipe.primaryWorkerId] || 'Trabajador no encontrado'}</dd>
          </div>
        </div>
      </div>
    );

    const saleInfo = recipe.recipeType === RecipeType.RECETA_VENTA ? (
      <div className="space-y-4">
        <div className="flex flex-col space-y-1.5 pb-4 border-b">
          <h3 className="text-lg font-semibold">Información de Venta</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">SKU:</dt>
            <dd className="text-base">{recipe.sku}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Nombre de Venta:</dt>
            <dd className="text-base">{recipe.nameSale || '-'}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Precio de Venta:</dt>
            <dd className="text-base">{recipe.salePrice?.toLocaleString('es-UY', {
              style: 'currency',
              currency: 'UYU',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }) || '-'}</dd>
          </div>
        </div>
      </div>
    ) : null;

    const details = (
      <div className="space-y-4">
        <div className="flex flex-col space-y-1.5 pb-4 border-b">
          <h3 className="text-lg font-semibold">Detalles</h3>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <dt className="text-base font-bold text-muted-foreground">Materiales</dt>
            <dd>{renderMaterials(recipe.materials)}</dd>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            <div className="flex items-center gap-2">
              <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Total de Materiales:</dt>
              <dd className="text-base">{recipe.totalMaterial}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Total de Items:</dt>
              <dd className="text-base">{recipe.totalItems}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Costo Unitario:</dt>
              <dd className="text-base">{recipe.unitCost?.toLocaleString('es-UY', {
                style: 'currency',
                currency: 'UYU',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }) || '-'}</dd>
            </div>
            {recipe.recipeType === RecipeType.RECETA_VENTA && (
              <div className="flex items-center gap-2">
                <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Margen:</dt>
                <dd className="text-base">{recipe.margin ? `${recipe.margin}%` : '-'}</dd>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-base font-bold text-muted-foreground whitespace-nowrap">Notas:</dt>
            <dd className="text-base">{recipe.notes || '-'}</dd>
          </div>
        </div>
      </div>
    );

    return [
      { label: '', value: generalInfo, colSpan: 3 },
      ...(saleInfo ? [{ label: '', value: saleInfo, colSpan: 3 }] : []),
      { label: '', value: details, colSpan: 3 }
    ];
  };

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