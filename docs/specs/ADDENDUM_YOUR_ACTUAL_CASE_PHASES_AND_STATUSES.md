# 🔧 ADDENDUM: Your Actual Case Phases & Statuses

**Important:** Use these ACTUAL definitions, not the generic ones in the charter.

**Date:** November 12, 2025  
**Status:** Replaces generic phases in Project Charter Part 2

---

## YOUR ACTUAL CASE PHASES

These are the litigation phases you actually work with. Use these, not generic placeholders.

### Case Phases (Chronological Order)

1. **Monitor for Service**
   - Case received, waiting for service of process
   - Trigger: Case created
   - Ends when: Service documents received

2. **Pre-Suit**
   - Demand letter sent, negotiating before filing
   - May include mediation discussions
   - Trigger: Service received
   - Ends when: Suit filed or settlement reached

3. **Pending Mediation** (Optional sub-phase)
   - Active mediation discussions ongoing
   - May include settlement offers
   - Details: Date-last-demand, amount-last-offer (if offered), policy-limit
   - Can occur in: Pre-Suit or Post-Suit phases
   - Ends when: Settlement reached or mediation terminated

4. **Pending Lawsuit Being Filed**
   - Pre-suit complete, lawsuit in process of being filed
   - All pre-suit deadlines passed
   - Trigger: Decision to file suit made
   - Ends when: Complaint filed

5. **Discovery**
   - Post-complaint filed, in discovery phase
   - Exchanging documents, interrogatories, depositions
   - Trigger: Complaint filed
   - Ends when: Discovery closed date

6. **Pre-Trial Phase**
   - Discovery closed, preparing for trial
   - Motion practice, expert reports, trial prep
   - Trigger: Discovery closed
   - Ends when: Trial begins or case settles

7. **Trial Prep** (May be sub-phase of Pre-Trial)
   - Immediate preparation before trial
   - Final motions, jury selection prep, trial materials
   - Trigger: Trial date set
   - Ends when: Trial begins

8. **Settled**
   - Case settled (any phase)
   - Closed File (see statuses below)
   - Trigger: Settlement agreement signed
   - Note: Settlement disposition; active settlement

9. **Dismissed**
   - Case dismissed (any phase)
   - Closed File (see statuses below)
   - Trigger: Dismissal order
   - Reason: Motion granted, plaintiff withdrawal, other

10. **Closed File**
    - Case closed (any reason)
    - Not active
    - Can mean: Settled, Dismissed, Judgment entered, or Other

---

## YOUR ACTUAL CASE STATUSES

Use these for case status field, not generic "Active/Inactive".

### Status Values

| Status | Meaning | Can Transition To | Phase |
|--------|---------|------------------|-------|
| **Pending** | Awaiting action (generic catch-all) | Any | Any |
| **Pending Service** | Waiting for service documents | Any | Monitor for Service |
| **Pending Lawsuit** | Pre-suit complete, lawsuit being filed | Discovery | Pending Lawsuit |
| **Active** | Case is actively being worked | Any | Any (except Settled/Dismissed/Closed) |
| **On Hold** | Case temporarily paused (no work) | Active | Any |
| **Settled** | Case settled | Closed File | Settlement |
| **Dismissed** | Case dismissed | Closed File | Dismissed |
| **Closed** | Case closed (any reason) | None | Closed File |
| **Conflict Clearance** | Potential conflict being cleared | Active | Any |

---

## HOW THESE PHASES MAP IN THE APP

### Module A (Case Manager)
**Database field:** `phase` (text)  
**Allowed values:** monitor-for-service, pre-suit, pending-mediation, pending-lawsuit, discovery, pre-trial, trial-prep, settled, dismissed, closed-file

**Database field:** `status` (text)  
**Allowed values:** pending, pending-service, pending-lawsuit, active, on-hold, settled, dismissed, closed, conflict-clearance

### Module B (Task Manager)
Tasks might auto-spawn based on phase:
- Enter "Monitor for Service" → Spawn "Service Monitoring" task group
- Enter "Pre-Suit" → Spawn "Pre-Suit Negotiation" task group
- Enter "Discovery" → Spawn "Discovery Management" task group
- etc.

