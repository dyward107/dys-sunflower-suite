// CONTACT TYPE & ROLE SELECTOR - MODULE A PHASE 1B
// Handles the complex contact type and role selection with user-specified roles
// Dynamically updates available roles based on selected contact type

import React, { useEffect } from 'react';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import type { ContactType, ContactRole } from '../../types/ModuleA';
import { 
  CONTACT_TYPES, 
  CONTACT_ROLES, 
  CONTACT_TYPE_LABELS, 
  CONTACT_ROLE_LABELS 
} from '../../types/ModuleA';

interface ContactTypeRoleSelectorProps {
  contactType: ContactType | '';
  role: ContactRole | '';
  onTypeChange: (type: ContactType) => void;
  onRoleChange: (role: ContactRole) => void;
  customRole?: string; // For 'other' type
  onCustomRoleChange?: (customRole: string) => void;
  showLabels?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const ContactTypeRoleSelector: React.FC<ContactTypeRoleSelectorProps> = ({
  contactType,
  role,
  onTypeChange,
  onRoleChange,
  customRole = '',
  onCustomRoleChange,
  showLabels = true,
  disabled = false,
  required = false,
  className = ''
}) => {
  // Get available roles for the selected contact type
  const getAvailableRoles = (type: ContactType): string[] => {
    return CONTACT_ROLES[type] || [];
  };

  // Reset role when contact type changes (if current role is not valid for new type)
  useEffect(() => {
    if (contactType && role) {
      const availableRoles = getAvailableRoles(contactType);
      if (contactType !== 'other' && !availableRoles.includes(role)) {
        // Reset to first available role
        if (availableRoles.length > 0) {
          onRoleChange(availableRoles[0] as ContactRole);
        }
      }
    }
  }, [contactType, role, onRoleChange]);

  // Handle contact type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ContactType;
    onTypeChange(newType);
    
    // Auto-select first available role for the new type
    const availableRoles = getAvailableRoles(newType);
    if (availableRoles.length > 0) {
      onRoleChange(availableRoles[0] as ContactRole);
    } else if (newType === 'other') {
      // For 'other' type, clear role to allow custom input
      onRoleChange('' as ContactRole);
    }
  };

