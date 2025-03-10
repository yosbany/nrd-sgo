import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Product, ProductSector, ProductStatus, PriceChangeType } from '../../../domain/models/product.model';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = React.useState<Partial<Product>>({});
  const productService = new ProductServiceImpl();

  React.useEffect(() => {
    if (id) {
      productService.findById(id).then(data => {
        if (data) setProduct(data);
      });
    }
  }, [id]);

  const generalInfoFields = [
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
  ];

  const purchaseInfoFields = [
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
        service: new UnitServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'primarySupplierId',
      label: 'Proveedor Principal',
      type: 'select' as const,
      relatedService: {
        service: new SupplierServiceImpl(),
        labelField: 'commercialName',
      },
    },
  ];

  const saleInfoFields = [
    {
      name: 'salePrice',
      label: 'Precio de Venta',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'salesUnitId',
      label: 'Unidad de Venta',
      type: 'select' as const,
      relatedService: {
        service: new UnitServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'salesUnitCost',
      label: 'Costo Unitario de Venta',
      type: 'number' as const,
    },
    {
      name: 'salesChannels',
      label: 'Canales de Venta',
      type: 'array' as const,
      arrayConfig: {
        columns: [
          { header: 'Código', accessor: 'code' },
          { header: 'Nombre', accessor: 'name' },
          { 
            header: 'Precio de Venta', 
            accessor: 'salePrice',
            render: (value: number) => value?.toLocaleString('es-UY', {
              style: 'currency',
              currency: 'UYU'
            }) || ''
          },
        ],
        form: {
          fields: [
            {
              name: 'code',
              label: 'Código',
              type: 'text' as const,
              required: true,
              placeholder: 'Ej: TIENDA_1',
            },
            {
              name: 'name',
              label: 'Nombre',
              type: 'text' as const,
              required: true,
              placeholder: 'Ej: Tienda Principal',
            },
            {
              name: 'salePrice',
              label: 'Precio de Venta',
              type: 'number' as const,
              required: true,
              placeholder: 'Ej: 1000',
            },
          ],
          emptyState: {
            title: 'No hay canales de venta definidos',
            description: 'Haga clic en el botón "Agregar" para comenzar a definir los canales de venta de este producto.',
          },
          modalTitles: {
            add: 'Agregar Canal de Venta',
            edit: 'Modificar Canal de Venta',
          },
          addButtonText: 'Agregar Canal',
          editButtonTooltip: 'Modificar este canal',
          deleteButtonTooltip: 'Eliminar este canal',
        },
      },
    },
  ];

  const materialInfoFields = [
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
        service: new UnitServiceImpl(),
        labelField: 'name',
      },
    },
    {
      name: 'materialUnitCost',
      label: 'Costo Unitario de Material',
      type: 'number' as const,
    },
  ];

  const inventoryInfoFields = [
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
  ];

  const sections = [
    {
      title: 'Información General',
      fields: generalInfoFields,
    },
    {
      title: 'Información de Compra',
      fields: purchaseInfoFields,
    },
    {
      title: 'Información de Venta',
      fields: saleInfoFields,
      visible: (values: Partial<Product>) => values.isForSale === true,
    },
    {
      title: 'Información de Material',
      fields: materialInfoFields,
      visible: (values: Partial<Product>) => values.isMaterial === true,
    },
    {
      title: 'Información de Inventario',
      fields: inventoryInfoFields,
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