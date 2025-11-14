// TIER 2: CASE-SPECIFIC SIDEBAR
// Left sidebar - appears only when a case is selected
// Detailed case views: Overview, Parties, Policies, Contacts, etc.

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Case } from '../../types/ModuleA';
import { sunflowerTheme } from '../../styles/sunflowerTheme';

interface CaseSidebarProps {
  case: Case;
}

export const CaseSidebar: React.FC<CaseSidebarProps> = ({ case: selectedCase }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Navigation items for Tier 2 (Case-specific)
  const caseNavItems = [
    { 
      id: 'overview', 
      label: 'Case Overview', 
      path: `/cases/${selectedCase.id}`, 
      icon: '📋',
      description: 'Case details & summary'
    },
    { 
      id: 'parties', 
      label: 'Parties', 
      path: `/cases/${selectedCase.id}/parties`, 
      icon: '👥',
      description: 'Plaintiffs & defendants'
    },
    { 
      id: 'policies', 
      label: 'Policies', 
      path: `/cases/${selectedCase.id}/policies`, 
      icon: '📄',
      description: 'Insurance policies'
    },
    { 
      id: 'contacts', 
      label: 'Contacts', 
      path: `/cases/${selectedCase.id}/contacts`, 
      icon: '📞',
      description: 'Case-related contacts'
    },
    { 
      id: 'timeline', 
      label: 'Treatment Timeline', 
      path: `/cases/${selectedCase.id}/timeline`, 
      icon: '📅',
      description: 'Medical timeline'
    },
    { 
      id: 'chronology', 
      label: 'Case Chronology', 
      path: `/cases/${selectedCase.id}/chronology`, 
      icon: '📊',
      description: 'Event timeline'
    },
    { 
      id: 'issues', 
      label: 'Issues & Allegations', 
      path: `/cases/${selectedCase.id}/issues`, 
      icon: '⚖️',
      description: 'Legal issues'
    },
    { 
      id: 'depositions', 
      label: 'Depositions', 
      path: `/cases/${selectedCase.id}/depositions`, 
      icon: '🎤',
      description: 'Deposition management'
    },
    { 
      id: 'trial', 
      label: 'Trial Notebook', 
      path: `/cases/${selectedCase.id}/trial`, 
      icon: '📚',
      description: 'Trial preparation'
    },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || 
           (path.includes('/cases/') && location.pathname.startsWith(path));
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`bg-white/95 backdrop-blur-sm border-r border-sunflower-taupe/40 shadow-sm transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-sunflower-taupe/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-sunflower-brown truncate">
                {selectedCase.case_name}
              </h2>
              <p className="text-xs text-sunflower-brown/70">
                CM# {selectedCase.cm_number}
              </p>
              <div className="mt-2">
                <span className={
                  selectedCase.phase === 'Open' ? sunflowerTheme.badges.open :
                  selectedCase.phase === 'Pending' ? sunflowerTheme.badges.pending :
                  sunflowerTheme.badges.closed
                }>
                  {selectedCase.phase}
                </span>
              </div>
            </div>
          )}
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-sunflower-beige/50 text-sunflower-brown/70"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {caseNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.path)}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActiveRoute(item.path)
                ? 'bg-sunflower-gold text-white shadow-sm'
                : 'text-sunflower-brown hover:bg-sunflower-beige/50 hover:text-sunflower-brown'
            }`}
            title={isCollapsed ? `${item.label}: ${item.description}` : undefined}
          >
            <span className="text-base">{item.icon}</span>
            
            {!isCollapsed && (
              <>
                <div className="ml-3 flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs mt-0.5 ${
                    isActiveRoute(item.path)
                      ? 'text-white/80'
                      : 'text-sunflower-brown/60 group-hover:text-sunflower-brown/70'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-sunflower-taupe/30">
        {!isCollapsed && (
          <div className="text-xs text-sunflower-brown/60 text-center">
            Case-specific navigation
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseSidebar;
