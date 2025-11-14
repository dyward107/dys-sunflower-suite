// CONTACT DETAIL MODAL - MODULE A PHASE 1B
// Modal for viewing complete contact information
// Shows all contact details, case relationships, and provides action buttons

import React from 'react';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import type { Contact, CaseContact } from '../../types/ModuleA';
import { CONTACT_TYPE_LABELS, CONTACT_ROLE_LABELS, PREFERRED_CONTACT_LABELS } from '../../types/ModuleA';

interface ContactDetailModalProps {
  isOpen: boolean;
  contact: Contact | null;
  caseContact?: CaseContact; // If viewing from case context
  onClose: () => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: number) => void;
  onLinkToCase?: (contact: Contact) => void;
  onRemoveFromCase?: (caseContactId: number) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  isOpen,
  contact,
  caseContact,
  onClose,
  onEdit,
  onDelete,
  onLinkToCase,
  onRemoveFromCase
}) => {
  if (!isOpen || !contact) return null;

  const formatPhone = (phone: string) => {
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className={`${sunflowerTheme.containers.modal} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-sunflower-taupe/30">
          <div className="flex items-center gap-3">
            <h2 className={sunflowerTheme.typography.styles.h2}>
              📞 Contact Details
            </h2>
            {contact.is_favorite && (
              <span className="text-sunflower-gold text-xl" title="Favorite contact">
                ★
              </span>
            )}
            {contact.do_not_contact && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                Do Not Contact
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-sunflower-brown/60 hover:text-sunflower-brown text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className={sunflowerTheme.typography.styles.h3}>Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                  Name
                </label>
                <p className={`${sunflowerTheme.typography.styles.body} font-semibold mt-1`}>
                  {contact.name}
                </p>
              </div>

              {contact.organization && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Organization
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    {contact.organization}
                  </p>
                </div>
              )}

              {contact.title && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Title
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    {contact.title}
                  </p>
                </div>
              )}

              {/* Contact Type & Role */}
              {contact.contact_type && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Contact Type
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    {CONTACT_TYPE_LABELS[contact.contact_type]}
                  </p>
                </div>
              )}

              {contact.role && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Role
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    {CONTACT_ROLE_LABELS[contact.role] || contact.role}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-4">
            <h3 className={sunflowerTheme.typography.styles.h3}>Contact Methods</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.phone_primary && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Primary Phone
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    <a 
                      href={`tel:${contact.phone_primary}`}
                      className="text-sunflower-gold hover:text-sunflower-gold-dark transition-colors"
                    >
                      {formatPhone(contact.phone_primary)}
                    </a>
                    {contact.preferred_contact === 'phone' && (
                      <span className="ml-2 text-xs text-sunflower-green font-medium">(Preferred)</span>
                    )}
                  </p>
                </div>
              )}

              {contact.phone_secondary && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Secondary Phone
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    <a 
                      href={`tel:${contact.phone_secondary}`}
                      className="text-sunflower-gold hover:text-sunflower-gold-dark transition-colors"
                    >
                      {formatPhone(contact.phone_secondary)}
                    </a>
                  </p>
                </div>
              )}

              {contact.email_primary && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Primary Email
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    <a 
                      href={`mailto:${contact.email_primary}`}
                      className="text-sunflower-gold hover:text-sunflower-gold-dark transition-colors"
                    >
                      {contact.email_primary}
                    </a>
                    {contact.preferred_contact === 'email' && (
                      <span className="ml-2 text-xs text-sunflower-green font-medium">(Preferred)</span>
                    )}
                  </p>
                </div>
              )}

              {contact.email_secondary && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Secondary Email
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    <a 
                      href={`mailto:${contact.email_secondary}`}
                      className="text-sunflower-gold hover:text-sunflower-gold-dark transition-colors"
                    >
                      {contact.email_secondary}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {contact.address && (
              <div>
                <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                  Address
                </label>
                <p className={`${sunflowerTheme.typography.styles.body} mt-1 whitespace-pre-line`}>
                  {contact.address}
                </p>
              </div>
            )}
          </div>

          {/* Communication Preferences */}
          {(contact.preferred_contact || contact.best_times) && (
            <div className="space-y-4">
              <h3 className={sunflowerTheme.typography.styles.h3}>Communication Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.preferred_contact && (
                  <div>
                    <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                      Preferred Contact Method
                    </label>
                    <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                      {PREFERRED_CONTACT_LABELS[contact.preferred_contact]}
                    </p>
                  </div>
                )}

                {contact.best_times && (
                  <div>
                    <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                      Best Times to Contact
                    </label>
                    <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                      {contact.best_times}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Case-Specific Information */}
          {caseContact && (
            <div className="space-y-4 p-4 bg-sunflower-cream/30 rounded-xl">
              <h3 className={sunflowerTheme.typography.styles.h3}>Case Relationship</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Case Role
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    {CONTACT_TYPE_LABELS[caseContact.contact_type]} - {CONTACT_ROLE_LABELS[caseContact.role] || caseContact.role}
                    {caseContact.is_primary && (
                      <span className="ml-2 px-2 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full">
                        Primary
                      </span>
                    )}
                  </p>
                </div>

                {caseContact.relationship_start_date && (
                  <div>
                    <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                      Relationship Started
                    </label>
                    <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                      {new Date(caseContact.relationship_start_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {caseContact.relationship_end_date && (
                  <div>
                    <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                      Relationship Ended
                    </label>
                    <p className={`${sunflowerTheme.typography.styles.body} mt-1 text-red-600`}>
                      {new Date(caseContact.relationship_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {caseContact.notes && (
                <div>
                  <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                    Case-Specific Notes
                  </label>
                  <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                    {caseContact.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* General Notes */}
          {contact.notes && (
            <div>
              <label className={`${sunflowerTheme.typography.styles.label} text-sunflower-brown/60`}>
                General Notes
              </label>
              <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                {contact.notes}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-sunflower-taupe/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-sunflower-brown/60">
              <div>
                <span className="font-medium">Created:</span> {new Date(contact.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(contact.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t border-sunflower-taupe/30 bg-white">
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={() => {
                  onClose(); // Close detail modal first
                  onEdit(contact); // Then trigger edit modal
                }}
                className={sunflowerTheme.buttons.secondary}
              >
                ✏️ Edit Contact
              </button>
            )}
            {onLinkToCase && !caseContact && (
              <button
                onClick={() => onLinkToCase(contact)}
                className={sunflowerTheme.buttons.primary}
              >
                🔗 Link to Case
              </button>
            )}
            {onRemoveFromCase && caseContact && (
              <button
                onClick={() => onRemoveFromCase(caseContact.id)}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors font-medium"
              >
                🗑️ Remove from Case
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {onDelete && !caseContact && (
              <button
                onClick={() => onDelete(contact.id)}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-colors font-medium"
              >
                🗑️ Delete Contact
              </button>
            )}
            <button
              onClick={onClose}
              className={sunflowerTheme.buttons.secondary}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
