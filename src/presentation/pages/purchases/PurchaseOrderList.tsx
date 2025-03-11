import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { PurchaseOrder } from '../../../domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../../../domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';
import { Product } from '@/domain/models/product.model';

export function PurchaseOrderList() {
  const orderService = new PurchaseOrderServiceImpl();
  const supplierService = new SupplierServiceImpl();
  const productService = new ProductServiceImpl();

  const [suppliers, setSuppliers] = React.useState<Record<string, string>>({});
  const [products, setProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, productsData] = await Promise.all([
          supplierService.findAll(),
          productService.findAll()
        ]);

        const suppliersMap = suppliersData.reduce((acc, supplier) => {
          acc[supplier.id] = supplier.commercialName;
          return acc;
        }, {} as Record<string, string>);

        setSuppliers(suppliersMap);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.COMPLETED:
        return 'Completada';
      default:
        return status;
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
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
      type: 'date' as const,
    },
    {
      header: 'Total Productos',
      accessor: 'totalProducts' as keyof PurchaseOrder,
    },
    {
      header: 'Total Items',
      accessor: 'totalItems' as keyof PurchaseOrder,
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof PurchaseOrder,
      type: 'tag' as const,
      tags: [
        { 
          value: OrderStatus.PENDING, 
          label: 'Pendiente', 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.COMPLETED, 
          label: 'Completada', 
          color: 'success' as const 
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
    />
  );
} 