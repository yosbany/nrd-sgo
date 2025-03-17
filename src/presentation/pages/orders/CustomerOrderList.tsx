import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericList } from '../../components/common/GenericList';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { getStatusOptions } from '@/domain/enums/order-status.enum';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';
import { DesktopOrderModal } from '@/presentation/components/orders/DesktopOrderModal';
import { Customer } from '@/domain/models/customer.model';
import { PrintOrder } from '@/presentation/components/PrintOrder';
import { createRoot } from 'react-dom/client';
import { BaseService } from '@/domain/interfaces/base-service.interface';
import { TypeInventory } from '../../../domain/enums/type-inventory.enum';
import { formatWhatsAppMessage, sendWhatsAppMessage } from '@/presentation/components/orders/WhatsAppMessage';
import { ConfirmDialog } from '@/presentation/components/common/ConfirmDialog';

interface OrderItem {
  quantity: number;
  unit: string;
  description: string;
}

export function CustomerOrderList() {
  const navigate = useNavigate();
  const orderService = new CustomerOrderServiceImpl();
  const customerService = new CustomerServiceImpl();
  const productService = new ProductServiceImpl();
  const recipeService = new RecipeServiceImpl();
  const unitService = new UnitServiceImpl();
  
  const [customers, setCustomers] = React.useState<Record<string, string>>({});
  const [customersData, setCustomersData] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Record<string, string>>({});
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = React.useState(false);
  const [noPhoneDialogOpen, setNoPhoneDialogOpen] = React.useState(false);
  const [currentOrder, setCurrentOrder] = React.useState<CustomerOrder | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, productsData, recipesData, unitsData] = await Promise.all([
          customerService.findAll(),
          productService.findAll(),
          recipeService.findAll(),
          unitService.findAll()
        ]);

        const customersMap = customersData.reduce((acc, customer) => {
          if (customer.id && customer.name) {
            acc[customer.id] = customer.name;
          }
          return acc;
        }, {} as Record<string, string>);

        const unitsMap = unitsData.reduce((acc, unit) => {
          if (unit.id && unit.name) {
            acc[unit.id] = unit.name;
          }
          return acc;
        }, {} as Record<string, string>);

        setCustomers(customersMap);
        setCustomersData(customersData);
        setProducts(productsData);
        setRecipes(recipesData);
        setUnits(unitsMap);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleCreateEmpty = () => {
    navigate('/customer-orders/new');
  };

  const handleCreateFromCopy = (orderId: string) => {
    navigate(`/customer-orders/new?copy=${orderId}`);
  };

  const handleCreateCalculated = (customerId: string) => {
    navigate(`/customer-orders/new?calculate=${customerId}`);
  };

  const handlePrint = (order: CustomerOrder) => {
    console.log('Order to print (detailed):', JSON.stringify(order, null, 2));
    console.log('Order to print:', order);
    console.log('Order items:', order.items);
    
    if (!order.items || order.items.length === 0) {
      console.warn('No hay items para imprimir');
      return;
    }

    const items: OrderItem[] = order.items.map(item => {
      console.log('Processing item:', item);
      let description = '';
      let unit = 'Unidad';

      if (item.typeItem === TypeInventory.PRODUCTO) {
        const productData = products.find(p => p.id === item.itemId);
        console.log('Found product:', productData);
        const unitId = productData?.salesUnitId;
        if (unitId && unitId in units) {
          unit = units[unitId];
        }
        description = productData?.name || 'Producto no encontrado';
      } else if (item.typeItem === TypeInventory.RECETA) {
        const recipeData = recipes.find(r => r.id === item.itemId);
        console.log('Found recipe:', recipeData);
        const unitId = recipeData?.yieldUnitId;
        if (unitId && unitId in units) {
          unit = units[unitId];
        }
        description = recipeData?.name || 'Receta no encontrada';
      }

      return {
        quantity: item.quantity,
        unit,
        description
      };
    });

    const customer = customersData.find(c => c.id === order.customerId);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write('<html><head><title>Pedido de Cliente</title></head><body>');
      printWindow.document.write('<div id="print-root"></div>');
      printWindow.document.write('</body></html>');
      
      const root = printWindow.document.getElementById('print-root');
      if (root) {
        const reactRoot = createRoot(root);
        reactRoot.render(
          <PrintOrder
            orderNumber={order.nro}
            date={new Date(order.orderDate)}
            contactType="cliente"
            contactName={customer?.name || 'Cliente no encontrado'}
            items={items}
          />
        );
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleWhatsApp = (order: CustomerOrder) => {
    if (!order.items || order.items.length === 0) {
      alert('No hay items para enviar');
      return;
    }

    const items = order.items.map(item => {
      let description = '';
      let unit = 'Unidad';

      if (item.typeItem === TypeInventory.PRODUCTO) {
        const productData = products.find(p => p.id === item.itemId);
        const unitId = productData?.salesUnitId;
        if (unitId && unitId in units) {
          unit = units[unitId];
        }
        description = productData?.name || 'Producto no encontrado';
      } else if (item.typeItem === TypeInventory.RECETA) {
        const recipeData = recipes.find(r => r.id === item.itemId);
        const unitId = recipeData?.yieldUnitId;
        if (unitId && unitId in units) {
          unit = units[unitId];
        }
        description = recipeData?.name || 'Receta no encontrada';
      }

      return {
        quantity: item.quantity,
        unit,
        description
      };
    });

    const customer = customersData.find(c => c.id === order.customerId);
    
    if (!customer?.phone) {
      setCurrentOrder(order);
      setNoPhoneDialogOpen(true);
      return;
    }

    const message = formatWhatsAppMessage({
      orderNumber: order.nro || '',
      date: new Date(order.orderDate),
      contactName: customer.name,
      items,
      totals: {
        products: order.totalProducts || 0,
        items: order.totalItems || 0
      }
    });

    sendWhatsAppMessage(customer.phone, message);
  };

  const columns = [
    {
      header: 'Cliente',
      accessor: 'customerId' as keyof CustomerOrder,
      render: (item: CustomerOrder) =>
        customers[item.customerId] || 'Cliente no encontrado',
    },
    {
      header: 'Fecha',
      accessor: 'orderDate' as keyof CustomerOrder,
      type: 'date' as const,
    },
    {
      header: 'Totales',
      accessor: 'totalProducts' as keyof CustomerOrder,
      render: (item: CustomerOrder) => `${item.totalProducts}/${item.totalItems}`,
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof CustomerOrder,
      type: 'tag' as const,
      tags: getStatusOptions()
    },
  ];

  return (
    <>
      <DesktopOrderModal
        open={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onCreateEmpty={handleCreateEmpty}
        onCreateFromCopy={handleCreateFromCopy}
        onCreateCalculated={handleCreateCalculated}
        orderType="customer"
        customers={customersData}
      />

      <ConfirmDialog
        open={noPhoneDialogOpen}
        onOpenChange={setNoPhoneDialogOpen}
        title="No hay teléfono registrado"
        description={`El cliente ${customersData.find(c => c.id === currentOrder?.customerId)?.name || ''} no tiene número de teléfono registrado. Por favor, actualice los datos del cliente antes de enviar el mensaje.`}
        onConfirm={() => {
          setNoPhoneDialogOpen(false);
          if (currentOrder?.customerId) {
            navigate(`/customers/${currentOrder.customerId}/edit`);
          }
        }}
        onCancel={() => setNoPhoneDialogOpen(false)}
        confirmText="Editar Cliente"
        cancelText="Cerrar"
      />

      <GenericList<CustomerOrder>
        columns={columns}
        title="Pedidos de Clientes"
        onAddClick={() => setIsNewOrderModalOpen(true)}
        backPath="/customer-orders"
        service={orderService as BaseService<CustomerOrder>}
        type="customer"
        onPrint={handlePrint}
        onWhatsApp={handleWhatsApp}
      />
    </>
  );
} 