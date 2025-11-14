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
                  {CONTACT_ROLE_LABELS[contactType]?.[roleOption] || roleOption}
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
                : CONTACT_ROLE_LABELS[contactType]?.[role] || role
            }
          </div>
          <div className="text-sunflower-brown/50">
            {/* Add helpful descriptions for each type/role combination */}
            {contactType === 'adjuster' && role === 'primary' && 
              'The main insurance adjuster handling this claim.'}
            {contactType === 'adjuster' && role === 'secondary' && 
              'Backup or specialized adjuster for this claim.'}
            {contactType === 'plaintiff_counsel' && role === 'primary' && 
              'Lead attorney representing the plaintiff.'}
            {contactType === 'plaintiff_counsel' && role === 'secondary' && 
              'Co-counsel or associate attorney for plaintiff.'}
            {contactType === 'defense_counsel' && role === 'lead' && 
              'Lead defense attorney for the primary defendant.'}
            {contactType === 'defense_counsel' && role === 'co_counsel' && 
              'Co-counsel working with lead defense attorney.'}
            {contactType === 'defense_counsel' && role === 'co_defendant_counsel' && 
              'Attorney representing a co-defendant in the case.'}
            {contactType === 'expert' && role === 'retained' && 
              'Expert witness formally retained and expected to testify.'}
            {contactType === 'expert' && role === 'consulting' && 
              'Consulting expert providing guidance, may not testify.'}
            {contactType === 'medical_provider' && role === 'treating_physician' && 
              'Primary physician treating the plaintiff.'}
            {contactType === 'medical_provider' && role === 'facility' && 
              'Hospital, clinic, or medical facility contact.'}
            {contactType === 'medical_provider' && role === 'records_custodian' && 
              'Person responsible for releasing medical records.'}
            {contactType === 'witness' && role === 'fact' && 
              'Person with firsthand knowledge of case facts.'}
            {contactType === 'witness' && role === 'expert' && 
              'Expert witness providing specialized knowledge.'}
            {contactType === 'court_personnel' && role === 'judge' && 
              'Presiding judge for this case.'}
            {contactType === 'court_personnel' && role === 'clerk' && 
              'Court clerk handling case administration.'}
            {contactType === 'court_personnel' && role === 'staff_attorney' && 
              'Staff attorney assisting the court.'}
            {contactType === 'other' && 
              'Custom contact type for specialized case needs.'}
          </div>
        </div>
      )}
    </div>
  );
};
