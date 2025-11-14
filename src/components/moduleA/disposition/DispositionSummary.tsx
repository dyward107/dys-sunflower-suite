import React from 'react';
import { sunflowerTheme } from '../../../styles/sunflowerTheme';
import type { Case, Disposition } from '../../../types/ModuleA';
import { DISPOSITION_TYPE_LABELS } from '../../../types/ModuleA';

interface DispositionSummaryProps {
  disposition: Disposition;
  case: Case;
  onClose: () => void;
}

export const DispositionSummary: React.FC<DispositionSummaryProps> = ({
  disposition,
  case: selectedCase,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDispositionTypeDisplay = () => {
    if (disposition.disposition_type === 'other' && disposition.other_disposition_type) {
      return disposition.other_disposition_type;
    }
    return DISPOSITION_TYPE_LABELS[disposition.disposition_type];
  };

  return (
    <div className="space-y-6">
      {/* Case Status Banner */}
      <div className={`${sunflowerTheme.containers.card} p-4 bg-green-50 border-green-200`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Case Closed</h3>
            <p className="text-sm text-green-700">
              This case was closed on {formatDate(disposition.disposition_date)} via {getDispositionTypeDisplay().toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Disposition Details */}
      <div className={`${sunflowerTheme.containers.card} p-6 space-y-6`}>
        <h3 className={sunflowerTheme.typography.styles.h3}>Disposition Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className={sunflowerTheme.typography.styles.label}>Disposition Type</label>
              <p className={`${sunflowerTheme.typography.styles.body} mt-1 font-medium`}>
                {getDispositionTypeDisplay()}
              </p>
            </div>

            <div>
              <label className={sunflowerTheme.typography.styles.label}>Disposition Date</label>
              <p className={`${sunflowerTheme.typography.styles.body} mt-1`}>
                {formatDate(disposition.disposition_date)}
              </p>
            </div>

            {disposition.settlement_amount && (
              <div>
                <label className={sunflowerTheme.typography.styles.label}>Settlement Amount</label>
                <p className={`${sunflowerTheme.typography.styles.body} mt-1 font-semibold text-green-700`}>
                  {formatCurrency(disposition.settlement_amount)}
                </p>
              </div>
            )}
          </div>

          {/* Settlement Workflow Tracking */}
          {disposition.disposition_type === 'settlement' && (
            <div className="space-y-4 col-span-2 pt-6 border-t border-sunflower-taupe/30">
              <h4 className={sunflowerTheme.typography.styles.h4}>Settlement Workflow Status</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disposition.settlement_agreement_date && (
                  <div>
                    <label className={sunflowerTheme.typography.styles.label}>Agreement Date</label>
                    <p className={sunflowerTheme.typography.styles.body}>
                      {formatDate(disposition.settlement_agreement_date)}
                    </p>
                  </div>
                )}
                
                {disposition.dismissal_date && (
                  <div>
                    <label className={sunflowerTheme.typography.styles.label}>Dismissal Date</label>
                    <p className={sunflowerTheme.typography.styles.body}>
                      {formatDate(disposition.dismissal_date)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {disposition.release_drafted && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    ✅ Release Drafted
                  </span>
                )}
                {disposition.release_executed && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    ✅ Release Executed
                  </span>
                )}
                {disposition.dismissal_filed && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                    ✅ Dismissal Filed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="space-y-4 col-span-2">
            <h4 className={sunflowerTheme.typography.styles.h4}>Associated Documents</h4>
            
            <div className="space-y-2">
              {disposition.settlement_agreement_path && (
                <div className="flex items-center gap-2 text-sm text-sunflower-brown">
                  <span>📄</span>
                  <span>Settlement Agreement</span>
                </div>
              )}
              
              {disposition.release_document_path && (
                <div className="flex items-center gap-2 text-sm text-sunflower-brown">
                  <span>📋</span>
                  <span>Release Document</span>
                </div>
              )}
              
              {disposition.dismissal_document_path && (
                <div className="flex items-center gap-2 text-sm text-sunflower-brown">
                  <span>📑</span>
                  <span>Dismissal Document</span>
                </div>
              )}

              {!disposition.settlement_agreement_path && 
               !disposition.release_document_path && 
               !disposition.dismissal_document_path && (
                <p className="text-sm text-sunflower-brown/60">No documents attached</p>
              )}
            </div>
          </div>
        </div>

        {/* Refiling Information */}
        {disposition.potential_refiling && (
          <div className="pt-6 border-t border-sunflower-taupe/30">
            <h4 className={sunflowerTheme.typography.styles.h4 + ' mb-4'}>Refiling Management</h4>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600">⚠️</span>
                <div className="flex-1">
                  <h5 className="font-semibold text-yellow-800 mb-2">Refiling Potential Noted</h5>
                  
                  <div className="space-y-2 text-sm">
                    {disposition.refiling_deadline && (
                      <p className="text-yellow-700">
                        <strong>Deadline:</strong> {formatDate(disposition.refiling_deadline)}
                      </p>
                    )}
                    
                    <p className="text-yellow-700">
                      <strong>Notice Period:</strong> {disposition.refiling_days_notice} days before deadline
                    </p>
                    
                    {disposition.refiling_reminder_set && (
                      <p className="text-yellow-700">
                        ✅ Calendar reminder has been set
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {disposition.disposition_notes && (
          <div className="pt-6 border-t border-sunflower-taupe/30">
            <label className={sunflowerTheme.typography.styles.label}>Notes</label>
            <div className="mt-2 p-4 bg-sunflower-cream/30 rounded-xl">
              <p className={sunflowerTheme.typography.styles.body + ' whitespace-pre-wrap'}>
                {disposition.disposition_notes}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-6 border-t border-sunflower-taupe/30">
          <h4 className={sunflowerTheme.typography.styles.h4 + ' mb-4'}>Record Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-sunflower-brown/70">
            <div>
              <p className="font-medium">Created By</p>
              <p>{disposition.created_by}</p>
            </div>
            
            <div>
              <p className="font-medium">Created</p>
              <p>{formatDate(disposition.created_at)}</p>
            </div>
            
            <div>
              <p className="font-medium">Last Updated</p>
              <p>{formatDate(disposition.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className={sunflowerTheme.buttons.primary}
        >
          Close
        </button>
      </div>
    </div>
  );
};
