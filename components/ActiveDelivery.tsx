
import React, { useState } from 'react';
import { Order } from '../types';
import Card from './ui/Card';
import MapPinIcon from './icons/MapPinIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface ActiveDeliveryProps {
  delivery: Order;
  onComplete: (delivery: Order) => void;
}

type DeliveryStage = 'accepted' | 'at_pickup' | 'picked_up' | 'at_destination' | 'delivered';

const ActiveDelivery: React.FC<ActiveDeliveryProps> = ({ delivery, onComplete }) => {
  const [stage, setStage] = useState<DeliveryStage>('accepted');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCodeSubmit = (expectedCode: string, nextStage: DeliveryStage) => {
    if (code === expectedCode) {
      setStage(nextStage);
      setCode('');
      setError('');
    } else {
      setError('Código inválido. Tente novamente.');
    }
  };

  const renderStageContent = () => {
    switch (stage) {
      case 'accepted':
        return (
          <>
            <h3 className="text-lg font-bold">Vá para o local de coleta</h3>
            <p className="text-gray-400">{delivery.pickupAddress}</p>
            <button onClick={() => setStage('at_pickup')} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
              Cheguei para Coleta
            </button>
          </>
        );
      case 'at_pickup':
        return (
          <>
            <h3 className="text-lg font-bold">Insira o Código de Coleta</h3>
            <p className="text-gray-400">Peça o código de 4 dígitos no estabelecimento.</p>
            <input 
              type="tel"
              maxLength={4}
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              className="w-full mt-4 bg-gray-900 border-2 border-gray-600 text-white text-center text-2xl tracking-[1em] rounded-lg p-3 focus:border-blue-500 focus:outline-none"
              placeholder="----"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <button onClick={() => handleCodeSubmit(delivery.pickupCode!, 'picked_up')} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
              Confirmar Coleta
            </button>
          </>
        );
      case 'picked_up':
          return (
             <>
                <h3 className="text-lg font-bold">Vá para o local de entrega</h3>
                <p className="text-gray-400">{delivery.deliveryAddress}</p>
                <button onClick={() => setStage('at_destination')} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                Cheguei para Entrega
                </button>
             </>
          );
      case 'at_destination':
          return (
            <>
              <h3 className="text-lg font-bold">Insira o Código de Entrega</h3>
              <p className="text-gray-400">Peça o código de 4 dígitos ao cliente.</p>
              <input
                type="tel"
                maxLength={4}
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); }}
                className="w-full mt-4 bg-gray-900 border-2 border-gray-600 text-white text-center text-2xl tracking-[1em] rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                placeholder="----"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              <button onClick={() => handleCodeSubmit(delivery.deliveryCode!, 'delivered')} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                Confirmar Entrega
              </button>
            </>
          );
      case 'delivered':
          return (
            <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Entrega Concluída!</h3>
                <p className="text-gray-400 text-lg mt-2">Você ganhou <span className="font-bold text-green-400">R$ {delivery.earnings!.toFixed(2)}</span></p>
                <button onClick={() => onComplete(delivery)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Ver Novas Corridas
                </button>
            </div>
          );
    }
  };


  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Entrega Ativa</h2>
      
      <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
        <p className="text-gray-500">Simulação de GPS / Mapa</p>
      </div>

      <Card>
        <div className="flex items-start space-x-4 mb-4">
            <MapPinIcon className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm text-gray-400">Coleta</p>
                <p className="font-semibold">{delivery.pickupAddress}</p>
            </div>
        </div>
        <div className="flex items-start space-x-4">
            <MapPinIcon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm text-gray-400">Entrega</p>
                <p className="font-semibold">{delivery.deliveryAddress}</p>
            </div>
        </div>
      </Card>
      
      <Card>
        {renderStageContent()}
      </Card>

    </div>
  );
};

export default ActiveDelivery;
