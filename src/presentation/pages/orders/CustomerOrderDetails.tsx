import React from 'react';
import { useParams } from 'react-router-dom';
import { GenericDetails } from '../../components/common/GenericDetails';
import { ArrayTable } from '../../components/common/ArrayTable';
import { CustomerOrder, ProductItem, RecipeItems } from '../../../domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '../../../domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '../../../domain/services/customer.service.impl';
import { ProductServiceImpl } from '../../../domain/services/product.service.impl';
import { RecipeServiceImpl } from '../../../domain/services/recipe.service.impl';
import { UnitServiceImpl } from '../../../domain/services/unit.service.impl';
import { Product } from '../../../domain/models/product.model';
import { Recipe } from '../../../domain/models/recipe.model';
import { OrderStatusLabel } from '@/domain/models/order-status.enum';

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

      const customersMap = customersData.reduce((acc, customer) => ({
        ...acc,
        [customer.id]: customer.name
      }), {});

      const productsMap = productsData.reduce((acc, product) => ({
        ...acc,
        [product.id]: product
      }), {});

      const recipesMap = recipesData.reduce((acc, recipe) => ({
        ...acc,
        [recipe.id]: recipe
      }), {});

      const unitsMap = unitsData.reduce((acc, unit) => ({
        ...acc,
        [unit.id]: unit.name
      }), {});

      setCustomers(customersMap);
      setProducts(productsMap);
      setRecipes(recipesMap);
      setUnits(unitsMap);
    };
    loadData();
  }, []);

  
  const renderProducts = (orderProducts: ProductItem[]) => {
    const columns = [
      {
        header: 'Producto',
        accessor: (item: ProductItem) => {
          if (item.productId) {
            const product = products[item.productId];
            return <div className="font-medium">{product?.name || 'Producto no encontrado'}</div>;
          }
          return 'Producto no especificado';
        }
      },
      {
        header: 'Cantidad',
        accessor: (item: ProductItem) => {
          if (item.productId) {
            const product = products[item.productId];
            const unitName = product?.salesUnitId ? units[product.salesUnitId] : 'Unidad no encontrada';
            return `${item.quantity} ${unitName}`;
          }
          return item.quantity;
        }
      }
    ];

    return <ArrayTable data={orderProducts} columns={columns} emptyMessage="No hay productos" />;
  };

  const renderRecipes = (orderRecipes: RecipeItems[]) => {
    const columns = [
      {
        header: 'Receta',
        accessor: (item: RecipeItems) => {
          const recipe = recipes[item.recipeId];
          return <div className="font-medium">{recipe?.name || 'Receta no encontrada'}</div>;
        }
      },
      {
        header: 'Cantidad',
        accessor: (item: RecipeItems) => {
          const recipe = recipes[item.recipeId];
          const unitName = recipe?.yieldUnitId ? units[recipe.yieldUnitId] : 'Unidad no encontrada';
          return `${item.quantity} ${unitName}`;
        }
      }
    ];

    return <ArrayTable data={orderRecipes} columns={columns} emptyMessage="No hay recetas" />;
  };

  const getFields = (order: CustomerOrder) => [
    { label: 'Cliente', value: customers[order.customerId] || 'Cliente no encontrado' },
    { label: 'Estado', value: OrderStatusLabel[order.status] },
    { label: 'Fecha', value: new Date(order.orderDate).toLocaleDateString() },
    { label: 'Productos', value: renderProducts(order.products) },
    { label: 'Recetas', value: renderRecipes(order.recipes) },
    { label: 'Total de Items', value: order.totalItems },
    { label: 'Total de Productos', value: order.totalProducts },
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