import React, { useState } from 'react';
import { Integration, IntegrationStatus } from '../../types';

interface IntegrationSettingsModalProps {
  integration: Integration;
  onSave: (integration: Integration) => void;
  onClose: () => void;
}

const IntegrationSettingsModal: React.FC<IntegrationSettingsModalProps> = ({ integration, onSave, onClose }) => {
    const [formData, setFormData] = useState<Integration>(integration);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // If any key is filled, assume it's connected
        const newStatus = (formData.apiKey || formData.clientId || formData.webhookUrl)
            ? IntegrationStatus.Connected
            : IntegrationStatus.NotConnected;
            
        onSave({ ...formData, status: newStatus });
    };
    
    const renderField = (name: keyof Integration, label: string, placeholder: string, type: string = 'text') => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
                {label}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={formData[name] as string || ''}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-400">
                Insira as credenciais fornecidas por {integration.name} para ativar a integração.
            </p>
            
            {renderField('apiKey', 'Chave de API (API Key)', 'ex: sk_live_...')}
            {renderField('clientId', 'ID do Cliente (Client ID)', 'ex: app_...')}
            {renderField('clientSecret', 'Segredo do Cliente (Client Secret)', 'ex: 5a7b...')}
            {renderField('webhookUrl', 'URL do Webhook', 'https://api.deliver.io/webhooks/...', 'url')}

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Salvar Alterações
                </button>
            </div>
        </form>
    );
};

export default IntegrationSettingsModal;