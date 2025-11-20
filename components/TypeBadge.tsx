import React from 'react';
import { TYPE_COLORS } from '../constants';

interface TypeBadgeProps {
  type: string;
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const bgColor = TYPE_COLORS[type] || '#777';
  
  return (
    <span 
      className="px-3 py-1 rounded text-white text-xs font-bold uppercase shadow-sm tracking-wider"
      style={{ backgroundColor: bgColor, textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
    >
      {type}
    </span>
  );
};

export default TypeBadge;