import React, { useState } from 'react';
import { riders as initialRiders } from '../../data';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Switch from '../ui/Switch';
import { Rider, RiderStatus } from '../../types';

const AdminRiders: React.FC = () => {
    const [riders, setRiders] = useState<Rider[]>(initialRiders);

    const handleBlockToggle = (riderId: string, isBlocked: boolean) => {
        setRiders(
            riders.map(r => 
                r.id === riderId ? { ...r, isBlocked } : r
            )
        );
    };

    const getStatusColor = (status: RiderStatus, isBlocked?: boolean) => {
        if (isBlocked) return 'red';
        switch (status) {
            case RiderStatus.Online: return 'green';
            case RiderStatus.Delivering: return 'blue';
            case RiderStatus.Offline: return 'gray';
            default: return 'gray';
        }
    };
    
    const RiderRow: React.FC<{ rider: Rider }> = ({ rider }) => (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50">
            <td className="p-4">
                <div className="flex items-center space-x-4">
                    <img className="w-10 h-10 rounded-full object-cover" src={rider.avatar} alt={rider.name} />
                    <div>
                        <p className={`font-semibold ${rider.isBlocked ? 'text-gray-500 line-through' : ''}`}>{rider.name}</p>
                        <p className="text-sm text-gray-400 font-mono">{rider.id}</p>
                    </div>
                </div>
            </td>
            <td className="p-4">
                <Badge color={getStatusColor(rider.status, rider.isBlocked)}>
                    {rider.isBlocked ? 'Bloqueado' : rider.status}
                </Badge>
            </td>
            <td className="p-4">{rider.deliveries}</td>
            <td className="p-4">
                <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">&#9733;</span>
                    <span>{rider.rating.toFixed(1)}</span>
                </div>
            </td>
            <td className="p-4">
                <Switch 
                    checked={rider.isBlocked || false} 
                    onChange={(checked) => handleBlockToggle(rider.id, checked)}
                    ariaLabel={`Bloquear ${rider.name}`}
                />
            </td>
        </tr>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Gerenciar Entregadores</h2>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Entregador</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Entregas (Mês)</th>
                                <th className="p-4">Avaliação</th>
                                <th className="p-4">Bloquear</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riders.map(rider => <RiderRow key={rider.id} rider={rider} />)}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminRiders;