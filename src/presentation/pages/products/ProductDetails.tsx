import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { Product, SaleChannel } from '../../../domain/models/product.model';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { EntityStatus } from '@/domain/enums/entity-status.enum';
import { Package2, DollarSign, ShoppingCart, Store } from 'lucide-react';
import { getLabel } from '@/domain/enums/sector.enum';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const productService = new ProductServiceImpl();
  const unitService = new UnitServiceImpl();
  const supplierService = new SupplierServiceImpl();
  const [units, setUnits] = React.useState<Record<string, string>>({});
  const [suppliers, setSuppliers] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadData = async () => {
      const [unitsData, suppliersData] = await Promise.all([
        unitService.findAll(),
        supplierService.findAll()
      ]);

      const unitsMap = unitsData.reduce((acc, unit) => ({
        ...acc,
        [unit.id as string]: unit.name
      }), {});

      const suppliersMap = suppliersData.reduce((acc, supplier) => ({
        ...acc,
        [supplier.id as string]: supplier.commercialName
      }), {});

      setUnits(unitsMap);
      setSuppliers(suppliersMap);
    };
    loadData();
  }, []);

  const getProductStatusLabel = (status: EntityStatus) => {
    switch (status) {
      case EntityStatus.ACTIVO:
        return 'Activo';
      case EntityStatus.INACTIVO:
        return 'Inactivo';
      default:
        return status;
    }
  };

  const renderSalesChannels = (channels: SaleChannel[]) => {
    const columns = [
      {
        header: 'Código',
        accessor: (channel: SaleChannel) => channel.code
      },
      {
        header: 'Nombre',
        accessor: (channel: SaleChannel) => channel.name
      },
      {
        header: 'Precio de Venta',
        accessor: (channel: SaleChannel) => channel.salePrice.toLocaleString('es-UY', {
          style: 'currency',
          currency: 'UYU'
        })
      }
    ];

    return <ArrayTable data={channels} columns={columns} emptyMessage="No hay canales de venta" />;
  };

  const getFields = (product: Product) => [
    { 
      label: ' ', 
      value: <div className="flex items-center gap-2 text-lg font-semibold mb-4">
        <Package2 className="h-5 w-5" /> Información Básica
      </div>,
      colSpan: 2 
    },
    { label: 'Nombre', value: product.name },
    { label: 'SKU', value: product.sku },
    { label: 'Estado', value: getProductStatusLabel(product.status) },
    { label: 'Sector', value: getLabel(product.sector)},
    { label: 'Orden en Sector', value: product.sectorOrder },
    { label: 'Stock Deseado', value: product.desiredStock },
    
    { 
      label: ' ', 
      value: <div className="flex items-center gap-2 text-lg font-semibold mb-4 mt-6">
        <DollarSign className="h-5 w-5" /> Información de Costos
      </div>,
      colSpan: 2 
    },
    { label: 'Nombre de Venta', value: product.nameSale || '-' },
    { label: 'Precio de Venta', value: product.salePrice.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) },
    { label: 'Costo Unitario de Venta', value: product.salesUnitCost?.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) || '-' },
    { label: 'Costo Unitario de Material', value: product.materialUnitCost?.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) || '-' },
    { label: 'Precio de Compra', value: product.purchasePrice?.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) || '-' },
    
    { 
      label: ' ', 
      value: <div className="flex items-center gap-2 text-lg font-semibold mb-4 mt-6">
        <ShoppingCart className="h-5 w-5" /> Unidades
      </div>,
      colSpan: 2 
    },
    { label: 'Unidad de Venta', value: product.salesUnitId ? units[product.salesUnitId] : '-' },
    { label: 'Unidad de Material', value: product.materialUnitId ? units[product.materialUnitId] : '-' },
    { label: 'Unidad de Compra', value: product.purchaseUnitId ? units[product.purchaseUnitId] : '-' },
    
    { 
      label: ' ', 
      value: <div className="flex items-center gap-2 text-lg font-semibold mb-4 mt-6">
        <Store className="h-5 w-5" /> Proveedor
      </div>,
      colSpan: 2 
    },
    { label: 'Proveedor Principal', value: product.primarySupplierId ? suppliers[product.primarySupplierId] : '-' },
    
    { 
      label: ' ', 
      value: <div className="flex items-center gap-2 text-lg font-semibold mb-4 mt-6">
        <Store className="h-5 w-5" /> Canales de Venta
      </div>,
      colSpan: 2 
    },
    { label: ' ', value: renderSalesChannels(product.salesChannels || []), colSpan: 2 },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Product>
      title="Producto"
      fields={getFields}
      editPath={`/products/${id}/edit`}
      backPath="/products"
      service={productService}
      id={id}
    />
  );
} 