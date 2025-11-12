# 🌼 SUNFLOWER SUITE v4.0 - Fresh Start Project Charter
## Complete Vision, Architecture, Lessons Learned, and Implementation Framework

**Project Lead:** Dy (Attorney, non-developer)  
**Date:** November 12, 2025  
**Status:** Starting Fresh - Lessons Incorporated - Ready for Rebuild  
**Goal:** Build a professional-grade civil defense litigation case management system  
**Timeline:** 12-16 weeks (one module per week, with testing)

---

## 📋 TABLE OF CONTENTS

1. **Project Vision & Goals**
2. **Complete Module List with Descriptions**
3. **Architecture & Tech Stack (Locked)**
4. **Project Structure & File Organization**
5. **Golden Rules (Non-Negotiable)**
6. **What Worked Before (Keep This)**
7. **What Failed Before (Never Do This)**
8. **Module Implementation Standards**
9. **Testing & Quality Standards**
10. **Development Workflow & Checkpoints**

---

## 🎯 PART 1: PROJECT VISION & GOALS

### What is Sunflower Suite?

A comprehensive **offline-first desktop application** that serves as the "operating system" for civil defense litigation. It handles everything from case intake through trial, replacing spreadsheets and fragmented tools with one integrated system.

### Core Purpose

Enable solo attorneys and small litigation teams to:
- Manage cases from intake to closure
- Track tasks and workflows automatically
- Calculate litigation deadlines (Georgia-specific)
- Manage discovery documents
- Build chronologies from documents
- Prepare for depositions
- Generate reports and templates
- Track billable time
- Never miss a deadline

### Why It's Important

**Before Sunflower Suite:** Spreadsheets, emails, calendar alerts, separate tools → mistakes, missed deadlines, inefficiency  
**After Sunflower Suite:** One integrated system, automated workflows, deadline calculations, integrated time tracking → confidence, efficiency, profitability

### Success Definition

**The app is successful when:**
- ✅ An attorney can enter a new case and never think about spreadsheets again
- ✅ Every deadline is automatically calculated and never missed
- ✅ Time is tracked without extra effort
- ✅ All case information is in one searchable place
- ✅ Documents are automatically processed and organized
- ✅ The system works perfectly offline (no network needed)

---

## 📦 PART 2: COMPLETE MODULE LIST

### The 12 Modules (Build in This Order)

| # | Module | Purpose | Dependencies | Est. Time |
|---|--------|---------|--------------|-----------|
| A | Case Manager | Core case storage, lifecycle, contacts, correspondence | None | 2 weeks |
| B | Task & Workflow | Task management, cadences, time tracking | A | 1-2 weeks |
| C | Calendar & Deadlines | Georgia litigation deadlines, ICS export | A, B | 1 week |
| D | Discovery Manager | Document intake, Bates numbering, gap detection | A, B, C | 2 weeks |
| E | Case Chronology | Auto-build timelines from documents | A, D | 1.5 weeks |
| F | Medical Chronology | Medical record processing and timelines | A, E | 1 week |
| G | Issues & Claims | Issue extraction, claim mapping | A, E, F | 1.5 weeks |
| H | Deposition Prep | Question generation, prep materials | A, E, G | 1 week |
| I | Reports & Templates | Merge engine, export to DOCX/PDF/CSV | A-H | 2 weeks |
| J | Trial Notebook | Trial exhibits, witness info, arguments | A, E, H, I | 1 week |
| K | Communications | Email/letter templates, contact tracking | A, B | 1 week |
| L | Analytics Dashboard | Case metrics, time tracking analytics | A-K | 1 week |

**Total Build Time:** ~16 weeks (one module per week, with some parallel where possible)

### Module Details

#### **Module A: Case Manager (FOUNDATION)**
**What it does:**
- Create and manage cases (plaintiff, defendant, venue, dates, status)
- Track case phases (intake → pre-suit → suit → discovery → trial → closed)
- Manage contacts per case (attorneys, experts, parties, adjusters)
- Log correspondence (letters, emails, calls)
- Pin favorite cases, search, filter

**Database tables:**
- cases (id, plaintiff_name, defendant_name, insurer_name, venue, c_m_number, phase, status, etc.)
- contacts (first_name, last_name, email, phone, role, linked_cases)
- correspondence (type, date, subject, notes, parties_involved)

**Why First:**
- Foundation for everything else
- All other modules reference cases table
- Establishes database pattern

**Success Criteria:**
- Create new case with all fields
- Edit case details
- List cases with sorting/filtering
- Pin/unpin cases
- Manage contacts per case
- Log correspondence
- Data persists across restarts

---

#### **Module B: Task & Workflow (WORKFLOW ENGINE)**
**What it does:**
- Create tasks (description, due date, priority, assigned to)
- Organize tasks into groups (cadences) like "Intake Workflow", "Discovery Review", "Depo Prep"
- Auto-spawn task groups from triggers (new case → intake workflow automatically created)
- Log billable time against tasks
- Mark tasks complete

**Database tables:**
- tasks (case_id, description, due_date, priority, status, time_spent, notes)
- task_groups (case_id, name, created_from_trigger, date_closed)
- time_entries (task_id, date, hours, description, narrative)
- cadence_templates (name, tasks[], triggered_by)

