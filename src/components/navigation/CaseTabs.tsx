// CASE TABS - Tier 2 Case-Specific Navigation
// Horizontal tabs that appear when a case is selected

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/design-system.css';

interface CaseTab {
  id: string;
  label: string;
  path: string;
}

const caseTabs: CaseTab[] = [
  { id: 'overview', label: 'Overview', path: '/cases/:id/overview' },
  { id: 'parties', label: 'Parties & Contacts', path: '/cases/:id/parties' },
  { id: 'policies', label: 'Policies', path: '/cases/:id/policies' },
  { id: 'discovery', label: 'Discovery & Evidence', path: '/cases/:id/discovery' },
  { id: 'chronology', label: 'Case Chronology', path: '/cases/:id/chronology' },
  { id: 'treatment', label: 'Treatment & Damages', path: '/cases/:id/treatment' },
  { id: 'issues', label: 'Issues & Allegations', path: '/cases/:id/issues' },
  { id: 'deposition', label: 'Deposition Prep', path: '/cases/:id/deposition' },
];

interface CaseTabsProps {
  caseId: number;
  caseName: string;
}

export const CaseTabs: React.FC<CaseTabsProps> = ({ caseId, caseName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabPath = (tabPath: string) => {
    return tabPath.replace(':id', caseId.toString());
  };

  const isActive = (tabPath: string) => {
    const actualPath = getTabPath(tabPath);
    return location.pathname === actualPath;
  };

  return (
    <div>
      {/* Case Header */}
      <div 
        style={{
          padding: 'var(--spacing-md) var(--spacing-xl)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderBottom: '2px solid var(--color-border-medium)',
        }}
      >
        <div 
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 'var(--spacing-xs)',
          }}
        >
          Current Case
        </div>
        <div 
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {caseName}
        </div>
      </div>

      {/* Tab Bar */}
      <div 
        style={{
          display: 'flex',
          gap: 0,
          backgroundColor: 'var(--color-bg-primary)',
          borderBottom: '2px solid var(--color-border-medium)',
          overflowX: 'auto',
          height: 'var(--tab-bar-height)',
        }}
      >
        {caseTabs.map((tab) => {
          const active = isActive(tab.path);
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(getTabPath(tab.path))}
              style={{
                padding: '0 var(--spacing-lg)',
                border: 'none',
                backgroundColor: active ? 'var(--color-sunflower-light)' : 'transparent',
                color: active ? 'var(--color-brown-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderBottom: active ? '3px solid var(--color-sunflower)' : '3px solid transparent',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

