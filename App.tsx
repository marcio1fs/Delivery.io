import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Establishment Views
import Dashboard from './components/Dashboard';
import Riders from './components/Riders';
import Financials from './components/Financials';
import Orders from './components/Orders';
import Profile from './components/Profile';
import { establishmentProfile } from './data';

// Admin Views
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEstablishments from './components/admin/AdminEstablishments';
import AdminRiders from './components/admin/AdminRiders';
import AdminIntegrations from './components/admin/AdminIntegrations';
import AdminTechStack from './components/admin/AdminTechStack';

export type EstablishmentView = 'dashboard' | 'orders' | 'riders' | 'financials' | 'profile';
export type AdminView = 'dashboard' | 'establishments' | 'riders' | 'financials' | 'settings' | 'integrations' | 'tech-stack';
export type RiderView = 'home' | 'wallet' | 'profile';
export type AppMode = 'establishment' | 'admin';

const App: React.FC = () => {
    const [appMode, setAppMode] = useState<AppMode>('establishment');
    const [currentView, setCurrentView] = useState<EstablishmentView>('dashboard');
    const [currentAdminView, setCurrentAdminView] = useState<AdminView>('dashboard');

    const renderEstablishmentView = () => {
        switch(currentView) {
            case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
            case 'orders': return <Orders />;
            case 'riders': return <Riders />;
            case 'financials': return <Financials />;
            case 'profile': return <Profile establishment={establishmentProfile}/>;
            default: return <Dashboard setCurrentView={setCurrentView} />;
        }
    }

    const renderAdminView = () => {
        switch(currentAdminView) {
            case 'dashboard': return <AdminDashboard />;
            case 'establishments': return <AdminEstablishments />;
            case 'riders': return <AdminRiders />;
            case 'integrations': return <AdminIntegrations />;
            case 'tech-stack': return <AdminTechStack />;
            // Add other admin views here
            default: return <AdminDashboard />;
        }
    }

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar 
                appMode={appMode} 
                setAppMode={setAppMode}
                currentView={appMode === 'establishment' ? currentView : currentAdminView}
                setCurrentView={appMode === 'establishment' ? setCurrentView : setCurrentAdminView}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    appMode={appMode}
                    establishmentName={establishmentProfile.name} 
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 md:p-8">
                    {appMode === 'establishment' ? renderEstablishmentView() : renderAdminView()}
                </main>
            </div>
        </div>
    );
};

export default App;