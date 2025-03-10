import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/presentation/components/ui/collapsible";
import { ProductionOrder } from '@/domain/models/production-order.model';
import { Recipe } from '@/domain/models/recipe.model';
import { ProductionOrderServiceImpl } from '@/domain/services/production-order.service.impl';
import { WorkerServiceImpl } from '@/domain/services/worker.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { UnitServiceImpl } from '@/domain/services/unit.service.impl';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus } from '@/domain/models/base.entity';
import { format } from 'date-fns';

export const MobileProductionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(false);
  const [workers, setWorkers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Array<{ id: string; symbol: string }>>([]);
  const [selectedRecipes, setSelectedRecipes] = React.useState<Set<string>>(new Set());
  const [formData, setFormData] = React.useState<Partial<ProductionOrder>>({
    orderDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    })(),
    status: OrderStatus.PENDING,
    responsibleWorkerId: '',
    recipes: []
  });

  React.useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [workersData, recipesData, unitsData] = await Promise.all([
        new WorkerServiceImpl().findAll(),
        new RecipeServiceImpl().findAll(),
        new UnitServiceImpl().findAll()
      ]);

      setWorkers(workersData);
      setRecipes(recipesData);
      setUnits(unitsData);

      if (id) {
        const orderService = new ProductionOrderServiceImpl();
        const orderData = await orderService.findById(id);
        if (orderData) {
          setFormData({
            ...orderData,
            orderDate: orderData.orderDate instanceof Date 
              ? orderData.orderDate 
              : new Date(orderData.orderDate)
          });
          const selectedIds = new Set(orderData.recipes?.map(r => r.recipeId));
          setSelectedRecipes(selectedIds);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRecipes.size === 0) {
      toast.error('Debe seleccionar al menos una receta');
      return;
    }

    setIsSaving(true);

    try {
      const orderService = new ProductionOrderServiceImpl();
      const orderToSave = {
        ...formData,
        orderDate: formData.orderDate instanceof Date 
          ? formData.orderDate 
          : new Date(formData.orderDate || new Date())
      };

      if (id) {
        await orderService.update(id, orderToSave);
        toast.success('Orden actualizada correctamente');
      } else {
        await orderService.create(orderToSave);
        toast.success('Orden creada correctamente');
      }
      navigate('/mobile/production');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error al guardar la orden');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecipeChange = (recipeId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      recipes: [
        ...(prev.recipes || []).filter(r => r.recipeId !== recipeId),
        ...(quantity > 0 ? [{ recipeId, quantity }] : [])
      ]
    }));
  };

  const toggleRecipe = (recipeId: string) => {
    setSelectedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
        handleRecipeChange(recipeId, 0);
      } else {
        newSet.add(recipeId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto">
        <Collapsible open={isGeneralOpen} onOpenChange={setIsGeneralOpen}>
          <div className="bg-white rounded-lg shadow-sm border">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => setIsGeneralOpen(!isGeneralOpen)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Información General</span>
                {!isGeneralOpen && (
                  <span className="text-xs text-gray-500">
                    {formData.responsibleWorkerId ? workers.find(w => w.id === formData.responsibleWorkerId)?.name : 'Sin asignar'}
                  </span>
                )}
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isGeneralOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="p-4 space-y-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="orderDate" className="text-sm text-gray-600">Fecha de Orden</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    className="h-10"
                    value={formData.orderDate instanceof Date 
                      ? format(formData.orderDate, 'yyyy-MM-dd')
                      : format(new Date(formData.orderDate || new Date()), 'yyyy-MM-dd')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      orderDate: new Date(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibleWorkerId" className="text-sm text-gray-600">Responsable</Label>
                  <select
                    id="responsibleWorkerId"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.responsibleWorkerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibleWorkerId: e.target.value }))}
                  >
                    <option value="">Seleccionar responsable</option>
                    {workers.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm text-gray-600">Estado</Label>
                  <select
                    id="status"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as OrderStatus }))}
                  >
                    <option value="">Seleccionar estado</option>
                    {Object.values(OrderStatus).map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recetas</h2>
            <span className="text-sm text-gray-500">
              {selectedRecipes.size} seleccionadas
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {recipes.map(recipe => {
              const isSelected = selectedRecipes.has(recipe.id);
              const quantity = formData.recipes?.find(r => r.recipeId === recipe.id)?.quantity || '';

              return (
                <div
                  key={recipe.id}
                  className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${
                    isSelected ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRecipe(recipe.id)}
                    />
                    <div 
                      className="flex-1 font-medium text-sm cursor-pointer"
                      onClick={() => toggleRecipe(recipe.id)}
                    >
                      {recipe.name}
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          className="w-20 h-9 text-sm text-center"
                          placeholder="Cant."
                          value={quantity}
                          onChange={(e) => handleRecipeChange(recipe.id, parseInt(e.target.value) || 0)}
                        />
                        <span className="text-sm text-gray-500">
                          {units.find(u => u.id === recipe.yieldUnitId)?.symbol}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex flex-col gap-2 max-w-lg mx-auto">
            <Button 
              type="submit" 
              disabled={isSaving || selectedRecipes.size === 0}
              className="h-11"
            >
              {isSaving ? 'Guardando...' : id ? 'Guardar Cambios' : 'Crear Orden'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSaving}
              className="h-11"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}; 