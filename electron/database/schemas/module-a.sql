-- MODULE A: CASE MANAGEMENT & CONTACTS
-- Dy's Sunflower Suite v5.0
-- Database Schema for Cases, Parties, Contacts, and Document Management

-- ============================================================================
-- MODULE A PHASE 1A: CORE CASE DATA
-- ============================================================================
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_name TEXT NOT NULL,
  cm_number TEXT UNIQUE NOT NULL,
  lead_attorney TEXT NOT NULL,
  primary_plaintiff_name TEXT NOT NULL,
  primary_defendant_name TEXT NOT NULL,
  venue_court TEXT NOT NULL,
  venue_judge TEXT,
  venue_clerk TEXT,
  venue_staff_attorney TEXT,
  phase TEXT NOT NULL CHECK(phase IN ('Open', 'Pending', 'Closed')),
  status TEXT NOT NULL,
  case_type TEXT NOT NULL,
  case_subtype TEXT,
  date_opened DATE NOT NULL,
  date_of_loss DATE NOT NULL,
  date_closed DATE,
  is_wrongful_death INTEGER DEFAULT 0,
  is_survival_action INTEGER DEFAULT 0,
  has_deceased_defendants INTEGER DEFAULT 0,
  discovery_close_date DATE,
  discovery_deadline_extended INTEGER DEFAULT 0,
  discovery_deadline_notes TEXT,
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

CREATE TABLE IF NOT EXISTS case_parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  party_type TEXT NOT NULL CHECK(party_type IN ('plaintiff', 'defendant')),
  party_name TEXT NOT NULL,
  is_corporate INTEGER DEFAULT 0,
  is_primary INTEGER DEFAULT 0,
  is_insured INTEGER DEFAULT 0,
  is_presuit INTEGER DEFAULT 0,
  monitor_for_service INTEGER DEFAULT 0,
  service_date DATE,
  answer_filed_date DATE,
  notes TEXT,
  
  -- Phase 1D enhancements (included directly in schema)
  date_of_birth DATE,
  ssn_last_four TEXT,
  drivers_license TEXT,
  contact_id INTEGER REFERENCES global_contacts(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_parties_case_id ON case_parties(case_id);
CREATE INDEX IF NOT EXISTS idx_case_parties_type ON case_parties(party_type);
CREATE INDEX IF NOT EXISTS idx_case_parties_name ON case_parties(party_name);

CREATE TABLE IF NOT EXISTS case_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  policy_type TEXT NOT NULL CHECK(policy_type IN ('Primary', 'UM/UIM', 'Excess/Umbrella')),
  carrier_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  policy_limits TEXT,
  we_are_retained_by_carrier INTEGER DEFAULT 0,
  umuim_type TEXT CHECK(umuim_type IN ('Add-on', 'Set-off', NULL)),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_policies_case_id ON case_policies(case_id);
CREATE INDEX IF NOT EXISTS idx_case_policies_type ON case_policies(policy_type);

-- ============================================================================
-- MODULE A PHASE 1B: CONTACT MANAGEMENT
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
  preferred_contact TEXT CHECK(preferred_contact IN ('email', 'phone', 'mail', 'text')),
  best_times TEXT,
  do_not_contact INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  notes TEXT,
  contact_type TEXT,
  role TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_global_contacts_name ON global_contacts(name);
CREATE INDEX IF NOT EXISTS idx_global_contacts_organization ON global_contacts(organization);
CREATE INDEX IF NOT EXISTS idx_global_contacts_email ON global_contacts(email_primary);

CREATE TABLE IF NOT EXISTS case_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  contact_id INTEGER NOT NULL,
  party_id INTEGER, -- Optional link to specific party
  contact_type TEXT NOT NULL CHECK(contact_type IN (
    'adjuster', 'tpa_agent', 'corporate_rep', 'insurance_broker',
    'defense_counsel', 'plaintiff_counsel', 'expert', 'investigator',
    'medical_provider', 'witness', 'court_personnel', 'mediator_arbitrator',
    'vendor', 'other'
  )),
  role TEXT NOT NULL CHECK(
    (contact_type = 'adjuster' AND role IN ('primary', 'secondary', 'supervisor', 'claims_manager', 'other')) OR
    (contact_type = 'tpa_agent' AND role IN ('primary', 'secondary', 'supervisor', 'other')) OR
    (contact_type = 'corporate_rep' AND role IN ('risk_manager', 'claims_coordinator', 'general_counsel', 'safety_director', 'ceo', 'other')) OR
    (contact_type = 'insurance_broker' AND role IN ('lead_broker', 'assistant_broker', 'account_manager', 'other')) OR
    (contact_type = 'defense_counsel' AND role IN ('lead', 'co_counsel', 'co_defendant_counsel', 'local_counsel', 'coverage_counsel', 'other')) OR
    (contact_type = 'plaintiff_counsel' AND role IN ('primary', 'secondary', 'local_counsel', 'other')) OR
    (contact_type = 'expert' AND role IN ('retained', 'consulting', 'rebuttal', 'damages', 'liability', 'medical', 'other')) OR
    (contact_type = 'investigator' AND role IN ('primary', 'surveillance', 'background', 'other')) OR
    (contact_type = 'medical_provider' AND role IN ('treating_physician', 'facility', 'records_custodian', 'billing_contact', 'other')) OR
    (contact_type = 'witness' AND role IN ('fact', 'expert', 'other')) OR
    (contact_type = 'court_personnel' AND role IN ('judge', 'clerk', 'staff_attorney', 'other')) OR
    (contact_type = 'mediator_arbitrator' AND role IN ('mediator', 'arbitrator', 'special_master', 'other')) OR
    (contact_type = 'vendor' AND role IN ('records_retrieval', 'process_server', 'court_reporter', 'translator', 'other')) OR
    (contact_type = 'other' AND role IS NOT NULL)
  ),
  is_primary INTEGER DEFAULT 0,
  relationship_start_date DATE,
  relationship_end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES global_contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (party_id) REFERENCES case_parties(id) ON DELETE SET NULL,
  UNIQUE(case_id, contact_id, contact_type, role)
);