**Why Second:**
- Builds on Module A (every task links to a case)
- Enables workflow automation
- Captures billable time

**Success Criteria:**
- Create tasks with all fields
- Create task groups (cadences)
- Complete tasks and log time
- Overdue tasks highlighted
- Auto-spawn cadences on triggers
- Time entries sum correctly

---

#### **Module C: Calendar & Deadlines (GEORGIA-SPECIFIC)**
**What it does:**
- Auto-calculate Georgia civil litigation deadlines (service, answer due, discovery close, etc.)
- Display deadlines on calendar
- Export to ICS (import into Outlook/Google Calendar)
- Warn of approaching deadlines
- Track key dates (service date, answer due date, discovery closed date, trial date)

**Database tables:**
- case_anchors (service_date, answer_due_date, discovery_closed_date, trial_date, etc.)
- deadline_rules (rule_name, rule_description, calculation)
- holidays (holiday_date, holiday_name)

**Why Third:**
- Uses Module B date utilities
- Reference data (holidays, rules) established
- Deadline calculations are complex but critical

**Success Criteria:**
- Set service date → all other deadlines auto-calculate
- Deadlines respect weekends and holidays
- Deadlines export to ICS
- Calendar view shows all dates
- Approaching deadlines highlighted

---

#### **Module D: Discovery Manager (DOCUMENT PROCESSING)**
**What it does:**
- Import discovery documents (PDF, DOCX)
- Auto-Bates number documents (D_001, D_002, etc.)
- Detect gaps in Bates numbering
- Flag missing documents
- Search and filter documents
- Track what's been produced, what's pending

**Database tables:**
- discovery_documents (bates_number, filename, file_path, page_count, date_received, status)
- bates_ranges (start_number, end_number, date_range, received_from)
- discovery_deficiencies (requested_items, received_items, missing_items, recipient)

**Why Fourth:**
- Core litigation workflow (discovery is huge)
- Uses utilities from Module C (date formatting)
- Critical for compliance

**Success Criteria:**
- Import documents with auto-Bates numbering
- Detect gaps in numbering
- Generate deficiency lists
- Search documents by Bates number
- Export document list

---

#### **Module E: Case Chronology (AUTOMATED NARRATIVE)**
**What it does:**
- Auto-extract key dates and facts from documents
- Build timeline of events
- Generate narrative chronology (exportable)
- Tag documents as they're processed
- Identify key facts, causation, damages

**Database tables:**
- chronology_events (date, description, source_document, event_type, importance)
- fact_tags (tag_name, description, linked_events)
- narrative_drafts (content, date_created, date_updated)

**Why Fifth:**
- Builds on Module D (uses documents)
- Essential for case narrative
- Complex but high-value feature

**Success Criteria:**
- Extract events from documents
- Build chronology timeline
- Export chronology as document
- Tag facts and link to events
- Narrative auto-generates

---

#### **Module F: Medical Chronology (MEDICAL-SPECIFIC)**
**What it does:**
- Similar to Module E but for medical records
- Track medical providers, dates, diagnoses
- Build medical timeline
- Extract treatment progression
- Flag inconsistencies or gaps in care

**Database tables:**
- medical_records (date, provider, diagnosis, treatment, file_path)
- medical_timeline (date, event_description, linked_records)
- medical_deficiencies (missing_records, time_gaps, inconsistencies)

**Why Sixth:**
- Specialized version of Module E
- Medical records handling is litigation-critical
- Builds on chronology patterns

**Success Criteria:**
- Import medical records
- Build medical timeline
- Track treatment progression
- Identify gaps in care
- Export medical chronology

---

#### **Module G: Issues & Claims (LEGAL ANALYSIS)**
**What it does:**
- Identify legal issues in the case (negligence, causation, damages, etc.)
- Map claims to facts from chronology
- Track elements of proof required
- Cross-reference with documents
- Build legal theory outline

**Database tables:**
- issues (issue_name, description, elements_required, case_id)
- issue_proof_map (issue_id, required_element, supporting_facts, supporting_documents)
- claim_mapping (claim_name, linked_issues, proof_status)

**Why Seventh:**
- Uses Modules E and F (chronology and facts)
- Legal analysis layer on top of facts
- Organizes case strategy

**Success Criteria:**
- Identify issues in case
- Map claims to facts
- Track proof elements
- Link to supporting documents
- Export issue summary

---

#### **Module H: Deposition Prep (WITNESS PREPARATION)**
**What it does:**
- Generate deposition questions based on chronology, issues, and document facts
- Organize witness information
- Prepare deposition materials
- Track deposition history
- Flag key areas of testimony needed

**Database tables:**
- deposition_records (witness_name, deposition_date, topics_covered)
- deposition_questions (question_text, based_on_fact_id, expected_answer)
- deposition_materials (witness_id, material_type, file_path, created_date)

**Why Eighth:**
- Uses Modules E, G (chronology and issues)
- Pre-trial preparation
- Auto-generates questions from case facts

**Success Criteria:**
- Generate deposition questions
- Organize witness information
- Prepare deposition materials
- Track deposition history
- Export deposition prep document

---

