# 📝 ADDENDUM TO SUNFLOWER SUITE v5.0 CHARTER
## Critical Corrections to Module Responsibilities & Implementation Order
### Date: November 2025

---

## EXECUTIVE SUMMARY

This addendum corrects critical architectural decisions in the v5.0 Charter based on developer insights during implementation planning. Key changes:

1. **Phase progression logic** moves from Module A to Module B (Task Manager)
2. **Module A Phase 1C** becomes a simple case disposition form, not lifecycle management
3. **Module K (Communications)** moves from position #11 to position #3
4. **Module A** becomes a display/dashboard layer, not a logic processor
5. **Module A Phase 1D** introduces central document repository with SOURCE tracking (v1.1 addition)
6. **Parties & Policies** move to dedicated tabs with enhanced investigation document management (v1.1 addition)

These changes prevent duplicate data entry, clarify module responsibilities, align with actual litigation workflow, and establish a foundation for intelligent cross-module document intelligence.

---

## SECTION 1: REVISED MODULE RESPONSIBILITIES

### Module A: Case Manager (Display & Foundation Layer)

**What Module A IS:**
- Foundation data store for case metadata
- Display dashboard showing data from other modules
- Entry point for case disposition process
- Repository for parties, insurance, and basic case facts

**What Module A IS NOT:**
- Logic processor for phase changes
- Communication manager
- Task controller
- Automation engine

**Module A Displays But Doesn't Manage:**
```
┌─────────────────────────────────────┐
│  CASE DASHBOARD (Module A)          │
├─────────────────────────────────────┤
│ Current Phase: Discovery            │ ← Set by Module B
│ Recent Communications: 3 new        │ ← From Module K  
│ Pending Tasks: 12                   │ ← From Module B
│ Next Deadline: 12/15/25             │ ← From Module C
│ [Start Disposition]                 │ ← Module A Form
└─────────────────────────────────────┘
```

### Module B: Task & Workflow Manager (Logic Engine)

**Module B Now Owns:**
- **Phase progression logic** (NEW - moved from Module A)
- Task automation and cadences
- Workflow state management
- Phase change triggers

**How Phase Progression Works:**
```javascript
// In Module B
async function completeTask(taskId: string) {
  const task = await getTask(taskId);
  
  // Mark task complete
  await updateTask(taskId, { status: 'completed' });
  
  // Check for phase change triggers
  if (task.title === 'File Answer') {
    await updateCasePhase(task.case_id, 'discovery');
    await triggerCadence(task.case_id, 'discovery-initiated');
  }
  
  if (task.title === 'Complete Discovery') {
    await updateCasePhase(task.case_id, 'depositions');
  }
}
```

**Module B Updates Module A's Phase Field:**
```sql
-- Module B executes this
UPDATE cases 
SET phase = 'discovery', 
    updated_at = CURRENT_TIMESTAMP 
WHERE id = ?;
```

### Module K: Communications & Contacts (Relationship Layer)

**Module K Manages:**
- ALL communication logging (calls, emails, letters, meetings)
- Contact database and relationships
- Follow-up tracking
- Communication templates
- Correspondence summaries

**Critical Change:** Module K is NOT a "nice-to-have" end feature. It's foundational infrastructure needed from the start of every case.

---

## SECTION 2: REVISED MODULE A PHASE 1C SPECIFICATION

### Phase 1C: Case Disposition Form (Simplified)

**Previous (INCORRECT) Specification:**
- Case lifecycle management ❌
- Phase progression system ❌
- Correspondence tracking ❌

**New (CORRECT) Specification:**
Phase 1C adds a single, self-contained disposition form accessible via "Start Disposition" button in Module A.

#### Disposition Form UI/UX

