# 🌻 MODULE SPECIFICATIONS QUICK REFERENCE
## One-Page Summaries for Implementation
### Version 5.0 - Planning & Development Tool

**Purpose:** Concise module specifications for rapid development reference  
**Format:** One page per module with acceptance criteria  
**For:** Claude Code, VS Code, Cursor development sessions

---

## MODULE A: CASE MANAGER
**Status:** Phase 1A ✅ Complete | Phase 1B 🔄 Active | Phase 1C 📋 Planned

### Core Function
Foundation module providing case intake, party management, and insurance tracking. All other modules depend on Module A's data structure.

### Database Tables
- `cases` (25 columns) - Main case information
- `case_parties` (11 columns) - Multiple plaintiffs/defendants  
- `case_policies` (9 columns) - Insurance coverage tracking

### Key Features
✅ **Phase 1A (COMPLETE)**
- Case CRUD with 25+ fields
- Auto-generated display names with "et al." logic
- Party management (multiple plaintiffs/defendants)
- Policy tracking with UM/UIM classification
- Full-text search across cases and parties

🔄 **Phase 1B (IN PROGRESS)**
- Extended contact management (adjusters, counsel, experts)
- Contact role assignment
- Communication preference tracking

📋 **Phase 1C (PLANNED)**
- Case lifecycle phases (10 stages)
- Correspondence logging
- Case closure process

### IPC Methods (14 implemented)
```javascript
getCases(filters) → Case[]
createCase(data) → Case
updateCase(id, updates) → void
deleteCase(id) → void
searchCases(query) → Case[]
// Plus 9 party/policy methods
```

### Acceptance Criteria
- [ ] Cases create/read/update/delete working
- [ ] Search includes all parties
- [ ] Display names show "et al." correctly
- [ ] Policies link to correct cases
- [ ] Soft delete preserves data

### Implementation Notes
- Uses sql.js (pure JavaScript SQLite)
- Support both snake_case (DB) and camelCase (UI)
- Retry logic required for IPC initialization
- CommonJS preload script (no ES modules!)

---

## MODULE B: TASK & WORKFLOW MANAGER
**Status:** Database ✅ | IPC ✅ | UI 🔄 In Progress

### Core Function
Comprehensive task management with 18 litigation cadences containing 251+ predefined tasks for Georgia civil defense practice.

### Database Tables
- `tasks` - Individual task records
- `task_groups` - Cadence instances
- `time_entries` - Time tracking
- `cadence_templates` - Workflow definitions
- `automations` - Trigger rules

### Key Features
- Task creation with P1-P4 priorities
- 18 comprehensive litigation cadences
- Timer-based time tracking
- LEDES billing export
- Overdue task highlighting
- Phase-based organization
- Billable/non-billable tracking

### The 18 Cadences
1. Case Intake & Initial Setup (9 tasks)
2. Answer and Initial Pleadings (15 tasks)
3. New Plaintiff Added (10 tasks)
4. Discovery Initiated (17 tasks)
5. Discovery Response - Our Client (15 tasks)
6. Discovery Response - Other Parties (14 tasks)
7. Discovery Deficiency Management (12 tasks)
8. Deposition Scheduling & Prep (16 tasks)
9. Deposition Follow-Up (8 tasks)
10. Expert Witness Coordination (14 tasks)
11. Medical Records Management (12 tasks)
12. Motion Practice (15 tasks)
13. Summary Judgment (18 tasks)
14. Mediation Preparation (14 tasks)
15. Settlement & Resolution (16 tasks)
16. Pre-Trial Preparation (20 tasks)
17. Trial Management (18 tasks)
18. Post-Trial & Appeal (15 tasks)

### IPC Methods
```javascript
getTasks(caseId, filters) → Task[]
createTask(data) → Task
completeTask(taskId) → void
triggerCadence(caseId, type) → TaskGroup
getTimeEntries(taskId) → TimeEntry[]
exportLEDES(caseId, dateRange) → string
```

### Acceptance Criteria
- [ ] All 18 cadences trigger correctly
- [ ] Timer tracks time accurately
- [ ] LEDES export validates
- [ ] Overdue tasks highlighted red
- [ ] Task filters working
- [ ] Phase updates cascade

