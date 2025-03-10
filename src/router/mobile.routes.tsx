import { Route } from 'react-router-dom';
import { MobileDashboard } from '@/presentation/pages/mobile/dashboard/MobileDashboard';
import { MobilePurchases } from '@/presentation/pages/mobile/purchases/MobilePurchases';
import { MobilePurchaseView } from '@/presentation/pages/mobile/purchases/MobilePurchaseView';
import { MobilePurchaseForm } from '@/presentation/pages/mobile/purchases/MobilePurchaseForm';
import { MobilePurchaseDelete } from '@/presentation/pages/mobile/purchases/MobilePurchaseDelete';
import { MobileOrders } from '@/presentation/pages/mobile/orders/MobileOrders';
import { MobileOrderView } from '@/presentation/pages/mobile/orders/MobileOrderView';
import { MobileOrderForm } from '@/presentation/pages/mobile/orders/MobileOrderForm';
import { MobileOrderDelete } from '@/presentation/pages/mobile/orders/MobileOrderDelete';
import { MobileProduction } from '@/presentation/pages/mobile/production/MobileProduction';
import { MobileProductionView } from '@/presentation/pages/mobile/production/MobileProductionView';
import { MobileProductionDelete } from '@/presentation/pages/mobile/production/MobileProductionDelete';
import { MobileProductionForm } from '@/presentation/pages/mobile/production/MobileProductionForm';

// Definimos las rutas móviles de la misma manera que las principales
export const mobileRoutes = (
  <>
    {/* Mobile Dashboard */}
    <Route path="/mobile" element={<MobileDashboard />} />
    <Route path="/mobile/dashboard" element={<MobileDashboard />} />
    
    {/* Purchases Routes */}
    <Route path="/mobile/purchases" element={<MobilePurchases />} />
    <Route path="/mobile/purchases/new" element={<MobilePurchaseForm />} />
    <Route path="/mobile/purchases/:id/view" element={<MobilePurchaseView />} />
    <Route path="/mobile/purchases/:id/edit" element={<MobilePurchaseForm />} />
    <Route path="/mobile/purchases/:id/delete" element={<MobilePurchaseDelete />} />
    
    {/* Orders Routes */}
    <Route path="/mobile/orders" element={<MobileOrders />} />
    <Route path="/mobile/orders/new" element={<MobileOrderForm />} />
    <Route path="/mobile/orders/:id/view" element={<MobileOrderView />} />
    <Route path="/mobile/orders/:id/edit" element={<MobileOrderForm />} />
    <Route path="/mobile/orders/:id/delete" element={<MobileOrderDelete />} />
    
    {/* Production Routes */}
    <Route path="/mobile/production" element={<MobileProduction />} />
    <Route path="/mobile/production/new" element={<MobileProductionForm />} />
    <Route path="/mobile/production/:id/view" element={<MobileProductionView />} />
    <Route path="/mobile/production/:id/edit" element={<MobileProductionForm />} />
    <Route path="/mobile/production/:id/delete" element={<MobileProductionDelete />} />
  </>
); 