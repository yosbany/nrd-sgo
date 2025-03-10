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

export const MobilePurchaseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [units, setUnits] = React.useState<Array<{ id: string; symbol: string }>>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<string>('');
  const [quantity, setQuantity] = React.useState<number>(1);
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
      
      setSuppliers(suppliersData);
      setProducts(productsData);
      setUnits(unitsData);

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
      toast.error('Debe seleccionar un producto');
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Productos</h2>
            <span className="text-sm text-gray-500">
              {formData.products?.length || 0} productos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {products.map(item => {
              const existingItem = formData.products?.find(p => p.productId === item.id);

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${
                    existingItem ? 'border-primary ring-1 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
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
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
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
                        <span className="text-sm text-gray-500">
                          {units.find(u => u.id === item.purchaseUnitId)?.symbol}
                        </span>
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