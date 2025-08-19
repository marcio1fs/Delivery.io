import React, { useState } from 'react';
import { establishments as initialEstablishments } from '../../data';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Switch from '../ui/Switch';
import { Establishment, EstablishmentStatus } from '../../types';

const AdminEstablishments: React.FC = () => {
    const [establishments, setEstablishments] = useState<Establishment[]>(initialEstablishments);

    const handleBlockToggle = (establishmentId: string, isBlocked: boolean) => {
        setEstablishments(
            establishments.map(e =>
                e.id === establishmentId ? { ...e, isBlocked } : e
            )
        );
    };

    const getStatusColor = (status: EstablishmentStatus, isBlocked?: boolean) => {
        if (isBlocked) return 'red';
        return status === EstablishmentStatus.Open ? 'green' : 'gray';
    };

    const EstablishmentRow: React.FC<{ establishment: Establishment }> = ({ establishment }) => (
         <tr className="border-b border-gray-700 hover:bg-gray-800/50">
            <td className="p-4">
                <div className="flex items-center space-x-4">
                    <img className="w-10 h-10 rounded-md object-cover" src={establishment.logo} alt={establishment.name} />
                    <div>
                        <p className="font-semibold">{establishment.name}</p>
                        <p className="text-sm text-gray-400">{establishment.address}</p>
                    </div>
                </div>
            </td>
            <td className="p-4">{establishment.category}</td>
            <td className="p-4">
                <Badge color={getStatusColor(establishment.status, establishment.isBlocked)}>
                    {establishment.isBlocked ? 'Bloqueado' : establishment.status}
                </Badge>
            </td>
            <td className="p-4 font-semibold text-green-400">R$ {establishment.revenue.toFixed(2)}</td>
            <td className="p-4">
                <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">&#9733;</span>
                    <span>{establishment.rating.toFixed(1)}</span>
                </div>
            </td>
             <td className="p-4">
                <div className="flex items-center space-x-4">
                    <Switch 
                        checked={establishment.isBlocked || false} 
                        onChange={(checked) => handleBlockToggle(establishment.id, checked)}
                        ariaLabel={`Bloquear ${establishment.name}`}
                    />
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Gerenciar Estabelecimentos</h2>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Estabelecimento</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Receita Total</th>
                                <th className="p-4">Avaliação</th>
                                <th className="p-4">Bloquear</th>
                            </tr>
                        </thead>
                        <tbody>
                            {establishments.map(est => <EstablishmentRow key={est.id} establishment={est} />)}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminEstablishments;