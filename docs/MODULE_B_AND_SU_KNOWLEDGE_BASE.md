# 📋 MODULE B & SU: COMPLETE KNOWLEDGE EXTRACTION
## Task Management + Workflow Automation for Georgia Civil Defense Litigation

**Purpose:** Extract all substantive legal knowledge, workflows, and automation logic from previous implementation  
**Source:** Old Sunflower Suite v4.0 (crashed project)  
**Target:** New Sunflower Suite v5.0 (current rebuild)  
**Extracted:** November 2025  
**Last Updated:** November 2025 (refined based on actual practice feedback)

---

## 🔄 KEY REFINEMENTS APPLIED

**Updated Based on Real-World Insurance Defense Practice:**

1. **Terminology:** Changed "assigned attorney" to "Lead Attorney" (matches case intake forms with Elizabeth, Kelly, Katy, etc.)
2. **Cadence 1 (Intake):** Comprehensive claim file review task added with detailed insurance defense workflow
3. **Cadence 2 (Answer):** Reordered tasks to evaluate counterclaims/cross-claims before drafting; removed redundant entry of appearance
4. **Cadence 3:** Renamed to "Amended Complaint Filed" (plaintiffs typically add defendants, not plaintiffs)
5. **Cadence 4 (Discovery):** Adjusted expert identification to 90 days before discovery close; removed IME (not common in practice)
6. **Optional Tasks:** Federal initial disclosures and CMC prep marked as optional with enable/disable toggles
7. **Automation Toggles:** Added comprehensive automation control system - all 26 automations and 18 cadences can be enabled/disabled
8. **Expert Witness Timing:** New AUTO-011 triggers 90 days before discovery close (not at discovery initiation)
9. **Volume Practice Adjustments:** Answer deadline set to 30 days post-service (not 3 days early); tasks prioritized for efficiency

---

## 📌 TABLE OF CONTENTS

