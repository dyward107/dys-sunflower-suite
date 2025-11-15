// MAIN LAYOUT - Primary application structure
// Includes LeftSidebar (Tier 1) and content area for Tier 2 + main content

import React from 'react';
import { LeftSidebar } from '../navigation/LeftSidebar';
import { GlobalTimerBar } from '../moduleB/GlobalTimerBar';
import '../../styles/design-system.css';

interface MainLayoutProps {
  children: React.ReactNode;
  showCaseTabs?: boolean;
  caseTabsComponent?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showCaseTabs = false,
  caseTabsComponent 
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      {/* Left Sidebar - Tier 1 Navigation */}
      <LeftSidebar />

      {/* Main Content Area */}
      <div 
        style={{
          marginLeft: 'var(--sidebar-width)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Case Tabs - Tier 2 Navigation (conditional) */}
        {showCaseTabs && caseTabsComponent}

        {/* Content Area */}
        <main 
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: 'var(--color-bg-primary)',
          }}
        >
          {children}
        </main>

        {/* Global Timer Bar - Always visible at bottom */}
        <GlobalTimerBar />
      </div>
    </div>
  );
};

