# 🔧 ADDENDUM 3: Mark-and-Populate Engine (Cross-Module Intelligence Layer)

**Critical:** This is foundational infrastructure for Modules E-L. Read AFTER Module D addendum.

**Date:** November 12, 2025  
**Status:** Core cross-module architecture  
**Urgency:** HIGH - Every downstream module depends on this

---

## PART 1: Mark-and-Populate Overview

### What Is M&P?

The **Mark-and-Populate (M&P) Engine** is the intelligent document processing backbone that enables:

- ✅ **Text selection & semantic tagging** from any document
- ✅ **Intelligent extraction** (dates, facts, providers, admissions, objections)
- ✅ **Auto-population** of tagged content into case documents
- ✅ **Cross-module intelligence** (every module E-L benefits from this)
- ✅ **Audit trail** (every fact linked back to source document)

### Why It's Critical

**Without M&P:** Lawyers re-key facts manually from documents into case summaries  
**With M&P:** Mark text once → auto-populates everywhere it's needed

### Timeline

- **After Module D complete** (week 2-3)
- **Before Module E starts** (week 4)
- **Build time:** 2.5 weeks
- **Reused by:** All Modules E-L

---

## PART 2: What M&P Does (Complete Feature Set)

### Feature 1: Document Rendering

**Supported file types:**
- ✅ PDF (multi-page with page navigation)
- ✅ DOCX (converted to display-friendly format)
- ✅ TXT (plain text files)
- ✅ Images (JPG, PNG with OCR text searchable)
- ✅ Email screenshots (for correspondence)

**Rendering libraries:**
- PDF.js (for PDF rendering)
- Mammoth (for DOCX → HTML conversion)
- Canvas API (for annotations)

**User sees:**
- Document displayed in-app
- Page numbers
- Current page/total pages navigation
- Zoom in/out controls
- Ability to search text (Ctrl+F)

### Feature 2: Text Selection & Highlighting

**User action:**
1. Click at start of text
2. Drag to end of text
3. Release → text gets highlighted

**System action:**
- Captures exact character positions (text_range_start, text_range_end)
- Stores text content
- Stores page number
- Assigns unique highlight ID
- Shows highlight with distinct color

**Highlight colors by tag type:**
- 🟨 Yellow = RFP/Request
- 🟦 Blue = Date/Event
- 🟩 Green = Fact/Allegation
- 🟧 Orange = Provider/Medical
- 🟪 Purple = Admission/Objection
- ⬜ Gray = Other

### Feature 3: Semantic Tagging System

**Tag types user can select:**

| Tag Type | Used For | Example |
|----------|----------|---------|
| **request** | RFP/RFI/RFA numbers | "Responsive to RFP-5" |
| **fact** | Case facts/allegations | "Plaintiff claims causation" |
| **date_event** | Timeline events | "2025-01-15: Surgery performed" |
| **provider** | Medical providers | "Dr. Patricia Chen, orthopedic surgeon" |
| **procedure** | Medical procedures | "Left knee arthroscopy" |
| **amount** | Monetary values | "$50,000 in damages" |
| **quote** | Key testimony/admissions | "I saw the accident happen" |
| **objection** | Discovery objections | "Objection: overbroad and burdensome" |
| **admission** | Admissions by party | "Admit to allegation 5.2" |
| **other** | Anything else | Custom user notes |

**How tagging works:**

```
1. User highlights text
2. Small popup appears: "Tag as: [dropdown]"
3. User selects tag type
4. System stores: text + tag_type + page + character_positions
```

### Feature 4: Response Assignment

After tagging, user assigns response (for discovery):

```
Tag: "RFP-5: Documents showing causation"
Response type: [Dropdown: admit, deny, objection, partial, not applicable]
Response body: [Text area]
  "We deny that causation is an issue. See attached expert report."
```

**Response stored with:**
- response_type
- response_body
- timestamp
- user (who tagged it)

### Feature 5: Target Module Assignment

User specifies where this tagged content should go:

```
Question: "This tagged text belongs to:"
Options:
  ☐ Chronology (Module E)
  ☐ Medical Chronology (Module F)
  ☐ Issues & Claims (Module G)
  ☐ Deposition Prep (Module H)
  ☐ Discovery Responses (Module I)
  ☐ Trial Notebook (Module J)
  ☐ Reports (Module I)
  ☐ Other: [text field]
```

