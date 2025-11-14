// NAVIGATION LAYOUT - Main wrapper with Two-Tier Navigation
// Tier 1: Global top bar (always visible)
// Tier 2: Case-specific sidebar (when case selected)

import React from 'react';
import { GlobalNavBar } from './GlobalNavBar';
import { CaseSidebar } from './CaseSidebar';
import { useCaseStore } from '../../stores/caseStore';
import { sunflowerTheme } from '../../styles/sunflowerTheme';

interface NavigationLayoutProps {
  children: React.ReactNode;
}

export const NavigationLayout: React.FC<NavigationLayoutProps> = ({ children }) => {
  const { selectedCase } = useCaseStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunflower-cream via-sunflower-beige to-[#FFF2C0]">
      {/* TIER 1: Global Navigation Bar (Always Visible) */}
      <GlobalNavBar />

      <div className="flex">
        {/* TIER 2: Case-Specific Sidebar (Conditional) */}
        {selectedCase && (
          <CaseSidebar case={selectedCase} />
        )}

        {/* Main Content Area */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            selectedCase ? 'ml-0' : 'ml-0'
          } mt-0`}
        >
          <div className="relative min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NavigationLayout;
