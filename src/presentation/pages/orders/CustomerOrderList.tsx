import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';

export function CustomerOrderList() {
  const orderService = new CustomerOrderServiceImpl();
  const customerService = new CustomerServiceImpl();
  const [customers, setCustomers] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadCustomers = async () => {
      const customersData = await customerService.findAll();
      const customersMap = customersData.reduce((acc, customer) => {
        acc[customer.id] = customer.name;
        return acc;
      }, {} as Record<string, string>);
      setCustomers(customersMap);
    };
    loadCustomers();
  }, []);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.COMPLETED:
        return 'Completada';
      default:
        return status;
    }
  };

  const columns = [
    {
      header: 'Cliente',
      accessor: 'customerId' as keyof CustomerOrder,
      render: (item: CustomerOrder) =>
        customers[item.customerId] || 'Cliente no encontrado',
    },
    {
      header: 'Fecha',
      accessor: 'orderDate' as keyof CustomerOrder,
      render: (item: CustomerOrder) =>
        new Date(item.orderDate).toLocaleDateString(),
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof CustomerOrder,
      render: (item: CustomerOrder) => getStatusLabel(item.status),
    },
    {
      header: 'Total Productos',
      accessor: 'totalProducts' as keyof CustomerOrder,
    },
    {
      header: 'Total Items',
      accessor: 'totalItems' as keyof CustomerOrder,
    },
  ];

  return (
    <GenericList<CustomerOrder>
      columns={columns}
      title="Pedidos de Clientes"
      addPath="/customer-orders/new"
      backPath="/customer-orders"
      service={orderService}
    />
  );
} 