**System stores:**
- target_module
- target_field_name (e.g., "chronology.date_event")
- linked_entity_id (created when target module processes it)

### Feature 6: Batch Operations

**For efficiency when marking similar content:**

**Option A: Ctrl+Click multi-select**
- User Ctrl+Clicks multiple text regions
- All selected → tagged at once with same tag_type
- Assigns all to same target module

**Option B: "Mark Similar" button**
- User marks 1 text: "Dr. Smith, cardiologist"
- Button appears: "Mark similar names?"
- System suggests other instances of "Dr. Smith"
- User approves in batch

**Option C: Both** (recommended)

### Feature 7: Auto-Population to Templates

**When user clicks "Generate":**

```
1. M&P groups all highlights by target_module
2. For each target module:
   - Finds all tagged content destined for it
   - Retrieves response templates
   - Maps tagged text to template fields
   - Pre-fills template
3. Exports populated document (DOCX, PDF, or JSON)
```

**Example: Discovery Response Population**

```
User has marked:
- [RFP-5] "Causation opinion" (quote tag)
- [RFP-7] "Cost of treatment" (amount tag)
- [RFP-12] "Prior injuries" (fact tag)

All tagged with: target_module = "discovery"

M&P does:
1. Finds discovery response template
2. Maps to questions:
   - RFP-5 → Response to Interrogatory 5
   - RFP-7 → Response to Interrogatory 7
   - RFP-12 → Response to Interrogatory 12
3. Pre-fills with marked text
4. User reviews and edits if needed
5. Exports as DOCX (ready to file)
```

### Feature 8: Highlight Management

**List view showing all highlights in document:**

```
TABLE: All Highlights in This Document
──────────────────────────────────────
Page | Text | Tag Type | Response | Target | Status
────────────────────────────────────────────────────
3    | "Dr. Smith examined..." | provider | [none] | Medical | tagged
5    | "2025-01-15: Surgery" | date_event | [none] | Chronology | tagged
8    | "Admit to negligence" | admission | admit | Discovery | reviewed
```

**Actions:**
- Edit tag type
- Edit response
- Delete highlight
- Mark as "reviewed" (status tracking)
- Jump to highlight in document

---

## PART 3: M&P Database Schema

### New Table: text_highlights

```sql
CREATE TABLE IF NOT EXISTS text_highlights (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  document_id TEXT NOT NULL,  -- Links to Module D documents table
  page_number INTEGER,
  text_content TEXT,          -- The actual highlighted text
  text_range_start INTEGER,   -- Character position in full document
  text_range_end INTEGER,
  
  -- Tagging
  tag_type TEXT CHECK (tag_type IN (
    'request', 'fact', 'date_event', 'provider', 
    'procedure', 'amount', 'quote', 'objection', 
    'admission', 'other'
  )),
  tag_value TEXT,             -- e.g., "RFP-5", "Dr. Smith", "2025-01-15"
  
  -- Response (for discovery documents)
  response_type TEXT CHECK (response_type IN (
    'admit', 'deny', 'objection', 'partial', 'not_applicable'
  )),
  response_body TEXT,         -- Attorney's response text
  
  -- Target module
  target_module TEXT CHECK (target_module IN (
    'chronology', 'medical', 'issues', 'discovery',
    'deposition', 'trial', 'report', 'other'
  )),
  target_field_name TEXT,     -- e.g., "chronology.date_event"
  linked_entity_id TEXT,      -- ID of created fact/entry in target module
  
  -- Status tracking
  status TEXT CHECK (status IN (
    'pending', 'tagged', 'reviewed', 'populated', 'archived'
  )) DEFAULT 'pending',
  
  -- Audit trail
  created_by TEXT,            -- Attorney who tagged it
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by TEXT,
  populated_at TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_highlights_case ON text_highlights(case_id);
CREATE INDEX idx_highlights_document ON text_highlights(document_id);
CREATE INDEX idx_highlights_tag_type ON text_highlights(tag_type);
CREATE INDEX idx_highlights_target_module ON text_highlights(target_module);
CREATE INDEX idx_highlights_status ON text_highlights(status);
```

