// CASE LAYOUT - Wraps case-specific views with CaseTabs
// Shows CaseTabs (Tier 2) navigation for all case-specific routes

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CaseTabs } from '../navigation/CaseTabs';
import type { Case } from '../../types/ModuleA';
import '../../styles/design-system.css';

interface CaseLayoutProps {
  children: React.ReactNode;
}

export const CaseLayout: React.FC<CaseLayoutProps> = ({ children }) => {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!caseId) return;

    const loadCase = async () => {
      try {
        setIsLoading(true);
        const response = await window.electron.db.getCaseById(parseInt(caseId));
        if (response) {
          setCaseData(response);
        }
      } catch (error) {
        console.error('Error loading case for layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCase();
  }, [caseId]);

  if (isLoading) {
    return (
      <div style={{ 
        padding: 'var(--spacing-xl)', 
        textAlign: 'center', 
        color: 'var(--color-text-muted)' 
      }}>
        Loading case...
      </div>
    );
  }

  if (!caseData || !caseId) {
    return (
      <div style={{ 
        padding: 'var(--spacing-xl)', 
        textAlign: 'center', 
        color: 'var(--color-error)' 
      }}>
        Case not found
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg-primary)',
    }}>
      {/* Case Tabs - Tier 2 Navigation */}
      <CaseTabs caseId={parseInt(caseId)} caseName={caseData.case_name} />
      
      {/* Content Area */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        backgroundColor: 'var(--color-bg-primary)',
      }}>
        {children}
      </div>
    </div>
  );
};
