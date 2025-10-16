import React from 'react';
import './TierBadges.css';

interface BadgeProps {
  size?: number;
}

export const BronzeBadge: React.FC<BadgeProps> = ({ size = 90 }) => (
  <div className="tier-badge-wrapper">
    <img 
      src="/bronze-badge.svg" 
      alt="Bronze Tier Badge" 
      style={{ 
        width: size, 
        height: size * 1.2,
        filter: 'drop-shadow(0 4px 12px rgba(205, 127, 50, 0.4))',
        transition: 'all 0.3s ease'
      }}
    />
  </div>
);

export const SilverBadge: React.FC<BadgeProps> = ({ size = 90 }) => (
  <div className="tier-badge-wrapper">
    <img 
      src="/silver-badge.svg" 
      alt="Silver Tier Badge" 
      style={{ 
        width: size, 
        height: size * 1.2,
        filter: 'drop-shadow(0 4px 12px rgba(192, 192, 192, 0.5))',
        transition: 'all 0.3s ease'
      }}
    />
  </div>
);

export const GoldBadge: React.FC<BadgeProps> = ({ size = 90 }) => (
  <div className="tier-badge-wrapper">
    <img 
      src="/gold-badge.svg" 
      alt="Gold Tier Badge" 
      style={{ 
        width: size, 
        height: size * 1.2,
        filter: 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.6))',
        transition: 'all 0.3s ease'
      }}
    />
  </div>
);

interface TierBadgeProps {
  tier: string;
  size?: number;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 90 }) => {
  const badges: Record<string, React.FC<BadgeProps>> = {
    'Bronze': BronzeBadge,
    'Silver': SilverBadge,
    'Gold': GoldBadge
  };
  
  const BadgeComponent = badges[tier] || badges['Bronze'];
  return <BadgeComponent size={size} />;
};

export default TierBadge;
