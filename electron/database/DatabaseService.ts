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
`;

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

    // Execute embedded schema
    this.db.exec(SCHEMA_SQL);

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

    // Save to disk
    this.save();
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

  close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
    }
  }
}
