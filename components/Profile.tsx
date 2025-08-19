import React from 'react';
import { EstablishmentProfile } from '../types';
import Card from './ui/Card';

interface ProfileProps {
    establishment: EstablishmentProfile;
}

const Profile: React.FC<ProfileProps> = ({ establishment }) => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Perfil</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Editar Perfil
              </button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    <img src={establishment.logo} alt={establishment.name} className="w-32 h-32 rounded-lg object-cover border-4 border-gray-700 flex-shrink-0" />
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold">{establishment.name}</h3>
                        <p className="text-gray-400">{establishment.category}</p>
                        <p className="mt-4 text-gray-300">{establishment.address}</p>
                        
                        <div className="mt-6 border-t border-gray-700 pt-4">
                            <h4 className="text-lg font-semibold mb-2">Detalhes da Conta</h4>
                            <p className="text-sm text-gray-400">
                                <span className="font-semibold text-gray-200">ID da Conta:</span> {establishment.id}
                            </p>
                            <p className="text-sm text-gray-400">
                                <span className="font-semibold text-gray-200">Contato Principal:</span> {establishment.email}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Profile;