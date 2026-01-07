// ============================================
// RANKING CARD COMPONENT
// ============================================

import React from 'react';
import { RankingCardProps } from '@/types/ranking';

export const RankingCard: React.FC<RankingCardProps> = ({
  title,
  subtitle,
  value,
  details,
  icon,
  date,
  route,
  aircraft,
  category,
  animationDelay = '0s',
  onClick
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3 bg-muted/20 rounded-lg flight-item mobile-slide-up ${onClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''}`}
      style={{ animationDelay }}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-readable-muted">{subtitle}</p>
        {details && (
          <p className="text-xs text-readable-muted mt-1 truncate">{details}</p>
        )}
        {(date || route || aircraft) && (
          <div className="text-xs text-readable-muted mt-1">
            {date && <span className="mr-2">{date}</span>}
            {route && <span className="mr-2">{route}</span>}
            {aircraft && <span>{aircraft}</span>}
          </div>
        )}
        {category && (
          <p className="text-xs text-readable-muted mt-1">{category}</p>
        )}
      </div>
      <div className="text-right ml-3">
        <p className="font-bold text-primary font-mono">{value}</p>
        {icon && <div className="mt-1">{icon}</div>}
      </div>
    </div>
  );
};
