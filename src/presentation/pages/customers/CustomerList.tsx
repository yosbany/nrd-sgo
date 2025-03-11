import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { Customer, CustomerStatus } from '../../../domain/models/customer.model';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';

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
      tags: [
        { 
          value: CustomerStatus.ACTIVE, 
          label: 'Activo', 
          color: 'success' as const 
        },
        { 
          value: CustomerStatus.INACTIVE, 
          label: 'Inactivo', 
          color: 'secondary' as const 
        }
      ]
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