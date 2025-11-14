// CONTACT MANAGER - MODULE A PHASE 1B
// Global contact database (Tier 1 navigation)
// Practice-wide contact management with search, filtering, and CRUD operations

import React, { useState, useEffect } from 'react';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';
import { ContactCard } from './ContactCard';
import { AddContactModal } from './AddContactModal';
import { EditContactModal } from './EditContactModal';
import { LinkContactToCase } from './LinkContactToCase';
import { SelectCaseModal } from './SelectCaseModal';
import type { Contact, ContactFilters, ContactType, PreferredContact } from '../../types/ModuleA';
import { CONTACT_TYPES, CONTACT_TYPE_LABELS, PREFERRED_CONTACT_METHODS, PREFERRED_CONTACT_LABELS } from '../../types/ModuleA';

// Import floral assets for unique screen design
import heroSunflower from '../../assets/florals/heroes/sunflowers-cluster.png';
import accentBud from '../../assets/florals/accents/sunflower-single.png';
import subtleStems from '../../assets/florals/subtles/stem-leaves.png';

export const ContactManager: React.FC = () => {
  // Store state
  const { 
    contacts, 
    cases,
    isLoading, 
    error,
    loadContacts, 
    searchContacts,
    deleteContact,
    loadCases,
    clearError 
  } = useCaseStore();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToLink, setContactToLink] = useState<Contact | null>(null);
  const [targetCaseId, setTargetCaseId] = useState<number | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSelectCaseModal, setShowSelectCaseModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Load contacts and cases on mount
  useEffect(() => {
    loadContacts();
    loadCases(); // Needed for linking contacts to cases
  }, [loadContacts, loadCases]);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchContacts(searchQuery);
    } else {
      await loadContacts(filters);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof ContactFilters, value: any) => {
    const newFilters = { ...filters, [field]: value || undefined };
    setFilters(newFilters);
  };

  // Apply filters
  const handleApplyFilters = async () => {
    await loadContacts(filters);
  };

  // Clear filters
  const handleClearFilters = async () => {
    setFilters({});
    await loadContacts();
  };

  // Handle contact actions
  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowEditModal(true);
  };

  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm('Are you sure you want to delete this contact? This will remove all case relationships as well.')) {
      await deleteContact(contactId);
      await loadContacts(filters);
    }
  };

  const handleLinkToCase = (contact: Contact) => {
    setContactToLink(contact);
    setShowSelectCaseModal(true);
  };

  const handleCaseSelection = (caseId: number) => {
    setTargetCaseId(caseId);
    setShowSelectCaseModal(false);
    setShowLinkModal(true);
  };

  const handleSelectCaseClose = () => {
    setShowSelectCaseModal(false);
    setContactToLink(null);
  };

  // Handle modal success callbacks
  const handleAddSuccess = async () => {
    await loadContacts(filters);
  };

  const handleEditSuccess = async () => {
    await loadContacts(filters);
  };

  const handleLinkSuccess = async () => {
    await loadContacts(filters);
    setContactToLink(null);
    setTargetCaseId(null);
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
    setTargetCaseId(null);
  };

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        contact.name.toLowerCase().includes(query) ||
        contact.organization?.toLowerCase().includes(query) ||
        contact.email_primary?.toLowerCase().includes(query) ||
        contact.phone_primary?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    return true;
  });

  return (
    <div className="relative min-h-full">
      {/* Floral Backgrounds - Unique placement for Contact Manager */}
      <img
        src={heroSunflower}
        className="absolute top-0 right-0 w-[350px] opacity-25 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={accentBud}
        className="absolute bottom-0 left-0 w-[180px] opacity-20 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={subtleStems}
        className="absolute top-1/3 left-0 w-[120px] opacity-15 pointer-events-none select-none z-0"
        alt=""
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className={sunflowerTheme.typography.styles.pageTitle}>
              📞 Contact Database
            </h2>
            <p className={`${sunflowerTheme.typography.styles.muted} mt-2`}>
              Practice-wide contact management • {contacts.length} contacts
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className={sunflowerTheme.buttons.primary}
            >
              + New Contact
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={sunflowerTheme.buttons.secondary}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, organization, email, or phone..."
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
              onClick={() => {
                setSearchQuery('');
                loadContacts(filters);
              }}
              className={sunflowerTheme.buttons.secondary}
            >
              Clear
            </button>
          )}
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="rounded-3xl border border-sunflower-taupe/80 bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Contact Type Filter */}
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Contact Type
                </label>
                <select
                  value={filters.contact_type || ''}
                  onChange={(e) => handleFilterChange('contact_type', e.target.value as ContactType)}
                  className={sunflowerTheme.inputs.select + ' mt-1'}
                >
                  <option value="">All Types</option>
                  {CONTACT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {CONTACT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Contact Method Filter */}
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Preferred Contact Method
                </label>
                <select
                  value={filters.preferred_contact || ''}
                  onChange={(e) => handleFilterChange('preferred_contact', e.target.value as PreferredContact)}
                  className={sunflowerTheme.inputs.select + ' mt-1'}
                >
                  <option value="">All Methods</option>
                  {PREFERRED_CONTACT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {PREFERRED_CONTACT_LABELS[method]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Do Not Contact Filter */}
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Contact Status
                </label>
                <select
                  value={filters.do_not_contact !== undefined ? (filters.do_not_contact ? 'true' : 'false') : ''}
                  onChange={(e) => handleFilterChange('do_not_contact', 
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )}
                  className={sunflowerTheme.inputs.select + ' mt-1'}
                >
                  <option value="">All Contacts</option>
                  <option value="false">Available for Contact</option>
                  <option value="true">Do Not Contact</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleApplyFilters}
                className={sunflowerTheme.buttons.primary}
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className={sunflowerTheme.buttons.secondary}
              >
                Clear All
              </button>
            </div>
          </div>
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

        {/* Empty State */}
        {!isLoading && filteredContacts.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-6xl mb-4">📞</div>
            <p className="text-sunflower-brown/70 mb-4">
              {searchQuery || Object.keys(filters).length > 0 
                ? 'No contacts match your search criteria.' 
                : 'No contacts in the database yet.'}
            </p>
            <button 
              onClick={() => setShowAddModal(true)} 
              className={sunflowerTheme.buttons.primary}
            >
              + Add First Contact
            </button>
          </div>
        )}

        {/* Contact Grid */}
        {!isLoading && filteredContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onLinkToCase={handleLinkToCase}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Contact Count Summary */}
        {!isLoading && filteredContacts.length > 0 && (
          <div className="text-center pt-6 border-t border-sunflower-taupe/30">
            <p className={sunflowerTheme.typography.styles.muted}>
              Showing {filteredContacts.length} of {contacts.length} contacts
            </p>
          </div>
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

      <SelectCaseModal
        isOpen={showSelectCaseModal}
        contact={contactToLink}
        onClose={handleSelectCaseClose}
        onCaseSelected={handleCaseSelection}
      />

      <LinkContactToCase
        isOpen={showLinkModal}
        contact={contactToLink}
        caseId={targetCaseId}
        onClose={handleCloseLinkModal}
        onSuccess={handleLinkSuccess}
      />
    </div>
  );
};
