// CASE LIST - Compact spreadsheet-style case manager
// Dy's Sunflower Suite - New Design System

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { useCaseStore } from '../../stores/caseStore';
import type { Case, CaseFilters } from '../../types/ModuleA';
import { LEAD_ATTORNEYS, CASE_STATUSES } from '../../types/ModuleA';
import '../../styles/design-system.css';

type SortField = 'cm_number' | 'case_name' | 'lead_attorney' | 'status' | 'date_opened';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ padding: 'var(--spacing-xl)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-sm)',
          lineHeight: 'var(--line-height-tight)',
        }}>
          Case Manager
        </h1>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-base)',
        }}>
          View and manage all cases in your practice
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
        alignItems: 'center',
      }}>
        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 'var(--spacing-sm)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={14} 
              style={{
                position: 'absolute',
                left: 'var(--spacing-md)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case name, CM number, or party name..."
              style={{
                width: '100%',
                paddingLeft: 'calc(var(--spacing-md) * 3)',
                paddingRight: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-sm)',
                paddingBottom: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-sunflower)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border-medium)'}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-primary)',
              fontWeight: 600,
              backgroundColor: 'var(--color-sunflower)',
              color: 'var(--color-brown-primary)',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower)'}
          >
            Search
          </button>
        </form>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
            fontWeight: 500,
            backgroundColor: showFilters ? 'var(--color-blue-gray)' : 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            transition: 'all 0.15s ease',
          }}
        >
          <Filter size={14} />
          Filters
        </button>

        {/* New Case Button */}
        <button
          onClick={() => navigate('/cases/new')}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
            fontWeight: 600,
            backgroundColor: 'var(--color-sunflower)',
            color: 'var(--color-brown-primary)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower-dark)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower)'}
        >
          <Plus size={16} />
          New Case
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-xs)',
            }}>
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">All Statuses</option>
              {CASE_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-xs)',
            }}>
              Lead Attorney
            </label>
            <select
              value={filters.lead_attorney || ''}
              onChange={(e) => handleFilterChange('lead_attorney', e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="">All Attorneys</option>
              {LEAD_ATTORNEYS.map((attorney) => (
                <option key={attorney} value={attorney}>{attorney}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Cases Table */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        border: '2px solid var(--color-border-medium)',
        borderRadius: 'var(--border-radius-md)',
        backgroundColor: 'var(--color-bg-secondary)',
      }}>
        {isLoading ? (
          <div style={{ padding: 'var(--spacing-3xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading cases...
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--spacing-3xl)', textAlign: 'center', color: 'var(--color-error)' }}>
            Error: {error}
          </div>
        ) : sortedCases.length === 0 ? (
          <div style={{ padding: 'var(--spacing-3xl)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
              No cases found. Click "New Case" to get started.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-sunflower)', borderBottom: '2px solid var(--color-border-dark)' }}>
                <th
                  onClick={() => handleSort('cm_number')}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-brown-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    CM #
                    {sortField === 'cm_number' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('case_name')}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-brown-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    Case Name
                    {sortField === 'case_name' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lead_attorney')}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-brown-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    Lead Attorney
                    {sortField === 'lead_attorney' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-brown-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    Status
                    {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date_opened')}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-brown-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    Date Opened
                    {sortField === 'date_opened' && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.map((caseItem, index) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleCaseClick(caseItem.id)}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                    borderBottom: '1px solid var(--color-border-light)',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)'}
                >
                  <td style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                  }}>
                    {caseItem.cm_number || '—'}
                  </td>
                  <td style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                  }}>
                    {caseItem.case_name}
                  </td>
                  <td style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {caseItem.lead_attorney || '—'}
                  </td>
                  <td style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px var(--spacing-sm)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      backgroundColor: caseItem.status === 'Active' ? 'var(--color-sage)' : 'var(--color-blue-gray)',
                      color: 'white',
                      borderRadius: 'var(--border-radius-sm)',
                    }}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {formatDate(caseItem.date_opened)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Footer */}
      <div style={{
        marginTop: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
      }}>
        {sortedCases.length} case{sortedCases.length !== 1 ? 's' : ''} total
      </div>
    </div>
  );
};
