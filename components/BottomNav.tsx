import React from 'react';
import HomeIcon from './icons/HomeIcon';
import WalletIcon from './icons/WalletIcon';
import UserIcon from './icons/UserIcon';
import { RiderView } from '../App';

interface BottomNavProps {
  currentView: RiderView;
  setCurrentView: (view: RiderView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: HomeIcon },
    { id: 'wallet', label: 'Carteira', icon: WalletIcon },
    { id: 'profile', label: 'Perfil', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-800 border-t border-gray-700 flex justify-around items-center max-w-md mx-auto">
      {navItems.map((item) => (
        <a
          key={item.id}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView(item.id as RiderView);
          }}
          className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
            currentView === item.id ? 'text-blue-500' : 'text-gray-400 hover:text-white'
          }`}
        >
          <item.icon className="h-6 w-6 mb-1" />
          <span className="text-xs font-medium">{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default BottomNav;