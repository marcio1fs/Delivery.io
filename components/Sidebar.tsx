import React from 'react';
import { AppMode, EstablishmentView, AdminView } from '../App';

import DashboardIcon from './icons/DashboardIcon';
import MotorcycleIcon from './icons/MotorcycleIcon';
import StoreIcon from './icons/StoreIcon';
import DollarSignIcon from './icons/DollarSignIcon';
import PackageIcon from './icons/PackageIcon';
import UsersIcon from './icons/UsersIcon';
import ShieldIcon from './icons/ShieldIcon';
import PlugIcon from './icons/PlugIcon';
import CodeIcon from './icons/CodeIcon';


interface SidebarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  currentView: EstablishmentView | AdminView;
  setCurrentView: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ appMode, setAppMode, currentView, setCurrentView }) => {
  const establishmentNav = [
    { id: 'dashboard', label: 'Painel', icon: DashboardIcon },
    { id: 'orders', label: 'Pedidos', icon: PackageIcon },
    { id: 'riders', label: 'Entregadores', icon: MotorcycleIcon },
    { id: 'financials', label: 'Financeiro', icon: DollarSignIcon },
    { id: 'profile', label: 'Perfil', icon: StoreIcon },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Painel', icon: DashboardIcon },
    { id: 'establishments', label: 'Estabelecimentos', icon: UsersIcon },
    { id: 'riders', label: 'Entregadores', icon: MotorcycleIcon },
    { id: 'integrations', label: 'Integrações', icon: PlugIcon },
    { id: 'tech-stack', label: 'Tecnologias', icon: CodeIcon },
  ];

  const navItems = appMode === 'establishment' ? establishmentNav : adminNav;
  const title = appMode === 'establishment' ? 'Deliver.io' : 'Deliver.io Admin';

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 hidden md:flex flex-col">
      <div className="h-20 flex items-center px-8 border-b border-gray-800">
        <MotorcycleIcon className="h-8 w-8 text-blue-500" />
        <h1 className="text-xl font-bold ml-3 text-white">{title}</h1>
      </div>
      <nav className="flex-1 px-6 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(item.id);
                }}
                className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white font-semibold shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 py-4 border-t border-gray-800">
        <button
            onClick={() => setAppMode(appMode === 'establishment' ? 'admin' : 'establishment')}
            className="w-full flex items-center justify-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
            <ShieldIcon className="h-5 w-5 mr-3"/>
            <span>{appMode === 'establishment' ? 'Painel Admin' : 'Visão do Estabelecimento'}</span>
        </button>
        <p className="text-xs text-gray-500 text-center mt-4">© 2024 Deliver.io Corp.</p>
      </div>
    </aside>
  );
};

export default Sidebar;