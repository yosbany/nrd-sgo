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
import { OrderStatusLabel, getStatusColor } from '@/domain/enums/order-status.enum';
import { TypeInventory } from '@/domain/enums/type-inventory.enum';
import { Customer } from '@/domain/models/customer.model';
import { Product } from '@/domain/models/product.model';
import { Recipe } from '@/domain/models/recipe.model';

export const MobileOrderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<CustomerOrder | null>(null);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
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

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'No asignado';
  };

  const getItemName = (itemId: string, typeItem: TypeInventory) => {
    if (typeItem === TypeInventory.PRODUCTO) {
      const product = products.find(p => p.id === itemId);
      return product?.name || 'Producto no encontrado';
    } else {
      const recipe = recipes.find(r => r.id === itemId);
      return recipe?.name || 'Receta no encontrada';
    }
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
    <div className="p-2 space-y-3 max-w-full">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pedido</span>
            <span className="text-sm font-medium">#{order.nro}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estado</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {OrderStatusLabel[order.status]}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Fecha del Pedido</span>
            <span className="text-sm">{formatDate(order.orderDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cliente</span>
            <span className="text-sm text-right">{getCustomerName(order.customerId)}</span>
          </div>
        </CardContent>
      </Card>

      {order.items && order.items.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <div className="font-medium text-base break-words">
                      {getItemName(item.itemId, item.typeItem)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cantidad:</span>
                      <span className="text-sm font-medium">{item.quantity}</span>
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