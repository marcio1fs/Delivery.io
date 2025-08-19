import React from 'react';
import { orders, establishmentProfile } from '../data';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { Order, OrderStatus, OrderPlatform } from '../types';
import MotorcycleIcon from './icons/MotorcycleIcon';
import PackageIcon from './icons/PackageIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import { EstablishmentView } from '../App';


interface DashboardProps {
  setCurrentView: (view: EstablishmentView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({setCurrentView}) => {

  const activeDeliveries = orders.filter(o => o.status === OrderStatus.InProgress).length;
  const completedToday = orders.filter(o => o.status === OrderStatus.Delivered && (o.timestamp.includes('atrás') || o.timestamp.includes('andamento'))).length; // simple logic for demo
  const creditBalance = establishmentProfile.creditBalance;


  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Delivered: return 'green';
      case OrderStatus.InProgress: return 'blue';
      case OrderStatus.Pending: return 'yellow';
      case OrderStatus.Cancelled: return 'red';
      default: return 'gray';
    }
  };

  const getPlatformColor = (platform: OrderPlatform) => {
    switch(platform){
      case OrderPlatform.iFood: return 'red';
      case OrderPlatform.Rappi: return 'yellow';
      case OrderPlatform.i99: return 'blue';
      case OrderPlatform.InHouse: return 'purple';
      default: return 'gray';
    }
  };

  const OrderRow: React.FC<{ order: Order }> = ({ order }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50">
      <td className="p-4 font-mono text-sm text-gray-400">{order.id}</td>
      <td className="p-4">{order.customerName}</td>
      <td className="p-4">{order.riderName || 'N/D'}</td>
      <td className="p-4"><Badge color={getPlatformColor(order.platform)}>{order.platform}</Badge></td>
      <td className="p-4 font-medium">R$ {order.deliveryFee.toFixed(2)}</td>
      <td className="p-4">
        <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
      </td>
      <td className="p-4 text-sm text-gray-500">{order.timestamp}</td>
    </tr>
  );
  
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
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Painel</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
          Solicitar Nova Entrega
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={<MotorcycleIcon className="w-6 h-6"/>} title="Entregas Ativas" value={activeDeliveries.toString()} />
          <StatCard icon={<PackageIcon className="w-6 h-6"/>} title="Concluídas Hoje" value={completedToday.toString()} />
          <StatCard icon={<CreditCardIcon className="w-6 h-6"/>} title="Saldo de Créditos" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(creditBalance)} />
      </div>

      {/* Recent Orders Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Pedidos Recentes</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('orders'); }} className="text-blue-400 hover:text-blue-300 font-medium">Ver Todos os Pedidos</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">ID do Pedido</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Entregador</th>
                <th className="p-4">Plataforma</th>
                <th className="p-4">Taxa</th>
                <th className="p-4">Status</th>
                <th className="p-4">Horário</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => <OrderRow key={order.id} order={order} />)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;