```
┌────────────────────────────────────────────────┐
│          CASE DISPOSITION FORM                 │
├────────────────────────────────────────────────┤
│                                                 │
│ Settlement Agreement                            │
│ ┌─────────────────────────────────┐            │
│ │ 📎 Drop file or click to upload  │            │
│ └─────────────────────────────────┘            │
│ ✓ settlement_agreement_smith_v_jones.pdf       │
│                                                 │
│ Release                                         │
│ ┌─────────────────────────────────┐            │
│ │ 📎 Drop file or click to upload  │            │
│ └─────────────────────────────────┘            │
│ [Generate Release Template]                     │
│                                                 │
│ Dismissal Documents                             │
│ ┌─────────────────────────────────┐            │
│ │ 📎 Drop file or click to upload  │            │
│ └─────────────────────────────────┘            │
│ [Generate Dismissal Template]                   │
│                                                 │
│ ☐ Potential for Refiling                       │
│   └─ Refiling Deadline: [DATE PICKER]          │
│   └─ Days to Deadline: [  90  ] days           │
│   └─ ☐ Set Calendar Reminder                   │
│                                                 │
│ Settlement Amount: $[___________]               │
│                                                 │
│ Disposition Type:                               │
│ ○ Settlement                                    │
│ ○ Verdict                                       │
│ ○ Dismissal without prejudice                  │
│ ○ Dismissal with prejudice                     │
│ ○ Other: [___________]                         │
│                                                 │
│ Disposition Notes:                              │
│ ┌─────────────────────────────────────────┐    │
│ │                                         │    │
│ │                                         │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ [Complete Disposition] [Save Draft] [Cancel]    │
└────────────────────────────────────────────────┘
```

#### Database Schema for Disposition

```sql
-- Add to schema-module-A.sql
CREATE TABLE IF NOT EXISTS case_dispositions (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  
  -- Disposition details
  disposition_type TEXT,  -- settlement|verdict|dismissal_with|dismissal_without|other
  disposition_date DATE,
  settlement_amount DECIMAL(12,2),
  
  -- Documents
  settlement_agreement_path TEXT,
  release_document_path TEXT,
  dismissal_document_path TEXT,
  
  -- Refiling potential
  potential_refiling BOOLEAN DEFAULT FALSE,
  refiling_deadline DATE,
  refiling_reminder_set BOOLEAN DEFAULT FALSE,
  
  -- Notes
  disposition_notes TEXT,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

#### IPC Methods for Disposition

```typescript
// In electron/preload.js
disposition: {
  saveDisposition: (caseId, data) => ipcRenderer.invoke('disposition:save', caseId, data),
  getDisposition: (caseId) => ipcRenderer.invoke('disposition:get', caseId),
  generateRelease: (caseId) => ipcRenderer.invoke('disposition:generateRelease', caseId),
  generateDismissal: (caseId, type) => ipcRenderer.invoke('disposition:generateDismissal', caseId, type),
  uploadDocument: (caseId, docType, file) => ipcRenderer.invoke('disposition:uploadDoc', caseId, docType, file),
}
```

#### Actions Triggered by Disposition

When disposition is completed:
1. **Module B** receives notification → closes all open tasks
2. **Module C** receives notification → cancels future deadlines
3. **Module K** logs disposition as communication milestone
4. **Case status** updates to "closed"
5. If refiling potential → **Module C** creates monitoring deadline

---

## SECTION 3: CORRECTED IMPLEMENTATION ORDER

### Previous (INCORRECT) Order:
1. A → Case Manager
2. B → Task Manager  
3. C → Calendar
4. SU → Shared Utilities
5. D → Discovery
6. E → Chronology
7. F → Medical
8. G → Issues
9. H → Deposition
10. I → Reports
11. J → Trial
12. **K → Communications (TOO LATE!)** ❌
13. L → Analytics

### New (CORRECT) Order:

```
PHASE 1: FOUNDATION (Weeks 1-3)
1. Module A  - Case Manager (all phases)
2. Module B  - Task Manager (with phase progression)
3. Module K  - Communications & Contacts ← MOVED UP!

PHASE 2: INFRASTRUCTURE (Week 4)
4. Module SU - Shared Utilities (dateTime, export, validation)

PHASE 3: CORE WORKFLOW (Weeks 5-8)
5. Module C  - Calendar & Deadlines
6. Module D  - Discovery Manager
7. Module E  - Chronology & Narrative

PHASE 4: SPECIALIZED (Weeks 9-12)
8. Module F  - Medical Chronology
9. Module G  - Issues & Claims
10. Module H - Deposition Prep

PHASE 5: OUTPUT (Weeks 13-15)
11. Module I - Document Creation & Templates
12. Module J - Trial Notebook

PHASE 6: ANALYTICS (Week 16)
13. Module L - Analytics Dashboard
```

### Why This Order Works Better:

**Weeks 1-3 give you core functionality:**
- Create and manage cases (A)
- Track tasks and automate workflows (B)  
- Log all communications from day one (K)

**Week 4 builds infrastructure:**
- Utilities prevent duplication across modules

**Weeks 5-8 add deadline intelligence:**
- Calendar integration (C)
- Discovery tracking (D)
- Narrative building (E)

**Remaining weeks add specialized features**

---

## SECTION 4: DATA FLOW CORRECTIONS

### How Modules Actually Interact

```
MODULE A (Case Manager)
    ↓ provides case context to all
    
