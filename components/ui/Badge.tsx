import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'purple';
}

const Badge: React.FC<BadgeProps> = ({ children, color }) => {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400 border border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    red: 'bg-red-500/20 text-red-400 border border-red-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${colorClasses[color]}`}>
      {children}
    </span>
  );
};

export default Badge;