---

## MODULE C: CALENDAR & DEADLINES
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Georgia-specific deadline calculation with intelligent scheduling and comprehensive calendar integration.

### Database Tables
- `deadlines` - Calculated and manual deadlines
- `calendar_events` - Scheduled events
- `holidays` - Federal and Georgia holidays

### Key Features
- O.C.G.A. § 9-11-6 deadline calculation
- 11 federal holidays
- Warning system (green→yellow→orange→red)
- ICS calendar export
- Manual deadline override
- Jurisdictional deadline protection

### Deadline Rules
**Short (<7 days):** Exclude intermediate weekends/holidays  
**Standard (≥7 days):** Count all days, extend if ending on weekend/holiday  
**Day 1:** Never count trigger day  
**Electronic service:** +3 days warning (not calculated)

### Warning Thresholds
**Standard Tasks:**
- 🟢 >7 days
- 🟡 2-7 days
- 🔴 ≤1 day
- ⚫ Overdue

**Discovery/Critical:**
- 🟢 >30 days
- 🟡 8-30 days
- 🟠 2-7 days
- 🔴 ≤1 day

### IPC Methods
```javascript
calculateDeadline(startDate, days, type) → Date
getDeadlines(caseId) → Deadline[]
createDeadline(data) → Deadline
exportToICS(events) → string
```

### Acceptance Criteria
- [ ] Georgia deadlines calculate correctly
- [ ] Holidays detected properly
- [ ] Warning colors display
- [ ] ICS export valid format
- [ ] Manual override works
- [ ] Jurisdictional deadlines protected

---

## MODULE D: DISCOVERY & EVIDENCE
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Comprehensive discovery management with automatic Bates detection, deficiency tracking, and compliance reporting.

### Database Tables
- `discovery_documents` - Document tracking
- `discovery_productions` - Production sets
- `discovery_deficiencies` - Gap tracking

### Key Features
- Multi-format Bates extraction
- Automatic gap detection
- OCR with confidence scoring
- 6.4 letter generation
- Review workflow (pending→reviewed→produced)
- Production index generation

### Bates Formats Supported
```
DEF001, DEF002 (prefix)
DEF_001, DEF_0001 (underscore)
DEFENDANT_0001 (full word)
DEF_000001 (custom width)
```

### Review Workflow
1. **Pending** - Newly uploaded
2. **Under Review** - Being analyzed
3. **Produced** - Provided in discovery
4. **Withheld** - Privilege claimed
5. **Redacted** - Produced with redactions

### IPC Methods
```javascript
uploadDocument(caseId, file, metadata) → Document
detectBatesGaps(caseId) → BatesGap[]
generateDeficiencyLetter(caseId, gaps) → string
createProduction(caseId, docs) → Production
```

### Acceptance Criteria
- [ ] Bates extraction accurate
- [ ] Gap detection working
- [ ] OCR processing documents
- [ ] 6.4 letters generate
- [ ] Production indices export
- [ ] Search across OCR text

---

## MODULE E: CHRONOLOGY & NARRATIVE
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Narrative intelligence center automatically constructing case stories from marked facts with interactive timeline visualization.

### Database Tables
- `case_facts` - Extracted facts with sources
- `fact_exhibits` - Supporting documents
- `narrative_templates` - Export formats

### Key Features
- Mark-and-Populate fact extraction
- Interactive timeline visualization
- Material fact auto-suggestion
- Gap and inconsistency detection
- Multiple narrative perspectives
- Source strength indicators

### Fact Components
- Date/time of occurrence
- Description (extracted text)
- Source document with page/line
- Fact type classification
- Significance rating
- Related parties
- Supporting exhibits

### Narrative Templates
1. Executive Summary (1-2 pages)
2. Detailed Chronology
3. Liability Narrative
4. Damages Narrative
5. Defense Narrative
6. By Issue Organization

### IPC Methods
```javascript
createFact(factData) → Fact
getFacts(caseId, filters) → Fact[]
generateChronology(caseId, template) → Document
detectGaps(caseId) → TimeGap[]
suggestMaterialFacts(caseId) → Fact[]
```

