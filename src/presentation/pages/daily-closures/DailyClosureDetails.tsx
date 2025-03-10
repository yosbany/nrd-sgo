import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { DailyClosure } from '../../../domain/models/daily-closure.model';
import { DailyClosureServiceImpl } from '../../../domain/services/daily-closure.service.impl';

export function DailyClosureDetails() {
  const { id } = useParams<{ id: string }>();
  const dailyClosureService = new DailyClosureServiceImpl();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
    });
  };

  const getFields = (dailyClosure: DailyClosure) => [
    { label: 'Fecha', value: formatDate(dailyClosure.date) },
    { label: 'Total Ingresos', value: formatCurrency(dailyClosure.totalIncome) },
    { label: 'Total Gastos', value: formatCurrency(dailyClosure.totalExpenses) },
    { label: 'Diferencia Total', value: formatCurrency(dailyClosure.totalDifference) },
    { label: 'Observaciones', value: dailyClosure.observations || '-' },
    { label: 'Cantidad de Cuentas', value: dailyClosure.accounts?.length || 0 },
    { label: 'Cantidad de Transacciones', value: dailyClosure.transactions?.length || 0 },
  ];

  if (!id) return null;

  return (
    <GenericDetails<DailyClosure>
      title="Cierre Diario"
      fields={getFields}
      editPath={`/daily-closures/${id}/edit`}
      backPath="/daily-closures"
      service={dailyClosureService}
      id={id}
    />
  );
} 