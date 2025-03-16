import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Recipe } from '../../../domain/models/recipe.model';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { WorkerServiceImpl } from '../../../domain/services/worker.service.impl';
import { UnitServiceImpl } from '@/domain/services/unit.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { Product } from '@/domain/models/product.model';
import { getOptions, RecipeType } from '@/domain/enums/recipe-type.enum';
import { TypeInventory } from '@/domain/enums/type-inventory.enum';
import { getStatusOptions } from '@/domain/enums/entity-status.enum';


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
  const recipeService = React.useMemo(() => new RecipeServiceImpl(), []);
  const productService = React.useMemo(() => new ProductServiceImpl(), []);
  const unitService = React.useMemo(() => new UnitServiceImpl(), []);

  
  React.useEffect(() => {
    // Cargar unidades para tener sus nombres
    unitService.findAll().then(units => {
      const unitsMap = units.reduce((acc, unit) => {
        acc[unit.id!] = unit.name;
        return acc;
      }, {} as Record<string, string>);
      setUnits(unitsMap);
    });
  }, [unitService]);

  React.useEffect(() => {
    if (id) {
      recipeService.findById(id).then(data => {
        if (data) {
          setRecipe(data);
        }
      });
    }
  }, [id, recipeService]);

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
            id: product.id!,
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
            id: recipe.id!,
            name: recipe.name,
            materialType: 'Receta' as const,
            displayName: `R - ${recipe.name}`,
            unitName,
            cost: recipe.unitCost || 0,
            originalData: recipe
          };
        });
      setMaterials([...formattedProducts, ...formattedRecipes]);
     
    });
  }, [id, units, productService, recipeService]);

 
  const getMaterialInfo = (materialId: string) => {
    return materials.find(m => m.id === materialId);
  };

  const sections = [
    {
      title: 'Información General',
      fields: [
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
          options: getOptions()
        },
        {
          name: 'status',
          label: 'Estado',
          type: 'select' as const,
          required: true,
          options: getStatusOptions()
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
          onChange: (value: unknown) => {
            if (value === '' || value === null || value === undefined) {
              return;
            }
            const numValue = parseFloat(value.toString());
            if (isNaN(numValue) || numValue < 0) {
              return;
            }
            return { yield: numValue };
          },
        },
        {
          name: 'desiredProduction',
          label: 'Producción Deseada',
          type: 'number' as const,
          required: true,
          placeholder: 'Ej: 10',
          onChange: (value: unknown) => {
            if (value === '' || value === null || value === undefined) {
              return;
            }
            const numValue = parseFloat(value.toString());
            if (isNaN(numValue) || numValue < 0) {
              return;
            }
            return { desiredProduction: numValue };
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
      ]
    },
    {
      title: 'Información de Venta',
      visible: (values: Partial<Recipe>): boolean => values.recipeType === RecipeType.RECETA_VENTA,
      fields: [
        {
          name: 'nameSale',
          label: 'Nombre de Venta',
          type: 'text' as const,
          placeholder: 'Nombre para mostrar en ventas',
        },
        {
          name: 'sku',
          label: 'SKU',
          type: 'text' as const,
          required: true,
        },
        {
          name: 'salePrice',
          label: 'Precio de Venta',
          type: 'number' as const,
          required: true,
          placeholder: 'Ej: 1500',
          onChange: (value: unknown) => {
            if (value === '' || value === null || value === undefined) {
              return;
            }
            const numValue = parseFloat(value.toString());
            if (isNaN(numValue) || numValue < 0) {
              return;
            }
            return { salePrice: numValue };
          },
        },
      ]
    },
    {
      title: 'Detalles',
      fields: [
        {
          name: 'materials',
          label: 'Materiales',
          type: 'array' as const,
          arrayConfig: {
            columns: [
              { 
                header: 'Material', 
                accessor: 'materialId', 
                render: (value: unknown) => {
                  const material = getMaterialInfo(value as string);
                  return material ? material.displayName : 'N/A';
                }
              },
              { 
                header: 'Cantidad', 
                accessor: 'quantity', 
                render: (value: unknown, item: Record<string, unknown>): React.ReactNode => {
                  const material = getMaterialInfo(item.materialId as string);
                  return material && value ? `${value} ${material.unitName}` : String(value || '');
                }
              },
              { 
                header: 'Sub Total', 
                accessor: 'quantity', 
                render: (value: unknown, item: Record<string, unknown>): React.ReactNode => {
                  const material = getMaterialInfo(item.materialId as string);
                  if (!material || !item.quantity) return '';
                  
                  const subTotal = material.cost * (value as number);
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
                  isClearable: true,
                  onChange: (value: unknown) => {
                    const material = getMaterialInfo(value as string);
                    if (!material) return;
                    return {
                      materialId: value,
                      typeMaterial: material.materialType === 'Producto' ? TypeInventory.PRODUCTO : TypeInventory.RECETA
                    };
                  }
                },
                {
                  name: 'quantity',
                  label: 'Cantidad',
                  type: 'number' as const,
                  required: true,
                  placeholder: 'Ej: 1.5',
                  onChange: (value: unknown) => {
                    if (value === '' || value === null || value === undefined) {
                      return;
                    }
                    const numValue = parseFloat(value.toString());
                    if (isNaN(numValue) || numValue < 0) {
                      return;
                    }
                    return { quantity: numValue };
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
        {
          name: 'notes',
          label: 'Notas',
          type: 'textarea' as const,
        },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <GenericForm<Recipe>
        title={id ? 'Editar Receta' : 'Nueva Receta'}
        sections={sections}
        initialValues={{
          ...recipe,
          materials: recipe.materials || []
        }}
        service={recipeService}
        backPath="/recipes"
        onFieldChange={(fieldName, value) => {
          setRecipe(prev => ({
            ...prev,
            [fieldName]: value
          }));
        }}
      >
      </GenericForm>
    </div>
  );
} 