import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Customer, CustomerStatus } from '../../../domain/models/customer.model';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';

export function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = React.useState<Partial<Customer>>({});
  const customerService = new CustomerServiceImpl();

  React.useEffect(() => {
    if (id) {
      customerService.findById(id).then(data => {
        if (data) setCustomer(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text' as const,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'textarea' as const,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: CustomerStatus.ACTIVE, label: 'Activo' },
        { value: CustomerStatus.INACTIVE, label: 'Inactivo' },
      ],
    },
  ];

  return (
    <GenericForm<Customer>
      title={id ? 'Editar Cliente' : 'Nuevo Cliente'}
      fields={fields}
      initialValues={customer}
      service={customerService}
      backPath="/customers"
    />
  );
} 