-- MODULE A: UNIFIED CASE MANAGEMENT SCHEMA
-- Dy's Sunflower Suite v5.0 - UI Overhaul
-- Database Schema with Unified case_persons table
-- Replaces: case_parties, case_contacts, global_contacts (old structure)

-- ============================================================================
-- CORE CASE DATA
-- ============================================================================
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_name TEXT NOT NULL,
  cm_number TEXT UNIQUE NOT NULL,
  lead_attorney TEXT NOT NULL,
  
  -- Basic case info
  venue_court TEXT NOT NULL,
  venue_judge TEXT,
  venue_clerk TEXT,
  venue_staff_attorney TEXT,
  
  phase TEXT NOT NULL CHECK(phase IN ('Open', 'Pending', 'Closed')),
  status TEXT NOT NULL,
  case_type TEXT NOT NULL,
  case_subtype TEXT,
  policy_limit TEXT,
  
  -- Important dates
  date_opened DATE NOT NULL,
  date_of_loss DATE NOT NULL,
  date_closed DATE,
  
  -- Discovery
  discovery_close_date DATE,
  discovery_deadline_extended INTEGER DEFAULT 0,
  discovery_deadline_notes TEXT,
  
  -- Special flags
  is_wrongful_death INTEGER DEFAULT 0,
  is_survival_action INTEGER DEFAULT 0,
  has_deceased_defendants INTEGER DEFAULT 0,
  
  notes TEXT,
  is_deleted INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_cm_number ON cases(cm_number);
CREATE INDEX IF NOT EXISTS idx_cases_lead_attorney ON cases(lead_attorney);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_phase ON cases(phase);
CREATE INDEX IF NOT EXISTS idx_cases_date_opened ON cases(date_opened);

