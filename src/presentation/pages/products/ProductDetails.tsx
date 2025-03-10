import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { Product, ProductStatus, ProductSector, SaleChannel } from '../../../domain/models/product.model';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';

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
        [unit.id]: unit.name
      }), {});

      const suppliersMap = suppliersData.reduce((acc, supplier) => ({
        ...acc,
        [supplier.id]: supplier.commercialName
      }), {});

      setUnits(unitsMap);
      setSuppliers(suppliersMap);
    };
    loadData();
  }, []);

  const getProductStatusLabel = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return 'Activo';
      case ProductStatus.INACTIVE:
        return 'Inactivo';
      default:
        return status;
    }
  };

  const getProductSectorLabel = (sector: ProductSector) => {
    switch (sector) {
      case ProductSector.GENERAL:
        return 'General';
      case ProductSector.OTHER:
        return 'Otro';
      default:
        return sector;
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
    { label: 'Nombre', value: product.name },
    { label: 'SKU', value: product.sku },
    { label: 'Estado', value: getProductStatusLabel(product.state) },
    { label: 'Sector', value: product.sector ? getProductSectorLabel(product.sector) : '-' },
    { label: 'Orden en Sector', value: product.sectorOrder || '-' },
    { label: 'Stock Deseado', value: product.desiredStock || '-' },
    { label: 'Precio de Venta', value: product.salePrice.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) },
    { label: 'Costo Unitario de Venta', value: product.salesUnitCost?.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) || '-' },
    { label: 'Costo Unitario de Material', value: product.materialUnitCost?.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) || '-' },
    { label: 'Precio de Compra', value: product.purchasePrice?.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' }) || '-' },
    { label: 'Unidad de Venta', value: product.salesUnitId ? units[product.salesUnitId] : '-' },
    { label: 'Unidad de Material', value: product.materialUnitId ? units[product.materialUnitId] : '-' },
    { label: 'Unidad de Compra', value: product.purchaseUnitId ? units[product.purchaseUnitId] : '-' },
    { label: 'Proveedor Principal', value: product.primarySupplierId ? suppliers[product.primarySupplierId] : '-' },
    { label: 'Canales de Venta', value: renderSalesChannels(product.salesChannels || []) },
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