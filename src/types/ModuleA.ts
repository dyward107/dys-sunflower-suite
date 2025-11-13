// MODULE A: CASE MANAGER - TYPE DEFINITIONS
// Dy's Sunflower Suite v4.0

// ============================================================================
// CASE TYPES
// ============================================================================

export interface Case {
  id: number;
  case_name: string;
  cm_number: string;
  lead_attorney: string;
  primary_plaintiff_name: string;
  primary_defendant_name: string;
  venue_court: string;
  venue_judge: string | null;
  venue_clerk: string | null;
  venue_staff_attorney: string | null;
  phase: 'Open' | 'Pending' | 'Closed';
  status: string;
  case_type: string;
  case_subtype: string | null;
  date_opened: string;
  date_of_loss: string;
  date_closed: string | null;
  is_wrongful_death: boolean;
  is_survival_action: boolean;
  has_deceased_defendants: boolean;
  discovery_close_date: string | null;
  discovery_deadline_extended: boolean;
  discovery_deadline_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseInput {
  case_name: string;
  cm_number: string;
  lead_attorney: string;
  primary_plaintiff_name: string;
  primary_defendant_name: string;
  venue_court: string;
  venue_judge?: string;
  venue_clerk?: string;
  venue_staff_attorney?: string;
  phase: 'Open' | 'Pending' | 'Closed';
  status: string;
  case_type: string;
  case_subtype?: string;
  date_opened: string;
  date_of_loss: string;
  date_closed?: string;
  is_wrongful_death?: boolean;
  is_survival_action?: boolean;
  has_deceased_defendants?: boolean;
  discovery_close_date?: string;
  discovery_deadline_extended?: boolean;
  discovery_deadline_notes?: string;
  notes?: string;
}

export interface CaseFilters {
  lead_attorney?: string;
  status?: string;
  phase?: 'Open' | 'Pending' | 'Closed';
  date_opened_start?: string;
  date_opened_end?: string;
}

// ============================================================================
// PARTY TYPES
// ============================================================================

export interface Party {
  id: number;
  case_id: number;
  party_type: 'plaintiff' | 'defendant';
  party_name: string;
  is_corporate: boolean;
  is_primary: boolean;
  is_insured: boolean;
  is_presuit: boolean;
  monitor_for_service: boolean;
  service_date: string | null;
  answer_filed_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface PartyInput {
  case_id: number;
  party_type: 'plaintiff' | 'defendant';
  party_name: string;
  is_corporate?: boolean;
  is_primary?: boolean;
  is_insured?: boolean;
  is_presuit?: boolean;
  monitor_for_service?: boolean;
  service_date?: string;
  answer_filed_date?: string;
  notes?: string;
}

// ============================================================================
// POLICY TYPES
// ============================================================================

export interface Policy {
  id: number;
  case_id: number;
  policy_type: 'Primary' | 'UM/UIM' | 'Excess/Umbrella';
  carrier_name: string;
  policy_number: string;
  policy_limits: string | null;
  we_are_retained_by_carrier: boolean;
  umuim_type: 'Add-on' | 'Set-off' | null;
  notes: string | null;
  created_at: string;
}

export interface PolicyInput {
  case_id: number;
  policy_type: 'Primary' | 'UM/UIM' | 'Excess/Umbrella';
  carrier_name: string;
  policy_number: string;
  policy_limits?: string;
  we_are_retained_by_carrier?: boolean;
  umuim_type?: 'Add-on' | 'Set-off';
  notes?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const LEAD_ATTORNEYS = [
  'Rebecca Strickland',
  'Kelly Chartash',
  'Kori Wagner',
  'Elizabeth Bentley',
  'Bill Casey',
  'Marissa Merrill',
  'Leah Parker',
  'Katy'
] as const;

export const CASE_STATUSES = [
  'Pre-Suit/Intake',
  'Suit Filed/Monitor for Service',
  'Discovery',
  'Pending Mediation/Settlement',
  'Pre-Trial/Pending Dispositive Motions',
  'Trial',
  'Dismissed',
  'Settled',
  'Closed File'
] as const;

export const CASE_TYPES = [
  'Motor Vehicle Accident',
  'Pedestrian-Vehicle',
  'Product Liability',
  'Premises Liability',
  'Animal Bite',
  'Medical Malpractice',
  'Nursing Home Abuse',
  'Sex Trafficking',
  'Food Poisoning',
  'Boating Accident',
  'Construction Accident'
] as const;

export const CASE_SUBTYPES: Record<string, string[]> = {
  'Motor Vehicle Accident': ['Commercial/Trucking', 'Uninsured/Underinsured Motorist'],
  'Premises Liability': ['General', 'Slip and Fall', 'Negligent Security']
};

export const POLICY_TYPES = ['Primary', 'UM/UIM', 'Excess/Umbrella'] as const;

export const UMUIM_TYPES = ['Add-on', 'Set-off'] as const;
