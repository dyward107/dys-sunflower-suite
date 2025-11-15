// CASE OVERVIEW - Module A Tier 2 Tab
// Shows case summary, plaintiffs, and insured defendants we represent

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Users, Building, FileText, Clock, Edit } from 'lucide-react';
import type { Case } from '../../types/ModuleA';
import type { CasePerson } from '../../types/ModuleA-Unified';
import '../../styles/design-system.css';

export const CaseOverview: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [persons, setPersons] = useState<CasePerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;

    const loadCaseData = async () => {
      try {
        setIsLoading(true);
        
        // Load case details
        const caseResponse = await window.electron.db.getCaseById(parseInt(caseId));
        if (caseResponse) {
          setCaseData(caseResponse);
        }

        // Load case persons (plaintiffs and insured defendants we represent)
        const personsResponse = await window.electron.db.getCasePersons(parseInt(caseId));
        setPersons(personsResponse || []);

      } catch (err) {
        console.error('Error loading case overview:', err);
        setError('Failed to load case information');
      } finally {
        setIsLoading(false);
      }
    };

    loadCaseData();
  }, [caseId]);

  if (isLoading) {
    return (
      <div style={{ 
        padding: 'var(--spacing-xl)', 
        textAlign: 'center', 
        color: 'var(--color-text-muted)' 
      }}>
        Loading case overview...
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div style={{ 
        padding: 'var(--spacing-xl)', 
        textAlign: 'center', 
        color: 'var(--color-error)' 
      }}>
        {error || 'Case not found'}
      </div>
    );
  }

  // Filter persons
  const plaintiffs = persons.filter(p => p.party_role === 'plaintiff');
  const insuredDefendants = persons.filter(p => 
    p.party_role === 'defendant' && 
    p.is_insured === 1 && 
    p.we_represent === 1
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div style={{ 
      padding: 'var(--spacing-xl)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 'var(--spacing-xl)' 
    }}>
      {/* Case Summary Header */}
      <div style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '2px solid var(--color-border-medium)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--spacing-xl)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 'var(--line-height-tight)',
          }}>
            {caseData.case_name}
          </h2>

          <button
            onClick={() => navigate(`/cases/${caseId}/edit`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'var(--color-blue-gray)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-family-primary)',
            }}
          >
            <Edit size={16} />
            Edit Case
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              CM NUMBER
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {caseData.cm_number || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              LEAD ATTORNEY
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {caseData.lead_attorney || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              STATUS
            </div>
            <span style={{
              display: 'inline-block',
              padding: '2px var(--spacing-sm)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              backgroundColor: caseData.status === 'Active' ? 'var(--color-sage)' : 'var(--color-blue-gray)',
              color: 'white',
              borderRadius: 'var(--border-radius-sm)',
            }}>
              {caseData.status}
            </span>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              DATE OPENED
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatDate(caseData.date_opened)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              DATE OF LOSS
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatDate(caseData.date_of_loss)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              DISCOVERY DEADLINE
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatDate(caseData.discovery_close_date)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--spacing-xl)',
      }}>
        {/* Plaintiffs */}
        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '2px solid var(--color-border-medium)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-lg)',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-sm)', 
            marginBottom: 'var(--spacing-lg)' 
          }}>
            <div style={{
              backgroundColor: 'var(--color-error)',
              borderRadius: 'var(--border-radius-full)',
              padding: 'var(--spacing-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={16} style={{ color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              Plaintiffs ({plaintiffs.length})
            </h3>
          </div>

          {plaintiffs.length === 0 ? (
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-text-muted)',
              fontStyle: 'italic' 
            }}>
              No plaintiffs added yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {plaintiffs.map((plaintiff) => (
                <div key={plaintiff.id} style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--border-radius-md)',
                }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 600, 
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-xs)' 
                  }}>
                    {plaintiff.name}
                  </div>
                  {plaintiff.organization && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {plaintiff.organization}
                    </div>
                  )}
                  {plaintiff.is_primary_party === 1 && (
                    <span style={{
                      display: 'inline-block',
                      padding: '1px var(--spacing-xs)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-sunflower)',
                      color: 'var(--color-brown-primary)',
                      borderRadius: 'var(--border-radius-sm)',
                      marginTop: 'var(--spacing-xs)',
                    }}>
                      PRIMARY
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insured Defendants We Represent */}
        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '2px solid var(--color-border-medium)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-lg)',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-sm)', 
            marginBottom: 'var(--spacing-lg)' 
          }}>
            <div style={{
              backgroundColor: 'var(--color-sage)',
              borderRadius: 'var(--border-radius-full)',
              padding: 'var(--spacing-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Building size={16} style={{ color: 'white' }} />
            </div>
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              Our Insureds ({insuredDefendants.length})
            </h3>
          </div>

          {insuredDefendants.length === 0 ? (
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-text-muted)',
              fontStyle: 'italic' 
            }}>
              No insured defendants added yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {insuredDefendants.map((defendant) => (
                <div key={defendant.id} style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--border-radius-md)',
                }}>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    fontWeight: 600, 
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--spacing-xs)' 
                  }}>
                    {defendant.name}
                  </div>
                  {defendant.organization && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {defendant.organization}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '1px var(--spacing-xs)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-sage)',
                      color: 'white',
                      borderRadius: 'var(--border-radius-sm)',
                    }}>
                      INSURED
                    </span>
                    {defendant.is_primary_party === 1 && (
                      <span style={{
                        display: 'inline-block',
                        padding: '1px var(--spacing-xs)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-sunflower)',
                        color: 'var(--color-brown-primary)',
                        borderRadius: 'var(--border-radius-sm)',
                      }}>
                        PRIMARY
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'var(--spacing-md)',
      }}>
        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-md)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {persons.length}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Total Parties
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-md)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {caseData.case_type || '—'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Case Type
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-md)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {caseData.phase}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Phase
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-md)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {caseData.venue_court || '—'}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Venue
          </div>
        </div>
      </div>
    </div>
  );
};
