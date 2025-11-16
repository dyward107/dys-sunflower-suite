# 🎯 STRATEGIC IMPLEMENTATION PLAN: Avoiding Rewiring Hell

**Date:** November 16, 2025  
**Status:** Active Game Plan  
**Objective:** Implement complex features in dependency-correct order to avoid backwards rewiring

---

## 🧠 CORE INSIGHT

**The automation, narrative generation, and merge/populate features all depend on a stable foundation of:**
1. **Accurate date/time calculations** (Georgia rules)
2. **Event-driven architecture** (automation triggers)
3. **Document parsing infrastructure** (mark & populate)

**If we build these out of order, we WILL have to rewire.**

---

## 🎯 FOUR ENTRY POINTS FOR EVENT CREATION & AUTOMATION TRIGGERS

**CRITICAL DESIGN DECISION:** Users can create calendar events (and trigger automations) from multiple entry points in the application. This provides maximum flexibility while maintaining a single event/automation system.

### Entry Point #1: Calendar & Deadlines Module (Direct)
**Use case:** Planning ahead, entering court-scheduled dates, adding deadlines

**Flow:**
1. User navigates to Calendar & Deadlines module
2. Clicks "New Event" button
3. Selects event type from categorized dropdown
4. Sets date, time, location
5. Sees automation preview ("This will create 13 tasks...")
6. Confirms → Event created, automation triggers (if enabled)

**Example:** "Trial date was just set by the court for June 15, 2025. I need to enter it and trigger the trial prep workflow."

---

### Entry Point #2: Task Completion (Opportunistic)
**Use case:** Just finished a task, want to trigger next workflow step

**Flow:**
1. User clicks "Mark Complete" on a task
2. Confirmation modal asks: "Create calendar event from this task?"
3. If YES → Event creation form opens (pre-filled with task data)
4. User selects event type (e.g., "Answer Filed")
5. Sees automation preview
6. Confirms → Task marked complete, event created, automation triggers

**Example:** "I just filed the answer. Let me mark my task complete and trigger the discovery workflow at the same time."

---

### Entry Point #3: Correspondence Log (Contextual)
**Use case:** Logging important correspondence that should trigger workflow

**Flow:**
1. User creates/edits correspondence entry (e.g., "Settlement demand received")
2. "Create Calendar Event" button visible in correspondence form
3. Clicks button → Event creation form opens (pre-filled with correspondence data)
4. User selects event type (e.g., "Settlement Demand Received")
5. Sees automation preview ("This will create evaluation task...")
6. Confirms → Correspondence saved, event created, automation triggers

**Example:** "We just received a settlement demand via email. I'm logging the correspondence and want to trigger the settlement evaluation workflow."

---

### Entry Point #4: Case Detail Quick Actions (Future Enhancement)
**Use case:** Common workflows accessible from case page

**Flow:**
1. User viewing case detail page
2. Clicks quick action button (e.g., "File Answer")
3. Mini-form asks for date
4. Confirms → Event created behind the scenes, automation triggers

**Example:** "Quick shortcut to trigger common events without navigating to Calendar."

**Status:** Optional for later - Entry Points 1-3 provide sufficient coverage.

---

### Unified Event Creation Component

All entry points use the same underlying `EventCreationForm` component:
- Consistent event type selection
- Consistent automation preview
- Consistent validation
- Links back to source (task, correspondence, or manual)

```typescript
<EventCreationForm
  caseId={caseId}
  prefilledData={{
    title: taskTitle || correspondenceSubject,
    date: taskCompletionDate || correspondenceDate,
    linkedTaskId: taskId, // if from task
    linkedCorrespondenceId: correspondenceId, // if from correspondence
  }}
  onSuccess={(event) => {
    // Show confirmation
    // Update source record (task/correspondence) with event link
  }}
/>
```

---

## 📋 PHASED IMPLEMENTATION PLAN

### PHASE 2: Date/Time Foundation (1-2 weeks)
**Goal:** Build the Georgia deadline calculator and date utilities that EVERYTHING depends on.

#### Why First?
- Module C (Calendar) needs it
- Module B cadences need it (task due dates)
- All 26 automations need it (deadline triggers)
- Discovery close countdown needs it

#### Tasks:
1. **Create `src/utils/georgiaDeadlines.ts`**
   - Implement O.C.G.A. § 1-3-1 (short vs standard deadlines)
   - Business day calculation (exclude weekends)
   - Holiday detection (9 Georgia holidays)
   - Discovery close calculation (6 months from answer)
   - +3 day electronic service rule (display only, not in calc)

2. **Create Georgia holidays data**
   - `rules/holidays.json` with 2025-2030 holidays
   - Holiday calculation functions (MLK Day = 3rd Monday, etc.)

3. **Write comprehensive tests**
   - Test all examples from MODULE_B_AND_SU_KNOWLEDGE_BASE.md
   - Edge cases (holidays on weekends, year boundaries)
   - Discovery close edge cases

