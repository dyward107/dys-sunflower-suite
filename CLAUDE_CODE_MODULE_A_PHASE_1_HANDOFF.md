# 🌼 CLAUDE CODE HANDOFF PROMPT
## Ready to Build: Module A Phase 1

**COPY AND PASTE THIS WHEN YOU'RE READY TO START CODING**

---

## THE PROMPT

I'm Dy, an attorney building Sunflower Suite—a legal case management system.

I've prepared comprehensive documentation and need you to build **Module A: Case Manager** following a strict 5-phase cycle.

---

## CRITICAL: READ THESE FIRST

Before you write ANY code, please read:

1. **SUNFLOWER_SUITE_v4.0_PROJECT_CHARTER_FRESH_START.md** (sections 1-10)
   - Project architecture
   - 6 Golden Rules (CRITICAL)
   - 5-phase cycle
   - File structure
   - Testing standards

2. **ADDENDUM_YOUR_ACTUAL_CASE_PHASES_AND_STATUSES.md**
   - The actual case phases you'll use
   - Database schema ready to use

3. **SONNET_HANDOFF_ORIENTATION.md** (if available in project)
   - Communication patterns
   - Red flags
   - Constraints

After reading, tell me: **"I've read the documents. I understand the golden rules. I understand my constraints. Ready to start Phase 1."**

---

## MODULE A SPECIFICATION

### What Is Module A?

**Case Manager** = Foundation for everything else

- Core purpose: Single source of truth for case metadata
- Database: All case information (parties, dates, status, phase, contacts, notes)
- IPC: Methods to create, read, update case data
- Components: Case list, case detail, case form
- All other modules depend on this

### What Module A Does

✅ Create new cases with parties, jurisdiction, date opened  
✅ Edit case information (name, phase, status, facts, notes)  
✅ Link contacts to cases (attorneys, parties, witnesses, providers)  
✅ Track case phase (Monitor → Pre-Suit → Discovery → Trial → Closed)  
✅ Track case status (Pending → Active → Settled/Dismissed → Closed)  
✅ Archive/soft-delete cases  
✅ Search cases by name, party, jurisdiction  

### What Module A Does NOT

