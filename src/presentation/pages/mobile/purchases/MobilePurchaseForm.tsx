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
import { PurchaseOrder } from '@/domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '@/domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '@/domain/services/supplier.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus } from '@/domain/models/base.entity';
import { format } from 'date-fns';
import { Supplier } from '@/domain/models/supplier.model';
import { Product } from '@/domain/models/product.model';
import { UnitServiceImpl } from '@/domain/services/unit.service.impl';
import { QuantityInput } from '@/presentation/components/QuantityInput';
import { DatePicker } from '@/presentation/components/ui/date-picker';

export const MobilePurchaseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState<Array<{ id: string; commercialName: string }>>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [units, setUnits] = React.useState<Array<{ id: string; symbol: string; name: string }>>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<number>(1);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [formData, setFormData] = React.useState<Partial<PurchaseOrder>>({
    orderDate: new Date(),
    status: OrderStatus.PENDING,
    supplierId: '',
    products: []
  });

  React.useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [suppliersData, productsData, unitsData] = await Promise.all([
        new SupplierServiceImpl().findAll(),
        new ProductServiceImpl().findAll(),
        new UnitServiceImpl().findAll()
      ]);
      
      setSuppliers(suppliersData.map(supplier => ({
        id: supplier.id,
        commercialName: supplier.commercialName
      })));
      setProducts(productsData);
      setUnits(unitsData);
      setFilteredProducts(productsData);

      if (id) {
        const orderService = new PurchaseOrderServiceImpl();
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

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const existingProductIndex = formData.products?.findIndex(
      p => p.productId === selectedProduct
    );

    if (existingProductIndex !== undefined && existingProductIndex >= 0) {
      const updatedProducts = [...(formData.products || [])];
      updatedProducts[existingProductIndex].quantity += quantity;
      
      setFormData(prev => ({
        ...prev,
        products: updatedProducts
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        products: [
          ...(prev.products || []),
          { productId: selectedProduct, quantity }
        ]
      }));
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplierId) {
      toast.error('Debe seleccionar un proveedor');
      return;
    }

    if (!formData.products?.length) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    setIsSaving(true);

    try {
      const orderService = new PurchaseOrderServiceImpl();
      const orderToSave = {
        ...formData,
        orderDate: formData.orderDate instanceof Date 
          ? formData.orderDate 
          : new Date(formData.orderDate || new Date())
      };

      if (id) {
        await orderService.update(id, orderToSave as PurchaseOrder);
        toast.success('Orden actualizada correctamente');
      } else {
        await orderService.create(orderToSave as PurchaseOrder);
        toast.success('Orden creada correctamente');
      }
      navigate('/mobile/purchases');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error al guardar la orden');
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
                    {formData.supplierId ? suppliers.find(s => s.id === formData.supplierId)?.commercialName : 'Sin asignar'}
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
                    label="FECHA DE COMPRA"
                    value={(() => {
                      if (formData.orderDate instanceof Date) {
                        return format(formData.orderDate, 'yyyy-MM-dd');
                      }
                      return formData.orderDate
                        ? format(formData.orderDate, 'yyyy-MM-dd')
                        : format(new Date(formData.orderDate || new Date()), 'yyyy-MM-dd');
                    })()}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      orderDate: e.target.value ? new Date(e.target.value) : new Date()
                    }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplierId" className="text-sm text-gray-600">Proveedor</Label>
                  <select
                    id="supplierId"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.commercialName}
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

        <div className="bg-white rounded-lg shadow-sm border px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {formData.products?.length || 0} productos • {(formData.products || []).reduce((sum, p) => sum + p.quantity, 0)} items
              </span>
            </div>
            <span className="font-semibold text-blue-600">
              ${(formData.products || []).reduce((sum, p) => {
                const product = products.find(prod => prod.id === p.productId);
                return sum + ((product?.purchasePrice || 0) * p.quantity);
              }, 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="w-full pl-9"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                setFilteredProducts(
                  products.filter(p => p.name.toLowerCase().includes(searchTerm))
                );
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
            {filteredProducts.map(item => {
              const existingItem = formData.products?.find(p => p.productId === item.id);

              return (
                <div
                  key={item.id}
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
                      handleRemoveProduct(
                        formData.products?.findIndex(p => p.productId === item.id) || 0
                      );
                    } else {
                      setSelectedProduct(item.id);
                      setQuantity(1);
                      handleAddProduct();
                    }
                  }}
                >
                  <div className="p-4">
                    <span className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-xs font-medium text-white rounded-bl-lg bg-purple-500">
                      P
                    </span>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={existingItem !== undefined}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProduct(item.id);
                            setQuantity(1);
                            handleAddProduct();
                          } else {
                            handleRemoveProduct(
                              formData.products?.findIndex(p => p.productId === item.id) || 0
                            );
                          }
                        }}
                        className="h-5 w-5"
                        onClick={(e) => e.stopPropagation()}
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
                            unit={units.find(u => u.id === item.purchaseUnitId)}
                            onQuantityChange={(value) => {
                              const updatedProducts = [...(formData.products || [])];
                              const index = updatedProducts.findIndex(p => p.productId === item.id);
                              if (index >= 0) {
                                updatedProducts[index].quantity = value;
                                setFormData(prev => ({
                                  ...prev,
                                  products: updatedProducts
                                }));
                              }
                            }}
                          />
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Costo unitario:</span>
                            <span className="font-medium">
                              ${(item.purchasePrice || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold text-blue-600">
                              ${((item.purchasePrice || 0) * existingItem.quantity).toFixed(2)}
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

          {products.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay productos disponibles</p>
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