
import React from 'react';
import { establishments } from '../data';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { Establishment, EstablishmentStatus } from '../types';

const Establishments: React.FC = () => {
    const getStatusColor = (status: EstablishmentStatus) => {
        return status === EstablishmentStatus.Open ? 'green' : 'red';
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
                <Badge color={getStatusColor(establishment.status)}>{establishment.status}</Badge>
            </td>
            <td className="p-4 font-semibold text-green-400">R$ {establishment.revenue.toFixed(2)}</td>
            <td className="p-4">
                <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">&#9733;</span>
                    <span>{establishment.rating.toFixed(1)}</span>
                </div>
            </td>
             <td className="p-4">
                <button className="text-blue-400 hover:text-blue-300 font-medium">Gerenciar</button>
            </td>
        </tr>
    );

    return (
        <div className="space-y-8">
            <Card>
                <h3 className="text-xl font-bold mb-4">Todos os Estabelecimentos</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Estabelecimento</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Receita Total</th>
                                <th className="p-4">Avaliação</th>
                                <th className="p-4">Ações</th>
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

export default Establishments;