4. **Create date utility functions**
   - `addBusinessDays(startDate, days, holidays)`
   - `addMonths(startDate, months)` for discovery close
   - `daysBetween(date1, date2)`
   - `isBusinessDay(date)`, `isHoliday(date)`

**Acceptance Criteria:**
- ✅ 30-day answer deadline calculates correctly
- ✅ 6-month discovery close calculates correctly
- ✅ Short deadlines (<7 days) exclude intermediate weekends
- ✅ Standard deadlines (≥7 days) extend if landing on weekend/holiday
- ✅ All test cases pass

**Why This Is Critical:**
- If you build automations that trigger "30 days before discovery close" but the discovery close date is wrong, EVERYTHING breaks
- Getting this right NOW saves weeks of debugging later

---

### PHASE 3: Calendar Infrastructure + Event Triggers (1-2 weeks)
**Goal:** Build Module C (Calendar & Deadlines) as the automation context layer + implement multiple event creation entry points.

#### Why Second?
- Automation engine needs calendar events to trigger from
- Task cadences create calendar entries
- Discovery close countdown displays calendar data
- Users need visual deadline tracking
- **Event creation is the primary way to trigger automations**

#### Tasks:
1. **Database schema: `calendar_events` table**
   ```sql
   CREATE TABLE calendar_events (
       id TEXT PRIMARY KEY,
       case_id TEXT NOT NULL,
       task_id TEXT,
       correspondence_id TEXT, -- NEW: link to correspondence entry
       deadline_id TEXT,
       
       -- Event details
       event_type TEXT NOT NULL, -- 'answer_filed', 'mediation_scheduled', 'discovery_sent', etc.
       title TEXT NOT NULL,
       description TEXT,
       event_date DATE NOT NULL,
       event_time TIME,
       all_day INTEGER DEFAULT 1,
       location TEXT,
       
       -- Automation triggers
       trigger_automation INTEGER DEFAULT 0, -- Should this trigger automation?
       automation_triggered INTEGER DEFAULT 0, -- Was automation executed?
       automation_id TEXT, -- Which automation was triggered (e.g., 'AUTO-002')
       automation_log_id TEXT, -- Link to automation_log entry
       
       -- Reminders
       reminder_days TEXT, -- JSON array [30, 14, 7, 3, 1]
       
       -- Metadata
       is_jurisdictional INTEGER DEFAULT 0,
       outlook_event_id TEXT,
       created_by TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       
       FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
       FOREIGN KEY (task_id) REFERENCES tasks(id),
       FOREIGN KEY (correspondence_id) REFERENCES correspondence_log(id),
       FOREIGN KEY (automation_log_id) REFERENCES automation_log(id)
   );
   ```

2. **Event type registry (NEW)**
   - Create `src/constants/eventTypes.ts`
   - Standardized event types with automation mappings
   - Categories: Case Lifecycle, Discovery, Depositions, Experts, Mediation, Trial
   - Each type specifies: label, automation ID, preview text
   
   ```typescript
   export const TRIGGER_EVENT_TYPES = {
     'answer_filed': { 
       automation: 'AUTO-002', 
       label: 'Answer Filed',
       category: 'Case Lifecycle'
     },
     'mediation_scheduled': { 
       automation: 'AUTO-005', 
       label: 'Mediation Scheduled',
       category: 'Mediation'
     },
     // ... etc
     'general_event': {
       automation: null,
       label: 'Other / No Automation',
       category: 'General'
     }
   };
   ```

3. **IPC methods (6 methods)**
   - `createCalendarEvent(eventData)`
   - `getCalendarEvents(caseId?, startDate?, endDate?)`
   - `updateCalendarEvent(eventId, updates)`
   - `deleteCalendarEvent(eventId)`
   - `exportToICS(caseId)`
   - `syncToOutlook(eventId)` (stub for now)

4. **Calendar UI - Direct Event Creation**
   - Monthly calendar view
   - Event list view
   - "New Event" button
   - Event creation modal with:
     - Event type dropdown (categorized)
     - Automation preview panel
     - Trigger checkbox
     - Date/time picker
     - Location field
     - Notes field

5. **Task Completion → Event Creation Flow (NEW)**
   - Task completion confirmation modal
   - "Create calendar event?" option
   - Pre-fill event form from task data
   - Event type selection
   - Automation preview
   - Link task to created event
   
6. **Correspondence → Event Creation Flow (NEW)**
   - "Create Event" button in correspondence entry form
   - Pre-fill event data from correspondence
   - Example: "Settlement demand received" → suggests "Settlement Demand Received" event
   - Link correspondence to created event

7. **Event Creation Shared Component**
   - Reusable `EventCreationForm` component
   - Used by Calendar, Task completion, Correspondence
   - Consistent automation preview
   - Consistent validation

8. **ICS Export**
   - RFC 5545 compliant .ICS generation
   - Download functionality
   - Import to any calendar app

