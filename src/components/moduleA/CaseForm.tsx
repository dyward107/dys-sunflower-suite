// CASE FORM - Minimal case creation form
// Dy's Sunflower Suite - New Design System

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCaseStore } from '../../stores/caseStore';
import type { CaseInput } from '../../types/ModuleA';
import { LEAD_ATTORNEYS, CASE_TYPES } from '../../types/ModuleA';
import '../../styles/design-system.css';

export const CaseForm: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const isEditMode = caseId !== undefined && caseId !== 'new';

  const { 
    selectedCase, 
    isLoading, 
    error, 
    createCase, 
    updateCase, 
    selectCase
  } = useCaseStore();

  const [formData, setFormData] = useState<CaseInput>({
    case_name: '',
    cm_number: '',
    lead_attorney: '',
    case_type: 'Auto Accident',
    venue_court: 'TBD',
    venue_judge: '',
    date_of_loss: new Date().toISOString().split('T')[0],
    discovery_close_date: '',
    phase: 'Open',
    status: 'Active',
    date_opened: new Date().toISOString().split('T')[0],
  });

  const [policyLimit, setPolicyLimit] = useState('');

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
        case_type: selectedCase.case_type || '',
        venue_court: selectedCase.venue_court || '',
        venue_judge: selectedCase.venue_judge || '',
        date_of_loss: selectedCase.date_of_loss || '',
        discovery_close_date: selectedCase.discovery_close_date || '',
        phase: selectedCase.phase,
        status: selectedCase.status,
        date_opened: selectedCase.date_opened,
      });
    }
  }, [selectedCase, isEditMode]);

  const handleChange = (field: keyof CaseInput, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && caseId) {
        await updateCase(parseInt(caseId), formData);
        navigate('/cases');
      } else {
        const newCaseId = await createCase(formData);
        if (newCaseId) {
          navigate(`/cases/${newCaseId}`);
          return;
        }
        navigate('/cases');
      }
    } catch (err) {
      console.error('Error saving case:', err);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-xl)', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <button
          onClick={() => navigate('/cases')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            padding: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 'var(--spacing-md)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          <ArrowLeft size={14} />
          Back to Cases
        </button>
        
        <h1 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-sm)',
          lineHeight: 'var(--line-height-tight)',
        }}>
          {isEditMode ? 'Edit Case' : 'Create New Case'}
        </h1>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-base)',
        }}>
          {isEditMode ? 'Update case information' : 'Enter basic case details to get started'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: 'var(--spacing-md)',
          backgroundColor: '#FEE',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--color-error)',
          fontSize: 'var(--font-size-sm)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '2px solid var(--color-border-medium)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-xl)',
        }}>
          {/* Case Name */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-xs)',
            }}>
              Case Name <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.case_name}
              onChange={(e) => handleChange('case_name', e.target.value)}
              required
              placeholder="Enter case name"
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Grid Layout for Smaller Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            {/* CM Number */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                CM Number
              </label>
              <input
                type="text"
                value={formData.cm_number}
                onChange={(e) => handleChange('cm_number', e.target.value)}
                placeholder="e.g. CM-2024-001"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Lead Attorney */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Lead Attorney
              </label>
              <select
                value={formData.lead_attorney}
                onChange={(e) => handleChange('lead_attorney', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="">Select attorney...</option>
                {LEAD_ATTORNEYS.map((attorney) => (
                  <option key={attorney} value={attorney}>{attorney}</option>
                ))}
              </select>
            </div>

            {/* Case Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Case Type
              </label>
              <select
                value={formData.case_type || ''}
                onChange={(e) => handleChange('case_type', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="">Select type...</option>
                {CASE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Policy Limit */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Policy Limit
              </label>
              <input
                type="text"
                value={policyLimit}
                onChange={(e) => setPolicyLimit(e.target.value)}
                placeholder="e.g. $100,000"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Venue */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Venue
              </label>
              <input
                type="text"
                value={formData.venue_court || ''}
                onChange={(e) => handleChange('venue_court', e.target.value)}
                placeholder="e.g. Superior Court, County Name"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Judge Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Judge Name
              </label>
              <input
                type="text"
                value={formData.venue_judge || ''}
                onChange={(e) => handleChange('venue_judge', e.target.value)}
                placeholder="e.g. Hon. John Smith"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Date of Loss */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Date of Loss
              </label>
              <input
                type="date"
                value={formData.date_of_loss || ''}
                onChange={(e) => handleChange('date_of_loss', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Discovery Deadline */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Discovery Deadline
              </label>
              <input
                type="date"
                value={formData.discovery_close_date || ''}
                onChange={(e) => handleChange('discovery_close_date', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'flex-end',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--color-border-light)',
          }}>
            <button
              type="button"
              onClick={() => navigate('/cases')}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--border-radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                e.currentTarget.style.borderColor = 'var(--color-border-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--color-border-medium)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: 600,
                backgroundColor: isLoading ? 'var(--color-border-medium)' : 'var(--color-sunflower)',
                color: 'var(--color-brown-primary)',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--color-sunflower-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--color-sunflower)';
                }
              }}
            >
              <Save size={14} />
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Case' : 'Create Case')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