MODULE B (Task Manager)
    ↓ updates phase in A
    ↓ creates communication tasks for K
    
MODULE K (Communications)  
    ↓ logs all interactions
    ↓ creates follow-up tasks in B
    
MODULE C (Calendar)
    ↓ reads deadlines from B
    ↓ reads events from K
    
MODULE D (Discovery)
    ↓ creates review tasks in B
    ↓ logs productions in K
    
MODULE E (Chronology)
    ↓ pulls facts from D
    ↓ pulls testimony from K
```

### What This Prevents:

❌ **No duplicate entry** - Communications enter once in K, display in A  
❌ **No logic confusion** - Phase logic lives only in B  
❌ **No missing data** - Communications tracked from day one  
❌ **No retrofitting** - K available when D needs to log discovery communications  

---

## SECTION 5: ACCEPTANCE CRITERIA UPDATES

### Module A Phase 1C (Revised Criteria)

**Previous Criteria (REMOVE):**
- ~~All correspondence logged and searchable~~
- ~~Phase transitions trigger automations~~
- ~~Lifecycle tracking accurate~~

**New Criteria (ADD):**
- [ ] "Start Disposition" button visible on active cases
- [ ] Disposition form uploads settlement agreement
- [ ] Disposition form uploads/generates release
- [ ] Disposition form uploads/generates dismissal
- [ ] Refiling deadline sets calendar reminder (when Module C available)
- [ ] Disposition completion closes case
- [ ] Disposition data persists to database
- [ ] Closed cases show disposition summary

### Module B (Additional Criteria)

**Add these criteria for phase progression:**
- [ ] Task completion triggers phase evaluation
- [ ] Phase changes update Module A database
- [ ] Phase-specific cadences trigger automatically
- [ ] Phase regression supported (e.g., case reopened)
- [ ] Phase history tracked with timestamps

### Module K (Moved Earlier - Priority Criteria)

**Must work by Week 3:**
- [ ] Basic communication logging functional
- [ ] Contact creation and assignment working
- [ ] Follow-up creation working
- [ ] Module B integration (tasks from communications)
- [ ] Module A integration (display recent communications)

---

## SECTION 6: TECHNICAL IMPLEMENTATION NOTES

### Module Boundaries Are Sacred

Each module must:
1. **Own its data** - Module K owns communications, Module B owns tasks
2. **Expose its data** - Through IPC methods for other modules to read
3. **Never duplicate logic** - Phase progression happens ONLY in Module B
4. **Display but not manage** - Module A shows but doesn't control other modules' data

### Example: How Module A Displays Other Modules' Data

```typescript
// In Module A's CaseOverview.tsx
export function CaseOverview({ caseId }) {
  const [recentComms, setRecentComms] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('');
  
  useEffect(() => {
    // Pull from Module K
    window.electron.db.getRecentCommunications(caseId, 5)
      .then(setRecentComms);
    
    // Pull from Module B  
    window.electron.db.getPendingTasks(caseId, 5)
      .then(setPendingTasks);
    
    // Phase is stored in Module A but set by Module B
    window.electron.db.getCaseById(caseId)
      .then(c => setCurrentPhase(c.phase));
  }, [caseId]);
  
  return (
    <div>
      <h2>Current Phase: {currentPhase}</h2>
      
      <div className="recent-comms">
        <h3>Recent Communications (from Module K)</h3>
        {recentComms.map(comm => (
          <div key={comm.id}>
            {comm.date} - {comm.type} - {comm.subject}
          </div>
        ))}
      </div>
      
      <div className="pending-tasks">
        <h3>Pending Tasks (from Module B)</h3>
        {pendingTasks.map(task => (
          <div key={task.id}>
            {task.title} - Due: {task.due_date}
          </div>
        ))}
      </div>
      
      <button onClick={() => openDispositionForm(caseId)}>
        Start Disposition
      </button>
    </div>
  );
}
```

---

## SECTION 7: MIGRATION IMPACT

### For Existing Module A Phase 1A Implementation

**No changes required to:**
- Cases table (already has phase field)
- Party management
- Policy management  
- Search functionality

**Add in Phase 1C:**
- Disposition form component
- Disposition database table
- IPC methods for disposition
- Document upload for settlement docs

### For Module B Development

**Add to requirements:**
- Phase progression logic
- Phase change triggers
- Update case.phase field via IPC
- Phase history tracking

### For Module K Development

**Change: Build immediately after Module B**
- Week 3 instead of Week 15
- Basic version first (can enhance later)
- Focus on core CRUD initially
- Integration with B and A is priority

---

## SECTION 5: MODULE A PHASE 1D - PARTIES, POLICIES & DOCUMENT MANAGEMENT ENHANCEMENT

### Date Added: November 14, 2025

### Overview

Following implementation of Phase 1C (Case Disposition), Module A expands to include **dedicated management interfaces** for Parties and Policies, plus a **central document repository system** that serves as the foundation for cross-module document intelligence.

### Key Architectural Decision: "Document Hub with Smart References"

**Problem Being Solved:**
- Early in litigation: Need to quickly capture documents without perfect organization
- Later in litigation: Same documents need to appear in multiple contexts (chronology, discovery log, deposition prep)
- Current systems force: Perfect upfront categorization OR duplicate entry

**Solution: Single Source of Truth + Multiple Views**

```
┌─────────────────────────────────────────────────────────┐
│           CENTRAL DOCUMENT REPOSITORY                    │
│  (Every document uploaded ONCE, stored with metadata)    │
│                                                           │
│  case_documents table:                                   │
│  - Document file & metadata                              │
│  - SOURCE tracking (who/where/when obtained)             │
│  - Type, date, description                               │
│  - Tags for future organization                          │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┼───────────────┬──────────────┐
        ↓               ↓               ↓              ↓
   ┏━━━━━━━━┓     ┏━━━━━━━━┓     ┏━━━━━━━━┓    ┏━━━━━━━━┓
   ┃ PARTY  ┃     ┃POLICY  ┃     ┃DISCOVERY┃    ┃CHRONOLOGY┃
   ┃ VIEW   ┃     ┃ VIEW   ┃     ┃ MANAGER ┃    ┃ TIMELINE ┃
   ┗━━━━━━━━┛     ┗━━━━━━━━┛     ┗━━━━━━━━┛    ┗━━━━━━━━┛
   
   Linking tables: party_documents, policy_documents,
                   discovery_documents, chronology_documents
   
   Same document appears in multiple views,
   but stored only once with smart tagging
