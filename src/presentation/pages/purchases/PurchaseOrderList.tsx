import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { PurchaseOrder } from '../../../domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../../../domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { OrderStatus } from '@/domain/models/order-status.enum';
import { Product } from '@/domain/models/product.model';

export function PurchaseOrderList() {
  const orderService = new PurchaseOrderServiceImpl();
  const supplierService = new SupplierServiceImpl();
  const productService = new ProductServiceImpl();
  const unitService = new UnitServiceImpl();

  const [suppliers, setSuppliers] = React.useState<Record<string, string>>({});
  const [products, setProducts] = React.useState<Product[]>([]);
  const [units, setUnits] = React.useState<Record<string, string>>({});

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
        setProducts(productsData);
        setUnits(unitsMap);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

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
      type: 'date' as const,
    },
    {
      header: 'Total Productos',
      accessor: 'totalProducts' as keyof PurchaseOrder,
    },
    {
      header: 'Total Items',
      accessor: 'totalItems' as keyof PurchaseOrder,
      render: (item: PurchaseOrder) => {
        const firstProduct = item.products?.[0];
        if (firstProduct) {
          const product = products.find(p => p.id === firstProduct.productId);
          if (product?.purchaseUnitId) {
            return `${item.totalItems} ${units[product.purchaseUnitId] || 'Unidad no encontrada'}`;
          }
        }
        return item.totalItems;
      },
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof PurchaseOrder,
      type: 'tag' as const,
      tags: [
        { 
          value: OrderStatus.PENDIENTE, 
          label: 'Pendiente', 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.ENVIADA, 
          label: 'Enviada', 
          color: 'info' as const 
        },
        { 
          value: OrderStatus.COMPLETADA, 
          label: 'Completada', 
          color: 'success' as const 
        },
        { 
          value: OrderStatus.CANCELADA, 
          label: 'Cancelada', 
          color: 'danger' as const 
        }
      ]
    },
  ];

  return (
    <GenericList<PurchaseOrder>
      columns={columns}
      title="Órdenes de Compra"
      addPath="/purchase-orders/new"
      backPath="/purchase-orders"
      service={orderService}
      type="purchase"
      products={products}
      supplierName={suppliers}
      units={units}
    />
  );
} 