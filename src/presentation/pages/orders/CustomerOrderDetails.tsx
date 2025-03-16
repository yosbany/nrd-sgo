import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { CustomerOrder } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { Product } from '../../../domain/models/product.model';
import { Recipe } from '../../../domain/models/recipe.model';
import { OrderStatusLabel } from '@/domain/enums/order-status.enum';
import { TypeInventory } from '@/domain/enums/type-inventory.enum';

export function CustomerOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const orderService = new CustomerOrderServiceImpl();
  const customerService = new CustomerServiceImpl();
  const productService = new ProductServiceImpl();
  const recipeService = new RecipeServiceImpl();
  const unitService = new UnitServiceImpl();
  const [customers, setCustomers] = React.useState<Record<string, string>>({});
  const [products, setProducts] = React.useState<Record<string, Product>>({});
  const [recipes, setRecipes] = React.useState<Record<string, Recipe>>({});
  const [units, setUnits] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const loadData = async () => {
      const [customersData, productsData, recipesData, unitsData] = await Promise.all([
        customerService.findAll(),
        productService.findAll(),
        recipeService.findAll(),
        unitService.findAll()
      ]);

      const customersMap = customersData.reduce<Record<string, string>>((acc, customer) => ({
        ...acc,
        [customer.id as string]: customer.name
      }), {});

      const productsMap = productsData.reduce<Record<string, Product>>((acc, product) => ({
        ...acc,
        [product.id as string]: product
      }), {});

      const recipesMap = recipesData.reduce<Record<string, Recipe>>((acc, recipe) => ({
        ...acc,
        [recipe.id as string]: recipe
      }), {});

      const unitsMap = unitsData.reduce<Record<string, string>>((acc, unit) => ({
        ...acc,
        [unit.id as string]: unit.name
      }), {});

      setCustomers(customersMap);
      setProducts(productsMap);
      setRecipes(recipesMap);
      setUnits(unitsMap);
    };
    loadData();
  }, []);

  const renderItems = (items: CustomerOrder['items']) => {
    const columns = [
      {
        header: 'Item',
        accessor: (item: CustomerOrder['items'][0]) => {
          let name = '';
          if (item.typeItem === TypeInventory.PRODUCTO) {
            const product = products[item.itemId];
            name = product?.name || 'Producto no encontrado';
          } else if (item.typeItem === TypeInventory.RECETA) {
            const recipe = recipes[item.itemId];
            name = recipe?.name || 'Receta no encontrada';
          }
          return <div className="font-medium">{name}</div>;
        }
      },
      {
        header: 'Tipo',
        accessor: (item: CustomerOrder['items'][0]) => {
          return item.typeItem === TypeInventory.PRODUCTO ? 'Producto' : 'Receta';
        }
      },
      {
        header: 'Cantidad',
        accessor: (item: CustomerOrder['items'][0]) => {
          let unitName = 'Unidad';
          if (item.typeItem === TypeInventory.PRODUCTO) {
            const product = products[item.itemId];
            unitName = product?.salesUnitId ? units[product.salesUnitId] || 'Unidad' : 'Unidad';
          } else if (item.typeItem === TypeInventory.RECETA) {
            const recipe = recipes[item.itemId];
            unitName = recipe?.yieldUnitId ? units[recipe.yieldUnitId] || 'Unidad' : 'Unidad';
          }
          return `${item.quantity} ${unitName}`;
        }
      }
    ];

    return <ArrayTable data={items} columns={columns} emptyMessage="No hay items" />;
  };

  const getFields = (order: CustomerOrder) => [
    { label: 'Cliente', value: customers[order.customerId] },
    { label: 'Estado', value: OrderStatusLabel[order.status] },
    { label: 'Fecha', value: new Date(order.orderDate).toLocaleDateString() },
    { label: 'Total de Items', value: order.totalItems },
    { label: 'Total de Productos', value: order.totalProducts },
    { label: 'Items', value: renderItems(order.items) },
    
  ];

  if (!id) return null;

  return (
    <GenericDetails<CustomerOrder>
      title="Pedido de Cliente"
      fields={getFields}
      editPath={`/customer-orders/${id}/edit`}
      backPath="/customer-orders"
      service={orderService}
      id={id}
    />
  );
} 