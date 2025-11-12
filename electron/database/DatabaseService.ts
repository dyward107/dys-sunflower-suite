import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

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
  private db: Database.Database;

  constructor(dbPath: string) {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');

    // Initialize schema
    this.initializeSchema();
  }

  private initializeSchema(): void {
    const schemaPath = path.join(__dirname, 'schema-module-a.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
  }

  // ============================================================================
  // CASES METHODS
  // ============================================================================

  async createCase(caseData: CaseInput): Promise<number> {
    const stmt = this.db.prepare(`
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
    `);

    const result = stmt.run(
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
    );

    return result.lastInsertRowid as number;
  }

  async getCases(filters?: CaseFilters): Promise<any[]> {
    let query = 'SELECT * FROM cases WHERE 1=1';
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

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  async getCaseById(id: number): Promise<any | null> {
    const stmt = this.db.prepare('SELECT * FROM cases WHERE id = ?');
    return stmt.get(id) || null;
  }

  async updateCase(id: number, updates: Partial<CaseInput>): Promise<boolean> {
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

    const stmt = this.db.prepare(query);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  async searchCases(query: string): Promise<any[]> {
    // Search in cases table (case_name, cm_number) AND case_parties table (party_name)
    const searchTerm = `%${query}%`;

    const stmt = this.db.prepare(`
      SELECT DISTINCT c.*
      FROM cases c
      LEFT JOIN case_parties cp ON c.id = cp.case_id
      WHERE c.case_name LIKE ?
         OR c.cm_number LIKE ?
         OR cp.party_name LIKE ?
      ORDER BY c.date_opened DESC
    `);

    return stmt.all(searchTerm, searchTerm, searchTerm);
  }

  // ============================================================================
  // PARTIES METHODS
  // ============================================================================

  async addParty(caseId: number, partyData: PartyInput): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO case_parties (
        case_id, party_type, party_name, is_corporate, is_primary,
        is_insured, is_presuit, monitor_for_service,
        service_date, answer_filed_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
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
    );

    return result.lastInsertRowid as number;
  }

  async getPartiesByCase(caseId: number): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM case_parties WHERE case_id = ? ORDER BY is_primary DESC, party_type, party_name');
    return stmt.all(caseId);
  }

  async updateParty(id: number, updates: Partial<PartyInput>): Promise<boolean> {
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

    const stmt = this.db.prepare(query);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  async deleteParty(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM case_parties WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // ============================================================================
  // POLICIES METHODS
  // ============================================================================

  async addPolicy(caseId: number, policyData: PolicyInput): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO case_policies (
        case_id, policy_type, carrier_name, policy_number,
        policy_limits, we_are_retained_by_carrier, umuim_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      caseId,
      policyData.policy_type,
      policyData.carrier_name,
      policyData.policy_number,
      policyData.policy_limits || null,
      policyData.we_are_retained_by_carrier ? 1 : 0,
      policyData.umuim_type || null,
      policyData.notes || null
    );

    return result.lastInsertRowid as number;
  }

  async getPoliciesByCase(caseId: number): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM case_policies WHERE case_id = ? ORDER BY policy_type');
    return stmt.all(caseId);
  }

  async updatePolicy(id: number, updates: Partial<PolicyInput>): Promise<boolean> {
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

    const stmt = this.db.prepare(query);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  async deletePolicy(id: number): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM case_policies WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async generateCaseDisplayName(caseId: number): Promise<string> {
    const caseData = await this.getCaseById(caseId);
    if (!caseData) return '';

    const parties = await this.getPartiesByCase(caseId);
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
    this.db.close();
  }
}
