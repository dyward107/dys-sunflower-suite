// CASE LIST COMPONENT - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Displays list of cases with search and filter capabilities

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';
import type { CaseFilters } from '../../types/ModuleA';
import { LEAD_ATTORNEYS, CASE_STATUSES } from '../../types/ModuleA';
import botanicalCornerLeft from '../shared/botanical-corner-left.svg?url';
import botanicalCornerRight from '../shared/botanical-corner-right.svg?url';

type SortField = 'cm_number' | 'case_name' | 'lead_attorney' | 'status' | 'phase' | 'date_opened';
type SortDirection = 'asc' | 'desc';

export const CaseList: React.FC = () => {
  const navigate = useNavigate();
  const { cases, isLoading, error, loadCases, searchCases, selectCase } = useCaseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CaseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date_opened');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCases = [...cases].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'date_opened') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return <span className="text-sunflower-taupe">↕</span>;
    }
    return sortDirection === 'asc' ? <span className="text-sunflower-brown">↑</span> : <span className="text-sunflower-brown">↓</span>;
  };

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
        <div className="mb-6">
          <h1 className="font-brand text-4xl text-sunflower-brown flex items-center gap-2 mb-2">
            <span>🌻</span>
            Dy&apos;s Sunflower Suite
          </h1>
          <h2 className="text-2xl font-semibold text-sunflower-brown">Case Manager</h2>
        </div>

        {/* Header Actions */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleNewCase}
            className="px-6 py-3 bg-sunflower-gold text-white rounded-xl hover:bg-sunflower-gold-dark focus:outline-none focus:ring-2 focus:ring-sunflower-gold shadow-md transition-all"
          >
            + New Case
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case name, CM number, or party name..."
              className="flex-1 px-4 py-3 border border-sunflower-taupe/60 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sunflower-gold shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-sunflower-gold text-white rounded-xl hover:bg-sunflower-gold-dark focus:outline-none focus:ring-2 focus:ring-sunflower-gold shadow-md transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 border border-sunflower-taupe/60 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-sunflower-taupe-light focus:outline-none focus:ring-2 focus:ring-sunflower-gold shadow-sm transition-all"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="mb-4 p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-sunflower-taupe/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-sunflower-brown mb-1">
              Lead Attorney
            </label>
            <select
              value={filters.lead_attorney || ''}
              onChange={(e) => handleFilterChange('lead_attorney', e.target.value)}
              className="w-full px-3 py-2 border border-sunflower-taupe rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-gold"
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
            <label className="block text-sm font-medium text-sunflower-brown mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-sunflower-taupe rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-gold"
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
            <label className="block text-sm font-medium text-sunflower-brown mb-1">
              Phase
            </label>
            <select
              value={filters.phase || ''}
              onChange={(e) => handleFilterChange('phase', e.target.value as 'Open' | 'Pending' | 'Closed')}
              className="w-full px-3 py-2 border border-sunflower-taupe rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-sunflower-gold"
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
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
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
          <div className="text-center py-12 text-sunflower-brown">
            Loading cases...
          </div>
        )}

        {/* Case List */}
        {!isLoading && cases.length === 0 && (
          <div className="text-center py-12 text-sunflower-brown">
            No cases yet. Click "New Case" to get started.
          </div>
        )}

        {!isLoading && cases.length > 0 && (
          <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm shadow-md border border-sunflower-taupe/60 overflow-hidden">
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
              <table className="min-w-full">
                <thead className="bg-sunflower-gold/90 text-sunflower-brown text-sm font-semibold shadow-sm">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left tracking-wide cursor-pointer hover:bg-sunflower-gold transition-colors"
                      onClick={() => handleSort('cm_number')}
                    >
                      <div className="flex items-center gap-2">
                        CM NUMBER
                        <SortIcon field="cm_number" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left tracking-wide cursor-pointer hover:bg-sunflower-gold transition-colors"
                      onClick={() => handleSort('case_name')}
                    >
                      <div className="flex items-center gap-2">
                        CASE NAME
                        <SortIcon field="case_name" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left tracking-wide cursor-pointer hover:bg-sunflower-gold transition-colors"
                      onClick={() => handleSort('lead_attorney')}
                    >
                      <div className="flex items-center gap-2">
                        LEAD ATTORNEY
                        <SortIcon field="lead_attorney" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left tracking-wide cursor-pointer hover:bg-sunflower-gold transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        STATUS
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left tracking-wide cursor-pointer hover:bg-sunflower-gold transition-colors"
                      onClick={() => handleSort('phase')}
                    >
                      <div className="flex items-center gap-2">
                        PHASE
                        <SortIcon field="phase" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left tracking-wide cursor-pointer hover:bg-sunflower-gold transition-colors"
                      onClick={() => handleSort('date_opened')}
                    >
                      <div className="flex items-center gap-2">
                        DATE OPENED
                        <SortIcon field="date_opened" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sunflower-taupe/30">
                  {sortedCases.map((caseItem, index) => (
                    <tr
                      key={caseItem.id}
                      onClick={() => handleCaseClick(caseItem.id)}
                      className={`cursor-pointer transition-colors ${
                        index % 2 === 0 
                          ? 'bg-white/60 hover:bg-sunflower-beige/40' 
                          : 'bg-white/40 hover:bg-sunflower-beige/40'
                      }`}
                    >
                      <td className="px-4 py-3 text-sunflower-brown/90 font-medium">
                        {caseItem.cm_number}
                      </td>
                      <td className="px-4 py-3 text-sunflower-brown">
                        {caseItem.case_name}
                      </td>
                      <td className="px-4 py-3 text-sunflower-brown">
                        {caseItem.lead_attorney}
                      </td>
                      <td className="px-4 py-3 text-sunflower-brown">
                        {caseItem.status}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-sunflower-green/70 text-sunflower-brown text-xs font-semibold">
                          {caseItem.phase}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sunflower-brown">
                        {new Date(caseItem.date_opened).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

