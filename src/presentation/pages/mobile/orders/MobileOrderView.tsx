import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { CustomerOrder } from '@/domain/models/customer-order.model';
import { CustomerOrderServiceImpl } from '@/domain/services/customer-order.service.impl';
import { CustomerServiceImpl } from '@/domain/services/customer.service.impl';
import { ProductServiceImpl } from '@/domain/services/product.service.impl';
import { RecipeServiceImpl } from '@/domain/services/recipe.service.impl';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderStatus } from '@/domain/models/base.entity';

export const MobileOrderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<CustomerOrder | null>(null);
  const [customers, setCustomers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = React.useState<Array<{ id: string; name: string }>>([]);
  const [recipes, setRecipes] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        const [orderData, customersData, productsData, recipesData] = await Promise.all([
          new CustomerOrderServiceImpl().findById(id),
          new CustomerServiceImpl().findAll(),
          new ProductServiceImpl().findAll(),
          new RecipeServiceImpl().findAll()
        ]);

        setOrder(orderData);
        setCustomers(customersData);
        setProducts(productsData);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const formatDate = (date: Date | string | { seconds: number, nanoseconds: number }) => {
    try {
      if (!date) return 'Fecha no disponible';

      let dateObj: Date;

      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = parseISO(date);
      } else if (typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date(date.seconds * 1000);
      } else {
        throw new Error('Invalid date format');
      }

      if (!isNaN(dateObj.getTime())) {
        return format(dateObj, 'PPP', { locale: es });
      }
      
      return 'Fecha inválida';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-500 bg-yellow-500/10';
      case OrderStatus.COMPLETED:
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.COMPLETED:
        return 'Completado';
      default:
        return status;
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'No asignado';
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  };

  const getRecipeName = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    return recipe?.name || 'Receta no encontrada';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Pedido no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Estado</span>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha del Pedido</span>
            <span>{formatDate(order.orderDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente</span>
            <span>{getCustomerName(order.customerId)}</span>
          </div>
        </CardContent>
      </Card>

      {order.products && order.products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {getProductName(product.productId)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cantidad: {product.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {order.recipes && order.recipes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recetas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.recipes.map((recipe, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {getRecipeName(recipe.recipeId)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cantidad: {recipe.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 