// CASE LIST COMPONENT - MODULE A PHASE 1A
// Dy's Sunflower Suite v5.1
// Displays list of cases with search and filter capabilities
// UPDATED: Now using sunflower design system + AppLayout

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../stores/caseStore';
import type { CaseFilters } from '../../types/ModuleA';
import { LEAD_ATTORNEYS, CASE_STATUSES } from '../../types/ModuleA';
import { sunflowerTheme } from '../../styles/sunflowerTheme';

// Floral assets
import heroSunflower from '../../assets/florals/heroes/sunflower-large-leaves.png';
import accentBud from '../../assets/florals/accents/sunflower-bud.png';
import subtleStems from '../../assets/florals/subtles/stem-leaves.png';

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
    <div className="relative min-h-full">
      {/* Floral Backgrounds */}
      <img
        src={heroSunflower}
        className="absolute top-0 left-0 w-[400px] opacity-30 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={accentBud}
        className="absolute bottom-0 right-0 w-[200px] opacity-25 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={subtleStems}
        className="absolute top-0 right-0 w-[150px] opacity-15 pointer-events-none select-none z-0"
        alt=""
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className={sunflowerTheme.typography.styles.pageTitle}>
            Case Manager
          </h2>
          
          <div className="flex gap-3">
            <button
              onClick={handleNewCase}
              className={sunflowerTheme.buttons.primary}
            >
              + New Case
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={sunflowerTheme.buttons.secondary}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case name, CM number, or party name..."
            className={sunflowerTheme.inputs.search}
          />
          <button
            type="submit"
            className={sunflowerTheme.buttons.primary}
          >
            Search
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="rounded-3xl border border-sunflower-taupe/80 bg-white/80 backdrop-blur-sm px-6 py-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Lead Attorney
                </label>
                <select
                  value={filters.lead_attorney || ''}
                  onChange={(e) => handleFilterChange('lead_attorney', e.target.value)}
                  className={sunflowerTheme.inputs.select + ' mt-1'}
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
                <label className={sunflowerTheme.typography.styles.label}>
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={sunflowerTheme.inputs.select + ' mt-1'}
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
                <label className={sunflowerTheme.typography.styles.label}>
                  Phase
                </label>
                <select
                  value={filters.phase || ''}
                  onChange={(e) => handleFilterChange('phase', e.target.value as 'Open' | 'Pending' | 'Closed')}
                  className={sunflowerTheme.inputs.select + ' mt-1'}
                >
                  <option value="">All Phases</option>
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
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

        {/* Empty State */}
        {!isLoading && cases.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sunflower-brown/70 mb-4">
              No cases found. Click "New Case" to get started.
            </p>
            <button onClick={handleNewCase} className={sunflowerTheme.buttons.primary}>
              + New Case
            </button>
          </div>
        )}

        {/* Case Table */}
        {!isLoading && cases.length > 0 && (
          <div className={sunflowerTheme.containers.tableWrapper}>
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
                    className={`cursor-pointer transition-colors duration-150 ${
                      index % 2 === 0 
                        ? 'bg-white/70 hover:bg-sunflower-beige/40' 
                        : 'bg-sunflower-cream/20 hover:bg-sunflower-beige/40'
                    }`}
                  >
                    <td className="px-4 py-3 text-sunflower-brown/90 font-medium text-sm">
                      {caseItem.cm_number}
                    </td>
                    <td className="px-4 py-3 text-sunflower-brown text-sm font-medium">
                      {caseItem.case_name}
                    </td>
                    <td className="px-4 py-3 text-sunflower-brown text-sm">
                      {caseItem.lead_attorney}
                    </td>
                    <td className="px-4 py-3 text-sunflower-brown text-sm">
                      {caseItem.status}
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        caseItem.phase === 'Open' ? sunflowerTheme.badges.open :
                        caseItem.phase === 'Pending' ? sunflowerTheme.badges.pending :
                        sunflowerTheme.badges.closed
                      }>
                        {caseItem.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sunflower-brown text-sm">
                      {new Date(caseItem.date_opened).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

