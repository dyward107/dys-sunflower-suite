import initSqlJs, { Database } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';

const SCHEMA_SQL = `
-- MODULE A PHASE 1A: CORE CASE DATA
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

-- ============================================================================
-- MODULE B: TASK & WORKFLOW MANAGER
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  case_id INTEGER NOT NULL,
  task_group_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3, 4)),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  phase TEXT,
  assigned_to TEXT,
  due_date DATE,
  completed_date DATE,
  is_billable INTEGER DEFAULT 1,
  estimated_hours REAL,
  actual_hours REAL,
  is_locked INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_task_group_id ON tasks(task_group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase);

CREATE TABLE IF NOT EXISTS task_groups (
  id TEXT PRIMARY KEY,
  case_id INTEGER NOT NULL,
  cadence_type TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
  triggered_by TEXT,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_groups_case_id ON task_groups(case_id);
CREATE INDEX IF NOT EXISTS idx_task_groups_status ON task_groups(status);
CREATE INDEX IF NOT EXISTS idx_task_groups_cadence_type ON task_groups(cadence_type);

CREATE TABLE IF NOT EXISTS time_entries (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT,
  description TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  stop_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  entry_date DATE NOT NULL,
  rate REAL,
  is_billable INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_is_billable ON time_entries(is_billable);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  case_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  all_day INTEGER DEFAULT 1,
  start_time TIME,
  end_time TIME,
  location TEXT,
  reminders TEXT,
  calendar_type TEXT CHECK(calendar_type IN ('outlook', 'ics', 'both')),
  outlook_event_id TEXT,
  ics_file_path TEXT,
  event_type TEXT DEFAULT 'manual' CHECK(event_type IN ('auto', 'manual')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_calendar_type ON calendar_events(calendar_type);

CREATE TABLE IF NOT EXISTS automation_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  automation_code TEXT NOT NULL UNIQUE,
  is_enabled INTEGER DEFAULT 1,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_automation_settings_code ON automation_settings(automation_code);
CREATE INDEX IF NOT EXISTS idx_automation_settings_enabled ON automation_settings(is_enabled);
`;

// ============================================================================
// TYPE DEFINITIONS (Phase 1A, 1B & 1C)
// ============================================================================

interface CaseInput {
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

interface CaseFilters {
  lead_attorney?: string;
  status?: string;
  phase?: 'Open' | 'Pending' | 'Closed';
  date_opened_start?: string;
  date_opened_end?: string;
}

interface PartyInput {
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

interface PolicyInput {
  case_id: number;
  policy_type: 'Primary' | 'UM/UIM' | 'Excess/Umbrella';
  carrier_name: string;
  policy_number: string;
  policy_limits?: string;
  we_are_retained_by_carrier?: boolean;
  umuim_type?: 'Add-on' | 'Set-off';
  notes?: string;
}

// Phase 1B Contact Interfaces
type ContactType = 'adjuster' | 'tpa_agent' | 'corporate_rep' | 'insurance_broker' | 'defense_counsel' | 'plaintiff_counsel' | 'expert' | 'investigator' | 'medical_provider' | 'witness' | 'court_personnel' | 'mediator_arbitrator' | 'vendor' | 'other';

type ContactRole = 
  | 'primary' | 'secondary' | 'supervisor' | 'claims_manager' // adjuster
  | 'primary' | 'secondary' | 'supervisor' // tpa_agent
  | 'risk_manager' | 'claims_coordinator' | 'general_counsel' | 'safety_director' | 'ceo' // corporate_rep
  | 'lead_broker' | 'assistant_broker' | 'account_manager' // insurance_broker
  | 'lead' | 'co_counsel' | 'co_defendant_counsel' | 'local_counsel' | 'coverage_counsel' // defense_counsel
  | 'primary' | 'secondary' | 'local_counsel' // plaintiff_counsel
  | 'retained' | 'consulting' | 'rebuttal' | 'damages' | 'liability' | 'medical' // expert
  | 'primary' | 'surveillance' | 'background' // investigator
  | 'treating_physician' | 'facility' | 'records_custodian' | 'billing_contact' // medical_provider
  | 'fact' | 'expert' // witness
  | 'judge' | 'clerk' | 'staff_attorney' // court_personnel
  | 'mediator' | 'arbitrator' | 'special_master' // mediator_arbitrator
  | 'records_retrieval' | 'process_server' | 'court_reporter' | 'translator' // vendor
  | 'other' // other (custom role)
  | string; // for custom roles

type PreferredContact = 'email' | 'phone' | 'mail' | 'text';

interface Contact {
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

interface ContactInput {
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

interface CaseContact {
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

interface CaseContactInput {
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

interface ContactFilters {
  name?: string;
  organization?: string;
  contact_type?: ContactType;
  preferred_contact?: PreferredContact;
}

// Phase 1C Disposition Interfaces
type DispositionType = 'settlement' | 'verdict' | 'dismissal_with_prejudice' | 'dismissal_without_prejudice' | 'other';

interface Disposition {
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
  
  // Refiling
  potential_refiling: boolean;
  refiling_deadline?: string;
  refiling_days_notice: number;
  refiling_reminder_set: boolean;
  disposition_notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DispositionInput {
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

export class DatabaseService {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize sql.js
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');

    // Initialize schema
    await this.initializeSchema();
  }

  private async initializeSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if this is a new database (no tables exist)
    const tablesResult = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const isNewDatabase = tablesResult.length === 0 || tablesResult[0].values.length === 0;

    if (isNewDatabase) {
      // New database - execute full schema
      this.db.exec(SCHEMA_SQL);
    } else {
      // Existing database - run migrations only
      console.log('Existing database detected, running migrations...');
    }

    // Migration: Add is_deleted column if it doesn't exist (for existing databases)
    try {
      // Check if column exists by trying to query it
      const testQuery = this.db.exec("SELECT is_deleted FROM cases LIMIT 1");
      // If we get here, column exists - no migration needed
    } catch (error: any) {
      // Column doesn't exist, add it
      try {
        this.db.exec('ALTER TABLE cases ADD COLUMN is_deleted INTEGER DEFAULT 0');
        console.log('Migration: Added is_deleted column to cases table');
      } catch (migrationError: any) {
        console.error('Migration error:', migrationError.message);
      }
    }

    // Migration: Add Phase 1D enhanced party columns if they don't exist
    const phase1dColumns = [
      { name: 'date_of_birth', type: 'DATE' },
      { name: 'ssn_last_four', type: 'TEXT' },
      { name: 'drivers_license', type: 'TEXT' },
      { name: 'contact_id', type: 'INTEGER REFERENCES global_contacts(id)' }
    ];

    for (const column of phase1dColumns) {
      try {
        // Check if column exists
        this.db.exec(`SELECT ${column.name} FROM case_parties LIMIT 1`);
        // Column exists, no migration needed
      } catch (error: any) {
        // Column doesn't exist, add it
        try {
          this.db.exec(`ALTER TABLE case_parties ADD COLUMN ${column.name} ${column.type}`);
          console.log(`Migration: Added ${column.name} column to case_parties table`);
        } catch (migrationError: any) {
          console.error(`Migration error for ${column.name}:`, migrationError.message);
        }
      }
    }

    // Ensure contact tables are upgraded for extended contact types/metadata
    this.ensureContactSchemaUpgrades();

    // Migration: Populate case_parties from legacy primary party fields
    this.migratePrimaryPartiesToCaseParties();

    // Migration: Create Module B tables if they don't exist
    this.ensureModuleBTablesExist();

    // Save to disk
    this.save();
  }