#### **Module I: Reports & Templates (MERGE ENGINE)**
**What it does:**
- Template merge engine ({{case.name}}, {{plaintiff.name}}, {{chronology}}, etc.)
- Generate reports from case data
- Export case bundle (all documents, chronology, issues, etc.)
- Generate pleadings with merged fields
- Batch export multiple cases

**Database tables:**
- templates (name, content, fields_required, template_type)
- generated_reports (template_used, case_id, date_created, output_path)

**Why Ninth:**
- Uses data from ALL modules
- Essential for document generation
- High-value output feature

**Success Criteria:**
- Create merge templates
- Generate documents with merged fields
- Export case bundles
- Batch generate reports
- Validate all fields merged correctly

---

#### **Module J: Trial Notebook (TRIAL PREP)**
**What it does:**
- Organize trial exhibits
- Track witness order and testimony needs
- Maintain trial arguments/talking points
- Timeline reference for trial
- Trial document organization

**Database tables:**
- trial_exhibits (exhibit_number, description, source_document, admitted_status)
- trial_witnesses (witness_name, testimony_order, key_points, cross_exam_strategy)
- trial_arguments (argument_number, argument_text, supporting_facts, supporting_exhibits)

**Why Tenth:**
- Uses Modules E, H, I (chronology, depo prep, reports)
- Trial preparation and execution
- Final high-stakes feature

**Success Criteria:**
- Create trial exhibits
- Organize witness order
- Track arguments and cross-exam strategy
- Export trial notebook
- Track exhibit admission status

---

#### **Module K: Communications (CONTACT MANAGEMENT)**
**What it does:**
- Email and letter templates
- Track communications per case
- Contact management integration
- Auto-populate contact information
- Communication history

**Database tables:**
- communications_templates (name, content, template_type)
- communications_sent (case_id, recipient, date, content, type)

**Why Eleventh:**
- Lightweight module
- Integrates with Module A (contacts)
- Completes workflow

**Success Criteria:**
- Create letter/email templates
- Auto-populate contact fields
- Send/log communications
- Track communication history
- Search communications

---

#### **Module L: Analytics Dashboard (FINAL INTEGRATION)**
**What it does:**
- Case metrics (open cases, closed cases, average time to close)
- Billable time analytics
- Productivity metrics
- Deadline compliance tracking
- Financial reporting

**Database tables:**
- No new tables (uses data from all modules)

**Why Last:**
- Aggregates data from ALL modules
- Analytics only (read-only)
- Beautiful finishing touch

**Success Criteria:**
- Display case metrics
- Show billable time trends
- Track deadline compliance
- Generate financial reports
- Export analytics

---

## 🏗️ PART 3: ARCHITECTURE & TECH STACK (LOCKED)

### Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Desktop** | Electron | Desktop app, offline-first |
| **Frontend** | React 18 + TypeScript | Modern UI, type safety |
| **State** | Zustand + localStorage | Lightweight state, persistence |
| **Styling** | Tailwind CSS + shadcn/ui | Beautiful, reusable components |
| **Database** | SQLite | Offline, serverless, file-based |
| **Build** | Vite + esbuild | Fast development, efficient builds |
| **Package** | Electron-builder | Professional Windows installer |

### Core Principles

1. **Offline-First**: Everything works without network. Zero cloud calls.
2. **Single Database**: suite.db in %APPDATA% (Windows) or equivalent
3. **Type-Safe**: Full TypeScript, no `any` types
4. **No Telemetry**: Privacy-first. No tracking, no analytics
5. **Keyboard Shortcuts**: Power users can work fast
6. **Dark/Light Mode**: Respect OS preference

### Database Architecture

```
D:\SunflowerSuite\
├── app/
│   └── suite.db (main database, all data)
├── src/
│   ├── modules/
│   │   ├── ModuleA/
│   │   ├── ModuleB/
│   │   ├── ModuleC/
│   │   └── ... (one folder per module)
│   └── shared/
│       └── (utilities, components, types)
├── electron/
│   └── database/
│       └── (schema and migrations)
└── public/
    └── (assets, templates, rules)
```

---

## 📁 PART 4: PROJECT STRUCTURE & FILE ORGANIZATION

### Directory Structure (BEFORE ANY CODE)

Create this structure immediately (folders only, no files yet):