**Acceptance Criteria:**
- ✅ Create calendar event directly from Calendar module
- ✅ Create calendar event from task completion
- ✅ Create calendar event from correspondence entry
- ✅ Event type dropdown shows categorized options
- ✅ Automation preview shows accurate task counts and dates
- ✅ User can disable automation trigger
- ✅ "Other / No Automation" option works for general events
- ✅ Export .ICS file for a case
- ✅ Calendar displays events correctly
- ✅ Jurisdictional deadlines flagged visually
- ✅ Tasks and correspondence link to created events

---

### PHASE 4: Automation Engine Foundation (2 weeks)
**Goal:** Build the event-driven automation system that powers cadences.

#### Why Third?
- Now we have accurate dates (Phase 2)
- Now we have calendar context (Phase 3)
- Cadences can safely spawn with correct due dates
- Automations can create calendar events

#### Tasks:
1. **Create event bus architecture**
   - `src/utils/eventBus.ts` - publish/subscribe system
   - Event types: `case:created`, `answer:filed`, `discovery:received`, etc.
   - Observer pattern for automation triggers

2. **Database: `automations` and `automation_log` tables**
   ```sql
   CREATE TABLE automations (
       id TEXT PRIMARY KEY,
       name TEXT NOT NULL,
       trigger_type TEXT, -- 'field_change', 'time_based', 'manual', 'event'
       trigger_event TEXT, -- 'answer_filed', 'discovery_close_30_days', etc.
       trigger_field TEXT, -- 'answer_filed_date', 'discovery_close_date', etc.
       conditions JSON, -- additional conditions
       actions JSON, -- [{type: 'create_task', data: {...}}, ...]
       is_enabled INTEGER DEFAULT 1,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE automation_log (
       id TEXT PRIMARY KEY,
       automation_id TEXT,
       case_id TEXT,
       trigger_time TIMESTAMP,
       actions_taken TEXT, -- JSON
       success INTEGER,
       error_message TEXT,
       FOREIGN KEY (automation_id) REFERENCES automations(id)
   );
   ```

3. **Automation service layer**
   - `src/services/AutomationService.ts`
   - `registerAutomation(automation)` - add to registry
   - `triggerAutomation(automationId, context)` - execute actions
   - `checkTimeBasedTriggers()` - cron job for date-based triggers
   - Action handlers: `createTask`, `createCalendarEvent`, `updateCasePhase`, etc.

4. **Implement 5 critical automations first**
   - AUTO-001: Case Created → Spawn intake cadence
   - AUTO-002: Answer Filed → Calculate discovery close, spawn discovery cadence
   - AUTO-006: Complaint Received → Calculate answer deadline
   - AUTO-013: 7 Days Before Deadline → Warning notification
   - AUTO-014: 1 Day Before Deadline → Critical alert

5. **Automation settings UI**
   - Toggle automations on/off
   - View automation log
   - Manual trigger button

**Acceptance Criteria:**
- ✅ Creating a case triggers AUTO-001
- ✅ Filing answer triggers AUTO-002 and calculates discovery close correctly
- ✅ Automation log records all executions
- ✅ User can enable/disable automations
- ✅ Time-based triggers fire correctly

---

### PHASE 5: Cadence System (1-2 weeks)
**Goal:** Implement the 18 litigation cadences that spawn structured task groups.

#### Why Fourth?
- Automation engine is ready (Phase 4)
- Date calculator is ready (Phase 2)
- Calendar integration is ready (Phase 3)
- Cadences can safely spawn with dependencies in place

#### Tasks:
1. **Database: `task_groups` table**
   ```sql
   CREATE TABLE task_groups (
       id TEXT PRIMARY KEY,
       case_id TEXT NOT NULL,
       cadence_type TEXT, -- 'INT-001', 'ANS-001', 'DISC-001', etc.
       name TEXT NOT NULL,
       status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
       triggered_by TEXT,
       triggered_at TIMESTAMP,
       completed_at TIMESTAMP,
       FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
   );
   ```

2. **Cadence templates data**
   - `rules/cadences.json` - all 18 cadences with task definitions
   - Each task includes: title, description, priority, due_offset, is_optional

3. **Cadence service**
   - `src/services/CadenceService.ts`
   - `spawnCadence(caseId, cadenceType, triggerData)` - create task group + tasks
   - `getCadenceTemplate(cadenceType)` - load from rules/cadences.json
   - `calculateTaskDueDates(tasks, anchorDate, discoveryCloseDate)` - use Phase 2 calculator

4. **Implement 3 cadences first (test thoroughly)**
   - INT-001: Case Intake (8 tasks)
   - ANS-001: Answer and Initial Pleadings (11 tasks)
   - DISC-001: Discovery Initiated (13 tasks)

5. **Task group UI**
   - Display tasks grouped by cadence
   - Progress bar (X of Y tasks completed)
   - Collapse/expand groups

**Acceptance Criteria:**
- ✅ Answer filed triggers ANS-001 cadence
- ✅ All 11 tasks created with correct due dates
- ✅ Task group shows progress
- ✅ Optional tasks respect settings
- ✅ Discovery-anchored tasks adjust when discovery close changes