```

### Phase 1D Enhancements

#### 1. Parties Tab (Dedicated Tier 2 Screen)

**Moved from CaseDetail to dedicated tab for:**
- Better organization and focus
- Room for document management
- Enhanced party details
- Investigation document hub

**New Functionality:**
```
PARTIES TAB FEATURES:
├── Expandable Party Cards
├── Enhanced Party Information
│   ├── Basic: Name, type, corporate status
│   ├── Personal: DOB, SSN (last 4), driver's license
│   ├── Contact: Link to global_contacts (Phase 2)
│   └── Service Status: Monitor flags, dates
├── Investigation Document Hub
│   ├── Quick upload during investigation
│   ├── SOURCE tracking (critical for litigation)
│   ├── Document type categorization
│   ├── Date and description
│   └── Tags for future organization
├── Notes Section
└── Contact Integration (Phase 2)
    ├── Link to existing contact
    └── Create contact from party
```

**Enhanced Party Data Model:**
```sql
ALTER TABLE case_parties ADD COLUMN:
- date_of_birth DATE
- ssn_last_four TEXT (security: only last 4 digits)
- drivers_license TEXT
- contact_id INTEGER (links to global_contacts)
```

**Document Types Supported:**
```
Investigation Documents:
- ISO Report
- MVAR (Motor Vehicle Accident Report)
- Citation
- Background Check
- Social Media Post
- Arrests
- SIU Materials
- Obituary
- Education-Related
- Work-Related
- Corporate Filing
- Other Lawsuits
- Other Claims
- Website/Bio