  private migratePrimaryPartiesToCaseParties(): void {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      // Check if we've already migrated (check if any primary parties exist)
      const checkResult = this.db.exec(
        'SELECT COUNT(*) as count FROM case_parties WHERE is_primary = 1'
      );
      const primaryCount = checkResult.length > 0 ? checkResult[0].values[0][0] : 0;
      
      // Only migrate if no primary parties exist yet
      if (primaryCount === 0) {
        console.log('🌻 Migration: Populating case_parties from legacy primary party fields...');
        
        // Migrate primary plaintiffs
        this.db.exec(`
          INSERT INTO case_parties (case_id, party_type, party_name, is_primary, is_corporate)
          SELECT id, 'plaintiff', primary_plaintiff_name, 1, 0
          FROM cases
          WHERE primary_plaintiff_name IS NOT NULL 
            AND primary_plaintiff_name != ''
            AND NOT EXISTS (
              SELECT 1 FROM case_parties 
              WHERE case_id = cases.id 
              AND party_type = 'plaintiff' 
              AND is_primary = 1
            )
        `);
        
        // Migrate primary defendants
        this.db.exec(`
          INSERT INTO case_parties (case_id, party_type, party_name, is_primary, is_corporate)
          SELECT id, 'defendant', primary_defendant_name, 1, 0
          FROM cases
          WHERE primary_defendant_name IS NOT NULL 
            AND primary_defendant_name != ''
            AND NOT EXISTS (
              SELECT 1 FROM case_parties 
              WHERE case_id = cases.id 
              AND party_type = 'defendant' 
              AND is_primary = 1
            )
        `);
        
        const migratedResult = this.db.exec(
          'SELECT COUNT(*) as count FROM case_parties WHERE is_primary = 1'
        );
        const migratedCount = migratedResult.length > 0 ? migratedResult[0].values[0][0] : 0;
        
        console.log(`✅ Migration complete: ${migratedCount} primary parties migrated to case_parties table`);
      } else {
        console.log(`✅ Primary parties already migrated (${primaryCount} found)`);
      }
    } catch (error: any) {
      console.error('❌ Error migrating primary parties:', error.message);
    }
  }

  private ensureContactSchemaUpgrades(): void {
    if (!this.db) throw new Error('Database not initialized');
    this.ensureGlobalContactsFavoriteColumn();
    this.ensureCaseContactsSchema();
  }

  private ensureGlobalContactsFavoriteColumn(): void {
    if (!this.db) throw new Error('Database not initialized');
    const result = this.db.exec('PRAGMA table_info(global_contacts)');
    const columns = result.length > 0 ? result[0].values.map((row: any[]) => row[1]) : [];
    
    // Add is_favorite column if missing
    if (!columns.includes('is_favorite')) {
      this.db.exec('ALTER TABLE global_contacts ADD COLUMN is_favorite INTEGER DEFAULT 0');
    }
    
    // Add contact_type column if missing
    if (!columns.includes('contact_type')) {
      this.db.exec('ALTER TABLE global_contacts ADD COLUMN contact_type TEXT');
    }
    
    // Add role column if missing
    if (!columns.includes('role')) {
      this.db.exec('ALTER TABLE global_contacts ADD COLUMN role TEXT');
    }
  }

  private ensureCaseContactsSchema(): void {
    if (!this.db) throw new Error('Database not initialized');
    
    // Check if party_id column exists
    const tableInfo = this.db.exec('PRAGMA table_info(case_contacts)');
    const hasPartyId = tableInfo.length > 0 && 
      tableInfo[0].values.some((row: any[]) => row[1] === 'party_id');
    
    // Check if new contact types exist
    const result = this.db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='case_contacts'");
    const currentDefinition =
      result.length > 0 && result[0].values.length > 0
        ? (result[0].values[0][0] as string)
        : '';

    const hasNewContactTypes = currentDefinition && currentDefinition.includes('tpa_agent');

    if (hasPartyId && hasNewContactTypes) {
      return; // Schema already up to date
    }

    this.recreateCaseContactsTable();
  }

  private recreateCaseContactsTable(): void {
    if (!this.db) throw new Error('Database not initialized');

    try {
      this.db.exec('BEGIN TRANSACTION');
      this.db.exec('ALTER TABLE case_contacts RENAME TO case_contacts_old');

      this.db.exec(`
        CREATE TABLE case_contacts (
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
      `);

      this.db.exec(`
        INSERT INTO case_contacts (
          id, case_id, contact_id, party_id, contact_type, role, is_primary,
          relationship_start_date, relationship_end_date, notes, created_at, updated_at
        )
        SELECT
          id, case_id, contact_id, NULL as party_id, contact_type, role, is_primary,
          relationship_start_date, relationship_end_date, notes, created_at, updated_at
        FROM case_contacts_old;
      `);

      this.db.exec('DROP TABLE case_contacts_old');

      this.db.exec('CREATE INDEX IF NOT EXISTS idx_case_contacts_case_id ON case_contacts(case_id)');
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_case_contacts_contact_id ON case_contacts(contact_id)');
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_case_contacts_party_id ON case_contacts(party_id)');
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_case_contacts_type ON case_contacts(contact_type)');
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_case_contacts_role ON case_contacts(role)');
      this.db.exec('CREATE INDEX IF NOT EXISTS idx_case_contacts_primary ON case_contacts(is_primary)');

      this.db.exec('COMMIT');
    } catch (error: any) {
      this.db.exec('ROLLBACK');
      console.error('Migration error for case_contacts schema:', error.message || error);
    }
  }

