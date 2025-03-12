import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { PurchaseOrder, ProductItem } from '../../../domain/models/purchase-order.model';
import { PurchaseOrderServiceImpl } from '../../../domain/services/purchase-order.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { Product } from '../../../domain/models/product.model';
import { OrderStatus, OrderStatusLabel } from '@/domain/models/order-status.enum';

export function PurchaseOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const orderService = new PurchaseOrderServiceImpl();
  const supplierService = new SupplierServiceImpl();
  const productService = new ProductServiceImpl();
  const unitService = new UnitServiceImpl();
  const [suppliers, setSuppliers] = React.useState<Record<string, string>>({});
  const [products, setProducts] = React.useState<Record<string, Product>>({});
  const [units, setUnits] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadData = async () => {
      const [suppliersData, productsData, unitsData] = await Promise.all([
        supplierService.findAll(),
        productService.findAll(),
        unitService.findAll()
      ]);

      const suppliersMap = suppliersData.reduce((acc, supplier) => ({
        ...acc,
        [supplier.id]: supplier.commercialName
      }), {});

      const productsMap = productsData.reduce((acc, product) => ({
        ...acc,
        [product.id]: product
      }), {});

      const unitsMap = unitsData.reduce((acc, unit) => ({
        ...acc,
        [unit.id]: unit.name
      }), {});

      setSuppliers(suppliersMap);
      setProducts(productsMap);
      setUnits(unitsMap);
    };
    loadData();
  }, []);

  const renderProducts = (orderProducts: ProductItem[]) => {
    const columns = [
      {
        header: 'Producto',
        accessor: (item: ProductItem) => {
          if (item.productId) {
            const product = products[item.productId];
            return <div className="font-medium">{product?.name || 'Producto no encontrado'}</div>;
          }
          return 'Producto no especificado';
        }
      },
      {
        header: 'Cantidad',
        accessor: (item: ProductItem) => {
          if (item.productId) {
            const product = products[item.productId];
            const unitName = product?.purchaseUnitId ? units[product.purchaseUnitId] : 'Unidad no encontrada';
            return `${item.quantity} ${unitName}`;
          }
          return item.quantity;
        }
      }
    ];

    return <ArrayTable data={orderProducts} columns={columns} emptyMessage="No hay productos" />;
  };

  const getFields = (order: PurchaseOrder) => [
    { label: 'Proveedor', value: suppliers[order.supplierId] || 'Proveedor no encontrado' },
    { label: 'Estado', value: OrderStatusLabel[order.status] },
    { label: 'Fecha', value: new Date(order.orderDate).toLocaleDateString() },
    { label: 'Productos', value: renderProducts(order.products) },
    { label: 'Total de Items', value: order.totalItems },
    { label: 'Total de Productos', value: order.totalProducts },
  ];

  if (!id) return null;

  return (
    <GenericDetails<PurchaseOrder>
      title="Pedido de Compra"
      fields={getFields}
      editPath={`/purchase-orders/${id}/edit`}
      backPath="/purchase-orders"
      service={orderService}
      id={id}
    />
  );
} 