### Acceptance Criteria
- [ ] Mark-and-Populate working
- [ ] Facts link to sources
- [ ] Timeline interactive
- [ ] Gap detection accurate
- [ ] Material fact suggestions relevant
- [ ] Narratives generate properly

---

## MODULE F: MEDICAL CHRONOLOGY
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Specialized medical record analysis with treatment chronologies, billing summaries, and lien tracking.

### Database Tables
- `medical_providers` - Provider tracking
- `medical_visits` - Treatment records
- `medical_bills` - Billing analysis

### Key Features
- Provider management by specialty
- Treatment chronology by date/provider
- Billing analysis with lien tracking
- ICD-10/CPT code support
- Life care planning
- Present value calculations

### Provider Categories
- Emergency (EMS, ER)
- Hospitals
- Primary care
- Specialists
- Diagnostics
- Physical therapy
- Mental health
- Pharmacies

### Billing Tracking
- Billed amounts
- Paid by insurance
- Adjustments/write-offs
- Out-of-pocket
- **Lien amounts (separate)**
- Medicare/Medicaid liens

### IPC Methods
```javascript
addProvider(caseId, provider) → Provider
addVisit(providerId, visit) → Visit
calculateMedicalTotal(caseId) → Summary
generateMedicalChronology(caseId) → Document
trackLien(providerId, amount) → Lien
```

### Acceptance Criteria
- [ ] Provider tracking complete
- [ ] Visit chronology accurate
- [ ] Billing calculations correct
- [ ] Liens tracked separately
- [ ] Export templates work
- [ ] Life care calculations accurate

---

## MODULE G: ISSUES & CLAIMS
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Intelligent claim analysis linking facts to legal elements with strategic development of claims and defenses.

### Database Tables
- `case_claims` - Claim tracking
- `claim_elements` - Legal elements
- `affirmative_defenses` - Defense tracking
- `issue_templates` - Georgia templates

### Key Features
- Legal element tracking
- Fact-to-element linking
- Georgia case law integration
- Affirmative defense analysis
- Strength assessment
- Strategic recommendations

### Common Georgia Claims
- Negligence
- Premises liability
- Product liability
- Medical malpractice
- Wrongful death
- Survival action
- Loss of consortium
- Punitive damages

### Element Tracking
```
☑ Duty (Facts: #23, #45)
☑ Breach (Facts: #67, #89)
☐ Causation (disputed)
☑ Damages (medical bills)
```

### IPC Methods
```javascript
createClaim(caseId, claim) → Claim
linkFactToElement(factId, elementId) → void
assessClaimStrength(claimId) → Assessment
getStrategicRecommendations(caseId) → Strategy[]
```

### Acceptance Criteria
- [ ] Claims track elements
- [ ] Facts link correctly
- [ ] Case law citations included
- [ ] Defense analysis complete
- [ ] Recommendations logical
- [ ] Export formats professional

---

## MODULE H: DEPOSITION PREP
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Intelligent deposition preparation with fact-driven outlines, automatic exhibit selection, and prior testimony integration.

### Database Tables
- `deposition_outlines` - Outline storage
- `outline_topics` - Question organization
- `deposition_exhibits` - Exhibit management
- `prior_testimony` - Previous statements

### Key Features
- 11-section outline structure
- Smart question suggestions
- Automatic exhibit selection
- Prior testimony comparison
- Template by witness type
- Impeachment sequence generation

### Outline Structure
1. Background & Preliminaries
2. Personal Background
3. Incident-Specific Topics
4. Discovery Responses
5. Exhibits
6. Prior Admissions
7. Medical History
8. Criminal History
9. Social Media
10. Expert Opinions
11. Closing Questions

### Witness Templates
- Party plaintiff
- Party defendant
- Corporate representative
- Expert witness
- Treating physician
- Fact witness

### IPC Methods
```javascript
createOutline(deposition) → Outline
suggestQuestions(witnessType, facts) → Question[]
selectExhibits(depositionId) → Exhibit[]
compareTestimony(witnessId) → Inconsistency[]
```

