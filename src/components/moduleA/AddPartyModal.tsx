// ADD PARTY MODAL - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Modal for adding/editing parties to a case

import React, { useState, useEffect } from 'react';
import { useCaseStore } from '../../stores/caseStore';
import type { PartyInput, Party } from '../../types/ModuleA';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number | null; // null when the case is not yet saved
  party?: Party; // existing party when editing from DB
  localParty?: PartyInput; // existing local party when editing before first save
  draftType?: 'plaintiff' | 'defendant'; // used when adding and no party passed
  onLocalCreate?: (party: PartyInput) => void; // called when caseId is null (add)
  onLocalUpdate?: (party: PartyInput) => void; // called when editing local party
  onSuccess?: () => void; // called after DB save or update
}

export const AddPartyModal: React.FC<AddPartyModalProps> = ({
  isOpen,
  onClose,
  caseId,
  party,
  localParty,
  draftType,
  onLocalCreate,
  onLocalUpdate,
  onSuccess,
}) => {
  const { addCaseParty, updateParty, isLoading } = useCaseStore();
  const isEditMode = !!(party || localParty);

  const [formData, setFormData] = useState<PartyInput>({
    case_id: caseId || 0,
    party_type: 'defendant',
    party_name: '',
    is_corporate: false,
    is_primary: false,
    is_insured: false,
    is_presuit: false,
    monitor_for_service: false,
    service_date: '',
    answer_filed_date: '',
    notes: '',
  });

  // Reset form data whenever the modal opens or party changes
  useEffect(() => {
    if (isOpen) {
      if (party) {
        // Editing existing DB party - pre-fill all fields
        setFormData({
          case_id: party.case_id,
          party_type: party.party_type,
          party_name: party.party_name,
          is_corporate: party.is_corporate || false,
          is_primary: party.is_primary || false,
          is_insured: party.is_insured || false,
          is_presuit: party.is_presuit || false,
          monitor_for_service: party.monitor_for_service || false,
          service_date: party.service_date || '',
          answer_filed_date: party.answer_filed_date || '',
          notes: party.notes || '',
        });
      } else if (localParty) {
        // Editing local party - pre-fill from localParty
        setFormData({
          case_id: caseId || 0,
          party_type: localParty.party_type,
          party_name: localParty.party_name,
          is_corporate: localParty.is_corporate || false,
          is_primary: localParty.is_primary || false,
          is_insured: localParty.is_insured || false,
          is_presuit: localParty.is_presuit || false,
          monitor_for_service: localParty.monitor_for_service || false,
          service_date: localParty.service_date || '',
          answer_filed_date: localParty.answer_filed_date || '',
          notes: localParty.notes || '',
        });
      } else {
        // Adding new party - use draftType
        setFormData({
          case_id: caseId || 0,
          party_type: draftType || 'defendant',
          party_name: '',
          is_corporate: false,
          is_primary: false,
          is_insured: false,
          is_presuit: false,
          monitor_for_service: false,
          service_date: '',
          answer_filed_date: '',
          notes: '',
        });
      }
    }
  }, [isOpen, party, localParty, draftType, caseId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && party?.id) {
        // Update existing party in database
        await updateParty(party.id, formData);
        if (onSuccess) onSuccess();
        else onClose();
      } else if (localParty) {
        // Update existing local party
        if (onLocalUpdate) {
          onLocalUpdate(formData);
        }
        onClose();
      } else if (caseId) {
        // Add new party to existing case (database)
        await addCaseParty(caseId, formData);
        if (onSuccess) onSuccess();
        else onClose();
      } else {
        // Add new party to local queue (case not yet saved)
        if (onLocalCreate) {
          onLocalCreate(formData);
        }
        onClose();
      }
    } catch (error) {
      console.error('Error saving party:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isEditMode ? 'Edit' : 'Add'} {formData.party_type === 'defendant' ? 'Defendant' : 'Plaintiff'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="party_name"
                value={formData.party_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_corporate"
                  checked={formData.is_corporate}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Corporate</span>
              </label>

              {formData.party_type === 'defendant' && (
                <>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_insured"
                      checked={formData.is_insured}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Insured</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_presuit"
                      checked={formData.is_presuit}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pre-Suit</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="monitor_for_service"
                      checked={formData.monitor_for_service}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Monitor Service</span>
                  </label>
                </>
              )}
            </div>

            {formData.party_type === 'defendant' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Date
                  </label>
                  <input
                    type="date"
                    name="service_date"
                    value={formData.service_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer Date
                  </label>
                  <input
                    type="date"
                    name="answer_filed_date"
                    value={formData.answer_filed_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Party' : `Add ${formData.party_type === 'defendant' ? 'Defendant' : 'Plaintiff'}`)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
