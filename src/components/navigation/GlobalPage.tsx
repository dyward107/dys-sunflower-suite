// GLOBAL PAGE WRAPPER - TIER 1 NAVIGATION
// Wrapper component for all global (practice-wide) pages
// Provides consistent layout and breadcrumb navigation

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { sunflowerTheme } from '../../styles/sunflowerTheme';

interface GlobalPageProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  showBackButton?: boolean;
}

export const GlobalPage: React.FC<GlobalPageProps> = ({ 
  title, 
  icon, 
  children, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  const handleBackToCases = () => {
    navigate('/cases');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      {showBackButton && (
        <nav className="text-sm text-sunflower-brown/60">
          <button
            onClick={handleBackToCases}
            className="hover:text-sunflower-gold transition-colors"
          >
            Case Manager
          </button>
          <span className="mx-2">›</span>
          <span className="text-sunflower-brown font-medium">{title}</span>
        </nav>
      )}

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-3xl">{icon}</span>
        <div>
          <h2 className={sunflowerTheme.typography.styles.pageTitle}>
            {title}
          </h2>
          <p className={`${sunflowerTheme.typography.styles.muted} text-sm mt-1`}>
            Practice-wide feature
          </p>
        </div>
      </div>

      {/* Page Content */}
      <div className={sunflowerTheme.containers.card + ' p-6'}>
        {children}
      </div>
    </div>
  );
};