---

### PHASE 6: Discovery Close Management (1 week)
**Goal:** Build the real-time discovery close countdown with urgency levels.

#### Why Fifth?
- Date calculator is ready (Phase 2)
- Automations are ready (Phase 4)
- Now we can add visual countdown + smart triggers

#### Tasks:
1. **Discovery close countdown widget**
   - Real-time days remaining calculation
   - 5 urgency levels (green, yellow, orange, red, gray)
   - Color-coded backgrounds and icons
   - Action item suggestions per urgency level
   - Animated pulse for critical (<30 days)

2. **Editable discovery close date**
   - Manual override in case detail
   - Cascade: readjust all incomplete discovery-anchored tasks
   - Lock completed tasks (don't change retroactively)
   - Log change with reason

3. **Implement discovery close automations**
   - AUTO-011: 90 days before → Expert identification
   - AUTO-011B: 30 days before → Final discovery push
   - AUTO-012: 7 days before → URGENT actions

4. **Discovery tracking dashboard**
   - Visual countdown on case detail page
   - Mini countdown in case list
   - Dashboard widget for all cases

**Acceptance Criteria:**
- ✅ Countdown displays correct days remaining
- ✅ Urgency levels change at correct thresholds
- ✅ Editing discovery close date adjusts incomplete tasks
- ✅ Completed tasks remain locked
- ✅ Automations trigger at 90, 30, 7 days before

---

### PHASE 7: Complete Remaining Automations & Cadences (1-2 weeks)
**Goal:** Implement all 26 automations and all 18 cadences.

#### Why Sixth?
- Core automation engine proven (Phase 4)
- Cadence system proven (Phase 5)
- Now scale up to full coverage

#### Tasks:
1. **Implement remaining 21 automations**
   - Document events (5 automations)
   - Deadline triggers (remaining 3 automations)
   - Communication events (5 automations)
   - Milestone events (5 automations)

2. **Implement remaining 15 cadences**
   - DISC-RESP-001: Discovery Response - Our Client
   - DISC-REVIEW-001: Discovery Response Review
   - 6.4-001: Discovery Deficiency Management
   - DEPO-PREP-001: Deposition Scheduling & Prep
   - DEPO-POST-001: Deposition Follow-Up
   - EXPERT-001: Expert Witness Coordination
   - MED-REC-001: Medical Records Management
   - MOTION-001: Motion Practice
   - MSJ-001: Summary Judgment
   - MED-001: Mediation Preparation
   - SETTLE-001: Settlement & Resolution
   - TRIAL-PREP-001: Pre-Trial Preparation
   - TRIAL-001: Trial Management
   - POST-TRIAL-001: Post-Trial & Appeal
   - AMD-CMP-001: Amended Complaint Filed

3. **Phase progression logic**
   - Auto-update `case.phase` on milestones
   - 10 litigation phases
   - Phase history tracking

**Acceptance Criteria:**
- ✅ All 26 automations implemented and toggleable
- ✅ All 18 cadences implemented
- ✅ Phase progression working correctly
- ✅ Automation toggle system functional

---

### PHASE 8: Module D Foundation (2 weeks)
**Goal:** Build Discovery & Evidence Manager infrastructure (needed for mark & populate).

#### Why Seventh?
- Mark & Populate needs document storage
- Narrative generation needs evidence linking
- Template merge needs source documents

#### Tasks:
1. **Database: `discovery_documents` table**
   ```sql
   CREATE TABLE discovery_documents (
       id TEXT PRIMARY KEY,
       case_id TEXT NOT NULL,
       filename TEXT NOT NULL,
       filepath TEXT,
       file_type TEXT, -- 'pdf', 'docx', 'image', 'email', etc.
       file_size INTEGER,
       file_hash TEXT,
       document_type TEXT, -- 'complaint', 'discovery', 'medical', 'expert', etc.
       bates_start TEXT,
       bates_end TEXT,
       page_count INTEGER,
       produced_by TEXT,
       received_date DATE,
       review_status TEXT DEFAULT 'pending',
       notes TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
   );
   ```

2. **File upload system**
   - Drag-and-drop upload
   - File storage in `data/cases/[case_id]/documents/`
   - File hash generation (SHA-256)
   - Metadata extraction

3. **Document viewer (PDF focus)**
   - Embed PDF viewer (react-pdf or pdf.js)
   - Page navigation
   - Zoom controls
   - Search within document
   - **Text selection capability** (critical for mark & populate)

4. **Bates number extraction**
   - Regex patterns for common formats
   - Auto-detect from filename
   - Manual override option

**Acceptance Criteria:**
- ✅ Upload documents to case folder
- ✅ View PDF in embedded viewer
- ✅ Select text in PDF
- ✅ Bates numbers extracted and stored
- ✅ Documents searchable by filename/type

---

### PHASE 9: Mark & Populate Engine (3-4 weeks) ⚠️ HIGH COMPLEXITY
**Goal:** Build the intelligent fact extraction and text marking system.

#### Why Eighth?
- Document infrastructure is ready (Phase 8)
- All source data (persons, correspondence) is ready (Module A)
- Calendar/automation context is ready (Phases 2-7)

#### Tasks:
1. **Database: Mark & Populate tables**
   ```sql
   CREATE TABLE marked_text (
       id TEXT PRIMARY KEY,
       case_id TEXT NOT NULL,
       document_id TEXT NOT NULL,
       marked_text TEXT NOT NULL,
       page_number INTEGER,
       start_index INTEGER,
       end_index INTEGER,
       mark_type TEXT, -- 'fact', 'response', 'issue', 'favorable', 'adverse'
       mark_color TEXT,
       created_by TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (case_id) REFERENCES cases(id),
       FOREIGN KEY (document_id) REFERENCES discovery_documents(id)
   );

   CREATE TABLE fact_extraction (
       id TEXT PRIMARY KEY,
       marked_text_id TEXT NOT NULL,
       fact_date DATE,
       fact_time TIME,
       date_is_approximate INTEGER DEFAULT 0,
       fact_text TEXT,
       parties_involved TEXT, -- JSON array
       fact_type TEXT,
       significance TEXT DEFAULT 'standard',
       auto_extracted TEXT, -- JSON of auto-detected entities
       user_confirmed INTEGER DEFAULT 0,
       FOREIGN KEY (marked_text_id) REFERENCES marked_text(id) ON DELETE CASCADE
   );

   CREATE TABLE response_assignments (
       id TEXT PRIMARY KEY,
       marked_text_id TEXT NOT NULL,
       target_type TEXT, -- 'interrogatory', 'request_production', 'admission', etc.
       target_id TEXT,
       target_field TEXT,
       include_citation INTEGER DEFAULT 1,
       FOREIGN KEY (marked_text_id) REFERENCES marked_text(id) ON DELETE CASCADE
   );
   ```

2. **Text selection and marking UI**
   - Context menu on text selection
   - "Create Fact", "Add to Response", "Flag for Review"
   - Visual highlights with color coding
   - Annotation layer over document

3. **Fact extraction logic**
   - Auto-detect dates from context
   - Party name recognition (from case_persons)
   - Dollar amount extraction
   - Location identification
   - Medical term identification

4. **Response assignment panel**
   - Link marked text to discovery responses
   - Multiple assignments per mark
   - Template field mapping

5. **Source citation tracking**
   - Document ID + page + line
   - Maintain link to original
   - Update when source changes

**Acceptance Criteria:**
- ✅ Select text in document viewer
- ✅ Create fact from selected text
- ✅ Auto-detect date from context
- ✅ Assign text to discovery response
- ✅ Visual highlights persist on document
- ✅ Source citations maintained

**Why This Is Complex:**
- Requires PDF text extraction
- Coordinate-based text selection
- Entity recognition (dates, names, amounts)
- Multi-document state management
- Real-time highlight rendering

---

### PHASE 10: Module E - Case Chronology (2 weeks)
**Goal:** Auto-build case timeline from marked facts.

#### Why Ninth?
- Mark & Populate is ready (Phase 9)
- All data sources are ready (Module A, B, C)
- Facts are extracted and stored

#### Tasks:
1. **Database: `case_facts` table**
   ```sql
   CREATE TABLE case_facts (
       id TEXT PRIMARY KEY,
       case_id TEXT NOT NULL,
       marked_text_id TEXT, -- link to source
       fact_date DATE,
       fact_time TIME,
       date_is_approximate INTEGER DEFAULT 0,
       description TEXT NOT NULL,
       source_type TEXT, -- 'document', 'deposition', 'correspondence', 'manual'
       source_document_id TEXT,
       source_page INTEGER,
       fact_type TEXT,
       significance TEXT DEFAULT 'standard',
       related_persons TEXT, -- JSON array of person_ids
       is_disputed INTEGER DEFAULT 0,
       is_material INTEGER DEFAULT 0,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (case_id) REFERENCES cases(id),
       FOREIGN KEY (marked_text_id) REFERENCES marked_text(id)
   );
   ```

2. **Chronology auto-build**
   - Aggregate facts from marked_text
   - Sort by fact_date (ascending)
   - Group by date or category
   - Include source citations

3. **Timeline visualization**
   - Interactive timeline component
   - Zoom in/out for date ranges
   - Filter by fact type, person, significance
   - Color coding by significance

4. **Gap detection**
   - Identify missing time periods
   - Flag inconsistencies
   - Suggest needed discovery

**Acceptance Criteria:**
- ✅ Facts appear in chronology automatically
- ✅ Timeline visualization interactive
- ✅ Filters work correctly
- ✅ Source citations link back to documents
- ✅ Gap detection identifies missing periods

---

### PHASE 11: Module I - Document Creation & Templates (2-3 weeks)
**Goal:** Build template merge engine that pulls from all data sources.

#### Why Tenth?
- All data sources are ready (Modules A, B, C, E)
- Mark & Populate is ready (Phase 9)
- Facts are extracted and organized (Phase 10)

#### Tasks:
1. **Template system**
   - DOCX template engine (docx-templates or similar)
   - Merge field syntax: `{{case.name}}`, `{{plaintiff.primary.name}}`
   - Conditional sections: `{{#if case.is_wrongful_death}}...{{/if}}`
   - Repeating sections: `{{#each defendants}}...{{/each}}`

2. **Data aggregation service**
   - Pull case metadata (Module A)
   - Pull persons (Module A)
   - Pull facts (Module E)
   - Pull discovery responses (Module D)
   - Pull medical summaries (Module F - future)
   - Combine into template-ready JSON

3. **Template library**
   - Answer template
   - Discovery response templates
   - 6.4 letter template
   - Mediation position statement
   - Settlement demand
   - Deposition outline

4. **Document generation**
   - Fill template with case data
   - Export to DOCX (editable)
   - Export to PDF (final)
   - Version control
   - Revision history

**Acceptance Criteria:**
- ✅ Template merge fields populate correctly
- ✅ Conditional sections work
- ✅ Repeating sections work
- ✅ Export to DOCX and PDF
- ✅ Generated documents include source citations

---

## 🎯 RECOMMENDED IMMEDIATE NEXT STEPS

### Step 1: Assess Module B Current State (1 day)
**Action:** Test what we have and document gaps.

```bash
# Test current Module B functionality
1. Create a task manually - does it work?
2. Edit a task - does it work?
3. Complete a task - does it work?
4. Start/stop timer - does it work?
5. Add task note - does it work? ✅ (we just built this)

# Document what's missing
- Task groups (cadence organization)
- Cadence spawning
- Automation engine
- Discovery close countdown
- LEDES export
```

### Step 2: Start Phase 2 (Georgia Deadline Calculator) (1 week)
**Why:** This is the foundation for EVERYTHING else.

**Immediate tasks:**
1. Create `src/utils/georgiaDeadlines.ts`
2. Create `rules/holidays.json`
3. Write tests for examples in MODULE_B_AND_SU_KNOWLEDGE_BASE.md
4. Test 30-day answer deadline
5. Test 6-month discovery close
6. Test short vs standard deadline logic

**Deliverable:** Fully tested deadline calculator that Module C and Module B can use.

### Step 3: Decide on Calendar (Phase 3) vs Automation (Phase 4) Priority (discussion)
**Question:** Do you want visual calendar first, or automation engine first?

**Option A: Calendar First (recommended)**
- Gives users immediate value (visual deadline tracking)
- Safer to test automation with calendar in place
- ICS export is useful standalone

**Option B: Automation First**
- Faster path to cadence spawning
- More impressive demo (tasks auto-create)
- Riskier without calendar context

---

## 🚨 AVOIDING REWIRING: KEY PRINCIPLES

### 1. **Build Dependencies First**
Never build a feature that depends on something that doesn't exist yet.

❌ BAD: Build cadence spawning before deadline calculator → tasks have wrong due dates → have to recalculate everything later

✅ GOOD: Build deadline calculator first → cadences spawn with correct dates from day one

### 2. **Test Date Logic Exhaustively**
Georgia deadline calculations are CRITICAL. Get them right ONCE.

- Test with real case examples
- Test edge cases (holidays on weekends, year boundaries)
- Document test cases in code
- Regression test every change

### 3. **Use Event Bus from Day One**
Don't build automations with direct function calls. Use event bus.

❌ BAD:
```typescript
function fileAnswer(caseId, date) {
  updateCase(caseId, { answer_filed_date: date });
  spawnDiscoveryCadence(caseId); // hard-coded
  calculateDiscoveryClose(caseId); // hard-coded
}
```

✅ GOOD:
```typescript
function fileAnswer(caseId, date) {
  updateCase(caseId, { answer_filed_date: date });
  eventBus.publish('answer:filed', { caseId, date });
  // Automations listening to 'answer:filed' will handle the rest
}
```

### 4. **Make Automations Toggleable**
Build the toggle system BEFORE you build 26 automations.

- Users need control
- Testing is easier (disable noisy automations)
- Edge cases are safer (disable automation for specific case type)

### 5. **Lock Completed Data**
When something is done, lock it.

- Completed tasks: don't change due dates retroactively
- Filed documents: don't change metadata
- Sent correspondence: don't change content

### 6. **Build Data Infrastructure Before AI Features**
Mark & Populate requires:
- Document storage
- Text extraction
- Entity recognition
- Annotation layer

Don't try to build these simultaneously. Do infrastructure first, then intelligence.

---

## 📊 ESTIMATED TIMELINE (CONSERVATIVE)

| Phase | Duration | Complexity | Risk |
|-------|----------|------------|------|
| Phase 2: Date/Time Foundation | 1-2 weeks | Medium | Low |
| Phase 3: Calendar Infrastructure | 1 week | Low | Low |
| Phase 4: Automation Engine | 2 weeks | High | Medium |
| Phase 5: Cadence System | 1-2 weeks | Medium | Low |
| Phase 6: Discovery Close Mgmt | 1 week | Low | Low |
| Phase 7: Remaining Auto/Cadences | 1-2 weeks | Medium | Low |
| Phase 8: Module D Foundation | 2 weeks | Medium | Low |
| Phase 9: Mark & Populate | 3-4 weeks | **Very High** | **High** |
| Phase 10: Case Chronology | 2 weeks | Medium | Medium |
| Phase 11: Document Templates | 2-3 weeks | High | Medium |

**Total: 16-24 weeks for complete automation + narrative system**

---

## 📧 CORRESPONDENCE LOG → EVENT CREATION (DETAILED)

### Correspondence Entry Form Enhancement

Add "Create Calendar Event" button to correspondence entry form (already built in `src/components/moduleA/Correspondence.tsx`).

### Correspondence Types That Should Trigger Events:

```typescript
// Correspondence types with suggested event mappings
const CORRESPONDENCE_EVENT_SUGGESTIONS = {
  'settlement_demand': {
    eventType: 'settlement_demand_received',
    automation: 'AUTO-016',
    label: 'Settlement Demand Received',
  },
  'discovery_request': {
    eventType: 'discovery_received',
    automation: 'AUTO-007',
    label: 'Discovery Received',
  },
  'deposition_notice': {
    eventType: 'deposition_scheduled',
    automation: 'AUTO-010',
    label: 'Deposition Scheduled',
  },
  'meet_and_confer_scheduled': {
    eventType: 'meet_and_confer_scheduled',
    automation: 'AUTO-018',
    label: 'Meet and Confer Scheduled',
  },
  'expert_report_received': {
    eventType: 'expert_report_received',
    automation: 'AUTO-009',
    label: 'Expert Report Received',
  },
  'medical_records_received': {
    eventType: 'medical_records_received',
    automation: 'AUTO-008',
    label: 'Medical Records Received',
  },
};
```

### UI Flow:

```
┌─────────────────────────────────────────────────────┐
│ Correspondence Entry                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Method: [Email ▼]                                   │
│ Direction: [Received ▼]                             │
│ Date: [01/20/2025]                                  │
│ Time: [2:30 PM]                                     │
│                                                     │
│ From/To: [John Smith (Plaintiff's Counsel)]        │
│                                                     │
│ Subject:                                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Settlement Demand - $250,000                    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Description/Notes:                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Plaintiff demanding $250k to settle. 30-day     │ │
│ │ deadline to respond. Includes updated medical   │ │
│ │ records and wage loss documentation.            │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Attachments: [Choose Files...]                     │
│   📎 settlement_demand_01_20_2025.pdf              │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📅 Create Calendar Event from This?             │ │
│ │                                                 │ │
│ │ This looks like it might trigger a workflow.    │ │
│ │ Would you like to create a calendar event?      │ │
│ │                                                 │ │
│ │   [Yes, Create Event] [No, Just Save]          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│              [Cancel]  [Save Correspondence]        │
└─────────────────────────────────────────────────────┘
```

If user clicks "Yes, Create Event":

```
┌─────────────────────────────────────────────────────┐
│ Create Calendar Event from Correspondence          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Event Title (pre-filled):                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Settlement Demand - $250,000                    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Event Date: [01/20/2025] ← from correspondence     │
│                                                     │
│ Event Type:                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [Settlement Demand Received ▼] ← suggested      │ │
│ │  > Settlement Demand Received                   │ │
│ │    Discovery Received                           │ │
│ │    Expert Report Received                       │ │
│ │    Deposition Scheduled                         │ │
│ │    Other / No Automation                        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ⚙️ Automation Preview:                              │
│ ┌─────────────────────────────────────────────────┐ │
│ │ This will trigger AUTO-016: Settlement Demand   │ │
│ │                                                 │ │
│ │ What will happen:                               │ │
│ │  ✅ Create task: Evaluate demand (3 days)       │ │
│ │  ✅ Create task: Discuss with client (7 days)   │ │
│ │  ✅ Create task: Prepare response (14 days)     │ │
│ │  ✅ Calculate response deadline (if specified)  │ │
│ │  ✅ Send to coverage for input                  │ │
│ │                                                 │ │
│ │ ☑ Trigger this automation                       │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│  [Cancel]  [Save Correspondence & Create Event]    │
└─────────────────────────────────────────────────────┘
```

### Database Link:

```sql
-- Already in schema
CREATE TABLE calendar_events (
    -- ...
    correspondence_id TEXT, -- Links to correspondence_log(id)
    -- ...
    FOREIGN KEY (correspondence_id) REFERENCES correspondence_log(id)
);

-- Update correspondence_log to track linked event
ALTER TABLE correspondence_log ADD COLUMN calendar_event_id TEXT REFERENCES calendar_events(id);
```

### Benefits:

1. **Context Preservation:** Event creation happens in the context where you're working
2. **No Duplicate Entry:** Don't have to log correspondence, then go to Calendar and enter the same info
3. **Natural Workflow:** "I received a demand → I log it → I trigger evaluation workflow"
4. **Bidirectional Link:** Correspondence links to event, event links to correspondence
5. **Audit Trail:** Can see exactly what correspondence triggered which workflow

---

## 💡 MY RECOMMENDATION

**Start Phase 2 (Georgia Deadline Calculator) immediately.**

This is:
1. ✅ Well-defined (clear rules in MODULE_B_AND_SU_KNOWLEDGE_BASE.md)
2. ✅ Foundational (everything depends on it)
3. ✅ Testable (lots of examples to verify)
4. ✅ Low risk (pure logic, no UI complexity)
5. ✅ High value (unlocks Calendar, Automation, Cadences)

**Once Phase 2 is done and tested, you'll have a stable foundation to build on without fear of rewiring.**

---

## 🚀 START HERE: IMMEDIATE NEXT STEPS

### Step 1: Phase 2 - Build Georgia Deadline Calculator (THIS WEEK)

**What we're building:**
- `src/utils/georgiaDeadlines.ts` - Core deadline calculation functions
- `rules/holidays.json` - Georgia holiday data (2025-2030)
- `src/utils/georgiaDeadlines.test.ts` - Comprehensive test suite

**Why this is critical:**
- Module C (Calendar) needs it for deadline calculations
- Module B (Tasks) needs it for due date calculations
- All 26 automations need it for trigger timing
- Discovery close countdown needs it

**Deliverables:**
1. `addBusinessDays(startDate, days, holidays)` - Short deadline logic
2. `addCalendarDays(startDate, days, holidays)` - Standard deadline logic
3. `addMonths(startDate, months)` - Discovery close calculation
4. `isBusinessDay(date)`, `isHoliday(date)` - Helper functions
5. Full test coverage with examples from MODULE_B_AND_SU_KNOWLEDGE_BASE.md

**Estimated Time:** 3-5 days (if focused)

---

### Step 2: Validate with Real Examples (1 day)

**Test cases to verify:**
1. Answer deadline: 30 days from service
2. Discovery close: 6 months from answer
3. Short deadline: 3 days (excluding intermediate weekends)
4. Holiday handling: Deadline landing on Christmas
5. Weekend extension: Deadline landing on Saturday

**Success Criteria:**
- ✅ All test cases pass
- ✅ Edge cases handled (year boundaries, leap years)
- ✅ Holiday detection works for all 9 Georgia holidays
- ✅ Documentation clear for future maintenance

---

### Step 3: Phase 3 - Calendar Infrastructure (NEXT WEEK)

**What we're building:**
- Database schema: `calendar_events` table
- Event type registry: `src/constants/eventTypes.ts`
- Calendar UI: Monthly view, event list, event creation modal
- IPC layer: 6 methods for calendar event CRUD
- Event creation component: Reusable across Calendar, Tasks, Correspondence

**Entry points to implement:**
1. ✅ Direct event creation from Calendar module
2. ✅ Event creation from task completion
3. ✅ Event creation from correspondence log

**Deliverables:**
- Working calendar view
- Event creation from all 3 entry points
- Automation preview (stub logic, real implementation in Phase 4)
- ICS export for compatibility

**Estimated Time:** 5-7 days

---

### Step 4: Phase 4 - Automation Engine (WEEK 3-4)

**What we're building:**
- Event bus architecture
- Automation registry
- 5 initial automations (AUTO-001, AUTO-002, AUTO-006, AUTO-013, AUTO-014)
- Automation toggle system

**This is when automations START WORKING.**

---

## 📊 WEEKLY ROADMAP

| Week | Focus | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| **Week 1** | Phase 2: Deadline Calculator | Date utility functions, holidays, tests | None |
| **Week 2** | Phase 3: Calendar Infrastructure | Calendar events, entry points, ICS export | Phase 2 complete |
| **Week 3** | Phase 4: Automation Engine | Event bus, 5 automations, toggle system | Phase 2 & 3 complete |
| **Week 4** | Phase 5: Cadence System | 3 cadences (INT-001, ANS-001, DISC-001) | Phase 2, 3, 4 complete |

**After Week 4:** You'll have a working automation system that:
- Calculates deadlines correctly (Phase 2)
- Creates calendar events from multiple entry points (Phase 3)
- Triggers automations when events are created (Phase 4)
- Spawns task groups with correct due dates (Phase 5)

**This is the minimum viable automation system.**

---

## ❓ READY TO START?

**I recommend we start Phase 2 RIGHT NOW.**

I can create:
1. `src/utils/georgiaDeadlines.ts` with function stubs
2. `rules/holidays.json` with 2025-2030 data
3. `src/utils/georgiaDeadlines.test.ts` with test cases from the knowledge base
4. Documentation explaining the O.C.G.A. § 1-3-1 logic

**Say the word and I'll start building.** 🌻