  private save(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  // ============================================================================
  // CASES METHODS
  // ============================================================================

  async createCase(caseData: CaseInput): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO cases (
        case_name, cm_number, lead_attorney,
        primary_plaintiff_name, primary_defendant_name,
        venue_court, venue_judge, venue_clerk, venue_staff_attorney,
        phase, status, case_type, case_subtype,
        date_opened, date_of_loss, date_closed,
        is_wrongful_death, is_survival_action, has_deceased_defendants,
        discovery_close_date, discovery_deadline_extended, discovery_deadline_notes,
        notes
      ) VALUES (
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?
      )
    `;

    this.db.run(query, [
      caseData.case_name,
      caseData.cm_number,
      caseData.lead_attorney,
      caseData.primary_plaintiff_name,
      caseData.primary_defendant_name,
      caseData.venue_court,
      caseData.venue_judge || null,
      caseData.venue_clerk || null,
      caseData.venue_staff_attorney || null,
      caseData.phase,
      caseData.status,
      caseData.case_type,
      caseData.case_subtype || null,
      caseData.date_opened,
      caseData.date_of_loss,
      caseData.date_closed || null,
      caseData.is_wrongful_death ? 1 : 0,
      caseData.is_survival_action ? 1 : 0,
      caseData.has_deceased_defendants ? 1 : 0,
      caseData.discovery_close_date || null,
      caseData.discovery_deadline_extended ? 1 : 0,
      caseData.discovery_deadline_notes || null,
      caseData.notes || null
    ]);

    // Get last insert ID
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    // Automatically add primary parties to case_parties table
    // Add primary plaintiff
    this.db.run(`
      INSERT INTO case_parties (
        case_id, party_type, party_name, is_corporate, is_primary,
        is_insured, is_presuit, monitor_for_service,
        service_date, answer_filed_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      'plaintiff',
      caseData.primary_plaintiff_name,
      0, // is_corporate (default false)
      1, // is_primary (TRUE)
      0, // is_insured
      0, // is_presuit
      0, // monitor_for_service
      null, // service_date
      null, // answer_filed_date
      null  // notes
    ]);

    // Add primary defendant
    this.db.run(`
      INSERT INTO case_parties (
        case_id, party_type, party_name, is_corporate, is_primary,
        is_insured, is_presuit, monitor_for_service,
        service_date, answer_filed_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      'defendant',
      caseData.primary_defendant_name,
      0, // is_corporate (default false)
      1, // is_primary (TRUE)
      0, // is_insured
      0, // is_presuit
      0, // monitor_for_service
      null, // service_date
      null, // answer_filed_date
      null  // notes
    ]);

    this.save();
    return id;
  }

  async getCases(filters?: CaseFilters): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM cases WHERE is_deleted = 0';
    const params: any[] = [];

    if (filters) {
      if (filters.lead_attorney) {
        query += ' AND lead_attorney = ?';
        params.push(filters.lead_attorney);
      }
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.phase) {
        query += ' AND phase = ?';
        params.push(filters.phase);
      }
      if (filters.date_opened_start) {
        query += ' AND date_opened >= ?';
        params.push(filters.date_opened_start);
      }
      if (filters.date_opened_end) {
        query += ' AND date_opened <= ?';
        params.push(filters.date_opened_end);
      }
    }

    query += ' ORDER BY date_opened DESC';

    const result = this.db.exec(query, params);
    if (result.length === 0) return [];

    // Convert to array of objects
    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });

      // Convert boolean fields from integers to proper booleans
      const booleanFields = ['is_wrongful_death', 'is_survival_action', 'has_deceased_defendants', 
                            'discovery_deadline_extended', 'is_deleted'];
      booleanFields.forEach(field => {
        if (obj[field] !== undefined) {
          obj[field] = Boolean(obj[field]);
        }
      });

      return obj;
    });
  }

  async getCaseById(id: number): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT * FROM cases WHERE id = ? AND is_deleted = 0', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const columns = result[0].columns;
    const values = result[0].values[0];
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      obj[col] = values[i];
    });

    // Convert boolean fields from integers to proper booleans
    const booleanFields = ['is_wrongful_death', 'is_survival_action', 'has_deceased_defendants', 
                          'discovery_deadline_extended', 'is_deleted'];
    booleanFields.forEach(field => {
      if (obj[field] !== undefined) {
        obj[field] = Boolean(obj[field]);
      }
    });

    return obj;
  }

  async deleteCase(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    // Soft delete: set is_deleted = 1, phase = 'Closed', date_closed = today
    const today = new Date().toISOString().split('T')[0];
    const query = `UPDATE cases SET is_deleted = 1, phase = 'Closed', date_closed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    this.db.run(query, [today, id]);
    this.save();
    return true;
  }

  async updateCase(id: number, updates: Partial<CaseInput>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    // Build dynamic UPDATE query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        // Convert boolean to integer for SQLite
        if (typeof value === 'boolean') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return false;

    // Add updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');

    const query = `UPDATE cases SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    this.db.run(query, values);
    this.save();
    return true;
  }

  async searchCases(query: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    // Search in cases table (case_name, cm_number) AND case_parties table (party_name)
    const searchTerm = `%${query}%`;

    const sql = `
      SELECT DISTINCT c.*
      FROM cases c
      LEFT JOIN case_parties cp ON c.id = cp.case_id
      WHERE c.is_deleted = 0
         AND (c.case_name LIKE ?
         OR c.cm_number LIKE ?
         OR cp.party_name LIKE ?)
      ORDER BY c.date_opened DESC
    `;

    const result = this.db.exec(sql, [searchTerm, searchTerm, searchTerm]);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  // ============================================================================
  // PARTIES METHODS
  // ============================================================================

  async addCaseParty(caseId: number, partyData: PartyInput): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO case_parties (
        case_id, party_type, party_name, is_corporate, is_primary,
        is_insured, is_presuit, monitor_for_service,
        service_date, answer_filed_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(query, [
      caseId,
      partyData.party_type,
      partyData.party_name,
      partyData.is_corporate ? 1 : 0,
      partyData.is_primary ? 1 : 0,
      partyData.is_insured ? 1 : 0,
      partyData.is_presuit ? 1 : 0,
      partyData.monitor_for_service ? 1 : 0,
      partyData.service_date || null,
      partyData.answer_filed_date || null,
      partyData.notes || null
    ]);

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    this.save();
    return id;
  }

  async getCaseParties(caseId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM case_parties WHERE case_id = ? ORDER BY is_primary DESC, party_type, party_name',
      [caseId]
    );
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });

      // Convert boolean fields from integers to proper booleans
      const booleanFields = ['is_corporate', 'is_primary', 'is_insured', 'is_presuit', 'monitor_for_service'];
      booleanFields.forEach(field => {
        if (obj[field] !== undefined) {
          obj[field] = Boolean(obj[field]);
        }
      });

      return obj;
    });
  }

  async updateParty(id: number, updates: Partial<PartyInput>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'case_id') {
        fields.push(`${key} = ?`);
        if (typeof value === 'boolean') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return false;

    const query = `UPDATE case_parties SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    this.db.run(query, values);
    this.save();
    return true;
  }

