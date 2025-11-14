# CONTACT-PARTY INTEGRATION PLAN
## Module A Phase 1B Enhancement
### Connecting Case Intake → Parties → Contacts

---

## PROBLEM STATEMENT

Currently, contacts and parties are **separate systems**:
- **Parties** live in `case_parties` table (tracked per case)
- **Contacts** live in `global_contacts` + `case_contacts` tables

**User's Request:**
1. When adding a party during case intake, **also create a contact**
2. When adding court personnel/counsel/adjusters, **also create contacts**
3. Allow marking contact as a party during contact creation
4. Keep ability to create standalone contacts (not linked to parties)
5. **Unified button** to open contact form from case detail

---

## PROPOSED SOLUTION

### **APPROACH: Two-Way Sync with Optional Linking**

```
┌─────────────────────────────────────────────────────────┐
│                    CASE INTAKE FORM                     │
├─────────────────────────────────────────────────────────┤
│ Add Party:                                              │
│   Name: John Smith                                      │
│   [ ] Create Contact Profile                            │ ← NEW CHECKBOX
│       └─ Opens mini contact form (phone/email/address)  │
│                                                          │
│ Defense Counsel:                                        │
│   Name: Jane Doe, Esq.                                  │
│   [ ] Create Contact Profile                            │ ← NEW CHECKBOX
│       └─ Auto-fills contact_type: 'defense_counsel'     │
│                                                          │
│ Adjuster:                                               │
│   Name: Bob Johnson                                     │
│   [ ] Create Contact Profile                            │ ← NEW CHECKBOX
│       └─ Auto-fills contact_type: 'adjuster'            │
└─────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION PLAN

### **PHASE 1: Add "Create Contact" Checkbox to Case Forms**

**Files to Modify:**
1. `src/components/moduleA/CaseForm.tsx`
   - Add checkbox for each party/counsel/adjuster field
   - Show expandable contact detail fields when checked

2. `src/components/moduleA/AddPartyModal.tsx` (if exists)
   - Add "Create Contact Profile" section

**Example UI:**
```tsx
// In party form
<div className="party-entry">
  <input type="text" placeholder="Party Name" />
  
  <label>
    <input type="checkbox" checked={createContact} />
    Create Contact Profile
  </label>
  
  {createContact && (
    <div className="contact-details-mini">
      <input type="tel" placeholder="Phone" />
      <input type="email" placeholder="Email" />
      <textarea placeholder="Address" />
    </div>
  )}
</div>
```

---

### **PHASE 2: Create Shared Contact Form Component**

**New Component: `QuickContactForm.tsx`**
- Reusable form for adding contacts in different contexts
- Can be embedded OR opened as modal
- Accepts pre-filled values (e.g., name from party)

**Props:**
```typescript
interface QuickContactFormProps {
  initialData?: Partial<ContactInput>;
  autoFillType?: ContactType; // Pre-fill contact_type based on context
  showFullForm?: boolean; // Show all fields vs. quick add
  onSubmit: (contactData: ContactInput) => Promise<void>;
  onCancel?: () => void;
}
```

**Usage Examples:**
```tsx
// In party form (embedded)
<QuickContactForm
  initialData={{ name: partyName }}
  autoFillType="plaintiff_counsel"
  showFullForm={false}
  onSubmit={handleCreateContact}
/>

// In case detail (modal)
<QuickContactForm
  autoFillType="defense_counsel"
  showFullForm={true}
  onSubmit={handleCreateContact}
/>

// In global contact manager (full independent)
<QuickContactForm
  showFullForm={true}
  onSubmit={handleCreateContact}
/>
```

---

### **PHASE 3: Add Database Link Between Parties and Contacts**

**Option A: Add contact_id to case_parties (RECOMMENDED)**
```sql
ALTER TABLE case_parties 
ADD COLUMN contact_id INTEGER REFERENCES global_contacts(id);

CREATE INDEX idx_case_parties_contact ON case_parties(contact_id);
```

**Benefit:** Direct link - when party name changes in contact, can update party
**Drawback:** Not all parties will have contacts (optional)

**Option B: Use case_contacts as bridge (CURRENT APPROACH)**
- Keep parties and contacts separate
- Link them via `case_contacts` table
- More flexible but requires JOIN queries

---

### **PHASE 4: Add "Create Contact From Party" Button**

**Location:** Case Detail → Parties Section

```tsx
// In CaseDetail.tsx - Parties section
{parties.map(party => (
  <div className="party-card">
    <h4>{party.party_name}</h4>
    
    {!party.contact_id && (
      <button onClick={() => createContactFromParty(party)}>
        📞 Create Contact Profile
      </button>
    )}
    
    {party.contact_id && (
      <button onClick={() => viewContact(party.contact_id)}>
        👁️ View Contact
      </button>
    )}
  </div>
))}
```

**Logic:**
```typescript
const createContactFromParty = async (party: Party) => {
  // Pre-fill contact form with party data
  const contactData: ContactInput = {
    name: party.party_name,
    organization: party.is_corporate ? party.party_name : undefined,
    // Let user fill in phone/email/address
  };
  
  // Open QuickContactForm modal
  setContactFormData(contactData);
  setShowContactModal(true);
};
```

---

### **PHASE 5: Enhanced Contact Form with Party Marking**

**Add to `AddContactModal.tsx` / `QuickContactForm.tsx`:**

```tsx
// New field in contact form
<div>
  <label>Link to Case Party</label>
  <select value={linkedPartyId}>
    <option value="">Not a party</option>
    {parties.map(party => (
      <option key={party.id} value={party.id}>
        {party.party_name} ({party.party_type})
      </option>
    ))}
  </select>
