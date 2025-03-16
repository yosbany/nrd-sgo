import { GenericList } from '../../components/common/GenericList';
import { Customer } from '../../../domain/models/customer.model';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { getStatusOptions } from '@/domain/enums/entity-status.enum';

export function CustomerList() {
  const customerService = new CustomerServiceImpl();

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Customer },
    {
      header: 'Teléfono',
      accessor: 'phone' as keyof Customer,
      render: (item: Customer) => item.phone || '-',
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof Customer,
      type: 'tag' as const,
      tags: getStatusOptions()
    },
  ];

  return (
    <GenericList<Customer>
      columns={columns}
      title="Clientes"
      addPath="/customers/new"
      backPath="/customers"
      service={customerService}
    />
  );
} 