-- MODULE A: CASE MANAGER (PHASES 1A & 1B)
-- Dy's Sunflower Suite v5.0
-- Database Schema for Cases, Parties, Policies, and Contacts

-- ============================================================================
-- TABLE 1: cases
-- ============================================================================
CREATE TABLE IF NOT EXISTS cases (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Case Identification
  case_name TEXT NOT NULL,
  cm_number TEXT UNIQUE NOT NULL,
  lead_attorney TEXT NOT NULL,

  -- Parties (Primary for Display)
  primary_plaintiff_name TEXT NOT NULL,
  primary_defendant_name TEXT NOT NULL,

  -- Venue Information
  venue_court TEXT NOT NULL,
  venue_judge TEXT,
  venue_clerk TEXT,
  venue_staff_attorney TEXT,

  -- Case Status
  phase TEXT NOT NULL CHECK(phase IN ('Open', 'Pending', 'Closed')),
  status TEXT NOT NULL,

  -- Case Type
  case_type TEXT NOT NULL,
  case_subtype TEXT,

  -- Important Dates
  date_opened DATE NOT NULL,
  date_of_loss DATE NOT NULL,
  date_closed DATE,

  -- Special Flags
  is_wrongful_death INTEGER DEFAULT 0,
  is_survival_action INTEGER DEFAULT 0,
  has_deceased_defendants INTEGER DEFAULT 0,

  -- Discovery Deadline (Manual for now)
  discovery_close_date DATE,
  discovery_deadline_extended INTEGER DEFAULT 0,
  discovery_deadline_notes TEXT,

  -- Notes
  notes TEXT,

  -- Soft Delete
  is_deleted INTEGER DEFAULT 0,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_cm_number ON cases(cm_number);
CREATE INDEX IF NOT EXISTS idx_cases_lead_attorney ON cases(lead_attorney);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_phase ON cases(phase);
CREATE INDEX IF NOT EXISTS idx_cases_date_opened ON cases(date_opened);

-- ============================================================================
-- TABLE 2: case_parties
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_parties (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Foreign Key to Cases
  case_id INTEGER NOT NULL,

  -- Party Information
  party_type TEXT NOT NULL CHECK(party_type IN ('plaintiff', 'defendant')),
  party_name TEXT NOT NULL,
  is_corporate INTEGER DEFAULT 0,
  is_primary INTEGER DEFAULT 0,

  -- Defendant-Specific Fields (NULL for plaintiffs)
  is_insured INTEGER DEFAULT 0,
  is_presuit INTEGER DEFAULT 0,
  monitor_for_service INTEGER DEFAULT 0,
  service_date DATE,
  answer_filed_date DATE,

  -- Notes
  notes TEXT,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Key Constraint
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_parties_case_id ON case_parties(case_id);
CREATE INDEX IF NOT EXISTS idx_case_parties_type ON case_parties(party_type);
CREATE INDEX IF NOT EXISTS idx_case_parties_name ON case_parties(party_name);

-- ============================================================================
-- TABLE 3: case_policies
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_policies (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Foreign Key to Cases
  case_id INTEGER NOT NULL,

  -- Policy Information
  policy_type TEXT NOT NULL CHECK(policy_type IN ('Primary', 'UM/UIM', 'Excess/Umbrella')),
  carrier_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  policy_limits TEXT,

  -- Retention Information
  we_are_retained_by_carrier INTEGER DEFAULT 0,

  -- UM/UIM Specific (NULL for other types)
  umuim_type TEXT CHECK(umuim_type IN ('Add-on', 'Set-off', NULL)),

  -- Notes
  notes TEXT,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Key Constraint
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_policies_case_id ON case_policies(case_id);
CREATE INDEX IF NOT EXISTS idx_case_policies_type ON case_policies(policy_type);

-- ============================================================================
-- MODULE A PHASE 1B: CONTACT MANAGEMENT
-- ============================================================================

-- ============================================================================
-- TABLE 4: global_contacts
-- ============================================================================
CREATE TABLE IF NOT EXISTS global_contacts (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Contact Information
  name TEXT NOT NULL,
  organization TEXT,
  title TEXT,

  -- Contact Methods
  phone_primary TEXT,
  phone_secondary TEXT,
  email_primary TEXT,
  email_secondary TEXT,
  address TEXT,

  -- Communication Preferences
  preferred_contact TEXT CHECK(preferred_contact IN ('email', 'phone', 'mail', 'text')),
  best_times TEXT,
  do_not_contact INTEGER DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_global_contacts_name ON global_contacts(name);
CREATE INDEX IF NOT EXISTS idx_global_contacts_organization ON global_contacts(organization);
CREATE INDEX IF NOT EXISTS idx_global_contacts_email ON global_contacts(email_primary);

-- ============================================================================
-- TABLE 5: case_contacts
-- ============================================================================
CREATE TABLE IF NOT EXISTS case_contacts (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Foreign Keys
  case_id INTEGER NOT NULL,
  contact_id INTEGER NOT NULL,

  -- Contact Role Information
  contact_type TEXT NOT NULL CHECK(contact_type IN (
    'adjuster', 'plaintiff_counsel', 'defense_counsel', 'expert', 
    'medical_provider', 'witness', 'court_personnel', 'other'
  )),
  role TEXT NOT NULL CHECK(
    (contact_type = 'adjuster' AND role IN ('primary', 'secondary')) OR
    (contact_type = 'plaintiff_counsel' AND role IN ('primary', 'secondary')) OR
    (contact_type = 'defense_counsel' AND role IN ('lead', 'co_counsel', 'co_defendant_counsel')) OR
    (contact_type = 'expert' AND role IN ('retained', 'consulting')) OR
    (contact_type = 'medical_provider' AND role IN ('treating_physician', 'facility', 'records_custodian')) OR
    (contact_type = 'witness' AND role IN ('fact', 'expert')) OR
    (contact_type = 'court_personnel' AND role IN ('judge', 'clerk', 'staff_attorney')) OR
    (contact_type = 'other' AND role IS NOT NULL)
  ),

  -- Relationship Status
  is_primary INTEGER DEFAULT 0,
  relationship_start_date DATE,
  relationship_end_date DATE,

  -- Case-Specific Notes
  notes TEXT,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Key Constraints
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES global_contacts(id) ON DELETE CASCADE,

  -- Ensure unique contact-role per case
  UNIQUE(case_id, contact_id, contact_type, role)
);

CREATE INDEX IF NOT EXISTS idx_case_contacts_case_id ON case_contacts(case_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_contact_id ON case_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_type ON case_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_case_contacts_role ON case_contacts(role);
CREATE INDEX IF NOT EXISTS idx_case_contacts_primary ON case_contacts(is_primary);
