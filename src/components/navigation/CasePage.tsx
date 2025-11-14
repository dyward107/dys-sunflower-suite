// CASE PAGE WRAPPER - For Tier 2 navigation pages
// Provides consistent layout with back button and case context

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';
import { sunflowerTheme } from '../../styles/sunflowerTheme';

interface CasePageProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export const CasePage: React.FC<CasePageProps> = ({ title, icon, children }) => {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const { selectedCase } = useCaseStore();

  const handleBackToCase = () => {
    if (caseId) {
      navigate(`/cases/${caseId}`);
    } else if (selectedCase) {
      navigate(`/cases/${selectedCase.id}`);
    } else {
      navigate('/cases');
    }
  };

  const handleBackToCases = () => {
    navigate('/cases');
  };

  return (
    <div className="relative min-h-full">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-sunflower-brown/70 mb-6">
          <button
            onClick={handleBackToCases}
            className="hover:text-sunflower-brown transition-colors"
          >
            Case Manager
          </button>
          <span>→</span>
          <button
            onClick={handleBackToCase}
            className="hover:text-sunflower-brown transition-colors"
          >
            {selectedCase?.case_name || 'Case Details'}
          </button>
          <span>→</span>
          <span className="text-sunflower-brown font-medium">{title}</span>
        </nav>

        {/* Page Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToCase}
              className="flex items-center space-x-2 text-sunflower-brown hover:text-sunflower-gold transition-colors group"
            >
              <span className="text-lg group-hover:translate-x-[-2px] transition-transform">←</span>
              <span className="font-medium">Back to Case Overview</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <h1 className={sunflowerTheme.typography.styles.pageTitle}>
              {title}
            </h1>
          </div>
        </div>

        {/* Case Context Card */}
        {selectedCase && (
          <div className="mb-6 rounded-2xl bg-sunflower-gold/10 border border-sunflower-gold/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-sunflower-brown">
                  Case:
                </span>
                <span className="font-semibold text-sunflower-brown">
                  {selectedCase.case_name}
                </span>
                <span className="text-sm text-sunflower-brown/70">
                  CM# {selectedCase.cm_number}
                </span>
              </div>
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

        {/* Page Content */}
        <div className={sunflowerTheme.containers.card + ' px-8 py-6'}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CasePage;
