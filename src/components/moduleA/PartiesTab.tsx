// PARTIES TAB - MODULE A PHASE 1D
// Dedicated Tier 2 tab for comprehensive party management
// Enhanced party details, investigation documents, contact integration

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';
import { AddPartyModal } from './AddPartyModal';
import type { Party } from '../../types/ModuleA';

// Import floral assets for unique screen design
import heroSunflower from '../../assets/florals/heroes/sunflowers-cluster.png';
import accentStems from '../../assets/florals/accents/sunflower-single.png';
import subtleSpray from '../../assets/florals/subtles/sunflowers-standing-small.png';

export const PartiesTab: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  
  // Store state
  const { 
    selectedCase,
    parties,
    isLoading, 
    error,
    selectCase,
    clearError 
  } = useCaseStore();

  // Local UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [expandedParty, setExpandedParty] = useState<number | null>(null);
  const [partyModalType, setPartyModalType] = useState<'plaintiff' | 'defendant'>('defendant');

  // Load case on mount
  useEffect(() => {
    const caseIdNum = parseInt(caseId || '0');
    if (caseIdNum && (!selectedCase || selectedCase.id !== caseIdNum)) {
      selectCase(caseIdNum);
    }
  }, [caseId, selectedCase, selectCase]);

  // Handle party actions
  const handleAddPlaintiff = () => {
    setEditingParty(null);
    setPartyModalType('plaintiff');
    setShowAddModal(true);
  };

  const handleAddDefendant = () => {
    setEditingParty(null);
    setPartyModalType('defendant');  
    setShowAddModal(true);
  };

  const handleEditParty = (party: Party) => {
    setEditingParty(party);
    setPartyModalType(party.party_type);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingParty(null);
  };

  const togglePartyExpansion = (partyId: number) => {
    setExpandedParty(expandedParty === partyId ? null : partyId);
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="relative min-h-full">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunflower-gold mx-auto"></div>
            <p className="mt-4 text-sunflower-brown">Loading parties...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-full">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="rounded-3xl bg-red-50/90 border border-red-200 px-6 py-4 shadow-sm backdrop-blur-sm">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={clearError}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCase) {
    return (
      <div className="relative min-h-full">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-sunflower-brown text-lg">Case not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Group parties by type
  const plaintiffs = parties.filter(p => p.party_type === 'plaintiff');
  const defendants = parties.filter(p => p.party_type === 'defendant');

  return (
    <div className="relative min-h-full">
      {/* Floral Backgrounds */}
      <img
        src={heroSunflower}
        className="absolute top-0 left-0 w-[420px] opacity-25 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={accentStems}
        className="absolute bottom-0 right-0 w-[280px] opacity-20 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={subtleSpray}
        className="absolute top-1/3 right-1/4 w-[150px] opacity-15 pointer-events-none select-none z-0"
        alt=""
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className={sunflowerTheme.typography.styles.pageTitle}>
              👥 Parties
            </h1>
            <p className={sunflowerTheme.typography.styles.muted + ' mt-2'}>
              Manage plaintiffs, defendants, and their information for {selectedCase.case_name}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddPlaintiff}
              className={sunflowerTheme.buttons.secondary}
            >
              ⊕ Add Plaintiff
            </button>
            <button
              onClick={handleAddDefendant}
              className={sunflowerTheme.buttons.primary}
            >
              ⊕ Add Defendant
            </button>
          </div>
        </div>

        {/* Parties Content */}
        {parties.length === 0 ? (
          <div className={sunflowerTheme.containers.card + ' px-6 py-12 text-center'}>
            <div className="text-6xl mb-4">👥</div>
            <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-4'}>No Parties Added Yet</h2>
            <p className={sunflowerTheme.typography.styles.muted + ' mb-6'}>
              Add plaintiffs and defendants to get started with case management.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleAddPlaintiff}
                className={sunflowerTheme.buttons.secondary}
              >
                Add Plaintiff
              </button>
              <button
                onClick={handleAddDefendant}
                className={sunflowerTheme.buttons.primary}
              >
                Add Defendant
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plaintiffs Section */}
            {plaintiffs.length > 0 && (
              <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
                <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
                  Plaintiffs ({plaintiffs.length})
                </h2>
                <div className="space-y-4">
                  {plaintiffs.map((party) => (
                    <div key={party.id} className="border border-blue-200 rounded-lg overflow-hidden">
                      {/* Party Header */}
                      <div 
                        className="bg-blue-50/50 p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => togglePartyExpansion(party.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                              {party.party_name}
                            </p>
                            {party.is_primary && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                Primary
                              </span>
                            )}
                            {party.is_corporate && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                                Corporate
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditParty(party);
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                            <span className="text-sunflower-brown/60">
                              {expandedParty === party.id ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Party Details */}
                      {expandedParty === party.id && (
                        <div className="bg-white p-4 border-t border-blue-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Party Type
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {party.party_type === 'plaintiff' ? 'Plaintiff' : 'Defendant'}
                              </p>
                            </div>
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Status
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {party.is_corporate ? 'Corporate Entity' : 'Individual'}
                                {party.is_primary && ' • Primary Party'}
                              </p>
                            </div>
                          </div>

                          {party.notes && (
                            <div className="mt-4">
                              <label className={sunflowerTheme.typography.styles.label}>
                                Notes
                              </label>
                              <p className={sunflowerTheme.typography.styles.body + ' whitespace-pre-wrap'}>
                                {party.notes}
                              </p>
                            </div>
                          )}

                          {/* Future: Document section placeholder */}
                          <div className="mt-6 pt-4 border-t border-blue-200">
                            <div className="flex items-center justify-between">
                              <h4 className={sunflowerTheme.typography.styles.h4}>
                                📎 Investigation Documents
                              </h4>
                              <button className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full">
                                Coming Soon
                              </button>
                            </div>
                            <p className="text-sm text-sunflower-brown/60 mt-2">
                              Upload documents like ISO reports, background checks, and more.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Defendants Section */}
            {defendants.length > 0 && (
              <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
                <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
                  Defendants ({defendants.length})
                </h2>
                <div className="space-y-4">
                  {defendants.map((party) => (
                    <div key={party.id} className="border border-red-200 rounded-lg overflow-hidden">
                      {/* Party Header */}
                      <div 
                        className="bg-red-50/50 p-4 cursor-pointer hover:bg-red-50 transition-colors"
                        onClick={() => togglePartyExpansion(party.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                              {party.party_name}
                            </p>
                            {party.is_primary && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                                Primary
                              </span>
                            )}
                            {party.is_corporate && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                                Corporate
                              </span>
                            )}
                            {party.is_insured && (
                              <span className={sunflowerTheme.badges.open}>Insured</span>
                            )}
                            {party.monitor_for_service && (
                              <span className="px-2 py-1 bg-sunflower-gold text-white text-xs rounded-full font-medium">
                                Monitor Service
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditParty(party);
                              }}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                            >
                              Edit
                            </button>
                            <span className="text-sunflower-brown/60">
                              {expandedParty === party.id ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Party Details */}
                      {expandedParty === party.id && (
                        <div className="bg-white p-4 border-t border-red-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Party Type
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                Defendant
                                {party.is_primary && ' (Primary)'}
                              </p>
                            </div>
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Insurance Status
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {party.is_insured ? 'Insured' : 'Not Insured'}
                              </p>
                            </div>
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Service Status
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {party.monitor_for_service ? 'Monitoring for Service' : 'Service Not Required'}
                              </p>
                            </div>
                            {party.service_date && (
                              <div>
                                <label className={sunflowerTheme.typography.styles.label}>
                                  Service Date
                                </label>
                                <p className={sunflowerTheme.typography.styles.body}>
                                  {new Date(party.service_date).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {party.notes && (
                            <div className="mt-4">
                              <label className={sunflowerTheme.typography.styles.label}>
                                Notes
                              </label>
                              <p className={sunflowerTheme.typography.styles.body + ' whitespace-pre-wrap'}>
                                {party.notes}
                              </p>
                            </div>
                          )}

                          {/* Future: Document section placeholder */}
                          <div className="mt-6 pt-4 border-t border-red-200">
                            <div className="flex items-center justify-between">
                              <h4 className={sunflowerTheme.typography.styles.h4}>
                                📎 Investigation Documents
                              </h4>
                              <button className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full">
                                Coming Soon
                              </button>
                            </div>
                            <p className="text-sm text-sunflower-brown/60 mt-2">
                              Upload documents like ISO reports, background checks, and more.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Party Modal */}
      <AddPartyModal
        isOpen={showAddModal}
        caseId={selectedCase?.id || null}
        party={editingParty || undefined}
        draftType={partyModalType}
        onClose={handleCloseModal}
        onSuccess={handleCloseModal}
      />
    </div>
  );
};