Standard Litigation Docs:
- Deposition Transcript
- Medical Records
- Pleading
- Expert Report
- Policy Document
- Discovery Response
- Other
```

#### 2. Policies Tab (Dedicated Tier 2 Screen)

**Moved from CaseDetail to dedicated tab for:**
- Policy document management
- Better organization of complex policy structures
- Support for UM/UIM stacking calculations

**New Functionality:**
```
POLICIES TAB FEATURES:
├── Expandable Policy Cards
├── Enhanced Policy Information
│   ├── Carrier, policy number, type
│   ├── Limits (with UM/UIM stacking support)
│   ├── UM/UIM Type: Stacked vs Set-off
│   └── Retention status
├── Policy Document Management
│   ├── Declaration Page upload
│   ├── Full Policy upload
│   ├── UM/UIM Policy upload
│   ├── Coverage Letters
│   └── Denial Letters
└── Notes Section
```

**Policy Document Types:**
- Declaration Page
- Full Policy
- UM/UIM Policy
- Coverage Letter
- Denial Letter
- Other

#### 3. Central Document Repository System

**New Database Tables:**

```sql
-- Core document storage
CREATE TABLE case_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  upload_date DATE DEFAULT CURRENT_DATE,
  document_date DATE, -- Actual date of content
  
  -- Type categorization
  document_type TEXT CHECK(document_type IN (
    'ISO_report', 'MVAR', 'citation', 'background_check',
    'social_media_post', 'arrests', 'SIU_materials', 'obituary',
    'education_related', 'work_related', 'website_bio',
    'corporate_filing', 'other_lawsuits', 'other_claims',
    'deposition_transcript', 'policy_document', 'medical_records',
    'pleading', 'discovery_response', 'expert_report', 'other'
  )),
  
  -- SOURCE TRACKING (Critical!)
  source_type TEXT NOT NULL CHECK(source_type IN (
    'claim_file', 'pleadings', 'document_production',
    'non_party_production', 'pre_suit_demand', 
    'private_investigator', 'public_records', 'expert',
    'news_article', 'website', 'social_media'
  )),
  
  -- Source details
  source_party_id INTEGER REFERENCES case_parties(id),
  source_party_name TEXT,
  source_notes TEXT,
  production_date DATE,
  bates_range TEXT,
  
  -- Content
  description TEXT,
  notes TEXT,
  tags TEXT, -- JSON array for future chronology integration
  extracted_text TEXT, -- Future: OCR for search
  
  -- Audit
  uploaded_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Link documents to parties (many-to-many)
CREATE TABLE party_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  relevance_notes TEXT,
  is_primary_subject BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (party_id) REFERENCES case_parties(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE CASCADE,
  UNIQUE(party_id, document_id)
);

-- Link documents to policies (many-to-many)
CREATE TABLE policy_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  policy_id INTEGER NOT NULL,
  document_id INTEGER NOT NULL,
  policy_doc_type TEXT CHECK(policy_doc_type IN (
    'declaration_page', 'full_policy', 'um_uim_policy',
    'coverage_letter', 'denial_letter', 'other'
  )),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (policy_id) REFERENCES case_policies(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES case_documents(id) ON DELETE CASCADE,
  UNIQUE(policy_id, document_id)
);
```

**Why SOURCE Tracking is Critical:**
1. **Discovery Disputes**: "When did we receive this? Who produced it?"
2. **Privilege Logs**: "This came from expert, not discoverable"
3. **Trial Authentication**: "This is a public record from [agency]"
4. **Tracking Production Obligations**: Date produced, Bates range
5. **Cost Recovery**: Private investigator documents → bill to client
6. **Spoliation Issues**: Tracking when evidence was obtained

#### 4. Future Module Integration

**Discovery Manager (Module F) Integration:**
- Discovery Manager will show: "You have 12 documents in party profiles not yet logged in discovery"
- "Process Investigation Documents" workflow
- Assign Bates numbers, mark as produced
- Same document appears in: Party profile + Discovery log

**Chronology Manager (Module G) Integration:**
- Documents with date metadata can auto-suggest chronology events
- "Add to Chronology" button on any document
- Handle multi-event documents with page-specific marking
- Tags (Pre-DOL/Post-DOL) help auto-organize timeline

**Example Workflow:**
```
Week 1: Investigation Phase
├── Upload ISO report to "Defendant Dental" party
├── Upload MVAR to "Plaintiff Smith" party
├── Upload background check to "Defendant Owner" party
└── No organization needed - just attach to relevant party

Week 8: Discovery Phase (Module F)
├── Discovery Manager: "Process 15 investigation documents"
├── Assign Bates numbers in bulk
├── Mark as produced with production date
└── Documents now appear in Party view + Discovery log

