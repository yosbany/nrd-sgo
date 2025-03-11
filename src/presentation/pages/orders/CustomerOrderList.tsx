import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { OrderStatus } from '@/domain/models/base.entity';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';

export function CustomerOrderList() {
  const orderService = new CustomerOrderServiceImpl();
  const customerService = new CustomerServiceImpl();
  const productService = new ProductServiceImpl();
  const recipeService = new RecipeServiceImpl();
  
  const [customers, setCustomers] = React.useState<Record<string, string>>({});
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, productsData, recipesData] = await Promise.all([
          customerService.findAll(),
          productService.findAll(),
          recipeService.findAll()
        ]);

        const customersMap = customersData.reduce((acc, customer) => {
          acc[customer.id] = customer.name;
          return acc;
        }, {} as Record<string, string>);

        setCustomers(customersMap);
        setProducts(productsData);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

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
      type: 'date' as const,
    },
    {
      header: 'Total Productos/Recetas',
      accessor: 'totalProducts' as keyof CustomerOrder,
    },
    {
      header: 'Total Items',
      accessor: 'totalItems' as keyof CustomerOrder,
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof CustomerOrder,
      type: 'tag' as const,
      tags: [
        { 
          value: OrderStatus.PENDING, 
          label: 'Pendiente', 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.COMPLETED, 
          label: 'Completada', 
          color: 'success' as const 
        }
      ]
    },
  ];

  return (
    <GenericList<CustomerOrder>
      columns={columns}
      title="Pedidos de Clientes"
      addPath="/customer-orders/new"
      backPath="/customer-orders"
      service={orderService}
      type="customer"
      products={products}
      recipes={recipes}
      customerName={customers}
    />
  );
} 