</div>
```

**On Submit:**
```typescript
const handleSubmit = async () => {
  // 1. Create contact
  const contactId = await createContact(contactData);
  
  // 2. If linked to party, update party record
  if (linkedPartyId) {
    await updateParty(linkedPartyId, { contact_id: contactId });
  }
  
  // 3. If case-specific role, create case_contact link
  if (caseContactData) {
    await addContactToCase({
      case_id: selectedCase.id,
      contact_id: contactId,
      contact_type: caseContactData.contact_type,
      role: caseContactData.role
    });
  }
};
```

---

## DATA FLOW EXAMPLES

### **Example 1: Adding Plaintiff During Intake**
```
User fills case intake form:
  └─ Add Party: "John Smith" (Plaintiff)
  └─ ✓ Create Contact Profile
      └─ Phone: (555) 123-4567
      └─ Email: jsmith@example.com

On Submit:
  1. Create case → case_id = 1
  2. Create party → party_id = 1, case_id = 1, party_name = "John Smith"
  3. Create contact → contact_id = 100, name = "John Smith", phone = ...
  4. Update party → party.contact_id = 100
  5. Create case_contact → case_id = 1, contact_id = 100, type = 'plaintiff_counsel'
```

### **Example 2: Adding Defense Counsel Later**
```
User navigates to Case Detail → Contacts:
  └─ Click "Link Existing Contact" or "Add New Contact"
  └─ Select contact_type = 'defense_counsel'
  └─ Fill name, phone, email
  └─ ✓ Also add as Case Party (Defendant's Counsel)

On Submit:
  1. Create contact → contact_id = 101
  2. Create case_contact → case_id = 1, contact_id = 101, type = 'defense_counsel'
  3. IF "add as party" checked:
     Create party → party_id = 2, case_id = 1, party_name = "Defense Counsel Name", 
                   party_type = 'defendant', contact_id = 101
```

### **Example 3: Standalone Contact Creation**
```
User navigates to Global Contact Database:
  └─ Click "Add New Contact"
  └─ Fill all fields (no case-specific info)
  └─ Leave "Link to Case" empty

On Submit:
  1. Create contact → contact_id = 102
  2. No case_contact or party records created
  3. Contact available in global database for future linking
```

---

## UI/UX IMPROVEMENTS

### **Unified Contact Button in Case Detail**

**Current:**
- Multiple places to add contacts (confusing)

**Proposed:**
```
┌──────────────────────────────────────────────────┐
│ CASE DETAIL - John Doe v. ABC Corp              │
├──────────────────────────────────────────────────┤
│                                                  │
│ [Edit Case]  [Start Disposition]  [📞 Contacts] │ ← UNIFIED BUTTON
│                                                  │
│ └─ Opens dropdown:                               │
│     • Add Contact to Case                        │
│     • Create Contact from Party                  │
│     • View All Case Contacts                     │
│     • Go to Global Contact Database              │
└──────────────────────────────────────────────────┘
```

---

## ACCEPTANCE CRITERIA

### **Must Have:**
- [ ] Checkbox to create contact during case intake (parties/counsel/adjusters)
- [ ] Contact form pre-fills with data from case intake
- [ ] "Create Contact from Party" button in Case Detail
- [ ] Standalone contact creation still works (global database)
- [ ] Contacts can be marked as parties during creation
- [ ] Party → Contact link stored in database
- [ ] Contact changes sync to party name (if linked)

### **Nice to Have:**
- [ ] Visual indicator showing which parties have contact profiles
- [ ] "Complete Contact Info" badge for incomplete contacts
- [ ] Bulk "Create Contacts from All Parties" button
- [ ] Smart contact suggestions (if similar name exists)

---

## NEXT STEPS

**Do you approve this architecture?** If yes, I'll implement:

1. **Quick Contact Form component** (reusable)
2. **Checkboxes in case intake** for contact creation
3. **Database schema update** to link parties → contacts
4. **Unified contact button** in case detail
5. **Party-to-contact conversion** functionality

Let me know if you'd like any changes to this plan!