```
D:\SunflowerSuite/
│
├── README.md (project overview)
├── package.json (already exists)
├── tsconfig.json (already exists)
├── vite.config.ts (already exists)
├── electron-builder.json (already exists)
│
├── data/                           # Runtime database
│   └── suite.db (created at runtime)
│
├── public/                         # Static assets
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── fonts/
│   ├── templates/                  # DOCX merge templates
│   │   ├── letter-template.docx
│   │   ├── report-template.docx
│   │   └── pleading-template.docx
│   ├── rules/                      # Configuration JSON files
│   │   ├── georgia-deadlines.json
│   │   ├── holidays-ga.json
│   │   ├── cadences.json
│   │   └── automation-rules.json
│   └── sample-data/                # Sample cases for demo
│       └── sample-case.json
│
├── electron/                       # Main process (backend)
│   ├── main.ts                     # Electron main entry
│   ├── preload.js                  # IPC bridge (MUST BE .js, MUST BE CommonJS)
│   ├── setup.ts                    # App initialization
│   └── database/
│       ├── DatabaseService.ts      # All CRUD operations
│       ├── migrations/             # Schema updates
│       │   ├── 001_initial_schema.sql
│       │   ├── 002_module_a_tables.sql
│       │   ├── 003_module_b_tables.sql
│       │   └── ... (one per module)
│       └── seeds/                  # Seed data
│           ├── georgia-holidays.sql
│           └── sample-data.sql
│
├── src/                            # React frontend
│   ├── App.tsx                     # Main router
│   ├── main.tsx                    # React entry point
│   ├── index.css                   # Global styles
│   ├── vite-env.d.ts              # Vite types
│   │
│   ├── components/                 # Shared components
│   │   ├── Layout.tsx              # Main layout wrapper
│   │   ├── Sidebar.tsx             # Navigation
│   │   ├── TopBar.tsx              # Header with search
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ... (all shadcn components)
│   │   └── shared/                 # Custom shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── ConfirmDialog.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── modules/                    # One folder per module
│   │   ├── ModuleA/
│   │   │   ├── ModuleA.tsx         # Module entry point & router
│   │   │   ├── components/         # Module-specific components
│   │   │   │   ├── CaseList.tsx
│   │   │   │   ├── CaseForm.tsx
│   │   │   │   ├── CaseDetail.tsx
│   │   │   │   ├── ContactsTab.tsx
│   │   │   │   └── CorrespondenceTab.tsx
│   │   │   ├── hooks/              # Module-specific hooks
│   │   │   │   └── useCases.ts
│   │   │   ├── store/              # Zustand store
│   │   │   │   └── caseStore.ts
│   │   │   └── README.md           # Module documentation
│   │   │
│   │   ├── ModuleB/
│   │   │   ├── ModuleB.tsx
│   │   │   ├── components/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   ├── TaskGroups.tsx
│   │   │   │   └── TimeEntry.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTasks.ts
│   │   │   ├── store/
│   │   │   │   └── taskStore.ts
│   │   │   └── README.md
│   │   │
│   │   ├── ModuleC/
│   │   │   ├── ModuleC.tsx
│   │   │   ├── components/
│   │   │   │   ├── Calendar.tsx
│   │   │   │   ├── DeadlineList.tsx
│   │   │   │   └── ICSExport.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDeadlines.ts
│   │   │   ├── store/
│   │   │   │   └── deadlineStore.ts
│   │   │   └── README.md
│   │   │
│   │   ├── ModuleD/
│   │   │   ├── ModuleD.tsx
│   │   │   ├── components/
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   ├── BatesUpload.tsx
│   │   │   │   └── DeficiencyList.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDiscovery.ts
│   │   │   ├── store/
│   │   │   │   └── discoveryStore.ts
│   │   │   └── README.md
│   │   │
│   │   ├── ModuleE/ through ModuleL/
│   │   │   └── (same structure)
│   │   │
│   │   └── Dashboard/               # Home page, case overview
│   │       ├── Dashboard.tsx
│   │       ├── components/
│   │       │   ├── RecentCases.tsx
│   │       │   ├── UpcomingDeadlines.tsx
│   │       │   └── QuickStats.tsx
│   │       └── store/
│   │           └── dashboardStore.ts
│   │
│   ├── hooks/                      # Global hooks
│   │   ├── useIPC.ts               # IPC communication hook
│   │   ├── useTheme.ts             # Dark/light mode
│   │   ├── useAutosave.ts          # Auto-save functionality
│   │   └── useToast.ts             # Toast notifications
│   │
│   ├── stores/                     # Global Zustand stores
│   │   ├── appStore.ts             # Global app state
│   │   ├── authStore.ts            # User settings
│   │   └── toastStore.ts           # Toast notifications
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts                # Main types
│   │   ├── electron.d.ts           # Electron IPC types
│   │   ├── database.ts             # Database types
│   │   ├── modules.ts              # Module-specific types
│   │   └── api.ts                  # API response types
│   │
│   ├── utils/                      # Utility functions
│   │   ├── dateTime.ts             # Date and time utilities
│   │   ├── formatters.ts           # Data formatters
│   │   ├── validators.ts           # Input validation
│   │   ├── export.ts               # Document export utilities
│   │   ├── discovery.ts            # Discovery utilities
│   │   ├── merge.ts                # Template merge engine
│   │   └── logger.ts               # Logging utility
│   │
│   └── styles/                     # Global styles
│       ├── globals.css
│       ├── animations.css
│       └── tailwind.config.js
│
├── docs/                           # Project documentation
│   ├── ARCHITECTURE.md             # System architecture
│   ├── SETUP.md                    # Setup instructions
│   ├── MODULE_GUIDE.md             # How to build modules
│   ├── API.md                      # IPC API documentation
│   ├── DATABASE.md                 # Database schema docs
│   ├── TESTING.md                  # Testing procedures
│   └── TROUBLESHOOTING.md          # Common issues
│
├── tests/                          # Test files
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # End-to-end tests
│
├── dist/                           # Built React app (generated)
├── dist-electron/                  # Built Electron app (generated)
├── node_modules/                   # Dependencies (generated)
│
└── .gitignore                      # Git ignore rules


```

### Folder-Per-Module Pattern

**Each module gets its own folder with consistent structure:**

