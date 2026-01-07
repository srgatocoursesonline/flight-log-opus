// ============================================
// RANKING SECTION COMPONENT
// ============================================

import React from 'react';
import { RankingSectionProps } from '@/types/ranking';

export const RankingSection: React.FC<RankingSectionProps> = ({
  title,
  icon,
  children,
  animationDelay = '0s'
}) => {
  return (
    <div className="hud-display stats-card mobile-slide-up p-3 lg:p-4" style={{ animationDelay }}>
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="icon-hover">{icon}</div>}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
