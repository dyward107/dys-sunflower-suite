# 🌻 MODULE A - PHASE 1A SPECIFICATION
## Core Case Database Foundation

**For:** Dy (Review & Approval)  
**Date:** November 12, 2025  
**Purpose:** Complete specification for Module A Phase 1A before handoff to Claude Code  
**Timeline:** Week 1 of Module A (5-7 days)

---

## 📋 EXECUTIVE SUMMARY

**What Phase 1A Delivers:**
A complete case database foundation that captures everything about your cases at intake:
- Core case identification (name, C/M number, lead attorney)
- All parties (plaintiffs and defendants) with service/answer tracking
- Venue information (court, judge, clerk, staff attorney)
- Case type and special flags (wrongful death, survival action, etc.)
- Policy information (primary, UM/UIM, excess)
- Discovery deadline tracking (manual for now, automated in Module C)
- Full search and filtering capabilities

**What Phase 1A Does NOT Include:**
- Contact management (Phase 1B)
- Correspondence logging (Phase 1C)
- Task automation (Module B)
- Deadline calculations (Module C)

**Why This Approach:**
Build the foundation first, test it thoroughly, then add contacts and correspondence. If Phase 1A breaks, we don't have to untangle other features.

---

## 🗄️ DATABASE DESIGN

### **Table 1: `cases`**

The main case record. One row per case.

| Field Name | Data Type | Purpose | Example |
|------------|-----------|---------|---------|
| `id` | INTEGER PRIMARY KEY | Unique case identifier | 1 |
| `case_name` | TEXT NOT NULL | Full display name | "Smith v. Jones, et al." |
| `cm_number` | TEXT UNIQUE NOT NULL | Client/Matter number | "2024-1234" |
| `lead_attorney` | TEXT NOT NULL | Assigned attorney | "Rebecca Strickland" |
| `primary_plaintiff_name` | TEXT NOT NULL | Main plaintiff (for display) | "John Smith" |
| `primary_defendant_name` | TEXT NOT NULL | Main defendant (for display) | "ABC Corporation" |
| `venue_court` | TEXT | Court name | "Fulton County Superior Court" |
| `venue_judge` | TEXT | Presiding judge | "Hon. Jane Smith" |
| `venue_clerk` | TEXT | Clerk name | "John Doe" |
| `venue_staff_attorney` | TEXT | Staff attorney (optional) | "Sarah Johnson" |
| `phase` | TEXT NOT NULL | Open, Pending, or Closed | "Open" |
| `status` | TEXT NOT NULL | Current case status | "Discovery" |
| `case_type` | TEXT NOT NULL | Type of case | "Motor Vehicle Accident" |
| `case_subtype` | TEXT | Subtype if applicable | "Commercial/Trucking" |
| `date_opened` | TEXT | Intake date (ISO 8601) | "2024-11-12" |
| `date_of_loss` | TEXT | Accident/incident date | "2024-10-15" |
| `date_closed` | TEXT | Closed date (if closed) | NULL or "2025-03-15" |
| `is_wrongful_death` | INTEGER DEFAULT 0 | Wrongful death flag | 0 or 1 |
| `is_survival_action` | INTEGER DEFAULT 0 | Survival action flag | 0 or 1 |
| `has_deceased_defendants` | INTEGER DEFAULT 0 | Deceased defendant flag | 0 or 1 |
| `discovery_close_date` | TEXT | Manual discovery deadline | "2025-05-12" |
| `discovery_deadline_extended` | INTEGER DEFAULT 0 | Has deadline been extended? | 0 or 1 |
| `discovery_deadline_notes` | TEXT | Why deadline changed | "Consent motion granted 3/15" |
| `notes` | TEXT | General case notes | "High exposure case..." |
| `created_at` | TEXT DEFAULT CURRENT_TIMESTAMP | When record created | "2024-11-12 14:30:00" |
| `updated_at` | TEXT DEFAULT CURRENT_TIMESTAMP | When record updated | "2024-11-12 15:45:00" |

**Indexes for Performance:**
- Index on `cm_number` (unique lookups)
- Index on `lead_attorney` (filtering)
- Index on `status` (filtering)
- Index on `phase` (filtering)

