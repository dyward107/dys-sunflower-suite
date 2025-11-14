// EDIT CONTACT MODAL - MODULE A PHASE 1B
// Modal for editing existing global contacts
// Pre-populates form with existing contact data

import React, { useState, useEffect } from 'react';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';
import type { Contact, ContactInput, PreferredContact } from '../../types/ModuleA';
import { PREFERRED_CONTACT_METHODS, PREFERRED_CONTACT_LABELS } from '../../types/ModuleA';

interface EditContactModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen,
  contact,
  onClose,
  onSuccess
}) => {
  const { updateContact, isLoading } = useCaseStore();
  
  // Form state
  const [formData, setFormData] = useState<ContactInput>({
    name: '',
    organization: '',
    title: '',
    phone_primary: '',
    phone_secondary: '',
    email_primary: '',
    email_secondary: '',
    address: '',
    preferred_contact: undefined,
    best_times: '',
    do_not_contact: false,
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<ContactInput>>({});

  // Populate form when contact changes
  useEffect(() => {
    if (contact && isOpen) {
      setFormData({
        name: contact.name || '',
        organization: contact.organization || '',
        title: contact.title || '',
        phone_primary: contact.phone_primary || '',
        phone_secondary: contact.phone_secondary || '',
        email_primary: contact.email_primary || '',
        email_secondary: contact.email_secondary || '',
        address: contact.address || '',
        preferred_contact: contact.preferred_contact || undefined,
        best_times: contact.best_times || '',
        do_not_contact: contact.do_not_contact || false,
        notes: contact.notes || ''
      });
      setErrors({});
    }
  }, [contact, isOpen]);

  // Handle input changes
  const handleInputChange = (field: keyof ContactInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactInput> = {};

    // Required fields
    if (!formData.name?.trim()) {
      newErrors.name = 'Contact name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email_primary && !emailRegex.test(formData.email_primary)) {
      newErrors.email_primary = 'Please enter a valid email address';
    }
    if (formData.email_secondary && !emailRegex.test(formData.email_secondary)) {
      newErrors.email_secondary = 'Please enter a valid email address';
    }

    // Phone validation (basic - allow various formats)
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    if (formData.phone_primary && !phoneRegex.test(formData.phone_primary)) {
      newErrors.phone_primary = 'Please enter a valid phone number';
    }
    if (formData.phone_secondary && !phoneRegex.test(formData.phone_secondary)) {
      newErrors.phone_secondary = 'Please enter a valid phone number';
    }

    // At least one contact method required
    if (!formData.phone_primary && !formData.email_primary) {
      newErrors.phone_primary = 'At least one contact method (phone or email) is required';
      newErrors.email_primary = 'At least one contact method (phone or email) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact || !validateForm()) {
      return;
    }

    try {
      await updateContact(contact.id, formData);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${sunflowerTheme.containers.modal} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-sunflower-taupe/30">
          <h2 className={sunflowerTheme.typography.styles.h2}>
            ✏️ Edit Contact
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-sunflower-brown/60 hover:text-sunflower-brown text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className={sunflowerTheme.typography.styles.h3}>Basic Information</h3>
            
            {/* Name - Required */}
            <div>
              <label className={sunflowerTheme.typography.styles.label}>
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`${sunflowerTheme.inputs.text} mt-1 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter full name..."
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Organization */}
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className={`${sunflowerTheme.inputs.text} mt-1`}
                placeholder="Company, law firm, hospital, etc."
                disabled={isLoading}
              />
            </div>

            {/* Title */}
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`${sunflowerTheme.inputs.text} mt-1`}
                placeholder="Job title or position..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-4">
            <h3 className={sunflowerTheme.typography.styles.h3}>Contact Methods</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Phone */}
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Primary Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone_primary}
                  onChange={(e) => handleInputChange('phone_primary', e.target.value)}
                  className={`${sunflowerTheme.inputs.text} mt-1 ${errors.phone_primary ? 'border-red-500' : ''}`}
                  placeholder="(555) 123-4567"
                  disabled={isLoading}
                />
                {errors.phone_primary && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone_primary}</p>
                )}
              </div>

              {/* Primary Email */}
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Primary Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email_primary}
                  onChange={(e) => handleInputChange('email_primary', e.target.value)}
                  className={`${sunflowerTheme.inputs.text} mt-1 ${errors.email_primary ? 'border-red-500' : ''}`}
                  placeholder="contact@example.com"
                  disabled={isLoading}
                />
                {errors.email_primary && (
                  <p className="text-red-600 text-sm mt-1">{errors.email_primary}</p>
                )}
              </div>

              {/* Secondary Phone */}
              <div>
                <label className={sunflowerTheme.typography.styles.label}>Secondary Phone</label>
                <input
                  type="tel"
                  value={formData.phone_secondary}
                  onChange={(e) => handleInputChange('phone_secondary', e.target.value)}
                  className={`${sunflowerTheme.inputs.text} mt-1 ${errors.phone_secondary ? 'border-red-500' : ''}`}
                  placeholder="(555) 987-6543"
                  disabled={isLoading}
                />
                {errors.phone_secondary && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone_secondary}</p>
                )}
              </div>

              {/* Secondary Email */}
              <div>
                <label className={sunflowerTheme.typography.styles.label}>Secondary Email</label>
                <input
                  type="email"
                  value={formData.email_secondary}
                  onChange={(e) => handleInputChange('email_secondary', e.target.value)}
                  className={`${sunflowerTheme.inputs.text} mt-1 ${errors.email_secondary ? 'border-red-500' : ''}`}
                  placeholder="alternate@example.com"
                  disabled={isLoading}
                />
                {errors.email_secondary && (
                  <p className="text-red-600 text-sm mt-1">{errors.email_secondary}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={`${sunflowerTheme.inputs.textarea} mt-1`}
                placeholder="Street address, city, state, zip..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <h3 className={sunflowerTheme.typography.styles.h3}>Communication Preferences</h3>
            
            {/* Preferred Contact Method */}
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Preferred Contact Method</label>
              <select
                value={formData.preferred_contact || ''}
                onChange={(e) => handleInputChange('preferred_contact', e.target.value as PreferredContact)}
                className={`${sunflowerTheme.inputs.select} mt-1`}
                disabled={isLoading}
              >
                <option value="">No preference</option>
                {PREFERRED_CONTACT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {PREFERRED_CONTACT_LABELS[method]}
                  </option>
                ))}
              </select>
            </div>

            {/* Best Times */}
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Best Times to Contact</label>
              <input
                type="text"
                value={formData.best_times}
                onChange={(e) => handleInputChange('best_times', e.target.value)}
                className={`${sunflowerTheme.inputs.text} mt-1`}
                placeholder="e.g., Weekdays 9-5, Mornings only, etc."
                disabled={isLoading}
              />
            </div>

            {/* Do Not Contact */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="do_not_contact"
                checked={formData.do_not_contact}
                onChange={(e) => handleInputChange('do_not_contact', e.target.checked)}
                className="rounded border-sunflower-taupe text-sunflower-gold focus:ring-sunflower-gold"
                disabled={isLoading}
              />
              <label htmlFor="do_not_contact" className={sunflowerTheme.typography.styles.label}>
                Do Not Contact (Mark if this contact should not be contacted)
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={sunflowerTheme.typography.styles.label}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className={`${sunflowerTheme.inputs.textarea} mt-1`}
              placeholder="Additional notes about this contact..."
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-sunflower-taupe/30">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={sunflowerTheme.buttons.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={sunflowerTheme.buttons.primary}
            >
              {isLoading ? 'Updating...' : 'Update Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
