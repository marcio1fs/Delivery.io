import React, { useState } from 'react';
import { orders as allOrders } from '../data';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { Order, OrderStatus, OrderPlatform } from '../types';

type StatusFilter = 'all' | OrderStatus.Pending | OrderStatus.InProgress | 'completed';

const Orders: React.FC = () => {
    const [filter, setFilter] = useState<StatusFilter>('all');

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

    const filteredOrders = allOrders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'completed') return order.status === OrderStatus.Delivered || order.status === OrderStatus.Cancelled;
        return order.status === filter;
    });

    const OrderRow: React.FC<{ order: Order }> = ({ order }) => (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50">
            <td className="p-4 font-mono text-sm text-gray-400">{order.id}</td>
            <td className="p-4">{order.customerName}</td>
            <td className="p-4">{order.deliveryAddress}</td>
            <td className="p-4">{order.riderName || 'N/D'}</td>
            <td className="p-4"><Badge color={getPlatformColor(order.platform)}>{order.platform}</Badge></td>
            <td className="p-4">
                <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
            </td>
            <td className="p-4">
                 <button className="text-blue-400 hover:text-blue-300 font-medium">Rastrear</button>
            </td>
        </tr>
    );

    const FilterTab: React.FC<{ value: StatusFilter; label: string }> = ({ value, label }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                filter === value ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Pedidos</h2>
            </div>
            <Card>
                <div className="flex space-x-2 border-b border-gray-700 mb-4 pb-4">
                    <FilterTab value="all" label="Todos" />
                    <FilterTab value={OrderStatus.Pending} label="Pendentes" />
                    <FilterTab value={OrderStatus.InProgress} label="Em Andamento" />
                    <FilterTab value="completed" label="Concluídos" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">ID do Pedido</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Endereço</th>
                                <th className="p-4">Entregador</th>
                                <th className="p-4">Plataforma</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => <OrderRow key={order.id} order={order} />)}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Orders;