Week 16: Trial Prep Phase (Module G)
├── Open ISO report → "Add to Chronology"
├── System suggests event date from document metadata
├── Event appears in Chronology + links back to original document
└── Update document note → reflects in all views
```

#### 5. Contact Integration (Phase 2 - Pending)

**Two-Way Linking: Parties ↔ Contacts**

From `CONTACT_PARTY_INTEGRATION_PLAN.md`, to be implemented:

```
PHASE 2 FEATURES:
├── "Create Contact from Party" button in party detail
├── "Link to Existing Contact" search/select
├── QuickContactForm component (reusable)
├── Auto-create contacts during case intake (optional checkbox)
└── contact_id field in case_parties table (already added)
```

**Benefits:**
- Unified communication tracking (Module K uses contacts)
- Phone/email stored once, referenced everywhere
- Birthday reminders, communication preferences
- No duplicate entry of personal information

### Implementation Priority

**Phase 1D Implementation Order:**

1. **Database Migration**
   - Add `case_documents`, `party_documents`, `policy_documents` tables
   - Add enhanced fields to `case_parties`
   - Create indexes for performance

2. **Backend (DatabaseService + IPC)**
   - CRUD methods for documents
   - Link/unlink methods for party_documents, policy_documents
   - Enhanced party methods (DOB, SSN, etc.)

3. **Frontend - Move to Tabs**
   - Create `PartiesTab.tsx` (Tier 2 navigation)
   - Create `PoliciesTab.tsx` (Tier 2 navigation)
   - Remove parties/policies sections from `CaseDetail.tsx`
   - Update navigation

4. **Frontend - Document Upload**
   - Create `DocumentUploadModal.tsx` with full SOURCE tracking
   - File upload handling and storage
   - Display documents in party/policy detail views
   - Document preview/download

5. **Frontend - Enhanced Party View**
   - Expandable party cards
   - DOB, SSN, license fields
   - Notes section
   - Document list with upload button

6. **Frontend - Enhanced Policy View**
   - Expandable policy cards
   - Policy document uploads (dec page, full policy, UM/UIM)
   - UM/UIM type handling (stacked vs set-off)

7. **Phase 2 - Contact Integration**
   (Follow `CONTACT_PARTY_INTEGRATION_PLAN.md`)

### Architecture Benefits

**Single Source of Truth:**
- Document uploaded once → appears in multiple contexts
- Update document metadata once → reflects everywhere
- No duplicate files, no version confusion

**Litigation Workflow Alignment:**
- Early: Quick capture without perfect organization
- Middle: Progressive refinement and categorization
- Late: Intelligent cross-referencing across modules

**Foundation for Future Modules:**
- Module F (Discovery): Leverage existing documents
- Module G (Chronology): Auto-suggest from document dates
- Module H (Depositions): Link deposition transcripts
- Module J (Trial Notebook): Pull relevant documents by tag

**Scalability:**
- Linking tables allow unlimited document relationships
- Tags provide flexible categorization without rigid structure
- SOURCE tracking provides audit trail for entire case lifecycle

### Related Documents

- `CONTACT_PARTY_INTEGRATION_PLAN.md` - Detailed Phase 2 implementation plan
- Main Charter Section on Module A Phase 1A/1B - Case and contact foundations
- Module F (Discovery Manager) - Future document production integration
- Module G (Case Chronology) - Future timeline auto-population

---

## CONCLUSION

These corrections ensure:

1. **Clean Architecture** - Each module has a single, clear responsibility
2. **No Duplication** - Data lives in one place, displays elsewhere  
3. **Correct Dependencies** - Communications available when needed
4. **User Experience** - Disposition process matches attorney expectations
5. **Maintainability** - Clear module boundaries prevent future confusion

The key insight: **Module A is a dashboard, not a processor.** It displays the current state of the case by pulling from other modules, but the logic for changing that state lives in the specialized modules (B for tasks/phases, K for communications, C for deadlines).

This addendum supersedes any conflicting information in the original v5.0 Charter and should be considered the authoritative guide for:
- Module A Phase 1C implementation (Case Disposition)
- Module A Phase 1D implementation (Parties, Policies & Documents)
- Module B phase progression features
- Module K positioning and timeline
- Central Document Repository architecture
- Cross-module document intelligence foundation
- Overall implementation order

---

**Addendum Version:** 1.1  
**Date:** November 14, 2025  
**Status:** FINAL - Supersedes conflicting charter sections  
**Author:** Dy's Legal System Architecture Team

**Revision History:**
- v1.0 (November 2025): Initial corrections to module responsibilities
- v1.1 (November 14, 2025): Added Phase 1D - Parties, Policies & Document Management Enhancement