// POLICIES - Module A Tier 2 Tab
// Shows insurance policies for the case, linked to insured persons

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Shield, DollarSign, Calendar, User, Edit, Trash2, FileText } from 'lucide-react';
import type { CasePolicy, CasePolicyInput } from '../../types/ModuleA';
import type { CasePerson } from '../../types/ModuleA-Unified';
import '../../styles/design-system.css';

export const Policies: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const [policies, setPolicies] = useState<CasePolicy[]>([]);
  const [persons, setPersons] = useState<CasePerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CasePolicy | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load policies and persons
  useEffect(() => {
    if (!caseId) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load policies
        const policiesResponse = await window.electron.db.getCasePolicies(parseInt(caseId));
        setPolicies(policiesResponse || []);
        
        // Load persons (for insured linking)
        const personsResponse = await window.electron.db.getCasePersons(parseInt(caseId));
        setPersons(personsResponse || []);
        
      } catch (err) {
        console.error('Error loading policies:', err);
        setError('Failed to load policies');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [caseId]);

  const handleDeletePolicy = async (policyId: number) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;

    try {
      await window.electron.db.deleteCasePolicy(policyId);
      setPolicies(prev => prev.filter(p => p.id !== policyId));
    } catch (err) {
      console.error('Error deleting policy:', err);
      setError('Failed to delete policy');
    }
  };

  const handlePolicySaved = (savedPolicy: CasePolicy) => {
    if (editingPolicy) {
      // Update existing
      setPolicies(prev => prev.map(p => p.id === savedPolicy.id ? savedPolicy : p));
    } else {
      // Add new
      setPolicies(prev => [...prev, savedPolicy]);
    }
    setShowAddForm(false);
    setEditingPolicy(null);
  };

  const getInsuredName = (insuredPersonId: number | null) => {
    if (!insuredPersonId) return 'Unknown';
    const person = persons.find(p => p.id === insuredPersonId);
    return person ? person.name : 'Unknown';
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading policies...
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
          Insurance Policies • {policies.length}
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
          Add Policy
        </button>
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

      {/* Policies List */}
      {policies.length === 0 ? (
        <div style={{
          padding: 'var(--spacing-xl)',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '2px dashed var(--color-border-medium)',
        }}>
          <Shield size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }} />
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)', margin: 0 }}>
            No insurance policies added yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {policies.map((policy) => (
            <div key={policy.id} style={{
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-light)',
              borderRadius: 'var(--border-radius-lg)',
            }}>
              {/* Policy Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 'var(--spacing-lg)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <div style={{
                    backgroundColor: 'var(--color-sage)',
                    borderRadius: 'var(--border-radius-full)',
                    padding: 'var(--spacing-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Shield size={18} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}>
                      {policy.insurance_company}
                    </h3>
                    {policy.policy_number && (
                      <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                      }}>
                        Policy #{policy.policy_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  <button
                    onClick={() => setEditingPolicy(policy)}
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
                    onClick={() => handleDeletePolicy(policy.id)}
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

              {/* Policy Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                {/* Insured */}
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    <User size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      INSURED
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {getInsuredName(policy.insured_person_id)}
                  </div>
                </div>

                {/* Policy Type */}
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    <FileText size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      TYPE
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {policy.policy_type || '—'}
                  </div>
                </div>

                {/* Policy Limits */}
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    <DollarSign size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      LIMITS
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatCurrency(policy.policy_limits)}
                  </div>
                </div>

                {/* Effective Date */}
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-xs)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    <Calendar size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      EFFECTIVE
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatDate(policy.effective_date)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {policy.notes && (
                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-primary)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--line-height-base)',
                }}>
                  {policy.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingPolicy) && (
        <PolicyFormModal
          policy={editingPolicy}
          caseId={parseInt(caseId!)}
          persons={persons}
          onSave={handlePolicySaved}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPolicy(null);
          }}
        />
      )}
    </div>
  );
};

// Policy Form Modal Component
interface PolicyFormModalProps {
  policy: CasePolicy | null;
  caseId: number;
  persons: CasePerson[];
  onSave: (policy: CasePolicy) => void;
  onCancel: () => void;
}

const PolicyFormModal: React.FC<PolicyFormModalProps> = ({ policy, caseId, persons, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CasePolicyInput>({
    case_id: caseId,
    insurance_company: '',
    policy_number: '',
    policy_type: '',
    policy_limits: null,
    effective_date: null,
    expiration_date: null,
    insured_person_id: null,
    notes: '',
    ...policy,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get insured persons (defendants we represent that are marked as insured)
  const insuredPersons = persons.filter(p => 
    p.party_role === 'defendant' && 
    p.we_represent === 1 && 
    p.is_insured === 1
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.insurance_company.trim()) {
      setError('Insurance company is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let savedPolicy: CasePolicy;
      
      if (policy) {
        // Update existing
        await window.electron.db.updateCasePolicy(policy.id, formData);
        savedPolicy = { ...policy, ...formData };
      } else {
        // Create new
        const id = await window.electron.db.createCasePolicy(formData);
        savedPolicy = { id, ...formData } as CasePolicy;
      }
      
      onSave(savedPolicy);
    } catch (err) {
      console.error('Error saving policy:', err);
      setError('Failed to save policy');
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
        maxWidth: '600px',
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
              {policy ? 'Edit Policy' : 'Add Policy'}
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
                  Insurance Company *
                </label>
                <input
                  type="text"
                  value={formData.insurance_company}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurance_company: e.target.value }))}
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
                  Policy Number
                </label>
                <input
                  type="text"
                  value={formData.policy_number || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
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

            {/* Policy Type and Limits */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Policy Type
                </label>
                <select
                  value={formData.policy_type || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, policy_type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                >
                  <option value="">Select type...</option>
                  <option value="Auto Liability">Auto Liability</option>
                  <option value="General Liability">General Liability</option>
                  <option value="Professional Liability">Professional Liability</option>
                  <option value="Property">Property</option>
                  <option value="Umbrella">Umbrella</option>
                  <option value="Workers' Compensation">Workers' Compensation</option>
                  <option value="Other">Other</option>
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
                  Policy Limits ($)
                </label>
                <input
                  type="number"
                  value={formData.policy_limits || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, policy_limits: e.target.value ? parseInt(e.target.value) : null }))}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '2px solid var(--color-border-medium)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                  }}
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            {/* Insured Person */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Insured Person
              </label>
              <select
                value={formData.insured_person_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, insured_person_id: e.target.value ? parseInt(e.target.value) : null }))}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '2px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                }}
              >
                <option value="">Select insured person...</option>
                {insuredPersons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} {person.organization && `(${person.organization})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  Effective Date
                </label>
                <input
                  type="date"
                  value={formData.effective_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
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
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={formData.expiration_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
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
                rows={3}
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
                {isSubmitting ? 'Saving...' : (policy ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
