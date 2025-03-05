import React from 'react';
import {
  Users,
  ShoppingBag,
  Package,
  AlertTriangle,
  DollarSign,
  Activity,
  Calendar,
  Clock
} from "react-feather";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Trabajadores"
          value="24"
          icon={<Users className="h-6 w-6" />}
          trend="+2.5%"
          trendUp={true}
        />
        <StatCard
          title="Órdenes"
          value="156"
          icon={<ShoppingBag className="h-6 w-6" />}
          trend="+12.3%"
          trendUp={true}
        />
        <StatCard
          title="Productos"
          value="89"
          icon={<Package className="h-6 w-6" />}
          trend="-0.8%"
          trendUp={false}
        />
        <StatCard
          title="Incidentes"
          value="3"
          icon={<AlertTriangle className="h-6 w-6" />}
          trend="-25%"
          trendUp={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Ventas Diarias"
          value="$12,458"
          trend="+8.2%"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <ChartCard
          title="Eficiencia de Producción"
          value="94.2%"
          trend="+2.1%"
          icon={<Activity className="h-6 w-6" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Actividad Reciente
          </h3>
          <div className="mt-6 flow-root">
            <ul className="-mb-8">
              <ActivityItem
                title="Nueva orden de producción"
                description="Orden #1234 creada por Juan Pérez"
                time="Hace 5 minutos"
                icon={<Calendar className="h-5 w-5" />}
              />
              <ActivityItem
                title="Incidente reportado"
                description="Mantenimiento requerido en línea 2"
                time="Hace 2 horas"
                icon={<AlertTriangle className="h-5 w-5" />}
              />
              <ActivityItem
                title="Actualización de inventario"
                description="Stock actualizado por María González"
                time="Hace 4 horas"
                icon={<Package className="h-5 w-5" />}
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}

const StatCard = ({ title, value, icon, trend, trendUp }: StatCardProps) => (
  <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
        <span className="text-white">{icon}</span>
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend}
            </div>
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

interface ChartCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

const ChartCard = ({ title, value, trend, icon }: ChartCardProps) => (
  <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="ml-2 text-sm font-medium text-green-600">{trend}</p>
        </div>
      </div>
      <div className="bg-blue-500 rounded-md p-3">
        <span className="text-white">{icon}</span>
      </div>
    </div>
    <div className="mt-6">
      {/* Aquí iría el componente de gráfico */}
      <div className="h-48 bg-gray-50 rounded"></div>
    </div>
  </div>
);

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const ActivityItem = ({ title, description, time, icon }: ActivityItemProps) => (
  <li>
    <div className="relative pb-8">
      <div className="relative flex space-x-3">
        <div>
          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white">{icon}</span>
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time>{time}</time>
          </div>
        </div>
      </div>
    </div>
  </li>
);

export default DashboardPage; 