### Optional Table: tag_templates

```sql
CREATE TABLE IF NOT EXISTS tag_templates (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  tag_type TEXT NOT NULL,
  template_name TEXT,         -- e.g., "objection-overbroad"
  template_body TEXT,         -- Boilerplate text
  is_system BOOLEAN DEFAULT 0, -- System templates vs. user-created
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

---

## PART 4: M&P React Components

### Component 1: DocumentRenderer

**Props:**
```typescript
{
  document: Document;  // From Module D
  onTextSelected: (selection: TextSelection) => void;
  highlights?: Highlight[];
}
```

**Renders:**
- Document preview (PDF, DOCX, or TXT)
- Page navigation (if multi-page)
- Zoom controls
- Search (Ctrl+F)
- Current page indicator

### Component 2: HighlightLayer

**Purpose:** Show all existing highlights overlaid on document

**Props:**
```typescript
{
  highlights: Highlight[];
  selectedHighlightId?: string;
  onHighlightClick: (id: string) => void;
}
```

**Renders:**
- Colored boxes around highlighted text
- Color = tag_type
- Click to select/edit

### Component 3: TextSelector

**Purpose:** Popup when user selects text

**Props:**
```typescript
{
  selectedText: string;
  position: {x: number, y: number};
  onTag: (tagType: string) => void;
}
```

**Renders:**
```
┌─────────────────────┐
│ Tag this as:        │
│ [request ▼]         │
│ [Tag button]        │
└─────────────────────┘
```

### Component 4: ResponseAssignmentPanel

**Purpose:** Edit tags, assign responses, set target modules

**Props:**
```typescript
{
  highlights: Highlight[];
  onUpdate: (highlightId: string, updates: any) => void;
}
```

**Renders:**
- List of all highlights in document
- Edit buttons
- Dropdown for tag_type, response_type, target_module
- Status indicators

### Component 5: HighlightList

**Purpose:** Table view of all marked text

**Props:**
```typescript
{
  caseId: string;
  documentId?: string;  // Optional: filter by document
  filters?: {
    tag_type?: string;
    target_module?: string;
    status?: string;
  }
}
```

**Renders:**
```
TABLE: All Highlights
────────────────────────────────────────
Page | Text | Tag | Response | Target | Status
```

### Component 6: BatchMarkingInterface

**Purpose:** Mark multiple similar items at once

**Props:**
```typescript
{
  firstHighlightId: string;
  suggestedMatches: Highlight[];
  onApprove: (ids: string[]) => void;
}
```

**Renders:**
```
Suggestion: Mark similar instances?
Found 5 other instances of "Dr. Smith"
[☐] Page 3: "Dr. Smith examined..."
[☐] Page 5: "Dr. Smith opined..."
[☐] Page 7: "Dr. Smith testified..."
[Approve] [Cancel]
```

### Component 7: GenerateOutputPanel

**Purpose:** Preview and export populated documents

**Props:**
```typescript
{
  caseId: string;
  targetModule: string;
  highlightsByModule: Highlight[][];
}
```

**Renders:**
```
Generate Documents
──────────────────
Target: [Chronology ▼]
Format: [DOCX ▼]

Preview:
───────────────────────────
Chronology Entry 1
Date: 2025-01-15
Event: Surgery at Hospital ABC
Source: Medical records page 3
───────────────────────────

[Export as DOCX] [Copy to Clipboard]
```

---

## PART 5: M&P IPC Methods

```typescript
// Create highlight
createHighlight(
  caseId: string,
  documentId: string,
  data: {
    page_number: number;
    text_content: string;
    text_range_start: number;
    text_range_end: number;
    tag_type: string;
  }
): Promise<Highlight>

// Update highlight (edit tag, response, target)
updateHighlight(
  highlightId: string,
  updates: {
    tag_type?: string;
    response_type?: string;
    response_body?: string;
    target_module?: string;
    status?: string;
  }
): Promise<Highlight>

// Delete highlight
deleteHighlight(highlightId: string): Promise<void>

