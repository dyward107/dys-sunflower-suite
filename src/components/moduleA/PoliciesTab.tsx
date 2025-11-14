// POLICIES TAB - MODULE A PHASE 1D
// Dedicated Tier 2 tab for comprehensive insurance policy management
// Enhanced policy details, document management, UM/UIM stacking support

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';
import { AddPolicyModal } from './AddPolicyModal';
import type { Policy } from '../../types/ModuleA';

// Import floral assets for unique screen design
import heroSunflower from '../../assets/florals/heroes/sunflower-garden-wide.png';
import accentBouquet from '../../assets/florals/accents/sunflower-bouquet.png';
import subtleField from '../../assets/florals/subtles/sunflower-field-blur.png';

export const PoliciesTab: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  
  // Store state
  const { 
    selectedCase,
    policies,
    isLoading, 
    error,
    selectCase,
    clearError 
  } = useCaseStore();

  // Local UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [expandedPolicy, setExpandedPolicy] = useState<number | null>(null);

  // Load case on mount
  useEffect(() => {
    const caseIdNum = parseInt(caseId || '0');
    if (caseIdNum && (!selectedCase || selectedCase.id !== caseIdNum)) {
      selectCase(caseIdNum);
    }
  }, [caseId, selectedCase, selectCase]);

  // Handle policy actions
  const handleAddPolicy = () => {
    setEditingPolicy(null);
    setShowAddModal(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicy(policy);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPolicy(null);
  };

  const togglePolicyExpansion = (policyId: number) => {
    setExpandedPolicy(expandedPolicy === policyId ? null : policyId);
  };

  // Helper functions
  const getPolicyTypeColor = (policyType: string) => {
    switch (policyType) {
      case 'Primary':
        return 'bg-sunflower-gold text-white';
      case 'UM/UIM':
        return 'bg-sunflower-taupe text-sunflower-brown';
      case 'Excess/Umbrella':
        return 'bg-sunflower-green/70 text-sunflower-brown';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPolicyLimits = (limits: string | null) => {
    if (!limits) return 'Not specified';
    return limits;
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="relative min-h-full">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunflower-gold mx-auto"></div>
            <p className="mt-4 text-sunflower-brown">Loading policies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-full">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="rounded-3xl bg-red-50/90 border border-red-200 px-6 py-4 shadow-sm backdrop-blur-sm">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={clearError}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCase) {
    return (
      <div className="relative min-h-full">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <p className="text-sunflower-brown text-lg">Case not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Group policies by type
  const primaryPolicies = policies.filter(p => p.policy_type === 'Primary');
  const umUimPolicies = policies.filter(p => p.policy_type === 'UM/UIM');
  const excessPolicies = policies.filter(p => p.policy_type === 'Excess/Umbrella');

  return (
    <div className="relative min-h-full">
      {/* Floral Backgrounds */}
      <img
        src={heroSunflower}
        className="absolute top-0 left-0 w-[450px] opacity-23 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={accentBouquet}
        className="absolute bottom-0 right-0 w-[250px] opacity-18 pointer-events-none select-none z-0"
        alt=""
      />
      <img
        src={subtleField}
        className="absolute top-1/2 right-1/3 w-[200px] opacity-12 pointer-events-none select-none z-0"
        alt=""
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className={sunflowerTheme.typography.styles.pageTitle}>
              🏦 Insurance Policies
            </h1>
            <p className={sunflowerTheme.typography.styles.muted + ' mt-2'}>
              Manage insurance policies and coverage details for {selectedCase.case_name}
            </p>
          </div>
          <button
            onClick={handleAddPolicy}
            className={sunflowerTheme.buttons.primary}
          >
            ⊕ Add Policy
          </button>
        </div>

        {/* Policies Content */}
        {policies.length === 0 ? (
          <div className={sunflowerTheme.containers.card + ' px-6 py-12 text-center'}>
            <div className="text-6xl mb-4">🏦</div>
            <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-4'}>No Policies Added Yet</h2>
            <p className={sunflowerTheme.typography.styles.muted + ' mb-6'}>
              Add insurance policies to track coverage and limits for this case.
            </p>
            <button
              onClick={handleAddPolicy}
              className={sunflowerTheme.buttons.primary}
            >
              Add First Policy
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Policies */}
            {primaryPolicies.length > 0 && (
              <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
                <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
                  Primary Liability Policies ({primaryPolicies.length})
                </h2>
                <div className="space-y-4">
                  {primaryPolicies.map((policy) => (
                    <div key={policy.id} className="border border-sunflower-taupe/60 rounded-lg overflow-hidden bg-white/60">
                      {/* Policy Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-sunflower-beige/30 transition-colors"
                        onClick={() => togglePolicyExpansion(policy.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                              {policy.carrier_name}
                            </p>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPolicyTypeColor(policy.policy_type)}`}>
                              {policy.policy_type}
                            </span>
                            <span className="text-sm text-sunflower-brown/70">
                              Policy #{policy.policy_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPolicy(policy);
                              }}
                              className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full hover:bg-sunflower-gold/30 transition-colors"
                            >
                              Edit
                            </button>
                            <span className="text-sunflower-brown/60">
                              {expandedPolicy === policy.id ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Policy Details */}
                      {expandedPolicy === policy.id && (
                        <div className="bg-white p-4 border-t border-sunflower-taupe/40">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Policy Limits
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {formatPolicyLimits(policy.policy_limits)}
                              </p>
                            </div>
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Retention Status
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {policy.we_are_retained_by_carrier ? (
                                  <span className="text-sunflower-green font-medium">✓ Retained by Carrier</span>
                                ) : (
                                  <span className="text-sunflower-brown/60">Not retained by carrier</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {policy.notes && (
                            <div className="mt-4">
                              <label className={sunflowerTheme.typography.styles.label}>
                                Notes
                              </label>
                              <p className={sunflowerTheme.typography.styles.body + ' whitespace-pre-wrap'}>
                                {policy.notes}
                              </p>
                            </div>
                          )}

                          {/* Future: Document section placeholder */}
                          <div className="mt-6 pt-4 border-t border-sunflower-taupe/30">
                            <div className="flex items-center justify-between">
                              <h4 className={sunflowerTheme.typography.styles.h4}>
                                📎 Policy Documents
                              </h4>
                              <button className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full">
                                Coming Soon
                              </button>
                            </div>
                            <p className="text-sm text-sunflower-brown/60 mt-2">
                              Upload declaration pages, full policies, and coverage letters.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UM/UIM Policies */}
            {umUimPolicies.length > 0 && (
              <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
                <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
                  UM/UIM Policies ({umUimPolicies.length})
                </h2>
                <div className="space-y-4">
                  {umUimPolicies.map((policy) => (
                    <div key={policy.id} className="border border-sunflower-taupe/60 rounded-lg overflow-hidden bg-white/60">
                      {/* Policy Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-sunflower-beige/30 transition-colors"
                        onClick={() => togglePolicyExpansion(policy.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                              {policy.carrier_name}
                            </p>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPolicyTypeColor(policy.policy_type)}`}>
                              {policy.policy_type}
                              {policy.umuim_type && ` - ${policy.umuim_type}`}
                            </span>
                            <span className="text-sm text-sunflower-brown/70">
                              Policy #{policy.policy_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPolicy(policy);
                              }}
                              className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full hover:bg-sunflower-gold/30 transition-colors"
                            >
                              Edit
                            </button>
                            <span className="text-sunflower-brown/60">
                              {expandedPolicy === policy.id ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Policy Details */}
                      {expandedPolicy === policy.id && (
                        <div className="bg-white p-4 border-t border-sunflower-taupe/40">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Policy Limits
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {formatPolicyLimits(policy.policy_limits)}
                              </p>
                            </div>
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                UM/UIM Type
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {policy.umuim_type || 'Not specified'}
                                {policy.umuim_type === 'Add-on' && (
                                  <span className="ml-2 px-2 py-1 bg-sunflower-green/20 text-sunflower-brown text-xs rounded-full">
                                    Stacked
                                  </span>
                                )}
                                {policy.umuim_type === 'Set-off' && (
                                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                    Set-off
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Retention Status
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {policy.we_are_retained_by_carrier ? (
                                  <span className="text-sunflower-green font-medium">✓ Retained by Carrier</span>
                                ) : (
                                  <span className="text-sunflower-brown/60">Not retained by carrier</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {policy.notes && (
                            <div className="mt-4">
                              <label className={sunflowerTheme.typography.styles.label}>
                                Notes
                              </label>
                              <p className={sunflowerTheme.typography.styles.body + ' whitespace-pre-wrap'}>
                                {policy.notes}
                              </p>
                            </div>
                          )}

                          {/* Future: Document section placeholder */}
                          <div className="mt-6 pt-4 border-t border-sunflower-taupe/30">
                            <div className="flex items-center justify-between">
                              <h4 className={sunflowerTheme.typography.styles.h4}>
                                📎 UM/UIM Policy Documents
                              </h4>
                              <button className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full">
                                Coming Soon
                              </button>
                            </div>
                            <p className="text-sm text-sunflower-brown/60 mt-2">
                              Upload UM/UIM policies, coverage confirmations, and stacking calculations.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Excess/Umbrella Policies */}
            {excessPolicies.length > 0 && (
              <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
                <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
                  Excess/Umbrella Policies ({excessPolicies.length})
                </h2>
                <div className="space-y-4">
                  {excessPolicies.map((policy) => (
                    <div key={policy.id} className="border border-sunflower-taupe/60 rounded-lg overflow-hidden bg-white/60">
                      {/* Policy Header */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-sunflower-beige/30 transition-colors"
                        onClick={() => togglePolicyExpansion(policy.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className={sunflowerTheme.typography.styles.body + ' font-semibold'}>
                              {policy.carrier_name}
                            </p>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPolicyTypeColor(policy.policy_type)}`}>
                              {policy.policy_type}
                            </span>
                            <span className="text-sm text-sunflower-brown/70">
                              Policy #{policy.policy_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPolicy(policy);
                              }}
                              className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full hover:bg-sunflower-gold/30 transition-colors"
                            >
                              Edit
                            </button>
                            <span className="text-sunflower-brown/60">
                              {expandedPolicy === policy.id ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Policy Details */}
                      {expandedPolicy === policy.id && (
                        <div className="bg-white p-4 border-t border-sunflower-taupe/40">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Policy Limits
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {formatPolicyLimits(policy.policy_limits)}
                              </p>
                            </div>
                            <div>
                              <label className={sunflowerTheme.typography.styles.label}>
                                Retention Status
                              </label>
                              <p className={sunflowerTheme.typography.styles.body}>
                                {policy.we_are_retained_by_carrier ? (
                                  <span className="text-sunflower-green font-medium">✓ Retained by Carrier</span>
                                ) : (
                                  <span className="text-sunflower-brown/60">Not retained by carrier</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {policy.notes && (
                            <div className="mt-4">
                              <label className={sunflowerTheme.typography.styles.label}>
                                Notes
                              </label>
                              <p className={sunflowerTheme.typography.styles.body + ' whitespace-pre-wrap'}>
                                {policy.notes}
                              </p>
                            </div>
                          )}

                          {/* Future: Document section placeholder */}
                          <div className="mt-6 pt-4 border-t border-sunflower-taupe/30">
                            <div className="flex items-center justify-between">
                              <h4 className={sunflowerTheme.typography.styles.h4}>
                                📎 Excess Policy Documents
                              </h4>
                              <button className="px-3 py-1 text-xs bg-sunflower-gold/20 text-sunflower-brown rounded-full">
                                Coming Soon
                              </button>
                            </div>
                            <p className="text-sm text-sunflower-brown/60 mt-2">
                              Upload excess/umbrella policies and coverage confirmations.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coverage Summary */}
            {policies.length > 0 && (
              <div className={sunflowerTheme.containers.card + ' px-6 py-6'}>
                <h2 className={sunflowerTheme.typography.styles.h2 + ' mb-6'}>
                  📊 Coverage Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-sunflower-gold/10 rounded-lg">
                    <p className="text-2xl font-bold text-sunflower-brown">{primaryPolicies.length}</p>
                    <p className="text-sm text-sunflower-brown/70">Primary Policies</p>
                  </div>
                  <div className="text-center p-4 bg-sunflower-taupe/10 rounded-lg">
                    <p className="text-2xl font-bold text-sunflower-brown">{umUimPolicies.length}</p>
                    <p className="text-sm text-sunflower-brown/70">UM/UIM Policies</p>
                  </div>
                  <div className="text-center p-4 bg-sunflower-green/10 rounded-lg">
                    <p className="text-2xl font-bold text-sunflower-brown">{excessPolicies.length}</p>
                    <p className="text-sm text-sunflower-brown/70">Excess/Umbrella</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Policy Modal */}
      <AddPolicyModal
        isOpen={showAddModal}
        caseId={selectedCase?.id || null}
        policy={editingPolicy}
        onClose={handleCloseModal}
        onSuccess={handleCloseModal}
      />
    </div>
  );
};