### Module C (Calendar & Deadlines)
Deadlines that trigger based on phase transitions:
- Service date received → calculate Answer due (20 days in GA)
- Discovery opened → calculate Discovery close date
- etc.

---

## HOW TO REPRESENT THIS IN CODE

### Database Schema (Module A)

```sql
ALTER TABLE cases ADD COLUMN IF NOT EXISTS phase TEXT 
  CHECK (phase IN (
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
  ));

ALTER TABLE cases ADD COLUMN IF NOT EXISTS status TEXT 
  CHECK (status IN (
    'pending',
    'pending-service',
    'pending-lawsuit',
    'active',
    'on-hold',
    'settled',
    'dismissed',
    'closed',
    'conflict-clearance'
  ));
```

### TypeScript Types (src/types/index.ts)

```typescript
export type CasePhase = 
  | 'monitor-for-service'
  | 'pre-suit'
  | 'pending-mediation'
  | 'pending-lawsuit'
  | 'discovery'
  | 'pre-trial'
  | 'trial-prep'
  | 'settled'
  | 'dismissed'
  | 'closed-file';

export type CaseStatus = 
  | 'pending'
  | 'pending-service'
  | 'pending-lawsuit'
  | 'active'
  | 'on-hold'
  | 'settled'
  | 'dismissed'
  | 'closed'
  | 'conflict-clearance';

export interface Case {
  id: string;
  phase: CasePhase;
  status: CaseStatus;
  // ... other fields
}
```

### React Component (Select Dropdown)

```typescript
const PHASES = [
  { value: 'monitor-for-service', label: 'Monitor for Service' },
  { value: 'pre-suit', label: 'Pre-Suit' },
  { value: 'pending-mediation', label: 'Pending Mediation' },
  { value: 'pending-lawsuit', label: 'Pending Lawsuit' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'pre-trial', label: 'Pre-Trial' },
  { value: 'trial-prep', label: 'Trial Prep' },
  { value: 'settled', label: 'Settled' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'closed-file', label: 'Closed File' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'pending-service', label: 'Pending Service' },
  { value: 'pending-lawsuit', label: 'Pending Lawsuit' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'settled', label: 'Settled' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'closed', label: 'Closed' },
  { value: 'conflict-clearance', label: 'Conflict Clearance' },
];
```

---

## KEY DIFFERENCES FROM CHARTER

**Charter (Generic):**
```
phase: 'intake', 'pre-suit', 'suit', 'discovery', 'trial', 'closed'
status: 'active', 'pending', 'closed'
```

**Your Actual (Real):**
```
phase: 'monitor-for-service', 'pre-suit', 'pending-mediation', 
       'pending-lawsuit', 'discovery', 'pre-trial', 'trial-prep', 
       'settled', 'dismissed', 'closed-file'
status: 'pending', 'pending-service', 'pending-lawsuit', 'active', 
        'on-hold', 'settled', 'dismissed', 'closed', 'conflict-clearance'
```

---

## SPECIAL FIELDS FOR PENDING MEDIATION

When case is in "Pending Mediation" status, track these additional fields:

```sql
ALTER TABLE cases ADD COLUMN IF NOT EXISTS mediation_date_last_demand TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS mediation_amount_last_offer TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS policy_limit TEXT;
```

---

## INSTRUCTIONS FOR SONNET

When building Module A, use these exact phases and statuses, not the generic ones in the Project Charter.

The Project Charter Part 2 should be updated to say:

"See ADDENDUM: Your Actual Case Phases & Statuses for the real phase and status definitions."

---

## NEXT TIME YOU DON'T HAVE TO RE-FIGURE THIS

This is the lesson you learned: **You already figured this out once. Now it's documented so Sonnet uses the right values.**

Save this addendum in your project docs folder:

```
docs/CASE_PHASES_AND_STATUSES.md
```

Then every module that references phases or statuses links to this document.

---

**Status:** Ready to use  
**Include in:** Project Charter Part 2  
**Reference in:** Module A schema, Module B cadence triggers, Module C deadlines

