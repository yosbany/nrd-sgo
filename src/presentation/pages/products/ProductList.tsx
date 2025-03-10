import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Product, ProductStatus } from '../../../domain/models/product.model';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';

export function ProductList() {
  const productService = new ProductServiceImpl();

  const columns = [
    { header: 'SKU', accessor: 'sku' as keyof Product },
    { header: 'Nombre', accessor: 'name' as keyof Product },
    {
      header: 'Precio de Venta',
      accessor: 'salePrice' as keyof Product,
      render: (item: Product) => `$${item.salePrice.toFixed(2)}`,
    },
    {
      header: 'Estado',
      accessor: 'state' as keyof Product,
      render: (item: Product) => (item.state === ProductStatus.ACTIVE ? 'Activo' : 'Inactivo'),
    },
    {
      header: 'Tipo',
      accessor: 'isMaterial' as keyof Product,
      render: (item: Product) => {
        if (item.isMaterial && item.isForSale) return 'Material y Venta';
        if (item.isMaterial) return 'Material';
        if (item.isForSale) return 'Venta';
        return 'N/A';
      },
    },
  ];

  return (
    <GenericList<Product>
      columns={columns}
      title="Productos"
      addPath="/products/new"
      backPath="/products"
      service={productService}
    />
  );
} 