// Get highlights (with filters)
getHighlights(
  caseId: string,
  filters?: {
    documentId?: string;
    tag_type?: string;
    target_module?: string;
    status?: string;
  }
): Promise<Highlight[]>

// Get highlights ready to populate
getHighlightsByTargetModule(
  caseId: string,
  targetModule: string
): Promise<Highlight[]>

// Populate template from highlights
populateTemplate(
  caseId: string,
  targetModule: string,
  templateId: string
): Promise<{
  template_name: string;
  populated_content: string;  // DOCX or JSON
  linked_highlights: string[]; // highlight IDs
}

// Export populated document
exportPopulated(
  caseId: string,
  targetModule: string,
  format: 'docx' | 'pdf' | 'json'
): Promise<{file_path: string}>

// Link highlight to created entity
linkHighlightToEntity(
  highlightId: string,
  entityType: string,  // 'chronology_entry', 'issue', etc.
  entityId: string
): Promise<void>

// Batch mark similar
suggestSimilarHighlights(
  highlightId: string,
  threshold?: number  // Similarity threshold (0-1)
): Promise<Highlight[]>

// Mark similar in batch
batchMarkSimilar(
  highlightIds: string[],
  commonTagType: string,
  commonTargetModule: string
): Promise<void>
```

---

## PART 6: User Workflows (M&P)

### Workflow 1: Mark Discovery Response

```
1. Attorney has Module D open with plaintiff's interrogatory responses (PDF)
2. Opens same PDF in M&P Engine
3. Reads response to RFP-5
4. Highlights relevant passage: "We object on grounds of overbreadth"
5. Popup: "Tag as: [objection ▼]"
6. Selects "objection"
7. Response type panel appears: "Response: [objection ▼]"
8. Enters: "Objection: Overbroad and burdensome, not calculated to lead to discovery"
9. Target module: "discovery"
10. Repeats for RFP-7, RFP-12, etc.
11. Clicks "Generate" → M&P populates discovery response template
12. Exports DOCX ready to file
```

### Workflow 2: Extract Chronology from Medical Records

```
1. Attorney has medical records PDF in M&P
2. Highlights: "2025-01-15: Patient presented with left knee injury"
3. Tags as "date_event"
4. Selects target: "chronology"
5. Repeats for other dates/procedures
6. Clicks "Generate" → M&P creates chronology entries
7. Each entry includes:
   - Date and event
   - Link to source PDF
   - Page number and text range
8. All entries appear in Module E (Chronology)
```

### Workflow 3: Extract Key Admissions for Deposition

```
1. Attorney has plaintiff's deposition transcript in M&P
2. Marks: "I admit I was driving over speed limit"
3. Tags as "admission"
4. Selects target: "deposition"
5. Marks other admissions similarly
6. Clicks "Generate" → M&P groups all admissions
7. Module H (Deposition Prep) receives:
   - List of key admissions
   - Links to original deposition pages
   - Pre-populated deposition outline
