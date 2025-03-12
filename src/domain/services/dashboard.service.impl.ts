import { CustomerOrderRepositoryImpl } from '../repositories/customer-order.repository.impl';
import { ProductionOrderRepositoryImpl } from '../repositories/production-order.repository.impl';
import { PurchaseOrderRepositoryImpl } from '../repositories/purchase-order.repository.impl';
import { ProductRepositoryImpl } from '../repositories/product.repository.impl';
import { CustomerRepositoryImpl } from '../repositories/customer.repository.impl';
import { SupplierRepositoryImpl } from '../repositories/supplier.repository.impl';
import { WorkerRepositoryImpl } from '../repositories/worker.repository.impl';
import { RecipeRepositoryImpl } from '../repositories/recipe.repository.impl';
import { OrderStatus } from '../models/order-status.enum';
import { database } from '@/config/firebase';

export interface DashboardStats {
  totalInventory: number;
  totalProducts: number;
  totalRecipes: number;
  totalOrders: number;
  totalPurchases: number;
  totalProduction: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalWorkers: number;
}

export interface TopProduct {
  name: string;
  quantity: string;
  amount: string;
  trend: string;
  status: OrderStatus;
}

export interface DashboardData {
  stats: DashboardStats;
  topPurchased: TopProduct[];
  topProduced: TopProduct[];
  topOrdered: TopProduct[];
}

export class DashboardServiceImpl {
  private customerOrderRepo: CustomerOrderRepositoryImpl;
  private productionOrderRepo: ProductionOrderRepositoryImpl;
  private purchaseOrderRepo: PurchaseOrderRepositoryImpl;
  private productRepo: ProductRepositoryImpl;
  private customerRepo: CustomerRepositoryImpl;
  private supplierRepo: SupplierRepositoryImpl;
  private workerRepo: WorkerRepositoryImpl;
  private recipeRepo: RecipeRepositoryImpl;

  constructor() {
    this.customerOrderRepo = new CustomerOrderRepositoryImpl(database);
    this.productionOrderRepo = new ProductionOrderRepositoryImpl(database);
    this.purchaseOrderRepo = new PurchaseOrderRepositoryImpl(database);
    this.productRepo = new ProductRepositoryImpl(database);
    this.customerRepo = new CustomerRepositoryImpl(database);
    this.supplierRepo = new SupplierRepositoryImpl(database);
    this.workerRepo = new WorkerRepositoryImpl(database);
    this.recipeRepo = new RecipeRepositoryImpl(database);
  }

