# 🌻 CLAUDE CODE: MODULE A PHASE 1A IMPLEMENTATION PROMPT

**Project:** Dy's Sunflower Suite v4.0  
**Module:** A - Case Manager  
**Phase:** 1A - Core Case Data (Foundation)  
**Date:** November 12, 2025  
**Your Role:** Implementation Developer  
**Quality Gate:** Dy (Project Lead)

---

## 🎯 YOUR MISSION

Implement Module A Phase 1A: The foundation case database for a civil defense litigation case management system.

**What you're building:**
- Database schema for cases, parties, and policies
- CRUD operations via IPC bridge
- React UI for case intake, list, and detail views
- Search and filter functionality

**What you're NOT building yet:**
- Phase 1B: Contacts (plaintiff counsel, opposing counsel, adjusters)
- Phase 1C: Correspondence logging
- Any other modules

**Critical:** Design Phase 1A so Phases 1B and 1C can be added WITHOUT refactoring what you build now.

---

## 📋 PROJECT CONTEXT

### **Tech Stack:**
- **Frontend:** React 18 + TypeScript 5 + Vite 5 + Tailwind CSS
- **Desktop:** Electron 27
- **Database:** SQLite (better-sqlite3)
- **State:** Zustand + localStorage
- **Theme:** Sunflower colors (yellows, golds, light greens)

### **Project Location:**
- Flash drive: `D:\Dy's Sunflower Suite`
- Database: `D:\Dy's Sunflower Suite\data\suite.db`

### **Owner:**
- Dy (attorney, non-developer)
- Tests in VS Code terminal
- Approves each phase before you proceed

---

## 🚨 THE 6 GOLDEN RULES (NON-NEGOTIABLE)

### **Rule 1: Database-First Development**
- Write SQL schema BEFORE TypeScript interfaces
- Test schema in sqlite3 BEFORE writing methods
- Never skip database validation
- **WHY:** If schema is wrong, everything built on it is wrong

### **Rule 2: Preload Script = CommonJS ONLY**
- `electron/preload.js` MUST stay `.js` (never `.ts`)
- MUST use `require()` not `import`
- MUST use `module.exports` not `export`
- **WHY:** TypeScript ES modules break Electron's contextBridge. This is the #1 cause of "exports is not defined" errors.

### **Rule 3: Test After Each Phase**
- Phase 2 (DB) → Test in sqlite3 before Phase 3
- Phase 3 (IPC) → Test in console before Phase 4
- Phase 4 (UI) → Test in browser before Phase 5
- NEVER proceed to next phase without testing current phase
- **WHY:** Bugs compound. Fix them immediately, not at the end.

### **Rule 4: Never DROP TABLE or DROP COLUMN**
- Backward compatibility is critical
- If schema needs change, use `ALTER TABLE ADD COLUMN`
- **WHY:** Modules B-L will reference these tables. Breaking them breaks everything.

### **Rule 5: Flash Drive Considerations**
- Debounced auto-save (5 minutes, not on every keystroke)
- Explicit "Save" buttons
- Batch operations where possible
- **WHY:** Flash drives have limited write cycles. Excessive writes kill the drive.

### **Rule 6: Use Actual Case Phases/Statuses**
- Statuses are from Dy's actual practice (see constants below)
- NOT generic placeholders
- **WHY:** This is a real law practice with real workflows. Accuracy matters.

---

## 🗄️ DATABASE SCHEMA (Your Phase 2)

### **Table 1: `cases`**

```sql
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
  
  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cases_cm_number ON cases(cm_number);
CREATE INDEX IF NOT EXISTS idx_cases_lead_attorney ON cases(lead_attorney);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_phase ON cases(phase);
CREATE INDEX IF NOT EXISTS idx_cases_date_opened ON cases(date_opened);
```

### **Table 2: `case_parties`**

```sql
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
```

### **Table 3: `case_policies`**

```sql
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
```

**CRITICAL:** Save this as `electron/database/schema-module-a.sql` and test it in sqlite3 BEFORE writing any TypeScript code.

---

## 📦 TYPESCRIPT TYPES (Your Phase 3)

**File:** `src/types/ModuleA.ts`

