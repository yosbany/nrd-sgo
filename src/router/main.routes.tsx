import { Route } from 'react-router-dom';
import { CustomerList } from '../presentation/pages/customers/CustomerList';
import { CustomerForm } from '../presentation/pages/customers/CustomerForm';
import { CustomerDetails } from '../presentation/pages/customers/CustomerDetails';
import { SupplierList } from '../presentation/pages/suppliers/SupplierList';
import { SupplierForm } from '../presentation/pages/suppliers/SupplierForm';
import { SupplierDetails } from '../presentation/pages/suppliers/SupplierDetails';
import { WorkerList } from '../presentation/pages/workers/WorkerList';
import { WorkerForm } from '../presentation/pages/workers/WorkerForm';
import { WorkerDetails } from '../presentation/pages/workers/WorkerDetails';
import { RoleList } from '../presentation/pages/roles/RoleList';
import { RoleForm } from '../presentation/pages/roles/RoleForm';
import { RoleDetails } from '../presentation/pages/roles/RoleDetails';
import { UnitList } from '../presentation/pages/units/UnitList';
import { UnitForm } from '../presentation/pages/units/UnitForm';
import { UnitDetails } from '../presentation/pages/units/UnitDetails';
import { ParameterList } from '../presentation/pages/parameters/ParameterList';
import { ParameterForm } from '../presentation/pages/parameters/ParameterForm';
import { ParameterDetails } from '../presentation/pages/parameters/ParameterDetails';
import { PurchaseOrderList } from '../presentation/pages/purchases/PurchaseOrderList';
import { PurchaseOrderForm } from '../presentation/pages/purchases/PurchaseOrderForm';
import { PurchaseOrderDetails } from '../presentation/pages/purchases/PurchaseOrderDetails';
import { CustomerOrderList } from '../presentation/pages/orders/CustomerOrderList';
import { CustomerOrderForm } from '../presentation/pages/orders/CustomerOrderForm';
import { CustomerOrderDetails } from '../presentation/pages/orders/CustomerOrderDetails';
import { ProductionOrderList } from '../presentation/pages/production/ProductionOrderList';
import { ProductionOrderForm } from '../presentation/pages/production/ProductionOrderForm';
import { ProductionOrderDetails } from '../presentation/pages/production/ProductionOrderDetails';
import { RecipeList } from '../presentation/pages/recipes/RecipeList';
import { RecipeForm } from '../presentation/pages/recipes/RecipeForm';
import { RecipeDetails } from '../presentation/pages/recipes/RecipeDetails';
import { ProductList } from '../presentation/pages/products/ProductList';
import { ProductForm } from '../presentation/pages/products/ProductForm';
import { ProductDetails } from '../presentation/pages/products/ProductDetails';
import { IncidentList } from '../presentation/pages/incidents/IncidentList';
import { IncidentForm } from '../presentation/pages/incidents/IncidentForm';
import { IncidentDetails } from '../presentation/pages/incidents/IncidentDetails';
import { DailyClosureList } from '../presentation/pages/daily-closures/DailyClosureList';
import { DailyClosureForm } from '../presentation/pages/daily-closures/DailyClosureForm';
import { DailyClosureDetails } from '../presentation/pages/daily-closures/DailyClosureDetails';
import DashboardPage from '@/presentation/pages/dashboard/DashboardPage';

export const mainRoutes = (
  <>
    {/* Dashboard */}
    <Route path="dashboard" element={<DashboardPage />} />
    
    {/* Customer Routes */}
    <Route path="customers" element={<CustomerList />} />
    <Route path="customers/new" element={<CustomerForm />} />
    <Route path="customers/:id" element={<CustomerDetails />} />
    <Route path="customers/:id/edit" element={<CustomerForm />} />

    {/* Supplier Routes */}
    <Route path="suppliers" element={<SupplierList />} />
    <Route path="suppliers/new" element={<SupplierForm />} />
    <Route path="suppliers/:id" element={<SupplierDetails />} />
    <Route path="suppliers/:id/edit" element={<SupplierForm />} />

    {/* Worker Routes */}
    <Route path="workers" element={<WorkerList />} />
    <Route path="workers/new" element={<WorkerForm />} />
    <Route path="workers/:id" element={<WorkerDetails />} />
    <Route path="workers/:id/edit" element={<WorkerForm />} />

    {/* Role Routes */}
    <Route path="roles" element={<RoleList />} />
    <Route path="roles/new" element={<RoleForm />} />
    <Route path="roles/:id" element={<RoleDetails />} />
    <Route path="roles/:id/edit" element={<RoleForm />} />

    {/* Unit Routes */}
    <Route path="units" element={<UnitList />} />
    <Route path="units/new" element={<UnitForm />} />
    <Route path="units/:id" element={<UnitDetails />} />
    <Route path="units/:id/edit" element={<UnitForm />} />

    {/* Parameter Routes */}
    <Route path="parameters" element={<ParameterList />} />
    <Route path="parameters/new" element={<ParameterForm />} />
    <Route path="parameters/:id" element={<ParameterDetails />} />
    <Route path="parameters/:id/edit" element={<ParameterForm />} />

    {/* Purchase Routes */}
    <Route path="purchase-orders" element={<PurchaseOrderList />} />
    <Route path="purchase-orders/new" element={<PurchaseOrderForm />} />
    <Route path="purchase-orders/:id" element={<PurchaseOrderDetails />} />
    <Route path="purchase-orders/:id/edit" element={<PurchaseOrderForm />} />

    {/* Order Routes */}
    <Route path="customer-orders" element={<CustomerOrderList />} />
    <Route path="customer-orders/new" element={<CustomerOrderForm />} />
    <Route path="customer-orders/:id" element={<CustomerOrderDetails />} />
    <Route path="customer-orders/:id/edit" element={<CustomerOrderForm />} />

    {/* Production Routes */}
    <Route path="production-orders" element={<ProductionOrderList />} />
    <Route path="production-orders/new" element={<ProductionOrderForm />} />
    <Route path="production-orders/:id" element={<ProductionOrderDetails />} />
    <Route path="production-orders/:id/edit" element={<ProductionOrderForm />} />

    {/* Recipe Routes */}
    <Route path="recipes" element={<RecipeList />} />
    <Route path="recipes/new" element={<RecipeForm />} />
    <Route path="recipes/:id" element={<RecipeDetails />} />
    <Route path="recipes/:id/edit" element={<RecipeForm />} />

    {/* Product Routes */}
    <Route path="products" element={<ProductList />} />
    <Route path="products/new" element={<ProductForm />} />
    <Route path="products/:id" element={<ProductDetails />} />
    <Route path="products/:id/edit" element={<ProductForm />} />

    {/* Incident Routes */}
    <Route path="incidents" element={<IncidentList />} />
    <Route path="incidents/new" element={<IncidentForm />} />
    <Route path="incidents/:id" element={<IncidentDetails />} />
    <Route path="incidents/:id/edit" element={<IncidentForm />} />

    {/* Daily Closure Routes */}
    <Route path="daily-closures" element={<DailyClosureList />} />
    <Route path="daily-closures/new" element={<DailyClosureForm />} />
    <Route path="daily-closures/:id" element={<DailyClosureDetails />} />
    <Route path="daily-closures/:id/edit" element={<DailyClosureForm />} />
  </>
); 