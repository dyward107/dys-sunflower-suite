// ADD POLICY MODAL - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Modal for adding insurance policies to a case

import React, { useState } from 'react';
import { useCaseStore } from '../../stores/caseStore';
import type { PolicyInput } from '../../types/ModuleA';

interface AddPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: number;
}

export const AddPolicyModal: React.FC<AddPolicyModalProps> = ({
  isOpen,
  onClose,
  caseId,
}) => {
  const { addCasePolicy, isLoading } = useCaseStore();

  const [formData, setFormData] = useState<PolicyInput>({
    case_id: caseId,
    policy_type: 'Primary',
    carrier_name: '',
    policy_number: '',
    policy_limits: '',
    we_are_retained_by_carrier: false,
    umuim_type: undefined,
    notes: '',
  });

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
      await addCasePolicy(caseId, formData);
      onClose();
      // Reset form
      setFormData({
        case_id: caseId,
        policy_type: 'Primary',
        carrier_name: '',
        policy_number: '',
        policy_limits: '',
        we_are_retained_by_carrier: false,
        umuim_type: undefined,
        notes: '',
      });
    } catch (error) {
      console.error('Error adding policy:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    // Reset form
    setFormData({
      case_id: caseId,
      policy_type: 'Primary',
      carrier_name: '',
      policy_number: '',
      policy_limits: '',
      we_are_retained_by_carrier: false,
      umuim_type: undefined,
      notes: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Insurance Policy</h2>

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
                <option value="Primary">Primary</option>
                <option value="UM/UIM">UM/UIM</option>
                <option value="Excess/Umbrella">Excess/Umbrella</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carrier <span className="text-red-500">*</span>
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
                Policy # <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Limits</label>
              <input
                type="text"
                name="policy_limits"
                value={formData.policy_limits}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="we_are_retained_by_carrier"
                checked={formData.we_are_retained_by_carrier}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                We are retained by this carrier
              </label>
            </div>

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
                  <option value="">Select Type</option>
                  <option value="Add-on">Add-on</option>
                  <option value="Set-off">Set-off</option>
                </select>
              </div>
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
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