  // Handle role change
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as ContactRole;
    onRoleChange(newRole);
  };

  // Handle custom role change (for 'other' type)
  const handleCustomRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomRole = e.target.value;
    if (onCustomRoleChange) {
      onCustomRoleChange(newCustomRole);
    }
    // Also update the role with the custom value
    onRoleChange(newCustomRole as ContactRole);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contact Type Selection */}
      <div>
        {showLabels && (
          <label className={sunflowerTheme.typography.styles.label}>
            Contact Type {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          value={contactType}
          onChange={handleTypeChange}
          disabled={disabled}
          required={required}
          className={`${sunflowerTheme.inputs.select} ${showLabels ? 'mt-1' : ''}`}
        >
          <option value="">Select Contact Type...</option>
          {CONTACT_TYPES.map((type) => (
            <option key={type} value={type}>
              {CONTACT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Role Selection */}
      {contactType && (
        <div>
          {showLabels && (
            <label className={sunflowerTheme.typography.styles.label}>
              Role {required && <span className="text-red-500">*</span>}
            </label>
          )}
          
          {contactType === 'other' ? (
            // Custom role input for 'other' type
            <input
              type="text"
              value={customRole}
              onChange={handleCustomRoleChange}
              placeholder="Enter custom role..."
              disabled={disabled}
              required={required}
              className={`${sunflowerTheme.inputs.text} ${showLabels ? 'mt-1' : ''}`}
            />
          ) : (
            // Predefined role dropdown for specific types
            <select
              value={role}
              onChange={handleRoleChange}
              disabled={disabled}
              required={required}
              className={`${sunflowerTheme.inputs.select} ${showLabels ? 'mt-1' : ''}`}
            >
              <option value="">Select Role...</option>
              {getAvailableRoles(contactType).map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {CONTACT_ROLE_LABELS[roleOption] || roleOption}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Role descriptions/help text */}
      {contactType && role && (
        <div className="text-xs text-sunflower-brown/60 bg-sunflower-cream/30 rounded-lg p-3">
          <div className="font-medium mb-1">
            {CONTACT_TYPE_LABELS[contactType]} - {
              contactType === 'other' 
                ? role 
                : CONTACT_ROLE_LABELS[role] || role
            }
          </div>
          <div className="text-sunflower-brown/50 space-y-1">
            {contactType === 'adjuster' && role === 'primary' && 'Main adjuster handling the claim day-to-day.'}
            {contactType === 'adjuster' && role === 'secondary' && 'Backup or specialty adjuster assisting the file.'}
            {contactType === 'adjuster' && role === 'supervisor' && 'Supervising adjuster overseeing strategy.'}
            {contactType === 'adjuster' && role === 'claims_manager' && 'Claims manager/director with settlement authority.'}
            {contactType === 'tpa_agent' && 'Third-party administrator contact coordinating on behalf of the carrier.'}
            {contactType === 'corporate_rep' && 'Internal corporate representative (risk, GC, safety, executive, etc.).'}
            {contactType === 'insurance_broker' && 'Broker/agent who placed or manages the policy.'}
            {contactType === 'plaintiff_counsel' && role === 'primary' && 'Lead attorney representing the plaintiff.'}
            {contactType === 'plaintiff_counsel' && role === 'secondary' && 'Associate or co-counsel for the plaintiff.'}
            {contactType === 'plaintiff_counsel' && role === 'local_counsel' && 'Local counsel assisting the plaintiff’s firm.'}
            {contactType === 'defense_counsel' && role === 'lead' && 'Lead defense attorney for our insured.'}
            {contactType === 'defense_counsel' && role === 'co_counsel' && 'Co-counsel working alongside lead defense.'}
            {contactType === 'defense_counsel' && role === 'co_defendant_counsel' && 'Attorney representing a separate co-defendant.'}
            {contactType === 'defense_counsel' && role === 'local_counsel' && 'Local counsel coverage for venue-specific practice.'}
            {contactType === 'defense_counsel' && role === 'coverage_counsel' && 'Coverage counsel advising on policy issues.'}
            {contactType === 'expert' && role === 'retained' && 'Testifying expert retained for the defense.'}
            {contactType === 'expert' && role === 'consulting' && 'Consulting expert supporting strategy (may not testify).'}
            {contactType === 'expert' && role === 'rebuttal' && 'Expert retained solely to rebut opposing experts.'}
            {contactType === 'expert' && role === 'damages' && 'Expert analyzing damages or exposure.'}
            {contactType === 'expert' && role === 'liability' && 'Expert focusing on liability/causation issues.'}
            {contactType === 'expert' && role === 'medical' && 'Medical expert reviewing treatment or condition.'}
            {contactType === 'investigator' && role === 'surveillance' && 'Investigator handling surveillance assignments.'}
            {contactType === 'investigator' && role === 'background' && 'Investigator handling background/social media digs.'}
            {contactType === 'medical_provider' && role === 'treating_physician' && 'Primary treating physician for the claimant.'}
            {contactType === 'medical_provider' && role === 'facility' && 'Hospital/clinic/business contact.'}
            {contactType === 'medical_provider' && role === 'records_custodian' && 'Records custodian for subpoenas/requests.'}
            {contactType === 'medical_provider' && role === 'billing_contact' && 'Billing/finance representative.'}
            {contactType === 'witness' && role === 'fact' && 'Fact witness with first-hand knowledge.'}
            {contactType === 'witness' && role === 'expert' && 'Expert witness providing specialized knowledge.'}
            {contactType === 'court_personnel' && role === 'judge' && 'Presiding judge or magistrate.'}
            {contactType === 'court_personnel' && role === 'clerk' && 'Court clerk scheduling and docket contact.'}
            {contactType === 'court_personnel' && role === 'staff_attorney' && 'Staff attorney supporting the court.'}
            {contactType === 'mediator_arbitrator' && role === 'mediator' && 'Neutral facilitating settlement discussions.'}
            {contactType === 'mediator_arbitrator' && role === 'arbitrator' && 'Neutral decision-maker for arbitration.'}
            {contactType === 'mediator_arbitrator' && role === 'special_master' && 'Court-appointed neutral with special duties.'}
            {contactType === 'vendor' && role === 'records_retrieval' && 'Vendor assisting with record retrieval.'}
            {contactType === 'vendor' && role === 'process_server' && 'Process server for service of process needs.'}
            {contactType === 'vendor' && role === 'court_reporter' && 'Court reporting / transcription contact.'}
            {contactType === 'vendor' && role === 'translator' && 'Language service provider/translator.'}
            {(contactType === 'other' || role === 'other') && 'Custom role. Use contact notes to capture additional detail.'}
          </div>
        </div>
      )}
    </div>
  );
};
