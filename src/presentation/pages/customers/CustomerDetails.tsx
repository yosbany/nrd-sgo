import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Customer } from '../../../domain/models/customer.model';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { getLabel } from '@/domain/enums/entity-status.enum';

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const customerService = new CustomerServiceImpl();

  const getFields = (customer: Customer) => [
    { label: 'Nombre', value: customer.name },
    { label: 'Teléfono', value: customer.phone },
    { label: 'Email', value: customer.email },
    { label: 'Dirección', value: customer.address, colSpan: 2  },
    { label: 'Estado', value: getLabel(customer.status) },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Customer>
      title="Cliente"
      fields={getFields}
      editPath={`/customers/${id}/edit`}
      backPath="/customers"
      service={customerService}
      id={id}
    />
  );
} 