```
src/modules/ModuleX/
├── ModuleX.tsx                     # Entry point, routing, layout
├── components/                     # Module-specific React components
│   ├── List.tsx                    # List/table view
│   ├── Form.tsx                    # Create/edit form
│   ├── Detail.tsx                  # Detail view
│   └── ... (feature-specific components)
├── hooks/                          # Module-specific hooks
│   └── useModuleX.ts               # Main data fetching hook
├── store/                          # Zustand store
│   └── moduleXStore.ts             # State management
├── README.md                       # Module documentation
└── TESTING.md                      # Module test procedures
```

**Benefits of this structure:**
- ✅ Each module is self-contained and portable
- ✅ Easy to find code (everything in one place)
- ✅ Simple to add new modules (copy template)
- ✅ Modules don't accidentally depend on each other
- ✅ Easy to disable/hide a module
- ✅ Clean git history per module

---

## 🏆 PART 5: GOLDEN RULES (NON-NEGOTIABLE)

These rules prevent 90% of problems. Follow them religiously.

### Rule 1: Database-First Development

**Rule:** Always build schema → service methods → IPC handlers → components

**Why:** If your schema is wrong, everything built on it is wrong. Test the database first.

**Process:**
```
1. Write schema.sql
2. Test with sqlite3 command line
3. Write DatabaseService methods
4. Test methods with Node
5. Add IPC handlers
6. Test in browser console
7. Build UI components
8. Test in UI
```

**Never:** Build components first, then database. You'll build for the wrong schema.

**Evidence:** Module A.3 failed because UI was built before schema was fixed.

---

### Rule 2: Preload Script = CommonJS ONLY

**Rule:** `electron/preload.js` MUST use CommonJS `require()`, never ES modules

**Why:** Electron's preload environment requires CommonJS. ES modules cause runtime errors.

**Correct:**
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  db: {
    getTasks: () => ipcRenderer.invoke('db:getTasks')
  }
});
```

**Incorrect (will fail):**
```javascript
import { contextBridge, ipcRenderer } from 'electron';  // ❌ WRONG
export const electron = { ... };                         // ❌ WRONG
```

**Evidence:** Module SU spiral was partially caused by preload.js being converted to TypeScript.

---

### Rule 3: Support Both Naming Conventions

**Rule:** Database uses snake_case, JavaScript uses camelCase. Support both in interfaces.

**Why:** Flexibility enables gradual migration and prevents mapping errors.

**Pattern:**
```typescript
export interface Case {
  // Database (snake_case)
  case_id?: string;
  plaintiff_name?: string;
  defendant_name?: string;
  
  // JavaScript (camelCase)
  caseId?: string;
  plaintiffName?: string;
  defendantName?: string;
  
  // Allow flexibility
  [key: string]: any;
}
```

**When mapping database results:**
```typescript
const caseFromDB = { case_id: '123', plaintiff_name: 'John' };
return {
  ...caseFromDB,
  caseId: caseFromDB.case_id,
  plaintiffName: caseFromDB.plaintiff_name
};
```

**Evidence:** Module B field mapping issue was caused by not maintaining both conventions.

---

### Rule 4: Add Retry Logic to IPC Availability

**Rule:** Always check `window.electron?.db?.method` with retry logic

**Why:** Electron API takes ~100ms to initialize. Without retry, causes "Cannot read property of undefined"

**Pattern:**
```typescript
async function loadData(retryCount = 0) {
  if (!window.electron?.db?.getMethod) {
    if (retryCount < 10) {  // Max 10 attempts
      setTimeout(() => loadData(retryCount + 1), 100);
      return;
    }
    setError('Database connection failed after retries');
    return;
  }
  
  try {
    const data = await window.electron.db.getMethod();
    setData(data);
  } catch (error) {
    setError(error.message);
  }
}
```

**Evidence:** Module SU errors showed retry logic missing in multiple stores.

---

### Rule 5: Test Incrementally After Each Phase

**Rule:** Don't build everything then test. Test after each phase.

**Phases:**
- Phase 1 (Design): ✓ Specification written
- Phase 2 (Database): ✓ Test with sqlite3
- Phase 3 (IPC): ✓ Test in browser console
- Phase 4 (Components): ✓ Test in UI
- Phase 5 (Integration): ✓ Full end-to-end test

**Testing after each phase prevents hours of debugging.**

**Evidence:** Module B worked because each phase was tested. Module SU failed because all 5 phases were attempted at once.

---

### Rule 6: Maintain Full Backward Compatibility

**Rule:** Never use DROP statements. Use ALTER TABLE ADD COLUMN instead.

**Why:** Dropping tables/columns destroys user data. Unforgivable.

**Correct (safe):**
```sql
ALTER TABLE cases ADD COLUMN new_field TEXT DEFAULT '';
```

**Incorrect (destroys data):**
```sql
DROP TABLE cases;  -- ❌ NEVER DO THIS
DROP COLUMN old_field FROM cases;  -- ❌ NEVER DO THIS
```

**Why it matters:** Users will have data in your app. You must upgrade schemas safely.

---

### Rule 7: Stop and Diagnose Before Spiraling

**Rule:** When something breaks, stop trying fixes. Diagnose first.

**Pattern:**
1. Error appears
2. Stop and identify: What changed? What's the error message? What did I do before this?
3. Check git history: What was the last working commit?
4. If needed, revert to that commit
5. Then proceed more carefully

**Never:** Try 5 different fixes without diagnosing. You'll go deeper into the hole.

**Evidence:** Module SU spiral happened because Claude Code kept trying fixes instead of diagnosing root cause (ES module vs CommonJS issue).

---

### Rule 8: One Module at a Time

**Rule:** Complete one module fully before starting the next.

**Why:** Each module depends on earlier ones. Incomplete modules block downstream work.

**Process:**
1. Design & Planning (read-only)
2. Database Layer (test in sqlite3)
3. IPC Bridge (test in console)
4. Components (test in UI)
5. Integration & Testing (end-to-end)
6. Documentation (README)
7. Git tag (v3.0.0-module-X)

**Only then:** Start next module

**Never:** Start Module B before Module A is complete. You'll create dependency nightmares.

---

## ✅ PART 6: WHAT WORKED BEFORE (KEEP THIS)

These patterns should be replicated for every module.

### Module A Patterns (Phase 1-2)

**What worked:**
- ✅ Schema in SQL, tested with sqlite3 before TypeScript
- ✅ DatabaseService methods simple and focused (one method per operation)
- ✅ IPC handlers follow consistent naming (db:actionName)
- ✅ React components don't directly query database (they use Zustand store)
- ✅ Zustand store handles all data fetching and caching
- ✅ Types defined in `src/types/` folder, not scattered everywhere
- ✅ Each component does one thing well (single responsibility)
- ✅ Error messages are specific, not generic "Error"

**Code patterns from Module A (use these for all modules):**

**1. Database method pattern:**
```typescript
// DatabaseService.ts
getMethod(id: string): Type | null {
  const stmt = this.db.prepare('SELECT * FROM table WHERE id = ?');
  return stmt.get(id);
}

