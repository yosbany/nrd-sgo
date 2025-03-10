import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericForm } from '../../components/common/GenericForm';
import { Supplier, SupplierStatus } from '../../../domain/models/supplier.model';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';

export function SupplierForm() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = React.useState<Partial<Supplier>>({});
  const supplierService = new SupplierServiceImpl();

  React.useEffect(() => {
    if (id) {
      supplierService.findById(id).then(data => {
        if (data) setSupplier(data);
      });
    }
  }, [id]);

  const fields = [
    {
      name: 'commercialName',
      label: 'Nombre Comercial',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'legalName',
      label: 'Razón Social',
      type: 'text' as const,
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
      name: 'rut',
      label: 'RUT',
      type: 'text' as const,
    },
    {
      name: 'status',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: SupplierStatus.ACTIVE, label: 'Activo' },
        { value: SupplierStatus.INACTIVE, label: 'Inactivo' },
      ],
    },
  ];

  return (
    <GenericForm<Supplier>
      title={id ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      fields={fields}
      initialValues={supplier}
      service={supplierService}
      backPath="/suppliers"
    />
  );
} 