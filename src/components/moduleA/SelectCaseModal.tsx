// SELECT CASE MODAL - MODULE A PHASE 1B
// Modal for selecting a case when linking a contact from the global contact database
// Appears before the LinkContactToCase modal

import React, { useState, useEffect } from 'react';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';
import type { Contact, Case } from '../../types/ModuleA';

interface SelectCaseModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onCaseSelected: (caseId: number) => void;
}

export const SelectCaseModal: React.FC<SelectCaseModalProps> = ({
  isOpen,
  contact,
  onClose,
  onCaseSelected
}) => {
  const { cases, loadCases, isLoading } = useCaseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  // Load cases when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCases();
      setSearchQuery('');
      setSelectedCaseId(null);
    }
  }, [isOpen, loadCases]);

  // Handle case selection
  const handleCaseSelect = (caseId: number) => {
    setSelectedCaseId(caseId);
  };

  // Handle confirmation
  const handleConfirm = () => {
    if (selectedCaseId) {
      onCaseSelected(selectedCaseId);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Filter cases based on search
  const filteredCases = cases.filter(caseItem => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      caseItem.case_name.toLowerCase().includes(query) ||
      caseItem.cm_number.toLowerCase().includes(query) ||
      caseItem.lead_attorney.toLowerCase().includes(query)
    );
  });

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${sunflowerTheme.containers.modal} w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-sunflower-taupe/30">
          <div>
            <h2 className={sunflowerTheme.typography.styles.h2}>
              🔗 Select Case
            </h2>
            <p className={`${sunflowerTheme.typography.styles.muted} text-sm mt-1`}>
              Select a case to link <strong>{contact.name}</strong> to
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-sunflower-brown/60 hover:text-sunflower-brown text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-sunflower-taupe/30">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by name, CM number, or attorney..."
            className={sunflowerTheme.inputs.search}
          />
        </div>

        {/* Case List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8 text-sunflower-brown">
              Loading cases...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sunflower-brown/70">
                {searchQuery ? 'No cases match your search.' : 'No cases available.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => handleCaseSelect(caseItem.id)}
                  className={`
                    p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                    ${selectedCaseId === caseItem.id
                      ? 'border-sunflower-gold bg-sunflower-gold/10 shadow-sm'
                      : 'border-sunflower-taupe/40 bg-white/60 hover:border-sunflower-gold/60 hover:bg-sunflower-beige/30'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`${sunflowerTheme.typography.styles.body} font-semibold text-sunflower-brown`}>
                      {caseItem.case_name}
                    </h3>
                    <span className={
                      caseItem.phase === 'Open' ? sunflowerTheme.badges.open :
                      caseItem.phase === 'Pending' ? sunflowerTheme.badges.pending :
                      sunflowerTheme.badges.closed
                    }>
                      {caseItem.phase}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="space-y-1">
                      <p className={sunflowerTheme.typography.styles.muted}>
                        <span className="font-medium">CM#:</span> {caseItem.cm_number}
                      </p>
                      <p className={sunflowerTheme.typography.styles.muted}>
                        <span className="font-medium">Attorney:</span> {caseItem.lead_attorney}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={sunflowerTheme.typography.styles.muted}>
                        <span className="font-medium">Opened:</span> {new Date(caseItem.date_opened).toLocaleDateString()}
                      </p>
                      <p className={sunflowerTheme.typography.styles.muted}>
                        <span className="font-medium">Status:</span> {caseItem.status}
                      </p>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedCaseId === caseItem.id && (
                    <div className="mt-3 flex items-center gap-2 text-sunflower-gold">
                      <span className="text-lg">✓</span>
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-sunflower-taupe/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={sunflowerTheme.buttons.secondary}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCaseId || isLoading}
            className={sunflowerTheme.buttons.primary}
          >
            Continue to Link
          </button>
        </div>
      </div>
    </div>
  );
};