```

---

## PART 7: Acceptance Criteria (M&P Complete)

### Phase 2 (Database)
- [ ] text_highlights table created and tested
- [ ] Foreign keys work (cascade delete)
- [ ] Indexes created

### Phase 3 (IPC)
- [ ] All IPC methods callable
- [ ] No TypeScript errors
- [ ] Methods return expected types

### Phase 4 (UI Components)
- [ ] Can open PDF and render in app
- [ ] Can open DOCX and render
- [ ] Can open TXT and render
- [ ] Text selection works (click + drag)
- [ ] Highlighting persists with color by tag_type
- [ ] Can edit tag_type on existing highlight
- [ ] Can enter response_body
- [ ] Can assign target_module
- [ ] Status dropdown works (pending → tagged → reviewed)
- [ ] Highlight list shows all highlights
- [ ] Can batch mark similar
- [ ] Can delete highlight
- [ ] No lag when highlighting (performance OK)

### Phase 5 (Integration)
- [ ] Create highlight in M&P
- [ ] Data persists after restart
- [ ] Can open Module D document in M&P
- [ ] Highlights survive document refresh
- [ ] Generate button exports populated DOCX
- [ ] Exported DOCX has correct structure
- [ ] Links to highlights work (click link → jump to document)
- [ ] No errors on cascade delete
- [ ] Module D regression (still works)
- [ ] Module E can receive M&P data (when Module E ready)

---

## PART 8: Performance Considerations

**Potential bottlenecks:**

1. **Large PDF rendering**
   - Solution: Lazy-load pages (show current + adjacent)
   - Solution: Virtual scrolling for text list

2. **Many highlights on one page**
   - Solution: Cluster highlights that overlap
   - Solution: Show/hide highlight layer (toggle button)

3. **Search across highlights**
   - Solution: Index text in database (FTS)
   - Solution: Limit results (show first 100)

4. **Batch operations on large documents**
   - Solution: Show progress (X of Y marked)
   - Solution: Queue operations (don't freeze UI)

---

## PART 9: Critical M&P Questions for Claude Sonnet/Code

Before Phase 1 ends, clarify:

1. **Document support:** PDF + DOCX + TXT enough, or add image/email screenshots?

2. **Tag types:** Are these 10 sufficient?
   - request, fact, date_event, provider, procedure, amount, quote, objection, admission, other
   - Or need more? (e.g., "cross_exam_answer", "medical_provider_name", "defendant_admission")

3. **Template system:** 
   - Hardcoded templates only?
   - Or let attorneys create/edit custom templates?
   - Or both?

4. **Batch marking:**
   - Ctrl+Click multi-select?
   - "Mark similar" button?
   - Both?

5. **Highlight persistence:**
   - Store in database?
   - Or only during session?
   - (Must be database for audit trail)

6. **Module integration:**
   - When M&P creates fact in Module E, should it auto-link back?
   - Or require manual linking?

---

## PART 10: Why M&P Is Genius

**Without M&P:**
```
Attorney: "OK, I've read all 500 pages of discovery"
Attorney: "Now let me type key facts into chronology"
Attorney: "And type those same facts into issues"
Attorney: "And type those same facts into deposition outline"
Result: 3 copies of same data, prone to mistakes
```

**With M&P:**
```
Attorney: "OK, I've read all 500 pages of discovery"
Attorney: Marks key facts once while reading
M&P: Auto-populates those facts into chronology, issues, deposition, trial notebook
Result: One mark, everywhere it matters, with audit trail
```

**That's the power of M&P.**

---

## PART 11: Implementation Notes

### Phase 4 (UI) Complexity

M&P UI is more complex than Module D because:
- Document rendering (pdf.js, mammoth)
- Text selection (tricky browser behavior)
- Highlighting (canvas overlay or CSS)
- Responsive design (works on mobile too)
- Performance optimization (large documents)

**Estimated time: 40-50 hours of Claude Sonnet work**

### Library Dependencies

Add to package.json:

```json
{
  "dependencies": {
    "pdfjs-dist": "^3.14.159",
    "mammoth": "^1.6.0",
    "react-pdf": "^7.5.2"
  }
}
```

### Testing Strategy

**Phase 3 (IPC):**
```javascript
window.electron.db.createHighlight('case-123', 'doc-456', {
  page_number: 1,
  text_content: "Test highlight",
  text_range_start: 0,
  text_range_end: 15,
  tag_type: "fact"
})
```

**Phase 4 (UI):**
```
1. Open PDF in M&P
2. Select text (click + drag)
3. Popup appears: "Tag as: [fact ▼]"
4. Tag it
5. Highlight appears in document
6. View in highlight list
7. Edit tag type
8. Delete highlight
```

**Phase 5 (Integration):**
```
1. Create highlights in M&P
2. Restart app
3. Verify highlights still there
4. Generate populated document
5. Verify document has correct content
6. Verify Module D still works
```

---

## Summary

**Mark-and-Populate = Intelligence Layer**

When M&P is complete:

✅ Open any document in app  
✅ Mark text with semantic tags  
✅ Assign target module  
✅ Auto-populate downstream modules  
✅ Full audit trail to source documents  
✅ Foundation for Modules E-L  

---

**Status:** Ready for Claude Sonnet/Code  
**Include in:** Project Charter before Module D development  
**Build sequence:** Module D (2 weeks) → Module SU enhancements (1 week) → M&P (2.5 weeks) → Module E integration  
**Criticality:** ESSENTIAL - Core infrastructure

