import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Customer, CustomerStatus } from '../../../domain/models/customer.model';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';

export function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = React.useState<Customer | undefined>();
  const [isLoading, setIsLoading] = React.useState(true);
  const customerService = new CustomerServiceImpl();

  React.useEffect(() => {
    const loadCustomer = async () => {
      if (id) {
        try {
          const data = await customerService.findById(id);
          if (data) {
            setCustomer(data);
          }
        } catch (error) {
          console.error('Error loading customer:', error);
        }
      }
      setIsLoading(false);
    };

    loadCustomer();
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
      type: 'text' as const,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <GenericForm<Customer>
        title={id ? 'Editar Cliente' : 'Nuevo Cliente'}
        fields={fields}
        initialValues={customer || {}}
        service={customerService}
        backPath="/customers"
      />
    </div>
  );
} 