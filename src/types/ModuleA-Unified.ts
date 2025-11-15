// MODULE A: UNIFIED TYPE DEFINITIONS
// Dy's Sunflower Suite v5.0 - UI Overhaul
// TypeScript types for unified case_persons architecture

// ============================================================================
// CASE PERSON (Unified Parties + Contacts)
// ============================================================================

export type PersonType = 
  | 'party' 
  | 'attorney' 
  | 'expert' 
  | 'witness' 
  | 'adjuster'
  | 'corporate_rep' 
  | 'medical_provider' 
  | 'investigator'
  | 'court_personnel' 
  | 'vendor' 
  | 'other';

export type PartyRole = 'plaintiff' | 'defendant' | null;

export type Alignment = 'plaintiff_side' | 'defense_side' | 'neutral' | null;

export interface CasePerson {
  id: string;
  case_id: string;
  
  // Core identity
  person_type: PersonType;
  name: string;
  is_entity: boolean;
  
  // Contact information
  phone: string | null;
  email: string | null;
  address: string | null;
  organization: string | null;
  
  // Party-specific fields (only used when person_type = 'party')
  party_role: PartyRole;
  is_primary_party: boolean;
  we_represent: boolean; // Flag for defendants/insureds we represent
  is_insured: boolean;
  is_corporate: boolean;
  
  // Party litigation tracking
  is_presuit: boolean;
  monitor_for_service: boolean;
  service_date: string | null;
  answer_filed_date: string | null;
  
  // Party personal info
  date_of_birth: string | null;
  ssn_last_four: string | null;
  drivers_license: string | null;
  
  // Professional information
  bar_number: string | null;
  specialty: string | null;
  firm_name: string | null;
  
  // Relationship to case
  role: string | null;
  alignment: Alignment;
  
  // Link to global contacts library
  global_contact_id: string | null;
  
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CasePersonInput {
  case_id: string;
  person_type: PersonType;
  name: string;
  is_entity?: boolean;
  
  // Contact info
  phone?: string;
  email?: string;
  address?: string;
  organization?: string;
  
  // Party-specific
  party_role?: PartyRole;
  is_primary_party?: boolean;
  we_represent?: boolean;
  is_insured?: boolean;
  is_corporate?: boolean;
  
  // Litigation tracking
  is_presuit?: boolean;
  monitor_for_service?: boolean;
  service_date?: string;
  answer_filed_date?: string;
  
  // Personal info
  date_of_birth?: string;
  ssn_last_four?: string;
  drivers_license?: string;
  
  // Professional
  bar_number?: string;
  specialty?: string;
  firm_name?: string;
  
  // Relationship
  role?: string;
  alignment?: Alignment;
  
  global_contact_id?: string;
  notes?: string;
}

// ============================================================================
// GLOBAL CONTACTS (for frequently-used contacts)
// ============================================================================

export interface GlobalContact {
  id: string;
  name: string;
  organization: string | null;
  title: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email_primary: string | null;
  email_secondary: string | null;
  address: string | null;
  
  contact_type: string | null;
  specialty: string | null;
  bar_number: string | null;
  
  preferred_contact: 'email' | 'phone' | 'mail' | 'text' | null;
  best_times: string | null;
  is_favorite: boolean;
  notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface GlobalContactInput {
  name: string;
  organization?: string;
  title?: string;
  phone_primary?: string;
  phone_secondary?: string;
  email_primary?: string;
  email_secondary?: string;
  address?: string;
  contact_type?: string;
  specialty?: string;
  bar_number?: string;
  preferred_contact?: 'email' | 'phone' | 'mail' | 'text';
  best_times?: string;
  is_favorite?: boolean;
  notes?: string;
}

// ============================================================================
// CORRESPONDENCE LOG
// ============================================================================

export type CorrespondenceMethod = 'call' | 'email' | 'letter' | 'text' | 'in_person' | 'fax' | 'other';
export type CorrespondenceDirection = 'inbound' | 'outbound';

export interface CorrespondenceEntry {
  id: string;
  case_id: string;
  person_id: string | null;
  