  async getDashboardData(): Promise<DashboardData> {
    const [
      products,
      customerOrders,
      productionOrders,
      purchaseOrders,
      customers,
      suppliers,
      workers,
      recipes
    ] = await Promise.all([
      this.productRepo.findAll(),
      this.customerOrderRepo.findAll(),
      this.productionOrderRepo.findAll(),
      this.purchaseOrderRepo.findAll(),
      this.customerRepo.findAll(),
      this.supplierRepo.findAll(),
      this.workerRepo.findAll(),
      this.recipeRepo.findAll()
    ]);

    console.log('Debug - Raw Data:', {
      products,
      recipes,
      customerOrders,
      productionOrders,
      purchaseOrders,
      customers,
      suppliers,
      workers
    });

    // Calcular estadísticas generales
    const productsCount = Array.isArray(products) ? products.length : 0;
    const recipesCount = Array.isArray(recipes) ? recipes.length : 0;

    console.log('Debug - Counts:', {
      productsCount,
      recipesCount,
      total: productsCount + recipesCount
    });

    const stats: DashboardStats = {
      totalProducts: productsCount,
      totalRecipes: recipesCount,
      totalInventory: productsCount + recipesCount,
      totalOrders: Array.isArray(customerOrders) ? customerOrders.length : 0,
      totalPurchases: Array.isArray(purchaseOrders) ? purchaseOrders.length : 0,
      totalProduction: Array.isArray(productionOrders) ? productionOrders.length : 0,
      totalSuppliers: Array.isArray(suppliers) ? suppliers.length : 0,
      totalCustomers: Array.isArray(customers) ? customers.length : 0,
      totalWorkers: Array.isArray(workers) ? workers.length : 0
    };

    console.log('Debug - Stats:', stats);

    // Calcular productos más comprados
    const purchaseProducts = new Map<string, { quantity: number; amount: number; count: number }>();
    purchaseOrders.forEach(order => {
      order.products?.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const current = purchaseProducts.get(product.id) || { quantity: 0, amount: 0, count: 0 };
          purchaseProducts.set(product.id, {
            quantity: current.quantity + (Number(item.quantity) || 0),
            amount: current.amount + ((Number(item.quantity) || 0) * (Number(product.purchasePrice) || 0)),
            count: current.count + 1
          });
        }
      });
    });

    // Calcular productos más producidos
    const productionRecipes = new Map<string, { quantity: number; amount: number; count: number }>();
    productionOrders.forEach(order => {
      if (order.status === OrderStatus.COMPLETADA) { // Solo contar órdenes completadas
        order.recipes?.forEach(item => {
          const recipe = recipes.find(p => p.id === item.recipeId);
          if (recipe) {
            const current = productionRecipes.get(recipe.id) || { quantity: 0, amount: 0, count: 0 };
            productionRecipes.set(recipe.id, {
              quantity: current.quantity + (Number(item.quantity) || 0),
              amount: current.amount + ((Number(item.quantity) || 0) * (Number(recipe.cost) || 0)),
              count: current.count + 1
            });
          }
        });
      }
    });

    // Calcular productos más pedidos
    const orderedProducts = new Map<string, { quantity: number; amount: number; count: number }>();
    customerOrders.forEach(order => {
      order.products?.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const current = orderedProducts.get(product.id) || { quantity: 0, amount: 0, count: 0 };
          orderedProducts.set(product.id, {
            quantity: current.quantity + (Number(item.quantity) || 0),
            amount: current.amount + ((Number(item.quantity) || 0) * (Number(product.salePrice) || 0)),
            count: current.count + 1
          });
        }
      });
    });

    // Convertir a arrays y ordenar
    const formatMoney = (amount: number) => `$${amount.toLocaleString('es-UY')}`;
    const formatQuantity = (quantity: number) => quantity.toFixed(2);
    const calculateTrend = (count: number, total: number) => `+${((count / total) * 100).toFixed(0)}%`;

    const topPurchased = Array.from(purchaseProducts.entries())
      .map(([id, data]) => {
        const product = products.find(p => p.id === id);
        return {
          name: product?.name || '',
          quantity: formatQuantity(data.quantity),
          amount: formatMoney(data.amount),
          trend: calculateTrend(data.count, purchaseOrders.length),
          status: OrderStatus.COMPLETADA
        };
      })
      .sort((a, b) => Number(b.amount.slice(1).replace(/,/g, '')) - Number(a.amount.slice(1).replace(/,/g, '')))
      .slice(0, 3);

    const topProduced = Array.from(productionRecipes.entries())
      .map(([id, data]) => {
        const recipe = recipes.find(p => p.id === id);
        return {
          name: recipe?.name || '',
          quantity: formatQuantity(data.quantity),
          amount: formatMoney(data.amount),
          trend: calculateTrend(data.count, productionOrders.length),
          status: OrderStatus.COMPLETADA
        };
      })
      .sort((a, b) => Number(b.amount.slice(1).replace(/,/g, '')) - Number(a.amount.slice(1).replace(/,/g, '')))
      .slice(0, 3);

    const topOrdered = Array.from(orderedProducts.entries())
      .map(([id, data]) => {
        const product = products.find(p => p.id === id);
        return {
          name: product?.name || '',
          quantity: formatQuantity(data.quantity),
          amount: formatMoney(data.amount),
          trend: calculateTrend(data.count, customerOrders.length),
          status: OrderStatus.COMPLETADA
        };
      })
      .sort((a, b) => Number(b.amount.slice(1).replace(/,/g, '')) - Number(a.amount.slice(1).replace(/,/g, '')))
      .slice(0, 3);

    return {
      stats,
      topPurchased,
      topProduced,
      topOrdered
    };
  }
} 