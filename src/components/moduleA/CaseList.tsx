// CASE LIST COMPONENT - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Displays list of cases with search and filter capabilities

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';
import type { CaseFilters } from '../../types/ModuleA';
import { LEAD_ATTORNEYS, CASE_STATUSES } from '../../types/ModuleA';

export const CaseList: React.FC = () => {
  const navigate = useNavigate();
  const { cases, isLoading, error, loadCases, searchCases, selectCase } = useCaseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CaseFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchCases(searchQuery);
    } else {
      loadCases(filters);
    }
  };

  const handleFilterChange = (key: keyof CaseFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    loadCases(newFilters);
  };

  const handleCaseClick = async (caseId: number) => {
    await selectCase(caseId);
    navigate(`/cases/${caseId}`);
  };

  const handleNewCase = () => {
    navigate('/cases/new');
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Case Manager</h1>
        <button
          onClick={handleNewCase}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + New Case
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case name, CM number, or party name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Attorney
            </label>
            <select
              value={filters.lead_attorney || ''}
              onChange={(e) => handleFilterChange('lead_attorney', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Attorneys</option>
              {LEAD_ATTORNEYS.map((attorney) => (
                <option key={attorney} value={attorney}>
                  {attorney}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {CASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phase
            </label>
            <select
              value={filters.phase || ''}
              onChange={(e) => handleFilterChange('phase', e.target.value as 'Open' | 'Pending' | 'Closed')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Phases</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
          {error.includes('not ready') && (
            <p className="mt-2 text-sm">
              Note: This app requires Electron to run. Please use <code className="bg-red-100 px-1 rounded">npm run electron:dev</code> to launch the full application.
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-gray-600">
          Loading cases...
        </div>
      )}

      {/* Case List */}
      {!isLoading && cases.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No cases found. Click "New Case" to create one.
        </div>
      )}

      {!isLoading && cases.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CM Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Attorney
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Opened
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleCaseClick(caseItem.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {caseItem.cm_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {caseItem.case_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {caseItem.lead_attorney}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {caseItem.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        caseItem.phase === 'Open'
                          ? 'bg-green-100 text-green-800'
                          : caseItem.phase === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {caseItem.phase}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(caseItem.date_opened).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

