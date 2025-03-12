import { GenericList } from '../../components/common/GenericList';
import { Product, ProductStatus } from '../../../domain/models/product.model';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';

export function ProductList() {
  const productService = new ProductServiceImpl();

  const columns = [
    { header: 'SKU', accessor: 'sku' as keyof Product },
    { header: 'Nombre', accessor: 'name' as keyof Product },
    {
      header: 'Tipo',
      accessor: 'isMaterial' as keyof Product,
      render: (item: Product) => {
        if (item.isMaterial && item.isForSale) return 'Material y Venta';
        if (item.isMaterial) return 'Material';
        if (item.isForSale) return 'Venta';
        return '';
      }
    },
    {
      header: 'Estado',
      accessor: 'state' as keyof Product,
      type: 'tag' as const,
      tags: [
        { 
          value: ProductStatus.ACTIVE, 
          label: 'Activo', 
          color: 'success' as const 
        },
        { 
          value: ProductStatus.INACTIVE, 
          label: 'Inactivo', 
          color: 'secondary' as const 
        }
      ]
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