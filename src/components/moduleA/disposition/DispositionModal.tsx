import React, { useState, useEffect } from 'react';
import { useCaseStore } from '../../../stores/caseStore';
import { sunflowerTheme } from '../../../styles/sunflowerTheme';
import type { Case, DispositionInput, DispositionType } from '../../../types/ModuleA';
import { DISPOSITION_TYPES, DISPOSITION_TYPE_LABELS } from '../../../types/ModuleA';
import { DispositionForm } from './DispositionForm';
import { DispositionSummary } from './DispositionSummary';

interface DispositionModalProps {
  isOpen: boolean;
  case: Case;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DispositionModal: React.FC<DispositionModalProps> = ({
  isOpen,
  case: selectedCase,
  onClose,
  onSuccess,
}) => {
  const { disposition, createDisposition, loadDisposition, isLoading, error, clearError } = useCaseStore();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen && selectedCase) {
      // Load existing disposition if any
      loadDisposition(selectedCase.id);
      clearError();
    }
  }, [isOpen, selectedCase, loadDisposition, clearError]);

  const handleCreateDisposition = async (formData: DispositionInput) => {
    setIsCreating(true);
    try {
      await createDisposition(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create disposition:', err);
      // Error is already set in store
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  // If case is already closed and has disposition, show summary
  const showSummary = selectedCase.phase === 'Closed' && disposition;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${sunflowerTheme.containers.modal} w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-sunflower-taupe/30">
          <div>
            <h2 className={sunflowerTheme.typography.styles.h2}>
              {showSummary ? '📋 Case Disposition Summary' : '⚖️ Complete Case Disposition'}
            </h2>
            <p className={sunflowerTheme.typography.styles.muted + ' mt-1'}>
              {selectedCase.case_name} (CM# {selectedCase.cm_number})
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading || isCreating}
            className="text-sunflower-brown/60 hover:text-sunflower-brown text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="m-6 mb-0 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {showSummary && disposition ? (
            <DispositionSummary 
              disposition={disposition} 
              case={selectedCase}
              onClose={onClose}
            />
          ) : (
            <DispositionForm 
              case={selectedCase} 
              onSubmit={handleCreateDisposition}
              onCancel={onClose}
              isSubmitting={isCreating}
            />
          )}
        </div>
      </div>
    </div>
  );
};