  async deleteParty(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM case_parties WHERE id = ?', [id]);
    this.save();
    return true;
  }

  // ============================================================================
  // POLICIES METHODS
  // ============================================================================

  async addCasePolicy(caseId: number, policyData: PolicyInput): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO case_policies (
        case_id, policy_type, carrier_name, policy_number,
        policy_limits, we_are_retained_by_carrier, umuim_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(query, [
      caseId,
      policyData.policy_type,
      policyData.carrier_name,
      policyData.policy_number,
      policyData.policy_limits || null,
      policyData.we_are_retained_by_carrier ? 1 : 0,
      policyData.umuim_type || null,
      policyData.notes || null
    ]);

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    this.save();
    return id;
  }

  async getCasePolicies(caseId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM case_policies WHERE case_id = ? ORDER BY policy_type',
      [caseId]
    );
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });

      // Convert boolean fields from integers to proper booleans
      const booleanFields = ['we_are_retained_by_carrier'];
      booleanFields.forEach(field => {
        if (obj[field] !== undefined) {
          obj[field] = Boolean(obj[field]);
        }
      });

      return obj;
    });
  }

  async updatePolicy(id: number, updates: Partial<PolicyInput>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'case_id') {
        fields.push(`${key} = ?`);
        if (typeof value === 'boolean') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return false;

    const query = `UPDATE case_policies SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    this.db.run(query, values);
    this.save();
    return true;
  }

  async deletePolicy(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM case_policies WHERE id = ?', [id]);
    this.save();
    return true;
  }

  // ============================================================================
  // CONTACT MANAGEMENT METHODS (PHASE 1B)
  // ============================================================================

  // Global Contacts
  async createContact(contactData: ContactInput): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO global_contacts (
        name, organization, title, phone_primary, phone_secondary,
        email_primary, email_secondary, address, preferred_contact,
        best_times, do_not_contact, is_favorite, notes, contact_type, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(query, [
      contactData.name,
      contactData.organization || null,
      contactData.title || null,
      contactData.phone_primary || null,
      contactData.phone_secondary || null,
      contactData.email_primary || null,
      contactData.email_secondary || null,
      contactData.address || null,
      contactData.preferred_contact || null,
      contactData.best_times || null,
      contactData.do_not_contact ? 1 : 0,
      contactData.is_favorite ? 1 : 0,
      contactData.notes || null,
      contactData.contact_type || null,
      contactData.role || null
    ]);

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    this.save();
    return id;
  }

  async getContacts(filters?: ContactFilters): Promise<Contact[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM global_contacts WHERE 1=1';
    const params: any[] = [];

    if (filters?.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters?.organization) {
      query += ' AND organization LIKE ?';
      params.push(`%${filters.organization}%`);
    }

    if (filters?.preferred_contact) {
      query += ' AND preferred_contact = ?';
      params.push(filters.preferred_contact);
    }

    query += ' ORDER BY name';

    const result = this.db.exec(query, params);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
        // Convert boolean fields
        if (col === 'do_not_contact' || col === 'is_favorite') {
          obj[col] = row[i] === 1;
        }
      });
      return obj as Contact;
    });
  }

  async updateContact(id: number, updates: Partial<ContactInput>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      if (key === 'do_not_contact' || key === 'is_favorite') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value === undefined ? null : value);
      }
    });

    if (fields.length === 0) return false;

    // Add updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE global_contacts SET ${fields.join(', ')} WHERE id = ?`;
    this.db.run(query, values);

    this.save();
    return true;
  }

  async deleteContact(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if contact is linked to any cases
    const linkCheck = this.db.exec('SELECT COUNT(*) as count FROM case_contacts WHERE contact_id = ?', [id]);
    const linkCount = linkCheck[0].values[0][0] as number;

    if (linkCount > 0) {
      throw new Error('Cannot delete contact: still linked to cases');
    }

    this.db.run('DELETE FROM global_contacts WHERE id = ?', [id]);
    this.save();
    return true;
  }

