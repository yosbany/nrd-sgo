import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { Supplier, SupplierStatus } from '../../../domain/models/supplier.model';
import { SupplierServiceImpl } from '../../../domain/services/supplier.service.impl';

export function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const supplierService = new SupplierServiceImpl();

  const getFields = (supplier: Supplier) => [
    { label: 'Nombre Comercial', value: supplier.commercialName },
    { label: 'Razón Social', value: supplier.legalName || '-' },
    { label: 'Teléfono', value: supplier.phone || '-' },
    { label: 'Email', value: supplier.email || '-' },
    { label: 'Dirección', value: supplier.address || '-' },
    { label: 'RUT', value: supplier.rut || '-' },
    { label: 'Estado', value: supplier.status === SupplierStatus.ACTIVE ? 'Activo' : 'Inactivo' },
  ];

  if (!id) return null;

  return (
    <GenericDetails<Supplier>
      title="Proveedor"
      fields={getFields}
      editPath={`/suppliers/${id}/edit`}
      backPath="/suppliers"
      service={supplierService}
      id={id}
    />
  );
} 