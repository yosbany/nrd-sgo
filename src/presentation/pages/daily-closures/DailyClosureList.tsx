import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { DailyClosure } from '../../../domain/models/daily-closure.model';
import { DailyClosureServiceImpl } from '../../../domain/services/daily-closure.service.impl';

export function DailyClosureList() {
  const dailyClosureService = new DailyClosureServiceImpl();

  const columns = [
    {
      header: 'Fecha',
      accessor: 'date' as keyof DailyClosure,
      render: (item: DailyClosure) => new Date(item.date).toLocaleDateString(),
    },
    {
      header: 'Total Ingresos',
      accessor: 'totalIncome' as keyof DailyClosure,
      render: (item: DailyClosure) => `$${item.totalIncome.toFixed(2)}`,
    },
    {
      header: 'Total Gastos',
      accessor: 'totalExpenses' as keyof DailyClosure,
      render: (item: DailyClosure) => `$${item.totalExpenses.toFixed(2)}`,
    },
    {
      header: 'Diferencia Total',
      accessor: 'totalDifference' as keyof DailyClosure,
      render: (item: DailyClosure) => `$${item.totalDifference.toFixed(2)}`,
    },
    {
      header: 'Cuentas',
      accessor: 'accounts' as keyof DailyClosure,
      render: (item: DailyClosure) => item.accounts.length,
    },
    {
      header: 'Transacciones',
      accessor: 'transactions' as keyof DailyClosure,
      render: (item: DailyClosure) => item.transactions?.length || 0,
    },
  ];

  return (
    <GenericList<DailyClosure>
      columns={columns}
      title="Cierres Diarios"
      addPath="/daily-closures/new"
      backPath="/daily-closures"
      service={dailyClosureService}
    />
  );
} 