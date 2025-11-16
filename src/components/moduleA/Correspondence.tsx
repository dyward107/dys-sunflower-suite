// CORRESPONDENCE - Module A Tier 1 Tab
// Global correspondence log across all cases with filtering and CRUD

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, Phone, MessageSquare, User, Search, ExternalLink, Edit, Trash2 } from 'lucide-react';
import type { CorrespondenceEntry, CorrespondenceEntryInput, CorrespondenceMethod, CorrespondenceDirection } from '../../types/ModuleA-Unified';
import type { Case } from '../../types/ModuleA';
import type { CasePerson } from '../../types/ModuleA-Unified';
import '../../styles/design-system.css';

type FilterState = {
  caseId: number | null;
  method: CorrespondenceMethod | null;
  direction: CorrespondenceDirection | null;
  searchTerm: string;
};

export const Correspondence: React.FC = () => {
  const navigate = useNavigate();
  const [correspondence, setCorrespondence] = useState<CorrespondenceEntry[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CorrespondenceEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    caseId: null,
    method: null,
    direction: null,
    searchTerm: '',
  });

  // Load correspondence and cases
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load all correspondence
        const correspondenceResponse = await window.electron.db.getAllCorrespondence();
        setCorrespondence(correspondenceResponse || []);
        
        // Load all cases for filtering
        const casesResponse = await window.electron.db.getCases();
        setCases(casesResponse || []);
        
      } catch (err) {
        console.error('Error loading correspondence:', err);
        setError('Failed to load correspondence');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter correspondence
  const filteredCorrespondence = correspondence.filter((entry) => {
    // Case filter
    if (filters.caseId && entry.case_id !== filters.caseId) return false;
    
    // Method filter
    if (filters.method && entry.method !== filters.method) return false;
    
    // Direction filter
    if (filters.direction && entry.direction !== filters.direction) return false;
    
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSubject = entry.subject?.toLowerCase().includes(searchLower);
      const matchesDescription = entry.description.toLowerCase().includes(searchLower);
      const matchesNotes = entry.notes?.toLowerCase().includes(searchLower);
      
      if (!matchesSubject && !matchesDescription && !matchesNotes) return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent first

  const handleDeleteEntry = async (entryId: number) => {
    if (!window.confirm('Are you sure you want to delete this correspondence entry?')) return;

    try {
      await window.electron.db.deleteCorrespondence(entryId);
      setCorrespondence(prev => prev.filter(e => e.id !== entryId));
    } catch (err) {
      console.error('Error deleting correspondence:', err);
      setError('Failed to delete correspondence entry');
    }
  };

  const handleEntrySaved = (savedEntry: CorrespondenceEntry) => {
    if (editingEntry) {
      // Update existing
      setCorrespondence(prev => prev.map(e => e.id === savedEntry.id ? savedEntry : e));
    } else {
      // Add new
      setCorrespondence(prev => [savedEntry, ...prev]);
    }
    setShowAddForm(false);
    setEditingEntry(null);
  };

  const getCaseName = (caseId: number) => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem ? caseItem.case_name : 'Unknown Case';
  };

  const getMethodIcon = (method: CorrespondenceMethod) => {
    switch (method) {
      case 'call': return <Phone size={16} />;
      case 'email': return <Mail size={16} />;
      case 'text': return <MessageSquare size={16} />;
      case 'letter': case 'fax': return <Mail size={16} />;
      case 'in_person': return <User size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const getMethodColor = (method: CorrespondenceMethod) => {
    switch (method) {
      case 'call': return 'var(--color-sage)';
      case 'email': return 'var(--color-blue-gray)';
      case 'text': return 'var(--color-sunflower)';
      case 'letter': case 'fax': return 'var(--color-brown-secondary)';
      case 'in_person': return 'var(--color-error)';
      default: return 'var(--color-blue-gray)';
    }
  };

  const getDirectionColor = (direction: CorrespondenceDirection) => {
    return direction === 'inbound' ? 'var(--color-sage)' : 'var(--color-sunflower)';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading correspondence...
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
        }}>
          Correspondence • {filteredCorrespondence.length}
        </h1>

        <button
          onClick={() => setShowAddForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--color-sunflower)',
            color: 'var(--color-brown-primary)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-family-primary)',
          }}
        >
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--color-border-light)',
      }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: 'var(--spacing-sm)', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }} />
          <input
            type="text"
            placeholder="Search subject, description..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            style={{
              width: '100%',
              padding: 'var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 36px',
              border: '1px solid var(--color-border-medium)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-family-primary)',
            }}
          />
        </div>

        {/* Case Filter */}
        <select
          value={filters.caseId || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, caseId: e.target.value ? parseInt(e.target.value) : null }))}
          style={{
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
          }}
        >
          <option value="">All Cases</option>
          {cases.map((caseItem) => (
            <option key={caseItem.id} value={caseItem.id}>
              {caseItem.case_name}
            </option>
          ))}
        </select>

        {/* Method Filter */}
        <select
          value={filters.method || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value as CorrespondenceMethod | null || null }))}
          style={{
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
          }}
        >
          <option value="">All Methods</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="letter">Letter</option>
          <option value="text">Text</option>
          <option value="in_person">In Person</option>
          <option value="fax">Fax</option>
          <option value="other">Other</option>
        </select>

        {/* Direction Filter */}
        <select
          value={filters.direction || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value as CorrespondenceDirection | null || null }))}
          style={{
            padding: 'var(--spacing-sm)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
          }}
        >
          <option value="">All Directions</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-error)',
          color: 'white',
          borderRadius: 'var(--border-radius-md)',
          fontSize: 'var(--font-size-sm)',
        }}>
          {error}
        </div>
      )}

      {/* Correspondence List */}
      {filteredCorrespondence.length === 0 ? (
        <div style={{
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '2px dashed var(--color-border-medium)',
        }}>
          <Mail size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }} />
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)', margin: 0 }}>
            No correspondence entries found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {filteredCorrespondence.map((entry) => (
            <div key={entry.id} style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-light)',
              borderRadius: 'var(--border-radius-lg)',
            }}>
              {/* Entry Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  {/* Method Icon */}
                  <div style={{
                    backgroundColor: getMethodColor(entry.method),
                    borderRadius: 'var(--border-radius-full)',
                    padding: 'var(--spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{ color: 'white' }}>
                      {getMethodIcon(entry.method)}
                    </div>
                  </div>

                  {/* Entry Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <h3 style={{
                        fontSize: 'var(--font-size-md)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                      }}>
                        {entry.subject || entry.method.charAt(0).toUpperCase() + entry.method.slice(1)}
                      </h3>
                      
                      {/* Direction Badge */}
                      <span style={{
                        padding: '2px var(--spacing-xs)',
                        backgroundColor: getDirectionColor(entry.direction),
                        color: entry.direction === 'inbound' ? 'white' : 'var(--color-brown-primary)',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {entry.direction}
                      </span>

                      {/* Follow-up Badge */}
                      {entry.follow_up && (
                        <span style={{
                          padding: '2px var(--spacing-xs)',
                          backgroundColor: 'var(--color-sunflower)',
                          color: 'var(--color-brown-primary)',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}>
                          FOLLOW-UP
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                    }}>
                      <span>{formatDate(entry.date)}</span>
                      {entry.time && <span>{formatTime(entry.time)}</span>}
                      <button
                        onClick={() => navigate(`/cases/${entry.case_id}/overview`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-xs)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-sage)',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-sm)',
                          textDecoration: 'underline',
                        }}
                      >
                        {getCaseName(entry.case_id)}
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  <button
                    onClick={() => setEditingEntry(entry)}
                    title="Edit Entry"
                    style={{
                      padding: 'var(--spacing-xs)',
                      backgroundColor: 'var(--color-blue-gray)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    title="Delete Entry"
                    style={{
                      padding: 'var(--spacing-xs)',
                      backgroundColor: 'var(--color-error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Entry Content */}
              <div style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-base)',
              }}>
                {entry.description}
              </div>

              {/* Notes */}
              {entry.notes && (
                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  borderLeft: '4px solid var(--color-sunflower)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--line-height-base)',
                }}>
                  <strong>Notes:</strong> {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingEntry) && (
        <CorrespondenceFormModal
          entry={editingEntry}
          cases={cases}
          onSave={handleEntrySaved}
          onCancel={() => {
            setShowAddForm(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};

// Correspondence Form Modal Component
interface CorrespondenceFormModalProps {
  entry: CorrespondenceEntry | null;
  cases: Case[];
  onSave: (entry: CorrespondenceEntry) => void;
  onCancel: () => void;
}

const CorrespondenceFormModal: React.FC<CorrespondenceFormModalProps> = ({ entry, cases, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CorrespondenceEntryInput>({
    case_id: entry?.case_id || 0,
    person_id: entry?.person_id || null,
    method: entry?.method || 'email',
    direction: entry?.direction || 'outbound',
    date: entry?.date || new Date().toISOString().split('T')[0],
    time: entry?.time || '',
    subject: entry?.subject || '',
    description: entry?.description || '',
    notes: entry?.notes || '',
    attachment_path: entry?.attachment_path || '',
    follow_up: entry?.follow_up || false,
  });

  const [casePersons, setCasePersons] = useState<CasePerson[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load persons when case changes
  useEffect(() => {
    if (formData.case_id) {
      const loadPersons = async () => {
        try {
          const response = await window.electron.db.getCasePersons(formData.case_id);
          setCasePersons(response || []);
        } catch (err) {
          console.error('Error loading case persons:', err);
        }
      };
      loadPersons();
    } else {
      setCasePersons([]);
    }
  }, [formData.case_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.case_id) {
      setError('Case is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let savedEntry: CorrespondenceEntry;
      
      if (entry) {
        // Update existing
        await window.electron.db.updateCorrespondence(entry.id, formData);
        savedEntry = { ...entry, ...formData };
      } else {
        // Create new
        const id = await window.electron.db.createCorrespondence(formData);
        savedEntry = { id, ...formData } as CorrespondenceEntry;
      }
      
      onSave(savedEntry);
    } catch (err) {
      console.error('Error saving correspondence:', err);
      setError('Failed to save correspondence entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-md)',
    }}>
      {/* Background overlay */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(62, 47, 35, 0.85)',
          cursor: 'pointer',
        }}
      />

      {/* Modal content */}
      <div style={{
        position: 'relative',
        width: '90vw',
        maxWidth: '700px',
        maxHeight: '90vh',
        backgroundColor: 'var(--color-bg-primary)',
        borderRadius: 'var(--border-radius-lg)',
        border: '3px solid var(--color-sunflower)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-xl)' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-lg)',
            paddingBottom: 'var(--spacing-md)',
            borderBottom: '2px solid var(--color-border-light)',
          }}>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              {entry ? 'Edit Correspondence' : 'Add Correspondence'}
            </h2>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-error)',
              color: 'white',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 'var(--spacing-lg)',
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Case and Person */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Case *
                </label>
                <select
                  value={formData.case_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, case_id: parseInt(e.target.value, 10) }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                  required
                >
                  <option value="">Select case...</option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.case_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Contact Person
                </label>
                <select
                  value={formData.person_id ?? ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, person_id: e.target.value ? parseInt(e.target.value, 10) : null }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                >
                  <option value="">Select person...</option>
                  {casePersons.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} ({person.person_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Method and Direction */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Method *
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as CorrespondenceMethod }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                  required
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="letter">Letter</option>
                  <option value="text">Text</option>
                  <option value="in_person">In Person</option>
                  <option value="fax">Fax</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Direction *
                </label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value as CorrespondenceDirection }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                  required
                >
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Subject
              </label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '2px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '2px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '2px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Follow-up Required */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={formData.follow_up || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, follow_up: e.target.checked }))}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--color-sunflower)',
                  }}
                />
                Follow-up action needed
              </label>
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                margin: 'var(--spacing-xs) 0 0 26px',
              }}>
                Check if this entry requires follow-up action (future calendar event, task, or email)
              </p>
            </div>

            {/* Form Actions */}
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'flex-end',
              paddingTop: 'var(--spacing-md)',
              borderTop: '2px solid var(--color-border-light)',
            }}>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  backgroundColor: 'var(--color-blue-gray)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-family-primary)',
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  backgroundColor: 'var(--color-sage)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-family-primary)',
                }}
              >
                {isSubmitting ? 'Saving...' : (entry ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