---

### **Table 2: `case_parties`**

Stores all plaintiffs and defendants. Multiple rows per case.

| Field Name | Data Type | Purpose | Example |
|------------|-----------|---------|---------|
| `id` | INTEGER PRIMARY KEY | Unique party identifier | 1 |
| `case_id` | INTEGER NOT NULL | Links to cases.id | 1 |
| `party_type` | TEXT NOT NULL | "plaintiff" or "defendant" | "defendant" |
| `party_name` | TEXT NOT NULL | Full party name | "ABC Corporation" |
| `is_corporate` | INTEGER DEFAULT 0 | Corporate vs. individual | 1 |
| `is_insured` | INTEGER DEFAULT 0 | Is this party insured? | 1 |
| `is_presuit` | INTEGER DEFAULT 0 | Case in pre-suit phase? | 0 |
| `monitor_for_service` | INTEGER DEFAULT 0 | Waiting for service? | 1 |
| `service_date` | TEXT | When served (ISO 8601) | "2024-11-15" |
| `answer_filed_date` | TEXT | When answer filed | "2024-12-15" |
| `notes` | TEXT | Party-specific notes | "Primary defendant, high exposure" |
| `created_at` | TEXT DEFAULT CURRENT_TIMESTAMP | When record created | "2024-11-12 14:30:00" |

**Foreign Key:** `case_id` references `cases(id)` ON DELETE CASCADE

**Indexes for Performance:**
- Index on `case_id` (joins)
- Index on `party_name` (searching)
- Index on `party_type` (filtering)

**Important Notes:**
- First plaintiff added becomes "primary plaintiff"
- First defendant added becomes "primary defendant"
- All party names are searchable (even if not in display name)
- Each defendant tracks their own service/answer dates

---

### **Table 3: `case_policies`**

Stores insurance policy information. Multiple policies per case.

| Field Name | Data Type | Purpose | Example |
|------------|-----------|---------|---------|
| `id` | INTEGER PRIMARY KEY | Unique policy identifier | 1 |
| `case_id` | INTEGER NOT NULL | Links to cases.id | 1 |
| `policy_type` | TEXT NOT NULL | Primary, UM/UIM, or Excess | "Primary" |
| `carrier_name` | TEXT NOT NULL | Insurance carrier | "State Farm" |
| `policy_number` | TEXT | Policy number | "SF-123456789" |
| `policy_limits` | TEXT | Coverage limits | "$100,000/$300,000" |
| `we_are_retained_by` | INTEGER DEFAULT 0 | Retained by this carrier? | 1 |
| `umuim_type` | TEXT | Add-on or Set-off | "Add-on" |
| `notes` | TEXT | Policy-specific notes | "Excess triggered above $1M" |
| `created_at` | TEXT DEFAULT CURRENT_TIMESTAMP | When record created | "2024-11-12 14:30:00" |

**Foreign Key:** `case_id` references `cases(id)` ON DELETE CASCADE

**Indexes for Performance:**
- Index on `case_id` (joins)
- Index on `policy_type` (filtering)

---

## 🎨 USER INTERFACE DESIGN

### **Screen 1: Case List View**

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [🔍 Search cases...]         [Lead Attorney ▼] [Status ▼]     │
│  [+ New Case]                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Case Name              │ C/M Number │ Lead Atty    │ Status    │
├─────────────────────────────────────────────────────────────────┤
│ Smith v. Jones, et al. │ 2024-1234  │ R. Strickland│ Discovery │
│ Doe v. ABC Corp        │ 2024-1235  │ K. Wagner    │ Pre-Trial │
│ ...                    │ ...        │ ...          │ ...       │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Search bar: searches case_name, cm_number, ANY party name from case_parties
- Filter by: Lead Attorney, Status, Phase
- Click row → opens Case Detail view
- "New Case" button → opens Case Intake Form
- Table sortable by any column
- Empty state: "No cases yet. Click 'New Case' to get started."

