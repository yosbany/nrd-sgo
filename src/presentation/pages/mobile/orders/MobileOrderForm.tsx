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
import { DatePicker } from '@/presentation/components/ui/date-picker';

interface QuantityInputProps {
  value: number;
  unit: { id: string; symbol: string; name: string } | undefined;
  onQuantityChange: (value: number) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ value, unit, onQuantityChange, onClick }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return isEditing ? (
    <div className="flex items-center bg-transparent">
      <Input
        ref={inputRef}
        type="number"
        min="1"
        className="h-10 w-20 text-left pl-0 border-0 text-lg font-bold text-blue-600 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        defaultValue=""
        onBlur={(e) => {
          const newValue = Number(e.target.value);
          if (newValue > 0) {
            onQuantityChange(newValue);
          }
          setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape') {
            setIsEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
      />
      <span className="text-base font-semibold text-gray-800 italic">
        {unit?.name || unit?.symbol}
      </span>
    </div>
  ) : (
    <button
      type="button"
      className="flex items-center gap-2 text-left"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        onClick?.(e);
      }}
    >
      <span className="text-lg font-bold text-blue-600">
        {value}
      </span>
      <span className="text-base font-semibold text-gray-800 italic">
        {unit?.name || unit?.symbol}
      </span>
    </button>
  );
};

