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
import { format } from 'date-fns';
import { QuantityInput } from '@/presentation/components/QuantityInput';
import { DatePicker } from '@/presentation/components/ui/date-picker';
import { OrderStatus, OrderStatusLabel } from '@/domain/enums/order-status.enum';

export const MobileProductionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(!id);
  const [workers, setWorkers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Array<{ id: string; symbol: string; name: string }>>([]);
  const [selectedRecipes, setSelectedRecipes] = React.useState<Set<string>>(new Set());
  const [filteredRecipes, setFilteredRecipes] = React.useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [formData, setFormData] = React.useState<Partial<ProductionOrder>>({
    orderDate: new Date(),
    status: OrderStatus.PENDIENTE,
    responsibleWorkerId: '',
    recipes: []
  });

  const filterRecipes = React.useCallback((term: string) => {
    if (!formData.responsibleWorkerId) {
      setFilteredRecipes([]);
      return;
    }

    const filtered = recipes
      .filter(recipe => 
        recipe.primaryWorkerId === formData.responsibleWorkerId && 
        recipe.name.toLowerCase().includes(term.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    setFilteredRecipes(filtered);
  }, [recipes, formData.responsibleWorkerId]);

  React.useEffect(() => {
    filterRecipes(searchTerm);
  }, [filterRecipes, searchTerm, formData.responsibleWorkerId]);

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
      setFilteredRecipes(recipesData);

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
        orderDate: formData.orderDate
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
    if (!recipeId) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      recipes: [
        ...(prev.recipes || []).filter(r => r.recipeId !== recipeId),
        ...(quantity > 0 ? [{ recipeId, quantity }] : [])
      ]
    }));
  };

  const toggleRecipe = (recipeId: string, initialQuantity: number = 1) => {
    setSelectedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId);
        handleRecipeChange(recipeId, 0);
      } else {
        newSet.add(recipeId);
        handleRecipeChange(recipeId, initialQuantity);
      }
      return newSet;
    });
  };

  const getDateValue = () => {
    try {
      return formData.orderDate ? format(formData.orderDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return format(new Date(), 'yyyy-MM-dd');
    }
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
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto">
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
                  <DatePicker
                    value={getDateValue()}
                    onChange={(value) => {
                      if (!value) return;
                      const date = new Date(value);
                      setFormData(prev => ({
                        ...prev,
                        orderDate: date
                      }));
                    }}
                    className="w-full"
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
                    disabled={!id}
                  >
                    {id ? (
                      Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>
                          {OrderStatusLabel[status]}
                        </option>
                      ))
                    ) : (
                      <option value={OrderStatus.PENDIENTE}>{OrderStatusLabel[OrderStatus.PENDIENTE]}</option>
                    )}
                  </select>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="bg-white rounded-lg shadow-sm border px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {selectedRecipes.size} recetas • {(formData.recipes || []).reduce((sum, r) => sum + r.quantity, 0)} items
              </span>
            </div>
            <span className="font-semibold text-blue-600">
              ${(formData.recipes || []).reduce((sum, r) => {
                const recipe = recipes.find(rec => rec.id === r.recipeId);
                return sum + ((recipe?.cost || 0) * r.quantity);
              }, 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {!formData.responsibleWorkerId ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Seleccione un trabajador para ver las recetas disponibles</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar recetas..."
                  className="w-full pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredRecipes.map(recipe => {
                  const isSelected = selectedRecipes.has(recipe.id);
                  const existingItem = formData.recipes?.find(r => r.recipeId === recipe.id);

                  return (
                    <div
                      key={recipe.id}
                      className={`w-full bg-white rounded-lg border shadow-sm cursor-pointer transition-all relative ${
                        isSelected ? 'border-primary ring-1 ring-primary' : 'hover:bg-gray-50/50'
                      }`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).tagName === 'INPUT') {
                          return;
                        }
                      }}
                      onDoubleClick={() => {
                        if (isSelected) {
                          handleRecipeChange(recipe.id, 0);
                          setSelectedRecipes(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(recipe.id);
                            return newSet;
                          });
                        } else {
                          toggleRecipe(recipe.id, 1);
                        }
                      }}
                    >
                      <div className="p-4">
                        <span className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-xs font-medium text-white rounded-bl-lg bg-blue-500">
                          R
                        </span>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                toggleRecipe(recipe.id, 1);
                              } else {
                                handleRecipeChange(recipe.id, 0);
                                setSelectedRecipes(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(recipe.id);
                                  return newSet;
                                });
                              }
                            }}
                            className="h-5 w-5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-base">{recipe.name}</span>
                            </div>
                          </div>
                        </div>
                        {existingItem && (
                          <div className="mt-3">
                            <div className="ml-8 space-y-2">
                              <QuantityInput
                                value={existingItem.quantity}
                                unit={units.find(u => u.id === recipe.yieldUnitId)}
                                onQuantityChange={(value) => {
                                  const updatedRecipes = [...(formData.recipes || [])];
                                  const index = updatedRecipes.findIndex(r => r.recipeId === recipe.id);
                                  if (index >= 0) {
                                    updatedRecipes[index].quantity = value;
                                    setFormData(prev => ({
                                      ...prev,
                                      recipes: updatedRecipes
                                    }));
                                  }
                                }}
                              />
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Costo unitario:</span>
                                <span className="font-medium">
                                  ${recipe.cost.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold text-blue-600">
                                  ${(recipe.cost * existingItem.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredRecipes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay recetas disponibles para este trabajador</p>
                </div>
              )}
            </>
          )}
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
              variant="secondary"
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