```typescript
// Case Types
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

// Party Types
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

// Policy Types
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

// Constants
export const LEAD_ATTORNEYS = [
  'Rebecca Strickland',
  'Sally Charrash',
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
  'Premises Liability - General',
  'Premises Liability - Slip and Fall',
  'Premises Liability - Negligent Security',
  'Animal Bite',
  'Medical Malpractice',
  'Nursing Home Abuse',
  'Sex Trafficking',
  'Food Poisoning',
  'Boating Accident',
  'Construction Accident'
] as const;

export const CASE_SUBTYPES: Record<string, string[]> = {
  'Motor Vehicle Accident': ['Commercial/Trucking', 'Uninsured/Underinsured Motorist']
};
```

---

## 🔌 IPC METHODS (Your Phase 3)

**File:** `electron/database/DatabaseService.ts`

Implement these methods in the DatabaseService class:

```typescript
// Cases
async createCase(caseData: CaseInput): Promise<number>
async getCases(filters?: CaseFilters): Promise<Case[]>
async getCaseById(id: number): Promise<Case | null>
async updateCase(id: number, updates: Partial<CaseInput>): Promise<boolean>
async searchCases(query: string): Promise<Case[]>  // Searches case_name, cm_number, AND all party names

// Parties
async addParty(caseId: number, partyData: PartyInput): Promise<number>
async getPartiesByCase(caseId: number): Promise<Party[]>
async updateParty(id: number, updates: Partial<PartyInput>): Promise<boolean>
async deleteParty(id: number): Promise<boolean>

// Policies
async addPolicy(caseId: number, policyData: PolicyInput): Promise<number>
async getPoliciesByCase(caseId: number): Promise<Policy[]>
async updatePolicy(id: number, updates: Partial<PolicyInput>): Promise<boolean>
async deletePolicy(id: number): Promise<boolean>

// Utility
async generateCaseDisplayName(caseId: number): Promise<string>
```

**Display Name Logic:**
```typescript
// Example implementation for generateCaseDisplayName:
async generateCaseDisplayName(caseId: number): Promise<string> {
  const caseData = await this.getCaseById(caseId);
  if (!caseData) return '';
  
  const parties = await this.getPartiesByCase(caseId);
  const defendants = parties.filter(p => p.party_type === 'defendant');
  
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
```

**Search Implementation Note:**
The `searchCases()` method MUST search:
1. `cases.case_name`
2. `cases.cm_number`
3. `case_parties.party_name` (via JOIN)

So searching "Jane Doe" finds the case even if Jane is not the primary plaintiff.

**File:** `electron/main.ts`

Add IPC handlers:

```typescript
ipcMain.handle('db:createCase', async (event, caseData) => {
  return await dbService.createCase(caseData);
});

ipcMain.handle('db:getCases', async (event, filters) => {
  return await dbService.getCases(filters);
});

// ... (add handlers for all methods above)
```

