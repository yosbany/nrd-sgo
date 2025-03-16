import { GenericList } from '../../components/common/GenericList';
import { Product } from '../../../domain/models/product.model';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { getStatusOptions } from '@/domain/enums/entity-status.enum';

export function ProductList() {
  const productService = new ProductServiceImpl();

  const columns = [
    { header: 'SKU', accessor: 'sku' as keyof Product },
    { header: 'Nombre', accessor: 'name' as keyof Product },
    {
      header: 'Estado',
      accessor: 'status' as keyof Product,
      type: 'tag' as const,
      tags: getStatusOptions()
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