### Acceptance Criteria
- [ ] Outline structure complete
- [ ] Questions source from facts
- [ ] Exhibits properly linked
- [ ] Prior testimony integrated
- [ ] Templates customizable
- [ ] Export formats professional

---

## MODULE I: DOCUMENT CREATION
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Comprehensive document generation through intelligent templates that auto-populate from case data and facts.

### Database Tables
- `document_templates` - Template library
- `generated_documents` - Created documents
- `document_versions` - Version control
- `response_mappings` - M&P linkages

### Key Features
- 50+ legal templates
- Intelligent field mapping
- Mark-and-Populate integration
- Multi-document generation
- Version control
- Conditional logic

### Template Categories
**Pleadings:** Answer, Motions, Counterclaims  
**Discovery:** Interrogatories, RFPs, RFAs  
**Correspondence:** Letters, Notices, Demands  
**Reports:** Evaluations, Status, Position Statements

### Merge Fields
```
{{case.name}}
{{plaintiff.primary.name}}
{{facts.liability}}
{{damages.medical.total}}
{{#if case.is_wrongful_death}}
  Include WD language
{{/if}}
```

### IPC Methods
```javascript
generateDocument(templateId, caseId) → Document
generateMultiple(templates, caseId) → Document[]
mapResponseField(sourceText, targetField) → void
exportDocument(docId, format) → File
```

### Acceptance Criteria
- [ ] Templates auto-populate
- [ ] M&P integration works
- [ ] Multi-doc generation functional
- [ ] Version control tracking
- [ ] Conditional logic executes
- [ ] Export formats valid

---

## MODULE J: TRIAL NOTEBOOK
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Comprehensive trial preparation organizing evidence, witnesses, and legal arguments into cohesive presentation strategy.

### Database Tables
- `trial_exhibits` - Exhibit tracking
- `trial_witnesses` - Witness management
- `jury_instructions` - Instruction sets

### Key Features
- Exhibit organization (plaintiff/defendant)
- Witness packet generation
- Direct/cross outlines
- Jury instruction management
- Trial brief generation
- Real-time trial tracking

### Exhibit Management
- Pre-marked numbers/letters
- Admission status tracking
- Objection logging
- Court rulings
- Authentication tracking

### Daily Trial Prep
- Witness order
- Exhibit checklist
- Technology needs
- Courtroom setup
- Client preparation

### IPC Methods
```javascript
createExhibitList(caseId) → ExhibitList
generateWitnessPacket(witnessId) → Document
createJuryInstructions(caseId) → Instructions
trackTrialDay(date, events) → void
```

### Acceptance Criteria
- [ ] Exhibits track admission
- [ ] Witness outlines complete
- [ ] Jury instructions formatted
- [ ] Trial brief generates
- [ ] Daily tracking works
- [ ] Export formats ready

---

## MODULE K: COMMUNICATIONS
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Centralized communication tracking and contact management for all case-related interactions.

### Database Tables
- `contacts` - Global contact database
- `case_contacts` - Case relationships
- `communications` - Communication log

### Key Features
- Contact categorization
- Communication logging
- Email integration
- Correspondence tracking
- Thread management
- Full-text search

### Contact Categories
- Insurance (adjusters, claims)
- Legal (opposing, co-counsel)
- Medical (providers, records)
- Experts (retained, consulting)
- Witnesses (fact, character)
- Court (judges, clerks)

### Communication Types
- Phone calls
- Emails
- Letters
- Text messages
- Meetings
- Video conferences

### IPC Methods
```javascript
addContact(contact) → Contact
logCommunication(comm) → Communication
searchCommunications(query) → Communication[]
createEmailFromTemplate(templateId) → Email
```

### Acceptance Criteria
- [ ] Contacts manage properly
- [ ] Communications log completely
- [ ] Email templates work
- [ ] Search accurate
- [ ] Correspondence chains link
- [ ] Integration points functional

---

## MODULE L: ANALYTICS DASHBOARD
**Status:** 📋 Specification Complete | Development Pending

### Core Function
Comprehensive analytics across all modules providing insights into case metrics, productivity, and compliance.

