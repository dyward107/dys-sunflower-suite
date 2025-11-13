// CASE FORM COMPONENT - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Form for creating and editing cases

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';
import type { CaseInput } from '../../types/ModuleA';
import { LEAD_ATTORNEYS, CASE_STATUSES, CASE_TYPES, CASE_SUBTYPES } from '../../types/ModuleA';

export const CaseForm: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const isEditMode = caseId !== 'new';

  const { selectedCase, isLoading, error, createCase, updateCase, selectCase } = useCaseStore();

  const [formData, setFormData] = useState<CaseInput>({
    case_name: '',
    cm_number: '',
    lead_attorney: '',
    primary_plaintiff_name: '',
    primary_defendant_name: '',
    venue_court: '',
    venue_judge: '',
    venue_clerk: '',
    venue_staff_attorney: '',
    phase: 'Open',
    status: '',
    case_type: '',
    case_subtype: '',
    date_opened: new Date().toISOString().split('T')[0],
    date_of_loss: '',
    date_closed: '',
    is_wrongful_death: false,
    is_survival_action: false,
    has_deceased_defendants: false,
    discovery_close_date: '',
    discovery_deadline_extended: false,
    discovery_deadline_notes: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditMode && caseId) {
      selectCase(parseInt(caseId));
    }
  }, [caseId, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedCase) {
      setFormData({
        case_name: selectedCase.case_name,
        cm_number: selectedCase.cm_number,
        lead_attorney: selectedCase.lead_attorney,
        primary_plaintiff_name: selectedCase.primary_plaintiff_name,
        primary_defendant_name: selectedCase.primary_defendant_name,
        venue_court: selectedCase.venue_court,
        venue_judge: selectedCase.venue_judge || '',
        venue_clerk: selectedCase.venue_clerk || '',
        venue_staff_attorney: selectedCase.venue_staff_attorney || '',
        phase: selectedCase.phase,
        status: selectedCase.status,
        case_type: selectedCase.case_type,
        case_subtype: selectedCase.case_subtype || '',
        date_opened: selectedCase.date_opened,
        date_of_loss: selectedCase.date_of_loss,
        date_closed: selectedCase.date_closed || '',
        is_wrongful_death: selectedCase.is_wrongful_death,
        is_survival_action: selectedCase.is_survival_action,
        has_deceased_defendants: selectedCase.has_deceased_defendants,
        discovery_close_date: selectedCase.discovery_close_date || '',
        discovery_deadline_extended: selectedCase.discovery_deadline_extended,
        discovery_deadline_notes: selectedCase.discovery_deadline_notes || '',
        notes: selectedCase.notes || '',
      });
    }
  }, [selectedCase, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'radio') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && caseId) {
        await updateCase(parseInt(caseId), formData);
        navigate(`/cases/${caseId}`);
      } else {
        const id = await createCase(formData);
        navigate(`/cases/${id}`);
      }
    } catch (error) {
      // Error is handled by store
      console.error('Error saving case:', error);
    }
  };

  const handleCancel = () => {
    if (isEditMode && caseId) {
      navigate(`/cases/${caseId}`);
    } else {
      navigate('/cases');
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Case' : 'New Case'}
        </h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="case_name"
                value={formData.case_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CM Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cm_number"
                value={formData.cm_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Attorney <span className="text-red-500">*</span>
              </label>
              <select
                name="lead_attorney"
                value={formData.lead_attorney}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Attorney</option>
                {LEAD_ATTORNEYS.map((attorney) => (
                  <option key={attorney} value={attorney}>
                    {attorney}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                {CASE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="phase"
                    value="Open"
                    checked={formData.phase === 'Open'}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Open</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="phase"
                    value="Pending"
                    checked={formData.phase === 'Pending'}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pending</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="phase"
                    value="Closed"
                    checked={formData.phase === 'Closed'}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Closed</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case Type <span className="text-red-500">*</span>
              </label>
              <select
                name="case_type"
                value={formData.case_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                {CASE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {CASE_SUBTYPES[formData.case_type] && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case Subtype
                </label>
                <select
                  name="case_subtype"
                  value={formData.case_subtype}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subtype</option>
                  {CASE_SUBTYPES[formData.case_type].map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {subtype}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Parties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Plaintiff Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="primary_plaintiff_name"
                value={formData.primary_plaintiff_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Defendant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="primary_defendant_name"
                value={formData.primary_defendant_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Venue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Court <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="venue_court"
                value={formData.venue_court}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judge</label>
              <input
                type="text"
                name="venue_judge"
                value={formData.venue_judge}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clerk</label>
              <input
                type="text"
                name="venue_clerk"
                value={formData.venue_clerk}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Staff Attorney
              </label>
              <input
                type="text"
                name="venue_staff_attorney"
                value={formData.venue_staff_attorney}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Opened <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_opened"
                value={formData.date_opened}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Loss <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_loss"
                value={formData.date_of_loss}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Closed
              </label>
              <input
                type="date"
                name="date_closed"
                value={formData.date_closed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Discovery */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Discovery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discovery Close Date
              </label>
              <input
                type="date"
                name="discovery_close_date"
                value={formData.discovery_close_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center pt-7">
              <input
                type="checkbox"
                name="discovery_deadline_extended"
                checked={formData.discovery_deadline_extended}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Discovery Deadline Extended
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discovery Deadline Notes
              </label>
              <textarea
                name="discovery_deadline_notes"
                value={formData.discovery_deadline_notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Special Considerations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Considerations</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_wrongful_death"
                checked={formData.is_wrongful_death}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Wrongful Death</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_survival_action"
                checked={formData.is_survival_action}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Survival Action</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="has_deceased_defendants"
                checked={formData.has_deceased_defendants}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Has Deceased Defendants
              </label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes about this case..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Case' : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  );
};