-- ============================================================================
-- UNIFIED PERSONS TABLE (Parties + Contacts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_persons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  
  -- Person type (determines which fields are used)
  person_type TEXT NOT NULL CHECK(person_type IN (
    'party', 'attorney', 'expert', 'witness', 'adjuster', 
    'corporate_rep', 'medical_provider', 'investigator', 
    'court_personnel', 'vendor', 'other'
  )),
  
  -- Core identity (for EVERYONE)
  name TEXT NOT NULL,
  is_entity INTEGER DEFAULT 0,
  
  -- Contact information (optional for parties, required for contacts)
  phone TEXT,
  email TEXT,
  address TEXT,
  organization TEXT, -- Firm name, company name, etc.
  
  -- Party-specific fields (only used when person_type = 'party')
  party_role TEXT CHECK(party_role IN ('plaintiff', 'defendant', NULL)),
  is_primary_party INTEGER DEFAULT 0,
  we_represent INTEGER DEFAULT 0, -- Flag for defendants/insureds we represent
  is_insured INTEGER DEFAULT 0,
  is_corporate INTEGER DEFAULT 0,
  
  -- Party litigation tracking
  is_presuit INTEGER DEFAULT 0,
  monitor_for_service INTEGER DEFAULT 0,
  service_date DATE,
  answer_filed_date DATE,
  
  -- Party personal info
  date_of_birth DATE,
  ssn_last_four TEXT,
  drivers_license TEXT,
  
  -- Professional information (for attorneys, experts)
  bar_number TEXT,
  specialty TEXT,
  firm_name TEXT,
  
  -- Relationship to case
  role TEXT, -- 'lead_counsel', 'retained_expert', 'fact_witness', 'primary_adjuster', etc.
  alignment TEXT CHECK(alignment IN ('plaintiff_side', 'defense_side', 'neutral', NULL)),
  
  -- Optional link to global contacts library (for reusable contacts)
  global_contact_id INTEGER REFERENCES global_contacts(id),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_persons_case_id ON case_persons(case_id);
CREATE INDEX IF NOT EXISTS idx_case_persons_type ON case_persons(person_type);
CREATE INDEX IF NOT EXISTS idx_case_persons_party_role ON case_persons(party_role);
CREATE INDEX IF NOT EXISTS idx_case_persons_we_represent ON case_persons(we_represent);
CREATE INDEX IF NOT EXISTS idx_case_persons_name ON case_persons(name);
CREATE INDEX IF NOT EXISTS idx_case_persons_global ON case_persons(global_contact_id);

-- ============================================================================
-- GLOBAL CONTACTS LIBRARY (for promoting frequently-used contacts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS global_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  organization TEXT,
  title TEXT,
  phone_primary TEXT,
  phone_secondary TEXT,
  email_primary TEXT,
  email_secondary TEXT,
  address TEXT,
  
  contact_type TEXT, -- 'attorney', 'expert', 'adjuster', 'vendor', etc.
  specialty TEXT,
  bar_number TEXT,
  
  preferred_contact TEXT CHECK(preferred_contact IN ('email', 'phone', 'mail', 'text')),
  best_times TEXT,
  is_favorite INTEGER DEFAULT 0,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_global_contacts_name ON global_contacts(name);
CREATE INDEX IF NOT EXISTS idx_global_contacts_organization ON global_contacts(organization);
CREATE INDEX IF NOT EXISTS idx_global_contacts_email ON global_contacts(email_primary);
CREATE INDEX IF NOT EXISTS idx_global_contacts_type ON global_contacts(contact_type);

-- ============================================================================
-- POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  policy_type TEXT NOT NULL CHECK(policy_type IN ('Primary', 'UM/UIM', 'Excess/Umbrella')),
  carrier_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  policy_limits TEXT,
  we_are_retained_by_carrier INTEGER DEFAULT 0,
  umuim_type TEXT CHECK(umuim_type IN ('Add-on', 'Set-off', NULL)),
  
  -- Link to insured party
  insured_person_id INTEGER REFERENCES case_persons(id),
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_policies_case_id ON case_policies(case_id);
CREATE INDEX IF NOT EXISTS idx_case_policies_type ON case_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_case_policies_insured ON case_policies(insured_person_id);

-- ============================================================================
-- CORRESPONDENCE LOG (Global)
-- ============================================================================
CREATE TABLE IF NOT EXISTS correspondence_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  person_id INTEGER REFERENCES case_persons(id), -- Who we communicated with
  
  method TEXT NOT NULL CHECK(method IN ('call', 'email', 'letter', 'text', 'in_person', 'fax', 'other')),
  direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
  
  date DATE NOT NULL,
  time TEXT, -- HH:MM format
  subject TEXT,
  description TEXT NOT NULL,
  notes TEXT,
  
  -- Attachments
  attachment_path TEXT,
  
  -- Follow-up action needed
  follow_up INTEGER DEFAULT 0,
  
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_correspondence_case ON correspondence_log(case_id);
CREATE INDEX IF NOT EXISTS idx_correspondence_person ON correspondence_log(person_id);
CREATE INDEX IF NOT EXISTS idx_correspondence_date ON correspondence_log(date);
CREATE INDEX IF NOT EXISTS idx_correspondence_method ON correspondence_log(method);

-- ============================================================================
-- DOCUMENTS (Updated to link to persons)
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  
  -- Document file information
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT, -- pdf, docx, image, etc.
  file_size INTEGER, -- in bytes
  upload_date DATE DEFAULT CURRENT_DATE,
  document_date DATE, -- actual date of document content
  
  -- Document categorization
  document_type TEXT CHECK(document_type IN (
    -- Investigation documents
    'ISO_report', 'MVAR', 'citation', 'background_check', 'social_media_post',
    'arrests', 'SIU_materials', 'obituary', 'education_related', 'work_related',
    'website_bio', 'corporate_filing', 'other_lawsuits', 'other_claims',
    -- Standard litigation documents
    'deposition_transcript', 'policy_document', 'medical_records', 'pleading',
    'discovery_response', 'expert_report', 'correspondence', 'other'
  )),
  
  -- SOURCE TRACKING (Critical for litigation!)
  source_type TEXT NOT NULL CHECK(source_type IN (
    'claim_file', 'pleadings', 'document_production', 'non_party_production',
    'pre_suit_demand', 'private_investigator', 'public_records', 'expert',
    'news_article', 'website', 'social_media', 'correspondence'
  )),
  
  -- Link to person (party or contact) who is the source
  source_person_id INTEGER REFERENCES case_persons(id),
  author_person_id INTEGER REFERENCES case_persons(id), -- Who authored/signed it
  
  -- Source details
  source_notes TEXT, -- "Produced in response to RFP #12"
  production_date DATE, -- when we received it
  bates_range TEXT, -- "DEFENDANT_0001-0045"
  
  -- Document content
  description TEXT,
  notes TEXT,
  tags TEXT, -- JSON array for future chronology integration
  extracted_text TEXT, -- Future: OCR for full-text search
  
  -- Metadata
  uploaded_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_documents_case ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON case_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_source ON case_documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_date ON case_documents(document_date);
CREATE INDEX IF NOT EXISTS idx_documents_source_person ON case_documents(source_person_id);
CREATE INDEX IF NOT EXISTS idx_documents_author_person ON case_documents(author_person_id);

-- ============================================================================
-- CASE DISPOSITION
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_dispositions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  
  -- Disposition details
  disposition_type TEXT CHECK(disposition_type IN (
    'settlement', 'verdict', 'dismissal_with_prejudice', 
    'dismissal_without_prejudice', 'other'
  )),
  disposition_date DATE NOT NULL,
  settlement_amount DECIMAL(12,2),
  other_disposition_type TEXT,
  
  -- Settlement workflow tracking
  settlement_agreement_date DATE,
  release_drafted INTEGER DEFAULT 0,
  release_executed INTEGER DEFAULT 0,
  dismissal_filed INTEGER DEFAULT 0,
  dismissal_date DATE,
  
  -- Documents
  settlement_agreement_path TEXT,
  release_document_path TEXT,
  dismissal_document_path TEXT,
  
  -- Refiling potential
  potential_refiling INTEGER DEFAULT 0,
  refiling_deadline DATE,
  refiling_days_notice INTEGER DEFAULT 90,
  refiling_reminder_set INTEGER DEFAULT 0,
  
  disposition_notes TEXT,
  
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dispositions_case_id ON case_dispositions(case_id);
CREATE INDEX IF NOT EXISTS idx_dispositions_type ON case_dispositions(disposition_type);
CREATE INDEX IF NOT EXISTS idx_dispositions_date ON case_dispositions(disposition_date);
CREATE INDEX IF NOT EXISTS idx_dispositions_refiling ON case_dispositions(potential_refiling);