### Database Views
- `case_metrics` - Case statistics
- `task_metrics` - Task analytics
- `deadline_compliance` - Compliance rates

### Key Features
- Case distribution analysis
- Task productivity metrics
- Deadline compliance tracking
- Financial analytics
- Custom report builder
- Real-time dashboard widgets

### Dashboard Priority
1. Overdue tasks (critical)
2. Discovery deadlines (30 days)
3. Active cases (by phase)
4. This week's calendar
5. Recent time entries
6. Task completion rate
7. Case trends
8. Billable hours

### Standard Reports
- Executive summary
- Attorney productivity
- Case status report
- Deadline compliance
- Financial summary

### IPC Methods
```javascript
getMetrics(type, dateRange) → Metrics
generateReport(template, filters) → Report
exportDashboard(format) → File
scheduleReport(template, schedule) → void
```

### Acceptance Criteria
- [ ] Metrics calculate correctly
- [ ] Dashboard widgets interactive
- [ ] Custom reports generate
- [ ] Export formats work
- [ ] Real-time updates
- [ ] Historical tracking

---

## MODULE SU: SHARED UTILITIES
**Status:** ✅ Core Components Built

### Core Function
Automation engine and shared utilities powering intelligent behavior across all modules.

### Key Components
- Georgia deadline calculator
- 25 automation rules
- Discovery countdown
- Export utilities
- Data validation

### The 25 Automations
**Case State (5):** Opened, Answer Filed, Discovery, Mediation, Closed  
**Documents (5):** Complaint, Discovery, Medical, Expert, Deposition  
**Deadlines (5):** 30 days before, 7 days, 1 day, Missed, Extended  
**Communications (5):** Demand, 6.4 Letter, Meet/Confer, Client, Expert  
**Milestones (5):** Phase Change, Trial Set, Settlement, Closed, Reopened

### Deadline Calculation
```javascript
if (days < 7) {
  // Exclude weekends/holidays
} else {
  // Count all, extend if weekend
}
// Never count day 1
```

### Discovery Countdown
- 🟢 >90 days (on track)
- 🟡 60-90 days (plan)
- 🟠 30-60 days (urgent)
- 🔴 <30 days (critical)

### Export Formats
- DOCX (python-docx)
- PDF (print-to-pdf)
- CSV (native)
- ICS (calendar)
- ZIP (archives)

### Acceptance Criteria
- [ ] All 25 automations trigger
- [ ] Georgia deadlines accurate
- [ ] Countdown updates real-time
- [ ] Exports generate valid files
- [ ] Automation log complete

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Weeks 1-3)
- [ ] Complete Module A Phase 1B (contacts)
- [ ] Complete Module A Phase 1C (lifecycle)
- [ ] Finalize Module B UI components
- [ ] Test all Module B cadences

### Phase 2: Core Legal (Weeks 4-7)
- [ ] Build Module C (Calendar)
- [ ] Build Module D (Discovery)
- [ ] Build Module E (Chronology)
- [ ] Integrate Mark-and-Populate

### Phase 3: Specialized (Weeks 8-11)
- [ ] Build Module F (Medical)
- [ ] Build Module G (Issues)
- [ ] Build Module H (Deposition)
- [ ] Build Module I (Documents)

### Phase 4: Trial & Analytics (Weeks 12-14)
- [ ] Build Module J (Trial)
- [ ] Build Module K (Communications)
- [ ] Build Module L (Analytics)

### Phase 5: Integration (Weeks 15-16)
- [ ] End-to-end testing
- [ ] Data migration from Case Keeper
- [ ] Production deployment
- [ ] User documentation

---

## GOLDEN RULES REMINDER

1. **Database-First:** Schema before code
2. **CommonJS Preload:** No ES modules!
3. **Naming Flexibility:** Support both conventions
4. **Retry Logic:** IPC needs time
5. **Test Incrementally:** After each phase
6. **Backward Compatible:** ALTER, never DROP

---

**Document Version:** 5.0  
**Total Pages:** 20  
**Modules Specified:** 12 + SU  
**Ready for:** Immediate Implementation