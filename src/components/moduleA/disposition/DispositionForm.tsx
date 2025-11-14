import React, { useState } from 'react';
import { sunflowerTheme } from '../../../styles/sunflowerTheme';
import type { Case, DispositionInput, DispositionType } from '../../../types/ModuleA';
import { DISPOSITION_TYPES, DISPOSITION_TYPE_LABELS } from '../../../types/ModuleA';

interface DispositionFormProps {
  case: Case;
  onSubmit: (data: DispositionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const DispositionForm: React.FC<DispositionFormProps> = ({
  case: selectedCase,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Omit<DispositionInput, 'case_id'>>({
    disposition_type: 'settlement',
    disposition_date: new Date().toISOString().split('T')[0], // Today's date
    settlement_amount: undefined,
    other_disposition_type: '',
    
    // Settlement workflow tracking
    settlement_agreement_date: '',
    release_drafted: false,
    release_executed: false,
    dismissal_filed: false,
    dismissal_date: '',
    
    // Documents
    settlement_agreement_path: '',
    release_document_path: '',
    dismissal_document_path: '',
    
    // Refiling
    potential_refiling: false,
    refiling_deadline: '',
    refiling_days_notice: 90,
    refiling_reminder_set: false,
    disposition_notes: '',
    created_by: 'system'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle disposition type change - auto-enable refiling for dismissal without prejudice
  const handleDispositionTypeChange = (type: DispositionType) => {
    const updates: Partial<typeof formData> = { disposition_type: type };
    
    // Auto-enable refiling for dismissal without prejudice
    if (type === 'dismissal_without_prejudice') {
      updates.potential_refiling = true;
      updates.refiling_deadline = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
    
    if (errors.disposition_type) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.disposition_type;
        return newErrors;
      });
    }
  };

  // Calculate refiling deadline when potential_refiling is enabled
  const handleRefilingChange = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      potential_refiling: enabled,
      refiling_deadline: enabled 
        ? new Date(Date.now() + (prev.refiling_days_notice || 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : '',
      refiling_reminder_set: false
    }));
  };

  // Update refiling deadline when days notice changes
  const handleRefilingDaysChange = (days: number) => {
    setFormData(prev => ({
      ...prev,
      refiling_days_notice: days,
      refiling_deadline: prev.potential_refiling 
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : prev.refiling_deadline
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.disposition_type) {
      newErrors.disposition_type = 'Disposition type is required';
    }

    if (!formData.disposition_date) {
      newErrors.disposition_date = 'Disposition date is required';
    }

    if (formData.disposition_type === 'other' && !formData.other_disposition_type?.trim()) {
      newErrors.other_disposition_type = 'Please specify the other disposition type';
    }

    if (formData.disposition_type === 'settlement') {
      if (!formData.settlement_amount || formData.settlement_amount <= 0) {
        newErrors.settlement_amount = 'Settlement amount is required for settlements';
      }
    }

    if (formData.potential_refiling && !formData.refiling_deadline) {
      newErrors.refiling_deadline = 'Refiling deadline is required when refiling is possible';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    const submissionData: DispositionInput = {
      case_id: selectedCase.id,
      ...formData,
      // Clean up conditional fields
      settlement_amount: formData.disposition_type === 'settlement' ? formData.settlement_amount : undefined,
      other_disposition_type: formData.disposition_type === 'other' ? formData.other_disposition_type : undefined,
      refiling_deadline: formData.potential_refiling ? formData.refiling_deadline : undefined,
    };

    await onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Case Info Header */}
      <div className={`${sunflowerTheme.containers.card} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={sunflowerTheme.typography.styles.h3}>
              {selectedCase.case_name}
            </h3>
            <p className={sunflowerTheme.typography.styles.muted}>
              CM# {selectedCase.cm_number} • Lead Attorney: {selectedCase.lead_attorney}
            </p>
          </div>
          <span className={selectedCase.phase === 'Open' ? sunflowerTheme.badges.open : sunflowerTheme.badges.pending}>
            {selectedCase.phase}
          </span>
        </div>
      </div>

      {/* Disposition Details */}
      <div className="space-y-4">
        <h3 className={sunflowerTheme.typography.styles.h3}>Disposition Details</h3>
        
        {/* Disposition Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={sunflowerTheme.typography.styles.label}>
              Disposition Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.disposition_type}
              onChange={(e) => handleDispositionTypeChange(e.target.value as DispositionType)}
              className={`${sunflowerTheme.inputs.select} mt-1 ${errors.disposition_type ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            >
              <option value="">Select Type</option>
              {DISPOSITION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {DISPOSITION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.disposition_type && (
              <p className="text-red-500 text-xs mt-1">{errors.disposition_type}</p>
            )}
          </div>

          {/* Disposition Date */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>
              Disposition Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.disposition_date}
              onChange={(e) => handleInputChange('disposition_date', e.target.value)}
              className={`${sunflowerTheme.inputs.text} mt-1 ${errors.disposition_date ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.disposition_date && (
              <p className="text-red-500 text-xs mt-1">{errors.disposition_date}</p>
            )}
          </div>
        </div>

        {/* Other Disposition Type (conditional) */}
        {formData.disposition_type === 'other' && (
          <div>
            <label className={sunflowerTheme.typography.styles.label}>
              Specify Other Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.other_disposition_type || ''}
              onChange={(e) => handleInputChange('other_disposition_type', e.target.value)}
              placeholder="e.g., Voluntary Dismissal"
              className={`${sunflowerTheme.inputs.text} mt-1 ${errors.other_disposition_type ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.other_disposition_type && (
              <p className="text-red-500 text-xs mt-1">{errors.other_disposition_type}</p>
            )}
          </div>
        )}

        {/* Settlement Amount (conditional) */}
        {formData.disposition_type === 'settlement' && (
          <div>
            <label className={sunflowerTheme.typography.styles.label}>
              Settlement Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunflower-brown">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.settlement_amount || ''}
                onChange={(e) => handleInputChange('settlement_amount', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
                className={`${sunflowerTheme.inputs.text} pl-8 ${errors.settlement_amount ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.settlement_amount && (
              <p className="text-red-500 text-xs mt-1">{errors.settlement_amount}</p>
            )}
          </div>
        )}
      </div>

      {/* Settlement Workflow Tracking (conditional - only for settlements) */}
      {formData.disposition_type === 'settlement' && (
        <div className="space-y-4 pt-4 border-t border-sunflower-taupe/30">
          <h3 className={sunflowerTheme.typography.styles.h3}>📋 Settlement Workflow</h3>
          
          {/* Agreement Date */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>
              Settlement Agreement Date
            </label>
            <input
              type="date"
              value={formData.settlement_agreement_date || ''}
              onChange={(e) => handleInputChange('settlement_agreement_date', e.target.value)}
              className={`${sunflowerTheme.inputs.text} mt-1`}
              disabled={isSubmitting}
            />
            <p className="text-xs text-sunflower-brown/60 mt-1">Date the settlement agreement was reached</p>
          </div>

          {/* Workflow Checkboxes */}
          <div className="space-y-3 ml-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="release_drafted"
                checked={formData.release_drafted}
                onChange={(e) => handleInputChange('release_drafted', e.target.checked)}
                className={sunflowerTheme.inputs.checkbox}
                disabled={isSubmitting}
              />
              <label htmlFor="release_drafted" className={sunflowerTheme.typography.styles.label}>
                Draft Release or Settlement Agreement
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="release_executed"
                checked={formData.release_executed}
                onChange={(e) => handleInputChange('release_executed', e.target.checked)}
                className={sunflowerTheme.inputs.checkbox}
                disabled={isSubmitting}
              />
              <label htmlFor="release_executed" className={sunflowerTheme.typography.styles.label}>
                Executed Release Agreement
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="dismissal_filed"
                checked={formData.dismissal_filed}
                onChange={(e) => handleInputChange('dismissal_filed', e.target.checked)}
                className={sunflowerTheme.inputs.checkbox}
                disabled={isSubmitting}
              />
              <label htmlFor="dismissal_filed" className={sunflowerTheme.typography.styles.label}>
                Dismissal Documents
              </label>
            </div>
          </div>

          {/* Dismissal/Disposition Date */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>
              Dismissal/Disposition Date
            </label>
            <input
              type="date"
              value={formData.dismissal_date || ''}
              onChange={(e) => handleInputChange('dismissal_date', e.target.value)}
              className={`${sunflowerTheme.inputs.text} mt-1`}
              disabled={isSubmitting}
            />
            <p className="text-xs text-sunflower-brown/60 mt-1">Date the case was officially dismissed/disposed</p>
          </div>
        </div>
      )}

      {/* Document Upload Section */}
      <div className="space-y-4 pt-4 border-t border-sunflower-taupe/30">
        <h3 className={sunflowerTheme.typography.styles.h3}>Documents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Settlement Agreement */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>Settlement Agreement</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                // TODO: Implement file upload
                console.log('Settlement agreement file:', e.target.files?.[0]);
              }}
              className={`${sunflowerTheme.inputs.text} mt-1`}
              disabled={isSubmitting}
            />
            <p className="text-xs text-sunflower-brown/60 mt-1">PDF, DOC, or DOCX files</p>
          </div>

          {/* Release Document */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>Release Document</label>
            <div className="space-y-2 mt-1">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  // TODO: Implement file upload
                  console.log('Release document file:', e.target.files?.[0]);
                }}
                className={sunflowerTheme.inputs.text}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => {
                  // TODO: Generate release template
                  console.log('Generate release template');
                }}
                className={`${sunflowerTheme.buttons.secondary} w-full text-sm py-2`}
                disabled={isSubmitting}
              >
                Generate Release Template
              </button>
            </div>
          </div>

          {/* Dismissal Documents */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>Dismissal Documents</label>
            <div className="space-y-2 mt-1">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  // TODO: Implement file upload
                  console.log('Dismissal document file:', e.target.files?.[0]);
                }}
                className={sunflowerTheme.inputs.text}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => {
                  // TODO: Generate dismissal template
                  console.log('Generate dismissal template');
                }}
                className={`${sunflowerTheme.buttons.secondary} w-full text-sm py-2`}
                disabled={isSubmitting}
              >
                Generate Dismissal Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Refiling Management (only for dismissal without prejudice) */}
      {formData.disposition_type === 'dismissal_without_prejudice' && (
        <div className="space-y-4 pt-4 border-t border-sunflower-taupe/30">
          <h3 className={sunflowerTheme.typography.styles.h3}>Refiling Potential</h3>
        
        <div className="space-y-4">
          {/* Potential for Refiling Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="potential_refiling"
              checked={formData.potential_refiling}
              onChange={(e) => handleRefilingChange(e.target.checked)}
              className={sunflowerTheme.inputs.checkbox}
              disabled={isSubmitting}
            />
            <div>
              <label htmlFor="potential_refiling" className={sunflowerTheme.typography.styles.label}>
                Potential for Refiling
              </label>
              <p className="text-sm text-sunflower-brown/70">
                Check if this case has the potential to be refiled in the future
              </p>
            </div>
          </div>

          {/* Refiling Details (conditional) */}
          {formData.potential_refiling && (
            <div className="ml-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={sunflowerTheme.typography.styles.label}>
                    Days Notice Before Deadline
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.refiling_days_notice}
                    onChange={(e) => handleRefilingDaysChange(parseInt(e.target.value) || 90)}
                    className={`${sunflowerTheme.inputs.text} mt-1`}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-sunflower-brown/60 mt-1">Default: 90 days</p>
                </div>

                <div>
                  <label className={sunflowerTheme.typography.styles.label}>
                    Refiling Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.refiling_deadline || ''}
                    onChange={(e) => handleInputChange('refiling_deadline', e.target.value)}
                    className={`${sunflowerTheme.inputs.text} mt-1 ${errors.refiling_deadline ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.refiling_deadline && (
                    <p className="text-red-500 text-xs mt-1">{errors.refiling_deadline}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="refiling_reminder"
                  checked={formData.refiling_reminder_set}
                  onChange={(e) => handleInputChange('refiling_reminder_set', e.target.checked)}
                  className={sunflowerTheme.inputs.checkbox}
                  disabled={isSubmitting}
                />
                <label htmlFor="refiling_reminder" className={sunflowerTheme.typography.styles.label}>
                  Set Calendar Reminder
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Notes */}
      <div className="pt-4 border-t border-sunflower-taupe/30">
        <label className={sunflowerTheme.typography.styles.label}>
          Disposition Notes
        </label>
        <textarea
          value={formData.disposition_notes || ''}
          onChange={(e) => handleInputChange('disposition_notes', e.target.value)}
          rows={4}
          placeholder="Additional notes about this disposition..."
          className={`${sunflowerTheme.inputs.textarea} mt-1`}
          disabled={isSubmitting}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-sunflower-taupe/30">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={sunflowerTheme.buttons.secondary}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={sunflowerTheme.buttons.primary}
        >
          {isSubmitting ? 'Completing Disposition...' : 'Complete Disposition'}
        </button>
      </div>
    </form>
  );
};
