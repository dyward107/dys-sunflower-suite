// MODULE A: CASE MANAGER - TYPE DEFINITIONS
// Dy's Sunflower Suite v5.0 - Phases 1A & 1B

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
// CONTACT TYPES (PHASE 1B)
// ============================================================================

export type ContactType =
  | 'adjuster'
  | 'tpa_agent'
  | 'corporate_rep'
  | 'insurance_broker'
  | 'defense_counsel'
  | 'plaintiff_counsel'
  | 'expert'
  | 'investigator'
  | 'medical_provider'
  | 'witness'
  | 'court_personnel'
  | 'mediator_arbitrator'
  | 'vendor'
  | 'other';

export type ContactRole = 
  | 'primary' | 'secondary' // adjuster
  | 'primary' | 'secondary' // plaintiff_counsel  
  | 'lead' | 'co_counsel' | 'co_defendant_counsel' // defense_counsel
  | 'retained' | 'consulting' // expert
  | 'treating_physician' | 'facility' | 'records_custodian' // medical_provider
  | 'fact' | 'expert' // witness
  | 'judge' | 'clerk' | 'staff_attorney' // court_personnel
  | string; // other (custom role)

export type PreferredContact = 'email' | 'phone' | 'mail' | 'text';

export interface Contact {
  id: number;
  name: string;
  organization: string | null;
  title: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email_primary: string | null;
  email_secondary: string | null;
  address: string | null;
  preferred_contact: PreferredContact | null;
  best_times: string | null;
  do_not_contact: boolean;
  is_favorite: boolean;
  notes: string | null;
  contact_type: ContactType | null;
  role: ContactRole | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInput {
  name: string;
  organization?: string;
  title?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email_primary?: string;
  email_secondary?: string;
  address?: string;
  preferred_contact?: PreferredContact;
  best_times?: string;
  do_not_contact?: boolean;
  is_favorite?: boolean;
  notes?: string;
  contact_type?: ContactType;
  role?: ContactRole;
}

export interface CaseContact {
  id: number;
  case_id: number;
  contact_id: number;
  party_id: number | null;
  contact_type: ContactType;
  role: ContactRole;
  is_primary: boolean;
  relationship_start_date: string | null;
  relationship_end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined contact information (populated by query)
  contact?: Contact;
}

export interface CaseContactInput {
  case_id: number;
  contact_id: number;
  party_id?: number | null;
  contact_type: ContactType;
  role: ContactRole;
  is_primary?: boolean;
  relationship_start_date?: string;
  relationship_end_date?: string;
  notes?: string;
}

export interface ContactFilters {
  name?: string;
  organization?: string;
  contact_type?: ContactType;
  preferred_contact?: PreferredContact;
  do_not_contact?: boolean;
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

// ============================================================================
// CONTACT CONSTANTS (PHASE 1B)
// ============================================================================

export const CONTACT_TYPES: ContactType[] = [
  'adjuster',
  'tpa_agent',
  'corporate_rep',
  'insurance_broker',
  'defense_counsel',
  'plaintiff_counsel', 
  'expert',
  'investigator',
  'medical_provider',
  'witness',
  'court_personnel',
  'mediator_arbitrator',
  'vendor',
  'other'
] as const;

export const CONTACT_ROLES: Record<ContactType, string[]> = {
  adjuster: ['primary', 'secondary', 'supervisor', 'claims_manager', 'other'],
  tpa_agent: ['primary', 'secondary', 'supervisor', 'other'],
  corporate_rep: ['risk_manager', 'claims_coordinator', 'general_counsel', 'safety_director', 'ceo', 'other'],
  insurance_broker: ['lead_broker', 'assistant_broker', 'account_manager', 'other'],
  defense_counsel: ['lead', 'co_counsel', 'co_defendant_counsel', 'local_counsel', 'coverage_counsel', 'other'],
  plaintiff_counsel: ['primary', 'secondary', 'local_counsel', 'other'],
  expert: ['retained', 'consulting', 'rebuttal', 'damages', 'liability', 'medical', 'other'],
  investigator: ['primary', 'surveillance', 'background', 'other'],
  medical_provider: ['treating_physician', 'facility', 'records_custodian', 'billing_contact', 'other'],
  witness: ['fact', 'expert', 'other'],
  court_personnel: ['judge', 'clerk', 'staff_attorney', 'other'],
  mediator_arbitrator: ['mediator', 'arbitrator', 'special_master', 'other'],
  vendor: ['records_retrieval', 'process_server', 'court_reporter', 'translator', 'other'],
  other: [] // Custom roles allowed
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  adjuster: 'Adjuster',
  tpa_agent: 'TPA Agent',
  corporate_rep: 'Corporate Representative',
  insurance_broker: 'Insurance Broker/Agent',
  defense_counsel: 'Defense Counsel', 
  plaintiff_counsel: 'Plaintiff Counsel',
  expert: 'Expert',
  investigator: 'Investigator / SIU',
  medical_provider: 'Medical Provider',
  witness: 'Witness',
  court_personnel: 'Court Personnel',
  mediator_arbitrator: 'Mediator / Arbitrator',
  vendor: 'Vendor / Service Provider',
  other: 'Other'
};

export const CONTACT_ROLE_LABELS: Record<string, string> = {
  // Adjuster & TPA roles
  primary: 'Primary',
  secondary: 'Secondary',
  supervisor: 'Supervisor',
  claims_manager: 'Claims Manager',
  
  // Corporate / Insurance roles
  risk_manager: 'Risk Manager',
  claims_coordinator: 'Claims Coordinator',
  general_counsel: 'General Counsel',
  safety_director: 'Safety Director',
  ceo: 'Executive / CEO',
  lead_broker: 'Lead Broker',
  assistant_broker: 'Assistant Broker',
  account_manager: 'Account Manager',
  
  // Defense counsel roles  
  lead: 'Lead Counsel',
  co_counsel: 'Co-Counsel',
  co_defendant_counsel: 'Co-Defendant Counsel',
  local_counsel: 'Local Counsel',
  coverage_counsel: 'Coverage Counsel',
  
  // Plaintiff counsel roles
  // (primary / secondary already defined above)
  
  // Expert roles
  retained: 'Retained Expert',
  consulting: 'Consulting Expert',
  rebuttal: 'Rebuttal Expert',
  damages: 'Damages Expert',
  liability: 'Liability Expert',
  medical: 'Medical Expert',
  
  // Investigator roles
  surveillance: 'Surveillance Investigator',
  background: 'Background Investigator',
  
  // Medical provider roles
  treating_physician: 'Treating Physician',
  facility: 'Medical Facility', 
  records_custodian: 'Records Custodian',
  billing_contact: 'Billing / Records',
  
  // Witness roles
  fact: 'Fact Witness',
  expert: 'Expert Witness',
  
  // Court personnel roles
  judge: 'Judge',
  clerk: 'Clerk',
  staff_attorney: 'Staff Attorney',
  
  // Mediator / Arbitrator roles
  mediator: 'Mediator',
  arbitrator: 'Arbitrator',
  special_master: 'Special Master',
  
  // Vendor roles
  records_retrieval: 'Records Retrieval',
  process_server: 'Process Server',
  court_reporter: 'Court Reporter',
  translator: 'Translator',
  
  other: 'Other'
};

export const PREFERRED_CONTACT_METHODS = ['email', 'phone', 'mail', 'text'] as const;

export const PREFERRED_CONTACT_LABELS: Record<PreferredContact, string> = {
  email: 'Email',
  phone: 'Phone',
  mail: 'Mail',
  text: 'Text Message'
};

// ============================================================================
// MODULE A PHASE 1C: DISPOSITION TYPES
// ============================================================================

export type DispositionType = 'settlement' | 'verdict' | 'dismissal_with_prejudice' | 'dismissal_without_prejudice' | 'other';

export interface Disposition {
  id: number;
  case_id: number;
  disposition_type: DispositionType;
  disposition_date: string;
  settlement_amount?: number;
  other_disposition_type?: string;
  
