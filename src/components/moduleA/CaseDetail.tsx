// CASE DETAIL COMPONENT - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Displays detailed view of a case with parties and policies

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';

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
        <div className="text-center py-8 text-gray-600">Loading case details...</div>
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
        <div className="text-center py-8 text-gray-600">Case not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Cases
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedCase.case_name}</h1>
          <p className="text-gray-600 mt-1">CM# {selectedCase.cm_number}</p>
        </div>
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Edit Case
        </button>
      </div>

      {/* Case Information */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lead Attorney</label>
            <p className="mt-1 text-gray-900">{selectedCase.lead_attorney}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phase</label>
            <p className="mt-1">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedCase.phase === 'Open'
                    ? 'bg-green-100 text-green-800'
                    : selectedCase.phase === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {selectedCase.phase}
              </span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-gray-900">{selectedCase.status}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Case Type</label>
            <p className="mt-1 text-gray-900">
              {selectedCase.case_type}
              {selectedCase.case_subtype && ` - ${selectedCase.case_subtype}`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date Opened</label>
            <p className="mt-1 text-gray-900">
              {new Date(selectedCase.date_opened).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Loss</label>
            <p className="mt-1 text-gray-900">
              {new Date(selectedCase.date_of_loss).toLocaleDateString()}
            </p>
          </div>
          {selectedCase.date_closed && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Closed</label>
              <p className="mt-1 text-gray-900">
                {new Date(selectedCase.date_closed).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Venue Information */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Venue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Court</label>
              <p className="mt-1 text-gray-900">{selectedCase.venue_court}</p>
            </div>
            {selectedCase.venue_judge && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Judge</label>
                <p className="mt-1 text-gray-900">{selectedCase.venue_judge}</p>
              </div>
            )}
            {selectedCase.venue_clerk && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Clerk</label>
                <p className="mt-1 text-gray-900">{selectedCase.venue_clerk}</p>
              </div>
            )}
            {selectedCase.venue_staff_attorney && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Staff Attorney</label>
                <p className="mt-1 text-gray-900">{selectedCase.venue_staff_attorney}</p>
              </div>
            )}
          </div>
        </div>

        {/* Discovery Information */}
        {selectedCase.discovery_close_date && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Discovery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Close Date</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedCase.discovery_close_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline Extended</label>
                <p className="mt-1 text-gray-900">
                  {selectedCase.discovery_deadline_extended ? 'Yes' : 'No'}
                </p>
              </div>
              {selectedCase.discovery_deadline_notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-gray-900">{selectedCase.discovery_deadline_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Flags */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Special Considerations</h3>
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
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                Deceased Defendants
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {selectedCase.notes && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedCase.notes}</p>
          </div>
        )}
      </div>

      {/* Parties */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Parties</h2>
        {parties.length === 0 ? (
          <p className="text-gray-600">No parties added yet.</p>
        ) : (
          <div className="space-y-4">
            {/* Plaintiffs */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Plaintiffs</h3>
              <div className="space-y-2">
                {parties
                  .filter((p) => p.party_type === 'plaintiff')
                  .map((party) => (
                    <div key={party.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{party.party_name}</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Defendants</h3>
              <div className="space-y-2">
                {parties
                  .filter((p) => p.party_type === 'defendant')
                  .map((party) => (
                    <div key={party.id} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{party.party_name}</p>
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
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Monitor Service
                          </span>
                        )}
                      </div>
                      {party.service_date && (
                        <p className="text-sm text-gray-600 mt-1">
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
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insurance Policies</h2>
        {policies.length === 0 ? (
          <p className="text-gray-600">No policies added yet.</p>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div key={policy.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{policy.carrier_name}</p>
                    <p className="text-sm text-gray-600">Policy # {policy.policy_number}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      policy.policy_type === 'Primary'
                        ? 'bg-blue-100 text-blue-800'
                        : policy.policy_type === 'UM/UIM'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {policy.policy_type}
                  </span>
                </div>
                {policy.policy_limits && (
                  <p className="text-sm text-gray-700 mt-2">Limits: {policy.policy_limits}</p>
                )}
                {policy.umuim_type && (
                  <p className="text-sm text-gray-700 mt-1">UM/UIM Type: {policy.umuim_type}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

