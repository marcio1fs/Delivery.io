
import React, { useState } from 'react';
import { availableOrders } from '../data';
import { Order, OrderPlatform } from '../types';
import Card from './ui/Card';
import MotorcycleIcon from './icons/MotorcycleIcon';
import MapPinIcon from './icons/MapPinIcon';

interface HomeProps {
  setActiveDelivery: (delivery: Order) => void;
}

const platformLogos: Record<OrderPlatform, string> = {
  [OrderPlatform.iFood]: '/ifood.png',
  [OrderPlatform.Rappi]: '/rappi.png',
  [OrderPlatform.i99]: '/99.png',
  [OrderPlatform.InHouse]: '/inhouse.png',
};

const OrderCard: React.FC<{ order: Order; onAccept: (order: Order) => void }> = ({ order, onAccept }) => (
  <Card className="mb-4 !p-0 overflow-hidden">
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
                <img src={`https://logo.clearbit.com/${order.platform.toLowerCase()}.com`} alt={order.platform} className="w-6 h-6 rounded-full bg-white p-0.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                <span className="font-semibold text-lg">{order.platform}</span>
            </div>
            <div className="text-right">
                <p className="text-xl font-bold text-green-400">R$ {order.earnings!.toFixed(2)}</p>
                <p className="text-sm text-gray-400">{order.distance} km</p>
            </div>
        </div>
        <div className="space-y-3 text-gray-300">
            <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 mr-3 text-yellow-400" />
                <span><span className="font-semibold">Coleta:</span> {order.pickupAddress}</span>
            </div>
            <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 mr-3 text-blue-400" />
                <span><span className="font-semibold">Entrega:</span> {order.deliveryAddress}</span>
            </div>
        </div>
    </div>
    <button onClick={() => onAccept(order)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 transition-colors">
      Aceitar Corrida
    </button>
  </Card>
);

const Home: React.FC<HomeProps> = ({ setActiveDelivery }) => {
  const [orders, setOrders] = useState<Order[]>(availableOrders);

  const handleAccept = (acceptedOrder: Order) => {
    setActiveDelivery(acceptedOrder);
    setOrders(orders.filter(o => o.id !== acceptedOrder.id));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Corridas Disponíveis</h2>
        <p className="text-gray-400">Escolha uma corrida para começar.</p>
      </div>
      {orders.length > 0 ? (
        orders.map(order => <OrderCard key={order.id} order={order} onAccept={handleAccept} />)
      ) : (
        <Card className="text-center py-10">
            <MotorcycleIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold">Sem corridas no momento</h3>
            <p className="text-gray-400">Notificaremos você assim que novas oportunidades surgirem.</p>
        </Card>
      )}
    </div>
  );
};

export default Home;
