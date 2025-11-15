// PARTIES & CONTACTS - Module A Tier 2 Tab
// Unified interface for managing case_persons (parties + contacts) with filtering

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Users, User, Building, Phone, Mail, Edit, Trash2, Filter } from 'lucide-react';
import type { CasePerson, CasePersonInput, PersonType } from '../../types/ModuleA-Unified';
import '../../styles/design-system.css';

type ViewFilter = 'all' | 'parties' | 'contacts';

export const PartiesAndContacts: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [persons, setPersons] = useState<CasePerson[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<CasePerson[]>([]);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<CasePerson | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load persons
  useEffect(() => {
    if (!caseId) return;

    const loadPersons = async () => {
      try {
        setIsLoading(true);
        const response = await window.electron.db.getCasePersons(parseInt(caseId));
        setPersons(response || []);
      } catch (err) {
        console.error('Error loading persons:', err);
        setError('Failed to load persons');
      } finally {
        setIsLoading(false);
      }
    };

    loadPersons();
  }, [caseId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...persons];
    
    switch (viewFilter) {
      case 'parties':
        filtered = persons.filter(p => p.party_role === 'plaintiff' || p.party_role === 'defendant');
        break;
      case 'contacts':
        filtered = persons.filter(p => !p.party_role || p.party_role === null);
        break;
      case 'all':
      default:
        // Show all
        break;
    }

    setFilteredPersons(filtered);
  }, [persons, viewFilter]);

  const handleDeletePerson = async (personId: number) => {
    if (!window.confirm('Are you sure you want to delete this person?')) return;

    try {
      await window.electron.db.deleteCasePerson(personId);
      setPersons(prev => prev.filter(p => p.id !== personId));
    } catch (err) {
      console.error('Error deleting person:', err);
      setError('Failed to delete person');
    }
  };

  const handlePersonSaved = (savedPerson: CasePerson) => {
    if (editingPerson) {
      // Update existing
      setPersons(prev => prev.map(p => p.id === savedPerson.id ? savedPerson : p));
    } else {
      // Add new
      setPersons(prev => [...prev, savedPerson]);
    }
    setShowAddForm(false);
    setEditingPerson(null);
  };

  const getPersonTypeDisplay = (person: CasePerson) => {
    if (person.party_role) {
      return person.party_role.charAt(0).toUpperCase() + person.party_role.slice(1);
    }
    return person.person_type.charAt(0).toUpperCase() + person.person_type.slice(1);
  };

  const getPersonTypeColor = (person: CasePerson) => {
    if (person.party_role === 'plaintiff') return 'var(--color-error)';
    if (person.party_role === 'defendant') return 'var(--color-sage)';
    return 'var(--color-blue-gray)';
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading parties & contacts...
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
          Parties & Contacts • {filteredPersons.length}
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
          Add Person
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--color-border-light)',
      }}>
        <Filter size={16} style={{ color: 'var(--color-text-muted)', marginTop: '2px' }} />
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          {(['all', 'parties', 'contacts'] as ViewFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setViewFilter(filter)}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                backgroundColor: viewFilter === filter ? 'var(--color-sunflower)' : 'transparent',
                color: viewFilter === filter ? 'var(--color-brown-primary)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: viewFilter === filter ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'var(--font-family-primary)',
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)} 
              {filter === 'all' && ` (${persons.length})`}
              {filter === 'parties' && ` (${persons.filter(p => p.party_role).length})`}
              {filter === 'contacts' && ` (${persons.filter(p => !p.party_role).length})`}
            </button>
          ))}
        </div>
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

      {/* Persons List */}
      {filteredPersons.length === 0 ? (
        <div style={{
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '2px dashed var(--color-border-medium)',
        }}>
          <Users size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }} />
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)', margin: 0 }}>
            {viewFilter === 'parties' ? 'No parties added yet' :
             viewFilter === 'contacts' ? 'No contacts added yet' : 'No persons added yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {filteredPersons.map((person) => (
            <div key={person.id} style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-light)',
              borderRadius: 'var(--border-radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              {/* Person Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1 }}>
                {/* Icon */}
                <div style={{
                  backgroundColor: getPersonTypeColor(person),
                  borderRadius: 'var(--border-radius-full)',
                  padding: 'var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {person.is_entity ? 
                    <Building size={18} style={{ color: 'white' }} /> : 
                    <User size={18} style={{ color: 'white' }} />
                  }
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    {person.name}
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    {/* Type Badge */}
                    <span style={{
                      padding: '2px var(--spacing-xs)',
                      backgroundColor: getPersonTypeColor(person),
                      color: 'white',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                    }}>
                      {getPersonTypeDisplay(person)}
                    </span>

                    {/* Primary Party Badge */}
                    {person.is_primary_party === 1 && (
                      <span style={{
                        padding: '2px var(--spacing-xs)',
                        backgroundColor: 'var(--color-sunflower)',
                        color: 'var(--color-brown-primary)',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                      }}>
                        PRIMARY
                      </span>
                    )}

                    {/* We Represent Badge */}
                    {person.we_represent === 1 && (
                      <span style={{
                        padding: '2px var(--spacing-xs)',
                        backgroundColor: 'var(--color-sage)',
                        color: 'white',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                      }}>
                        WE REPRESENT
                      </span>
                    )}

                    {/* Insured Badge */}
                    {person.is_insured === 1 && (
                      <span style={{
                        padding: '2px var(--spacing-xs)',
                        backgroundColor: 'var(--color-blue-gray)',
                        color: 'white',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                      }}>
                        INSURED
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-lg)',
                    marginTop: 'var(--spacing-xs)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {person.organization && (
                      <span>{person.organization}</span>
                    )}
                    {person.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <Phone size={12} />
                        {person.phone}
                      </div>
                    )}
                    {person.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <Mail size={12} />
                        {person.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={() => setEditingPerson(person)}
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
                  onClick={() => handleDeletePerson(person.id)}
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
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingPerson) && (
        <PersonFormModal
          person={editingPerson}
          caseId={parseInt(caseId!)}
          onSave={handlePersonSaved}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPerson(null);
          }}
        />
      )}
    </div>
  );
};