❌ Task management (that's Module B)  
❌ Calendar/deadlines (that's Module C)  
❌ Discovery document upload (that's Module D)  
❌ Any document processing (that's Mark-and-Populate)  

---

## THE 5-PHASE CYCLE (STRICT)

**You MUST follow this exactly. One phase at a time. Test after each phase.**

### Phase 1: Design & Planning (READ-ONLY)

**Your task:** Review and confirm you understand

1. Read MODULE_A_TECHNICAL_SUMMARY.md (if available, or skip)
2. Review the database schema below
3. Review the IPC methods below
4. Ask clarifying questions (ask anything!)
5. **Tell me:** "Phase 1 complete. I understand the spec. Ready for Phase 2."

**DO NOT write any code yet.**

---

### Phase 2: Database Layer (TEST IN SQLITE3)

**Your task:** Create and test database schema

**Deliverable:** Database schema that I can test with sqlite3

**Steps:**

1. Create file: `electron/database/schema-module-a.sql`

2. Write schema (see SCHEMA below)

3. Verify in sqlite3:
   ```bash
   sqlite3 path/to/suite.db
   > .read electron/database/schema-module-a.sql
   > .tables
   > .schema cases
   > .schema contacts
   > SELECT COUNT(*) FROM cases;
   ```

4. Create file: `electron/database/DatabaseService.ts`

5. Write CRUD methods (see METHODS below)

6. Test with Node:
   ```bash
   npx tsx electron/database/DatabaseService.ts
   ```

7. Report back with:
   - ✅ Schema created successfully
   - ✅ All tables exist (confirm with `.tables`)
   - ✅ CRUD methods work
   - ✅ Sample test run output

**DO NOT move to Phase 3 until I approve Phase 2.**

---

### Phase 3: IPC Bridge (TEST IN BROWSER CONSOLE)

**Your task:** Connect database methods to React via IPC

**Deliverable:** window.electron.db methods callable from browser console

**Steps:**

1. Update `electron/main.ts`:
   - Add IPC event handlers for all Module A methods
   - Each handler calls DatabaseService method
   - Return result to renderer

2. Update `electron/preload.js` (MUST be CommonJS):
   ```javascript
   const { contextBridge, ipcRenderer } = require('electron');
   
   contextBridge.exposeInMainWorld('electron', {
     db: {
       getCase: (id) => ipcRenderer.invoke('db:getCase', id),
       getCases: () => ipcRenderer.invoke('db:getCases'),
       createCase: (data) => ipcRenderer.invoke('db:createCase', data),
       // ... all methods
     }
   });
   ```

3. Update `src/types/electron.d.ts`:
   ```typescript
   export interface ElectronAPI {
     db: {
       getCase: (id: string) => Promise<Case>;
       getCases: () => Promise<Case[]>;
       createCase: (data: CreateCaseDTO) => Promise<Case>;
       // ... all methods with proper types
     }
   }
   ```

4. Test in browser console:
   ```javascript
   window.electron.db.getCases().then(console.log)
   window.electron.db.createCase({name: "Test Case"}).then(console.log)
   ```

5. Report back with:
   - ✅ window.electron exists
   - ✅ window.electron.db exists
   - ✅ All methods are callable
   - ✅ Methods return expected data types
   - ✅ No console errors
   - ✅ No TypeScript compilation errors

**DO NOT move to Phase 4 until I approve Phase 3.**

---

### Phase 4: State & Components (INTEGRATION TESTING)

**Your task:** Build React components and wire them to database

**Deliverable:** Working UI that displays and creates cases

**Steps:**

1. Create Zustand store: `src/stores/caseStore.ts`
   - Load cases on app start
   - Handle create, update, delete
   - Persist to localStorage

2. Create components in `src/components/moduleA/`:
   - CaseList.tsx (table of all cases)
   - CaseForm.tsx (create/edit form)
   - CaseDetail.tsx (view case details)

3. Add route to `src/App.tsx`:
   ```typescript
   <Route path="/cases" element={<CaseList />} />
   <Route path="/cases/:id" element={<CaseDetail />} />
   ```

4. Add sidebar navigation

5. Test in app:
   - Can see list of cases
   - Can click to view case details
   - Can create new case
   - Can edit case
   - Form validates required fields
   - Data saves to database

6. Report back with:
   - ✅ All components render
   - ✅ CaseList displays cases
   - ✅ CaseForm creates cases
   - ✅ CaseDetail shows case info
   - ✅ Edit form updates data
   - ✅ No console errors
   - ✅ UI is responsive

**DO NOT move to Phase 5 until I approve Phase 4.**

---

### Phase 5: Integration & Polish (ACCEPTANCE TESTING)

**Your task:** Full end-to-end testing and documentation

**Deliverable:** Production-ready Module A

**Steps:**

1. Create new case
2. Close and reopen app
3. Verify case still exists
4. Verify all case data persists
5. Edit case
6. Verify edits persist
7. Delete case (soft delete)
8. Verify case is archived
9. Verify no console errors
10. Check DevTools for memory leaks

11. Create `docs/MODULE_A_README.md`:
    - Purpose
    - Features
    - Database tables
    - IPC methods
    - Components
    - Known limitations

12. Report back with:
    - ✅ All acceptance criteria met
    - ✅ Data persists after restart
    - ✅ No errors in console
    - ✅ README written

**After Phase 5 approved:** Module A is DONE. Ready for Module B.

---

## DATABASE SCHEMA (Phase 2)

```sql
-- Module A: Case Manager
-- Foundation for all other modules

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  case_name TEXT NOT NULL,
  case_number TEXT,
  jurisdiction TEXT,  -- "Georgia", "Federal", etc.
  
  -- Parties
  plaintiff TEXT,
  defendant TEXT,
  additional_parties TEXT,  -- JSON array of other parties
  
  -- Case dates
  date_opened TEXT,  -- YYYY-MM-DD
  date_closed TEXT,
  statute_of_limitations TEXT,
  
  -- Case state
  phase TEXT CHECK (phase IN (
    'monitor-for-service',
    'pre-suit',
    'pending-mediation',
    'pending-lawsuit',
    'discovery',
    'pre-trial',
    'trial-prep',
    'settled',
    'dismissed',
    'closed-file'
  )),
  
  status TEXT CHECK (status IN (
    'pending',
    'pending-service',
    'pending-lawsuit',
    'active',
    'on-hold',
    'settled',
    'dismissed',
    'closed',
    'conflict-clearance'
  )),
  
  -- Notes and metadata
  facts TEXT,  -- Attorney notes about facts
  general_notes TEXT,  -- Free-form attorney notes
  tags TEXT,  -- Comma-separated tags
  
  -- Audit trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  is_archived BOOLEAN DEFAULT 0
);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_phase ON cases(phase);
CREATE INDEX idx_cases_created ON cases(created_at);

-- Contacts: linked to cases
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  contact_type TEXT CHECK (contact_type IN (
    'attorney',
    'opposing-attorney',
    'party',
    'witness',
    'medical-provider',
    'expert',
    'other'
  )),
  affiliation TEXT,  -- Company/organization
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX idx_contacts_case ON contacts(case_id);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
```

---

## IPC METHODS (Phase 3)

Each method name format: `db:[methodName]`

```typescript
// Cases
getCase(id: string): Promise<Case>
getCases(filters?: {status?, phase?, archived?}): Promise<Case[]>
createCase(data: {case_name, plaintiff, defendant, jurisdiction}): Promise<Case>
updateCase(id: string, updates: Partial<Case>): Promise<Case>
deleteCase(id: string): Promise<void>  // Soft delete

// Contacts
getContacts(caseId: string): Promise<Contact[]>
createContact(caseId: string, data: {first_name, last_name, email, contact_type}): Promise<Contact>
updateContact(id: string, updates: Partial<Contact>): Promise<Contact>
deleteContact(id: string): Promise<void>

// Utility
searchCases(searchTerm: string): Promise<Case[]>
```

---

## GOLDEN RULES (NON-NEGOTIABLE)

**Rule 1: Database-First**
- Write schema BEFORE interfaces
- Test schema in sqlite3
- Test methods with Node before IPC

**Rule 2: Preload = CommonJS**
- Keep preload.js as .js
- Use require() not import/export
- Do NOT convert to TypeScript

**Rule 3: Support Both Naming**
- DB: snake_case
- UI: camelCase
- Interfaces support both

**Rule 4: Add Retry Limits**
- IPC availability check max 10 retries
- Fail gracefully, not silently

**Rule 5: Test After Each Phase**
- Phase 2: Test in sqlite3
- Phase 3: Test in console
- Phase 4: Test workflows
- Phase 5: Integration test

**Rule 6: Backward Compatible**
- Use ALTER TABLE (safe)
- Never DROP
- Migrations idempotent

---

## ACCEPTANCE CRITERIA (Phase 5)

- [ ] Can create new case with parties and dates
- [ ] Can view case details
- [ ] Can edit case information
- [ ] Can search cases by name
- [ ] Phase dropdown works (all 10 phases available)
- [ ] Status dropdown works (all 9 statuses available)
- [ ] Can add contacts to case
- [ ] Can edit contact information
- [ ] Can delete contact (removed from case)
- [ ] Deleted cases archived (soft delete)
- [ ] Data persists after app restart
- [ ] No console errors
- [ ] No memory leaks
- [ ] UI is responsive
- [ ] All fields have proper validation

---

## QUESTIONS TO ASK

Before starting Phase 1, ask me:

1. What date format should I use? (YYYY-MM-DD?)
2. Should additional_parties be JSON array or separate table?
3. Should case search be by name only, or by name/party/number?
4. When user deletes a contact, should it cascade or just unlink?
5. Any other fields I should add to Case or Contact?

---

## HOW TO REPORT BACK

After EACH phase, send me a message like:

**Phase 2 Complete:**
```
✅ Database schema created (electron/database/schema-module-a.sql)
✅ Tables created: cases, contacts
✅ Tested in sqlite3: SELECT COUNT(*) FROM cases → 0 (empty, as expected)
✅ DatabaseService.ts created with 8 CRUD methods
✅ Tested with Node: createCase(), getCase(), updateCase() all work
✅ Ready for Phase 3

Questions: [any questions?]
Next: Shall I move to Phase 3 (IPC Bridge)?
```

**DO NOT assume phase is complete. Wait for my approval.**

---

## IF SOMETHING BREAKS

**DO NOT spiral trying random fixes.**

Instead:

1. Tell me exactly what broke
2. Show me the error message
3. Show me the code causing it
4. Ask: "What should I do?"

I'll help you diagnose. Then fix intentionally.

---

## YOUR FIRST ACTION

**Right now:**

1. ✅ Read the documents above
2. ✅ Tell me you understand the spec
3. ✅ Tell me you understand the 5-phase cycle
4. ✅ Tell me you understand the golden rules
5. ✅ Ask clarifying questions
6. ✅ Say: "Ready for Phase 1. What are my Phase 1 tasks?"

**Then wait for my approval to start Phase 2.**

---

**Let's build Module A correctly. 🌼**

