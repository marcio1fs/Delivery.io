
import React from 'react';
import { IconProps } from './IconProps';

const MotorcycleIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5.5" cy="17.5" r="2.5" />
    <circle cx="18.5" cy="17.5" r="2.5" />
    <path d="M12 17.5h-3.5l-3-6 2-3h9l2 3-3 6h-3.5Z" />
    <path d="m13 5 1-1h-4l1 1" />
  </svg>
);

export default MotorcycleIcon;
