import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm, Field, RelatedService } from '../../components/common/GenericForm';
import { Product, ProductSector, ProductStatus } from '../../../domain/models/product.model';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { Unit } from '../../../domain/models/unit.model';
import { Supplier } from '../../../domain/models/supplier.model';
import { 
  Info, 
  ShoppingCart, 
  Store, 
  Package2, 
  LayoutGrid
} from 'lucide-react';

interface UnitMap {
  [key: string]: Unit;
}

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = React.useState<Partial<Product>>({});
  const productService = new ProductServiceImpl();
  const unitService = new UnitServiceImpl();

  React.useEffect(() => {
    if (id) {
      productService.findById(id).then(data => {
        if (data) {
          setProduct(data);
        }
      });
    }
  }, [id]);

  const sections = [
    {
      title: 'Información General',
      icon: <Info className="h-5 w-5" />,
      fields: [
        {
          name: 'name',
          label: 'Nombre',
          type: 'text' as const,
          required: true,
        },
        {
          name: 'sku',
          label: 'SKU',
          type: 'text' as const,
          required: true,
        },
        {
          name: 'imageUrl',
          label: 'URL de Imagen',
          type: 'text' as const,
        },
        {
          name: 'state',
          label: 'Estado',
          type: 'select' as const,
          required: true,
          options: [
            { value: ProductStatus.ACTIVE, label: 'Activo' },
            { value: ProductStatus.INACTIVE, label: 'Inactivo' },
          ],
        },
        {
          name: 'isForSale',
          label: '¿Es para Venta?',
          type: 'boolean' as const,
          required: true,
          placeholder: 'Marque si el producto es para venta',
        },
        {
          name: 'isMaterial',
          label: '¿Es Material?',
          type: 'boolean' as const,
          required: true,
          placeholder: 'Marque si el producto es un material',
        },
      ] as Field<Product>[],
    },
    {
      title: 'Información de Compra',
      icon: <ShoppingCart className="h-5 w-5" />,
      fields: [
        {
          name: 'purchasePrice',
          label: 'Precio de Compra',
          type: 'number' as const,
        },
        {
          name: 'purchaseUnitId',
          label: 'Unidad de Compra',
          type: 'select' as const,
          relatedService: {
            service: unitService,
            labelKey: 'name',
            valueKey: 'id',
          } as RelatedService<Unit>,
        },
        {
          name: 'primarySupplierId',
          label: 'Proveedor Principal',
          type: 'select' as const,
          relatedService: {
            service: new SupplierServiceImpl(),
            labelKey: 'commercialName',
            valueKey: 'id',
          } as RelatedService<Supplier>,
        },
      ] as Field<Product>[],
    },
    {
      title: 'Información de Venta',
      icon: <Store className="h-5 w-5" />,
      fields: [
        {
          name: 'salePrice',
          label: 'Precio de Venta',
          type: 'number' as const,
        },
        {
          name: 'salesUnitId',
          label: 'Unidad de Venta',
          type: 'select' as const,
          relatedService: {
            service: unitService,
            labelKey: 'name',
            valueKey: 'id',
          } as RelatedService<Unit>,
        },
      ] as Field<Product>[],
      visible: (values: Partial<Product>) => values.isForSale === true,
    },
    {
      title: 'Información de Material',
      icon: <Package2 className="h-5 w-5" />,
      fields: [
        {
          name: 'materialName',
          label: 'Nombre del Material',
          type: 'text' as const,
        },
        {
          name: 'materialCode',
          label: 'Código del Material',
          type: 'text' as const,
        },
        {
          name: 'materialUnitId',
          label: 'Unidad de Material',
          type: 'select' as const,
          relatedService: {
            service: unitService,
            labelKey: 'name',
            valueKey: 'id',
          } as RelatedService<Unit>,
        },
      ] as Field<Product>[],
      visible: (values: Partial<Product>) => values.isMaterial === true,
    },
    {
      title: 'Información de Inventario',
      icon: <LayoutGrid className="h-5 w-5" />,
      fields: [
        {
          name: 'sector',
          label: 'Sector',
          type: 'select' as const,
          options: [
            { value: ProductSector.GENERAL, label: 'General' },
            { value: ProductSector.OTHER, label: 'Otro' },
          ],
        },
        {
          name: 'sectorOrder',
          label: 'Orden en el Sector',
          type: 'number' as const,
        },
        {
          name: 'desiredStock',
          label: 'Stock Deseado',
          type: 'number' as const,
        },
      ] as Field<Product>[],
    },
  ];

  return (
    <GenericForm<Product>
      title={id ? 'Editar Producto' : 'Nuevo Producto'}
      sections={sections}
      initialValues={product}
      service={productService}
      backPath="/products"
    />
  );
} 