**PART I: MODULE B - TASK & WORKFLOW MANAGER**
1. [Core Task Management Features](#module-b-core-features)
2. [Time Tracking & Billing](#time-tracking)
3. [Task Organization](#task-organization)
4. [The 18 Litigation Cadences](#18-cadences)

**PART II: MODULE SU - SHARED UTILITIES & AUTOMATIONS**
1. [The 26 Automations](#automations)
2. [Georgia Deadline Calculator](#georgia-deadlines)
3. [Discovery Close Management](#discovery-close)
4. [Calendar Integration](#calendar-integration)

**PART III: INTEGRATION CONCEPTS**
1. [How Module B + SU Work Together](#integration)
2. [Automation Triggers](#triggers)
3. [Phase Progression Logic](#phase-progression)

---

## PART I: MODULE B - TASK & WORKFLOW MANAGER

### Module B Core Features {#module-b-core-features}

#### Task Management System

**Task Fields:**
- `id` - Unique identifier (TEXT PRIMARY KEY)
- `case_id` - Foreign key to cases table (REQUIRED)
- `task_group_id` - Links to cadence group (OPTIONAL)
- `title` - Task name (REQUIRED)
- `description` - Detailed description
- `priority` - 1 (Low), 2 (Medium), 3 (High), 4 (Critical)
- `status` - pending, in-progress, completed, cancelled
- `phase` - Discovery, Pleadings, Trial, Depositions, etc.
- `assigned_to` - Attorney name
- `due_date` - Deadline (DATE)
- `completed_date` - When marked complete
- `is_billable` - TRUE/FALSE for billing tracking
- `estimated_hours` - Projected time (DECIMAL)
- `actual_hours` - Actual time logged (DECIMAL)
- `created_at`, `updated_at` - Audit trail

**Task CRUD Operations:**
- Create task (manual or via cadence)
- Read task details
- Update task fields
- Complete task (sets completed_date, status = 'completed')
- Delete task (soft delete recommended)
- Bulk operations (complete multiple, delete multiple)

**Overdue Task Logic:**
```javascript
function isOverdue(task) {
  if (task.status === 'completed') return false;
  if (!task.due_date) return false;
  return new Date(task.due_date) < new Date();
}
```

**Visual Indicators:**
- Overdue tasks: Red left border (4px) + red background
- P4 (Critical): Red badge
- P3 (High): Orange badge
- P2 (Medium): Blue badge
- P1 (Low): Gray badge

---

### Time Tracking & Billing {#time-tracking}

#### Timer Functionality

**Timer States:**
- `activeTimerId` - Currently running task ID
- `timerStartTime` - When timer started (timestamp)
- `timerPausedAt` - When paused (timestamp or null)
- `timerElapsedBeforePause` - Accumulated time before pause (milliseconds)

**Timer Actions:**
1. **Start Timer:**
   - Set activeTimerId = taskId
   - Set timerStartTime = Date.now()
   - Clear timerPausedAt
   - Display global timer bar

2. **Pause Timer:**
   - Set timerPausedAt = Date.now()
   - Calculate elapsed: (now - start) + elapsedBefore
   - Store in timerElapsedBeforePause

3. **Resume Timer:**
   - Reset timerStartTime = Date.now()
   - Clear timerPausedAt
   - Keep timerElapsedBeforePause

4. **Stop Timer:**
   - Calculate total elapsed time
   - Create time entry with elapsed time
   - Clear all timer state
   - Hide global timer bar

**Auto-Shutoff Rule:**
- Timer automatically stops after 6 hours (21,600,000 ms)
- Warning at 5 hours (18,000,000 ms)
- Alert user when auto-stopped

**Global Timer Bar:**
- Fixed position at bottom of screen
- Shows: Task title, elapsed time (HH:MM:SS), pause/resume/stop buttons
- Color coding:
  - Blue gradient: Normal (< 5 hours)
  - Gray gradient: Paused
  - Orange/Red gradient: Near limit (5-6 hours)

#### Time Entry Management

**Time Entry Fields:**
- `id` - Unique identifier
- `task_id` - Links to task (REQUIRED)
- `user_id` - Who logged time
- `description` - Narrative/notes (REQUIRED for billing)
- `duration_minutes` - Time logged (INTEGER)
- `rate` - Billing rate (DECIMAL, optional)
- `is_billable` - TRUE/FALSE
- `entry_date` - Date of work
- `created_at` - When entry created

**Manual Time Entry:**
- User enters duration (hours or minutes)
- Add narrative description
- Select billable/non-billable
- Optional: Add billing code/rate

**Time Entry Operations:**
- Create entry (manual or from timer)
- Edit entry (duration, narratives)
- Delete entry
- Bulk export (LEDES format)

**Time Aggregation:**
- Total hours per task
- Total hours per case
- Total hours per attorney
- Billable vs non-billable breakdown
- Weekly/monthly summaries

#### LEDES Export

**LEDES Format Requirements:**
- Date
- Task/Activity description
- Attorney/Timekeeper name
- Hours (decimal format)
- Rate
- Total amount
- Billing code (if applicable)

**Export Options:**
- Date range filter
- Case filter
- Attorney filter
- Billable only / All entries
- CSV format (standard LEDES)

**Grouping Options:**
- By day
- By week
- By task
- By Lead Attorney
- By case

---

### Task Organization {#task-organization}

#### Task Groups (Cadences)

**Task Group Fields:**
- `id` - Unique identifier
- `case_id` - Links to case
- `cadence_type` - Code (e.g., "DISC-001", "ANS-001")
- `name` - Display name (e.g., "Discovery Initiated")
- `status` - active, completed, archived
- `triggered_by` - What spawned this (e.g., "answer_filed")
- `triggered_at` - When created (TIMESTAMP)
- `completed_at` - When all tasks done

**Group Operations:**
- **Create group (via automation):** When a cadence is triggered (e.g., "Answer Filed"), a task group is automatically created to hold all related tasks
- **Assign tasks to group:** All tasks spawned by that cadence are linked to the group (via task_group_id)
- **Close group (marks completed):** When all tasks in the group are completed, the group status changes to "completed"
- **Archive group (hide from active view):** Completed groups can be archived to declutter the UI while preserving history
- **Progress tracking (X of Y tasks completed):** Real-time calculation of how many tasks are done vs total (e.g., "8 of 15 tasks completed")

**Progress Visualization:**
- Progress bar: completed / total tasks
- Percentage display
- Color coding:
  - 0-30%: Red (behind)
  - 31-70%: Yellow (on track)
  - 71-99%: Blue (almost done)
  - 100%: Green (complete)

#### Task Filtering & Sorting

**Filter Options:**
- By status (pending, in-progress, completed, cancelled)
- By priority (P1, P2, P3, P4)
- By phase (Discovery, Pleadings, etc.)
- By Lead Attorney
- By due date range
- By billable status
- By task group

**Sort Options:**
- Due date (ascending/descending)
- Created date
- Priority (high to low)
- Title (alphabetical)
- Status
- Estimated hours

**View Options:**
- List view (table)
- Kanban view (by status)
- Calendar view (by due date)
- Timeline view (by phase)

---

### The 18 Litigation Cadences {#18-cadences}

Each cadence is a predefined workflow that spawns multiple tasks when triggered.

---

#### CADENCE 1: Case Intake & Initial Setup
**Code:** `INT-001`  
**Trigger:** Case created  
**Total Tasks:** 8  
**Timeline:** Days 0-10

**Tasks Created:**

1. **Draft/Send Acknowledgment Letter** (Priority 4, Due: Day 1)
   - Draft acknowledgment to client/carrier
   - Confirm receipt of complaint and initial documents
   - Request additional documentation if needed

2. **Check Docket & Assess Service Status** (Priority 4, Due: Day 1)
   - Check docket to assess insured service status
   - Confirm receipt of complaint and initial documents
   - Note critical deadlines

3. **Contact Insured/Defendant** (Priority 4, Due: Day 2)
   - Initial phone call to introduce representation and confirm service status
   - Explain process and expectations
   - Schedule intake interview

4. **Create Case Notesheet** (Priority 4, Due: Immediately)
   - Master document tracking all key info
   - Contact sheet
   - Timeline of key events

5. **Comprehensive Claim File Review** (Priority 4, Due: Day 7 or expedited if answer due within 2 weeks)
   - **Pre-suit demand package** (often includes plaintiff's medical records, allegations, claimed damages)
   - **Police report** and accompanying photographs/exhibits
   - **Insurer-obtained ISO or investigative materials**
   - **Vehicle data/expert assessment** from insurer pre-suit investigation
   - **Recorded statements**
   - **Reserve notes, claim notes, and correspondence**
   - **Coverage correspondence** (Reservation of rights, Denial letters)
   - **Policy declarations and endorsements** (critical for production and case evaluation)
   - **Identify potential non-parties** for future discovery/subpoenas
   - **Note:** If answer due within 2 weeks, do preliminary review immediately; full review before discovery response deadline

6. **Initial Case Memo** (Priority 3, Due: Day 7)
   - Draft preliminary case assessment
   - Outline liability and damage issues
   - Initial defense strategy

7. **Contact Adjuster/Client** (Priority 3, Due: Day 7)
   - Email or phone call with initial assessment
   - Outline key issues and risks
   - Discuss budget and strategy

8. **Litigation Budget Draft** (Priority 2, Due: Day 10)
   - Estimate discovery costs
   - Project expert costs
   - Estimate trial costs

---

#### CADENCE 2: Answer and Initial Pleadings
**Code:** `ANS-001`  
**Trigger:** Complaint served / Answer deadline triggered  
**Total Tasks:** 11 (plus 2 optional)  
**Timeline:** 30-day answer deadline

**Tasks Created:**

1. **Docket Complaint Review** (Priority 4, Due: 3 days after service)
   - Review all allegations
   - Note jurisdictional issues
   - Identify claims and parties

2. **Verify Service** (Priority 4, Due: 3 days)
   - Confirm proper service
   - Note service date for deadline calculation
   - Check for service defects

3. **Contact Defendant for Information** (Priority 4, Due: 5 days)
   - Obtain defendant's version of events
   - Request documents defendant may have
   - Discuss potential defenses

4. **Evaluate Counterclaims** (Priority 2, Due: 10 days)
   - Consider affirmative claims
   - Assess strategic value
   - Discuss with client

5. **Evaluate Cross-Claims** (Priority 2, Due: 10 days)
   - Review co-defendant liability
   - Consider contribution/indemnity
   - Strategic assessment

6. **Draft Answer** (Priority 4, Due: 20 days before deadline)
   - Admissions and denials
   - Affirmative defenses (statute of limitations, comparative negligence, etc.)
   - Counterclaims (if applicable based on task 4)
   - Cross-claims (if applicable based on task 5)

7. **Review Answer with Lead Attorney** (Priority 4, Due: 15 days before deadline)
   - Internal quality control
   - Strategy confirmation
   - Edit and finalize

8. **Client Review of Answer** (Priority 3, Due: 10 days before deadline)
   - Send draft to client for review
   - Incorporate feedback
   - Obtain approval

9. **File Answer** (Priority 4, Due: 30 days after service)
   - Final formatting and citations
   - Certificate of service
   - File with court and serve
   - Entry of appearance automatic upon filing

10. **Calendar All Deadlines** (Priority 4, Due: Immediately after answer)
    - Discovery close date (6 months from answer in Georgia)
    - Expert designation deadlines
    - Dispositive motion deadlines

11. **Defense Strategy Meeting** (Priority 3, Due: 10 days after answer)
    - Meet with partner/lead attorney and possibly co-defendant counsel
    - Outline discovery plan
    - Assign responsibilities

**OPTIONAL TASKS (system should allow enabling/disabling):**

12. **[OPTIONAL - FEDERAL ONLY] Initial Disclosures** (Priority 3, Due: 30 days after answer)
    - Prepare Rule 26 disclosures (federal cases only)
    - Identify witnesses
    - Identify documents

13. **[OPTIONAL] Case Management Conference Prep** (Priority 3, Due: Before CMC if ordered)
    - Review local rules
    - Prepare proposed scheduling order
    - Discuss discovery plan

---

#### CADENCE 3: Amended Complaint Filed
**Code:** `AMD-CMP-001`  
**Trigger:** Amended complaint filed  
**Total Tasks:** 6

**Note:** Plaintiffs typically amend to add defendants, not plaintiffs. This cadence handles any amended complaint.

**Tasks Created:**

1. **Update Party Database** (Priority 4, Due: Immediately)
   - Add new parties (typically defendants)
   - Update case contacts
   - Note changes to claims

2. **Revised Strategy Assessment** (Priority 3, Due: 10 days)
   - Review new allegations
   - Assess impact on defense strategy
   - Consider new defenses

3. **Update Adjuster/Client** (Priority 3, Due: 5 days)
   - Notify of amended complaint
   - Explain changes and impact
   - Discuss strategy adjustments

4. **Amend Answer if Necessary** (Priority 3, Due: 20 days or per court rules)
   - Review need to amend answer
   - Address new allegations
   - File amended answer if required

5. **Review Settlement Impact** (Priority 2, Due: 14 days)
   - Assess how amendment affects settlement posture
   - Discuss with client/adjuster
   - Consider mediation timing

6. **Update Case Notesheet** (Priority 2, Due: 7 days)
   - Document amendment details
   - Update timeline
   - Note strategic implications

---

#### CADENCE 4: Discovery Initiated
**Code:** `DISC-001`  
**Trigger:** Answer filed / Discovery period opens  
**Total Tasks:** 13

**Tasks Created:**

1. **Calendar Discovery Close Date** (Priority 4, Due: Immediately)
   - 6 months from answer date in Georgia
   - Mark on all calendars
   - Set countdown reminders

2. **Propound Initial Discovery Requests** (Priority 4, Due: 7 days)
   - Interrogatories to plaintiff
   - Request for production (including social media posts)
   - Request for admissions

3. **Prepare Preservation Letters** (Priority 3, Due: 10 days)
   - To plaintiff
   - To potential non-parties
   - ESI preservation notice

4. **Medical Records Authorization** (Priority 4, Due: 10 days)
   - Obtain signed HIPAA releases
   - Send to all treating providers
   - Track responses

5. **Employment Records Request** (Priority 3, Due: 14 days)
   - Wage loss documentation
   - If employment-related claims

6. **Initial Witness Identification** (Priority 3, Due: 14 days)
   - Fact witnesses
   - Potential expert witnesses
   - Interview schedule

7. **Document Collection from Insured/Defendant** (Priority 3, Due: 10 days)
   - Policies, contracts, procedures (if not already in claim file)
   - Incident reports
   - Communications
   - Photos and evidence

8. **Discovery Tracking System Setup** (Priority 3, Due: 7 days)
   - Create tracking spreadsheet
   - Calendar all response deadlines
   - Assign responsibilities

9. **Initial Medical Chronology** (Priority 3, Due: 21 days)
   - As records received
   - Preliminary damages assessment

10. **Phase I Discovery Report** (Priority 3, Due: 30 days)
    - Initial findings
    - Strategy recommendations
    - Discovery plan going forward

11. **Non-Party Records/Documents Subpoenas** (Priority 3, Due: As identified during initial review)
    - Send NPRPDs as non-parties are identified
    - Track response deadlines
    - Follow up as needed

12. **Plaintiff Deposition Scheduling** (Priority 3, Due: Within 14 days of receiving plaintiff's discovery responses; must be completed by 90 days after answer filed)
    - Coordinate scheduling with opposing counsel
    - Aim for sufficient time for prep
    - Allow time before discovery close

13. **Discovery Deficiency Monitoring** (Priority 3, Due: Ongoing)
    - Track what's received vs requested
    - Identify gaps early
    - Plan meet and confer

**Note:** Expert witness identification occurs later (see AUTO-011: 90 days before discovery close)

---

#### CADENCE 5: Discovery Response - Our Client
**Code:** `DISC-RESP-001`  
**Trigger:** Discovery requests received from plaintiff  
**Total Tasks:** 15  
**Timeline:** 30 days to respond (45 if served with initial complaint)

**Tasks Created:**

1. **Review Discovery Requests** (Priority 4, Due: 3 days)
   - Analyze all requests
   - Identify objectionable requests
   - Note special issues

2. **Review Claim File** (Priority 4, Due: 7 days)
   - Gather responsive documents
   - Identify privileged materials
   - Note gaps in documentation

3. **Follow Up with Defendant** (Priority 4, Due: 7 days)
   - Request responsive documents
   - Set document production deadline
   - Explain process

4. **Draft Written Discovery Responses** (Priority 4, Due: 20 days)
   - Interrogatory answers
   - Document production responses
   - Admission responses

5. **Privilege Review** (Priority 4, Due: 15 days)
   - Identify privileged documents
   - Prepare privilege log
   - Redactions if needed

6. **Document Organization** (Priority 3, Due: 20 days)
   - Organize production documents
   - Bates stamp (if applicable)
   - Create production index

7. **Client Review of Responses** (Priority 4, Due: 23 days)
   - Send draft responses to client
   - Obtain approval
   - Make revisions

8. **Verification Preparation** (Priority 4, Due: 25 days)
   - Prepare verification for client signature
   - Explain importance
   - Obtain notarization

9. **Final Review Before Service** (Priority 4, Due: 27 days)
   - Quality control check
   - Ensure completeness
   - Check formatting

10. **Serve Discovery Responses** (Priority 4, Due: 30 days)
    - Certificate of service
    - Deliver documents and responses
    - Retain proof of service

11. **Supplementation Calendar** (Priority 3, Due: 30 days)
    - Note duty to supplement
    - Calendar review dates
    - Track new information

12. **Response Strategy Review** (Priority 3, Due: 15 days)
    - Assess impact of responses
    - Identify vulnerabilities
    - Plan defensive measures

13. **Follow-Up Discovery Planning** (Priority 2, Due: 30 days)
    - What additional discovery needed
    - Based on plaintiff's requests
    - Adjust discovery plan

14. **Update Case Assessment** (Priority 2, Due: 35 days)
    - After responses sent
    - Reassess liability and damages
    - Update adjuster

15. **Document Retention Compliance** (Priority 3, Due: 30 days)
    - Ensure preservation ongoing
    - Check for new documents
    - Update document hold notices

---

#### CADENCE 6: Discovery Response - Non-Parties
**Code:** `DISC-REVIEW-001`  
**Trigger:** Discovery responses received from plaintiff/other parties  
**Total Tasks:** 14

**Tasks Created:**

1. **Review Responses Immediately** (Priority 4, Due: 3 days)
   - Initial assessment
   - Identify critical issues
   - Flag deficiencies

2. **Detailed Analysis** (Priority 3, Due: 7 days)
   - Line-by-line review
   - Compare to complaint allegations
   - Note inconsistencies

3. **Deficiency Identification** (Priority 3, Due: 7 days)
   - Incomplete responses
   - Evasive answers
   - Missing documents

4. **Medical Records Review** (Priority 3, Due: 14 days)
   - Analyze treatment records
   - Identify gaps
   - Pre-existing conditions

5. **Wage Loss Verification** (Priority 3, Due: 14 days)
   - Review employment records
   - Calculate actual wage loss
   - Identify issues

6. **Social Media Review** (Priority 2, Due: 14 days)
   - Review produced social media
   - Identify impeachment material
   - Additional requests if needed

7. **Non-Party Witness Identification** (Priority 3, Due: 14 days)
   - From responses, identify non-parties
   - Plan subpoenas
   - Prioritize importance

8. **Expert Disclosure Review** (Priority 3, Due: When received)
   - Analyze expert opinions
   - Identify bases for opinions
   - Plan rebuttal strategy

9. **Meet and Confer Preparation** (Priority 3, Due: 10 days)
   - Draft deficiency list
   - Prepare for conference
   - Document good faith efforts

10. **6.4 Letter Preparation** (Priority 3, Due: 14 days)
    - If deficiencies exist
    - Detailed deficiency list
    - Legal basis for requests

11. **Motion to Compel Evaluation** (Priority 2, Due: 21 days)
    - After meet and confer
    - If responses still deficient
    - Cost-benefit analysis

12. **Update Discovery Tracking** (Priority 3, Due: 7 days)
    - What's received vs outstanding
    - Update tracking system
    - Adjust timeline

13. **Deposition Topic Identification** (Priority 3, Due: 14 days)
    - Based on responses
    - Outline key areas
    - Plan deposition strategy

14. **Supplement Discovery if Needed** (Priority 2, Due: 21 days)
    - Additional interrogatories
    - Additional document requests
    - Follow-up admissions

---

#### CADENCE 7: Discovery Deficiency Management
**Code:** `6.4-001`  
**Trigger:** Deficient discovery responses identified  
**Total Tasks:** 12

**Tasks Created:**

1. **Document Specific Deficiencies** (Priority 4, Due: 3 days)
2. **Draft Meet and Confer Letter** (Priority 4, Due: 7 days)
3. **Good Faith Conference** (Priority 4, Due: 14 days)
4. **Document Conference Results** (Priority 4, Due: Immediately after)
5. **Draft 6.4 Letter** (Priority 4, Due: 21 days)
6. **Serve 6.4 Letter** (Priority 4, Due: 25 days)
7. **Calendar Motion Deadline** (Priority 4, Due: 30 days after letter)
8. **Prepare Motion to Compel** (Priority 3, Due: 35 days)
9. **Good Faith Certificate** (Priority 4, Due: Before filing)
10. **File Motion to Compel** (Priority 4, Due: 40 days)
11. **Hearing Preparation** (Priority 3, Due: Before hearing)


---

#### CADENCE 8: Deposition Scheduling & Prep
**Code:** `DEPO-PREP-001`  
**Trigger:** Deposition scheduled  
**Total Tasks:** 16

**Tasks Created:**

1. **Notice of Deposition** (Priority 4, Due: 30 days before depo)
   - Prepare notice
   - Coordinate with opposing counsel
   - Reserve court reporter

2. **Deposition Outline Creation** (Priority 4, Due: 14 days before)
   - 11-section structure
   - Key topics
   - Question development

3. **Review Discovery Responses** (Priority 4, Due: 14 days before)
   - Refresh on responses
   - Identify inconsistencies
   - Note admissions

4. **Review Medical Records** (Priority 3, Due: 10 days before)
   - If plaintiff deposition
   - Treatment timeline
   - Pre-existing conditions

5. **Exhibit Selection** (Priority 3, Due: 10 days before)
   - Documents to show witness
   - Photos, diagrams
   - Prior statements

6. **Prior Testimony Review** (Priority 3, Due: 10 days before)
   - If witness testified before
   - Note inconsistencies
   - Impeachment preparation

7. **Partner Review of Outline** (Priority 4, Due: 7 days before)
   - Quality control
   - Strategy discussion
   - Refinements

8. **Witness Preparation** (Priority 4, Due: 3 days before)
   - If our client
   - Review testimony tips
   - Practice key answers

9. **Exhibit Notebook Preparation** (Priority 3, Due: 3 days before)
   - Organized by topic
   - Pre-marked exhibits
   - Extra copies

10. **Logistics Confirmation** (Priority 4, Due: 2 days before)
    - Confirm location, time
    - Confirm court reporter
    - Tech setup if virtual

11. **Final Outline Review** (Priority 4, Due: 1 day before)
    - Last refinements
    - Anticipate objections
    - Mental preparation

12. **Expert Topics if Applicable** (Priority 3, Due: 10 days before)
    - Technical questions
    - Basis for opinions
    - Literature review

13. **Impeachment Material Organization** (Priority 3, Due: 7 days before)
    - Prior inconsistent statements
    - Contradictory evidence
    - Strategy for use

14. **Social Media Print-Outs** (Priority 2, Due: 7 days before)
    - If relevant
    - Authentication preparation
    - Confrontation strategy

15. **Settlement Authority Discussion** (Priority 2, Due: 7 days before)
    - If plaintiff deposition
    - Post-depo settlement potential
    - Authority from client

16. **Backup Technology** (Priority 3, Due: 2 days before)
    - If virtual depo
    - Test connections
    - Backup devices ready

---

#### CADENCE 9: Deposition Follow-Up
**Code:** `DEPO-POST-001`  
**Trigger:** Deposition completed  
**Total Tasks:** 8

**Tasks Created:**

1. **Deposition Summary Memo** (Priority 3, Due: 3 days after)
   - Key testimony
   - Admissions obtained
   - Impeachment material
   - Strategic implications

2. **Exhibit Organization** (Priority 3, Due: 3 days)
   - File marked exhibits
   - Update exhibit list
   - Scan if necessary

3. **Order Transcript** (Priority 4, Due: Immediately)
   - Expedited if needed
   - Designate rough vs final

4. **Review Transcript When Received** (Priority 3, Due: 5 days after receipt)
   - Check accuracy
   - Note key pages
   - Index important testimony

5. **Errata Sheet Review** (Priority 3, Due: When received)
   - If witness submits changes
   - Note material changes
   - Consider implications

6. **Update Case Assessment** (Priority 3, Due: 7 days)
   - Based on testimony
   - Liability reassessment
   - Damages reassessment

7. **Identify Additional Discovery Needs** (Priority 2, Due: 7 days)
   - New witnesses identified
   - New documents mentioned
   - Follow-up discovery

8. **Report to Adjuster/Client** (Priority 3, Due: 7 days)
   - Summary of testimony
   - Strategic implications
   - Recommendations

---

#### CADENCE 10: Expert Witness Coordination
**Code:** `EXPERT-001`  
**Trigger:** Expert designation deadline approaching or expert retained  
**Total Tasks:** 14

**Tasks Created:**

1. **Expert Witness Identification** (Priority 3, Due: 90 days before designation)
2. **Expert CV and Fee Schedule Review** (Priority 3, Due: 85 days)
3. **Retention Agreement** (Priority 4, Due: 80 days)
4. **Materials to Expert** (Priority 4, Due: 75 days)
5. **Expert Report Timeline** (Priority 4, Due: 70 days)
6. **Report Review and Feedback** (Priority 3, Due: 65 days)
7. **Final Report** (Priority 4, Due: 60 days)
8. **Expert Disclosure Preparation** (Priority 4, Due: 55 days)
9. **Serve Expert Disclosure** (Priority 4, Due: Per deadline)
10. **Expert Deposition Preparation** (Priority 3, Due: After disclosure)
11. **Expert Deposition Attendance** (Priority 4, Due: Date scheduled)
12. **Trial Preparation with Expert** (Priority 3, Due: 30 days before trial)
13. **Expert Subpoena for Trial** (Priority 4, Due: 14 days before)
14. **Expert Fee Tracking** (Priority 2, Due: Ongoing)

---

#### CADENCE 11: Medical Records Management
**Code:** `MED-REC-001`  
**Trigger:** Medical records authorization obtained  
**Total Tasks:** 12

**Tasks Created:**

1. **Provider List Creation** (Priority 3, Due: Immediately)
2. **Medical Records Requests** (Priority 4, Due: 7 days)
3. **HIPAA Compliance Check** (Priority 4, Due: Before sending)
4. **Follow-Up on Outstanding Requests** (Priority 3, Due: 30 days)
5. **Records Review as Received** (Priority 3, Due: Within 7 days of receipt)
6. **Medical Chronology Preparation** (Priority 3, Due: When all received)
7. **Billing Records Analysis** (Priority 3, Due: When received)
8. **Lien Identification** (Priority 4, Due: When received)
9. **Pre-Existing Condition Analysis** (Priority 3, Due: After review)
10. **Expert Medical Review** (Priority 2, Due: After chronology)
11. **Supplemental Records Requests** (Priority 2, Due: As needed)
12. **Records Index Creation** (Priority 2, Due: Before production)

---

#### CADENCE 12: Motion Practice
**Code:** `MOTION-001`  
**Trigger:** Motion to be filed or motion received  
**Total Tasks:** 15

**Tasks Created:**

1. **Legal Research** (Priority 4, Due: Varies by motion)
2. **Draft Motion/Response** (Priority 4, Due: Varies)
3. **Supporting Evidence Collection** (Priority 4, Due: Early)
4. **Brief Drafting** (Priority 4, Due: Per deadline)
5. **Exhibits Preparation** (Priority 3, Due: With brief)
6. **Partner Review** (Priority 4, Due: 2 days before filing)
7. **Client Review if Needed** (Priority 3, Due: 3 days before)
8. **File Motion/Response** (Priority 4, Due: Per deadline)
9. **Reply Brief Preparation** (Priority 4, Due: If allowed)
10. **Hearing Preparation** (Priority 4, Due: 3 days before hearing)
11. **Oral Argument Outline** (Priority 3, Due: 2 days before)
12. **Proposed Order** (Priority 3, Due: With motion)
13. **Authority Updates** (Priority 3, Due: Day before hearing)
14. **Costs Affidavit** (Priority 2, Due: If prevailing)
15. **Follow-Up Actions** (Priority 3, Due: After ruling)

---

#### CADENCE 13: Summary Judgment
**Code:** `MSJ-001`  
**Trigger:** Summary judgment motion planned or received  
**Total Tasks:** 18

**Tasks Created:**

1. **Statement of Undisputed Facts** (Priority 4, Due: 45 days before hearing)
2. **Legal Research** (Priority 4, Due: 50 days before)
3. **Affidavit Preparation** (Priority 4, Due: 40 days before)
4. **Evidence Gathering** (Priority 4, Due: 45 days before)
5. **Expert Affidavits if Needed** (Priority 3, Due: 40 days before)
6. **Draft Brief** (Priority 4, Due: 35 days before)
7. **Partner Review** (Priority 4, Due: 32 days before)
8. **File Motion** (Priority 4, Due: 30 days before hearing)
9. **Opposition Response Review** (Priority 4, Due: When received)
10. **Reply Brief Drafting** (Priority 4, Due: Per deadline)
11. **Reply Evidence** (Priority 3, Due: With reply)
12. **Oral Argument Preparation** (Priority 4, Due: 3 days before)
13. **Authority Check** (Priority 3, Due: 1 day before)
14. **Backup Arguments** (Priority 3, Due: 2 days before)
15. **Proposed Order** (Priority 3, Due: With motion)
16. **Costs Affidavit** (Priority 2, Due: If granted)
17. **Appeal Analysis** (Priority 3, Due: If denied)
18. **Strategic Reassessment** (Priority 3, Due: After ruling)

---

#### CADENCE 14: Mediation Preparation
**Code:** `MED-001`  
**Trigger:** Mediation scheduled  
**Total Tasks:** 14

**Tasks Created:**

1. **Mediation Position Statement** (Priority 4, Due: 30 days before)
   - Case summary
   - Liability analysis
   - Damages summary
   - Settlement range

2. **Settlement Authority from Client** (Priority 4, Due: 21 days before)
   - Discuss ranges
   - Bottom line
   - Written authorization

3. **Exhibit Notebooks** (Priority 3, Due: 14 days before)
   - Key documents
   - Photos
   - Medical records summary
   - Expert reports

4. **Settlement Calculation** (Priority 3, Due: 21 days before)
   - Economic damages
   - Non-economic damages
   - Comparative fault
   - Settlement value

5. **Client Preparation** (Priority 4, Due: 7 days before)
   - Explain process
   - Review strategy
   - Role in mediation

6. **Demand Letter Preparation** (Priority 3, Due: 14 days before)
   - If plaintiff's mediation
   - Support with evidence

7. **Defense Summary** (Priority 3, Due: 14 days before)
   - Liability defenses
   - Damages challenges
   - Prior offers

8. **Mediator Research** (Priority 2, Due: 30 days before)
   - Background
   - Style
   - Success rate

9. **Mediation Brief** (Priority 3, Due: 14 days before)
   - Confidential to mediator
   - Frank assessment
   - Settlement obstacles

10. **Technology Setup** (Priority 3, Due: 3 days before)
    - If virtual mediation
    - Test connections
    - Backup plans

11. **Day-of Logistics** (Priority 4, Due: 1 day before)
    - Location confirmation
    - Materials checklist
    - Team coordination

12. **Post-Mediation Documentation** (Priority 4, Due: If settles)
    - Settlement agreement
    - Mutual release
    - Dismissal

13. **Post-Mediation Report** (Priority 3, Due: 3 days after)
    - To adjuster/client
    - Results and next steps

14. **Follow-Up Actions** (Priority 3, Due: 7 days after)
    - If not settled
    - Strategy adjustment
    - Additional discovery

---

#### CADENCE 15: Settlement & Resolution
**Code:** `SETTLE-001`  
**Trigger:** Settlement agreed  
**Total Tasks:** 16

**Tasks Created:**

1. **Settlement Agreement Drafting** (Priority 4, Due: 3 days)
2. **Release Preparation** (Priority 4, Due: 3 days)
3. **Confidentiality Agreement** (Priority 3, Due: If applicable)
4. **Client Approval** (Priority 4, Due: 5 days)
5. **Opposing Counsel Approval** (Priority 4, Due: 7 days)
6. **Execution of Settlement Docs** (Priority 4, Due: 10 days)
7. **Lien Resolution** (Priority 4, Due: 14 days)
   - Medical liens
   - Medicare/Medicaid liens
   - Other liens
8. **Payment Processing** (Priority 4, Due: 21 days)
9. **Dismissal with Prejudice** (Priority 4, Due: After payment)
10. **File Dismissal with Court** (Priority 4, Due: 30 days)
11. **Notice to All Parties** (Priority 4, Due: With dismissal)
12. **Close File Procedures** (Priority 3, Due: 35 days)
13. **Final Client Report** (Priority 3, Due: 35 days)
14. **Final Adjuster Report** (Priority 3, Due: 35 days)
15. **File Archive** (Priority 2, Due: 60 days)
16. **Time Entry Completion** (Priority 3, Due: 30 days)

---

#### CADENCE 16: Pre-Trial Preparation
**Code:** `TRIAL-PREP-001`  
**Trigger:** Trial date set  
**Total Tasks:** 20

**Tasks Created:**

1. **Witness List** (Priority 4, Due: 60 days before)
2. **Exhibit List** (Priority 4, Due: 60 days before)
3. **Trial Brief** (Priority 4, Due: 45 days before)
4. **Proposed Jury Instructions** (Priority 4, Due: 30 days before)
5. **Motions in Limine** (Priority 4, Due: 30 days before)
6. **Voir Dire Preparation** (Priority 3, Due: 21 days before)
7. **Opening Statement Draft** (Priority 3, Due: 21 days before)
8. **Direct Examination Outlines** (Priority 4, Due: 14 days before)
9. **Cross Examination Outlines** (Priority 4, Due: 14 days before)
10. **Closing Argument Outline** (Priority 3, Due: 14 days before)
11. **Exhibit Notebooks** (Priority 4, Due: 10 days before)
12. **Witness Packets** (Priority 4, Due: 10 days before)
13. **Technology Setup** (Priority 3, Due: 7 days before)
14. **Client Trial Preparation** (Priority 4, Due: 7 days before)
15. **Witness Trial Preparation** (Priority 4, Due: 7 days before)
16. **Trial Subpoenas** (Priority 4, Due: 14 days before)
17. **Expert Witness Coordination** (Priority 4, Due: 7 days before)
18. **Settlement Discussion** (Priority 3, Due: 14 days before)
19. **Trial Notebook Assembly** (Priority 4, Due: 3 days before)
20. **Final Pre-Trial Conference** (Priority 4, Due: Per court order)

---

#### CADENCE 17: Trial Management
**Code:** `TRIAL-001`  
**Trigger:** Trial begins  
**Total Tasks:** 18

**Tasks Created:**

1. **Daily Trial Preparation** (Priority 4, Due: Each evening)
2. **Witness Coordination** (Priority 4, Due: Daily)
3. **Exhibit Management** (Priority 4, Due: Daily)
4. **Real-Time Notes** (Priority 4, Due: During trial)
5. **Objection Log** (Priority 3, Due: During trial)
6. **Admission Tracking** (Priority 3, Due: During trial)
7. **Jury Selection** (Priority 4, Due: Day 1)
8. **Opening Statement** (Priority 4, Due: Day 1)
9. **Plaintiff's Case Management** (Priority 4, Due: Ongoing)
10. **Defense Case Presentation** (Priority 4, Due: After plaintiff rests)
11. **Cross Examination** (Priority 4, Due: As witnesses testify)
12. **Rebuttal Preparation** (Priority 3, Due: If needed)
13. **Jury Instruction Conference** (Priority 4, Due: Before close)
14. **Closing Argument** (Priority 4, Due: Final day)
15. **Verdict Form Review** (Priority 4, Due: Before deliberation)
16. **Post-Verdict Motions** (Priority 3, Due: If adverse verdict)
17. **Costs Bill Preparation** (Priority 3, Due: After verdict)
18. **Trial Report** (Priority 3, Due: 7 days after)

---

#### CADENCE 18: Post-Trial & Appeal
**Code:** `POST-TRIAL-001`  
**Trigger:** Verdict entered or judgment entered  
**Total Tasks:** 15

**Tasks Created:**

1. **Evaluate Appeal Potential** (Priority 4, Due: 7 days)
2. **Notice of Appeal** (Priority 4, Due: 30 days from final judgment)
3. **Appeal Bond** (Priority 4, Due: With notice)
4. **Designation of Record** (Priority 4, Due: Per appellate rules)
5. **Transcript Order** (Priority 4, Due: 10 days)
6. **Appellant Brief** (Priority 4, Due: Per appellate schedule)
7. **Appellee Brief** (Priority 4, Due: Per schedule)
8. **Reply Brief** (Priority 3, Due: If applicable)
9. **Oral Argument Preparation** (Priority 3, Due: If granted)
10. **Post-Trial Report** (Priority 3, Due: 14 days)
11. **Settlement Discussion** (Priority 2, Due: During appeal)
12. **Client Updates** (Priority 3, Due: Monthly)
13. **Supplemental Authority** (Priority 3, Due: If applicable)
14. **Mandate Processing** (Priority 4, Due: After decision)
15. **File Closure** (Priority 2, Due: 30 days after final)

---

## PART II: MODULE SU - SHARED UTILITIES & AUTOMATIONS

### The 26 Automations {#automations}

Automations are **trigger → action** rules that automatically create tasks, calculate deadlines, and manage workflows.

---

#### AUTOMATION CATEGORY 1: Case State Changes (5 automations)

---

**AUTO-001: Case Created**
- **Trigger:** New case added to system
- **Actions:**
  - Spawn Cadence INT-001 (Case Intake & Initial Setup)
  - Create 9 initial tasks
  - Set initial phase to "Open"
  - Send email notification to lead attorney
  - Create case notesheet template

---

**AUTO-002: Answer Filed**
- **Trigger:** Answer filed date entered in case
- **Actions:**
  - Calculate discovery close date (6 months from answer)
  - Update case.discovery_close_date field
  - Spawn Cadence ANS-001 (Answer and Initial Pleadings) - follow-up tasks
  - Spawn Cadence DISC-001 (Discovery Initiated)
  - Create calendar event for discovery close
  - Set reminders (30 days, 7 days, 1 day before close)
  - Change phase to "Answer & Initial Pleadings"

---

**AUTO-003: Discovery Propounded**
- **Trigger:** "discovery_sent_to_plaintiff" event triggered
- **Actions:**
  - Create task: "Monitor for discovery responses" (30 days, Priority 4)
  - Create task: "Follow up if not received" (35 days, Priority 3)
  - Calendar response deadline (30 days + 3 for electronic service)
  - Set 7-day reminder before deadline

---

**AUTO-004: Discovery Period Closed**
- **Trigger:** Discovery close date reached
- **Actions:**
  - Change phase to "Post-Discovery"
  - Create task: "Post-Discovery Report" (7 days, Priority 3)
  - Create task: "Evaluate settlement potential" (14 days, Priority 2)
  - Create task: "Expert designation verification" (Immediate, Priority 4)
  - Update task tracking dashboard

---

**AUTO-005: Mediation Scheduled**
- **Trigger:** Mediation date set
- **Actions:**
  - Spawn Cadence MED-001 (Mediation Preparation)
  - Create 14 mediation prep tasks
  - Calendar mediation date
  - Set reminders (30, 14, 7, 3, 1 days before)
  - Change phase to "Mediation"

---

#### AUTOMATION CATEGORY 2: Document Events (5 automations)

---

**AUTO-006: Complaint Received**
- **Trigger:** Complaint uploaded or date entered
- **Actions:**
  - Calculate answer deadline (30 days from service)
  - Create task: "File Answer" (30 days, Priority 4)
  - Set critical reminders (20, 14, 7, 3, 1 days before)
  - Create task: "Review complaint" (3 days, Priority 4)
  - Send alert to lead attorney

---

**AUTO-007: Discovery Received**
- **Trigger:** Discovery requests uploaded/logged
- **Actions:**
  - Calculate response deadline (30 or 45 days depending on service method)
  - Spawn Cadence DISC-RESP-001 (Discovery Response - Our Client)
  - Create 15 response tasks
  - Set critical deadline reminders
  - Flag for partner review

---

**AUTO-008: Medical Records Received**
- **Trigger:** Medical records uploaded
- **Actions:**
  - Create task: "Review medical records" (7 days, Priority 3)
  - Create task: "Medical chronology update" (14 days, Priority 3)
  - Create task: "Identify gaps" (7 days, Priority 3)
  - Update damages assessment timeline
  - Flag if high treatment costs

---

**AUTO-009: Expert Report Received**
- **Trigger:** Expert report uploaded
- **Actions:**
  - Create task: "Review expert report" (3 days, Priority 4)
  - Create task: "Consult with our expert" (7 days, Priority 3)
  - Create task: "Rebuttal expert consideration" (10 days, Priority 3)
  - Calculate rebuttal expert designation deadline
  - Send to team for review

---

**AUTO-010: Deposition Notice Received**
- **Trigger:** Deposition notice logged
- **Actions:**
  - Spawn Cadence DEPO-PREP-001 (Deposition Scheduling & Prep)
  - Create 16 prep tasks
  - Calendar deposition date
  - Set prep deadlines (14, 10, 7, 3, 1 days before)
  - Notify team members

---

#### AUTOMATION CATEGORY 3: Deadline Triggers (6 automations)

---

**AUTO-011: 90 Days Before Discovery Close**
- **Trigger:** 90 days before discovery_close_date
- **Actions:**
  - Create task: "Expert Witness Identification" (Priority 3, Due: 85 days before close)
  - Create task: "Research potential experts" (Priority 3, Due: 80 days before close)
  - Create task: "Obtain expert CVs and fee schedules" (Priority 3, Due: 75 days before close)
  - Create task: "Retention agreement with expert" (Priority 4, Due: 70 days before close)
  - Send alert: "Begin expert witness retention process"

---

**AUTO-011B: 30 Days Before Discovery Close**
- **Trigger:** 30 days before discovery_close_date
- **Actions:**
  - Create task: "Final discovery push" (Priority 4, Due: 25 days before close)
  - Create task: "Schedule remaining depositions NOW" (Priority 4, Immediate)
  - Create task: "Identify final non-party subpoenas" (Priority 4, Due: 20 days before close)
  - Create task: "Expert designation verification" (Priority 4, Immediate)
  - Send alert: "URGENT: Discovery closing soon"
  - Update countdown widget to ORANGE

---

**AUTO-012: 7 Days Before Discovery Close**
- **Trigger:** 7 days before discovery_close_date
- **Actions:**
  - Create task: "Complete all pending depositions" (Priority 4, Immediate)
  - Create task: "Serve final discovery requests" (Priority 4, Due: 5 days before close)
  - Create task: "Designate expert witnesses" (Priority 4, Due: Before close)
  - Create task: "Final non-party subpoena review" (Priority 4, Immediate)
  - Send CRITICAL alert to all team members
  - Update countdown widget to RED

---

**AUTO-013: 7 Days Before Any Deadline**
- **Trigger:** 7 days before task.due_date
- **Actions:**
  - Send warning notification
  - Email reminder to assigned attorney
  - Highlight task in yellow on dashboard
  - Check if task is jurisdictional (extra alerts if so)

---

**AUTO-014: 1 Day Before Any Deadline**
- **Trigger:** 1 day before task.due_date
- **Actions:**
  - Send CRITICAL notification
  - Email + SMS alert to assigned attorney
  - Highlight task in red on dashboard
  - Alert supervising partner if jurisdictional
  - Require acknowledgment

---

**AUTO-015: Deadline Missed**
- **Trigger:** task.due_date passed and status != completed
- **Actions:**
  - Flag task as OVERDUE
  - Send escalation to supervising partner
  - Create incident report
  - Require explanation and remediation plan
  - Check for extension possibilities

---

#### AUTOMATION CATEGORY 4: Communication Events (5 automations)

---

**AUTO-016: Settlement Demand Received**
- **Trigger:** Settlement demand logged
- **Actions:**
  - Create task: "Evaluate demand" (3 days, Priority 4)
  - Create task: "Discuss with client" (7 days, Priority 4)
  - Create task: "Prepare response" (14 days, Priority 3)
  - Calculate response deadline if specified
  - Send to coverage/claims for input

---

**AUTO-017: 6.4 Letter Required**
- **Trigger:** Deficiencies identified in discovery
- **Actions:**
  - Spawn Cadence 6.4-001 (Discovery Deficiency Management)
  - Create task: "Generate deficiency list" (3 days, Priority 4)
  - Create task: "Draft 6.4 letter" (7 days, Priority 4)
  - Calendar 30-day motion deadline (after letter sent)
  - Track good faith efforts

---

**AUTO-018: Meet and Confer Scheduled**
- **Trigger:** Meet and confer date set
- **Actions:**
  - Create task: "Prepare agenda" (3 days before, Priority 3)
  - Create task: "Document conference" (Immediately after, Priority 4)
  - Create task: "Follow-up letter if needed" (2 days after, Priority 3)
  - Calendar conference date
  - Send reminder 1 day before

---

**AUTO-019: Client Contact Due**
- **Trigger:** 30 days since last client contact
- **Actions:**
  - Create task: "Status update to client" (5 days, Priority 3)
  - Generate draft status letter
  - Note recent case developments
  - Suggest phone call if significant updates

---

**AUTO-020: Expert Contact Due**
- **Trigger:** 14 days since last expert contact
- **Actions:**
  - Create task: "Check in with expert" (3 days, Priority 3)
  - Verify report progress
  - Confirm deadlines
  - Address any questions

---

#### AUTOMATION CATEGORY 5: Milestone Events (5 automations)

---

**AUTO-021: Phase Change**
- **Trigger:** case.phase updated
- **Actions:**
  - Create milestone entry in case log
  - Notify all team members
  - Update task filtering defaults
  - Send phase-specific tips/reminders
  - Update analytics dashboard

---

**AUTO-022: Trial Date Set**
- **Trigger:** Trial date entered
- **Actions:**
  - Spawn Cadence TRIAL-PREP-001 (Pre-Trial Preparation)
  - Create 20 pre-trial tasks
  - **Backward calculate deadlines:**
    - Witness/exhibit lists (60 days before)
    - Trial brief (45 days before)
    - Jury instructions (30 days before)
    - Motions in limine (30 days before)
  - Set critical reminders
  - Change phase to "Trial Preparation"

---

**AUTO-023: Settlement Reached**
- **Trigger:** Settlement agreement executed
- **Actions:**
  - Spawn Cadence SETTLE-001 (Settlement & Resolution)
  - Create 16 closing tasks
  - Create task: "Dismissal documents" (14 days, Priority 4)
  - Create task: "Close file" (30 days, Priority 3)
  - Notify Module B to close all open tasks
  - Change phase to "Closed"

---

**AUTO-024: Case Closed**
- **Trigger:** case.phase = "Closed"
- **Actions:**
  - Close all open tasks (if settlement)
  - Create task: "Final billing" (7 days, Priority 3)
  - Create task: "Archive file" (30 days, Priority 2)
  - Send final report to client/adjuster
  - Update case statistics
  - Check for refiling potential (if dismissal without prejudice)

---

**AUTO-025: Case Reopened**
- **Trigger:** case.phase changed from "Closed" to active
- **Actions:**
  - Restore case to active status
  - Review all previous deadlines
  - Recalculate time-sensitive deadlines
  - Create task: "Reassess case status" (Immediate, Priority 4)
  - Notify team of reopening
  - Update budget and timeline

---

### Georgia Deadline Calculator {#georgia-deadlines}

#### O.C.G.A. § 1-3-1 - Computing Time

**Core Rule:** When computing time periods, exclude the first day and include the last day, UNLESS the last day falls on a weekend or legal holiday.

#### The Two-Tier System

**SHORT DEADLINES (< 7 days):**
- **Exclude:** Intermediate Saturdays, Sundays, and legal holidays
- **Include:** The last day (unless it falls on weekend/holiday)
- **Do NOT count:** The trigger day (Day 0)

**Example: 3 days from Monday, January 15:**
- Day 0: Monday, Jan 15 (trigger - don't count)
- Day 1: Tuesday, Jan 16
- Day 2: Wednesday, Jan 17
- Day 3: Thursday, Jan 18
- **Deadline: Thursday, January 18**

**Example: 3 days from Friday, January 19:**
- Day 0: Friday, Jan 19 (trigger - don't count)
- Day 1: Monday, Jan 22 (skip Sat/Sun)
- Day 2: Tuesday, Jan 23
- Day 3: Wednesday, Jan 24
- **Deadline: Wednesday, January 24**

---

**STANDARD DEADLINES (≥ 7 days):**
- **Count:** All days (including weekends)
- **Do NOT count:** The trigger day (Day 0)
- **Extend:** If last day falls on weekend or holiday, extend to next business day

**Example: 30 days from Monday, January 15:**
- Day 0: Monday, Jan 15 (trigger - don't count)
- Count 30 calendar days forward
- Lands on: Wednesday, February 14
- **Deadline: Wednesday, February 14**

**Example: 30 days from Thursday, January 18:**
- Day 0: Thursday, Jan 18 (trigger - don't count)
- Count 30 calendar days forward
- Lands on: Sunday, February 17
- Extend to next business day: Monday, February 18
- **Deadline: Monday, February 18**

---

#### Georgia Legal Holidays (9 total)

1. **New Year's Day** - January 1
2. **Martin Luther King Jr. Day** - 3rd Monday in January
3. **Memorial Day** - Last Monday in May
4. **Juneteenth** - June 19
5. **Independence Day** - July 4
6. **Labor Day** - 1st Monday in September
7. **Columbus Day** - 2nd Monday in October
8. **Veterans Day** - November 11
9. **Thanksgiving Day** - 4th Thursday in November
10. **Christmas Day** - December 25

**Note:** If a holiday falls on a Saturday, it is observed on Friday. If it falls on Sunday, it is observed on Monday. This affects deadline calculations.

---

#### Discovery Close Calculation (Georgia-Specific)

**Rule:** Discovery closes **6 months from the date the answer is filed**, NOT 180 days.

**Method:**
1. Find answer filed date (e.g., January 15, 2025)
2. Add 6 months (same day, 6 months later): July 15, 2025
3. Check if July 15 is weekend/holiday
4. If yes, extend to next business day
5. **Result: Discovery closes July 15, 2025 (or next business day)**

**Example 1:**
- Answer filed: January 15, 2025 (Wednesday)
- 6 months later: July 15, 2025 (Tuesday)
- Check: Tuesday is business day
- **Discovery closes: July 15, 2025**

**Example 2:**
- Answer filed: January 18, 2025 (Saturday)
- 6 months later: July 18, 2025 (Friday)
- Check: Friday is business day
- **Discovery closes: July 18, 2025**

**Example 3:**
- Answer filed: February 15, 2025 (Saturday)
- 6 months later: August 15, 2025 (Friday)
- Check: Friday is business day
- **Discovery closes: August 15, 2025**

---

#### +3 Day Electronic Service Rule

**O.C.G.A. § 9-11-6(e):** Service by electronic means adds 3 additional calendar days to response deadlines.

**CRITICAL IMPLEMENTATION RULE:**
- **DO NOT** add +3 days to the calculated deadline
- **ONLY** display as a warning when deadline is overdue

**Why:** The +3 days is a grace period, not part of the deadline calculation. Display it as helpful context, but don't change the deadline.

**Example Display:**
```
Discovery Response Deadline: February 14, 2025
Status: OVERDUE (by 1 day)

⚠️ Note: Electronic service grace period (+3 days per O.C.G.A. § 9-11-6(e))
Grace period expires: February 17, 2025
```

---

### Discovery Close Management {#discovery-close}

#### Discovery Close Countdown Widget

**Purpose:** Real-time countdown display with color-coded urgency levels

**Display Location:**
- Case detail page (prominent)
- Dashboard (compact version)
- Task list (when discovery tasks visible)

**Countdown Logic:**
```javascript
function calculateDaysRemaining(discoveryCloseDate) {
  const today = getTodayISO(); // YYYY-MM-DD
  const daysRemaining = daysBetween(today, discoveryCloseDate);
  return daysRemaining;
}
```

---

#### Urgency Levels & Color Coding

**LEVEL 1: NORMAL (Green 🟢)**
- **Threshold:** > 90 days remaining
- **Color:** Green background (#dcfce7), green text (#166534), green border
- **Message:** "{X} days until discovery close"
- **Icon:** Calendar (static)
- **Action Items:** None displayed
- **Guidance:** "On track. Begin planning expert depositions and final subpoenas."

**LEVEL 2: WARNING (Yellow 🟡)**
- **Threshold:** 60-90 days remaining
- **Color:** Yellow background (#fef9c3), yellow text (#854d0e), yellow border
- **Message:** "{X} days until discovery close"
- **Icon:** Clock (static)
- **Action Items:**
  - "Plan final discovery requests and depositions"
  - "Begin expert witness retention"
  - "Identify remaining non-parties for subpoenas"
- **Guidance:** "Begin planning final discovery strategy."

**LEVEL 3: URGENT (Orange 🟠)**
- **Threshold:** 30-60 days remaining
- **Color:** Orange background (#ffedd5), orange text (#9a3412), orange border
- **Message:** "{X} days until discovery close - URGENT"
- **Icon:** Alert triangle (static)
- **Action Items:**
  - "Schedule remaining depositions within 2 weeks"
  - "Finalize expert witness retention"
  - "Issue final third-party subpoenas NOW"
- **Guidance:** "Last opportunity for new discovery requests."

**LEVEL 4: CRITICAL (Red 🔴)**
- **Threshold:** < 30 days remaining OR 0 days (today)
- **Color:** Red background (#fee2e2), red text (#991b1b), red border
- **Badge:** "URGENT" badge (animated pulse)
- **Icon:** Alert circle (animated pulse)
- **Message (if > 0 days):** "{X} day(s) until discovery close - CRITICAL"
- **Message (if 0 days):** "Discovery closes TODAY"
- **Action Items (< 30 days):**
  - "Complete all pending depositions IMMEDIATELY"
  - "Serve any final discovery requests NOW"
  - "Designate expert witnesses BEFORE CLOSE"
  - "Review case for final third-party subpoenas"
- **Action Items (TODAY):**
  - "Complete all pending discovery IMMEDIATELY"
  - "Expert designations due TODAY"
- **Guidance:** "CRITICAL: Finalize all pending discovery immediately."

**LEVEL 5: CLOSED (Gray ⚫)**
- **Threshold:** < 0 days (deadline passed)
- **Color:** Gray background (#f3f4f6), gray text (#4b5563), gray border
- **Message:** "Discovery period has closed ({X} days ago)"
- **Icon:** Calendar with X (static)
- **Warning:** "Motion required for additional discovery"
- **Guidance:** "Discovery period closed. New discovery requires court order."

---

#### Countdown Widget Components

**Full Version (Case Detail Page):**

```
┌─────────────────────────────────────────────────────────┐
│ 🔴 Discovery Close Countdown              [URGENT] ⚡   │
│                                                          │
│        28 days                                          │
│        Until discovery close                             │
│                                                          │
│ 📅 Discovery closes: March 15, 2025                    │
│                                                          │
│ ⚠️ Last opportunity for new discovery requests          │
│                                                          │
│ Critical Action Items:                                  │
│  • Complete all pending depositions                     │
│  • Serve any final discovery requests                   │
│  • Designate expert witnesses                           │
│  • Review case for final third-party subpoenas          │
│                                            ● [Red dot]  │
└─────────────────────────────────────────────────────────┘
```

**Compact Version (Dashboard):**
```
● Discovery: 28 days (animated pulse if critical)
```

---

#### Editable Discovery Deadline

**Feature:** User can manually edit discovery close date

**When Used:**
- Discovery deadline extended by agreement
- Discovery deadline extended by court order
- Error in original calculation
- Discovery reopened

**Cascade Effects When Edited:**

1. **Update case.discovery_close_date**
2. **Readjust all incomplete discovery-anchored tasks:**
   - Tasks with deadline_anchor = 'discovery_close_date'
   - Recalculate due dates based on new close date
   - **Do NOT change completed tasks** (locked)
3. **Update calendar events:**
   - Discovery close event date
   - Reminder dates
4. **Log the change:**
   - Old date → New date
   - Reason for change
   - Tasks affected (count)
5. **Notify team:**
   - Alert all assigned attorneys
   - Show summary of updated tasks

**Example:**
```
Discovery close date changed: July 15 → August 1, 2025
Reason: Court order extending discovery
Tasks readjusted: 8 incomplete tasks
Tasks locked: 3 completed tasks (not changed)
Calendar events updated: 5 events
```

---

#### Task Locking Rules

**Principle:** Completed tasks should NOT be changed when discovery deadline shifts.

**Implementation:**
- When task.status = 'completed', set task.is_locked = TRUE
- When discovery deadline changes, skip locked tasks in readjustment
- Only update incomplete tasks (pending, in-progress)

**Why:** Completed tasks represent actual work done. Changing their due dates retroactively is confusing and historically inaccurate.

---

### Calendar Integration {#calendar-integration}

#### Two Integration Methods

**Method 1: Outlook Calendar (Native)**
- Direct Microsoft Graph API integration
- OAuth 2.0 authentication
- Two-way sync (create, update, delete events)
- Requires internet connection
- Best for: Office 365 users

**Method 2: .ICS Export (Universal)**
- RFC 5545 compliant .ICS file generation
- Works with Google Calendar, Apple Calendar, Outlook, etc.
- One-way export (download .ICS file, import to calendar)
- No internet required
- Best for: Universal compatibility

**User Choice:**
- Let user select: "Outlook" or ".ICS" or "Both"
- Store preference per user
- Option to change at any time

---

#### Calendar Event Data Structure

**Event Fields:**
- `id` - Unique identifier
- `task_id` - Links to task (optional)
- `case_id` - Links to case (REQUIRED)
- `title` - Event title (REQUIRED)
- `description` - Event description
- `start_date` - Start date (REQUIRED)
- `end_date` - End date (REQUIRED)
- `all_day` - Boolean (default TRUE)
- `start_time` - Start time (if not all_day)
- `end_time` - End time (if not all_day)
- `location` - Event location
- `reminders` - Array of days before [30, 14, 7, 3, 1]
- `calendar_type` - 'outlook', 'ics', 'both'
- `outlook_event_id` - If synced to Outlook
- `event_type` - 'auto' or 'manual'
- `created_at`, `updated_at`

---

#### Automatic Calendar Event Creation

**Events Created Automatically:**

1. **Discovery Close Date**
   - Title: "Discovery Close - [Case Name]"
   - Date: discovery_close_date
   - All-day: YES
   - Reminders: 30, 14, 7, 3, 1 days before
   - Description: "Last day for discovery requests, depositions, and expert designations."

2. **Answer Deadline**
   - Title: "Answer Due - [Case Name]"
   - Date: answer_due_date
   - All-day: YES
   - Reminders: 14, 7, 3, 1 days before
   - Description: "JURISDICTIONAL DEADLINE. File answer by 5:00 PM."

3. **Discovery Response Due**
   - Title: "Discovery Response Due - [Case Name]"
   - Date: response_due_date
   - All-day: YES
   - Reminders: 7, 3, 1 days before
   - Description: "Respond to [type] from [party]."

4. **Mediation**
   - Title: "Mediation - [Case Name]"
   - Date: mediation_date
   - All-day: NO
   - Start time: From mediation details
   - Reminders: 30, 7, 1 days before
   - Location: Mediator's office
   - Description: "Mediator: [name]. Prep materials due [date]."

5. **Trial**
   - Title: "Trial - [Case Name]"
   - Date: trial_date
   - All-day: YES (unless specific time known)
   - Reminders: 60, 30, 14, 7, 1 days before
   - Location: Courthouse
   - Description: "Judge: [name]. Courtroom: [number]."

---

#### Manual "Add to Calendar" Feature

**Location:** Task detail modal/page

**Button:** "Add to Calendar" (visible on all tasks)

**Modal/Editor:**
- Pre-fill with task details:
  - Title: Task title
  - Date: Task due date
  - Description: Task description
- **User can edit everything:**
  - Change title (e.g., add "HIGH EXPOSURE")
  - Change dates/times
  - Add multiple custom reminders
  - Add detailed notes
  - Set location
  - Choose all-day vs timed event
- **User selects calendar type:**
  - Outlook
  - .ICS export
  - Both
- **Save:**
  - Create calendar_events record
  - Link to task (task_id)
  - If Outlook: Call API to create event
  - If .ICS: Generate file and download
  - Mark task as "calendared" (show badge)

---

#### High-Exposure Case Tracking

**Feature:** Flag high-exposure cases and give extra calendar attention

**Indicator:**
- In case data: `is_high_exposure` boolean
- If TRUE:
  - Add "HIGH EXPOSURE" prefix to all calendar event titles
  - Suggest extra reminders (30, 14, 7, 3, 1 days instead of just 7, 1)
  - Display warning in calendar event editor
  - Color-code (red) in calendar views

**Example Title:**
- Normal: "Discovery Close - Smith v. Johnson"
- High Exposure: "HIGH EXPOSURE: Discovery Close - Smith v. Johnson ($500K+)"

---

#### Reminder System

**Default Reminders by Event Type:**

| Event Type | Default Reminders |
|-----------|------------------|
| Jurisdictional Deadlines | 14, 7, 3, 1 days |
| Discovery Close | 30, 14, 7, 3, 1 days |
| Other Deadlines | 7, 3, 1 days |
| Depositions | 7, 3, 1 days |
| Mediation | 30, 7, 1 days |
| Trial | 60, 30, 14, 7, 1 days |
| Meetings | 1 day |

**Custom Reminders:**
- User can add any number of custom reminders
- Input: Days before event
- Range: 1-365 days
- Multiple allowed (e.g., 90, 60, 30, 14, 7, 3, 1)

**Reminder Delivery:**
- In-app notification
- Email to assigned attorney
- Desktop notification (if enabled)
- SMS (optional future feature)

---

## PART III: INTEGRATION CONCEPTS

### How Module B + SU Work Together {#integration}

**Module B (Task Manager):**
- Provides the task CRUD infrastructure
- Stores tasks, task groups, time entries
- Displays tasks and time tracking UI
- Handles user interactions

**Module SU (Shared Utilities):**
- Provides deadline calculation functions
- Provides automation engine
- Triggers cadence spawning
- Generates calendar events
- Manages discovery countdown

**Integration Flow:**

1. **User action in UI** (Module B):
   - E.g., "Mark answer as filed"
   - Module B updates database: case.answer_filed_date
   
2. **Trigger detected** (Module SU):
   - Automation engine sees answer_filed_date changed
   - AUTO-002 triggered
   
3. **Automation executes** (Module SU):
   - Calculate discovery close date (6 months, Georgia rule)
   - Update case.discovery_close_date
   - Spawn cadence DISC-001
   
4. **Tasks created** (Module B):
   - 17 tasks inserted into tasks table
   - Linked to case and task_group
   - Due dates calculated using Module SU functions
   
5. **UI updates** (Module B):
   - Task list refreshes
   - Shows new tasks
   - Discovery countdown widget appears

---

### Automation Triggers {#triggers}

**Trigger Types:**

1. **Database Field Changes**
   - Watch specific columns: answer_filed_date, discovery_close_date, etc.
   - On UPDATE, check if field changed
   - Execute associated automation

2. **Time-Based Triggers**
   - Daily cron job checks upcoming deadlines
   - X days before discovery close
   - X days before any deadline
   - Execute associated automation

3. **Manual Triggers**
   - User clicks "Trigger Cadence" button
   - User selects cadence from list
   - Execute selected automation

4. **Event-Based Triggers**
   - File uploaded (e.g., complaint, discovery)
   - Status changed (e.g., phase change)
   - Record created (e.g., new case, new party)
   - Execute associated automation

**Trigger Detection Implementation:**

```javascript
// Pseudo-code
async function onCaseUpdate(caseId, updates) {
  const oldCase = await getCase(caseId);
  const newCase = { ...oldCase, ...updates };
  
  // Check each automation trigger condition
  for (const automation of automations) {
    if (automation.trigger_type === 'field_change') {
      const field = automation.trigger_field;
      if (oldCase[field] !== newCase[field]) {
        await executeAutomation(automation, caseId, newCase);
      }
    }
  }
  
  // Save updates
  await updateCase(caseId, updates);
}
```

---

### Phase Progression Logic {#phase-progression}

**10 Litigation Phases:**

1. **Open** - Initial intake, no complaint yet
2. **Complaint Filed** - Complaint received, answer pending
3. **Answer & Initial Pleadings** - Answer filed, discovery about to open
4. **Written Discovery** - Discovery requests and responses
5. **Depositions** - Deposition phase
6. **Mediation** - Mediation scheduled or ongoing
7. **Expert Discovery** - Expert designations and depositions
8. **Pre-Trial Motions** - Summary judgment, motions in limine
9. **Trial** - Trial preparation and trial
10. **Post-Trial/Appeal** - Post-trial motions, appeals

**Automatic Phase Changes:**

| Current Phase | Trigger | New Phase |
|--------------|---------|-----------|
| Open | Complaint received | Complaint Filed |
| Complaint Filed | Answer filed | Answer & Initial Pleadings |
| Answer & Initial Pleadings | Discovery propounded | Written Discovery |
| Written Discovery | First deposition scheduled | Depositions |
| Depositions | Mediation scheduled | Mediation |
| Depositions (no mediation) | Expert designated | Expert Discovery |
| Any phase | Trial date set | Trial |
| Trial | Verdict entered | Post-Trial/Appeal |
| Any phase | Settlement reached | Closed |

**Phase Change Actions:**

1. Update case.phase
2. Log phase change in case history
3. Send notification to team
4. Update task filtering defaults
5. Potentially trigger phase-specific cadence
6. Update dashboard widgets

---

### Automation Control & Settings {#automation-settings}

**CRITICAL FEATURE: Automation Toggle System**

**Requirement:** Every automation and cadence should have an enable/disable toggle in system settings.

**Why:** 
- Not all workflows apply to every case type
- Some tasks may be handled differently in certain jurisdictions
- Users need flexibility to customize automation behavior
- Prevent unwanted task spam for edge cases

**Implementation:**
- **Settings Page:** "Automation & Workflows" section
- **Toggle List:** All 25 automations with enable/disable switch
- **Cadence Toggles:** All 18 cadences with enable/disable switch
- **Optional Task Toggles:** Federal-specific tasks, CMC prep, etc.
- **Default State:** ALL enabled (user can disable as needed)
- **Persistence:** Settings saved per user or firm-wide (configurable)

**Example Settings UI:**

```
Automation Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Case State Changes:
☑ AUTO-001: Case Created
☑ AUTO-002: Answer Filed
☑ AUTO-003: Discovery Propounded
☑ AUTO-004: Discovery Period Closed
☑ AUTO-005: Mediation Scheduled

Document Events:
☑ AUTO-006: Complaint Received
☑ AUTO-007: Discovery Received
☑ AUTO-008: Medical Records Received
☑ AUTO-009: Expert Report Received
☑ AUTO-010: Deposition Notice Received

Deadline Triggers:
☑ AUTO-011: 90 Days Before Discovery Close (Expert Identification)
☑ AUTO-011B: 30 Days Before Discovery Close
☑ AUTO-012: 7 Days Before Discovery Close
☑ AUTO-013: 7 Days Before Any Deadline
☑ AUTO-014: 1 Day Before Any Deadline
☑ AUTO-015: Deadline Missed

[Continue for all 26 automations...]

Cadences:
☑ INT-001: Case Intake & Initial Setup
☑ ANS-001: Answer and Initial Pleadings
☑ AMD-CMP-001: Amended Complaint Filed
☑ DISC-001: Discovery Initiated
☑ DISC-RESP-001: Discovery Response - Our Client
☑ DISC-REVIEW-001: Discovery Response Review
☑ 6.4-001: Discovery Deficiency Management
☑ DEPO-PREP-001: Deposition Scheduling & Prep
☑ DEPO-POST-001: Deposition Follow-Up

[Continue for all 18 cadences...]

Optional Tasks:
☐ Federal Initial Disclosures (Rule 26)
☐ Case Management Conference Prep
```

**Per-Case Override:**
- User can manually trigger any disabled automation for specific cases
- "Trigger Cadence" button in case detail page
- Select from dropdown of available cadences
- Confirmation dialog before spawning tasks

---

## END OF KNOWLEDGE EXTRACTION

**Total Pages:** ~37
**Total Cadences:** 18 (with ~242 total tasks + optional tasks)
**Total Automations:** 26
**Extraction Date:** November 2025
**Updated:** November 2025 (refined based on actual practice feedback)
**Source Project:** Sunflower Suite v4.0 (crashed)
**Target Project:** Sunflower Suite v5.0 (current rebuild)

---

**Next Steps:**
1. ✅ Review this document for accuracy (COMPLETED with practice-specific refinements)
2. Design `schema-module-b.sql` based on this knowledge
3. Implement one feature at a time
4. Build in NEW project's architectural style (following `SUNFLOWER_SUITE_v5.0_FINAL_CHARTER.md`)

---

## 📝 IMPLEMENTATION NOTES

**Critical Considerations:**

1. **Database Schema First:** Design complete schema before any UI work (Golden Rule from Charter)
2. **Start Small:** Implement Basic Task CRUD first, then add one cadence, test thoroughly
3. **Lead Attorney Field:** Ensure case intake form dropdown (Elizabeth, Kelly, Katy, etc.) is properly linked
4. **Automation Toggles:** Build toggle system BEFORE implementing automations (prevents unwanted task spam during testing)
5. **Optional Tasks:** Federal and CMC tasks should have conditional logic based on user settings
6. **Discovery Close Date:** Special handling for editable deadline with cascade effects (readjust incomplete tasks only)
7. **Volume Practice:** Prioritize efficiency - not every task needs immediate completion; deadlines reflect realistic workflow
8. **Georgia-Specific:** O.C.G.A. § 1-3-1 deadline calculations are non-negotiable; implement carefully

**Testing Strategy:**
- Create test case with known dates
- Trigger each cadence manually first (before enabling automations)
- Verify task due dates match expectations
- Test discovery close countdown widget at all urgency levels
- Confirm optional tasks don't spawn when disabled

