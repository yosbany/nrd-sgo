import { GenericList } from '../../components/common/GenericList';
import { Supplier } from '../../../domain/models/supplier.model';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';
import { getStatusOptions } from '@/domain/enums/entity-status.enum';

export function SupplierList() {
  const supplierService = new SupplierServiceImpl();

  const columns = [
    { header: 'Nombre Comercial', accessor: 'commercialName' as keyof Supplier },
    {
      header: 'Teléfono',
      accessor: 'phone' as keyof Supplier,
      render: (item: Supplier) => item.phone || '-',
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof Supplier,
      type: 'tag' as const,
      tags: getStatusOptions()
    },
  ];

  return (
    <GenericList<Supplier>
      columns={columns}
      title="Proveedores"
      addPath="/suppliers/new"
      backPath="/suppliers"
      service={supplierService}
    />
  );
} 