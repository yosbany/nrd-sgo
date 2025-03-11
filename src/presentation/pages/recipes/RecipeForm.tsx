import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Recipe, RecipeType } from '../../../domain/models/recipe.model';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { UnitServiceImpl } from '@/domain/services/unit.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { Product } from '@/domain/models/product.model';


type MaterialOption = {
  id: string;
  name: string;
  materialType: 'Producto' | 'Receta';
  displayName: string;
  unitName: string;
  cost: number;
  originalData: Product | Recipe;
}

export function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = React.useState<Partial<Recipe>>({});
  const [materials, setMaterials] = React.useState<MaterialOption[]>([]);
  const [units, setUnits] = React.useState<Record<string, string>>({});
  const [totalCost, setTotalCost] = React.useState(0);
  const recipeService = new RecipeServiceImpl();
  const productService = new ProductServiceImpl();
  const unitService = new UnitServiceImpl();

  const calculateTotalCost = (materials: any[]) => {
    console.log('====== INICIO CÁLCULO DE COSTO TOTAL ======');
    console.log('Materiales recibidos:', materials);

    if (!materials || materials.length === 0) {
      console.log('No hay materiales para calcular');
      setTotalCost(0);
      setRecipe(prev => ({ ...prev, cost: 0 }));
      return 0;
    }

    let totalMaterialsCost = 0;
    
    for (const material of materials) {
      console.log('\nProcesando material:', material);
      
      if (!material.materialId) {
        console.log('⚠️ Material sin ID');
        continue;
      }

      const materialInfo = getMaterialInfo(material.materialId);
      console.log('Info del material encontrada:', materialInfo);
      
      if (!materialInfo) {
        console.log('⚠️ No se encontró info del material');
        continue;
      }
      
      if (!material.quantity) {
        console.log('⚠️ Material sin cantidad');
        continue;
      }
      
      const materialCost = materialInfo.cost * material.quantity;
      console.log('Cálculo:', `${materialInfo.cost} × ${material.quantity} = ${materialCost}`);
      totalMaterialsCost += materialCost;
    }

    console.log('\nResumen de costos:');
    console.log('Costo total de materiales:', totalMaterialsCost);
    
    const wasteCost = totalMaterialsCost * 0.05;
    console.log('Costo por merma (5%):', wasteCost);
    
    const fixedCost = totalMaterialsCost * 0.10;
    console.log('Gastos fijos (10%):', fixedCost);
    
    const total = totalMaterialsCost + wasteCost + fixedCost;
    console.log('COSTO TOTAL FINAL:', total);

    // Calcular costo unitario
    const yield_amount = recipe.yield || 1;
    const unitCost = total / yield_amount;
    console.log('Rendimiento:', yield_amount);
    console.log('COSTO UNITARIO:', unitCost);
    console.log('====== FIN CÁLCULO DE COSTO TOTAL ======\n');

    setTotalCost(total);
    // Guardar el costo unitario en la receta
    setRecipe(prev => ({ ...prev, cost: unitCost, materials }));
    return total;
  };

  React.useEffect(() => {
    // Cargar unidades para tener sus nombres
    unitService.findAll().then(units => {
      const unitsMap = units.reduce((acc, unit) => {
        acc[unit.id] = unit.name;
        return acc;
      }, {} as Record<string, string>);
      setUnits(unitsMap);
    });
  }, []);

  React.useEffect(() => {
    if (id) {
      recipeService.findById(id).then(data => {
        if (data) {
          setRecipe(data);
          calculateTotalCost(data.materials || []);
        }
      });
    }
  }, [id]);

  React.useEffect(() => {
    // Cargar productos y recetas
    Promise.all([
      productService.findAll(),
      recipeService.findAll()
    ]).then(([products, recipes]) => {
      // Filtrar solo productos marcados como materiales
      const formattedProducts = products
        .filter(product => product.isMaterial)
        .map(product => {
          const unitName = product.materialUnitId && units[product.materialUnitId] ? units[product.materialUnitId] : '';
          return {
            id: product.id,
            name: product.name,
            materialType: 'Producto' as const,
            displayName: `P - ${product.name}`,
            unitName,
            cost: product.materialUnitCost || 0,
            originalData: product
          };
        });

      const formattedRecipes = recipes
        .filter(r => r.id !== id)
        .map(recipe => {
          const unitName = recipe.yieldUnitId && units[recipe.yieldUnitId] ? units[recipe.yieldUnitId] : '';
          return {
            id: recipe.id,
            name: recipe.name,
            materialType: 'Receta' as const,
            displayName: `R - ${recipe.name}`,
            unitName,
            cost: recipe.cost || 0,
            originalData: recipe
          };
        });
      setMaterials([...formattedProducts, ...formattedRecipes]);
      
      // Recalcular costos cuando se cargan los materiales
      if (recipe.materials) {
        calculateTotalCost(recipe.materials);
      }
    });
  }, [id, units]);

  // Efecto para recalcular costos cuando cambian los materiales disponibles o la receta
  React.useEffect(() => {
    if (recipe.materials && materials.length > 0) {
      calculateTotalCost(recipe.materials);
    }
  }, [materials, recipe.materials]);

  const getMaterialInfo = (materialId: string) => {
    return materials.find(m => m.id === materialId);
  };

  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'recipeType',
      label: 'Tipo',
      type: 'select' as const,
      required: true,
      options: [
        { value: RecipeType.SALE_RECIPE, label: 'Receta de Venta' },
        { value: RecipeType.INTERNAL_USE, label: 'Uso Interno' },
      ],
    },
    {
      name: 'yieldUnitId',
      label: 'Unidad de Rendimiento',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new UnitServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'yield',
      label: 'Rendimiento',
      type: 'number' as const,
      required: true,
      placeholder: 'Ej: 1.5',
      onChange: (value: any) => {
        if (value === '' || value === null || value === undefined) {
          return '';
        }
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0 ? numValue : '';
      },
    },
    {
      name: 'primaryWorkerId',
      label: 'Trabajador Principal',
      type: 'select' as const,
      required: true,
      relatedService: {
        service: new WorkerServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'notes',
      label: 'Notas',
      type: 'textarea' as const,
    },
    {
      name: 'materials',
      label: 'Materiales',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { 
            header: 'Material', 
            accessor: 'materialId', 
            render: (value: any, item: any) => {
              const material = getMaterialInfo(value);
              return material ? material.displayName : 'N/A';
            }
          },
          { 
            header: 'Cantidad', 
            accessor: 'quantity', 
            render: (value: any, item: any) => {
              const material = getMaterialInfo(item.materialId);
              return material && value ? `${value} ${material.unitName}` : value || '';
            }
          },
          { 
            header: 'Sub Total', 
            accessor: 'quantity', 
            render: (value: any, item: any) => {
              const material = getMaterialInfo(item.materialId);
              if (!material || !item.quantity) return '';
              
              const subTotal = material.cost * value;
              return subTotal.toLocaleString('es-UY', {
                style: 'currency',
                currency: 'UYU',
                currencyDisplay: 'symbol',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              });
            }
          }
        ],
        form: {
          fields: [
            {
              name: 'materialId',
              label: 'Material',
              type: 'select' as const,
              required: true,
              searchable: true,
              options: materials.map(material => ({
                value: material.id,
                label: `${material.displayName} (${material.cost.toLocaleString('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 })} por ${material.unitName})`,
                group: material.materialType === 'Producto' ? 'Productos' : 'Recetas'
              })),
              placeholder: 'Buscar material...',
              isSearchable: true,
              isClearable: true
            },
            {
              name: 'quantity',
              label: 'Cantidad',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 1.5',
              onChange: (value: any) => {
                if (value === '' || value === null || value === undefined) {
                  return '';
                }
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue < 0) {
                  return '';
                }
                return numValue;
              }
            }
          ],
          emptyState: {
            title: 'No hay materiales agregados',
            description: 'Haga clic en el botón "Agregar" para comenzar a agregar materiales a la receta.',
          },
          modalTitles: {
            add: 'Agregar Material',
            edit: 'Modificar Material',
          },
          addButtonText: 'Agregar Material',
          editButtonTooltip: 'Modificar este material',
          deleteButtonTooltip: 'Eliminar este material'
        },
      },
    },
  ];

  return (
    <div className="space-y-4">
      <GenericForm<Recipe>
        title={id ? 'Editar Receta' : 'Nueva Receta'}
        fields={fields}
        initialValues={{
          ...recipe,
          materials: recipe.materials || []
        }}
        service={recipeService}
        backPath="/recipes"
        onFieldChange={(fieldName, value) => {
          if (fieldName === 'materials') {
            calculateTotalCost(value || []);
          } else if (fieldName === 'yield') {
            // Recalcular costos cuando cambia el rendimiento
            calculateTotalCost(recipe.materials || []);
          }
          // Actualizar el estado de la receta
          setRecipe(prev => ({
            ...prev,
            [fieldName]: value
          }));
        }}
      >
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Desglose de Costos</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Costo de Materiales:</span>
              <span>{(totalCost * 0.87).toLocaleString('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo por Merma (5%):</span>
              <span>{(totalCost * 0.05).toLocaleString('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Gastos Fijos (10%):</span>
              <span>{(totalCost * 0.10).toLocaleString('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo Total:</span>
              <span>{totalCost.toLocaleString('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Costo Unitario:</span>
              <span>
                {(totalCost / (recipe.yield || 1)).toLocaleString('es-UY', { 
                  style: 'currency', 
                  currency: 'UYU', 
                  minimumFractionDigits: 0 
                })}
                {recipe.yieldUnitId && units[recipe.yieldUnitId] ? ` X ${units[recipe.yieldUnitId]}` : ''}
              </span>
            </div>
          </div>
        </div>
      </GenericForm>
    </div>
  );
} 