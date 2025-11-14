// CASE DETAIL COMPONENT - MODULE A PHASE 1A
// Dy's Sunflower Suite v5.1
// Displays detailed view of a case with parties and policies
// UPDATED: Now using sunflower design system + AppLayout

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { DispositionModal } from './disposition/DispositionModal';

// Floral assets
import heroSunflower from '../../assets/florals/heroes/sunflowers-cluster.png';
import accentSingle from '../../assets/florals/accents/sunflower-single.png';
import subtleStems from '../../assets/florals/subtles/sunflowers-standing-small.png';

export const CaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const {
    selectedCase,
    parties,
    policies,
    disposition,
    caseContacts,
    contacts,
    isLoading,
    error,
    selectCase,
    clearSelectedCase,
    loadContactsForCase,
    loadContacts
  } = useCaseStore();

  const [showDispositionModal, setShowDispositionModal] = useState(false);

  useEffect(() => {
    if (caseId) {
      selectCase(parseInt(caseId));
    }
    return () => {
      clearSelectedCase();
    };
  }, [caseId]);

  // Load contacts when case is selected
  useEffect(() => {
    if (selectedCase) {
      loadContactsForCase(selectedCase.id);
      loadContacts(); // Load global contacts for linking
    }
  }, [selectedCase, loadContactsForCase, loadContacts]);

  const handleEdit = () => {
    navigate(`/cases/${caseId}/edit`);
  };

  const handleBack = () => {
    navigate('/cases');
  };

  const handleLinkContact = (contact: any) => {
    // Navigate to the contacts tab for this case
    navigate(`/cases/${caseId}/contacts`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <p className="text-sunflower-brown text-lg">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-3xl bg-red-50/90 border border-red-200 px-6 py-4 shadow-sm backdrop-blur-sm">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedCase) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <p className="text-sunflower-brown text-lg">Case not found</p>
          <button onClick={handleBack} className={sunflowerTheme.buttons.secondary + ' mt-4'}>
            ← Back to Cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* Floral Backgrounds */}
      <img
        src={heroSunflower}
        className="absolute top-0 left-0 w-[380px] opacity-28 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={accentSingle}
        className="absolute bottom-0 right-0 w-[220px] opacity-22 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={subtleStems}
        className="absolute top-0 right-0 w-[180px] opacity-18 pointer-events-none select-none z-0"
        alt=""
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Navigation and Case Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <button
              onClick={handleBack}
              className="text-sunflower-gold hover:text-sunflower-gold-dark mb-3 inline-flex items-center gap-2 transition-colors font-medium"
            >
              ← Back to Cases
            </button>
            <h2 className={sunflowerTheme.typography.styles.pageTitle}>
              {selectedCase.case_name}
            </h2>
            <p className={sunflowerTheme.typography.styles.muted + ' mt-2'}>
              CM# {selectedCase.cm_number}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className={sunflowerTheme.buttons.secondary}
            >
              Edit Case
            </button>
            {/* Show "Start Disposition" button only for open cases */}
            {selectedCase.phase === 'Open' && (
              <button
                onClick={() => setShowDispositionModal(true)}
                className={sunflowerTheme.buttons.primary}
              >
                Start Disposition
              </button>
            )}
            {/* Show "View Disposition" button for closed cases */}
            {selectedCase.phase === 'Closed' && disposition && (
              <button
                onClick={() => setShowDispositionModal(true)}
                className={sunflowerTheme.buttons.secondary}
              >
                View Disposition
              </button>
            )}
          </div>
        </div>

        {/* Case Information */}
        <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
          <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
            📋 CASE DETAILS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Lead Attorney</label>
              <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                {selectedCase.lead_attorney}
              </p>
            </div>
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Phase</label>
              <p className="mt-1">
                <span className={
                  selectedCase.phase === 'Open' ? sunflowerTheme.badges.open :
                  selectedCase.phase === 'Pending' ? sunflowerTheme.badges.pending :
                  sunflowerTheme.badges.closed
                }>
                  {selectedCase.phase}
                </span>
              </p>
            </div>
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Status</label>
              <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                {selectedCase.status}
              </p>
            </div>
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Case Type</label>
              <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                {selectedCase.case_type}
                {selectedCase.case_subtype && ` - ${selectedCase.case_subtype}`}
              </p>
            </div>
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Date Opened</label>
              <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                {new Date(selectedCase.date_opened).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Date of Loss</label>
              <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                {new Date(selectedCase.date_of_loss).toLocaleDateString()}
              </p>
            </div>
            {selectedCase.date_closed && (
              <div>
                <label className={sunflowerTheme.typography.styles.label}>Date Closed</label>
                <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                  {new Date(selectedCase.date_closed).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Venue Information */}
          <div className="mt-8 pt-6 border-t border-sunflower-taupe/40">
            <h3 className={sunflowerTheme.typography.styles.h3 + ' mb-4'}>Venue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={sunflowerTheme.typography.styles.label}>Court</label>
                <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                  {selectedCase.venue_court}
                </p>
              </div>
              {selectedCase.venue_judge && (
                <div>
                  <label className={sunflowerTheme.typography.styles.label}>Judge</label>
                  <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                    {selectedCase.venue_judge}
                  </p>
                </div>
              )}
              {selectedCase.venue_clerk && (
                <div>
                  <label className={sunflowerTheme.typography.styles.label}>Clerk</label>
                  <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                    {selectedCase.venue_clerk}
                  </p>
                </div>
              )}
              {selectedCase.venue_staff_attorney && (
                <div>
                  <label className={sunflowerTheme.typography.styles.label}>
                    Staff Attorney
                  </label>
                  <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                    {selectedCase.venue_staff_attorney}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Discovery Information */}
          {selectedCase.discovery_close_date && (
            <div className="mt-8 pt-6 border-t border-sunflower-taupe/40">
              <h3 className={sunflowerTheme.typography.styles.h3 + ' mb-4'}>Discovery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={sunflowerTheme.typography.styles.label}>Close Date</label>
                  <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                    {new Date(selectedCase.discovery_close_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className={sunflowerTheme.typography.styles.label}>
                    Deadline Extended
                  </label>
                  <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                    {selectedCase.discovery_deadline_extended ? 'Yes' : 'No'}
                  </p>
                </div>
                {selectedCase.discovery_deadline_notes && (
                  <div className="md:col-span-2">
                    <label className={sunflowerTheme.typography.styles.label}>Notes</label>
                    <p className={sunflowerTheme.typography.styles.body + ' mt-1'}>
                      {selectedCase.discovery_deadline_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Special Flags */}
          <div className="mt-8 pt-6 border-t border-sunflower-taupe/40">
            <h3 className={sunflowerTheme.typography.styles.h3 + ' mb-4'}>
              Special Considerations
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedCase.is_wrongful_death && (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                  Wrongful Death
                </span>
              )}
              {selectedCase.is_survival_action && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                  Survival Action
                </span>
              )}
              {selectedCase.has_deceased_defendants && (
                <span className={sunflowerTheme.badges.default}>
                  Deceased Defendants
                </span>
              )}
              {/* Show message if no special considerations */}
              {!selectedCase.is_wrongful_death && !selectedCase.is_survival_action && !selectedCase.has_deceased_defendants && (
                <span className="text-sunflower-brown/60 italic text-sm">
                  No special considerations
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {selectedCase.notes && (
            <div className="mt-8 pt-6 border-t border-sunflower-taupe/40">
              <label className={sunflowerTheme.typography.styles.label}>Notes</label>
              <p className={sunflowerTheme.typography.styles.body + ' mt-2 whitespace-pre-wrap'}>
                {selectedCase.notes}
              </p>
            </div>
          )}
        </div>

        {/* Parties */}
        <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
          <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
            👥 PARTIES
          </h2>
          {parties.length === 0 ? (
            <p className={sunflowerTheme.typography.styles.muted}>No parties added yet.</p>
          ) : (
            <div className="space-y-6">
              {/* Plaintiffs */}
              <div>
                <h3 className={sunflowerTheme.typography.styles.h3 + ' mb-3'}>Plaintiffs</h3>
                <div className="space-y-3">
                  {parties
                    .filter((p) => p.party_type === 'plaintiff')
                    .map((party) => (
                      <div
                        key={party.id}
                        className="border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg pl-4 pr-4 py-3"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                            {party.party_name}
                          </p>
                          {party.is_primary && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Defendants */}
              <div>
                <h3 className={sunflowerTheme.typography.styles.h3 + ' mb-3'}>Defendants</h3>
                <div className="space-y-3">
                  {parties
                    .filter((p) => p.party_type === 'defendant')
                    .map((party) => (
                      <div
                        key={party.id}
                        className="border-l-4 border-red-500 bg-red-50/50 rounded-r-lg pl-4 pr-4 py-3"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                            {party.party_name}
                          </p>
                          {party.is_primary && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                              Primary
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
                        {party.service_date && (
                          <p className={sunflowerTheme.typography.styles.muted + ' text-sm'}>
                            Served: {new Date(party.service_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Policies */}
        <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
          <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
            🏦 POLICIES
          </h2>
          {policies.length === 0 ? (
            <p className={sunflowerTheme.typography.styles.muted}>No policies added yet.</p>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="border border-sunflower-taupe/60 rounded-2xl p-5 bg-white/60 hover:bg-sunflower-beige/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                    <div className="flex-1">
                      <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                        {policy.carrier_name}
                      </p>
                      <p className={sunflowerTheme.typography.styles.muted + ' text-sm mt-1'}>
                        Policy # {policy.policy_number}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        policy.policy_type === 'Primary'
                          ? 'bg-sunflower-gold text-white'
                          : policy.policy_type === 'UM/UIM'
                          ? 'bg-sunflower-taupe text-sunflower-brown'
                          : 'bg-sunflower-green/70 text-sunflower-brown'
                      }`}
                    >
                      {policy.policy_type}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {policy.policy_limits && (
                      <p className={sunflowerTheme.typography.styles.body + ' text-sm'}>
                        <span className="font-medium">Limits:</span> {policy.policy_limits}
                      </p>
                    )}
                    {policy.umuim_type && (
                      <p className={sunflowerTheme.typography.styles.body + ' text-sm'}>
                        <span className="font-medium">UM/UIM Type:</span> {policy.umuim_type}
                      </p>
                    )}
                    {policy.we_are_retained_by_carrier && (
                      <p className="text-sm text-sunflower-green font-medium mt-2">
                        ✓ Retained by Carrier
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={sunflowerTheme.typography.styles.h2}>
              📞 CONTACTS
            </h2>
            <button
              onClick={() => navigate(`/cases/${caseId}/contacts`)}
              className={sunflowerTheme.buttons.secondary}
            >
              Manage All Contacts
            </button>
          </div>
          
          {!caseContacts || caseContacts.length === 0 ? (
            <div className="text-center py-8">
              <p className={sunflowerTheme.typography.styles.muted + ' mb-4'}>
                No contacts linked to this case yet.
              </p>
              <button
                onClick={() => navigate(`/cases/${caseId}/contacts`)}
                className={sunflowerTheme.buttons.primary}
              >
                Add First Contact
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show first few contacts with link to view all */}
              {caseContacts.slice(0, 3).map((caseContact) => (
                caseContact.contact && (
                  <div key={caseContact.id} className="border border-sunflower-taupe/40 rounded-lg p-4 bg-white/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                          {caseContact.contact.name}
                        </p>
                        <p className={sunflowerTheme.typography.styles.muted + ' text-sm'}>
                          {caseContact.contact.organization || 'No organization'} • {caseContact.contact_type.replace('_', ' ')} ({caseContact.role})
                        </p>
                      </div>
                      <button
                        onClick={() => handleLinkContact(caseContact.contact!)}
                        className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full hover:bg-sunflower-gold/30 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                )
              ))}
              
              {caseContacts.length > 3 && (
                <div className="text-center pt-4 border-t border-sunflower-taupe/30">
                  <p className={sunflowerTheme.typography.styles.muted + ' mb-2'}>
                    Showing 3 of {caseContacts.length} contacts
                  </p>
                  <button
                    onClick={() => navigate(`/cases/${caseId}/contacts`)}
                    className={sunflowerTheme.buttons.secondary}
                  >
                    View All Contacts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disposition Modal */}
      {selectedCase && (
        <DispositionModal
          isOpen={showDispositionModal}
          case={selectedCase}
          onClose={() => setShowDispositionModal(false)}
          onSuccess={() => {
            // Modal will close automatically, and the case will reload with updated status
            // Disposition completed successfully
          }}
        />
      )}
    </div>
  );
};

