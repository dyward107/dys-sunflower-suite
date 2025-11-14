// ADD POLICY MODAL - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Modal for adding/editing insurance policies

import React, { useState, useEffect } from 'react';
import { useCaseStore } from '../../stores/caseStore';
import type { PolicyInput, Policy } from '../../types/ModuleA';

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number | null;
  policy?: Policy; // existing policy when editing
  onSuccess?: () => void;
}

export const AddPolicyModal: React.FC<AddPolicyModalProps> = ({
  isOpen,
  onClose,
  caseId,
  policy,
  onSuccess,
}) => {
  const { addCasePolicy, updatePolicy, isLoading } = useCaseStore();
  const isEditMode = !!policy;

  const [formData, setFormData] = useState<PolicyInput>({
    case_id: caseId || 0,
    policy_type: 'Primary',
    carrier_name: '',
    policy_number: '',
    policy_limits: '',
    we_are_retained_by_carrier: false,
    umuim_type: undefined,
    notes: '',
  });

  // Reset form data whenever the modal opens or policy changes
  useEffect(() => {
    if (isOpen) {
      if (policy) {
        // Editing existing policy - pre-fill all fields
        setFormData({
          case_id: policy.case_id,
          policy_type: policy.policy_type,
          carrier_name: policy.carrier_name,
          policy_number: policy.policy_number,
          policy_limits: policy.policy_limits || '',
          we_are_retained_by_carrier: policy.we_are_retained_by_carrier || false,
          umuim_type: policy.umuim_type || undefined,
          notes: policy.notes || '',
        });
      } else {
        // Adding new policy
        setFormData({
          case_id: caseId || 0,
          policy_type: 'Primary',
          carrier_name: '',
          policy_number: '',
          policy_limits: '',
          we_are_retained_by_carrier: false,
          umuim_type: undefined,
          notes: '',
        });
      }
    }
  }, [isOpen, policy, caseId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && policy?.id) {
        // Update existing policy
        await updatePolicy(policy.id, formData);
      } else {
        // Add new policy
        if (!caseId) throw new Error('Case ID is required');
        await addCasePolicy(caseId, formData);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isEditMode ? 'Edit' : 'Add'} Insurance Policy
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Type <span className="text-red-500">*</span>
              </label>
              <select
                name="policy_type"
                value={formData.policy_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Primary">Primary Liability</option>
                <option value="UM/UIM">UM/UIM</option>
                <option value="Excess/Umbrella">Excess/Umbrella</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carrier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="carrier_name"
                value={formData.carrier_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Limits
              </label>
              <input
                type="text"
                name="policy_limits"
                value={formData.policy_limits}
                onChange={handleChange}
                placeholder="e.g. $1,000,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* UM/UIM Type - only show for UM/UIM policies */}
            {formData.policy_type === 'UM/UIM' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UM/UIM Type
                </label>
                <select
                  name="umuim_type"
                  value={formData.umuim_type || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type...</option>
                  <option value="Add-on">Add-on (Stacked)</option>
                  <option value="Set-off">Set-off</option>
                </select>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                name="we_are_retained_by_carrier"
                checked={formData.we_are_retained_by_carrier}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                We are retained by this carrier
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
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
              {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Policy' : 'Add Policy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
