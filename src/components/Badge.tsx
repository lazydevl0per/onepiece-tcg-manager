import React from 'react';

interface BadgeProps {
  type?: 'Leader' | 'Character' | 'Event' | 'Stage' | string;
  rarity?: string;
  children?: React.ReactNode;
}

const typeClassMap: Record<string, string> = {
  'Leader': 'badge badge-leader',
  'Character': 'badge badge-character',
  'Event': 'badge badge-event',
  'Stage': 'badge badge-stage',
};

const rarityClassMap: Record<string, string> = {
  'SR': 'badge badge-sr',
  'SEC': 'badge badge-sec',
  'L': 'badge badge-l',
  'C': 'badge badge-c',
  // Add more as needed
};

export const Badge: React.FC<BadgeProps> = ({ type, rarity, children }) => {
  let className = type && typeClassMap[type] ? typeClassMap[type] : 'badge';
  if (rarity && rarityClassMap[rarity]) {
    className = rarityClassMap[rarity];
  }
  return <span className={className}>{children || type || rarity}</span>;
};

export default Badge; 