  method: CorrespondenceMethod;
  direction: CorrespondenceDirection;
  
  date: string;
  time: string | null;
  subject: string | null;
  description: string;
  notes: string | null;
  
  attachment_path: string | null;
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CorrespondenceEntryInput {
  case_id: string;
  person_id?: string;
  method: CorrespondenceMethod;
  direction: CorrespondenceDirection;
  date: string;
  time?: string;
  subject?: string;
  description: string;
  notes?: string;
  attachment_path?: string;
}

// ============================================================================
// CASE (Updated)
// ============================================================================

export interface Case {
  id: string;
  case_name: string;
  cm_number: string;
  lead_attorney: string;
  
  venue_court: string;
  venue_judge: string | null;
  venue_clerk: string | null;
  venue_staff_attorney: string | null;
  
  phase: 'Open' | 'Pending' | 'Closed';
  status: string;
  case_type: string;
  case_subtype: string | null;
  policy_limit: string | null;
  
  date_opened: string;
  date_of_loss: string;
  date_closed: string | null;
  
  discovery_close_date: string | null;
  discovery_deadline_extended: boolean;
  discovery_deadline_notes: string | null;
  
  is_wrongful_death: boolean;
  is_survival_action: boolean;
  has_deceased_defendants: boolean;
  
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseInput {
  case_name: string;
  cm_number: string;
  lead_attorney: string;
  venue_court: string;
  venue_judge?: string;
  case_type: string;
  policy_limit?: string;
  date_opened: string;
  date_of_loss: string;
  discovery_close_date?: string;
  phase?: 'Open' | 'Pending' | 'Closed';
  status: string;
  notes?: string;
}

// ============================================================================
// POLICY (Updated with person link)
// ============================================================================

export type PolicyType = 'Primary' | 'UM/UIM' | 'Excess/Umbrella';
export type UMUIMType = 'Add-on' | 'Set-off' | null;

export interface CasePolicy {
  id: string;
  case_id: string;
  policy_type: PolicyType;
  carrier_name: string;
  policy_number: string;
  policy_limits: string | null;
  we_are_retained_by_carrier: boolean;
  umuim_type: UMUIMType;
  insured_person_id: string | null; // Link to case_persons
  notes: string | null;
  created_at: string;
}

export interface CasePolicyInput {
  case_id: string;
  policy_type: PolicyType;
  carrier_name: string;
  policy_number: string;
  policy_limits?: string;
  we_are_retained_by_carrier?: boolean;
  umuim_type?: UMUIMType;
  insured_person_id?: string;
  notes?: string;
}

// ============================================================================
// DOCUMENT (Updated with person links)
// ============================================================================

export interface CaseDocument {
  id: string;
  case_id: string;
  
  document_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  upload_date: string;
  document_date: string | null;
  
  document_type: string | null;
  source_type: string;
  
  source_person_id: string | null; // Link to case_persons
  author_person_id: string | null; // Link to case_persons
  
  source_notes: string | null;
  production_date: string | null;
  bates_range: string | null;
  
  description: string | null;
  notes: string | null;
  tags: string | null;
  extracted_text: string | null;
  
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CaseDocumentInput {
  case_id: string;
  document_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  document_date?: string;
  document_type?: string;
  source_type: string;
  source_person_id?: string;
  author_person_id?: string;
  source_notes?: string;
  production_date?: string;
  bates_range?: string;
  description?: string;
  notes?: string;
  tags?: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

// For Overview tab - get plaintiffs
export interface Plaintiff extends CasePerson {
  person_type: 'party';
  party_role: 'plaintiff';
}

// For Overview tab - get insureds we represent
export interface InsuredDefendant extends CasePerson {
  person_type: 'party';
  party_role: 'defendant';
  we_represent: true;
}

// For Parties & Contacts tab filtering
export type PartyFilter = 'all' | 'plaintiffs' | 'defendants' | 'we_represent';
export type ContactFilter = 'all' | 'attorney' | 'expert' | 'witness' | 'adjuster' | 'other';

