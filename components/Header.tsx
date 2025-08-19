import React from 'react';
import SearchIcon from './icons/SearchIcon';
import { AppMode } from '../App';

interface HeaderProps {
  establishmentName: string;
  appMode: AppMode;
}

const Header: React.FC<HeaderProps> = ({ establishmentName, appMode }) => {
  
  const title = appMode === 'admin' ? 'Painel do Administrador' : establishmentName;
  const userImage = appMode === 'admin' 
    ? `https://i.pravatar.cc/150?u=admin`
    : `https://logo.clearbit.com/burgerking.com`;
  const userAlt = appMode === 'admin' ? 'Admin' : establishmentName;

  return (
    <header className="h-20 bg-gray-900 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-800">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 w-64 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-700">
          <img src={userImage} alt={userAlt} className="w-full h-full rounded-full object-cover p-1"/>
        </div>
      </div>
    </header>
  );
};

export default Header;