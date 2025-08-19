import React, { useState } from 'react';
import { integrations as initialIntegrations } from '../../data';
import { Integration, IntegrationStatus } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import IntegrationSettingsModal from './IntegrationSettingsModal';


const AdminIntegrations: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleManageClick = (integration: Integration) => {
        setSelectedIntegration(integration);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedIntegration(null);
    };
    
    const handleSave = (updatedIntegration: Integration) => {
        setIntegrations(integrations.map(i => i.id === updatedIntegration.id ? updatedIntegration : i));
        handleCloseModal();
    };

    const getStatusColor = (status: IntegrationStatus) => {
        switch (status) {
            case IntegrationStatus.Connected: return 'green';
            case IntegrationStatus.Pending: return 'yellow';
            case IntegrationStatus.NotConnected:
            default: return 'gray';
        }
    };
    
    const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => (
        <Card className="flex flex-col text-center items-center transform hover:-translate-y-1 transition-transform duration-300">
            <img 
              src={integration.logo} 
              alt={`${integration.name} logo`}
              className="w-16 h-16 rounded-full object-contain mb-4 bg-white p-1 border-2 border-gray-700"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64'; }} // Fallback image
            />
            <h3 className="text-lg font-bold">{integration.name}</h3>
            <p className="text-sm text-gray-400 mt-1 mb-4 flex-grow">{integration.description}</p>
            <div className="mb-4">
                 <Badge color={getStatusColor(integration.status)}>{integration.status}</Badge>
            </div>
            <button 
                onClick={() => handleManageClick(integration)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                {integration.status === IntegrationStatus.NotConnected ? 'Conectar' : 'Gerenciar'}
            </button>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Integrações da Plataforma</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {integrations.map(integration => (
                    <IntegrationCard key={integration.id} integration={integration} />
                ))}
            </div>

            {selectedIntegration && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={`Configurar ${selectedIntegration.name}`}
                >
                    <IntegrationSettingsModal 
                        integration={selectedIntegration}
                        onSave={handleSave}
                        onClose={handleCloseModal}
                    />
                </Modal>
            )}
        </div>
    );
};

export default AdminIntegrations;