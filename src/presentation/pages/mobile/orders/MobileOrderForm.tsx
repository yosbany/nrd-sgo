import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/presentation/components/ui/collapsible";
import { CustomerOrder, ItemOrder } from '@/domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '@/domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '@/domain/services/customer.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { ChevronDown, ChevronUp} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';
import { UnitServiceImpl } from '@/domain/services/unit.service.impl';
import { DatePicker } from '@/presentation/components/ui/date-picker';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { SupplierServiceImpl } from '@/domain/services/supplier.service.impl';
import { TypeInventory } from '@/domain/enums/type-inventory.enum';
import { Customer } from '@/domain/models/customer.model';
import { Unit } from '@/domain/models/unit.model';

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
  const [searchParams] = useSearchParams();
  const copyFromId = searchParams.get('copy');
  const calculateFromSupplierId = searchParams.get('calculate');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(!id);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = React.useState<string>('');
  const [productQuantity, setProductQuantity] = React.useState<number>(1);
  const [recipeQuantity, setRecipeQuantity] = React.useState<number>(1);
  const [formData, setFormData] = React.useState<Partial<CustomerOrder>>({
    orderDate: new Date(),
    customerId: '',
    items: [],
    totalItems: 0,
    totalProducts: 0,
    status: OrderStatus.PENDIENTE
  });
  const [filteredItems, setFilteredItems] = React.useState<Array<(Product | Recipe) & { type: 'product' | 'recipe' }>>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filterAndSortItems = React.useCallback((term: string) => {
    if (!formData.customerId) {
      setFilteredItems([]);
      return;
    }

    // Primero las recetas, luego los productos
    const filteredRecipes = recipes
      .filter(recipe => recipe.name.toLowerCase().includes(term.toLowerCase()))
      .map(item => ({ ...item, type: 'recipe' as const }));

    const filteredProducts = products
      .filter(product => product.name.toLowerCase().includes(term.toLowerCase()))
      .map(item => ({ ...item, type: 'product' as const }));

    // TODO: Ordenar basado en el historial del cliente
    // Por ahora solo separamos recetas y productos
    setFilteredItems([
      ...filteredRecipes,
      ...filteredProducts
    ]);
  }, [recipes, products, formData.customerId]);

  React.useEffect(() => {
    filterAndSortItems(searchTerm);
  }, [filterAndSortItems, searchTerm, formData.customerId]);

  const loadInitialData = React.useCallback(async () => {
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
        // Cargar orden existente
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
      } else if (copyFromId) {
        // Copiar orden existente
        const orderService = new CustomerOrderServiceImpl();
        const orderData = await orderService.findById(copyFromId);
        if (orderData) {
          setFormData({
            ...orderData,
            id: undefined, // Eliminar el ID para que se cree una nueva orden
            orderDate: new Date(), // Actualizar la fecha
            status: OrderStatus.PENDIENTE, // Restablecer el estado
            items: [],
            totalItems: 0,
            totalProducts: 0
          });
        }
      } else if (calculateFromSupplierId) {
        // Crear orden calculada basada en el proveedor
        const supplierService = new SupplierServiceImpl();
        const supplier = await supplierService.findById(calculateFromSupplierId);
        if (supplier) {
          // Filtrar productos por proveedor principal
          const supplierProducts = products.filter(
            product => product.primarySupplierId === calculateFromSupplierId
          );
          
          // Crear orden con productos del proveedor
          setFormData({
            orderDate: new Date(),
            status: OrderStatus.PENDIENTE,
            items: supplierProducts
              .filter(product => product.id)
              .map(product => ({
                itemId: product.id!,
                quantity: 0,
                typeItem: TypeInventory.PRODUCTO
              })),
            totalItems: 0,
            totalProducts: supplierProducts.length
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [id, copyFromId, calculateFromSupplierId]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleAddProduct = () => {
    if (!selectedProduct) {
      return;
    }

    if (productQuantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const newItem: ItemOrder = {
      itemId: selectedProduct,
      quantity: productQuantity,
      typeItem: TypeInventory.PRODUCTO
    };

    const existingItemIndex = formData.items?.findIndex(
      i => i.itemId === selectedProduct && i.typeItem === TypeInventory.PRODUCTO
    ) ?? -1;

    if (existingItemIndex >= 0) {
      const updatedItems = [...(formData.items || [])];
      updatedItems[existingItemIndex].quantity += productQuantity;
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [
          ...(prev.items || []),
          newItem
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

    const newItem: ItemOrder = {
      itemId: selectedRecipe,
      quantity: recipeQuantity,
      typeItem: TypeInventory.RECETA
    };

    const existingItemIndex = formData.items?.findIndex(
      i => i.itemId === selectedRecipe && i.typeItem === TypeInventory.RECETA
    ) ?? -1;

    if (existingItemIndex >= 0) {
      const updatedItems = [...(formData.items || [])];
      updatedItems[existingItemIndex].quantity += recipeQuantity;
      
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [
          ...(prev.items || []),
          newItem
        ]
      }));
    }

    setSelectedRecipe('');
    setRecipeQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveRecipe = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast.error('Debe seleccionar un cliente');
      return;
    }

    if (!formData.items?.length) {
      toast.error('Debe agregar al menos un producto o receta');
      return;
    }

    setIsSaving(true);

    try {
      const orderService = new CustomerOrderServiceImpl();
      const items = formData.items || [];
      
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalProducts = items.length;

      const orderToSave = {
        customerId: formData.customerId,
        orderDate: formData.orderDate instanceof Date 
          ? formData.orderDate 
          : new Date(formData.orderDate || new Date()),
        status: formData.status,
        items: items,
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
    try {
      if (!formData.orderDate) return format(new Date(), 'yyyy-MM-dd');
      
      const date = formData.orderDate instanceof Date 
        ? formData.orderDate 
        : new Date(formData.orderDate);
      
      return isNaN(date.getTime()) 
        ? format(new Date(), 'yyyy-MM-dd')
        : format(date, 'yyyy-MM-dd');
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
                <span className="text-sm font-bold uppercase">INFORMACIÓN GENERAL</span>
                {!isGeneralOpen && (
                  <span className="text-xs text-gray-500">
                    {formData.customerId ? customers.find(c => c.id === formData.customerId)?.name : 'Sin asignar'} • {formData.orderDate ? (() => {
                      try {
                        const date = formData.orderDate instanceof Date ? formData.orderDate : new Date(formData.orderDate);
                        return isNaN(date.getTime()) ? '' : format(date, 'dd/MM/yyyy');
                      } catch (error) {
                        console.error('Error formatting date:', error);
                        return '';
                      }
                    })() : ''}
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
                    <option value={OrderStatus.PENDIENTE}>Pendiente</option>
                    <option value={OrderStatus.ENVIADA}>Enviada</option>
                    <option value={OrderStatus.COMPLETADA}>Completada</option>
                    <option value={OrderStatus.CANCELADA}>Cancelada</option>
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
                {formData.items?.length || 0} productos • {formData.items?.filter(i => i.typeItem === TypeInventory.RECETA).length || 0} recetas • {formData.totalItems} items
              </span>
            </div>
            <span className="font-semibold text-blue-600">
              ${formData.items?.reduce((sum, item) => {
                if (item.typeItem === TypeInventory.RECETA) {
                  const recipe = recipes.find(r => r.id === item.itemId);
                  return sum + (item.quantity * (recipe?.unitCost ?? 0));
                } else {
                  const product = products.find(p => p.id === item.itemId);
                  return sum + (item.quantity * (product?.purchasePrice ?? 0));
                }
              }, 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {!formData.customerId ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Seleccione un cliente para ver los productos y recetas disponibles</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar productos o recetas..."
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

              <div className="grid grid-cols-1 gap-2">
                {filteredItems.map(item => {
                  const isRecipe = item.type === 'recipe';
                  const existingItem = item.type === 'recipe'
                    ? formData.items?.find(i => i.itemId === item.id && i.typeItem === TypeInventory.RECETA)
                    : formData.items?.find(i => i.itemId === item.id && i.typeItem === TypeInventory.PRODUCTO);

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
                              formData.items?.findIndex(i => i.itemId === item.id && i.typeItem === TypeInventory.RECETA) || 0
                            );
                          } else {
                            handleRemoveProduct(
                              formData.items?.findIndex(i => i.itemId === item.id && i.typeItem === TypeInventory.PRODUCTO) || 0
                            );
                          }
                        } else {
                          if (isRecipe) {
                            if (item.id) {
                              setSelectedRecipe(item.id);
                              setRecipeQuantity(1);
                              handleAddRecipe();
                            }
                          } else {
                            if (item.id) {
                              setSelectedProduct(item.id);
                              setProductQuantity(1);
                              handleAddProduct();
                            }
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
                                  if (item.id) {
                                    setSelectedRecipe(item.id);
                                    setRecipeQuantity(1);
                                    handleAddRecipe();
                                  }
                                } else {
                                  if (item.id) {
                                    setSelectedProduct(item.id);
                                    setProductQuantity(1);
                                    handleAddProduct();
                                  }
                                }
                              } else {
                                if (isRecipe) {
                                  handleRemoveRecipe(
                                    formData.items?.findIndex(i => i.itemId === item.id && i.typeItem === TypeInventory.RECETA) || 0
                                  );
                                } else {
                                  handleRemoveProduct(
                                    formData.items?.findIndex(i => i.itemId === item.id && i.typeItem === TypeInventory.PRODUCTO) || 0
                                  );
                                }
                              }
                            }}
                            className="h-5 w-5"
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
                                unit={(() => {
                                  const unit = isRecipe 
                                    ? units.find(u => u.id === (item as Recipe).yieldUnitId)
                                    : units.find(u => u.id === (item as Product).salesUnitId);
                                  return unit && {
                                    id: String(unit.id),
                                    symbol: String(unit.symbol),
                                    name: String(unit.name)
                                  };
                                })()}
                                onQuantityChange={(value) => {
                                  if (isRecipe) {
                                    const updatedItems = [...(formData.items || [])];
                                    const index = updatedItems.findIndex(i => i.itemId === item.id && i.typeItem === TypeInventory.RECETA);
                                    if (index >= 0) {
                                      updatedItems[index].quantity = value;
                                      setFormData(prev => ({
                                        ...prev,
                                        items: updatedItems
                                      }));
                                    }
                                  } else {
                                    const updatedItems = [...(formData.items || [])];
                                    const index = updatedItems.findIndex(i => i.itemId === item.id && i.typeItem === TypeInventory.PRODUCTO);
                                    if (index >= 0) {
                                      updatedItems[index].quantity = value;
                                      setFormData(prev => ({
                                        ...prev,
                                        items: updatedItems
                                      }));
                                    }
                                  }
                                }}
                              />
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Costo unitario:</span>
                                <span className="font-medium">
                                  ${isRecipe 
                                    ? Number((item as Recipe).unitCost || 0).toFixed(2)
                                    : Number((item as Product).purchasePrice || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold text-blue-600">
                                  ${isRecipe 
                                    ? Number(((item as Recipe).unitCost || 0) * existingItem.quantity).toFixed(2)
                                    : Number(((item as Product).purchasePrice || 0) * existingItem.quantity).toFixed(2)}
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

              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay items disponibles que coincidan con la búsqueda</p>
                </div>
              )}
            </>
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