**File:** `electron/preload.js` (CRITICAL: Keep as .js with CommonJS)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  db: {
    createCase: (caseData) => ipcRenderer.invoke('db:createCase', caseData),
    getCases: (filters) => ipcRenderer.invoke('db:getCases', filters),
    getCaseById: (id) => ipcRenderer.invoke('db:getCaseById', id),
    updateCase: (id, updates) => ipcRenderer.invoke('db:updateCase', id, updates),
    searchCases: (query) => ipcRenderer.invoke('db:searchCases', query),
    
    addParty: (caseId, partyData) => ipcRenderer.invoke('db:addParty', caseId, partyData),
    getPartiesByCase: (caseId) => ipcRenderer.invoke('db:getPartiesByCase', caseId),
    updateParty: (id, updates) => ipcRenderer.invoke('db:updateParty', id, updates),
    deleteParty: (id) => ipcRenderer.invoke('db:deleteParty', id),
    
    addPolicy: (caseId, policyData) => ipcRenderer.invoke('db:addPolicy', caseId, policyData),
    getPoliciesByCase: (caseId) => ipcRenderer.invoke('db:getPoliciesByCase', caseId),
    updatePolicy: (id, updates) => ipcRenderer.invoke('db:updatePolicy', id, updates),
    deletePolicy: (id) => ipcRenderer.invoke('db:deletePolicy', id),
    
    generateCaseDisplayName: (caseId) => ipcRenderer.invoke('db:generateCaseDisplayName', caseId)
  }
});
```

**File:** `src/types/electron.d.ts`

```typescript
export interface ElectronAPI {
  db: {
    createCase: (caseData: CaseInput) => Promise<number>;
    getCases: (filters?: CaseFilters) => Promise<Case[]>;
    getCaseById: (id: number) => Promise<Case | null>;
    updateCase: (id: number, updates: Partial<CaseInput>) => Promise<boolean>;
    searchCases: (query: string) => Promise<Case[]>;
    
    addParty: (caseId: number, partyData: PartyInput) => Promise<number>;
    getPartiesByCase: (caseId: number) => Promise<Party[]>;
    updateParty: (id: number, updates: Partial<PartyInput>) => Promise<boolean>;
    deleteParty: (id: number) => Promise<boolean>;
    
    addPolicy: (caseId: number, policyData: PolicyInput) => Promise<number>;
    getPoliciesByCase: (caseId: number) => Promise<Policy[]>;
    updatePolicy: (id: number, updates: Partial<PolicyInput>) => Promise<boolean>;
    deletePolicy: (id: number) => Promise<boolean>;
    
    generateCaseDisplayName: (caseId: number) => Promise<string>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
```

---

## 🎨 UI COMPONENTS (Your Phase 4)

### **Zustand Store**

**File:** `src/stores/caseStore.ts`

```typescript
import { create } from 'zustand';
import { Case, Party, Policy } from '../types/ModuleA';

interface CaseState {
  cases: Case[];
  currentCase: Case | null;
  currentParties: Party[];
  currentPolicies: Policy[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCases: (filters?: any) => Promise<void>;
  loadCaseById: (id: number) => Promise<void>;
  createCase: (caseData: any) => Promise<number>;
  updateCase: (id: number, updates: any) => Promise<void>;
  searchCases: (query: string) => Promise<void>;
  
  addParty: (caseId: number, partyData: any) => Promise<void>;
  updateParty: (id: number, updates: any) => Promise<void>;
  deleteParty: (id: number) => Promise<void>;
  
  addPolicy: (caseId: number, policyData: any) => Promise<void>;
  updatePolicy: (id: number, updates: any) => Promise<void>;
  deletePolicy: (id: number) => Promise<void>;
}

export const useCaseStore = create<CaseState>((set) => ({
  cases: [],
  currentCase: null,
  currentParties: [],
  currentPolicies: [],
  isLoading: false,
  error: null,
  
  loadCases: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const cases = await window.electron.db.getCases(filters);
      set({ cases, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  loadCaseById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const caseData = await window.electron.db.getCaseById(id);
      const parties = await window.electron.db.getPartiesByCase(id);
      const policies = await window.electron.db.getPoliciesByCase(id);
      set({ 
        currentCase: caseData, 
        currentParties: parties,
        currentPolicies: policies,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  // ... implement other actions
}));
```

### **Component Files to Create:**

1. **`src/components/moduleA/CaseList.tsx`**
   - Table view of all cases
   - Search bar
   - Filter dropdowns (Lead Attorney, Status, Phase)
   - "+ New Case" button
   - Click row → navigate to case detail

2. **`src/components/moduleA/CaseDetail.tsx`**
   - Tabbed view: "Case Info" | "Contacts (grayed)" | "Correspondence (grayed)"
   - Shows case data, parties, policies
   - "Edit" button → opens CaseForm in edit mode
   - Back button → returns to list

3. **`src/components/moduleA/CaseForm.tsx`**
   - Full-page form with 6 sections:
     1. Case Identification (case name, C/M #, lead attorney, venue, phase, status)
     2. Parties (primary + buttons to add more)
     3. Case Details (type, dates, special flags)
     4. Discovery Deadline (manual entry)
     5. Policy Information (list with "+ Add Policy" button)
     6. Notes
   - "Save" and "Cancel" buttons
   - Form validation

4. **`src/components/moduleA/PartyForm.tsx`**
   - Modal form to add/edit party
   - Fields: party_name, party_type (radio: plaintiff/defendant), is_corporate, is_insured, etc.
   - Defendant-only fields (grayed for plaintiffs)

5. **`src/components/moduleA/PolicyForm.tsx`**
   - Modal form to add/edit policy
   - Fields: policy_type (dropdown), carrier_name, policy_number, limits, etc.
   - UM/UIM-specific fields (shown only when policy_type = 'UM/UIM')

### **Shared Components (Create if not exist):**

- `src/components/shared/Button.tsx` (Tailwind-styled button with sunflower theme)
- `src/components/shared/Modal.tsx` (Modal wrapper for forms)
- `src/components/shared/FormInput.tsx` (Styled text input)
- `src/components/shared/FormSelect.tsx` (Styled dropdown)

### **Routing:**

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CaseList from './components/moduleA/CaseList';
import CaseDetail from './components/moduleA/CaseDetail';
import CaseForm from './components/moduleA/CaseForm';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-sunflower-100">
          <nav>
            <a href="/cases" className="block p-4 hover:bg-sunflower-200">
              Cases
            </a>
            {/* Future modules will add more links */}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/cases/new" element={<CaseForm />} />
            <Route path="/cases/:id/edit" element={<CaseForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

---

## ✅ TESTING CHECKLIST

### **After Phase 2 (Database):**

```bash
# In VS Code terminal:
cd "D:\Dy's Sunflower Suite"
sqlite3 data/suite.db

# Run schema:
.read electron/database/schema-module-a.sql

# Verify tables:
.tables
# Should show: cases, case_parties, case_policies

# Check schema:
.schema cases
.schema case_parties
.schema case_policies

# Insert test data:
INSERT INTO cases (case_name, cm_number, lead_attorney, primary_plaintiff_name, primary_defendant_name, venue_court, phase, status, case_type, date_opened, date_of_loss) VALUES ('Smith v. Jones', '2024-1234', 'Rebecca Strickland', 'John Smith', 'ABC Corp', 'Fulton County Superior Court', 'Open', 'Discovery', 'Motor Vehicle Accident', '2024-11-12', '2024-10-15');

# Verify:
SELECT * FROM cases;

# Exit:
.quit
```

**✅ Phase 2 passes if:** All tables created, test data inserts successfully, query returns data.

---

### **After Phase 3 (IPC):**

```bash
# Start app:
npm run dev

# Wait for Electron window to open
# Press F12 to open DevTools
# Go to Console tab
```

Test in console:

```javascript
// Test createCase:
await window.electron.db.createCase({
  case_name: 'Test Case',
  cm_number: '2024-9999',
  lead_attorney: 'Rebecca Strickland',
  primary_plaintiff_name: 'Test Plaintiff',
  primary_defendant_name: 'Test Defendant',
  venue_court: 'Test Court',
  phase: 'Open',
  status: 'Pre-Suit/Intake',
  case_type: 'Motor Vehicle Accident',
  date_opened: '2024-11-12',
  date_of_loss: '2024-11-01'
});
// Should return: number (case ID)

// Test getCases:
await window.electron.db.getCases();
// Should return: array of case objects

// Test addParty:
await window.electron.db.addParty(1, {
  case_id: 1,
  party_type: 'defendant',
  party_name: 'Second Defendant',
  is_corporate: true,
  is_primary: false
});
// Should return: number (party ID)

// Test generateCaseDisplayName:
await window.electron.db.generateCaseDisplayName(1);
// Should return: "Plaintiff v. Defendant, et al." (if multiple defendants)
```

**✅ Phase 3 passes if:** All IPC methods callable, return expected data, no console errors.

---

### **After Phase 4 (UI):**

Manual testing in app:

1. Click "Cases" in sidebar → Case list appears
2. Click "+ New Case" → Form opens
3. Fill out all sections
4. Click "+ Add Defendant" → Modal opens, add second defendant
5. Click "+ Add Policy" → Modal opens, add policy
6. Click "Save" → Case saves, redirects to detail view
7. Verify case display name shows "et al." (if multiple defendants)
8. Click "Back" → Returns to list
9. Search for case by any party name → Finds case
10. Filter by Lead Attorney → Shows filtered results
11. Click case → Detail view shows all data correctly
12. Click "Edit" → Form opens with existing data
13. Make changes, save → Changes persist

**✅ Phase 4 passes if:** All UI flows work, data saves correctly, no console errors.

---

### **After Phase 5 (Integration):**

1. Create 3 test cases with multiple parties and policies
2. Close app completely (quit Electron)
3. Reopen app
4. Verify all 3 cases still there
5. Verify display names correct
6. Verify search works
7. Verify filters work
8. Check DevTools console → No errors
9. Check database: `sqlite3 data/suite.db` → `SELECT * FROM cases;` → Verify data integrity

**✅ Phase 5 passes if:** Data persists across restarts, all features work, no errors.

---

## 🎯 ACCEPTANCE CRITERIA (Full List)

- [ ] Database schema created successfully (3 tables)
- [ ] All indexes created
- [ ] Foreign keys enforce correctly
- [ ] All IPC methods callable from console
- [ ] Case list displays with correct columns
- [ ] Search searches ALL party names (not just primary)
- [ ] Filters work correctly
- [ ] Intake form has all 6 sections
- [ ] Can add multiple plaintiffs/defendants
- [ ] Can add multiple policies
- [ ] Form validation works
- [ ] Case display name shows "et al." only for multiple defendants
- [ ] Case display name uses only primary plaintiff last name (not "et al.")
- [ ] Case detail view shows all data
- [ ] Edit mode works correctly
- [ ] Data persists across app restart
- [ ] No console errors in DevTools
- [ ] Module A documentation complete

---

## 🏗️ FUTURE-PROOFING NOTES

### **Phase 1B Will Add:**
- `contacts` table (attorneys, adjusters, experts, witnesses)
- `case_contacts` junction table
- Contact sections in intake form
- "Contacts" tab in case detail (currently grayed out)

**What you need to do NOW:**
- In CaseDetail component, create tabs but gray out "Contacts" and "Correspondence"
- Leave space in UI for these future features
- Don't put contact fields in `cases` table (they go in separate `contacts` table)

### **Phase 1C Will Add:**
- `correspondence` table (emails, calls, letters)
- Correspondence log in case detail
- "Correspondence" tab in case detail (currently grayed out)

**What you need to do NOW:**
- In CaseDetail component, create "Correspondence" tab but gray it out
- Don't put correspondence fields in `cases` table (separate table)

### **Module B (Tasks) Will Add:**
- `tasks` table with `case_id` foreign key
- "Tasks" tab in case detail

### **Module C (Calendar) Will Add:**
- Auto-calculation of `discovery_close_date` from answer dates
- Countdown timer to discovery deadline
- Will READ `answer_filed_date` from `case_parties` table

**What you need to do NOW:**
- Make sure `answer_filed_date` is in `case_parties` table (it is in schema above)
- Make sure `discovery_close_date` is in `cases` table (it is in schema above)

---

## 🚫 WHAT NOT TO DO

**DON'T:**
- ❌ Convert preload.js to TypeScript
- ❌ Use ES modules in preload.js
- ❌ Skip testing phases
- ❌ Add contact fields to `cases` table
- ❌ Add correspondence fields to `cases` table
- ❌ Use generic case statuses (use the exact list provided)
- ❌ Make case display name show "et al." for multiple plaintiffs
- ❌ Add multiple modules at once
- ❌ Make architectural changes without asking

**DO:**
- ✅ Test after each phase
- ✅ Ask clarifying questions
- ✅ Show test results to Dy before proceeding
- ✅ Report blockers immediately
- ✅ Follow the 5-phase cycle exactly
- ✅ Use the sunflower color theme
- ✅ Make the UI intuitive for an attorney (not a developer)

---

## 🎨 SUNFLOWER THEME COLORS

Use these Tailwind classes throughout:

```javascript
// From tailwind.config.js:
colors: {
  sunflower: {
    50: '#FFFBEB',   // Lightest cream
    100: '#FEF3C7',  // Pale yellow
    200: '#FDE68A',  // Soft yellow
    300: '#FCD34D',  // Light sunflower
    400: '#FBBF24',  // Medium sunflower (use for buttons)
    500: '#F59E0B',  // Core sunflower
    600: '#D97706',  // Deep sunflower
    700: '#B45309',  // Rich gold
    800: '#92400E',  // Dark gold
    900: '#78350F',  // Deepest amber
  }
}
```

**UI guidelines:**
- Buttons: `bg-sunflower-400 hover:bg-sunflower-500`
- Sidebar: `bg-sunflower-100`
- Inputs: `border-sunflower-300 focus:border-sunflower-500`
- Headers: `text-sunflower-700`

---

## 📞 COMMUNICATION PROTOCOL

### **After Each Phase:**

Report to Dy:

```
PHASE X COMPLETE ✅

What I built:
- [List files created]
- [List methods implemented]

How to test:
- [Exact commands to run]
- [Expected results]

Status:
- [ ] Tests passing
- [ ] No console errors
- [ ] Ready for review

Blockers: [None / List any issues]

Next phase: [Name of next phase]
```

### **If You Hit an Error:**

**STOP immediately.** Don't try 5 different fixes. Report:

```
ERROR ENCOUNTERED ⚠️

Phase: [Which phase]
What I was doing: [Describe action]
Error message: [Exact error]
What I've checked:
- [ ] TypeScript compilation errors
- [ ] Console errors
- [ ] Database connection
- [ ] File paths

I need guidance on: [Specific question]
```

### **Before Proceeding to Next Phase:**

Wait for Dy's approval:

```
Dy: "Phase X approved. Start Phase Y."
```

**Don't proceed without approval.** Dy is the quality gate.

---

## 🌻 YOUR FIRST RESPONSE SHOULD BE:

"Hi Dy! I've reviewed the Module A Phase 1A specification. I understand:

✅ What I'm building: Core case database (cases, parties, policies)
✅ What I'm NOT building yet: Contacts (Phase 1B), Correspondence (Phase 1C)
✅ The 6 golden rules (especially preload.js = CommonJS)
✅ The 5-phase cycle (test after each phase)
✅ Database schema (3 tables)
✅ IPC methods (cases, parties, policies)
✅ UI components (list, detail, form)
✅ Display name logic (primary plaintiff last name + "et al." only for multiple defendants)
✅ Search must find cases by ANY party name
✅ Future-proofing for Phases 1B and 1C

**I'm ready to start Phase 2 (Database Layer).** 

Before I begin, I have [X] clarifying questions:

1. [Question if any]

Once you answer (or if no questions), I'll create the schema file and test it in sqlite3. I'll report results before proceeding to Phase 3.

Ready when you are! 🌻"

---

## 📚 REFERENCE FILES

All project files are at: `D:\Dy's Sunflower Suite\`

Configuration files already exist:
- `package.json`
- `tsconfig.json`
- `tsconfig.electron.json`
- `vite.config.ts`
- `tailwind.config.js`
- `.gitignore`

**Don't modify these unless absolutely necessary.**

---

## 🎯 SUCCESS DEFINITION

**Module A Phase 1A is complete when:**

1. Dy can create a new case with all fields
2. Dy can add multiple plaintiffs and defendants
3. Dy can add multiple policies
4. Dy can search for cases by ANY party name
5. Dy can filter cases by lead attorney, status, phase
6. Dy can edit cases and changes persist
7. Case display names show "et al." correctly (only for multiple defendants)
8. All data persists across app restart
9. No console errors in DevTools
10. Dy approves the work

**Then we move to Phase 1B (Contacts).**

---

## 🌻 YOU'VE GOT THIS

You have:
- ✅ Complete database schema
- ✅ All TypeScript types
- ✅ All IPC methods specified
- ✅ UI design guidelines
- ✅ Testing checklist for each phase
- ✅ Clear acceptance criteria
- ✅ Future-proofing notes
- ✅ Golden rules to follow

**Follow the 5-phase cycle. Test after each phase. Ask questions when unclear. Report progress regularly.**

**Let's build this right.** 🌻

---

END OF PROMPT