**Color Scheme:**
- Background: Sunflower 50 (#FFFBEB)
- Header: Sunflower 400 (#FBBF24)
- Hover: Sunflower 100 (#FEF3C7)
- Text: Gray 800

---

### **Screen 2: Case Intake Form (New/Edit)**

**Layout Sections:**

#### **Section 1: Case Identification**
```
Case Name: [___________________]  (auto-populated from parties)
C/M Number: [___________________] (required, unique)
Lead Attorney: [Dropdown ▼] (required)

Venue Information:
  Court Name: [___________________]
  Presiding Judge: [___________________]
  Clerk: [___________________]
  Staff Attorney: [___________________] (optional)

Phase: ( ) Open  ( ) Pending  ( ) Closed (radio buttons)

Status: [Dropdown ▼]
  - Pre-Suit/Intake
  - Suit Filed/Monitor for Service
  - Discovery
  - Pending Mediation/Settlement
  - Pre-Trial/Pending Dispositive Motions
  - Trial
  - Dismissed
  - Settled
  - Closed File
```

#### **Section 2: Parties**
```
PRIMARY PLAINTIFF
Name: [___________________] (required)
[+ Add Additional Plaintiff]

PRIMARY DEFENDANT
Name: [___________________] (required)
[ ] Corporate Defendant    [ ] Insured

Service & Answer Tracking:
[ ] Pre-Suit    [ ] Monitor for Service
Service Date: [____/____/________]
Answer Filed Date: [____/____/________]

[+ Add Additional Defendant]

─────────────────────────────────
All Parties:
• John Smith (Plaintiff)                                    [Edit] [Remove]
• ABC Corporation (Defendant, Corporate, Insured)           [Edit] [Remove]
  Served: 11/15/2024 | Answer Filed: 12/15/2024
• XYZ Inc (Defendant, Corporate, Monitor for Service)       [Edit] [Remove]
```

**Modal for Additional Parties:**
```
┌─────────────────────────────────────┐
│  Add Defendant                      │
├─────────────────────────────────────┤
│  Name: [___________________]        │
│  [ ] Corporate  [ ] Insured         │
│  [ ] Pre-Suit   [ ] Monitor Service │
│  Service Date: [____/____/________] │
│  Answer Date:  [____/____/________] │
│  Notes: [___________________]       │
│                                     │
│         [Cancel]  [Add Defendant]   │
└─────────────────────────────────────┘
```

#### **Section 3: Case Details**
```
Case Type: [Dropdown ▼]
  - Motor Vehicle Accident
  - Pedestrian-Vehicle
  - Product Liability
  - Premises Liability - General
  - Premises Liability - Slip and Fall
  - Premises Liability - Negligent Security
  - Animal Bite
  - Medical Malpractice
  - Nursing Home Abuse
  - Sex Trafficking
  - Food Poisoning
  - Boating Accident
  - Construction Accident

Case Subtype: [Dropdown ▼] (conditional, e.g., if MVA selected)
  - Commercial/Trucking
  - Uninsured/Underinsured Motorist

Date Opened (Intake): [____/____/________] (required)
Date of Loss: [____/____/________] (required)

Special Flags:
[ ] Wrongful Death
[ ] Survival Action
[ ] Deceased Defendants
```

#### **Section 4: Discovery Deadline**
```
Discovery Close Date: [____/____/________]
[ ] Deadline Extended
Extension Notes: [___________________________]
```

#### **Section 5: Policy Information**
```
[+ Add Policy]

─────────────────────────────────
Current Policies:
• Primary - State Farm | SF-123456 | $100K/$300K | Retained by ✓  [Edit] [Remove]
• UM/UIM - Allstate | AL-987654 | $50K | Add-on                    [Edit] [Remove]
```

**Modal for Add Policy:**
```
┌─────────────────────────────────────┐
│  Add Insurance Policy               │
├─────────────────────────────────────┤
│  Policy Type: [Dropdown ▼]         │
│    - Primary                        │
│    - UM/UIM                         │
│    - Excess/Umbrella                │
│                                     │
│  Carrier: [___________________]     │
│  Policy #: [___________________]    │
│  Limits: [___________________]      │
│                                     │
│  [ ] We are retained by this carrier│
│                                     │
│  UM/UIM Type: [Dropdown ▼]         │
│    - Add-on                         │
│    - Set-off                        │
│                                     │
│  Notes: [___________________]       │
│                                     │
│         [Cancel]  [Add Policy]      │
└─────────────────────────────────────┘
```

#### **Section 6: Notes**
```
General Case Notes:
┌─────────────────────────────────────┐
│                                     │
│  [Large text area]                  │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

#### **Action Buttons**
```
[Cancel]  [Save]  [Save & Backup]
```

**Button Behavior:**
- **Cancel:** Close form without saving, confirm if changes made
- **Save:** Save to database, show success message, stay on form
- **Save & Backup:** Save to database + trigger manual backup

---

### **Screen 3: Case Detail View**

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Cases                                      [Edit Case]│
├─────────────────────────────────────────────────────────────────┤
│  Smith v. Jones, et al.                                         │
│  C/M: 2024-1234  |  Lead: Rebecca Strickland  |  Status: Disc. │
├─────────────────────────────────────────────────────────────────┤
│  📋 CASE DETAILS                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Venue: Fulton County Superior Court                       │ │
│  │ Judge: Hon. Jane Smith                                    │ │
│  │ Clerk: John Doe                                           │ │
│  │ Staff Attorney: Sarah Johnson                             │ │
│  │                                                           │ │
│  │ Type: Motor Vehicle Accident (Commercial/Trucking)        │ │
│  │ Date Opened: 11/12/2024                                   │ │
│  │ Date of Loss: 10/15/2024                                  │ │
│  │                                                           │ │
│  │ Discovery Close: 05/12/2025 (Extended ✓)                 │ │
│  │ Extension Notes: Consent motion granted 3/15              │ │
│  │                                                           │ │
│  │ Flags: Wrongful Death ✓                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  👥 PARTIES                                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Plaintiffs:                                                │ │
│  │  • John Smith                                             │ │
│  │  • Jane Doe                                               │ │
│  │                                                           │ │
│  │ Defendants:                                               │ │
│  │  • ABC Corporation (Corporate, Insured)                   │ │
│  │    Served: 11/15/2024 | Answer Filed: 12/15/2024         │ │
│  │  • XYZ Inc (Corporate, Monitor for Service)               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  🏦 POLICIES                                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ • Primary - State Farm | SF-123456 | $100K/$300K          │ │
│  │   Retained by: Yes                                        │ │
│  │ • UM/UIM - Allstate | AL-987654 | $50K (Add-on)           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  📝 NOTES                                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ High exposure case. Plaintiff suffered severe injuries... │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 DISPLAY NAME LOGIC

**Algorithm for `case_name` field:**

```
Step 1: Get primary plaintiff last name
  - If "John Smith" → extract "Smith"
  - If "ABC Corporation" → use full name "ABC Corporation"

Step 2: Count defendants
  - Query: SELECT COUNT(*) FROM case_parties WHERE case_id = ? AND party_type = 'defendant'

Step 3: Generate display name
  IF defendant_count = 1:
    case_name = "[Plaintiff Last Name] v. [Primary Defendant Name]"
    Example: "Smith v. Jones"
  
  IF defendant_count > 1:
    case_name = "[Plaintiff Last Name] v. [Primary Defendant Last Name], et al."
    Example: "Smith v. Jones, et al."

Note: Multiple plaintiffs do NOT trigger "et al."
```

**Examples:**
- 1 plaintiff, 1 defendant: "Smith v. Jones"
- 2 plaintiffs, 1 defendant: "Smith v. Jones"
- 1 plaintiff, 2 defendants: "Smith v. Jones, et al."
- 2 plaintiffs, 3 defendants: "Smith v. Jones, et al."

**Search Behavior:**
- User searches "Jane Doe" → finds case even if Jane is additional plaintiff
- User searches "XYZ Inc" → finds case even if XYZ is second defendant
- Case list shows display name, but search works on ALL party names

---

## 🔐 DATA VALIDATION RULES

### **Required Fields (Cannot Save Without):**
- `cm_number` (must be unique)
- `lead_attorney`
- `primary_plaintiff_name`
- `primary_defendant_name`
- `phase`
- `status`
- `case_type`
- `date_opened`
- `date_of_loss`

### **Conditional Requirements:**
- If `case_type` = "Motor Vehicle Accident" → `case_subtype` appears (optional)
- If `policy_type` = "UM/UIM" → `umuim_type` field appears (required)
- If `discovery_deadline_extended` = true → `discovery_deadline_notes` encouraged (not required)

### **Format Validation:**
- Dates: Must be valid dates in YYYY-MM-DD format (ISO 8601)
- `cm_number`: Must be unique across all cases
- `service_date`: Cannot be before `date_opened`
- `answer_filed_date`: Cannot be before `service_date`
- `date_closed`: Cannot be before `date_opened`

### **Business Logic:**
- If `phase` = "Closed" → require `date_closed`
- If `date_closed` exists → `phase` should be "Closed"
- Primary plaintiff/defendant auto-populate `case_name` on save

---

## 🎯 ACCEPTANCE CRITERIA

### **Phase 2: Database Layer (2-3 days)**

**You will verify:**
```bash
# Open sqlite3
sqlite3 D:/Dy's\ Sunflower\ Suite/data/suite.db

# Check tables exist
.tables
# Should show: cases, case_parties, case_policies

# Check cases schema
.schema cases
# Should show all 25 fields with correct types

# Check case_parties schema
.schema case_parties
# Should show all 11 fields with foreign key

# Check case_policies schema
.schema case_policies
# Should show all 9 fields with foreign key

# Insert test case
INSERT INTO cases (cm_number, lead_attorney, primary_plaintiff_name, primary_defendant_name, phase, status, case_type, date_opened, date_of_loss)
VALUES ('TEST-001', 'Rebecca Strickland', 'John Smith', 'ABC Corp', 'Open', 'Discovery', 'Motor Vehicle Accident', '2024-11-12', '2024-10-15');

# Verify insert
SELECT * FROM cases WHERE cm_number = 'TEST-001';
# Should return the row with all fields

# Clean up test
DELETE FROM cases WHERE cm_number = 'TEST-001';
```

**✅ Phase 2 PASSES when:**
- [ ] All 3 tables exist
- [ ] All columns present with correct types
- [ ] Foreign keys work (deleting case deletes related parties/policies)
- [ ] Indexes created
- [ ] Can insert/update/delete test data
- [ ] No SQL errors

---

### **Phase 3: IPC Bridge (2-3 days)**

**You will verify in DevTools console:**
```javascript
// Test 1: Create case
const testCase = {
  cm_number: 'TEST-002',
  lead_attorney: 'Rebecca Strickland',
  primary_plaintiff_name: 'John Smith',
  primary_defendant_name: 'ABC Corp',
  venue_court: 'Fulton County Superior Court',
  phase: 'Open',
  status: 'Discovery',
  case_type: 'Motor Vehicle Accident',
  date_opened: '2024-11-12',
  date_of_loss: '2024-10-15'
};

window.electron.db.createCase(testCase)
  .then(caseId => console.log('Created case ID:', caseId));

// Test 2: Get all cases
window.electron.db.getCases()
  .then(cases => console.log('All cases:', cases));

// Test 3: Get single case
window.electron.db.getCaseById(1)
  .then(case => console.log('Case details:', case));

// Test 4: Update case
window.electron.db.updateCase(1, { status: 'Pre-Trial' })
  .then(() => console.log('Updated successfully'));

// Test 5: Add party
window.electron.db.addCaseParty({
  case_id: 1,
  party_type: 'defendant',
  party_name: 'XYZ Inc',
  is_corporate: true,
  is_insured: true
}).then(partyId => console.log('Added party ID:', partyId));

// Test 6: Get parties for case
window.electron.db.getCaseParties(1)
  .then(parties => console.log('Case parties:', parties));

// Test 7: Add policy
window.electron.db.addCasePolicy({
  case_id: 1,
  policy_type: 'Primary',
  carrier_name: 'State Farm',
  policy_number: 'SF-123456',
  policy_limits: '$100,000/$300,000',
  we_are_retained_by: true
}).then(policyId => console.log('Added policy ID:', policyId));

// Test 8: Get policies for case
window.electron.db.getCasePolicies(1)
  .then(policies => console.log('Case policies:', policies));

// Test 9: Search cases
window.electron.db.searchCases('Smith')
  .then(results => console.log('Search results:', results));

// Test 10: Delete case (soft delete)
window.electron.db.deleteCase(1)
  .then(() => console.log('Case deleted'));
```

**✅ Phase 3 PASSES when:**
- [ ] All IPC methods callable from console
- [ ] No "window.electron is undefined" errors
- [ ] Create/read/update/delete operations work
- [ ] Search finds cases by any party name
- [ ] Related parties/policies returned correctly
- [ ] No console errors

---

### **Phase 4: React Components (2-3 days)**

**You will verify in the UI:**

**Case List:**
- [ ] Click "Cases" in sidebar → see case list
- [ ] See column headers: Case Name, C/M Number, Lead Attorney, Status, Date Opened
- [ ] Search bar works (finds by case name, C/M number, ANY party name)
- [ ] Filter by Lead Attorney works
- [ ] Filter by Status works
- [ ] Click case row → opens Case Detail view
- [ ] Click "New Case" → opens intake form
- [ ] Empty state shows when no cases

**Case Intake Form:**
- [ ] All sections render correctly
- [ ] Required fields marked with *
- [ ] Lead Attorney dropdown shows all 8 attorneys
- [ ] Status dropdown shows all 9 statuses
- [ ] Case Type dropdown shows all 13 types
- [ ] Date pickers work for all date fields
- [ ] "Add Additional Defendant" button opens modal
- [ ] Can add multiple defendants with "+" button
- [ ] Each defendant has all fields (corporate, insured, service, answer)
- [ ] "Add Policy" button opens modal
- [ ] Can add multiple policies
- [ ] Venue section has 4 fields (court, judge, clerk, staff attorney)
- [ ] Special flags checkboxes work
- [ ] Discovery deadline section works
- [ ] Notes textarea saves content
- [ ] "Save" button saves and shows success message
- [ ] "Cancel" button closes form (with confirmation if changes made)

**Case Detail View:**
- [ ] Shows complete case information
- [ ] All parties listed (plaintiffs and defendants)
- [ ] Defendant service/answer dates shown
- [ ] All policies listed with details
- [ ] Venue information displayed
- [ ] Discovery deadline shown
- [ ] Notes displayed
- [ ] "Edit Case" button opens intake form in edit mode
- [ ] "Back to Cases" returns to list

**Display Name Logic:**
- [ ] 1 plaintiff, 1 defendant → "Smith v. Jones"
- [ ] 2 plaintiffs, 1 defendant → "Smith v. Jones" (no et al.)
- [ ] 1 plaintiff, 2 defendants → "Smith v. Jones, et al."
- [ ] Search finds cases by ANY party name (even if not in display)

**✅ Phase 4 PASSES when:**
- [ ] All UI elements render
- [ ] All forms validate correctly
- [ ] Can create complete case with parties and policies
- [ ] Can edit existing case
- [ ] Search and filters work
- [ ] Display name logic correct
- [ ] No React errors in console
- [ ] Sunflower theme colors used throughout

---

### **Phase 5: Integration & Testing (1-2 days)**

**You will verify end-to-end:**

**Test Scenario 1: Complete Case Creation**
1. [ ] Click "New Case"
2. [ ] Fill out all required fields
3. [ ] Add 2 defendants with service/answer dates
4. [ ] Add 2 policies (Primary and UM/UIM)
5. [ ] Add discovery deadline with extension note
6. [ ] Save case
7. [ ] Case appears in case list with correct display name
8. [ ] Click case → detail view shows all information
9. [ ] Edit case → change status → save
10. [ ] Verify change persists

**Test Scenario 2: Search & Filter**
1. [ ] Create 3 test cases with different attorneys
2. [ ] Search by primary plaintiff → finds case
3. [ ] Search by second defendant → finds case
4. [ ] Filter by Lead Attorney → shows only their cases
5. [ ] Filter by Status → shows only matching cases
6. [ ] Clear filters → shows all cases

**Test Scenario 3: Data Persistence**
1. [ ] Create case with full data
2. [ ] Close app completely
3. [ ] Reopen app
4. [ ] Navigate to Cases
5. [ ] Verify case still there with all data
6. [ ] Verify parties still linked
7. [ ] Verify policies still linked

**Test Scenario 4: Display Name Edge Cases**
1. [ ] Case with 1 plaintiff, 1 defendant → verify "Smith v. Jones"
2. [ ] Add second plaintiff → verify still "Smith v. Jones"
3. [ ] Add second defendant → verify "Smith v. Jones, et al."
4. [ ] Search second plaintiff name → verify case found
5. [ ] Search second defendant name → verify case found

**Test Scenario 5: Validation**
1. [ ] Try to save without C/M number → error shown
2. [ ] Try duplicate C/M number → error shown
3. [ ] Try to set answer date before service date → error shown
4. [ ] Try to close case without close date → prompted for date
5. [ ] All validation messages clear and helpful

**✅ Phase 5 PASSES when:**
- [ ] All test scenarios pass
- [ ] No data loss on app restart
- [ ] No console errors
- [ ] Display names correct in all cases
- [ ] Search finds all relevant cases
- [ ] Module A documentation complete
- [ ] Ready for Phase 1B (Contacts)

---

## 📚 TECHNICAL NOTES FOR CLAUDE CODE

### **What Phases 1B and 1C Will Add:**

**Phase 1B (Contacts):**
- `contacts` table (separate from case_parties)
- Contact roles: Plaintiff Counsel, Opposing Counsel, Adjuster, Expert, etc.
- Contact entry fields in intake form
- Link contacts to cases (many-to-many relationship)
- Contact management UI

**Phase 1C (Correspondence):**
- `correspondence` table
- Correspondence logging (email, letter, call, meeting)
- Methods: Email, Phone Call, Letter, Meeting, etc.
- Direction: Sent, Received, Attempted
- Link correspondence to case + contact

### **Design Considerations for Phase 1A:**

**DO Build:**
- Complete case database with all fields Dy specified
- Party tracking (unlimited plaintiffs/defendants)
- Policy tracking (unlimited policies per case)
- Display name logic with "et al." only for multiple defendants
- Search that works on ALL party names
- Clean, modular code that Phases 1B/1C can extend

**DO NOT Build:**
- Contact management (that's Phase 1B)
- Correspondence logging (that's Phase 1C)
- Task automation (that's Module B)
- Deadline calculations (that's Module C)

**Key Points:**
1. **case_parties vs. contacts:** `case_parties` are plaintiffs/defendants in the lawsuit. `contacts` (Phase 1B) are people you communicate with (attorneys, adjusters, experts). Sometimes overlap, but conceptually different.

2. **Search must be comprehensive:** Even though display name only shows primary plaintiff and primary defendant (with et al.), search MUST find cases by ANY party name in case_parties table.

3. **Future-proofing:** 
   - Don't hardcode Lead Attorney list (store in DB for Phase 1B to manage)
   - Don't hardcode Status list (might add/remove in future)
   - Don't hardcode Case Types (might expand list)
   - Use foreign keys properly so Phases 1B/1C can reference cases

4. **Testing after each phase:** Dy will test Phase 2 (DB) before you build Phase 3 (IPC), and Phase 3 before you build Phase 4 (UI). Don't skip ahead.

---

## 🎨 SUNFLOWER THEME COLORS

Use these Tailwind classes consistently:

PRIMARY PALETTE (6 colors)
1. Sunflower Cream
Attribute	Value
Tailwind name	sunflower-cream
HEX	#FFF9C4
Wording	Pale sunlit cream; soft, bright background
Usage	Primary page background, light highlights

2. Soft Sunflower Beige
Attribute	Value
Tailwind name	sunflower-beige
HEX	#FFECB3
Wording	Warm golden beige; soft surface color
Usage	Cards, containers, panels

3. Soft Green
Attribute	Value
Tailwind name	sunflower-green
HEX	#AED581
Wording	Muted spring green
Usage	Success messages, positive accents, validation states

4. Warm Taupe
Attribute	Value
Tailwind name	sunflower-taupe
HEX	#D7CCC8
Wording	Soft greige taupe
Usage	Borders, dividers, neutral containers, hover backgrounds

5. Deep Brown
Attribute	Value
Tailwind name	sunflower-brown
HEX	#633112
Wording	Rich earthy brown; the “ink” color
Usage	Headings, emphasis text, strong contrast elements

6. Sunflower Gold
Attribute	Value
Tailwind name	sunflower-gold
HEX	#E3A008
Wording	Bright sunflower gold
Usage	Primary buttons, accents, highlights
🌻 Optional Recommended Additions


Light Taupe (for subtle borders)
Tailwind: sunflower-taupe-light
Hex: #E8E0DC

Gold Dark (hover for buttons)
Tailwind: sunflower-gold-dark
Hex: #C98506
---

## ⚠️ GOLDEN RULES REMINDER

### **Rule 1: Database-First Development**
- Write SQL schema FIRST
- Test in sqlite3 BEFORE writing TypeScript
- Dy must verify Phase 2 before Phase 3 starts

### **Rule 2: Preload Script = CommonJS ONLY**
- `electron/preload.js` must stay `.js` (never `.ts`)
- Must use `require()` (never `import`)
- Must use `contextBridge.exposeInMainWorld()`

### **Rule 3: Test After Each Phase**
- Phase 2 → Dy tests in sqlite3
- Phase 3 → Dy tests in console
- Phase 4 → Dy tests in UI
- Phase 5 → Dy tests end-to-end
- NEVER skip testing

### **Rule 4: Never DROP TABLE or DROP COLUMN**
- Only ADD columns (ALTER TABLE ADD COLUMN)
- Never remove columns (breaks existing data)
- Use default values for new columns

### **Rule 5: Flash Drive Considerations**
- Debounce auto-save (5 minutes)
- Manual "Save & Backup" button
- Don't save on every keystroke
- Batch operations where possible

### **Rule 6: Use Dy's Actual Data**
- Lead Attorneys: Rebecca Strickland, Sally Charrash, Kori Wagner, Elizabeth Bentley, Bill Casey, Marissa Merrill, Leah Parker, Katy
- Statuses: Pre-Suit/Intake, Suit Filed/Monitor for Service, Discovery, Pending Mediation/Settlement, Pre-Trial/Pending Dispositive Motions, Trial, Dismissed, Settled, Closed File
- Contact Types: Adjuster, Plaintiff Counsel, Opposing Counsel, Monitoring Counsel, Corporate Defendant, Individual Defendant, Expert, Agent/TPA, In-House Counsel (Corp Def)
- Methods: Email, Phone Call, Meeting, Letter, Text, Zoom/Teams, Voicemail, Interview, Other

---

## 📦 DELIVERABLES CHECKLIST

At the end of Phase 1A, Claude Code must provide:

- [ ] `electron/database/schema-module-a.sql` (all 3 tables)
- [ ] `electron/database/DatabaseService.ts` (all CRUD methods)
- [ ] `electron/main.ts` (updated with IPC handlers)
- [ ] `electron/preload.js` (CommonJS, exposes methods)
- [ ] `src/types/electron.d.ts` (TypeScript definitions)
- [ ] `src/types/ModuleA.ts` (Case, Party, Policy interfaces)
- [ ] `src/stores/caseStore.ts` (Zustand store)
- [ ] `src/components/moduleA/CaseList.tsx`
- [ ] `src/components/moduleA/CaseForm.tsx`
- [ ] `src/components/moduleA/CaseDetail.tsx`
- [ ] `src/components/moduleA/AddPartyModal.tsx`
- [ ] `src/components/moduleA/AddPolicyModal.tsx`
- [ ] `src/App.tsx` (updated with routes)
- [ ] `docs/MODULE_A_PHASE_1A_README.md` (documentation)
- [ ] All acceptance tests passing
- [ ] Git commit: "Module A Phase 1A complete"

---

## ✅ APPROVAL GATE

**Dy must approve Phase 1A before Phase 1B starts.**

**Approval Criteria:**
- All acceptance tests pass
- Data persists across app restart
- Display names correct
- Search finds all relevant cases
- No console errors
- UI matches specification
- Code is clean and documented

**After approval, we move to Phase 1B: Contact Integration**

---

**Status:** Ready for Claude Code handoff  
**Timeline:** 5-7 days  
**Next Phase:** Module A Phase 1B (Contact Integration)

🌻 Let's build this foundation right.
