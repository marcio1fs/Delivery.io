import React from 'react';
import { platformStats } from '../../data';
import Card from '../ui/Card';
import FinancialOverviewChart from '../charts/FinancialOverviewChart';

import DollarSignIcon from '../icons/DollarSignIcon';
import PackageIcon from '../icons/PackageIcon';
import MotorcycleIcon from '../icons/MotorcycleIcon';
import StoreIcon from '../icons/StoreIcon';


const AdminDashboard: React.FC = () => {

  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
      <Card className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {icon}
          </div>
          <div>
              <p className="text-gray-400 text-sm">{title}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
          </div>
      </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Painel do Administrador</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<DollarSignIcon className="w-6 h-6"/>} title="Receita Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(platformStats.totalRevenue)} />
          <StatCard icon={<PackageIcon className="w-6 h-6"/>} title="Total de Entregas" value={platformStats.totalDeliveries.toLocaleString('pt-BR')} />
          <StatCard icon={<MotorcycleIcon className="w-6 h-6"/>} title="Entregadores Ativos" value={platformStats.activeRiders.toString()} />
          <StatCard icon={<StoreIcon className="w-6 h-6"/>} title="Estabelecimentos Parceiros" value={platformStats.partnerEstablishments.toString()} />
      </div>

      {/* Recent Orders Table */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Visão Financeira da Plataforma</h3>
        <FinancialOverviewChart />
      </Card>
    </div>
  );
};

export default AdminDashboard;