// CONTACT CARD COMPONENT - MODULE A PHASE 1B
// Reusable contact display card with sunflower design system
// Displays contact information with type/role badges and actions

import React from 'react';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import type { Contact, CaseContact, ContactType, ContactRole } from '../../types/ModuleA';
import { CONTACT_TYPE_LABELS, CONTACT_ROLE_LABELS, PREFERRED_CONTACT_LABELS } from '../../types/ModuleA';

interface ContactCardProps {
  contact: Contact;
  caseContact?: CaseContact; // Optional case-specific relationship info
  showActions?: boolean;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: number) => void;
  onLinkToCase?: (contact: Contact) => void;
  onEditCaseLink?: (caseContact: CaseContact) => void;
  onRemoveFromCase?: (caseContactId: number) => void;
  onViewDetails?: (contact: Contact, caseContact?: CaseContact) => void;
  className?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  caseContact,
  showActions = true,
  onEdit,
  onDelete,
  onLinkToCase,
  onEditCaseLink,
  onRemoveFromCase,
  onViewDetails,
  className = ''
}) => {
  // Helper to get contact type badge styling
  const getContactTypeBadge = (type: ContactType, role: ContactRole) => {
    const typeLabel = CONTACT_TYPE_LABELS[type] || type;
    const roleLabel = CONTACT_ROLE_LABELS[role] || role;
    
    const badgeColors: Record<ContactType | 'default', string> = {
      adjuster: 'bg-blue-100 text-blue-800',
      tpa_agent: 'bg-slate-100 text-slate-800',
      corporate_rep: 'bg-teal-100 text-teal-800',
      insurance_broker: 'bg-amber-100 text-amber-800',
      plaintiff_counsel: 'bg-green-100 text-green-800', 
      defense_counsel: 'bg-purple-100 text-purple-800',
      expert: 'bg-orange-100 text-orange-800',
      investigator: 'bg-slate-100 text-slate-800',
      medical_provider: 'bg-red-100 text-red-800',
      witness: 'bg-yellow-100 text-yellow-800',
      court_personnel: 'bg-gray-100 text-gray-800',
      mediator_arbitrator: 'bg-pink-100 text-pink-800',
      vendor: 'bg-sunflower-taupe-light text-sunflower-brown',
      other: 'bg-sunflower-taupe-light text-sunflower-brown',
      default: 'bg-sunflower-taupe-light text-sunflower-brown'
    };

    const colorClass = badgeColors[type] || badgeColors.default;

    return (
      <div className="flex flex-wrap gap-1">
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${colorClass}`}>
          {typeLabel}
        </span>
        <span className="px-2 py-1 text-xs rounded-full font-medium bg-sunflower-gold/20 text-sunflower-brown">
          {roleLabel}
        </span>
        {caseContact?.is_primary && (
          <span className="px-2 py-1 text-xs rounded-full font-medium bg-sunflower-gold text-white">
            Primary
          </span>
        )}
      </div>
    );
  };

  // Helper to format phone numbers for display
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(contact, caseContact);
    }
  };

  return (
    <div 
      className={`${sunflowerTheme.containers.card} p-4 hover:shadow-lg transition-shadow duration-200 ${onViewDetails ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleCardClick}
    >
      {/* Header with name and actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className={`${sunflowerTheme.typography.styles.body} font-semibold text-sunflower-brown`}>
            {contact.name}
            {contact.is_favorite && (
              <span className="ml-2 text-sunflower-gold" title="Favorite contact">
                ★
              </span>
            )}
            {contact.do_not_contact && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                Do Not Contact
              </span>
            )}
          </h3>
          {contact.organization && (
            <p className={`${sunflowerTheme.typography.styles.muted} text-sm mt-1`}>
              {contact.title ? `${contact.title} at ${contact.organization}` : contact.organization}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contact);
                }}
                className="p-1 text-sunflower-gold hover:text-sunflower-gold-dark transition-colors"
                title="Edit Contact"
              >
                ✏️
              </button>
            )}
            {onLinkToCase && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLinkToCase(contact);
                }}
                className="p-1 text-sunflower-green hover:text-sunflower-green/80 transition-colors"
                title="Link to Case"
              >
                🔗
              </button>
            )}
            {onEditCaseLink && caseContact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCaseLink(caseContact);
                }}
                className="p-1 text-sunflower-brown hover:text-sunflower-brown/80 transition-colors"
                title="Edit Case Link"
              >
                ⚙️
              </button>
            )}
            {onRemoveFromCase && caseContact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCase(caseContact.id);
                }}
                className="p-1 text-red-500 hover:text-red-600 transition-colors"
                title="Remove from Case"
              >
                🗑️
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(contact.id);
                }}
                className="p-1 text-red-500 hover:text-red-600 transition-colors"
                title="Delete Contact"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contact type and role badges */}
      {caseContact && (
        <div className="mb-3">
          {getContactTypeBadge(caseContact.contact_type, caseContact.role)}
        </div>
      )}

      {/* Contact information */}
      <div className="space-y-2">
        {/* Primary contact method */}
        {contact.email_primary && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-sunflower-brown/60 min-w-[20px]">📧</span>
            <a 
              href={`mailto:${contact.email_primary}`}
              className="text-sunflower-gold hover:text-sunflower-gold-dark transition-colors"
            >
              {contact.email_primary}
            </a>
            {contact.preferred_contact === 'email' && (
              <span className="text-xs text-sunflower-green font-medium">(Preferred)</span>
            )}
          </div>
        )}

        {contact.phone_primary && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-sunflower-brown/60 min-w-[20px]">📞</span>
            <a 
              href={`tel:${contact.phone_primary}`}
              className="text-sunflower-gold hover:text-sunflower-gold-dark transition-colors"
            >
              {formatPhone(contact.phone_primary)}
            </a>
            {contact.preferred_contact === 'phone' && (
              <span className="text-xs text-sunflower-green font-medium">(Preferred)</span>
            )}
          </div>
        )}

        {/* Secondary contact methods */}
        {contact.email_secondary && (
          <div className="flex items-center gap-2 text-sm text-sunflower-brown/70">
            <span className="text-sunflower-brown/40 min-w-[20px]">📧</span>
            <a 
              href={`mailto:${contact.email_secondary}`}
              className="hover:text-sunflower-gold transition-colors"
            >
              {contact.email_secondary}
            </a>
            <span className="text-xs">(Secondary)</span>
          </div>
        )}

        {contact.phone_secondary && (
          <div className="flex items-center gap-2 text-sm text-sunflower-brown/70">
            <span className="text-sunflower-brown/40 min-w-[20px]">📞</span>
            <a 
              href={`tel:${contact.phone_secondary}`}
              className="hover:text-sunflower-gold transition-colors"
            >
              {formatPhone(contact.phone_secondary)}
            </a>
            <span className="text-xs">(Secondary)</span>
          </div>
        )}

        {/* Address */}
        {contact.address && (
          <div className="flex items-start gap-2 text-sm text-sunflower-brown/70">
            <span className="text-sunflower-brown/40 min-w-[20px] mt-0.5">📍</span>
            <span className="whitespace-pre-line">{contact.address}</span>
          </div>
        )}

        {/* Preferred contact method and best times */}
        {(contact.preferred_contact || contact.best_times) && (
          <div className="pt-2 border-t border-sunflower-taupe/30">
            {contact.preferred_contact && (
              <p className="text-xs text-sunflower-brown/60">
                <span className="font-medium">Preferred:</span> {PREFERRED_CONTACT_LABELS[contact.preferred_contact]}
              </p>
            )}
            {contact.best_times && (
              <p className="text-xs text-sunflower-brown/60 mt-1">
                <span className="font-medium">Best times:</span> {contact.best_times}
              </p>
            )}
          </div>
        )}

        {/* Case-specific relationship info */}
        {caseContact && (
          <div className="pt-2 border-t border-sunflower-taupe/30">
            {caseContact.relationship_start_date && (
              <p className="text-xs text-sunflower-brown/60">
                <span className="font-medium">Relationship started:</span> {new Date(caseContact.relationship_start_date).toLocaleDateString()}
              </p>
            )}
            {caseContact.relationship_end_date && (
              <p className="text-xs text-red-600">
                <span className="font-medium">Relationship ended:</span> {new Date(caseContact.relationship_end_date).toLocaleDateString()}
              </p>
            )}
            {caseContact.notes && (
              <p className="text-xs text-sunflower-brown/60 mt-1">
                <span className="font-medium">Case notes:</span> {caseContact.notes}
              </p>
            )}
          </div>
        )}

        {/* General notes */}
        {contact.notes && (
          <div className="pt-2 border-t border-sunflower-taupe/30">
            <p className="text-xs text-sunflower-brown/60">
              <span className="font-medium">Notes:</span> {contact.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
