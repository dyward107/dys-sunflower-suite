// CASE DETAIL COMPONENT - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Displays detailed view of a case with parties and policies

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';
import botanicalCornerLeft from '../shared/botanical-corner-left.svg?url';
import botanicalCornerRight from '../shared/botanical-corner-right.svg?url';

export const CaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const {
    selectedCase,
    parties,
    policies,
    isLoading,
    error,
    selectCase,
    clearSelectedCase,
  } = useCaseStore();

  useEffect(() => {
    if (caseId) {
      selectCase(parseInt(caseId));
    }
    return () => {
      clearSelectedCase();
    };
  }, [caseId]);

  const handleEdit = () => {
    navigate(`/cases/${caseId}/edit`);
  };

  const handleBack = () => {
    navigate('/cases');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-sunflower-brown">Loading case details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!selectedCase) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8 text-sunflower-brown">Case not found</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Botanical Backgrounds */}
      <img
        src={botanicalCornerLeft}
        className="fixed top-0 left-0 w-64 h-64 opacity-30 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={botanicalCornerRight}
        className="fixed bottom-0 right-0 w-64 h-64 opacity-30 pointer-events-none select-none z-0"
        alt=""
      />

      <div className="relative z-10 container mx-auto p-6">
        {/* Branding Header */}
        <div className="mb-4">
          <h1 className="font-brand text-4xl text-sunflower-brown flex items-center gap-2 mb-4">
            <span>🌻</span>
            Dy&apos;s Sunflower Suite
          </h1>
        </div>

        {/* Navigation and Case Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={handleBack}
              className="text-sunflower-gold hover:text-sunflower-gold-dark mb-3 flex items-center transition-colors"
            >
              ← Back to Cases
            </button>
            <h2 className="text-3xl font-bold text-sunflower-brown">{selectedCase.case_name}</h2>
            <p className="text-sunflower-brown/70 mt-1">CM# {selectedCase.cm_number}</p>
          </div>
          <button
            onClick={handleEdit}
            className="px-6 py-3 bg-sunflower-gold text-white rounded-xl hover:bg-sunflower-gold-dark focus:outline-none focus:ring-2 focus:ring-sunflower-gold shadow-md transition-all"
          >
            Edit Case
          </button>
        </div>

        {/* Case Information */}
        <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm shadow-md p-6 mb-6 border border-sunflower-taupe/60 overflow-hidden">
          {/* Botanical Backgrounds Inside Card */}
          <img
            src={botanicalCornerLeft}
            className="absolute top-0 left-0 w-48 h-48 opacity-25 pointer-events-none select-none z-0"
            alt=""
          />
          <img
            src={botanicalCornerRight}
            className="absolute bottom-0 right-0 w-48 h-48 opacity-25 pointer-events-none select-none z-0"
            alt=""
          />

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-sunflower-brown mb-4">📋 CASE DETAILS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sunflower-brown">Lead Attorney</label>
            <p className="mt-1 text-sunflower-brown">{selectedCase.lead_attorney}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-sunflower-brown">Phase</label>
            <p className="mt-1">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedCase.phase === 'Open'
                    ? 'bg-sunflower-green text-sunflower-brown'
                    : selectedCase.phase === 'Pending'
                    ? 'bg-sunflower-gold text-white'
                    : 'bg-sunflower-taupe text-sunflower-brown'
                }`}
              >
                {selectedCase.phase}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-sunflower-brown">Status</label>
            <p className="mt-1 text-sunflower-brown">{selectedCase.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-sunflower-brown">Case Type</label>
            <p className="mt-1 text-sunflower-brown">
              {selectedCase.case_type}
              {selectedCase.case_subtype && ` - ${selectedCase.case_subtype}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-sunflower-brown">Date Opened</label>
            <p className="mt-1 text-sunflower-brown">
              {new Date(selectedCase.date_opened).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-sunflower-brown">Date of Loss</label>
            <p className="mt-1 text-sunflower-brown">
              {new Date(selectedCase.date_of_loss).toLocaleDateString()}
            </p>
          </div>
          {selectedCase.date_closed && (
            <div>
              <label className="block text-sm font-medium text-sunflower-brown">Date Closed</label>
              <p className="mt-1 text-sunflower-brown">
                {new Date(selectedCase.date_closed).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Venue Information */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-sunflower-brown mb-3">Venue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sunflower-brown">Court</label>
              <p className="mt-1 text-sunflower-brown">{selectedCase.venue_court}</p>
            </div>
            {selectedCase.venue_judge && (
              <div>
                <label className="block text-sm font-medium text-sunflower-brown">Judge</label>
                <p className="mt-1 text-sunflower-brown">{selectedCase.venue_judge}</p>
              </div>
            )}
            {selectedCase.venue_clerk && (
              <div>
                <label className="block text-sm font-medium text-sunflower-brown">Clerk</label>
                <p className="mt-1 text-sunflower-brown">{selectedCase.venue_clerk}</p>
              </div>
            )}
            {selectedCase.venue_staff_attorney && (
              <div>
                <label className="block text-sm font-medium text-sunflower-brown">Staff Attorney</label>
                <p className="mt-1 text-sunflower-brown">{selectedCase.venue_staff_attorney}</p>
              </div>
            )}
          </div>
        </div>

        {/* Discovery Information */}
        {selectedCase.discovery_close_date && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-sunflower-brown mb-3">Discovery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sunflower-brown">Close Date</label>
                <p className="mt-1 text-sunflower-brown">
                  {new Date(selectedCase.discovery_close_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-sunflower-brown">Deadline Extended</label>
                <p className="mt-1 text-sunflower-brown">
                  {selectedCase.discovery_deadline_extended ? 'Yes' : 'No'}
                </p>
              </div>
              {selectedCase.discovery_deadline_notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-sunflower-brown">Notes</label>
                  <p className="mt-1 text-sunflower-brown">{selectedCase.discovery_deadline_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Flags */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-sunflower-brown mb-3">Special Considerations</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCase.is_wrongful_death && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                Wrongful Death
              </span>
            )}
            {selectedCase.is_survival_action && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Survival Action
              </span>
            )}
            {selectedCase.has_deceased_defendants && (
              <span className="px-3 py-1 bg-sunflower-taupe text-sunflower-brown text-sm rounded-full">
                Deceased Defendants
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {selectedCase.notes && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-sunflower-brown">Notes</label>
            <p className="mt-1 text-sunflower-brown whitespace-pre-wrap">{selectedCase.notes}</p>
          </div>
        )}
          </div>
        </div>

        {/* Parties */}
        <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm shadow-md p-6 mb-6 border border-sunflower-taupe/60 overflow-hidden">
          {/* Botanical Backgrounds Inside Card */}
          <img
            src={botanicalCornerLeft}
            className="absolute top-0 left-0 w-48 h-48 opacity-25 pointer-events-none select-none z-0"
            alt=""
          />
          <img
            src={botanicalCornerRight}
            className="absolute bottom-0 right-0 w-48 h-48 opacity-25 pointer-events-none select-none z-0"
            alt=""
          />

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-sunflower-brown mb-4">👥 PARTIES</h2>
            {parties.length === 0 ? (
              <p className="text-sunflower-brown">No parties added yet.</p>
            ) : (
              <div className="space-y-4">
                {/* Plaintiffs */}
                <div>
                  <h3 className="text-lg font-medium text-sunflower-brown mb-2">Plaintiffs</h3>
                  <div className="space-y-2">
                    {parties
                      .filter((p) => p.party_type === 'plaintiff')
                      .map((party) => (
                        <div key={party.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sunflower-brown">{party.party_name}</p>
                            {party.is_primary && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
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
                  <h3 className="text-lg font-medium text-sunflower-brown mb-2">Defendants</h3>
                  <div className="space-y-2">
                    {parties
                      .filter((p) => p.party_type === 'defendant')
                      .map((party) => (
                        <div key={party.id} className="border-l-4 border-red-500 pl-4 py-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sunflower-brown">{party.party_name}</p>
                            {party.is_primary && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                Primary
                              </span>
                            )}
                            {party.is_insured && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Insured
                              </span>
                            )}
                            {party.monitor_for_service && (
                              <span className="px-2 py-1 bg-sunflower-gold text-white text-xs rounded">
                                Monitor Service
                              </span>
                            )}
                          </div>
                          {party.service_date && (
                            <p className="text-sm text-sunflower-brown mt-1">
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
        </div>

        {/* Policies */}
        <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm shadow-md p-6 border border-sunflower-taupe/60 overflow-hidden">
          {/* Botanical Backgrounds Inside Card */}
          <img
            src={botanicalCornerLeft}
            className="absolute top-0 left-0 w-48 h-48 opacity-25 pointer-events-none select-none z-0"
            alt=""
          />
          <img
            src={botanicalCornerRight}
            className="absolute bottom-0 right-0 w-48 h-48 opacity-25 pointer-events-none select-none z-0"
            alt=""
          />

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-sunflower-brown mb-4">🏦 POLICIES</h2>
        {policies.length === 0 ? (
          <p className="text-sunflower-brown">No policies added yet.</p>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div key={policy.id} className="border border-sunflower-taupe rounded-md p-4 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sunflower-brown">{policy.carrier_name}</p>
                    <p className="text-sm text-sunflower-brown/70">Policy # {policy.policy_number}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      policy.policy_type === 'Primary'
                        ? 'bg-sunflower-gold text-white'
                        : policy.policy_type === 'UM/UIM'
                        ? 'bg-sunflower-taupe text-sunflower-brown'
                        : 'bg-sunflower-green text-sunflower-brown'
                    }`}
                  >
                    {policy.policy_type}
                  </span>
                </div>
                {policy.policy_limits && (
                  <p className="text-sm text-sunflower-brown mt-2">Limits: {policy.policy_limits}</p>
                )}
                {policy.umuim_type && (
                  <p className="text-sm text-sunflower-brown mt-1">UM/UIM Type: {policy.umuim_type}</p>
                )}
                {policy.we_are_retained_by_carrier && (
                  <p className="text-sm text-sunflower-green mt-1 font-medium">Retained by: Yes</p>
                )}
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