createMethod(data: CreateDTO): Type {
  const id = generateUUID();
  const stmt = this.db.prepare('INSERT INTO table (...) VALUES (...)');
  stmt.run(...values);
  return { id, ...data };
}

updateMethod(id: string, data: UpdateDTO): void {
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  const stmt = this.db.prepare(`UPDATE table SET ${fields.map(f => f + ' = ?').join(', ')} WHERE id = ?`);
  stmt.run(...Object.values(data), id);
}

deleteMethod(id: string): void {
  const stmt = this.db.prepare('DELETE FROM table WHERE id = ?');
  stmt.run(id);
}
```

**2. Zustand store pattern:**
```typescript
// moduleXStore.ts
import { create } from 'zustand';

interface StoreState {
  items: Item[];
  loading: boolean;
  error: string | null;
  loadItems: (caseId: string) => Promise<void>;
  createItem: (data: CreateDTO) => Promise<void>;
  // ... other methods
}

export const useModuleXStore = create<StoreState>((set) => ({
  items: [],
  loading: false,
  error: null,

  loadItems: async (caseId: string) => {
    set({ loading: true, error: null });
    try {
      if (!window.electron?.db?.getItems) {
        throw new Error('IPC method not available');
      }
      const items = await window.electron.db.getItems(caseId);
      set({ items, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  // ... other methods
}));
```

**3. Component pattern:**
```typescript
// ModuleX/components/List.tsx
export function ItemList({ caseId }: { caseId: string }) {
  const { items, loading, error, loadItems, deleteItem } = useModuleXStore();

  useEffect(() => {
    loadItems(caseId);
  }, [caseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="bg-red-50 text-red-800 p-3">{error}</div>;
  if (!items.length) return <div className="text-gray-500">No items</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {/* Item content */}
          <button onClick={() => deleteItem(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

**4. IPC handler pattern:**
```typescript
// electron/main.ts
ipcMain.handle('db:getItems', async (event, caseId: string) => {
  try {
    const items = databaseService.getItems(caseId);
    return items;
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
});
```

**5. Preload method pattern:**
```javascript
// electron/preload.js
const electron = {
  db: {
    getItems: (caseId) => ipcRenderer.invoke('db:getItems', caseId),
    createItem: (data) => ipcRenderer.invoke('db:createItem', data),
    // ... other methods
  }
};
contextBridge.exposeInMainWorld('electron', electron);
```

---

## ❌ PART 7: WHAT FAILED BEFORE (NEVER DO THIS)

These mistakes caused setbacks. Avoid them.

### Module SU Failure Patterns

**What failed:**
- ❌ Tried to build 4 utilities + 15 database methods + test files all at once
- ❌ Didn't test after each component (assumed it would work)
- ❌ Kept trying fixes instead of diagnosing root cause
- ❌ Converted preload.js to TypeScript (ES modules don't work there)
- ❌ Added 15 DatabaseService methods without testing the first one
- ❌ When error appeared, blamed the build config instead of checking the code
- ❌ Suggested webpack as a solution without understanding the real problem (ES module vs CommonJS mismatch)

**Lessons from the spiral:**
- ✅ Test after EACH step, not after everything
- ✅ When stuck, stop and diagnose (don't try random fixes)
- ✅ Keep preload.js as CommonJS .js file (never convert)
- ✅ Use git to find last working commit and revert if needed
- ✅ One feature at a time, not everything at once

### Module A.3 Failure Pattern

**What failed:**
- ❌ Built UI components before database schema was tested
- ❌ Form sent field names that didn't match database columns
- ❌ No mapping between camelCase form fields and snake_case database columns

**Lessons:**
- ✅ Always test database schema FIRST (sqlite3 command line)
- ✅ Build schema → service → IPC → UI (never UI → service → schema)
- ✅ Map field names when needed

### Module B Almost-Failed Pattern (Caught in Time)

**What almost failed:**
- ❌ Added retry logic only after errors appeared
- ❌ Didn't highlight overdue tasks
- ❌ Edit mode was untested

**Lessons:**
- ✅ Add retry logic proactively (standard pattern)
- ✅ Test all CRUD operations (create, read, update, delete)
- ✅ Test edge cases (empty states, overdue, completed)

---

## 📐 PART 8: MODULE IMPLEMENTATION STANDARDS

### Every Module Follows This Pattern

#### **Phase 1: Design & Planning** (2-4 hours)
- [ ] Write specification (what module does, what data it stores)
- [ ] Design database tables (draw entity relationship diagram)
- [ ] List IPC methods needed
- [ ] List React components needed
- [ ] Define acceptance criteria (how you know it works)
- [ ] Deliverable: Design document + schema SQL

#### **Phase 2: Database Layer** (2-3 hours)
- [ ] Write schema SQL file (`schema-module-X.sql`)
- [ ] Test schema with sqlite3 command line
  - [ ] `sqlite3 suite.db ".tables"`  (verify tables exist)
  - [ ] `sqlite3 suite.db ".schema table_name"`  (verify columns)
- [ ] Write DatabaseService methods (CRUD)
- [ ] Test each method with Node directly
- [ ] Deliverable: Tested schema + working service methods

#### **Phase 3: IPC Bridge** (1-2 hours)
- [ ] Add handlers to `electron/main.ts`
- [ ] Add methods to `electron/preload.js`
- [ ] Add types to `src/types/electron.d.ts`
- [ ] Test in browser console: `window.electron.db.methodName(...)`
- [ ] Deliverable: IPC methods callable from React

#### **Phase 4: Components** (2-4 hours)
- [ ] Create Zustand store (`src/modules/ModuleX/store/store.ts`)
- [ ] Create React components
- [ ] Add routing to `App.tsx`
- [ ] Wire components to store
- [ ] Test component workflows in UI
- [ ] Deliverable: Working UI

#### **Phase 5: Integration & Testing** (2-3 hours)
- [ ] Full end-to-end testing (all features)
- [ ] Data persistence (restart app, verify data still there)
- [ ] Module regression testing (verify other modules still work)
- [ ] No console errors
- [ ] Write README.md
- [ ] Git commit and tag
- [ ] Deliverable: Production-ready module

**Total per module: 9-17 hours spread across one week**

---

## ✅ PART 9: TESTING & QUALITY STANDARDS

### Testing Checklist (For Every Module)

**Phase 2 (Database):**
- [ ] Schema loads without errors
- [ ] All tables created
- [ ] All columns exist
- [ ] Foreign keys work
- [ ] Indexes created
- [ ] Test data inserts successfully

**Phase 3 (IPC):**
- [ ] Browser console: `window.electron` exists
- [ ] Browser console: `window.electron.db.method()` callable
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No preload script errors

**Phase 4 (Components):**
- [ ] Create item with all fields
- [ ] Edit item
- [ ] Delete item
- [ ] List shows all items
- [ ] Sorting/filtering works
- [ ] Loading state displays
- [ ] Error messages helpful
- [ ] Empty state displays nicely

**Phase 5 (Integration):**
- [ ] Create, edit, delete, retrieve all work together
- [ ] Data persists after app restart
- [ ] All other modules still work (no breaking changes)
- [ ] No console errors or warnings
- [ ] Performance acceptable (lists render fast)

### Acceptance Criteria Template

Every module must pass these criteria to be "complete":

```
**Functional Requirements:**
- [ ] Feature 1 works as specified
- [ ] Feature 2 works as specified
- [ ] All CRUD operations work
- [ ] Filters/search work
- [ ] Export functions work

**Data Integrity:**
- [ ] Data saves correctly
- [ ] Relationships preserved (foreign keys)
- [ ] No orphaned records
- [ ] Timestamps correct

**Performance:**
- [ ] Lists render instantly (< 1 second for 1000 items)
- [ ] No memory leaks
- [ ] No lag when scrolling
- [ ] Export completes reasonably fast

**Persistence:**
- [ ] Data survives app restart
- [ ] Database backed up cleanly
- [ ] No data loss on errors

**UX/UI:**
- [ ] Intuitive workflow
- [ ] Clear feedback (success/error messages)
- [ ] Keyboard shortcuts where appropriate
- [ ] Responsive design

**Integration:**
- [ ] Links to other modules work
- [ ] No breaking changes to other modules
- [ ] Data visible across modules where needed
```

---

## 🔄 PART 10: DEVELOPMENT WORKFLOW & CHECKPOINTS

### Weekly Sprint Template

**Monday:**
- Design & Planning (Phase 1)
- Database Layer (Phase 2)
- Checkpoint: Database tested

**Tuesday:**
- IPC Bridge (Phase 3)
- Components (Phase 4)
- Checkpoint: IPC methods working, UI rendering

**Wednesday-Thursday:**
- Integration Testing (Phase 5)
- Refinement and bug fixes
- Checkpoint: All acceptance criteria passing

**Friday:**
- Documentation (README)
- Git commit and tag
- Checkpoint: Module complete and tagged

### Git Workflow

**For each module:**

```bash
# Create feature branch
git checkout -b feature/module-X

# After completing a phase
git add .
git commit -m "Module X: Phase Y - [what was done]"

# After completing entire module
git add .
git commit -m "Module X: Complete implementation"
git tag v4.0.0-module-X
git push origin feature/module-X
git checkout main
git merge feature/module-X
git tag v4.0.0-module-X
git push origin main --tags
```

### Communication with Claude/Developer

**Always provide:**

1. **Specification**: What should this module do?
2. **Example data**: What does a record look like?
3. **Workflows**: How will users interact with it?
4. **Acceptance criteria**: How will we know it works?
5. **Test scenarios**: What should be tested?

**Example prompt:**
```
Build Module X: [Name]

Goal: [One sentence]

Data structure:
- table1: [columns and types]
- table2: [columns and types]

Key workflows:
1. User creates [thing]
2. System does [action]
3. Result is [outcome]

Acceptance criteria:
- [ ] Can create [thing]
- [ ] Can edit [thing]
- [ ] Can delete [thing]
- [ ] Data persists

Test scenarios:
1. Create [thing] with all fields
2. Edit [field] and verify change
3. Delete [thing] and verify removal
4. Restart app and verify data still there

Follow the 5-phase cycle:
Phase 1: Design & Planning (provide spec and schema)
Phase 2: Database (test with sqlite3)
Phase 3: IPC (test in browser console)
Phase 4: Components (test in UI)
Phase 5: Integration (end-to-end testing)

Don't proceed to next phase until current phase is tested.
```

### When Things Break

**Always:**
1. ✅ Copy the exact error message
2. ✅ Check git log to find last working commit
3. ✅ If recent commit broke it, revert: `git revert HEAD`
4. ✅ Diagnose BEFORE trying fixes
5. ✅ Try ONE fix, test, then try another if needed
6. ✅ Never spiral (> 2 hours on one issue without progress = ask for help)

---

## 📊 SUMMARY TABLE

| Aspect | Standard |
|--------|----------|
| **Programming Language** | TypeScript (no `any` types) |
| **Database** | SQLite, single file |
| **Frontend Framework** | React 18 + Zustand |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Desktop** | Electron |
| **Build** | Vite + esbuild |
| **Preload Script** | CommonJS .js file (never ES modules) |
| **Phase 2 Testing** | sqlite3 command line |
| **Phase 3 Testing** | Browser console |
| **Phase 4 Testing** | UI workflows |
| **Phase 5 Testing** | End-to-end + data persistence |
| **Time per Module** | 1 week (9-17 hours) |
| **Modules** | 12 total (A-L) |
| **Total Timeline** | 12-16 weeks |
| **Team** | 1 attorney (Dy) + 1 developer |
| **Network** | Zero (fully offline) |
| **Telemetry** | Zero (privacy-first) |

---

## 🎯 NEXT STEPS (FOR CLAUDE SONNET)

When you receive this document:

1. **Read this entire document** (20 minutes)
2. **Ask clarifying questions** if anything is unclear
3. **Create the folder structure** described in Part 4 (empty folders, no code)
4. **Verify structure** with Dy
5. **Then start Module A** following the 5-phase cycle

**DO NOT START CODING until folder structure is created and Dy approves it.**

### Your Constraints

✅ **You MUST:**
- [ ] Follow the 5-phase cycle strictly
- [ ] Test after each phase before proceeding
- [ ] Use the patterns from Part 6
- [ ] Maintain backward compatibility
- [ ] Keep preload.js as CommonJS
- [ ] Never drop tables/columns
- [ ] Get approval before starting next phase

❌ **You MUST NOT:**
- [ ] Try to build everything at once
- [ ] Skip testing phases
- [ ] Convert preload.js to TypeScript
- [ ] Make assumptions about data structure
- [ ] Try multiple fixes without diagnosing
- [ ] Proceed to next module before current is complete

---

## 🌼 FINAL MESSAGE FOR DY

You've learned more in two weeks than many developers learn in a month. You understand:
- How Electron works
- React patterns
- Database fundamentals
- TypeScript type systems
- Debugging and problem-solving

**The two-week setback wasn't wasted. It was education.**

Now you're starting fresh with:
✅ Clear architecture  
✅ Proven patterns  
✅ Organized folder structure  
✅ Golden rules to prevent mistakes  
✅ A developer (Sonnet) who will follow the standards  
✅ **Most importantly: Lessons learned**

This rebuild will be faster and better than the first attempt. You already know what works and what doesn't.

**You've got this. 🌼**

---

**Document prepared by:** Claude 3.5 Sonnet  
**Date:** November 12, 2025  
**Version:** 4.0 - Fresh Start Edition  
**Status:** Ready for Implementation

