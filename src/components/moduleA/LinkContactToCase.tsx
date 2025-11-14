// LINK CONTACT TO CASE MODAL - MODULE A PHASE 1B
// Modal for linking existing global contacts to specific cases with roles
// Handles the case-contact relationship creation

import React, { useState, useEffect } from 'react';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';
import { ContactTypeRoleSelector } from './ContactTypeRoleSelector';
import type { Contact, CaseContactInput, ContactType, ContactRole } from '../../types/ModuleA';

interface LinkContactToCaseProps {
  isOpen: boolean;
  contact: Contact | null;
  caseId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LinkContactToCase: React.FC<LinkContactToCaseProps> = ({
  isOpen,
  contact,
  caseId,
  onClose,
  onSuccess
}) => {
  const { addContactToCase, selectedCase, cases, loadCases, isLoading } = useCaseStore();
  
  // Form state
  const [formData, setFormData] = useState<Omit<CaseContactInput, 'case_id' | 'contact_id'>>({
    contact_type: '' as ContactType,
    role: '' as ContactRole,
    is_primary: false,
    relationship_start_date: '',
    relationship_end_date: '',
    notes: ''
  });

  const [customRole, setCustomRole] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Find the target case (either from selectedCase or from cases array)
  const targetCase = selectedCase?.id === caseId ? selectedCase : cases.find(c => c.id === caseId);

  // Load cases if needed
  useEffect(() => {
    if (isOpen && caseId && !targetCase && cases.length === 0) {
      loadCases();
    }
  }, [isOpen, caseId, targetCase, cases.length, loadCases]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        contact_type: '' as ContactType,
        role: '' as ContactRole,
        is_primary: false,
        relationship_start_date: '',
        relationship_end_date: '',
        notes: ''
      });
      setCustomRole('');
      setErrors({});
    } else {
      // Set default start date to today
      setFormData(prev => ({
        ...prev,
        relationship_start_date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle contact type change
  const handleTypeChange = (type: ContactType) => {
    handleInputChange('contact_type', type);
  };

  // Handle role change
  const handleRoleChange = (role: ContactRole) => {
    handleInputChange('role', role);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.contact_type) {
      newErrors.contact_type = 'Contact type is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Date validation
    if (formData.relationship_start_date && formData.relationship_end_date) {
      const startDate = new Date(formData.relationship_start_date);
      const endDate = new Date(formData.relationship_end_date);
      
      if (endDate <= startDate) {
        newErrors.relationship_end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact || !caseId || !validateForm()) {
      return;
    }

    try {
      const caseContactData: CaseContactInput = {
        case_id: caseId,
        contact_id: contact.id,
        contact_type: formData.contact_type,
        role: formData.role,
        is_primary: formData.is_primary,
        relationship_start_date: formData.relationship_start_date || undefined,
        relationship_end_date: formData.relationship_end_date || undefined,
        notes: formData.notes || undefined
      };

      await addContactToCase(caseContactData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      // Handle duplicate relationship error
      if (error.message?.includes('UNIQUE constraint failed')) {
        setErrors({ general: 'This contact is already linked to this case with the same type and role. Please choose a different role or contact type.' });
      } else {
        setErrors({ general: error.message || 'Failed to link contact to case' });
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !contact || !caseId) return null;

  // Show loading if we're waiting for case data
  if (!targetCase && isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className={`${sunflowerTheme.containers.modal} w-full max-w-xl`}>
          <div className="p-6 text-center">
            <div className="text-sunflower-brown">Loading case information...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if case not found
  if (!targetCase) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className={`${sunflowerTheme.containers.modal} w-full max-w-xl`}>
          <div className="p-6 text-center">
            <div className="text-red-600 mb-4">Case not found</div>
            <button onClick={handleClose} className={sunflowerTheme.buttons.secondary}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${sunflowerTheme.containers.modal} w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-sunflower-taupe/30">
          <div>
            <h2 className={sunflowerTheme.typography.styles.h2}>
              🔗 Link Contact to Case
            </h2>
            <p className={`${sunflowerTheme.typography.styles.muted} text-sm mt-1`}>
              Link <strong>{contact.name}</strong> to <strong>{targetCase.case_name}</strong>
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

        {/* Form - Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
              {errors.general}
            </div>
          )}

          {/* Contact Information Display */}
          <div className="bg-sunflower-cream/30 rounded-xl p-4">
            <h3 className={`${sunflowerTheme.typography.styles.h3} mb-2`}>Contact Information</h3>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {contact.name}</p>
              {contact.organization && <p><strong>Organization:</strong> {contact.organization}</p>}
              {contact.title && <p><strong>Title:</strong> {contact.title}</p>}
              {contact.email_primary && <p><strong>Email:</strong> {contact.email_primary}</p>}
              {contact.phone_primary && <p><strong>Phone:</strong> {contact.phone_primary}</p>}
            </div>
          </div>

          {/* Contact Type and Role Selection */}
          <ContactTypeRoleSelector
            contactType={formData.contact_type}
            role={formData.role}
            onTypeChange={handleTypeChange}
            onRoleChange={handleRoleChange}
            customRole={customRole}
            onCustomRoleChange={setCustomRole}
            disabled={isLoading}
            required={true}
          />

          {/* Primary Contact Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) => handleInputChange('is_primary', e.target.checked)}
              className="rounded border-sunflower-taupe text-sunflower-gold focus:ring-sunflower-gold"
              disabled={isLoading}
            />
            <label htmlFor="is_primary" className={sunflowerTheme.typography.styles.label}>
              Primary contact for this type and role
            </label>
          </div>

          {/* Relationship Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={sunflowerTheme.typography.styles.label}>
                Relationship Start Date
              </label>
              <input
                type="date"
                value={formData.relationship_start_date}
                onChange={(e) => handleInputChange('relationship_start_date', e.target.value)}
                className={`${sunflowerTheme.inputs.text} mt-1`}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={sunflowerTheme.typography.styles.label}>
                Relationship End Date
              </label>
              <input
                type="date"
                value={formData.relationship_end_date}
                onChange={(e) => handleInputChange('relationship_end_date', e.target.value)}
                className={`${sunflowerTheme.inputs.text} mt-1 ${errors.relationship_end_date ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.relationship_end_date && (
                <p className="text-red-600 text-sm mt-1">{errors.relationship_end_date}</p>
              )}
              <p className="text-xs text-sunflower-brown/60 mt-1">
                Leave blank if relationship is ongoing
              </p>
            </div>
          </div>

          {/* Case-Specific Notes */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>
              Case-Specific Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className={`${sunflowerTheme.inputs.textarea} mt-1`}
              placeholder="Notes specific to this contact's role in this case..."
              disabled={isLoading}
            />
          </div>

          </form>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end gap-3 p-6 border-t border-sunflower-taupe/30 bg-white">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={sunflowerTheme.buttons.secondary}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={sunflowerTheme.buttons.primary}
          >
            {isLoading ? 'Linking...' : 'Link to Case'}
          </button>
        </div>
      </div>
    </div>
  );
};
