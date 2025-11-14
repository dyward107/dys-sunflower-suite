// CASE CONTACT MANAGER - MODULE A PHASE 1B
// Case-specific contact management (Tier 2 navigation)
// Manages contacts linked to a specific case with their roles and relationships

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';
import { ContactCard } from './ContactCard';
import { AddContactModal } from './AddContactModal';
import { EditContactModal } from './EditContactModal';
import { LinkContactToCase } from './LinkContactToCase';
import type { Contact, CaseContact, ContactType } from '../../types/ModuleA';
import { CONTACT_TYPES, CONTACT_TYPE_LABELS } from '../../types/ModuleA';

// Import floral assets for unique screen design
import heroSunflower from '../../assets/florals/heroes/sunflower-large-leaves.png';
import accentBud from '../../assets/florals/accents/sunflower-bud.png';
import subtleStems from '../../assets/florals/subtles/sunflowers-standing-small.png';

export const CaseContactManager: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  
  // Store state
  const { 
    selectedCase,
    contacts,
    caseContacts,
    isLoading, 
    error,
    selectCase,
    loadContacts,
    loadContactsForCase,
    removeCaseContactRelationship,
    clearError 
  } = useCaseStore();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContactType | ''>('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<'linked' | 'available'>('linked');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [contactToLink, setContactToLink] = useState<Contact | null>(null);

  // Load case and contacts on mount
  useEffect(() => {
    const caseIdNum = parseInt(caseId || '0');
    if (caseIdNum && (!selectedCase || selectedCase.id !== caseIdNum)) {
      selectCase(caseIdNum);
    }
    loadContacts(); // Load global contacts for linking
  }, [caseId, selectedCase, selectCase, loadContacts]);

  // Reload case contacts when case changes
  useEffect(() => {
    if (selectedCase) {
      loadContactsForCase(selectedCase.id);
    }
  }, [selectedCase, loadContactsForCase]);

  // Handle search for available contacts
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the contacts array
  };

  // Handle contact actions
  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };

  const handleLinkContact = (contact: Contact) => {
    setContactToLink(contact);
    setShowLinkModal(true);
  };

  const handleRemoveFromCase = async (caseContactId: number) => {
    if (window.confirm('Are you sure you want to remove this contact from the case?')) {
      await removeCaseContactRelationship(caseContactId);
      if (selectedCase) {
        await loadContactsForCase(selectedCase.id);
      }
    }
  };

  // Handle modal success callbacks
  const handleAddSuccess = async () => {
    await loadContacts();
  };

  const handleEditSuccess = async () => {
    await loadContacts();
    if (selectedCase) {
      await loadContactsForCase(selectedCase.id);
    }
  };

  const handleLinkSuccess = async () => {
    if (selectedCase) {
      await loadContactsForCase(selectedCase.id);
    }
    setContactToLink(null);
  };

  // Close modals
  const handleCloseAddModal = () => setShowAddModal(false);
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedContact(null);
  };
  const handleCloseLinkModal = () => {
    setShowLinkModal(false);
    setContactToLink(null);
  };

  // Get contacts linked to this case
  const linkedContacts = caseContacts.filter(caseContact => {
    if (filterType && caseContact.contact_type !== filterType) {
      return false;
    }
    return true;
  });

  // Get available contacts (not yet linked to this case)
  const linkedContactIds = new Set(caseContacts.map(cc => cc.contact_id));
  const availableContacts = contacts.filter(contact => {
    if (linkedContactIds.has(contact.id)) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        contact.name.toLowerCase().includes(query) ||
        contact.organization?.toLowerCase().includes(query) ||
        contact.email_primary?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  // Group linked contacts by type
  const contactsByType = linkedContacts.reduce((acc, caseContact) => {
    const type = caseContact.contact_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(caseContact);
    return acc;
  }, {} as Record<ContactType, CaseContact[]>);

  if (!selectedCase) {
    return (
      <div className="text-center py-12">
        <div className="text-sunflower-brown">Loading case...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* Floral Backgrounds - Unique placement for Case Contact Manager */}
      <img
        src={heroSunflower}
        className="absolute top-0 left-0 w-[300px] opacity-22 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={accentBud}
        className="absolute bottom-0 right-0 w-[160px] opacity-18 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={subtleStems}
        className="absolute top-1/2 right-0 w-[100px] opacity-12 pointer-events-none select-none z-0"
        alt=""
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className={sunflowerTheme.typography.styles.pageTitle}>
              📞 Case Contacts
            </h2>
            <p className={`${sunflowerTheme.typography.styles.muted} mt-2`}>
              Contacts for <strong>{selectedCase.case_name}</strong> • {linkedContacts.length} linked
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className={sunflowerTheme.buttons.secondary}
            >
              + New Contact
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'linked' ? 'available' : 'linked')}
              className={sunflowerTheme.buttons.primary}
            >
              {viewMode === 'linked' ? 'Link Existing' : 'View Linked'}
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-4 p-4 bg-white/60 rounded-2xl border border-sunflower-taupe/40">
          <button
            onClick={() => setViewMode('linked')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              viewMode === 'linked' 
                ? 'bg-sunflower-gold text-white shadow-sm' 
                : 'text-sunflower-brown hover:bg-sunflower-beige/40'
            }`}
          >
            Linked Contacts ({linkedContacts.length})
          </button>
          <button
            onClick={() => setViewMode('available')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              viewMode === 'available' 
                ? 'bg-sunflower-gold text-white shadow-sm' 
                : 'text-sunflower-brown hover:bg-sunflower-beige/40'
            }`}
          >
            Available to Link ({availableContacts.length})
          </button>
        </div>

        {/* Filters for Linked View */}
        {viewMode === 'linked' && (
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContactType)}
              className={sunflowerTheme.inputs.select}
            >
              <option value="">All Contact Types</option>
              {CONTACT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CONTACT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {filterType && (
              <button
                onClick={() => setFilterType('')}
                className={sunflowerTheme.buttons.secondary}
              >
                Clear Filter
              </button>
            )}
          </div>
        )}

        {/* Search for Available View */}
        {viewMode === 'available' && (
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search available contacts..."
              className={sunflowerTheme.inputs.search}
            />
            <button
              type="submit"
              className={sunflowerTheme.buttons.primary}
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={sunflowerTheme.buttons.secondary}
              >
                Clear
              </button>
            )}
          </form>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
            <button
              onClick={clearError}
              className="ml-2 text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 text-sunflower-brown">
            Loading contacts...
          </div>
        )}

        {/* Linked Contacts View */}
        {viewMode === 'linked' && !isLoading && (
          <>
            {linkedContacts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-6xl mb-4">📞</div>
                <p className="text-sunflower-brown/70 mb-4">
                  No contacts linked to this case yet.
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setViewMode('available')} 
                    className={sunflowerTheme.buttons.primary}
                  >
                    Link Existing Contact
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)} 
                    className={sunflowerTheme.buttons.secondary}
                  >
                    Create New Contact
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Group by contact type */}
                {Object.entries(contactsByType).map(([type, typeContacts]) => (
                  <div key={type} className="space-y-4">
                    <h3 className={`${sunflowerTheme.typography.styles.h3} flex items-center gap-2`}>
                      {CONTACT_TYPE_LABELS[type as ContactType]} ({typeContacts.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {typeContacts.map((caseContact) => (
                        <ContactCard
                          key={caseContact.id}
                          contact={caseContact.contact!}
                          caseContact={caseContact}
                          onEdit={handleEditContact}
                          onRemoveFromCase={handleRemoveFromCase}
                          showActions={true}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Available Contacts View */}
        {viewMode === 'available' && !isLoading && (
          <>
            {availableContacts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-6xl mb-4">🔗</div>
                <p className="text-sunflower-brown/70 mb-4">
                  {searchQuery 
                    ? 'No available contacts match your search.'
                    : 'All contacts are already linked to this case.'}
                </p>
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className={sunflowerTheme.buttons.primary}
                >
                  Create New Contact
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className={sunflowerTheme.typography.styles.muted}>
                  Click on a contact to link them to this case:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onLinkToCase={handleLinkContact}
                      showActions={false}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
      />

      <EditContactModal
        isOpen={showEditModal}
        contact={selectedContact}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      <LinkContactToCase
        isOpen={showLinkModal}
        contact={contactToLink}
        caseId={selectedCase?.id || null}
        onClose={handleCloseLinkModal}
        onSuccess={handleLinkSuccess}
      />
    </div>
  );
};
