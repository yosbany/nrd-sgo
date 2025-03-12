import React from 'react';
import { GenericList } from '../../components/common/GenericList';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { OrderStatus } from '@/domain/models/order-status.enum';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';

export function CustomerOrderList() {
  const orderService = new CustomerOrderServiceImpl();
  const customerService = new CustomerServiceImpl();
  const productService = new ProductServiceImpl();
  const recipeService = new RecipeServiceImpl();
  const unitService = new UnitServiceImpl();
  
  const [customers, setCustomers] = React.useState<Record<string, string>>({});
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [units, setUnits] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, productsData, recipesData, unitsData] = await Promise.all([
          customerService.findAll(),
          productService.findAll(),
          recipeService.findAll(),
          unitService.findAll()
        ]);

        const customersMap = customersData.reduce((acc, customer) => {
          acc[customer.id] = customer.name;
          return acc;
        }, {} as Record<string, string>);

        const unitsMap = unitsData.reduce((acc, unit) => {
          acc[unit.id] = unit.name;
          return acc;
        }, {} as Record<string, string>);

        setCustomers(customersMap);
        setProducts(productsData);
        setRecipes(recipesData);
        setUnits(unitsMap);
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
      render: (item: CustomerOrder) => {
        const firstProduct = item.products?.[0];
        if (firstProduct) {
          const product = products.find(p => p.id === firstProduct.productId);
          if (product?.salesUnitId) {
            return `${item.totalItems} ${units[product.salesUnitId] || 'Unidad no encontrada'}`;
          }
        }
        const firstRecipe = item.recipes?.[0];
        if (firstRecipe) {
          const recipe = recipes.find(r => r.id === firstRecipe.recipeId);
          if (recipe?.yieldUnitId) {
            return `${item.totalItems} ${units[recipe.yieldUnitId] || 'Unidad no encontrada'}`;
          }
        }
        return item.totalItems;
      },
    },
    {
      header: 'Estado',
      accessor: 'status' as keyof CustomerOrder,
      type: 'tag' as const,
      tags: [
        { 
          value: OrderStatus.PENDIENTE, 
          label: 'Pendiente', 
          color: 'warning' as const 
        },
        { 
          value: OrderStatus.ENVIADA, 
          label: 'Enviada', 
          color: 'info' as const 
        },
        { 
          value: OrderStatus.COMPLETADA, 
          label: 'Completada', 
          color: 'success' as const 
        },
        { 
          value: OrderStatus.CANCELADA, 
          label: 'Cancelada', 
          color: 'danger' as const 
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
      units={units}
    />
  );
} 