  // Settlement workflow tracking
  settlement_agreement_date?: string;
  release_drafted: boolean;
  release_executed: boolean;
  dismissal_filed: boolean;
  dismissal_date?: string;
  
  // Documents
  settlement_agreement_path?: string;
  release_document_path?: string;
  dismissal_document_path?: string;
  
  // Refiling (auto-enabled for dismissal without prejudice)
  potential_refiling: boolean;
  refiling_deadline?: string;
  refiling_days_notice: number;
  refiling_reminder_set: boolean;
  disposition_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DispositionInput {
  case_id: number;
  disposition_type: DispositionType;
  disposition_date: string;
  settlement_amount?: number;
  other_disposition_type?: string;
  
  // Settlement workflow tracking
  settlement_agreement_date?: string;
  release_drafted?: boolean;
  release_executed?: boolean;
  dismissal_filed?: boolean;
  dismissal_date?: string;
  
  // Documents
  settlement_agreement_path?: string;
  release_document_path?: string;
  dismissal_document_path?: string;
  
  // Refiling
  potential_refiling?: boolean;
  refiling_deadline?: string;
  refiling_days_notice?: number;
  refiling_reminder_set?: boolean;
  disposition_notes?: string;
  created_by?: string;
}

// Disposition Type Constants
export const DISPOSITION_TYPES: DispositionType[] = [
  'settlement',
  'verdict', 
  'dismissal_with_prejudice',
  'dismissal_without_prejudice',
  'other'
];

export const DISPOSITION_TYPE_LABELS: Record<DispositionType, string> = {
  settlement: 'Settlement',
  verdict: 'Verdict',
  dismissal_with_prejudice: 'Dismissal with Prejudice',
  dismissal_without_prejudice: 'Dismissal without Prejudice',
  other: 'Other',
};