CREATE INDEX IF NOT EXISTS idx_case_contacts_case_id ON case_contacts(case_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_contact_id ON case_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_party_id ON case_contacts(party_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_type ON case_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_case_contacts_role ON case_contacts(role);
CREATE INDEX IF NOT EXISTS idx_case_contacts_primary ON case_contacts(is_primary);

-- ============================================================================
-- MODULE A PHASE 1C: CASE DISPOSITION
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
  other_disposition_type TEXT, -- For custom types when type='other'
  
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
  
  -- Refiling potential (auto-enabled for dismissal without prejudice)
  potential_refiling INTEGER DEFAULT 0,
  refiling_deadline DATE,
  refiling_days_notice INTEGER DEFAULT 90,
  refiling_reminder_set INTEGER DEFAULT 0,
  
  -- Notes
  disposition_notes TEXT,
  
  -- Metadata
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dispositions_case_id ON case_dispositions(case_id);
CREATE INDEX IF NOT EXISTS idx_dispositions_type ON case_dispositions(disposition_type);
CREATE INDEX IF NOT EXISTS idx_dispositions_date ON case_dispositions(disposition_date);
CREATE INDEX IF NOT EXISTS idx_dispositions_refiling ON case_dispositions(potential_refiling);

-- ============================================================================
-- MODULE A PHASE 1D: DOCUMENT MANAGEMENT & ENHANCED PARTIES/POLICIES
-- ============================================================================

-- Enhanced case_parties table with additional fields
-- NOTE: These ALTER TABLE statements are handled programmatically with column existence checks
-- to prevent "duplicate column" errors on subsequent runs

CREATE INDEX IF NOT EXISTS idx_case_parties_contact ON case_parties(contact_id);

-- Central document repository
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
    'discovery_response', 'expert_report', 'other'
  )),
  
  -- SOURCE TRACKING (Critical for litigation!)
  source_type TEXT NOT NULL CHECK(source_type IN (
    'claim_file', 'pleadings', 'document_production', 'non_party_production',
    'pre_suit_demand', 'private_investigator', 'public_records', 'expert',
    'news_article', 'website', 'social_media'
  )),
  
  -- Source details (conditional based on source_type)
  source_party_id INTEGER REFERENCES case_parties(id),
  source_party_name TEXT, -- cached for display
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
CREATE INDEX IF NOT EXISTS idx_documents_source_party ON case_documents(source_party_id);

-- Link documents to parties (many-to-many relationship)
CREATE TABLE IF NOT EXISTS party_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  
  -- Context for this relationship
  relevance_notes TEXT, -- "This background check shows 3 prior DUIs"
  is_primary_subject INTEGER DEFAULT 1, -- Boolean: Is this party the main subject?
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (party_id) REFERENCES case_parties(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE CASCADE,
  UNIQUE(party_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_party_documents_party ON party_documents(party_id);
CREATE INDEX IF NOT EXISTS idx_party_documents_document ON party_documents(document_id);

-- Link documents to policies (many-to-many relationship)
CREATE TABLE IF NOT EXISTS policy_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  
  -- What kind of policy document is this?
  policy_doc_type TEXT CHECK(policy_doc_type IN (
    'declaration_page', 'full_policy', 'um_uim_policy', 
    'coverage_letter', 'denial_letter', 'other'
  )),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (policy_id) REFERENCES case_policies(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE CASCADE,
  UNIQUE(policy_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_policy_documents_policy ON policy_documents(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_documents_document ON policy_documents(document_id);
