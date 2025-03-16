import { useEffect, useState, ChangeEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './button';
import { Input } from './input';
import { Plus, Trash2, PencilIcon, Printer } from 'lucide-react';
import { Select, SelectOption } from './select';
import { toast } from 'sonner';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { Product } from '@/domain/models/product.model';

interface ProduceCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Lista predefinida de empaques
const PREDEFINED_PACKAGES: Package[] = [
  { id: 'caja-carton', name: 'Caja de Cartón', weight: 250 },
  { id: 'bolsa-plastica', name: 'Bolsa Plástica', weight: 50 },
  { id: 'caja-madera', name: 'Caja de Madera', weight: 500 },
  { id: 'malla', name: 'Malla', weight: 30 },
];

// Interfaz para los empaques
interface Package {
  id: string;
  name: string;
  weight: number;
}

interface CalculatorData {
  productId: string;
  totalWeight: string;
  totalCost: string;
  packageId: string;
  profitPercentage: string;
  lastUsed?: string;
}

interface OrderItem extends CalculatorData {
  id: string;
  results: {
    unitWeight: string;
    unitPrice: string;
    profitAmount: string;
    sellingPrice: string;
  };
}

const STORAGE_KEY = 'produce-calculator-data';
const ORDER_STORAGE_KEY = 'produce-order-items';

// Convertir empaques a opciones para el Select
const PACKAGE_OPTIONS: SelectOption[] = PREDEFINED_PACKAGES.map(pkg => ({
  value: pkg.id,
  label: pkg.name
}));

export function ProduceCalculator({ isOpen, onClose }: ProduceCalculatorProps) {
  const [data, setData] = useState<CalculatorData>({
    productId: '',
    totalWeight: '',
    totalCost: '',
    packageId: 'bolsa-plastica',
    profitPercentage: '25',
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const productService = new ProductServiceImpl();

  // Cargar productos al montar el componente
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productService.findAll();
        setProducts(productsData);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar los productos');
      }
    };
    loadProducts();
  }, []);

  // Convertir productos a opciones para el Select
  const productOptions: SelectOption[] = products.map(product => ({
    value: product.id || '',
    label: product.name,
    group: product.isMaterial ? 'Materiales' : 'Productos'
  }));

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedOrderItems = localStorage.getItem(ORDER_STORAGE_KEY);
    if (storedData) {
      setData(JSON.parse(storedData));
    }
    if (storedOrderItems) {
      setOrderItems(JSON.parse(storedOrderItems));
    }
  }, []);

  // Calcular resultados del producto actual
  const selectedProduct = products.find(p => p.id === data.productId);

  // Calcular totales de la orden
  const orderTotal = orderItems.reduce((sum, item) => sum + parseFloat(item.results.sellingPrice), 0);
  const orderProfit = orderItems.reduce((sum, item) => sum + parseFloat(item.results.profitAmount), 0);

  // Manejadores de eventos
  const handleChange = (field: keyof CalculatorData) => (
    value: string | ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = typeof value === 'string' ? value : value.target.value;
    setData(prev => ({ ...prev, [field]: newValue }));
  };

  const handleAddItem = () => {
    if (!data.productId || !data.totalWeight || !data.totalCost || !data.profitPercentage) return;

    const results = calculateResults(data);
    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      ...data,
      results
    };

    setOrderItems(prev => [...prev, newItem]);
    setData({
      productId: '',
      totalWeight: '',
      totalCost: '',
      packageId: 'bolsa-plastica',
      profitPercentage: '25',
    });
  };

  const handleEditItem = (itemId: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    const itemToEdit = orderItems.find(item => item.id === itemId);
    if (itemToEdit) {
      setData(itemToEdit);
      setEditingItemId(itemId);
    }
  };

  const handleDeleteItem = (itemId: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleClearOrder = () => {
    setOrderItems([]);
  };

  const handlePrintLabels = () => {
    // Crear un elemento temporal para imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión');
      return;
    }

    // Generar el contenido HTML para las etiquetas
    const labelsContent = orderItems.map((item) => {
      const product = products.find(p => p.id === item.productId);
      return `
        <div style="padding: 5mm 10mm;">
          <div style="font-size: 16pt; font-weight: bold; text-align: left; margin-bottom: 1mm;">
            ${product?.name || 'Producto'}
          </div>
          <div style="font-size: 20pt; font-weight: bold; text-align: right;">
            $${item.results.sellingPrice}
          </div>
          <div style="margin-top: 10mm; border-top: 1px dashed #000; height: 1px;"></div>
        </div>
      `;
    }).join('');

    // Estilo para impresión de 80mm
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiquetas de Productos</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              width: 80mm;
            }
            @media print {
              body {
                width: 80mm;
              }
            }
          </style>
        </head>
        <body>
          ${labelsContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Esperar a que los estilos se carguen antes de imprimir
    setTimeout(() => {
      printWindow.print();
      // Cerrar la ventana después de imprimir
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-5xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-xl">
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                Calculadora de Productos
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="p-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Left Column - Product Form */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-800 p-3 rounded-lg border border-primary-200 dark:border-gray-600 shadow-sm">
                      <h3 className="text-sm font-semibold text-primary-900 dark:text-white mb-3">
                        {editingItemId ? 'Editar Producto' : 'Agregar Producto'}
                      </h3>
                      <div className="grid gap-3">
                        <Select
                          label="Producto"
                          value={data.productId}
                          onChange={handleChange('productId')}
                          options={productOptions}
                          placeholder="Seleccionar producto"
                          searchPlaceholder="Buscar producto..."
                          notFoundText="No se encontraron productos"
                          className="font-bold text-lg"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Peso Total (Kg)"
                            type="number"
                            value={data.totalWeight}
                            onChange={handleChange('totalWeight')}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="font-bold text-lg"
                          />

                          <Input
                            label="Costo Total ($)"
                            type="number"
                            value={data.totalCost}
                            onChange={handleChange('totalCost')}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="font-bold text-lg"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Select
                            label="Tipo de Empaque"
                            value={data.packageId}
                            onChange={handleChange('packageId')}
                            options={PACKAGE_OPTIONS}
                            placeholder="Seleccionar empaque"
                            className="font-bold text-lg"
                          />

                          <Input
                            label="Ganancia (%)"
                            type="number"
                            value={data.profitPercentage}
                            onChange={handleChange('profitPercentage')}
                            placeholder="25"
                            min="0"
                            max="100"
                            className="font-bold text-lg"
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                          {editingItemId ? (
                            <>
                              <Button variant="secondary" onClick={handleDeleteItem(orderItems[0].id)} size="sm">
                                Cancelar
                              </Button>
                              <Button 
                                onClick={handleAddItem}
                                size="sm"
                                disabled={!selectedProduct || !data.totalWeight || !data.totalCost || !data.profitPercentage}
                              >
                                Guardar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="secondary" onClick={handleClearOrder} size="sm">
                                Limpiar
                              </Button>
                              <Button 
                                onClick={handleAddItem}
                                size="sm"
                                disabled={!selectedProduct || !data.totalWeight || !data.totalCost || !data.profitPercentage}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Order Items */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Productos
                      </h3>
                    </div>

                    <div className="p-3 space-y-2">
                      {orderItems.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                          No hay productos
                        </p>
                      ) : (
                        orderItems.map((item) => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <div 
                              key={item.id}
                              className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {product?.name || 'Producto no encontrado'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleEditItem(item.id)}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
                                    disabled={editingItemId !== null}
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={handleDeleteItem(item.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400"
                                    disabled={editingItemId === item.id}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>Peso Unitario: {item.results.unitWeight} Kg</span>
                                <span>Precio Unitario: ${item.results.unitPrice}</span>
                                <span>Ganancia: ${item.results.profitAmount}</span>
                                <span>Precio Venta: ${item.results.sellingPrice}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Ganancia Total:
                          </span>
                          <span className="text-base font-semibold text-green-600 dark:text-green-400">
                            ${orderProfit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Importe Total:
                          </span>
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            ${orderTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="secondary" 
                  onClick={handleClearOrder}
                  size="sm"
                  disabled={orderItems.length === 0}
                >
                  Limpiar
                </Button>
                <Button
                  variant="secondary"
                  onClick={handlePrintLabels}
                  size="sm"
                  disabled={orderItems.length === 0}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Imprimir Etiquetas
                </Button>
                <Button 
                  onClick={onClose}
                  size="sm"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}

const calculateResults = (data: CalculatorData): OrderItem['results'] => {
  const totalWeight = parseFloat(data.totalWeight) || 0;
  const totalCost = parseFloat(data.totalCost) || 0;
  const profitPercentage = parseFloat(data.profitPercentage) || 0;

  const unitWeight = (totalWeight / 1000).toFixed(2);
  const unitPrice = (totalCost / totalWeight).toFixed(2);
  const profitAmount = ((totalCost * profitPercentage) / 100).toFixed(2);
  const sellingPrice = (totalCost + parseFloat(profitAmount)).toFixed(2);

  return {
    unitWeight,
    unitPrice,
    profitAmount,
    sellingPrice
  };
}; 