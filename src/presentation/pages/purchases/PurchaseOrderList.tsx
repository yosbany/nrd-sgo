import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericList } from '../../components/common/GenericList';
import { PurchaseOrder } from '../../../domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../../../domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { OrderStatus } from '@/domain/enums/order-status.enum';
import { Product } from '@/domain/models/product.model';
import { DesktopOrderModal } from '@/presentation/components/orders/DesktopOrderModal';
import { Supplier } from '@/domain/models/supplier.model';
import { PrintOrder } from '@/presentation/components/PrintOrder';
import { createRoot } from 'react-dom/client';

export function PurchaseOrderList() {
  const navigate = useNavigate();
  const orderService = new PurchaseOrderServiceImpl();
  const supplierService = new SupplierServiceImpl();
  const productService = new ProductServiceImpl();
  const unitService = new UnitServiceImpl();

  const [suppliers, setSuppliers] = React.useState<Record<string, string>>({});
  const [suppliersData, setSuppliersData] = React.useState<Supplier[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [units, setUnits] = React.useState<Record<string, string>>({});
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, productsData, unitsData] = await Promise.all([
          supplierService.findAll(),
          productService.findAll(),
          unitService.findAll()
        ]);

        const suppliersMap = suppliersData.reduce((acc, supplier) => {
          acc[supplier.id] = supplier.commercialName;
          return acc;
        }, {} as Record<string, string>);

        const unitsMap = unitsData.reduce((acc, unit) => {
          acc[unit.id] = unit.name;
          return acc;
        }, {} as Record<string, string>);

        setSuppliers(suppliersMap);
        setSuppliersData(suppliersData);
        setProducts(productsData);
        setUnits(unitsMap);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleCreateEmpty = () => {
    navigate('/purchase-orders/new');
  };

  const handleCreateFromCopy = (orderId: string) => {
    navigate(`/purchase-orders/new?copy=${orderId}`);
  };

  const handleCreateCalculated = (supplierId: string) => {
    navigate(`/purchase-orders/new?calculate=${supplierId}`);
  };

  const handlePrint = (order: PurchaseOrder) => {
    const items = order.products.map(product => {
      const productData = products.find(p => p.id === product.productId);
      const unit = units[productData?.purchaseUnitId || ''] || 'Unidad';
      return {
        quantity: product.quantity,
        unit,
        description: productData?.name || 'Producto no encontrado'
      };
    });

    const supplier = suppliersData.find(s => s.id === order.supplierId);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write('<html><head><title>Orden de Compra</title></head><body>');
      printWindow.document.write('<div id="print-root"></div>');
      printWindow.document.write('</body></html>');
      
      const root = printWindow.document.getElementById('print-root');
      if (root) {
        const reactRoot = createRoot(root);
        reactRoot.render(
          <PrintOrder
            orderNumber={order.nro}
            date={new Date(order.orderDate)}
            contactType="proveedor"
            contactName={supplier?.commercialName || 'Proveedor no encontrado'}
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

  const columns = [
    {
      header: 'Proveedor',
      accessor: 'supplierId' as keyof PurchaseOrder,
      render: (item: PurchaseOrder) =>
        suppliers[item.supplierId] || 'Proveedor no encontrado',
    },
    {
      header: 'Fecha',
      accessor: 'orderDate' as keyof PurchaseOrder,
      render: (item: PurchaseOrder) => {
        const date = item.orderDate instanceof Date 
          ? item.orderDate 
          : new Date(item.orderDate);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    },
    {
      header: 'Totales',
      accessor: 'totalProducts' as keyof PurchaseOrder,
      render: (item: PurchaseOrder) => {
        return `${item.totalProducts || 0} / ${item.totalItems || 0}`;
      }
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof PurchaseOrder,
      type: 'tag' as const,
      className: 'rounded-md px-2 py-1',
      tags: [
        { 
          value: OrderStatus.PENDIENTE, 
          label: OrderStatus.PENDIENTE, 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.ENVIADA, 
          label: OrderStatus.ENVIADA, 
          color: 'info' as const 
        },
        { 
          value: OrderStatus.COMPLETADA, 
          label: OrderStatus.COMPLETADA, 
          color: 'success' as const 
        },
        { 
          value: OrderStatus.CANCELADA, 
          label: OrderStatus.CANCELADA, 
          color: 'danger' as const 
        }
      ]
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
        orderType="purchase"
        suppliers={suppliersData}
      />

      <GenericList<PurchaseOrder>
        columns={columns}
        title="Órdenes de Compra"
        onAddClick={() => setIsNewOrderModalOpen(true)}
        backPath="/purchase-orders"
        service={orderService}
        type="purchase"
        onPrint={handlePrint}
      />
    </>
  );
} 