// Person Form Modal Component
interface PersonFormModalProps {
  person: CasePerson | null;
  caseId: number;
  onSave: (person: CasePerson) => void;
  onCancel: () => void;
}

const PersonFormModal: React.FC<PersonFormModalProps> = ({ person, caseId, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CasePersonInput>({
    case_id: caseId,
    person_type: 'other' as PersonType,
    name: '',
    is_entity: 0,
    phone: '',
    email: '',
    address: '',
    organization: '',
    party_role: null,
    is_primary_party: 0,
    we_represent: 0,
    is_insured: 0,
    is_corporate: 0,
    is_presuit: 0,
    monitor_for_service: 0,
    service_date: null,
    answer_filed_date: null,
    date_of_birth: null,
    ssn_last_four: '',
    drivers_license: '',
    bar_number: '',
    specialty: '',
    firm_name: '',
    role: '',
    alignment: null,
    notes: '',
    ...person,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let savedPerson: CasePerson;
      
      if (person) {
        // Update existing
        await window.electron.db.updateCasePerson(person.id, formData);
        savedPerson = { ...person, ...formData };
      } else {
        // Create new
        const id = await window.electron.db.createCasePerson(formData);
        savedPerson = { id, ...formData } as CasePerson;
      }
      
      onSave(savedPerson);
    } catch (err) {
      console.error('Error saving person:', err);
      setError('Failed to save person');
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
              {person ? 'Edit Person' : 'Add Person'}
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
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  Person Type
                </label>
                <select
                  value={formData.person_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, person_type: e.target.value as PersonType }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                >
                  <option value="party">Party</option>
                  <option value="attorney">Attorney</option>
                  <option value="expert">Expert</option>
                  <option value="witness">Witness</option>
                  <option value="adjuster">Adjuster</option>
                  <option value="corporate_rep">Corporate Rep</option>
                  <option value="medical_provider">Medical Provider</option>
                  <option value="investigator">Investigator</option>
                  <option value="court_personnel">Court Personnel</option>
                  <option value="vendor">Vendor</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Party Role (if person_type is party) */}
            {formData.person_type === 'party' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Party Role
                </label>
                <select
                  value={formData.party_role || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, party_role: e.target.value || null }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                >
                  <option value="">Select role...</option>
                  <option value="plaintiff">Plaintiff</option>
                  <option value="defendant">Defendant</option>
                </select>
              </div>
            )}

            {/* Contact Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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

            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Organization
              </label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
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

            {/* Flags */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 'var(--border-radius-md)',
            }}>
              {[
                { key: 'is_entity', label: 'Is Entity' },
                { key: 'is_primary_party', label: 'Primary Party' },
                { key: 'we_represent', label: 'We Represent' },
                { key: 'is_insured', label: 'Is Insured' },
              ].map(({ key, label }) => (
                <label key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                }}>
                  <input
                    type="checkbox"
                    checked={formData[key as keyof CasePersonInput] === 1}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [key]: e.target.checked ? 1 : 0 
                    }))}
                  />
                  {label}
                </label>
              ))}
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
                {isSubmitting ? 'Saving...' : (person ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
