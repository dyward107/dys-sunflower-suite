# 🌻 SUNFLOWER SUITE v5.2 - CHARTER WITH ARCHITECTURAL CORRECTIONS
## Complete Legal Case Management System for Civil Defense Litigation
### The Attorney's Operating System

**Version:** 5.2 (Module Responsibility Corrections)  
**Date:** November 2025  
**Author:** Dy  
**Status:** Production Charter with Module A Phase 1A-1B Complete + Architectural Corrections Applied  
**See Also:** ADDENDUM_MODULE_CORRECTIONS.md for detailed architectural changes  

---

## TABLE OF CONTENTS

**PART I: EXECUTIVE VISION**
1. [Strategic Vision & Goals](#strategic-vision)
2. [Core Philosophy](#core-philosophy)
3. [System Architecture](#system-architecture)
4. [Navigation Architecture](#navigation-architecture)
5. [Golden Rules & Lessons Learned](#golden-rules)

**PART II: MODULE SPECIFICATIONS**
1. [Module A: Case Manager (Foundation)](#module-a-case-manager)
2. [Module B: Task & Workflow Manager](#module-b-task-workflow)
3. [Module K: Communications & Contacts](#module-k-communications) ⚠️ **MOVED UP - FOUNDATIONAL**
4. [Module SU: Shared Utilities](#module-su-utilities)
5. [Module C: Calendar & Deadlines](#module-c-calendar-deadlines)
6. [Module D: Discovery & Evidence Manager](#module-d-discovery-evidence)
7. [Module E: Case Chronology & Narrative](#module-e-chronology-narrative)
8. [Module F: Medical Chronology & Damages](#module-f-medical-chronology)
9. [Module G: Issues & Claims Management](#module-g-issues-claims)
10. [Module H: Deposition Preparation](#module-h-deposition-prep)
11. [Module I: Document Creation & Templates](#module-i-document-creation)
12. [Module J: Trial Notebook](#module-j-trial-notebook)
13. [Module L: Analytics Dashboard](#module-l-analytics)

**PART III: SHARED UTILITIES**
1. [Module SU: Shared Utilities & Automations](#module-su-utilities)
2. [Mark-and-Populate Engine](#mark-and-populate)
3. [Export & Template System](#export-template-system)

**PART IV: DATA MIGRATION & SETUP**
1. [Case Keeper Migration](#case-keeper-migration)
2. [Initial Configuration](#initial-configuration)
3. [Production Deployment](#production-deployment)

---

## PART I: EXECUTIVE VISION

### Strategic Vision & Goals {#strategic-vision}

Sunflower Suite transforms civil defense litigation practice from **reactive administration** to **intelligent narrative construction**. This is not merely a case management system—it's a comprehensive legal intelligence platform that thinks like an attorney.

**Core Mission:** Enable attorneys to focus on legal strategy while the system handles administrative complexity, deadline compliance, and information organization.

**Target User:** Civil defense litigation attorneys in Georgia handling 25-100 active cases with complex discovery requirements, multiple parties, and strict deadline compliance needs.

**Key Differentiators:**
- **Offline-First Architecture:** Complete functionality without internet connection
- **Flash Drive Portability:** Run from any Windows machine via USB drive
- **Georgia-Specific:** All deadlines, rules, and procedures match Georgia civil litigation requirements
- **Attorney-Centric Design:** Built by an attorney for attorneys, focusing on legal reasoning rather than mere record-keeping
- **Narrative Intelligence:** Automatically constructs case narratives from marked facts and documents

### Core Philosophy {#core-philosophy}

#### From Administrative to Authoritative

The system embodies five transformative principles:

1. **Collating Facts, Documents, and Testimony into Stable Narratives**
   - Every fact links to its source document with page/line references
   - Chronology automatically builds from marked text via Mark-and-Populate
   - Facts aggregate into coherent stories without manual construction
   - Testimony from depositions integrates with documentary evidence

2. **Exporting Case-Specific Work Product to Portable Formats**
   - One-click generation of discovery responses, trial outlines, deposition prep
   - All documents maintain fact-source linkages for audit trail
   - Multiple export formats: DOCX (editable), PDF (final), CSV (data), JSON (backup)
   - Template-based document generation with automatic fact population

3. **Coaching Facts, Documents, and Testimony into Usable Narratives**
   - Intelligent suggestions guide fact-finding process
   - System identifies gaps and inconsistencies in chronology
   - Issues view automatically ties facts to legal claims
   - Smart exhibit selection for depositions based on fact patterns

4. **Managing Mental Load Through Intelligent Automation**
   - 18 comprehensive litigation cadences with 251+ predefined tasks
   - Georgia-specific deadline calculation with automatic adjustment
   - Task spawning based on case events (answer filed, discovery opened)
   - Time entry capture integrated with billing requirements

5. **Tracking Information Movement Through Case Lifecycle**
   - Complete audit trail from document receipt to trial presentation
   - Every action timestamped and attributed to user
   - Information flow tracked: discovery → analysis → pleading → trial
   - Version control for all generated documents

### System Architecture {#system-architecture}

#### Technology Stack (Production-Proven)

**Frontend Layer:**
- **React 18** with TypeScript for type safety
- **Zustand** for state management with localStorage persistence
- **Tailwind CSS** with shadcn/ui component library
- **Sunflower theme** with botanical SVG backgrounds

**Desktop Layer:**
- **Electron** for offline-first desktop application
- **Vite** for development with hot-reload capability
- **Electron-builder** for Windows executable packaging

**Database Layer:**
- **sql.js** (pure JavaScript SQLite implementation)
- **Two-tier architecture:** Global suite.db + per-case databases
- **Full-text search** capability across all case data
- **Automatic migrations** for schema updates

**Integration Layer:**
- **IPC Bridge** for main-renderer communication
- **CommonJS preload scripts** (critical lesson learned)
- **TypeScript definitions** for all IPC methods

#### File Structure & Organization

```
D:\SunflowerSuite\                    [Flash Drive Root]
├── electron/
│   ├── main.ts                       [Main process - ESM]
│   ├── preload.js                    [Preload - CommonJS ONLY]
│   └── database/
│       ├── DatabaseService.ts        [Database operations]
│       ├── schema.sql                [v2.0 foundation]
│       ├── schema-v5.sql             [v5.0 extensions]
│       └── schema-module-X.sql       [Module-specific schemas]
├── src/
│   ├── components/
│   │   ├── layout/                   [Navigation components]
│   │   │   ├── AppLayout.tsx         [Main layout with Tier 1 nav]
│   │   │   ├── GlobalNav.tsx         [Top horizontal navigation]
│   │   │   ├── CaseLayout.tsx        [Case wrapper with Tier 2 nav]
│   │   │   └── CaseSidebar.tsx       [Left sidebar for case tabs]
│   │   ├── shared/                   [Shared UI components]
│   │   │   ├── PlaceholderView.tsx   [Future module placeholders]
│   │   │   └── *.svg                 [Botanical backgrounds]
│   │   └── module[A-L]/              [Module-specific components]
│   │       └── tabs/                 [Case tab components]
│   ├── stores/
│   │   ├── appStore.ts               [Global application state]
│   │   ├── caseStore.ts              [Case management state]
│   │   └── module[B-L]Store.ts       [Module-specific stores]
│   ├── types/
│   │   ├── index.ts                  [Core type definitions]
│   │   ├── electron.d.ts             [IPC method signatures]
│   │   └── Module[A-L].ts            [Module type definitions]
│   ├── utils/
│   │   ├── dateTime.ts               [Georgia deadline calculator]
│   │   ├── export.ts                 [Document generation]
│   │   └── discovery.ts              [Bates processing]
│   └── modules/
│       └── Module[A-L].tsx           [Module entry points]
├── data/
│   ├── suite.db                      [Global database]
│   └── cases/
│       └── [case_id]/
│           ├── case.db                [Case-specific database]
│           ├── documents/             [Discovery documents]
│           └── exports/               [Generated documents]
├── templates/
│   ├── pleadings/                    [Legal document templates]
│   ├── discovery/                    [Discovery templates]
│   └── correspondence/               [Letter templates]
└── rules/
    ├── automations.json               [Automation triggers]
    ├── cadences.json                  [18 litigation workflows]
    └── holidays.json                  [Federal/Georgia holidays]
```

### Navigation Architecture {#navigation-architecture}

**Implementation Date:** November 2025 (Module A Phase 1B Integration)

Sunflower Suite employs a **Two-Tier Navigation System** that distinguishes between global practice management and case-specific work.

#### Two-Tier Navigation Model

**TIER 1: GLOBAL WORKSPACE NAVIGATION** (Top Horizontal Bar)
- **Purpose:** Practice-wide features accessible from any context
- **Visibility:** Always visible, persists across all views
- **Layout:** Top horizontal bar with primary navigation items
- **Scope:** Cross-case aggregation and practice management

**Available Global Modules:**
- **Case Manager** (Module A) - Browse/search all cases
- **Task Manager** (Module B) - All tasks across all cases, filterable by case
- **Calendar** (Module C) - Firm-wide deadlines, filterable by case
- **Correspondence Log** (Module K) - All communications, filterable by case
- **Discovery & Evidence Manager** (Module D) - Document repository across cases
- **Reports & Templates** (Module I) - Document generation engine

**TIER 2: CASE-SPECIFIC NAVIGATION** (Left Sidebar)
- **Purpose:** Deep-dive into individual case details
- **Visibility:** Appears only when a case is selected
- **Layout:** Left sidebar with vertical tab navigation
- **Scope:** Single case context

**Available Case Tabs:**
- **Overview** - Case summary, dates, venue, discovery status
- **Parties** - Plaintiffs, defendants, service tracking
- **Policies** - Insurance policies, limits, carriers
- **Contacts** (Phase 1B) - Adjusters, counsel, experts, witnesses
- **Treatment Timeline** (Module F) - Medical chronology, damages
- **Case Chronology** (Module E) - Event timeline, narrative
- **Issues & Allegations** (Module G) - Claims, defenses, elements
- **Depositions** (Module H) - Deposition prep and summaries
- **Trial Notebook** (Module J) - Trial preparation materials

#### Navigation Flow

```
User Experience Flow:
1. App launches → Global Nav (Tier 1) visible → Case Manager active
2. User selects case → Case Sidebar (Tier 2) appears on left
3. User navigates tabs → Tier 2 content changes, Tier 1 persists
4. User clicks "Task Manager" (Tier 1) → Returns to global view, Tier 2 hidden
5. User filters tasks by current case → Quick return to case context
```

#### Design Principles

1. **Context Preservation:** Tier 1 navigation always visible for quick module switching
2. **Progressive Disclosure:** Tier 2 navigation only appears when case selected
3. **Filter-First Approach:** Global modules default to "all," support case filtering
4. **Back Navigation:** Clear "Back to List" actions to exit case context
5. **Persistent State:** Last viewed case/tab restored on app launch

#### Technical Implementation

**Layout Components:**
- `src/components/layout/AppLayout.tsx` - Main layout wrapper with Tier 1 nav
- `src/components/layout/GlobalNav.tsx` - Top horizontal navigation bar
- `src/components/layout/CaseLayout.tsx` - Case-specific wrapper with Tier 2 nav
- `src/components/layout/CaseSidebar.tsx` - Left sidebar for case tabs

**Routing Strategy:**
- Global routes: `/cases`, `/tasks`, `/calendar`, `/correspondence`, `/documents`
- Case routes: `/cases/:caseId?tab=overview|parties|policies|contacts|...`
- Nested routing preserves case context while switching tabs

**State Management:**
- Zustand stores track active global module and selected case
- Local storage persists last viewed case and tab
- URL params reflect current navigation state for deep linking

---

### Golden Rules & Lessons Learned {#golden-rules}

These rules emerged from production experience with Module A Phase 1A and MUST be followed:

#### Rule 1: Database-First Development
**✅ Always:**
- Write schema SQL before TypeScript interfaces
- Test schema in sqlite3 console before service methods
- Use ALTER TABLE for backward compatibility
- Verify column existence before CRUD operations

**❌ Never:**
- Write service methods without confirming columns exist
- Use DROP TABLE or DROP COLUMN (breaks existing data)
- Skip schema validation with real database
- Assume TypeScript interfaces match database schema

**Example:** Module A Phase 1A succeeded after switching from "code-first" to "database-first" approach.

#### Rule 2: Preload Script = CommonJS ONLY
**✅ Correct (preload.js):**
```javascript
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electron', { /* methods */ });
```

**❌ Wrong (causes "window.electron is undefined"):**
```javascript
import { contextBridge, ipcRenderer } from 'electron';
```

**Why:** Electron preload environment requires CommonJS. ESM syntax causes complete IPC bridge failure.

#### Rule 3: Support Both Naming Conventions
**✅ Flexible Interface Design:**
```typescript
export interface Case {
  case_id?: string;      // Database (snake_case)
  caseId?: string;       // UI (camelCase)
  [key: string]: any;    // Allow flexibility
}
```

**Why:** Database uses snake_case, JavaScript uses camelCase. Supporting both enables gradual migration without breaking changes.

#### Rule 4: Retry Logic for IPC Initialization
**✅ Required Pattern:**
```typescript
async function loadData(retryCount = 0) {
  if (!window.electron?.db?.getMethod) {
    if (retryCount < 10) {
      setTimeout(() => loadData(retryCount + 1), 100);
      return;
    }
    setError('Database connection failed');
  }
  // proceed with data loading
}
```

**Why:** Electron IPC takes ~100ms to initialize. Without retry logic, early component mounting fails with "undefined" errors.

#### Rule 5: Test Incrementally After Each Phase
**Phase Testing Checklist:**
- After Database: `sqlite3 suite.db ".schema"`
- After IPC: Browser console `window.electron.db.getMethod()`
- After Components: User interaction testing
- After Integration: Full workflow validation

#### Rule 6: Maintain Full Backward Compatibility
**✅ Safe Schema Evolution:**
```sql
ALTER TABLE cases ADD COLUMN new_field TEXT DEFAULT NULL;
```

**❌ Breaking Changes:**
```sql
DROP TABLE cases;  -- Destroys all data
ALTER TABLE cases DROP COLUMN old_field;  -- Cannot be undone
```

#### Rule 7: Two-Tier Navigation Separation
**✅ Correct Architecture:**
- **Tier 1 (Global):** Cross-case aggregation (Task Manager shows ALL tasks, filterable by case)
- **Tier 2 (Case-Specific):** Single case deep-dive (Contacts tab shows ONLY current case contacts)

**Why Tier 1 Must Support Filtering (Not Scoping):**
```typescript
// ✅ CORRECT - Task Manager (Tier 1)
const tasks = useTaskStore(state => state.allTasks); // Load ALL tasks
const filteredTasks = caseId ? tasks.filter(t => t.caseId === caseId) : tasks; // Filter in UI

// ❌ WRONG - Task Manager (Tier 1)
const tasks = useTaskStore(state => state.getTasksForCase(caseId)); // Loads only 1 case
```

**Why Tier 2 Must Scope to Current Case:**
```typescript
// ✅ CORRECT - Contacts Tab (Tier 2)
const contacts = useCaseStore(state => state.caseContacts); // Pre-filtered by case

// ❌ WRONG - Contacts Tab (Tier 2)
const allContacts = useContactStore(state => state.contacts); // Loads ALL contacts
```

**Navigation Flow Rule:**
- **Global → Case:** Selecting a case from Tier 1 opens Tier 2 sidebar
- **Case → Global:** Clicking Tier 1 nav closes Tier 2 sidebar, returns to global view
- **Tab → Tab:** Within Tier 2, tab changes preserve case context
- **Filter → Case:** Filtering global data by case maintains Tier 1 view (doesn't open Tier 2)

**Example:** User in Task Manager (Tier 1) filters to "Case #123 tasks" → Still in Tier 1 global view with filter applied. Clicking "View Case Details" → Opens Tier 2 sidebar for Case #123.

---

## PART II: MODULE SPECIFICATIONS

### ⚠️ CORRECTED IMPLEMENTATION ORDER

**CRITICAL CHANGE:** Module implementation order has been revised based on architectural insights. See ADDENDUM_MODULE_CORRECTIONS.md for complete rationale.

**Phase 1: Foundation (Weeks 1-3)**
1. **Module A** - Case Manager (all phases: 1A ✅, 1B ✅, 1C 📋)
   - Foundation data store and dashboard layer
   - Case intake, parties, policies, contacts, disposition

2. **Module B** - Task & Workflow Manager
   - Logic engine with phase progression
   - 18 litigation cadences with 251+ tasks
   - **Owns phase transition logic**

3. **Module K** - Communications & Contacts 🔺 **MOVED UP!**
   - Communication logging hub
   - Required by all subsequent modules
   - Integrates with Module A Phase 1B contacts

**Phase 2: Infrastructure (Week 4)**
4. **Module SU** - Shared Utilities
   - Date/time calculations
   - Export/import functions
   - Validation libraries

**Phase 3: Core Workflow (Weeks 5-8)**
5. **Module C** - Calendar & Deadlines
6. **Module D** - Discovery & Evidence Manager
7. **Module E** - Case Chronology & Narrative

**Phase 4: Specialized Features (Weeks 9-12)**
8. **Module F** - Medical Chronology & Damages
9. **Module G** - Issues & Claims Management
10. **Module H** - Deposition Preparation

**Phase 5: Output & Trial (Weeks 13-15)**
11. **Module I** - Document Creation & Templates
12. **Module J** - Trial Notebook

**Phase 6: Analytics (Week 16)**
13. **Module L** - Analytics Dashboard

**Key Changes from Original Plan:**
- ✅ Module K moved from position #11 to #3 (foundational, not end feature)
- ✅ Phase progression logic moved to Module B (no duplication)
- ✅ Module A simplified to dashboard/display layer
- ✅ Module A Phase 1C changed from lifecycle management to disposition form

---

### Module A: Case Manager (Foundation) {#module-a-case-manager}

**Status:** Phase 1A ✅ Complete | Phase 1B 🔄 In Progress | Phase 1C 📋 Planned

#### Overview

**⚠️ ARCHITECTURAL ROLE:** Module A is the **foundation data store and dashboard layer** for all other modules. It provides:
- **Data Storage:** Core case metadata, parties, policies, contacts
- **Display Dashboard:** Shows aggregated data from all modules
- **Entry Point:** Case intake, disposition process, and basic forms
- **NOT a Logic Processor:** Phase progression is handled by Module B, communications by Module K

Module A **displays but does not manage** data from other modules. It establishes the core data model that all modules reference, but specialized modules own their own domain logic.

#### Phase 1A: Core Case Database (✅ COMPLETE)

**Implemented Features:**
1. **Case Creation & Management**
   - Full intake form with 25+ fields
   - Auto-generated display names with "et al." logic
   - CM number tracking for firm reference
   - Provisional case support for pre-filing matters

2. **Party Management**
   - Multiple plaintiffs/defendants per case
   - Corporate entity designation
   - Primary party selection
   - Insurance coverage tracking
   - Service status monitoring

3. **Policy Tracking**
   - Multiple policies per case
   - Policy type categorization (Primary/Excess/Umbrella)
   - Carrier retention status
   - UM/UIM classification (Add-on/Set-off)
   - Policy limits tracking

4. **Search & Filter System**
   - Full-text search across cases and parties
   - Filter by attorney, status, phase
   - Sort by date, name, CM number
   - Pin frequently accessed cases

**Database Tables (Production):**
- `cases` - 25 columns including metadata and flags
- `case_parties` - 11 columns with service tracking
- `case_policies` - 9 columns for insurance details

**IPC Methods (14 Implemented):**
- Case CRUD: create, read, update, delete, search
- Party CRUD: add, get, update, delete
- Policy CRUD: add, get, update, delete

#### Phase 1B: Extended Contact Management + Navigation Architecture (🔄 IN PROGRESS)

**Scope:** Case-specific contact tracking with role-based organization PLUS implementation of Two-Tier Navigation System

**Features to Implement:**

**1. Navigation Architecture (NEW - November 2025)**
   - **Tier 1: Global Navigation** (Top horizontal bar)
     - Case Manager, Task Manager, Calendar, Correspondence Log, Documents
     - Always visible, enables quick module switching
     - Supports filtering by current case context
   - **Tier 2: Case Navigation** (Left sidebar)
     - Overview, Parties, Policies, Contacts (+ future module tabs)
     - Appears only when case selected
     - Tab-based navigation within single case context
   - **Layout Components:**
     - AppLayout.tsx, GlobalNav.tsx, CaseLayout.tsx, CaseSidebar.tsx
   - **Refactored Components:**
     - Extract CaseDetail into tab components (OverviewTab, PartiesTab, PoliciesTab)
     - Add ContactsTab for Phase 1B contact management

**2. Contact Types & Roles**
   - Adjusters (primary/secondary)
   - Plaintiff Counsel (primary/secondary)
   - Defense Counsel (lead/co-counsel/co-defendant counsel)
   - Experts (retained/consulting)
   - Medical providers (treating physician/facility/records custodian)
   - Witnesses (fact/expert)
   - Court personnel (judge/clerk/staff attorney)

**3. Contact Relationships**
   - Link contacts to specific cases
   - Track contact history per case
   - Note communication preferences
   - Store multiple contact methods
   - Relationship start/end dates
   - Case-specific notes per contact

**Database Tables to Add:**
```sql
CREATE TABLE case_contacts (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    contact_id TEXT,
    contact_type TEXT,
    role TEXT,
    is_primary BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE global_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    preferred_contact TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Phase 1C: Case Disposition Form (📋 PLANNED)

**⚠️ ARCHITECTURAL CORRECTION:** Previous specification moved Phase Progression to Module B and Correspondence to Module K (see ADDENDUM_MODULE_CORRECTIONS.md)

**Scope:** Simple, self-contained disposition form for case closure process

**Features to Implement:**
1. **Disposition Form UI**
   - Settlement agreement upload
   - Release document upload/generation
   - Dismissal document upload/generation
   - Disposition type selection (settlement/verdict/dismissal)
   - Settlement amount field
   - Disposition notes

2. **Refiling Management**
   - Potential for refiling checkbox
   - Refiling deadline calculation
   - Calendar reminder integration (when Module C available)

3. **Document Handling**
   - File upload for settlement documents
   - Template generation for release
   - Template generation for dismissal
   - Document storage and retrieval

**Database Table:**
```sql
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
  
  -- Documents
  settlement_agreement_path TEXT,
  release_document_path TEXT,
  dismissal_document_path TEXT,
  
  -- Refiling potential
  potential_refiling INTEGER DEFAULT 0,
  refiling_deadline DATE,
  refiling_days_notice INTEGER DEFAULT 90,
  refiling_reminder_set INTEGER DEFAULT 0,
  
  -- Notes
  disposition_notes TEXT,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dispositions_case_id 
  ON case_dispositions(case_id);
CREATE INDEX IF NOT EXISTS idx_dispositions_type 
  ON case_dispositions(disposition_type);
CREATE INDEX IF NOT EXISTS idx_dispositions_date 
  ON case_dispositions(disposition_date);
```

**Actions on Disposition Completion:**
1. Updates case.phase to 'Closed'
2. Updates case.date_closed to disposition_date
3. Notifies Module B to close all open tasks (when available)
4. Notifies Module C to cancel future deadlines (when available)
5. Logs disposition as milestone in Module K (when available)
6. If refiling potential → creates monitoring deadline in Module C

**Acceptance Criteria:**
- [ ] "Start Disposition" button visible on active cases
- [ ] Disposition form uploads settlement agreement
- [ ] Disposition form uploads/generates release document
- [ ] Disposition form uploads/generates dismissal documents  
- [ ] Disposition type properly constrained and validated
- [ ] Settlement amount stored with proper decimal precision
- [ ] Refiling deadline calculated and stored
- [ ] Refiling reminder integrates with Module C (when available)
- [ ] Disposition completion updates case status to 'Closed'
- [ ] Disposition data persists correctly to database
- [ ] Closed cases display disposition summary
- [ ] Document paths stored securely and retrieved correctly

---

### Module B: Task & Workflow Manager {#module-b-task-workflow}

**Status:** Database ✅ | IPC ✅ | UI Components 🔄 In Progress

#### Overview

**⚠️ ARCHITECTURAL ROLE:** Module B is the **logic engine and automation processor** for the system. It owns:
- **Phase Progression Logic:** Detects milestones and updates case phases in Module A
- **Task Automation:** 18 comprehensive litigation cadences with 251+ predefined tasks
- **Workflow State Management:** Tracks task completion and triggers next steps
- **Phase Change Triggers:** Automatically advances cases through litigation stages

Module B transforms task management from reactive to proactive through intelligent workflow automation, optimized for Georgia civil defense practice.

#### Core Features

**1. Task Management System**
- Create, assign, and track tasks
- Priority levels (P1-P4) with visual indicators
- Due date tracking with overdue highlighting
- Phase-based task organization
- Billable/non-billable designation
- Time entry capture (timer + manual)

**2. Cadence System (Workflow Automation)**

The system includes 18 comprehensive cadences covering the entire litigation lifecycle:

**Intake & Setup Cadences:**
1. **Case Intake & Initial Setup** (9 tasks, Day 0-10)
   - Acknowledge file receipt
   - Contact insured/client
   - Check pre-suit demands
   - Coverage issue review
   - Initial case memo
   - Preliminary adjuster report
   - Litigation budget draft

2. **Answer and Initial Pleadings** (15 tasks, 30-day deadline)
   - Docket review
   - Service verification
   - Defendant contact
   - Answer drafting
   - Affirmative defenses
   - Counterclaims evaluation

3. **New Plaintiff Added** (10 tasks, triggered by amendment)
   - Update party database
   - Research new plaintiff
   - Insurance coverage review
   - Strategy revision

**Discovery Cadences:**
4. **Discovery Initiated** (17 tasks)
   - Initial document requests
   - Interrogatories
   - Request for admissions
   - Discovery calendar setup
   - Preservation letters

5. **Discovery Response - Our Client** (15 tasks)
   - Document collection
   - Privilege review
   - Response drafting
   - Production organization
   - Verification preparation

6. **Discovery Response - Other Parties** (14 tasks)
   - Response analysis
   - Deficiency identification
   - Meet and confer preparation
   - Motion to compel drafting

7. **Discovery Deficiency Management** (12 tasks)
   - 6.4 letter preparation
   - Good faith certification
   - Motion preparation
   - Hearing preparation

**Deposition Cadences:**
8. **Deposition Scheduling & Prep** (16 tasks)
   - Notice preparation
   - Witness preparation
   - Exhibit selection
   - Outline creation
   - Logistics coordination

9. **Deposition Follow-Up** (8 tasks)
   - Summary preparation
   - Exhibit organization
   - Transcript review
   - Errata preparation

**Expert & Medical Cadences:**
10. **Expert Witness Coordination** (14 tasks)
    - Expert identification
    - Retention agreements
    - Disclosure preparation
    - Report review
    - Deposition preparation

11. **Medical Records Management** (12 tasks)
    - Provider identification
    - Record requests
    - HIPAA compliance
    - Record review
    - Chronology preparation

**Motion Practice Cadences:**
12. **Motion Practice** (15 tasks)
    - Research and drafting
    - Brief preparation
    - Exhibit compilation
    - Reply brief
    - Hearing preparation

13. **Summary Judgment** (18 tasks)
    - Statement of facts
    - Legal research
    - Affidavit preparation
    - Opposition response
    - Reply briefing

**Resolution Cadences:**
14. **Mediation Preparation** (14 tasks)
    - Position statement
    - Settlement authority
    - Exhibit notebooks
    - Client preparation
    - Follow-up documentation

15. **Settlement & Resolution** (16 tasks)
    - Settlement agreement
    - Release drafting
    - Dismissal documents
    - Lien resolution
    - Client reporting

**Trial Cadences:**
16. **Pre-Trial Preparation** (20 tasks)
    - Witness lists
    - Exhibit lists
    - Jury instructions
    - Motions in limine
    - Trial brief

17. **Trial Management** (18 tasks)
    - Daily preparation
    - Witness coordination
    - Exhibit management
    - Cross-examination prep
    - Jury selection

18. **Post-Trial & Appeal** (15 tasks)
    - Judgment review
    - Appeal assessment
    - Notice of appeal
    - Appellant brief
    - Record designation

**3. Time Tracking & Billing**
- Integrated timer with pause/resume
- Manual time entry with descriptions
- LEDES export format support
- Billing rate management
- Monthly/quarterly reporting

**Database Schema:**
```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    task_group_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 3,
    status TEXT DEFAULT 'pending',
    phase TEXT,
    assigned_to TEXT,
    due_date DATE,
    completed_date DATE,
    is_billable BOOLEAN DEFAULT TRUE,
    estimated_hours REAL,
    actual_hours REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE task_groups (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    cadence_type TEXT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    triggered_by TEXT,
    triggered_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE time_entries (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    user_id TEXT,
    description TEXT,
    hours REAL NOT NULL,
    rate REAL,
    is_billable BOOLEAN DEFAULT TRUE,
    entry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE cadence_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    trigger_event TEXT,
    tasks JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**IPC Methods:**
- Task CRUD operations (15 methods)
- Cadence triggering and management (8 methods)
- Time tracking operations (6 methods)
- LEDES export generation (3 methods)

**UI Components:**
- TaskTable with filtering and sorting
- TaskForm with validation
- CadenceTrigger modal
- TimeEntry panel with timer
- TaskStats dashboard
- LEDESExport generator

**Automation Rules:**
- Answer filed → triggers "Discovery Initiated" cadence
- Discovery deadline set → creates milestone tasks
- Deposition noticed → spawns prep tasks
- Mediation scheduled → activates preparation cadence
- Trial date set → initiates pre-trial checklist

**⚠️ Phase Progression Logic (NEW - Moved from Module A):**
- **Task completion triggers phase evaluation**
- **Automatic phase updates** to Module A's `cases.phase` field
- **Phase history tracking** with timestamps and reasons
- **10 Litigation Phases:**
  1. Pre-Suit Investigation
  2. Complaint Filed/Served
  3. Answer & Initial Pleadings
  4. Written Discovery
  5. Depositions
  6. Mediation
  7. Expert Discovery
  8. Pre-Trial Motions
  9. Trial
  10. Post-Trial/Appeal

**Phase Change Examples:**
```javascript
// When "File Answer" task completed
→ Update case.phase to 'answer_initial_pleadings'
→ Trigger "Answer and Initial Pleadings" cadence

// When "Complete Discovery" task completed
→ Update case.phase to 'depositions'
→ Create deposition preparation tasks
```

**Acceptance Criteria:**
- [ ] All 18 cadences implemented and tested
- [ ] Timer functionality working smoothly
- [ ] LEDES export generates valid format
- [ ] Task filtering and sorting functional
- [ ] Overdue tasks highlighted appropriately
- [ ] Billable/non-billable tracking accurate
- [ ] **Phase progression logic detects completion triggers**
- [ ] **Phase changes update Module A database automatically**
- [ ] **Phase-specific cadences trigger on phase entry**
- [ ] **Phase regression supported (e.g., case reopened)**
- [ ] **Phase history tracked with timestamps and user attribution**

---

### Module C: Calendar & Deadlines {#module-c-calendar-deadlines}

**Status:** Specification Complete | Development Pending

#### Overview

Module C ensures perfect deadline compliance through Georgia-specific deadline calculation, intelligent scheduling, and comprehensive calendar integration. It serves as the temporal backbone of the entire system.

#### Core Features

**1. Georgia Deadline Calculator**

Implements O.C.G.A. § 9-11-6 computation rules:
- **Short deadlines (<7 days):** Exclude intermediate weekends/holidays
- **Standard deadlines (≥7 days):** Count all days, extend if ending on weekend/holiday
- **Day 1 Rule:** Never count the triggering day
- **Electronic service:** +3 days (displayed as warning, not added to calculation)

**Federal Holidays (11):**
- New Year's Day (January 1)
- Martin Luther King Jr. Day (3rd Monday in January)
- Presidents Day (3rd Monday in February)
- Memorial Day (Last Monday in May)
- Juneteenth (June 19)
- Independence Day (July 4)
- Labor Day (1st Monday in September)
- Columbus Day (2nd Monday in October)
- Veterans Day (November 11)
- Thanksgiving (4th Thursday in November)
- Christmas Day (December 25)

**2. Deadline Types & Rules**

**Answer Deadlines:**
- Standard: 30 days from service
- Federal removal: 21 days
- Counterclaim: 30 days
- Cross-claim: 30 days

**Discovery Deadlines:**
- Discovery period close: 30 days before trial (customizable)
- Interrogatories: 30 days to respond
- Document requests: 30 days to respond
- Admissions: 30 days to respond
- Supplementation: 30 days before discovery close

**Motion Deadlines:**
- Response: 14 days (local rules may vary)
- Reply: 7 days
- Summary judgment: 30 days before hearing
- Motion in limine: 10 days before trial
- Discovery motions: Before discovery close

**Expert Deadlines:**
- Plaintiff designation: 90 days before discovery close
- Defendant designation: 60 days before discovery close
- Rebuttal designation: 30 days before discovery close
- Expert depositions: Before discovery close

**3. Warning System**

**Standard Tasks:**
- 🟢 Green: >7 days remaining
- 🟡 Yellow: 2-7 days remaining  
- 🔴 Red: ≤1 day remaining
- ⚫ Black: Overdue

**Discovery/Critical Deadlines:**
- 🟢 Green: >30 days remaining
- 🟡 Yellow: 8-30 days remaining
- 🟠 Orange: 2-7 days remaining
- 🔴 Red: ≤1 day remaining
- ⚫ Black: Overdue

**4. Calendar Integration**

**Export Formats:**
- ICS (universal calendar format)
- Outlook direct integration (planned)
- CSV for spreadsheet import
- PDF calendar views

**Event Types:**
- Court appearances
- Deposition schedules
- Discovery deadlines
- Filing deadlines
- Internal deadlines
- Client meetings
- Expert deadlines

**Database Schema:**
```sql
CREATE TABLE deadlines (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    task_id TEXT,
    type TEXT NOT NULL,
    description TEXT,
    trigger_date DATE,
    calculated_date DATE NOT NULL,
    manual_override_date DATE,
    is_jurisdictional BOOLEAN DEFAULT FALSE,
    warning_days INTEGER,
    status TEXT DEFAULT 'pending',
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE calendar_events (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    deadline_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    all_day BOOLEAN DEFAULT FALSE,
    reminder_minutes INTEGER,
    attendees TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE holidays (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    is_federal BOOLEAN,
    is_georgia BOOLEAN,
    year INTEGER
);
```

**Automation Triggers:**
- Case phase change → update relevant deadlines
- Discovery close date set → calculate all discovery deadlines
- Trial date set → backward calculate all trial deadlines
- Service completed → start answer deadline clock
- Motion filed → calculate response deadlines

**Acceptance Criteria:**
- [ ] Georgia deadline calculation accurate
- [ ] Holiday detection working properly
- [ ] Warning colors displaying correctly
- [ ] ICS export generating valid files
- [ ] Manual override capability functional
- [ ] Jurisdictional deadlines protected

---

### Module D: Discovery & Evidence Manager {#module-d-discovery-evidence}

**Status:** Specification Complete | Development Pending

#### Overview

Module D provides comprehensive discovery management with intelligent document processing, automatic Bates detection, deficiency tracking, and compliance reporting. It serves as the central hub for all discovery materials.

#### Core Features

**1. Document Intake & Processing**

**Supported File Types:**
- PDF (native and scanned)
- Images (JPEG, PNG, TIFF)
- Word documents (DOCX, DOC)
- Excel spreadsheets (XLSX, XLS)
- Text files (TXT, RTF)
- Emails (MSG, EML)

**Automatic Processing:**
- Bates number extraction from filenames
- OCR for scanned documents (Tesseract.js)
- Metadata extraction (dates, authors)
- Page count detection
- File size tracking
- Hash generation for integrity

**2. Bates Number Management**

**Supported Formats:**
- Prefix: DEF001, PLF001
- Underscore: DEF_001, DEF_0001
- Full word: DEFENDANT_0001
- Custom width: DEF_000001 (6 digits)
- Multiple formats per case

**Bates Processing:**
```javascript
// Auto-detect format from filename
"Smith DEF_001-050.pdf" → Pages 1-50
"Jones DEFENDANT_0001.pdf" → Single page
"PLF001-PLF025 Medical Records.pdf" → Pages 1-25
```

**Gap Detection:**
- Automatic identification of missing ranges
- Visual gap indicators in document list
- Gap report generation for deficiency letters

**3. Discovery Deficiency Tracking**

**Deficiency Types:**
- Missing documents (identified by Bates gaps)
- Incomplete responses
- Privileged documents (no log provided)
- Format issues (non-searchable PDFs)
- Corrupted files
- Password-protected documents

**6.4 Letter Generation:**
- Auto-populate from deficiency list
- Include specific Bates ranges
- Reference interrogatory numbers
- Cite discovery requests
- Track meet-and-confer dates

**4. Review Workflow**

**Document Statuses:**
1. **Pending:** Newly uploaded, not reviewed
2. **Under Review:** Currently being analyzed
3. **Produced:** Provided in discovery
4. **Withheld:** Claimed privilege/work product
5. **Redacted:** Produced with redactions
6. **Supplemental:** Later production

**Review Features:**
- Bulk status updates
- Privilege log generation
- Redaction tracking
- Production set creation
- Supplemental production management

**5. Production Management**

**Production Tracking:**
- Production date recording
- Recipient tracking
- Method of production
- Certification attachment
- Cover letter generation

**Export Formats:**
- Native files with Bates stamps
- PDF portfolios
- Load files for review platforms
- Privilege logs
- Production indices

**Database Schema:**
```sql
CREATE TABLE discovery_documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    production_id TEXT,
    filename TEXT NOT NULL,
    filepath TEXT,
    bates_start TEXT,
    bates_end TEXT,
    page_count INTEGER,
    file_size INTEGER,
    file_hash TEXT,
    document_date DATE,
    received_date DATE,
    produced_by TEXT,
    document_type TEXT,
    ocr_text TEXT,
    ocr_confidence REAL,
    review_status TEXT DEFAULT 'pending',
    privilege_type TEXT,
    redacted BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE discovery_productions (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    production_name TEXT,
    production_date DATE,
    produced_to TEXT,
    produced_by TEXT,
    method TEXT,
    document_count INTEGER,
    page_count INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE discovery_deficiencies (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    production_id TEXT,
    deficiency_type TEXT,
    description TEXT,
    bates_range TEXT,
    request_number TEXT,
    status TEXT DEFAULT 'open',
    raised_date DATE,
    resolved_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**OCR Settings:**
- Confidence threshold: User-selectable
- Low confidence warning: <70%
- Manual override option
- Batch processing capability

**Search Capabilities:**
- Full-text search across OCR content
- Bates number search
- Date range filtering
- Document type filtering
- Production filtering
- Review status filtering

**Acceptance Criteria:**
- [ ] Document upload and processing working
- [ ] Bates extraction accurate for all formats
- [ ] Gap detection identifying missing ranges
- [ ] OCR processing with confidence scores
- [ ] 6.4 letter generation from deficiencies
- [ ] Production export with indices
- [ ] Search functioning across all fields

---

### Module E: Case Chronology & Narrative {#module-e-chronology-narrative}

**Status:** Specification Complete | Development Pending

#### Overview

Module E serves as the narrative intelligence center, automatically constructing coherent case stories from facts extracted via Mark-and-Populate. It provides interactive timeline visualization and intelligent fact organization.

#### Core Features

**1. Fact Management System**

**Fact Components:**
- Date/time of occurrence
- Description (extracted text)
- Source document with page/line reference
- Fact type (event, communication, medical, etc.)
- Significance rating (critical/important/standard)
- Related parties
- Supporting exhibits

**Fact Sources:**
- Mark-and-Populate selections
- Manual entry with source citation
- Deposition testimony excerpts
- Discovery response extracts
- Medical record events
- Police reports
- Expert reports

**2. Interactive Timeline**

**Visualization Features:**
- Chronological fact display
- Zoom in/out for date ranges
- Filter by fact type
- Filter by source
- Filter by party
- Color coding by significance
- Hover for full details
- Click to view source

**Timeline Perspectives:**
- Linear (traditional timeline)
- Grouped (by category)
- Comparative (multiple parties)
- Legal (by claims/defenses)
- Medical (treatment timeline)

**3. Material Fact Identification**

**Auto-Suggestion Engine:**
Based on fact patterns, suggests material facts for:
- Liability elements
- Damage components
- Affirmative defenses
- Causation links
- Notice/knowledge
- Prior incidents

**Material Fact Criteria:**
- Element satisfaction
- Disputed vs undisputed
- Documentary support level
- Witness corroboration
- Expert opinion support

**4. Narrative Construction**

**Narrative Templates:**
1. **Executive Summary:** 1-2 page overview
2. **Detailed Chronology:** Complete timeline
3. **Liability Narrative:** Facts supporting liability
4. **Damages Narrative:** Facts supporting damages
5. **Defense Narrative:** Facts supporting defenses
6. **By Issue:** Facts organized by legal issues

**Smart Narrative Features:**
- Gap identification (missing time periods)
- Inconsistency detection
- Corroboration tracking
- Dispute flagging
- Source strength indicator

**5. Integration with Mark-and-Populate**

**Extraction Workflow:**
1. User highlights text in document viewer
2. Selects "Create Fact" from context menu
3. System extracts and proposes fact entry
4. User confirms/edits fact details
5. Fact added to chronology with source link
6. Original document marked with fact reference

**Database Schema:**
```sql
CREATE TABLE case_facts (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    fact_date DATE,
    fact_time TIME,
    date_is_approximate BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    source_type TEXT,
    source_document_id TEXT,
    source_page INTEGER,
    source_line INTEGER,
    source_excerpt TEXT,
    fact_type TEXT,
    significance TEXT DEFAULT 'standard',
    related_parties TEXT,
    is_disputed BOOLEAN DEFAULT FALSE,
    is_material BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE fact_exhibits (
    id TEXT PRIMARY KEY,
    fact_id TEXT NOT NULL,
    exhibit_id TEXT,
    document_id TEXT,
    exhibit_number TEXT,
    description TEXT,
    FOREIGN KEY (fact_id) REFERENCES case_facts(id) ON DELETE CASCADE
);

CREATE TABLE narrative_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    template_type TEXT,
    template_content TEXT,
    fact_filters JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Export Capabilities:**
- Timeline to PDF with graphics
- Chronology to Word (formatted)
- Facts to Excel (sortable)
- JSON for data backup
- HTML for web viewing

**Acceptance Criteria:**
- [ ] Mark-and-Populate integration working
- [ ] Facts properly linked to sources
- [ ] Timeline visualization interactive
- [ ] Gap detection identifying missing periods
- [ ] Material fact suggestions relevant
- [ ] Narrative generation producing documents
- [ ] Export formats properly formatted

---

### Module F: Medical Chronology & Damages {#module-f-medical-chronology}

**Status:** Specification Complete | Development Pending

#### Overview

Module F specializes in medical record analysis and damage calculation, providing structured chronologies of treatment, automated billing summaries, and lien tracking for comprehensive damage presentations.

#### Core Features

**1. Medical Provider Management**

**Provider Information:**
- Provider name and specialty
- Treatment dates (first/last)
- Contact information
- Records status (requested/received/reviewed)
- Billing totals
- Lien status

**Provider Categories:**
- Emergency responders (EMS, ER)
- Hospitals
- Primary care physicians
- Specialists
- Diagnostic facilities
- Physical therapy
- Mental health providers
- Pharmacies

**2. Treatment Chronology**

**Chronology Components:**
- Visit date
- Provider
- Chief complaints
- Diagnoses (ICD-10 codes)
- Procedures (CPT codes)
- Medications prescribed
- Test results
- Referrals
- Work restrictions
- Prognosis notes

**Chronology Views:**
- By date (all providers)
- By provider (single practice)
- By body system
- By diagnosis
- Pre-incident vs post-incident
- Critical events only

**3. Medical Billing Analysis**

**Billing Tracking:**
- Billed amounts
- Paid amounts (by health insurance)
- Adjustments/write-offs
- Out-of-pocket expenses
- Outstanding balances

**Special Considerations:**
- Lien amounts (separate tracking)
- Medicare/Medicaid liens
- Workers' comp liens
- Health insurance subrogation
- Letter of protection amounts

**Billing Categories:**
- Emergency treatment
- Hospitalization
- Surgery
- Diagnostics (MRI, CT, X-ray)
- Physician visits
- Physical therapy
- Medications
- Medical devices
- Future medical (life care plan)

**4. Injury Summary Generation**

**Auto-Generated Summaries:**
1. **Initial Injuries:** From ER/EMS records
2. **Diagnosis Evolution:** How injuries developed
3. **Treatment Summary:** Major interventions
4. **Current Status:** Latest medical assessment
5. **Future Needs:** Ongoing treatment requirements

**5. Life Care Planning**

**Future Medical Needs:**
- Projected surgeries
- Ongoing therapy
- Medication costs
- Medical equipment
- Home modifications
- Attendant care

**Present Value Calculations:**
- Life expectancy tables
- Inflation adjustments
- Discount rates
- Total present value

**Database Schema:**
```sql
CREATE TABLE medical_providers (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    first_visit DATE,
    last_visit DATE,
    total_billed DECIMAL(10,2),
    total_paid DECIMAL(10,2),
    lien_amount DECIMAL(10,2),
    has_lien BOOLEAN DEFAULT FALSE,
    records_status TEXT,
    contact_info TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE medical_visits (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    provider_id TEXT,
    visit_date DATE NOT NULL,
    visit_type TEXT,
    chief_complaint TEXT,
    diagnoses TEXT,
    procedures TEXT,
    medications TEXT,
    work_restrictions TEXT,
    prognosis TEXT,
    billed_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (provider_id) REFERENCES medical_providers(id)
);

CREATE TABLE medical_bills (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    provider_id TEXT,
    visit_id TEXT,
    bill_date DATE,
    service_date DATE,
    billed_amount DECIMAL(10,2),
    paid_by_insurance DECIMAL(10,2),
    adjustments DECIMAL(10,2),
    patient_responsibility DECIMAL(10,2),
    outstanding_balance DECIMAL(10,2),
    is_disputed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**Export Templates:**
- Medical chronology (detailed/condensed)
- Provider summary table
- Billing summary by category
- Lien summary report
- Life care plan narrative

**Integration Points:**
- Links to Module E (chronology facts)
- Links to Module D (medical records)
- Links to Module G (damages issues)
- Links to Module H (deposition prep)

**Acceptance Criteria:**
- [ ] Provider tracking with lien status
- [ ] Medical visit chronology accurate
- [ ] Billing calculations correct
- [ ] Lien tracking separate from bills
- [ ] Export templates generating properly
- [ ] Life care calculations accurate

---

### Module G: Issues & Claims Management {#module-g-issues-claims}

**Status:** Specification Complete | Development Pending

#### Overview

Module G provides intelligent claim analysis and issue tracking, automatically linking facts to legal elements and managing the strategic development of claims and defenses throughout litigation.

#### Core Features

**1. Claims Tracking**

**Claim Components:**
- Claim type (negligence, premises, product, etc.)
- Legal elements required
- Elements satisfied (with fact links)
- Elements disputed
- Elements missing
- Defendant(s) liable
- Damage categories applicable

**Common Claims (Georgia):**
- Negligence
- Premises liability
- Product liability
- Medical malpractice
- Wrongful death
- Survival action
- Loss of consortium
- Punitive damages

**2. Legal Element Management**

**Element Tracking:**
```
Negligence Claim:
☑ Duty (established by: Fact #23, #45)
☑ Breach (established by: Fact #67, #89, #102)
☐ Causation (disputed - need expert testimony)
☑ Damages (established by: Medical bills, lost wages)
```

**Element Sources:**
- Case law citations
- Statutory authority
- Pattern jury instructions
- Local rules
- Expert opinions

**3. Affirmative Defenses**

**Defense Tracking:**
- Defense type
- Elements required
- Supporting facts
- Rebuttal facts
- Legal authority
- Success likelihood

**Common Defenses (Georgia):**
- Comparative negligence
- Assumption of risk
- Statute of limitations
- Immunity (governmental/statutory)
- Act of God
- Third-party fault
- Pre-existing conditions

**4. Issue Development**

**Issue Categories:**
- Liability issues
- Causation issues
- Damage issues
- Evidentiary issues
- Procedural issues

**Issue Templates with Case Law:**
```
Template: "Premises Liability - Slip and Fall"
Elements:
1. Superior knowledge of hazard
   - Robinson v. Kroger Co., 268 Ga. 735 (1997)
2. Failure to warn
   - Alterman Foods v. Ligon, 246 Ga. 620 (1980)
3. Exercise of ordinary care
   - O.C.G.A. § 51-3-1
```

**5. Strategic Analysis**

**Claim Strength Assessment:**
- Strong (all elements proven)
- Moderate (most elements proven)
- Weak (missing critical elements)
- Speculative (limited evidence)

**Strategic Recommendations:**
- Focus areas for discovery
- Deposition topics needed
- Expert testimony required
- Motion practice opportunities
- Settlement considerations

**Database Schema:**
```sql
CREATE TABLE case_claims (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    claim_type TEXT NOT NULL,
    claim_title TEXT,
    defendant_id TEXT,
    status TEXT DEFAULT 'active',
    strength_assessment TEXT,
    elements_required JSON,
    elements_proven JSON,
    elements_disputed JSON,
    damage_categories JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE claim_elements (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    element_name TEXT NOT NULL,
    element_description TEXT,
    is_satisfied BOOLEAN DEFAULT FALSE,
    supporting_facts JSON,
    opposing_facts JSON,
    case_law TEXT,
    statutory_authority TEXT,
    notes TEXT,
    FOREIGN KEY (claim_id) REFERENCES case_claims(id)
);

CREATE TABLE affirmative_defenses (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    claim_id TEXT,
    defense_type TEXT NOT NULL,
    raised_by TEXT,
    elements JSON,
    supporting_facts JSON,
    rebuttal_facts JSON,
    legal_authority TEXT,
    likelihood_assessment TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE issue_templates (
    id TEXT PRIMARY KEY,
    template_name TEXT NOT NULL,
    claim_type TEXT,
    jurisdiction TEXT DEFAULT 'Georgia',
    elements JSON,
    case_law JSON,
    pattern_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Export Capabilities:**
- Claims matrix with element status
- Issue summary for mediation
- Defense analysis report
- Missing element checklist
- Strategic recommendation memo

**Integration Points:**
- Pull facts from Module E
- Link to discovery needs (Module D)
- Generate deposition topics (Module H)
- Support motion practice (Module I)

**Acceptance Criteria:**
- [ ] Claims properly track elements
- [ ] Facts correctly linked to elements
- [ ] Case law citations included
- [ ] Defense analysis comprehensive
- [ ] Strategic recommendations logical
- [ ] Export formats professional

---

### Module H: Deposition Preparation {#module-h-deposition-prep}

**Status:** Specification Complete | Development Pending

#### Overview

Module H transforms deposition preparation from manual outline creation to intelligent, fact-driven preparation with automatic exhibit selection and strategic question development.

#### Core Features

**1. Deposition Outline Structure**

Based on provided example (11-page outline), structure includes:

**Standard Outline Sections:**
1. **Background & Preliminaries**
   - Witness identification
   - Understanding of oath
   - Prior deposition experience
   - Representation status

2. **Personal Background**
   - Education history
   - Employment history
   - Criminal history
   - Medical history (if relevant)
   - Medications affecting memory

3. **Incident-Specific Topics**
   - Pre-incident activities
   - Incident description
   - Post-incident actions
   - Injuries claimed
   - Medical treatment

4. **Discovery Responses**
   - Interrogatory answers
   - Document production
   - Prior statements
   - Social media posts

5. **Exhibits**
   - Documents to authenticate
   - Photographs to identify
   - Reports to review
   - Prior statements to confront

**2. Question Development**

**Question Sources:**
- Facts from chronology (Module E)
- Discovery responses (Module D)
- Prior testimony
- Expert reports
- Medical records (Module F)
- Issues requiring proof (Module G)

**Question Types:**
- Open-ended (tell me about...)
- Closed (yes/no)
- Leading (isn't it true...)
- Authentication (showing exhibit)
- Impeachment (prior inconsistent)

**Smart Question Suggestions:**
Based on case type and witness role:
```
Plaintiff in Auto Case:
- Speed at time of impact?
- Looking at phone?
- Wearing seatbelt?
- Drinking before driving?
- Familiar with intersection?
```

**3. Exhibit Management**

**Exhibit Selection:**
- Auto-suggest relevant documents
- Link to discovery documents
- Pre-mark exhibit numbers
- Generate exhibit list
- Create exhibit notebooks

**Exhibit Categories:**
- Authenticating documents
- Impeachment materials
- Demonstrative aids
- Photographs/videos
- Medical records
- Expert reports

**4. Prior Testimony Integration**

**Testimony Sources:**
- Prior depositions (same case)
- Other case depositions
- Trial testimony
- Sworn statements
- Interrogatory answers

**Inconsistency Detection:**
- Compare current facts to prior testimony
- Flag potential contradictions
- Suggest impeachment sequences
- Link to source documents

**5. Outline Customization**

**Templates by Witness Type:**
- Party plaintiff
- Party defendant  
- Corporate representative
- Expert witness
- Fact witness
- Treating physician
- Investigating officer

**Dynamic Sections:**
Based on case facts:
- Add criminal history (if applicable)
- Add social media (if relevant)
- Add surveillance (if available)
- Add prior incidents (if pattern)

**Database Schema:**
```sql
CREATE TABLE deposition_outlines (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    deponent_name TEXT NOT NULL,
    deponent_type TEXT,
    deposition_date DATE,
    outline_content JSON,
    exhibits JSON,
    prior_testimony JSON,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE outline_topics (
    id TEXT PRIMARY KEY,
    outline_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    topic_order INTEGER,
    questions JSON,
    exhibits JSON,
    notes TEXT,
    FOREIGN KEY (outline_id) REFERENCES deposition_outlines(id)
);

CREATE TABLE deposition_exhibits (
    id TEXT PRIMARY KEY,
    outline_id TEXT NOT NULL,
    exhibit_number TEXT,
    document_id TEXT,
    description TEXT,
    purpose TEXT,
    marked_as TEXT,
    FOREIGN KEY (outline_id) REFERENCES deposition_outlines(id)
);

CREATE TABLE prior_testimony (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    witness_name TEXT,
    testimony_date DATE,
    testimony_type TEXT,
    transcript_excerpts JSON,
    page_line_references JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**Export Formats:**
- Outline to Word (formatted)
- Exhibit list to Excel
- Combined PDF (outline + exhibits)
- Checklist format
- Attorney notes version

**Integration Points:**
- Pull facts from Module E
- Select exhibits from Module D
- Reference medical history (Module F)
- Target issue elements (Module G)
- Create follow-up tasks (Module B)

**Acceptance Criteria:**
- [ ] Outline structure matches example
- [ ] Questions sourced from facts
- [ ] Exhibits properly linked
- [ ] Prior testimony integrated
- [ ] Templates customizable
- [ ] Export formats professional

---

### Module I: Document Creation & Templates {#module-i-document-creation}

**Status:** Specification Complete | Development Pending

#### Overview

Module I provides comprehensive document generation through intelligent templates that auto-populate from case data, facts, and discovery materials. It serves as the document production center for all case-related outputs.

#### Core Features

**1. Template Library**

**Pleading Templates:**
- Answer with affirmative defenses
- Counterclaim
- Cross-claim
- Third-party complaint
- Motion to dismiss
- Motion for summary judgment
- Motion in limine
- Discovery motions

**Discovery Templates:**
- Interrogatories (plaintiff/defendant)
- Request for production
- Request for admissions
- Deposition notices
- 6.4 deficiency letters
- Meet and confer letters
- Responses to discovery

**Correspondence Templates:**
- Representation letters
- Preservation letters
- Settlement demands
- Medical record requests
- Expert engagement
- Client reporting letters
- Opposing counsel communications

**Report Templates:**
- Initial case evaluation
- Discovery status report
- Mediation position statement
- Settlement evaluation
- Trial readiness report
- Post-trial analysis

**2. Intelligent Field Mapping**

**Auto-Population Sources:**
- Case metadata (parties, dates, venues)
- Facts from chronology
- Discovery responses
- Medical summaries
- Damage calculations
- Contact information

**Merge Fields:**
```
{{case.name}}
{{plaintiff.primary.name}}
{{defendant.primary.name}}
{{incident.date}}
{{discovery.close_date}}
{{facts.liability}}
{{damages.medical.total}}
{{venue.court}}
{{judge.name}}
```

**Conditional Logic:**
```
{{#if case.is_wrongful_death}}
  Include wrongful death claims language
{{/if}}

{{#if damages.punitive}}
  Include punitive damage allegations
{{/if}}
```

**3. Mark-and-Populate Integration**

**Workflow:**
1. Select text in document viewer
2. Choose "Add to Response"
3. Select target document field
4. System adds with source citation
5. Original maintains link

**Response Mapping:**
- Interrogatory answers
- Request for admission responses
- Document production responses
- Expert disclosures
- Fact summaries

**4. Document Assembly**

**Multi-Document Generation:**
- Select multiple templates
- System populates all simultaneously
- Maintains consistent facts across documents
- Generates in preferred format
- Creates combined PDF if requested

**Version Control:**
- Automatic versioning on save
- Track changes between versions
- Revision history with timestamps
- Rollback capability
- Comment on changes

**5. Export Management**

**Export Formats:**
- DOCX (fully editable)
- PDF (final version)
- PDF/A (archival)
- HTML (web viewing)
- RTF (universal)

**Export Options:**
- Include source citations
- Include exhibit references
- Add watermarks
- Password protection
- Digital signatures

**Database Schema:**
```sql
CREATE TABLE document_templates (
    id TEXT PRIMARY KEY,
    template_name TEXT NOT NULL,
    template_type TEXT,
    category TEXT,
    file_path TEXT,
    merge_fields JSON,
    conditional_sections JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generated_documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    template_id TEXT,
    document_name TEXT,
    document_type TEXT,
    version INTEGER DEFAULT 1,
    file_path TEXT,
    merge_data JSON,
    generated_by TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    version_number INTEGER,
    file_path TEXT,
    changes_summary TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES generated_documents(id)
);

CREATE TABLE response_mappings (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    source_document_id TEXT,
    source_text TEXT,
    target_field TEXT,
    target_document_type TEXT,
    page_reference TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**Template Management:**
- Upload custom templates
- Edit existing templates
- Share templates between cases
- Template versioning
- Template categories

**Acceptance Criteria:**
- [ ] Templates auto-populate correctly
- [ ] Mark-and-Populate integration working
- [ ] Multi-document generation functional
- [ ] Version control tracking changes
- [ ] Export formats generating properly
- [ ] Conditional logic executing correctly

---

### Module J: Trial Notebook {#module-j-trial-notebook}

**Status:** Specification Complete | Development Pending

#### Overview

Module J creates comprehensive trial preparation materials, organizing all evidence, witnesses, and legal arguments into a cohesive trial presentation strategy.

#### Core Features

**1. Trial Exhibit Management**

**Exhibit Organization:**
- Plaintiff exhibits (numerical)
- Defendant exhibits (alphabetical)
- Joint exhibits
- Demonstrative exhibits
- Impeachment exhibits
- Rebuttal exhibits

**Exhibit Tracking:**
- Pre-marked numbers/letters
- Admission status
- Objections raised
- Court rulings
- Witness authentication
- Chain of custody

**2. Witness Management**

**Witness Lists:**
- Fact witnesses
- Expert witnesses  
- Rebuttal witnesses
- Impeachment witnesses
- Character witnesses

**Witness Packets:**
- Direct examination outline
- Cross-examination outline
- Prior testimony
- Exhibits to show
- Anticipated objections

**3. Examination Outlines**

**Direct Examination:**
- Introduction/background
- Scene setting
- Incident testimony
- Damages testimony
- Exhibit introduction

**Cross Examination:**
- Impeachment points
- Admissions sought
- Confrontation exhibits
- Prior inconsistent statements
- Bias exploration

**4. Legal Framework**

**Jury Instructions:**
- Pattern instructions (Georgia)
- Modified instructions
- Special instructions
- Verdict forms
- Special interrogatories

**Motions in Limine:**
- Exclude evidence motions
- Include evidence motions
- Limiting instructions
- Daubert challenges
- Character evidence

**Trial Brief:**
- Statement of case
- Legal issues
- Evidentiary issues
- Witness summaries
- Exhibit list

**5. Trial Day Management**

**Daily Preparation:**
- Witness order
- Exhibit checklist
- Technology needs
- Courtroom setup
- Client preparation

**Real-Time Tracking:**
- Exhibits admitted
- Objections log
- Court rulings
- Time management
- Key testimony flags

**Database Schema:**
```sql
CREATE TABLE trial_exhibits (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    exhibit_number TEXT,
    exhibit_description TEXT,
    exhibit_type TEXT,
    offering_party TEXT,
    document_id TEXT,
    admission_status TEXT DEFAULT 'pending',
    objections TEXT,
    court_ruling TEXT,
    authenticating_witness TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE trial_witnesses (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    witness_name TEXT NOT NULL,
    witness_type TEXT,
    calling_party TEXT,
    testimony_order INTEGER,
    direct_outline JSON,
    cross_outline JSON,
    exhibits_to_show JSON,
    time_estimate INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE jury_instructions (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    instruction_number TEXT,
    instruction_type TEXT,
    instruction_text TEXT,
    legal_authority TEXT,
    requested_by TEXT,
    court_ruling TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**Export Capabilities:**
- Complete trial notebook (PDF)
- Exhibit binders
- Witness packets
- Jury instruction sets
- Trial brief

**Acceptance Criteria:**
- [ ] Exhibit tracking comprehensive
- [ ] Witness outlines organized
- [ ] Jury instructions formatted
- [ ] Trial brief generated
- [ ] Daily tracking functional
- [ ] Export formats professional

---

### Module K: Communications & Contacts {#module-k-communications}

**Status:** Specification Complete | Development Pending

**⚠️ IMPLEMENTATION ORDER CHANGE:** Module K moved from position #11 to position #3 in implementation sequence (immediately after Module B). This module is **foundational infrastructure**, not an end feature.

#### Overview

**⚠️ ARCHITECTURAL ROLE:** Module K is the **communication hub and relationship manager** for the entire system. It provides:
- **ALL Communication Logging:** Phone calls, emails, letters, meetings, video conferences
- **Contact Database:** Shared with Module A Phase 1B contact management
- **Integration Point:** Other modules log communications here (Discovery, Depositions, etc.)
- **Follow-up Management:** Creates tasks in Module B for required follow-ups

Module K provides centralized communication tracking and contact management, ensuring all case-related communications are logged, searchable, and properly attributed to contacts and cases.

#### Core Features

**1. Contact Management**

**Contact Categories:**
- **Insurance:** Adjusters, claims managers
- **Legal:** Opposing counsel, co-counsel
- **Medical:** Providers, records custodians
- **Experts:** Retained, consulting
- **Witnesses:** Fact, character
- **Court:** Judges, clerks, staff attorneys
- **Clients:** Insureds, corporate representatives

**Contact Information:**
- Multiple phone numbers
- Multiple email addresses
- Physical addresses
- Preferred contact method
- Best times to contact
- Do not contact flags

**2. Communication Logging**

**Communication Types:**
- Phone calls
- Emails
- Letters
- Text messages
- In-person meetings
- Video conferences

**Log Components:**
- Date/time
- Duration (for calls/meetings)
- Participants
- Subject matter
- Action items
- Follow-up needed
- Attachments

**3. Email Integration**

**Features:**
- Quick compose with templates
- Auto-populate recipient info
- CC/BCC management
- Attachment handling
- Read receipts
- Delivery confirmation

**Email Templates:**
- Status updates
- Document requests
- Scheduling
- Follow-ups
- Confirmations

**4. Correspondence Tracking**

**Letter Management:**
- Draft tracking
- Sent confirmation
- Delivery tracking
- Response monitoring
- Certified mail tracking

**Correspondence Chain:**
- Link related communications
- Thread view
- Response time tracking
- Escalation tracking

**5. Communication Search**

**Search Capabilities:**
- Full-text search
- Date range filtering
- Contact filtering
- Communication type filtering
- Case filtering
- Keyword highlighting

**Database Schema:**
```sql
CREATE TABLE contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT,
    role TEXT,
    category TEXT,
    phone_primary TEXT,
    phone_secondary TEXT,
    email_primary TEXT,
    email_secondary TEXT,
    address TEXT,
    preferred_contact TEXT,
    best_times TEXT,
    do_not_contact BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE case_contacts (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    relationship_type TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    started_date DATE,
    ended_date DATE,
    notes TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE communications (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    communication_type TEXT,
    direction TEXT,
    date_time TIMESTAMP,
    duration_minutes INTEGER,
    participants JSON,
    subject TEXT,
    summary TEXT,
    action_items TEXT,
    follow_up_needed BOOLEAN,
    follow_up_date DATE,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

**Integration Points:**
- Link to case management (Module A)
- Create tasks from action items (Module B)
- Calendar follow-ups (Module C)
- Attach discovery documents (Module D)

**Acceptance Criteria:**
- [ ] Contact management comprehensive
- [ ] Communication logging complete
- [ ] Email templates working
- [ ] Search functionality accurate
- [ ] Correspondence chains linked
- [ ] Integration points functional

---

### Module L: Analytics Dashboard {#module-l-analytics}

**Status:** Specification Complete | Development Pending

#### Overview

Module L provides comprehensive analytics and reporting across all modules, offering insights into case metrics, productivity, deadline compliance, and strategic patterns.

#### Core Features

**1. Case Analytics**

**Case Metrics:**
- Total active cases
- Cases by phase
- Cases by attorney
- Cases by type
- Average case duration
- Settlement vs trial ratio

**Phase Distribution:**
```
Pre-Suit: 5 cases (10%)
Discovery: 20 cases (40%)
Depositions: 15 cases (30%)
Mediation: 8 cases (16%)
Trial Prep: 2 cases (4%)
```

**2. Task & Productivity Analytics**

**Task Metrics:**
- Tasks completed (daily/weekly/monthly)
- Overdue tasks
- Tasks by priority
- Tasks by attorney
- Average task completion time

**Time Tracking:**
- Hours billed by attorney
- Hours by case
- Hours by task type
- Billable vs non-billable ratio
- Realization rate

**3. Deadline Compliance**

**Compliance Metrics:**
- On-time completion rate
- Near-miss tracking
- Extended deadlines
- Jurisdictional deadline compliance

**Risk Indicators:**
- Cases with overdue tasks
- Upcoming jurisdictional deadlines
- Discovery deadlines approaching
- Trial dates within 60 days

**4. Financial Analytics**

**Billing Metrics:**
- Monthly billing totals
- Outstanding time entries
- Average hourly rate
- Collection rate
- Write-offs

**Case Economics:**
- Cost per case
- Revenue per case
- Profitability analysis
- Budget vs actual

**5. Custom Reports**

**Report Builder:**
- Select metrics
- Choose date range
- Filter by criteria
- Export format selection
- Schedule recurring reports

**Standard Reports:**
- Executive summary
- Attorney productivity
- Case status report
- Deadline compliance
- Financial summary

**Dashboard Widgets:**
```javascript
// Priority Order (per user preference)
1. Overdue Tasks (critical items)
2. Discovery Deadlines (next 30 days)
3. Active Cases (by phase)
4. This Week's Calendar
5. Recent Time Entries
6. Task Completion Rate
7. Case Opening/Closing Trend
8. Billable Hours Target
```

**Database Views:**
```sql
CREATE VIEW case_metrics AS
SELECT 
    COUNT(*) as total_cases,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_cases,
    AVG(JULIANDAY(date_closed) - JULIANDAY(date_opened)) as avg_duration,
    COUNT(DISTINCT lead_attorney_id) as attorney_count
FROM cases;

CREATE VIEW task_metrics AS
SELECT
    COUNT(*) as total_tasks,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN due_date < DATE('now') AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks,
    AVG(JULIANDAY(completed_date) - JULIANDAY(created_at)) as avg_completion_days
FROM tasks;

CREATE VIEW deadline_compliance AS
SELECT
    COUNT(*) as total_deadlines,
    SUM(CASE WHEN completed_date <= calculated_date THEN 1 ELSE 0 END) as on_time,
    SUM(CASE WHEN is_jurisdictional = 1 THEN 1 ELSE 0 END) as jurisdictional_deadlines
FROM deadlines;
```

**Visualization Options:**
- Bar charts
- Line graphs
- Pie charts
- Heat maps
- Tables
- KPI cards

**Export Formats:**
- PDF reports
- Excel spreadsheets
- CSV data files
- JSON for external analysis

**Acceptance Criteria:**
- [ ] Metrics calculating correctly
- [ ] Dashboard widgets interactive
- [ ] Custom reports generating
- [ ] Export formats working
- [ ] Real-time updates functioning
- [ ] Historical data tracking

---

## PART III: SHARED UTILITIES

### Module SU: Shared Utilities & Automations {#module-su-utilities}

**Status:** Specification Complete | Core Components Built

#### Overview

Module SU provides the automation engine and shared utilities that power intelligent behavior across all modules. It implements Georgia-specific legal calculations and 25 comprehensive automations.

#### Core Components

**1. Georgia Deadline Calculator**

Implements O.C.G.A. § 9-11-6:
```javascript
function addBusinessDays(startDate, days, holidays) {
    if (days < 7) {
        // Exclude intermediate weekends/holidays
    } else {
        // Count all days, extend if ending on weekend/holiday
    }
    // Never count day 1 (trigger day)
}
```

**2. Automation Engine**

**25 Production Automations:**

**Case State Changes:**
1. **Case Opened** → Create intake tasks, send acknowledgment
2. **Answer Filed** → Start discovery calendar, create tasks
3. **Discovery Opened** → Set deadlines, create document requests
4. **Discovery Closed** → Verify compliance, prepare for depositions
5. **Mediation Scheduled** → Create prep tasks, position statement deadline

**Document Events:**
6. **Complaint Received** → Calculate answer deadline, notice to client
7. **Discovery Received** → Response deadline, review tasks
8. **Medical Records Received** → Create summary task, update damages
9. **Expert Report Received** → Analysis task, rebuttal deadline
10. **Deposition Notice** → Prep tasks, exhibit selection

**Deadline Triggers:**
11. **30 Days Before Discovery Close** → Final discovery push
12. **7 Days Before Deadline** → Warning notification
13. **1 Day Before Deadline** → Critical alert
14. **Deadline Missed** → Escalation protocol
15. **Deadline Extended** → Recalculate dependent dates

**Communication Events:**
16. **Settlement Demand** → Evaluation task, response deadline  
17. **6.4 Letter Required** → Generate deficiency list, draft letter
18. **Meet and Confer** → Schedule, prepare agenda
19. **Client Contact Due** → Status update reminder
20. **Expert Contact Due** → Check-in task

**Milestone Events:**
21. **Phase Change** → Update all stakeholders
22. **Trial Date Set** → Backward calculate all deadlines
23. **Settlement Reached** → Closing tasks, dismissal docs
24. **Case Closed** → Archive, final reporting
25. **Case Reopened** → Restore active status, review deadlines

**3. Discovery Close Countdown**

Real-time countdown with color coding:
- 🟢 Green: >90 days (on track)
- 🟡 Yellow: 60-90 days (plan final discovery)
- 🟠 Orange: 30-60 days (urgent)
- 🔴 Red: <30 days (critical)
- ⚫ Black: Overdue

**4. File Export Utilities**

```javascript
// Document generation
generateDOCX(template, data)
generatePDF(html)
generateCSV(rows)
generateICS(events)

// Archive creation
generateZIP(files)
generateCaseArchive(caseId)
```

**5. Data Validation**

```javascript
// Bates validation
validateBatesRange(start, end)
detectBatesGaps(documents)

// Date validation
isBusinessDay(date)
isHoliday(date)
isValidDeadline(date)
```

**Database Schema:**
```sql
CREATE TABLE automations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trigger_type TEXT,
    trigger_event TEXT,
    conditions JSON,
    actions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE automation_log (
    id TEXT PRIMARY KEY,
    automation_id TEXT,
    case_id TEXT,
    trigger_time TIMESTAMP,
    actions_taken JSON,
    success BOOLEAN,
    error_message TEXT,
    FOREIGN KEY (automation_id) REFERENCES automations(id)
);
```

**Acceptance Criteria:**
- [ ] All 25 automations triggering correctly
- [ ] Georgia deadlines calculating accurately
- [ ] Discovery countdown updating in real-time
- [ ] Export utilities generating valid files
- [ ] Automation log tracking all events

---

### Mark-and-Populate Engine {#mark-and-populate}

**Status:** Specification Complete | Development Pending

#### Overview

The Mark-and-Populate Engine enables intelligent fact extraction from documents, automatic chronology building, and response generation through an intuitive marking interface.

#### Core Features

**1. Document Viewer**

**Supported Formats:**
- PDF (native and scanned)
- Word documents
- Images
- Text files
- Emails

**Viewer Features:**
- Page navigation
- Zoom controls
- Search within document
- Text selection
- Annotation tools
- Split view

**2. Marking Interface**

**Marking Workflow:**
1. Select text in document
2. Right-click for context menu
3. Choose action:
   - Create Fact
   - Add to Response
   - Flag for Review
   - Add Note
   - Create Task

**Visual Indicators:**
- Yellow highlight: Facts
- Blue highlight: Response text
- Red highlight: Issues/problems
- Green highlight: Favorable
- Purple highlight: Expert opinion

**3. Fact Extraction**

**Extracted Data:**
- Selected text (verbatim)
- Document source
- Page number
- Line number (if available)
- Date (auto-detected or manual)
- Parties involved (auto-detected)
- Fact type classification

**Auto-Processing:**
- Date detection from context
- Party name recognition
- Medical term identification
- Dollar amount extraction
- Location identification

**4. Response Assignment**

**Response Targets:**
- Interrogatory answers
- Document request responses
- Admission responses
- Expert disclosures
- Position statements

**Assignment Panel:**
```
Selected Text: "Plaintiff was traveling at 45 mph"
Assign to:
☐ Interrogatory 5 (vehicle speed)
☑ Interrogatory 12 (incident description)
☐ Request for Admission 8
☐ Expert Disclosure
[Assign] [Cancel]
```

**5. Template Mapping**

**Smart Mapping:**
- Pre-mapped common fields
- Learning from user patterns
- Suggested assignments
- Bulk assignment options

**Template Integration:**
- Pull marked text into templates
- Maintain source citations
- Update when source changes
- Version tracking

**Database Schema:**
```sql
CREATE TABLE marked_text (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    marked_text TEXT NOT NULL,
    page_number INTEGER,
    line_number INTEGER,
    mark_type TEXT,
    mark_color TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

CREATE TABLE fact_extraction (
    id TEXT PRIMARY KEY,
    marked_text_id TEXT NOT NULL,
    fact_date DATE,
    fact_text TEXT,
    parties_involved JSON,
    fact_type TEXT,
    significance TEXT,
    auto_extracted JSON,
    user_confirmed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (marked_text_id) REFERENCES marked_text(id)
);

CREATE TABLE response_assignments (
    id TEXT PRIMARY KEY,
    marked_text_id TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    target_field TEXT,
    include_citation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (marked_text_id) REFERENCES marked_text(id)
);
```

**Integration Points:**
- Feeds facts to Module E (Chronology)
- Provides responses to Module I (Documents)
- Creates tasks in Module B
- Links evidence in Module D

**Acceptance Criteria:**
- [ ] Document viewer supporting all formats
- [ ] Text selection and marking smooth
- [ ] Fact extraction accurate
- [ ] Response assignment working
- [ ] Template mapping functional
- [ ] Source citations maintained

---

### Export & Template System {#export-template-system}

**Status:** Core Utilities Built | Templates In Development

#### Overview

The Export & Template System provides consistent document generation across all modules with professional formatting and complete data integration.

#### Standard Templates

**1. Pleading Templates**

**Initial Pleadings:**
- Answer (with affirmative defenses)
- Counterclaim template
- Cross-claim template
- Third-party complaint

**Motion Practice:**
- Motion for summary judgment
- Motion to compel
- Motion in limine
- Motion to dismiss

**2. Discovery Templates**

**Requests:**
- Interrogatories (25 standard)
- Request for production (30 standard)
- Request for admissions (20 standard)
- Deposition notices

**Responses:**
- Interrogatory responses
- Document production responses
- Admission responses
- Privilege log

**3. Report Templates**

**Case Reports:**
- Initial evaluation (intake)
- Discovery status report
- Mediation position statement
- Settlement evaluation
- Trial readiness report

**Medical Reports:**
- Medical chronology (condensed)
- Medical chronology (detailed)
- Provider summary
- Billing summary

**4. Correspondence Templates**

**Standard Letters:**
- Representation letter
- Preservation notice
- 6.4 deficiency letter
- Meet and confer
- Settlement communication

**Client Communications:**
- Status update
- Document request
- Discovery explanation
- Settlement recommendation

**5. Export Formats**

**Document Formats:**
```javascript
// Word (editable)
exportToDocx(data, template) // python-docx

// PDF (final)
exportToPdf(html) // print-to-pdf

// Excel (data)
exportToExcel(rows, sheets) // exceljs

// CSV (simple data)
exportToCsv(rows) // native

// ICS (calendar)
exportToIcs(events) // ical-generator
```

**Export Options:**
```javascript
{
  includeMetadata: true,
  includeSourceCitations: true,
  includeTableOfContents: true,
  includeExhibitList: false,
  watermark: "CONFIDENTIAL",
  password: null,
  digitalSignature: false
}
```

**Template Processing:**
```javascript
// Merge field replacement
template.replace(/\{\{(\w+)\}\}/g, (match, field) => {
  return data[field] || '';
});

// Conditional sections
if (data.hasWrongfulDeath) {
  includeSection('wrongful_death_claims');
}

// Repeating sections (parties, facts)
data.defendants.forEach(defendant => {
  addSection('defendant_allegations', defendant);
});
```

**Quality Controls:**
- Template validation before use
- Required field checking
- Format verification
- Output preview
- Error handling

**Acceptance Criteria:**
- [ ] All templates generating correctly
- [ ] Merge fields populating accurately
- [ ] Conditional logic working
- [ ] Export formats valid
- [ ] Citations included properly
- [ ] Professional formatting maintained

---

## PART IV: DATA MIGRATION & SETUP

### Case Keeper Migration {#case-keeper-migration}

#### Overview

Migrate existing data from Case Keeper spreadsheets:
- ~25 active cases
- 1,000+ contacts
- 500+ tasks
- Historical data preservation

#### Migration Process

**1. Data Extraction**
```javascript
// Read Excel files
const cases = readExcel('CaseKeeper.xlsx', 'Cases');
const contacts = readExcel('CaseKeeper.xlsx', 'Contacts');
const tasks = readExcel('CaseKeeper.xlsx', 'Tasks');
```

**2. Data Transformation**
```javascript
// Map spreadsheet columns to database schema
const transformCase = (row) => ({
  case_name: row['Case Name'],
  cm_number: row['CM#'],
  plaintiff_name: row['Plaintiff'],
  defendant_name: row['Defendant'],
  // ... additional mappings
});
```

**3. Data Validation**
- Check required fields
- Validate data types
- Identify duplicates
- Flag anomalies

**4. Data Import**
- Transaction-based import
- Rollback on error
- Progress tracking
- Import log

**5. Post-Migration**
- Verify record counts
- Spot-check data accuracy
- Test relationships
- Generate migration report

---

### Initial Configuration {#initial-configuration}

#### System Setup

**1. Database Initialization**
```bash
# Create data directory
mkdir -p D:\SunflowerSuite\data

# Initialize suite.db
node scripts/init-database.js

# Load seed data
node scripts/load-holidays.js
node scripts/load-automations.js
node scripts/load-templates.js
```

**2. User Configuration**
- Attorney profiles
- Billing rates
- Email settings
- Calendar preferences
- Export defaults

**3. Template Customization**
- Firm letterhead
- Signature blocks
- Custom fields
- Firm-specific language

**4. Automation Configuration**
- Enable/disable specific automations
- Customize trigger conditions
- Set notification preferences
- Configure escalation rules

---

### Production Deployment {#production-deployment}

#### Flash Drive Deployment

**1. File Structure**
```
D:\ (USB Flash Drive)
└── SunflowerSuite\
    ├── sunflower-suite.exe (executable)
    ├── resources\
    ├── data\
    ├── templates\
    └── backups\
```

**2. Performance Optimization**
- Database indexing
- Query optimization
- Lazy loading
- Caching strategy

**3. Backup Strategy**
- Automatic daily backups
- Retain 30 days
- External backup option
- Recovery procedures

**4. Security Measures**
- No internet connectivity
- Local data only
- Windows authentication
- Audit logging

---

## CONCLUSION

Sunflower Suite v5.0 represents a comprehensive transformation of civil defense litigation practice. Built on proven technology with Module A Phase 1A successfully deployed, the system provides:

✅ **Complete case lifecycle management** from intake through appeal  
✅ **Intelligent automation** with 18 cadences and 251+ tasks  
✅ **Georgia-specific compliance** for all deadlines and procedures  
✅ **Narrative intelligence** through Mark-and-Populate integration  
✅ **Offline-first architecture** for security and portability  

The modular architecture ensures each component can be developed, tested, and deployed independently while maintaining seamless integration. The Golden Rules derived from production experience guarantee consistent, reliable development.

With this charter as the guiding document, Sunflower Suite will transform how civil defense litigation is practiced—from reactive administration to proactive intelligence, from manual processes to automated workflows, from scattered information to coherent narratives.

**Next Steps:**
1. Complete Module A Phase 1B (Contact Management + Navigation Architecture)
2. Complete Module A Phase 1C (Correspondence Logging)
3. Implement Module B (Task & Workflow Manager) - integrates with Tier 1 nav
4. Deploy Module C (Calendar & Deadlines) - integrates with Tier 1 nav
5. Build Module D (Discovery & Evidence Manager) - integrates with Tier 1 nav
6. Develop Module E (Case Chronology) - integrates with Tier 2 case tabs
7. Continue sequential module development per two-tier architecture

This charter provides the complete blueprint for building a production-ready legal case management system that truly serves as the attorney's operating system.

---

**Document Version:** 5.1 (Navigation Architecture Update)  
**Total Pages:** 85+ pages  
**Modules Specified:** 12 + Shared Utilities  
**Automations Defined:** 25  
**Cadences Included:** 18 (251+ tasks)  
**Golden Rules:** 7 (Added: Two-Tier Navigation Separation)  
**Last Updated:** November 2025  
**Status:** Ready for Implementation