  async searchContacts(query: string): Promise<Contact[]> {
    if (!this.db) throw new Error('Database not initialized');

    const searchTerm = `%${query}%`;
    const sql = `
      SELECT * FROM global_contacts
      WHERE name LIKE ? OR organization LIKE ? OR email_primary LIKE ?
      ORDER BY name
    `;

    const result = this.db.exec(sql, [searchTerm, searchTerm, searchTerm]);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
        if (col === 'do_not_contact') {
          obj[col] = row[i] === 1;
        }
      });
      return obj as Contact;
    });
  }

  // Case-Contact Relationships
  async addContactToCase(caseContactData: CaseContactInput): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO case_contacts (
        case_id, contact_id, party_id, contact_type, role, is_primary,
        relationship_start_date, relationship_end_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(query, [
      caseContactData.case_id,
      caseContactData.contact_id,
      caseContactData.party_id || null,
      caseContactData.contact_type,
      caseContactData.role,
      caseContactData.is_primary ? 1 : 0,
      caseContactData.relationship_start_date || null,
      caseContactData.relationship_end_date || null,
      caseContactData.notes || null
    ]);

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    this.save();
    return id;
  }

  async getCaseContacts(caseId: number): Promise<CaseContact[]> {
    if (!this.db) throw new Error('Database not initialized');

    // Check if party_id column exists to build appropriate query
    const tableInfo = this.db.exec('PRAGMA table_info(case_contacts)');
    const hasPartyId = tableInfo.length > 0 && 
      tableInfo[0].values.some((row: any[]) => row[1] === 'party_id');

    const query = `
      SELECT 
        cc.id, cc.case_id, cc.contact_id, 
        ${hasPartyId ? 'cc.party_id,' : 'NULL as party_id,'}
        cc.contact_type, cc.role, cc.is_primary,
        cc.relationship_start_date, cc.relationship_end_date, cc.notes,
        cc.created_at, cc.updated_at,
        gc.name, gc.organization, gc.title,
        gc.phone_primary, gc.phone_secondary,
        gc.email_primary, gc.email_secondary,
        gc.address, gc.preferred_contact, gc.best_times,
        gc.do_not_contact, gc.is_favorite, gc.contact_type as global_contact_type, 
        gc.role as global_role, gc.notes as contact_notes
      FROM case_contacts cc
      JOIN global_contacts gc ON cc.contact_id = gc.id
      WHERE cc.case_id = ?
      ORDER BY cc.contact_type, cc.role, gc.name
    `;

    const result = this.db.exec(query, [caseId]);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
        // Convert boolean fields
        if (col === 'is_primary' || col === 'do_not_contact' || col === 'is_favorite') {
          obj[col] = row[i] === 1;
        }
      });

      // Structure the joined contact data
      const caseContact: CaseContact = {
        id: obj.id,
        case_id: obj.case_id,
        contact_id: obj.contact_id,
        party_id: obj.party_id,
        contact_type: obj.contact_type,
        role: obj.role,
        is_primary: obj.is_primary,
        relationship_start_date: obj.relationship_start_date,
        relationship_end_date: obj.relationship_end_date,
        notes: obj.notes,
        created_at: obj.created_at,
        updated_at: obj.updated_at,
        contact: {
          id: obj.contact_id,
          name: obj.name,
          organization: obj.organization,
          title: obj.title,
          phone_primary: obj.phone_primary,
          phone_secondary: obj.phone_secondary,
          email_primary: obj.email_primary,
          email_secondary: obj.email_secondary,
          address: obj.address,
          preferred_contact: obj.preferred_contact,
          best_times: obj.best_times,
          do_not_contact: obj.do_not_contact,
          is_favorite: obj.is_favorite,
          contact_type: obj.global_contact_type,
          role: obj.global_role,
          notes: obj.contact_notes,
          created_at: obj.created_at,
          updated_at: obj.updated_at
        }
      };

      return caseContact;
    });
  }

  async updateCaseContact(id: number, updates: Partial<CaseContactInput>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      if (key === 'is_primary') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value === undefined ? null : value);
      }
    });

    if (fields.length === 0) return false;

    // Add updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE case_contacts SET ${fields.join(', ')} WHERE id = ?`;
    this.db.run(query, values);

    this.save();
    return true;
  }

  async removeCaseContactRelationship(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM case_contacts WHERE id = ?', [id]);
    this.save();
    return true;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async generateCaseDisplayName(caseId: number): Promise<string> {
    const caseData = await this.getCaseById(caseId);
    if (!caseData) return '';

    const parties = await this.getCaseParties(caseId);
    const defendants = parties.filter((p: any) => p.party_type === 'defendant');

    // Get primary plaintiff's last name
    const plaintiffLastName = caseData.primary_plaintiff_name.split(' ').pop() || caseData.primary_plaintiff_name;

    // Check if multiple defendants
    if (defendants.length > 1) {
      const primaryDefendantLastName = caseData.primary_defendant_name.split(' ').pop() || caseData.primary_defendant_name;
      return `${plaintiffLastName} v. ${primaryDefendantLastName}, et al.`;
    } else {
      return `${plaintiffLastName} v. ${caseData.primary_defendant_name}`;
    }
  }

  // ============================================================================
  // MODULE A PHASE 1C: DISPOSITION METHODS
  // ============================================================================

  async createDisposition(dispositionData: DispositionInput): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      INSERT INTO case_dispositions (
        case_id, disposition_type, disposition_date, settlement_amount,
        other_disposition_type, settlement_agreement_date, release_drafted,
        release_executed, dismissal_filed, dismissal_date, settlement_agreement_path,
        release_document_path, dismissal_document_path, potential_refiling,
        refiling_deadline, refiling_days_notice, refiling_reminder_set,
        disposition_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(query, [
      dispositionData.case_id,
      dispositionData.disposition_type,
      dispositionData.disposition_date,
      dispositionData.settlement_amount || null,
      dispositionData.other_disposition_type || null,
      dispositionData.settlement_agreement_date || null,
      dispositionData.release_drafted ? 1 : 0,
      dispositionData.release_executed ? 1 : 0,
      dispositionData.dismissal_filed ? 1 : 0,
      dispositionData.dismissal_date || null,
      dispositionData.settlement_agreement_path || null,
      dispositionData.release_document_path || null,
      dispositionData.dismissal_document_path || null,
      dispositionData.potential_refiling ? 1 : 0,
      dispositionData.refiling_deadline || null,
      dispositionData.refiling_days_notice || 90,
      dispositionData.refiling_reminder_set ? 1 : 0,
      dispositionData.disposition_notes || null,
      dispositionData.created_by || 'system'
    ]);

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const dispositionId = result[0].values[0][0] as number;

    // Update the case status to closed and set date_closed
    await this.updateCase(dispositionData.case_id, {
      phase: 'Closed',
      date_closed: dispositionData.disposition_date
    });

    this.save();
    return dispositionId;
  }

  async getDisposition(caseId: number): Promise<Disposition | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      SELECT * FROM case_dispositions 
      WHERE case_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = this.db.exec(query, [caseId]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const obj: any = {};
    
    columns.forEach((col: string, i: number) => {
      obj[col] = values[i];
      // Convert integer flags to booleans
      if (col === 'potential_refiling' || col === 'refiling_reminder_set' || 
          col === 'release_drafted' || col === 'release_executed' || col === 'dismissal_filed') {
        obj[col] = values[i] === 1;
      }
    });

    return obj as Disposition;
  }

  async updateDisposition(id: number, updates: Partial<DispositionInput>): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = ?`);
        // Handle boolean fields
        if (key === 'potential_refiling' || key === 'refiling_reminder_set' ||
            key === 'release_drafted' || key === 'release_executed' || key === 'dismissal_filed') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });
    
    if (setClause.length === 0) return false;
    
    // Always update the updated_at timestamp
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const query = `UPDATE case_dispositions SET ${setClause.join(', ')} WHERE id = ?`;
    this.db.run(query, values);
    this.save();
    
    return true;
  }

  async deleteDisposition(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Get the disposition first to get the case_id
    const disposition = await this.getDispositionById(id);
    if (!disposition) return false;
    
    // Delete the disposition
    this.db.run('DELETE FROM case_dispositions WHERE id = ?', [id]);
    
    // Reopen the case (remove closed status)
    await this.updateCase(disposition.case_id, {
      phase: 'Open',
      date_closed: undefined
    });
    
    this.save();
    return true;
  }

  async getDispositionById(id: number): Promise<Disposition | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = 'SELECT * FROM case_dispositions WHERE id = ?';
    const result = this.db.exec(query, [id]);
    
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const obj: any = {};
    
    columns.forEach((col: string, i: number) => {
      obj[col] = values[i];
      if (col === 'potential_refiling' || col === 'refiling_reminder_set' ||
          col === 'release_drafted' || col === 'release_executed' || col === 'dismissal_filed') {
        obj[col] = values[i] === 1;
      }
    });

    return obj as Disposition;
  }

  async getCaseDispositions(caseId: number): Promise<Disposition[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const query = `
      SELECT * FROM case_dispositions 
      WHERE case_id = ? 
      ORDER BY created_at DESC
    `;
    
    const result = this.db.exec(query, [caseId]);
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
        if (col === 'potential_refiling' || col === 'refiling_reminder_set' ||
            col === 'release_drafted' || col === 'release_executed' || col === 'dismissal_filed') {
          obj[col] = row[i] === 1;
        }
      });
      return obj as Disposition;
    });
  }

  // ============================================================================
  // MODULE A PHASE 1D: DOCUMENT MANAGEMENT METHODS
  // ============================================================================

  async createDocument(documentData: any): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO case_documents (
        case_id, document_name, file_path, file_type, file_size, document_date,
        document_type, source_type, source_party_id, source_party_name,
        source_notes, production_date, bates_range, description, notes, tags, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    this.db.run(query, [
      documentData.case_id,
      documentData.document_name,
      documentData.file_path,
      documentData.file_type || null,
      documentData.file_size || null,
      documentData.document_date || null,
      documentData.document_type || 'other',
      documentData.source_type,
      documentData.source_party_id || null,
      documentData.source_party_name || null,
      documentData.source_notes || null,
      documentData.production_date || null,
      documentData.bates_range || null,
      documentData.description || null,
      documentData.notes || null,
      documentData.tags || null,
      documentData.uploaded_by || 'system'
    ]);

    const result = this.db.exec('SELECT last_insert_rowid() as id');
    const documentId = result[0].values[0][0] as number;

    this.save();
    return documentId;
  }

  async getDocumentById(id: number): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT * FROM case_documents WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const columns = result[0].columns;
    const values = result[0].values[0];
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      obj[col] = values[i];
    });

    return obj;
  }

  async getDocumentsForCase(caseId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(
      'SELECT * FROM case_documents WHERE case_id = ? ORDER BY upload_date DESC',
      [caseId]
    );
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  async updateDocument(id: number, updates: any): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    const query = `UPDATE case_documents SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    this.db.run(query, values);
    this.save();
    return true;
  }

  async deleteDocument(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete document and all its relationships (CASCADE will handle linking tables)
    this.db.run('DELETE FROM case_documents WHERE id = ?', [id]);
    this.save();
    return true;
  }

  // ============================================================================
  // PARTY-DOCUMENT LINKING METHODS
  // ============================================================================

  async linkDocumentToParty(partyId: number, documentId: number, relevanceNotes?: string, isPrimarySubject = true): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      this.db.run(
        'INSERT INTO party_documents (party_id, document_id, relevance_notes, is_primary_subject) VALUES (?, ?, ?, ?)',
        [partyId, documentId, relevanceNotes || null, isPrimarySubject ? 1 : 0]
      );
      this.save();
      return true;
    } catch (error) {
      // Handle unique constraint violation (already linked)
      return false;
    }
  }

  async unlinkDocumentFromParty(partyId: number, documentId: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM party_documents WHERE party_id = ? AND document_id = ?', [partyId, documentId]);
    this.save();
    return true;
  }

  async getDocumentsForParty(partyId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(`
      SELECT cd.*, pd.relevance_notes, pd.is_primary_subject
      FROM case_documents cd
      JOIN party_documents pd ON cd.id = pd.document_id
      WHERE pd.party_id = ?
      ORDER BY cd.upload_date DESC
    `, [partyId]);

    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
        // Convert boolean fields
        if (col === 'is_primary_subject') {
          obj[col] = row[i] === 1;
        }
      });
      return obj;
    });
  }

  async getPartiesForDocument(documentId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(`
      SELECT cp.*, pd.relevance_notes, pd.is_primary_subject
      FROM case_parties cp
      JOIN party_documents pd ON cp.id = pd.party_id
      WHERE pd.document_id = ?
    `, [documentId]);

    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
        // Convert boolean fields
        if (['is_corporate', 'is_primary', 'is_insured', 'is_presuit', 'monitor_for_service', 'is_primary_subject'].includes(col)) {
          obj[col] = row[i] === 1;
        }
      });
      return obj;
    });
  }

  // ============================================================================
  // POLICY-DOCUMENT LINKING METHODS
  // ============================================================================

  async linkDocumentToPolicy(policyId: number, documentId: number, policyDocType = 'other'): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      this.db.run(
        'INSERT INTO policy_documents (policy_id, document_id, policy_doc_type) VALUES (?, ?, ?)',
        [policyId, documentId, policyDocType]
      );
      this.save();
      return true;
    } catch (error) {
      // Handle unique constraint violation (already linked)
      return false;
    }
  }

  async unlinkDocumentFromPolicy(policyId: number, documentId: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM policy_documents WHERE policy_id = ? AND document_id = ?', [policyId, documentId]);
    this.save();
    return true;
  }

  async getDocumentsForPolicy(policyId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(`
      SELECT cd.*, pd.policy_doc_type
      FROM case_documents cd
      JOIN policy_documents pd ON cd.id = pd.document_id
      WHERE pd.policy_id = ?
      ORDER BY cd.upload_date DESC
    `, [policyId]);

    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  // ============================================================================
  // ENHANCED PARTY METHODS (FOR NEW FIELDS)
  // ============================================================================

  async updatePartyExtended(id: number, updates: any): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'case_id') {
        fields.push(`${key} = ?`);
        if (typeof value === 'boolean') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return false;

    const query = `UPDATE case_parties SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    this.db.run(query, values);
    this.save();
    return true;
  }

  async getPartyWithDocuments(partyId: number): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    // Get party details
    const partyResult = this.db.exec('SELECT * FROM case_parties WHERE id = ?', [partyId]);
    if (partyResult.length === 0 || partyResult[0].values.length === 0) return null;

    const columns = partyResult[0].columns;
    const values = partyResult[0].values[0];
    const party: any = {};
    columns.forEach((col: string, i: number) => {
      party[col] = values[i];
    });

    // Convert boolean fields
    const booleanFields = ['is_corporate', 'is_primary', 'is_insured', 'is_presuit', 'monitor_for_service'];
    booleanFields.forEach(field => {
      if (party[field] !== undefined) {
        party[field] = Boolean(party[field]);
      }
    });

    // Get associated documents
    party.documents = await this.getDocumentsForParty(partyId);

    return party;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async getDocumentStats(caseId: number): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN document_type LIKE '%investigation%' OR document_type IN ('ISO_report', 'MVAR', 'citation', 'background_check') THEN 1 END) as investigation_docs,
        COUNT(CASE WHEN source_type = 'document_production' THEN 1 END) as production_docs,
        COUNT(CASE WHEN document_type = 'policy_document' THEN 1 END) as policy_docs
      FROM case_documents 
      WHERE case_id = ?
    `, [caseId]);

    if (result.length === 0 || result[0].values.length === 0) {
      return { total_documents: 0, investigation_docs: 0, production_docs: 0, policy_docs: 0 };
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const stats: any = {};
    columns.forEach((col: string, i: number) => {
      stats[col] = values[i];
    });

    return stats;
  }

  // ============================================================================
  // MODULE B: MIGRATION METHODS
  // ============================================================================

  private ensureModuleBTablesExist(): void {
    if (!this.db) throw new Error('Database not initialized');

    console.log('🌻 Checking Module B tables...');

    // Check if tasks table exists
    try {
      this.db.exec('SELECT 1 FROM tasks LIMIT 1');
      console.log('✅ Module B tables already exist');
      return;
    } catch (error) {
      // Tables don't exist, create them
      console.log('📋 Creating Module B tables...');
    }

    try {
      // Create Module B schema
      const moduleBSchema = `
        -- MODULE B: TASK & WORKFLOW MANAGER
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          case_id INTEGER NOT NULL,
          task_group_id TEXT,
          title TEXT NOT NULL,
          description TEXT,
          priority INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3, 4)),
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')),
          phase TEXT,
          assigned_to TEXT,
          due_date DATE,
          completed_date DATE,
          is_billable INTEGER DEFAULT 1,
          estimated_hours REAL,
          actual_hours REAL,
          is_locked INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
          FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
        CREATE INDEX IF NOT EXISTS idx_tasks_task_group_id ON tasks(task_group_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase);

        CREATE TABLE IF NOT EXISTS task_groups (
          id TEXT PRIMARY KEY,
          case_id INTEGER NOT NULL,
          cadence_type TEXT NOT NULL,
          name TEXT NOT NULL,
          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
          triggered_by TEXT,
          triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_task_groups_case_id ON task_groups(case_id);
        CREATE INDEX IF NOT EXISTS idx_task_groups_status ON task_groups(status);
        CREATE INDEX IF NOT EXISTS idx_task_groups_cadence_type ON task_groups(cadence_type);

        CREATE TABLE IF NOT EXISTS time_entries (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          user_id TEXT,
          description TEXT NOT NULL,
          start_time TIMESTAMP NOT NULL,
          stop_time TIMESTAMP NOT NULL,
          duration_minutes INTEGER NOT NULL,
          entry_date DATE NOT NULL,
          rate REAL,
          is_billable INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
        CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON time_entries(entry_date);
        CREATE INDEX IF NOT EXISTS idx_time_entries_is_billable ON time_entries(is_billable);

        CREATE TABLE IF NOT EXISTS calendar_events (
          id TEXT PRIMARY KEY,
          task_id TEXT,
          case_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          event_date DATE NOT NULL,
          all_day INTEGER DEFAULT 1,
          start_time TIME,
          end_time TIME,
          location TEXT,
          reminders TEXT,
          calendar_type TEXT CHECK(calendar_type IN ('outlook', 'ics', 'both')),
          outlook_event_id TEXT,
          ics_file_path TEXT,
          event_type TEXT DEFAULT 'manual' CHECK(event_type IN ('auto', 'manual')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
        CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);
        CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
        CREATE INDEX IF NOT EXISTS idx_calendar_events_calendar_type ON calendar_events(calendar_type);

        CREATE TABLE IF NOT EXISTS automation_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          automation_code TEXT NOT NULL UNIQUE,
          is_enabled INTEGER DEFAULT 1,
          user_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_automation_settings_code ON automation_settings(automation_code);
        CREATE INDEX IF NOT EXISTS idx_automation_settings_enabled ON automation_settings(is_enabled);
      `;

      this.db.exec(moduleBSchema);
      console.log('✅ Module B tables created successfully');

    } catch (error: any) {
      console.error('❌ Error creating Module B tables:', error.message);
      throw error;
    }
  }

  // ============================================================================
  // MODULE B: TASK & WORKFLOW MANAGER METHODS
  // ============================================================================

  // Task Methods
  async getTasks(caseId?: number, filters?: any): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (caseId) {
      query += ' AND case_id = ?';
      params.push(caseId);
    }

    if (filters?.status && filters.status.length > 0) {
      const placeholders = filters.status.map(() => '?').join(',');
      query += ` AND status IN (${placeholders})`;
      params.push(...filters.status);
    }

    if (filters?.priority && filters.priority.length > 0) {
      const placeholders = filters.priority.map(() => '?').join(',');
      query += ` AND priority IN (${placeholders})`;
      params.push(...filters.priority);
    }

    if (filters?.phase) {
      query += ' AND phase = ?';
      params.push(filters.phase);
    }

    if (filters?.assigned_to) {
      query += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }

    if (filters?.overdue_only) {
      query += ` AND status != 'completed' AND due_date < DATE('now')`;
    }

    if (filters?.billable_only) {
      query += ' AND is_billable = 1';
    }

    query += ' ORDER BY due_date ASC, priority DESC';

    const result = this.db.exec(query, params);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  async getTaskById(id: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec('SELECT * FROM tasks WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const columns = result[0].columns;
    const values = result[0].values[0];
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      obj[col] = values[i];
    });
    return obj;
  }

  async createTask(taskData: any): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    this.db.run(`
      INSERT INTO tasks (
        id, case_id, task_group_id, title, description, priority, status,
        phase, assigned_to, due_date, is_billable, estimated_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      taskData.case_id,
      taskData.task_group_id || null,
      taskData.title,
      taskData.description || null,
      taskData.priority || 2,
      taskData.status || 'pending',
      taskData.phase || null,
      taskData.assigned_to || null,
      taskData.due_date || null,
      taskData.is_billable !== undefined ? taskData.is_billable : 1,
      taskData.estimated_hours || null
    ]);

    this.save();
    return id;
  }

  async updateTask(id: string, updates: any): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
    if (updates.phase !== undefined) { fields.push('phase = ?'); values.push(updates.phase); }
    if (updates.assigned_to !== undefined) { fields.push('assigned_to = ?'); values.push(updates.assigned_to); }
    if (updates.due_date !== undefined) { fields.push('due_date = ?'); values.push(updates.due_date); }
    if (updates.completed_date !== undefined) { fields.push('completed_date = ?'); values.push(updates.completed_date); }
    if (updates.is_billable !== undefined) { fields.push('is_billable = ?'); values.push(updates.is_billable); }
    if (updates.estimated_hours !== undefined) { fields.push('estimated_hours = ?'); values.push(updates.estimated_hours); }
    if (updates.actual_hours !== undefined) { fields.push('actual_hours = ?'); values.push(updates.actual_hours); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    this.db.run(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    this.save();
    return true;
  }

  async completeTask(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run(`
      UPDATE tasks 
      SET status = 'completed', 
          completed_date = DATE('now'),
          is_locked = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    this.save();
    return true;
  }

  async deleteTask(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.run('DELETE FROM tasks WHERE id = ?', [id]);
    this.save();
    return true;
  }

  // Time Entry Methods
  async createTimeEntry(entryData: any): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `time-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    this.db.run(`
      INSERT INTO time_entries (
        id, task_id, user_id, description, start_time, stop_time,
        duration_minutes, entry_date, rate, is_billable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      entryData.task_id,
      entryData.user_id || null,
      entryData.description,
      entryData.start_time,
      entryData.stop_time,
      entryData.duration_minutes,
      entryData.entry_date,
      entryData.rate || null,
      entryData.is_billable !== undefined ? entryData.is_billable : 1
    ]);

    // Update actual_hours on task
    const result = this.db.exec(`
      SELECT SUM(duration_minutes) as total 
      FROM time_entries 
      WHERE task_id = ?
    `, [entryData.task_id]);

    if (result.length > 0 && result[0].values.length > 0) {
      const totalMinutes = Number(result[0].values[0][0]) || 0;
      const totalHours = totalMinutes / 60;
      this.db.run(`UPDATE tasks SET actual_hours = ? WHERE id = ?`, [totalHours, entryData.task_id]);
    }

    this.save();
    return id;
  }

  async getTimeEntries(taskId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(`
      SELECT * FROM time_entries 
      WHERE task_id = ? 
      ORDER BY entry_date DESC, start_time DESC
    `, [taskId]);

    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  async updateTimeEntry(id: string, updates: any): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.start_time !== undefined) { fields.push('start_time = ?'); values.push(updates.start_time); }
    if (updates.stop_time !== undefined) { fields.push('stop_time = ?'); values.push(updates.stop_time); }
    if (updates.duration_minutes !== undefined) { fields.push('duration_minutes = ?'); values.push(updates.duration_minutes); }
    if (updates.entry_date !== undefined) { fields.push('entry_date = ?'); values.push(updates.entry_date); }
    if (updates.rate !== undefined) { fields.push('rate = ?'); values.push(updates.rate); }
    if (updates.is_billable !== undefined) { fields.push('is_billable = ?'); values.push(updates.is_billable); }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    this.db.run(`UPDATE time_entries SET ${fields.join(', ')} WHERE id = ?`, values);

    // Recalculate actual_hours on task
    const entry = this.db.exec('SELECT task_id FROM time_entries WHERE id = ?', [id]);
    if (entry.length > 0 && entry[0].values.length > 0) {
      const taskId = entry[0].values[0][0];
      const result = this.db.exec(`
        SELECT SUM(duration_minutes) as total 
        FROM time_entries 
        WHERE task_id = ?
      `, [taskId]);

      if (result.length > 0 && result[0].values.length > 0) {
        const totalMinutes = Number(result[0].values[0][0]) || 0;
        const totalHours = totalMinutes / 60;
        this.db.run(`UPDATE tasks SET actual_hours = ? WHERE id = ?`, [totalHours, taskId]);
      }
    }

    this.save();
    return true;
  }

  async deleteTimeEntry(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    // Get task_id before deleting
    const entry = this.db.exec('SELECT task_id FROM time_entries WHERE id = ?', [id]);
    
    this.db.run('DELETE FROM time_entries WHERE id = ?', [id]);

    // Recalculate actual_hours on task
    if (entry.length > 0 && entry[0].values.length > 0) {
      const taskId = entry[0].values[0][0];
      const result = this.db.exec(`
        SELECT SUM(duration_minutes) as total 
        FROM time_entries 
        WHERE task_id = ?
      `, [taskId]);

      if (result.length > 0 && result[0].values.length > 0) {
        const totalMinutes = Number(result[0].values[0][0]) || 0;
        const totalHours = totalMinutes / 60;
        this.db.run(`UPDATE tasks SET actual_hours = ? WHERE id = ?`, [totalHours, taskId]);
      } else {
        this.db.run(`UPDATE tasks SET actual_hours = NULL WHERE id = ?`, [taskId]);
      }
    }

    this.save();
    return true;
  }

  // Task Group Methods
  async getTaskGroups(caseId: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = this.db.exec(`
      SELECT tg.*, 
             COUNT(t.id) as total_tasks,
             SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM task_groups tg
      LEFT JOIN tasks t ON tg.id = t.task_group_id
      WHERE tg.case_id = ?
      GROUP BY tg.id
      ORDER BY tg.triggered_at DESC
    `, [caseId]);

    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  }

  async createTaskGroup(groupData: any): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `group-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    this.db.run(`
      INSERT INTO task_groups (id, case_id, cadence_type, name, triggered_by)
      VALUES (?, ?, ?, ?, ?)
    `, [
      id,
      groupData.case_id,
      groupData.cadence_type,
      groupData.name,
      groupData.triggered_by || null
    ]);

    this.save();
    return id;
  }

  // Calendar Event Methods
  async createCalendarEvent(eventData: any): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `event-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    this.db.run(`
      INSERT INTO calendar_events (
        id, task_id, case_id, title, description, event_date, all_day,
        start_time, end_time, location, reminders, calendar_type, event_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      eventData.task_id || null,
      eventData.case_id,
      eventData.title,
      eventData.description || null,
      eventData.event_date,
      eventData.all_day !== undefined ? eventData.all_day : 1,
      eventData.start_time || null,
      eventData.end_time || null,
      eventData.location || null,
      eventData.reminders ? JSON.stringify(eventData.reminders) : null,
      eventData.calendar_type,
      eventData.event_type || 'manual'
    ]);

    this.save();
    return id;
  }

  async getCalendarEvents(taskId?: string, caseId?: number): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM calendar_events WHERE 1=1';
    const params: any[] = [];

    if (taskId) {
      query += ' AND task_id = ?';
      params.push(taskId);
    }

    if (caseId) {
      query += ' AND case_id = ?';
      params.push(caseId);
    }

    query += ' ORDER BY event_date ASC';

    const result = this.db.exec(query, params);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        if (col === 'reminders' && row[i]) {
          obj[col] = JSON.parse(row[i] as string);
        } else {
          obj[col] = row[i];
        }
      });
      return obj;
    });
  }

  close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
    }
  }
}