export const MobileOrderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(false);
  const [customers, setCustomers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Array<{ id: string; symbol: string; name: string }>>([]);
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
  const [filteredItems, setFilteredItems] = React.useState<Array<(Product | Recipe) & { type: 'product' | 'recipe' }>>([]);

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

      setFilteredItems([
        ...recipesData.map(item => ({ ...item, type: 'recipe' as const })),
        ...productsData.map(item => ({ ...item, type: 'product' as const }))
      ]);

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
      const products = formData.products || [];
      const recipes = formData.recipes || [];
      
      const totalItems = products.reduce((sum, p) => sum + p.quantity, 0) +
        recipes.reduce((sum, r) => sum + r.quantity, 0);
      
      const totalProducts = products.length + recipes.length;

      const orderToSave = {
        customerId: formData.customerId,
        orderDate: formData.orderDate instanceof Date 
          ? formData.orderDate 
          : new Date(formData.orderDate || new Date()),
        status: formData.status,
        products: products,
        recipes: recipes,
        totalItems,
        totalProducts
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

  const getDateValue = () => {
    if (formData.orderDate instanceof Date) {
      return format(formData.orderDate, 'yyyy-MM-dd');
    }
    const date = formData.orderDate 
      ? new Date(formData.orderDate) 
      : new Date();
    return !isNaN(date.getTime()) 
      ? format(date, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd');
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
                <span className="text-sm font-medium">INFORMACIÓN GENERAL</span>
                {!isGeneralOpen && (
                  <span className="text-xs text-gray-500">
                    {formData.customerId ? customers.find(c => c.id === formData.customerId)?.name : 'Sin asignar'} • {formData.orderDate ? format(new Date(formData.orderDate), 'dd/MM/yyyy') : ''}
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
                  <Label htmlFor="orderDate" className="text-sm text-gray-600">FECHA DEL PEDIDO</Label>
                  <DatePicker
                    label="FECHA DEL PEDIDO"
                    value={getDateValue()}
                    onChange={(value) => {
                      const date = value ? new Date(value) : null;
                      setFormData(prev => ({
                        ...prev,
                        orderDate: date || new Date()
                      }));
                    }}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerId" className="text-sm text-gray-600">CLIENTE</Label>
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
                  <Label htmlFor="status" className="text-sm text-gray-600">ESTADO</Label>
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

        <div className="bg-white rounded-lg shadow-sm border px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {formData.products?.length || 0} productos • {formData.recipes?.length || 0} recetas • {[
                  ...(formData.products || []).map(p => p.quantity),
                  ...(formData.recipes || []).map(r => r.quantity)
                ].reduce((sum, current) => sum + current, 0)} items
              </span>
            </div>
            <span className="font-semibold text-blue-600">
              ${[
                ...(formData.products || []).map(p => {
                  const product = products.find(prod => prod.id === p.productId);
                  return ((product?.purchasePrice || 0) * p.quantity);
                }),
                ...(formData.recipes || []).map(r => {
                  const recipe = recipes.find(rec => rec.id === r.recipeId);
                  return ((recipe?.cost || 0) * r.quantity);
                })
              ].reduce((sum, current) => sum + current, 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar productos o recetas..."
              className="w-full pl-9"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredProducts = products.filter(p => 
                  p.name.toLowerCase().includes(searchTerm)
                );
                const filteredRecipes = recipes.filter(r => 
                  r.name.toLowerCase().includes(searchTerm)
                );
                setFilteredItems([
                  ...filteredRecipes.map(item => ({ ...item, type: 'recipe' as const })),
                  ...filteredProducts.map(item => ({ ...item, type: 'product' as const }))
                ]);
              }}
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

          <div className="grid grid-cols-1 gap-2">
            {filteredItems.map(item => {
              const isRecipe = item.type === 'recipe';
              const existingItem = isRecipe 
                ? formData.recipes?.find(r => r.recipeId === item.id)
                : formData.products?.find(p => p.productId === item.id);

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`w-full bg-white rounded-lg border shadow-sm cursor-pointer transition-all relative ${
                    existingItem ? 'border-primary ring-1 ring-primary' : 'hover:bg-gray-50/50'
                  }`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).tagName === 'INPUT') {
                      return;
                    }
                  }}
                  onDoubleClick={() => {
                    if (existingItem) {
                      if (isRecipe) {
                        handleRemoveRecipe(
                          formData.recipes?.findIndex(r => r.recipeId === item.id) || 0
                        );
                      } else {
                        handleRemoveProduct(
                          formData.products?.findIndex(p => p.productId === item.id) || 0
                        );
                      }
                    } else {
                      if (isRecipe) {
                        setSelectedRecipe(item.id);
                        setRecipeQuantity(1);
                        handleAddRecipe();
                      } else {
                        setSelectedProduct(item.id);
                        setProductQuantity(1);
                        handleAddProduct();
                      }
                    }
                  }}
                >
                  <div className="p-4">
                    <span className={`absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-xs font-medium text-white rounded-bl-lg ${
                      isRecipe ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      {isRecipe ? 'R' : 'P'}
                    </span>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={existingItem !== undefined}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (isRecipe) {
                              setSelectedRecipe(item.id);
                              setRecipeQuantity(1);
                              handleAddRecipe();
                            } else {
                              setSelectedProduct(item.id);
                              setProductQuantity(1);
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
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (existingItem) {
                            if (isRecipe) {
                              handleRemoveRecipe(
                                formData.recipes?.findIndex(r => r.recipeId === item.id) || 0
                              );
                            } else {
                              handleRemoveProduct(
                                formData.products?.findIndex(p => p.productId === item.id) || 0
                              );
                            }
                          } else {
                            if (isRecipe) {
                              setSelectedRecipe(item.id);
                              setRecipeQuantity(1);
                              handleAddRecipe();
                            } else {
                              setSelectedProduct(item.id);
                              setProductQuantity(1);
                              handleAddProduct();
                            }
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base">{item.name}</span>
                        </div>
                      </div>
                    </div>
                    {existingItem && (
                      <div className="mt-3">
                        <div className="ml-8 space-y-2">
                          <QuantityInput
                            value={existingItem.quantity}
                            unit={isRecipe 
                              ? units.find(u => u.id === (item as Recipe).yieldUnitId)
                              : units.find(u => u.id === (item as Product).salesUnitId)}
                            onQuantityChange={(value) => {
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
                            }}
                          />
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Costo unitario:</span>
                            <span className="font-medium">
                              ${isRecipe 
                                ? (item as Recipe).cost.toFixed(2)
                                : ((item as Product).purchasePrice || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold text-blue-600">
                              ${isRecipe 
                                ? ((item as Recipe).cost * existingItem.quantity).toFixed(2)
                                : (((item as Product).purchasePrice || 0) * existingItem.quantity).toFixed(2)}
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