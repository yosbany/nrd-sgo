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
import { CustomerOrder } from '@/domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '@/domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '@/domain/services/customer.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { ChevronDown, ChevronUp} from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus } from '@/domain/models/base.entity';
import { format } from 'date-fns';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';
import { UnitServiceImpl } from '@/domain/services/unit.service.impl';

export const MobileOrderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Array<{ id: string; symbol: string }>>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = React.useState<string>('');
  const [productQuantity, setProductQuantity] = React.useState<number>(1);
  const [recipeQuantity, setRecipeQuantity] = React.useState<number>(1);
  const [formData, setFormData] = React.useState<Partial<CustomerOrder>>({
    orderDate: new Date(),
    status: OrderStatus.PENDING,
    customerId: '',
    products: [],
    recipes: []
  });

  React.useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [customersData, productsData, recipesData, unitsData] = await Promise.all([
        new CustomerServiceImpl().findAll(),
        new ProductServiceImpl().findAll(),
        new RecipeServiceImpl().findAll(),
        new UnitServiceImpl().findAll()
      ]);
      
      setCustomers(customersData);
      setProducts(productsData);
      setRecipes(recipesData);
      setUnits(unitsData);

      if (id) {
        const orderService = new CustomerOrderServiceImpl();
        const orderData = await orderService.findById(id);
        if (orderData) {
          setFormData({
            ...orderData,
            orderDate: orderData.orderDate instanceof Date 
              ? orderData.orderDate 
              : new Date(orderData.orderDate)
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error('Debe seleccionar un producto');
      return;
    }

    if (productQuantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const existingProductIndex = formData.products?.findIndex(
      p => p.productId === selectedProduct
    );

    if (existingProductIndex !== undefined && existingProductIndex >= 0) {
      const updatedProducts = [...(formData.products || [])];
      updatedProducts[existingProductIndex].quantity += productQuantity;
      
      setFormData(prev => ({
        ...prev,
        products: updatedProducts
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        products: [
          ...(prev.products || []),
          { productId: selectedProduct, quantity: productQuantity }
        ]
      }));
    }

    setSelectedProduct('');
    setProductQuantity(1);
  };

  const handleAddRecipe = () => {
    if (!selectedRecipe) {
      toast.error('Debe seleccionar una receta');
      return;
    }

    if (recipeQuantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const existingRecipeIndex = formData.recipes?.findIndex(
      r => r.recipeId === selectedRecipe
    );

    if (existingRecipeIndex !== undefined && existingRecipeIndex >= 0) {
      const updatedRecipes = [...(formData.recipes || [])];
      updatedRecipes[existingRecipeIndex].quantity += recipeQuantity;
      
      setFormData(prev => ({
        ...prev,
        recipes: updatedRecipes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recipes: [
          ...(prev.recipes || []),
          { recipeId: selectedRecipe, quantity: recipeQuantity }
        ]
      }));
    }

    setSelectedRecipe('');
    setRecipeQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products?.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveRecipe = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipes: prev.recipes?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast.error('Debe seleccionar un cliente');
      return;
    }

    if (!formData.products?.length && !formData.recipes?.length) {
      toast.error('Debe agregar al menos un producto o receta');
      return;
    }

    setIsSaving(true);

    try {
      const orderService = new CustomerOrderServiceImpl();
      const orderToSave = {
        ...formData,
        orderDate: formData.orderDate instanceof Date 
          ? formData.orderDate 
          : new Date(formData.orderDate || new Date())
      };

      if (id) {
        await orderService.update(id, orderToSave as CustomerOrder);
        toast.success('Pedido actualizado correctamente');
      } else {
        await orderService.create(orderToSave as CustomerOrder);
        toast.success('Pedido creado correctamente');
      }
      navigate('/mobile/orders');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error al guardar el pedido');
    } finally {
      setIsSaving(false);
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
                    {formData.customerId ? customers.find(c => c.id === formData.customerId)?.name : 'Sin asignar'}
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
                  <Label htmlFor="orderDate" className="text-sm text-gray-600">Fecha del Pedido</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    className="h-10"
                    value={(() => {
                      try {
                        if (formData.orderDate instanceof Date) {
                          return format(formData.orderDate, 'yyyy-MM-dd');
                        }
                        const date = formData.orderDate 
                          ? new Date(formData.orderDate) 
                          : new Date();
                        return !isNaN(date.getTime()) 
                          ? format(date, 'yyyy-MM-dd')
                          : format(new Date(), 'yyyy-MM-dd');
                      } catch (error) {
                        console.error('Error formatting date:', error);
                        return format(new Date(), 'yyyy-MM-dd');
                      }
                    })()}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      orderDate: new Date(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerId" className="text-sm text-gray-600">Cliente</Label>
                  <select
                    id="customerId"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.customerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  >
                    <option value="">Seleccionar cliente</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
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
                    <option value={OrderStatus.PENDING}>Pendiente</option>
                    <option value={OrderStatus.COMPLETED}>Completado</option>
                  </select>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Productos y Recetas</h2>
            <span className="text-sm text-gray-500">
              {(formData.products?.length || 0) + (formData.recipes?.length || 0)} items
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              ...recipes.map(item => ({ ...item, type: 'recipe' as const })),
              ...products.map(item => ({ ...item, type: 'product' as const }))
            ].map(item => {
              const isRecipe = item.type === 'recipe';
              const existingItem = isRecipe 
                ? formData.recipes?.find(r => r.recipeId === item.id)
                : formData.products?.find(p => p.productId === item.id);

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={existingItem !== undefined}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (isRecipe) {
                            setSelectedRecipe(item.id);
                            handleAddRecipe();
                          } else {
                            setSelectedProduct(item.id);
                            handleAddProduct();
                          }
                        } else {
                          if (isRecipe) {
                            handleRemoveRecipe(
                              formData.recipes?.findIndex(r => r.recipeId === item.id) || 0
                            );
                          } else {
                            handleRemoveProduct(
                              formData.products?.findIndex(p => p.productId === item.id) || 0
                            );
                          }
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isRecipe ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                        }`}>
                          {isRecipe ? 'Receta' : 'Producto'}
                        </span>
                      </div>
                    </div>
                    {existingItem && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          className="h-8 w-20 text-center"
                          value={existingItem.quantity}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (value > 0) {
                              if (isRecipe) {
                                const updatedRecipes = [...(formData.recipes || [])];
                                const index = updatedRecipes.findIndex(r => r.recipeId === item.id);
                                if (index >= 0) {
                                  updatedRecipes[index].quantity = value;
                                  setFormData(prev => ({
                                    ...prev,
                                    recipes: updatedRecipes
                                  }));
                                }
                              } else {
                                const updatedProducts = [...(formData.products || [])];
                                const index = updatedProducts.findIndex(p => p.productId === item.id);
                                if (index >= 0) {
                                  updatedProducts[index].quantity = value;
                                  setFormData(prev => ({
                                    ...prev,
                                    products: updatedProducts
                                  }));
                                }
                              }
                            }
                          }}
                        />
                        <span className="text-sm text-gray-500">
                          {isRecipe 
                            ? units.find(u => u.id === (item as Recipe).yieldUnitId)?.symbol
                            : units.find(u => u.id === (item as Product).salesUnitId)?.symbol}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {recipes.length === 0 && products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay items disponibles</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="flex flex-col gap-2 max-w-lg mx-auto">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="h-11"
            >
              {isSaving ? 'Guardando...' : id ? 'Guardar Cambios' : 'Crear Pedido'}
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