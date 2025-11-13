# 🔧 ADDENDUM 2: Module D Discovery Manager + Image/OCR Strategy

**Important:** Add this to the Project Charter before Module D development begins.

**Date:** November 12, 2025  
**Status:** Ready for Claude Sonnet/Code to reference

---

## PART 1: Module D Complete Specification

### What Module D Does (Discovery & Evidence Manager)

Module D is your **organized discovery file of record**. It handles:

✅ **Document Upload & Parsing**
- Drag/drop PDF uploads
- Auto-extract Bates ranges from filenames and content
- Auto-detect OCR text from images/documents
- Parse metadata (date, source, filename)
- Store full-text search index

✅ **Review Status Tracking**
- Mark documents: Produced, Withheld (with reason), Under Review, Pending
- Track review dates and reviewer name
- Flag for follow-up (e.g., "Awaiting privilege log")
- Close-out status when ready

✅ **Compliance Deficiency Detection**
- Auto-flag Bates gaps (D_001, D_002, D_005 → gap detected)
- Auto-flag incomplete productions (requested but missing)
- Auto-flag duplicate Bates numbers
- Generate compliance warnings

✅ **6.4 Letter Generation** (Georgia-specific)
- One-click generation of deficiency letter
- Include: Missing documents, Bates gaps, Incomplete responses
- Format: Ready to file
- Track: Which deficiencies were included

✅ **Evidence Linking**
- Link document → Case fact (from Module E)
- Link document → Issue/claim (from Module G)
- Link document → Witness (from Module A)
- Inline "Add Fact" button for quick linking

✅ **Non-Party Staging & Approval**
- Auto-extract names from OCR'd text
- Stage as "Potential Non-Party"
- Attorney reviews and approves
- Auto-merge approved names to Module A contacts

✅ **Production Index Export**
- Generate CSV: Bates range, date, source, review status, link to fact/issue
- Include withheld items with reason
- Ready for privilege log or production letter

### What Module D Does NOT Do

❌ **Document Rendering** (that's M&P Engine)
- Don't render PDF for highlighting
- Don't allow text selection in Module D
- Don't show side-by-side annotations

❌ **Text Annotation** (that's M&P Engine)
- Don't allow highlighting text regions
- Don't tag regions with metadata
- Don't store region-specific descriptions

❌ **Auto-Population to Responses** (that's M&P Engine)
- Don't auto-fill discovery responses
- Don't generate responses from marked text
- Don't populate pleadings (that's M&P)

❌ **Fact/Chronology Extraction** (that's Module E + M&P)
- Don't create chronology entries
- Don't extract timeline events
- Don't build narratives (Module E does that)

### Database Tables (Module D)

```sql
-- Document metadata and review tracking
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  bates_start TEXT,
  bates_end TEXT,
  source TEXT,  -- "Plaintiff", "Defendant", "Third Party"
  date_received TEXT,
  date_uploaded TIMESTAMP,
  review_status TEXT CHECK (review_status IN ('pending', 'reviewed', 'produced', 'withheld', 'under_review')),
  withhold_reason TEXT,  -- If withheld
  file_path TEXT,
  file_size INTEGER,
  page_count INTEGER,
  ocr_text TEXT,  -- Full extracted text for searching
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Link documents to facts, issues, witnesses
CREATE TABLE IF NOT EXISTS evidence_links (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN ('fact', 'issue', 'witness')),  -- What does it link to?
  target_id TEXT NOT NULL,  -- Fact ID, Issue ID, Witness ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Non-party names extracted from documents, staged for approval
CREATE TABLE IF NOT EXISTS non_parties_staging (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  name TEXT NOT NULL,
  source_document_id TEXT NOT NULL,
  extracted_from_ocr BOOLEAN,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'merged')),
  approved_by TEXT,
  approved_date TIMESTAMP,
  merged_contact_id TEXT,  -- Links to Module A contact if approved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (merged_contact_id) REFERENCES contacts(id)
);

-- Track deficiencies (Bates gaps, incomplete responses, missing docs)
CREATE TABLE IF NOT EXISTS discovery_deficiencies (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  deficiency_type TEXT CHECK (deficiency_type IN ('bates_gap', 'incomplete', 'duplicate', 'missing')),
  description TEXT,
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor')),
  related_documents TEXT,  -- JSON array of document IDs
  included_in_64_letter BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Track 6.4 letter generation history
CREATE TABLE IF NOT EXISTS six_four_letters (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  generated_date TIMESTAMP,
  deficiencies_included TEXT,  -- JSON array of deficiency IDs
  letter_text TEXT,
  sent_to TEXT,  -- Email address or "Not Sent"
  date_sent TIMESTAMP,
  response_date TIMESTAMP,
  follow_up_status TEXT CHECK (follow_up_status IN ('open', 'resolved', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

### IPC Methods (Module D)

```typescript
// Upload and parse document
uploadDocument(caseId: string, file: File): Promise<DocumentUploadResult>

// Get documents with filters
getDocuments(caseId: string, filters?: {status?: string, source?: string}): Promise<Document[]>

// Get single document
getDocument(id: string): Promise<Document>

// Update review status
updateDocumentStatus(id: string, status: 'pending'|'reviewed'|'produced'|'withheld'|'under_review', witholdReason?: string): Promise<void>

// Link document to fact/issue/witness
linkDocumentToEvidence(documentId: string, targetType: 'fact'|'issue'|'witness', targetId: string): Promise<void>

// Get evidence links for a document
getEvidenceLinks(documentId: string): Promise<EvidenceLink[]>

// Get deficiencies (all detected compliance issues)
getDeficiencies(caseId: string): Promise<Deficiency[]>

// Generate 6.4 letter
generateSixFourLetter(caseId: string, deficiencyIds?: string[]): Promise<{letter: string, letterPath: string}>

// Export production index as CSV
exportProductionIndex(caseId: string): Promise<{csvPath: string}>

// Stage non-parties extracted from OCR
getStagedNonParties(caseId: string): Promise<NonPartyStaging[]>

// Approve non-party staging (merge to Module A contacts or create new)
approveNonParty(stagingId: string, action: 'merge'|'createNew', contactData?: any): Promise<void>

// Search documents by OCR text
searchDocuments(caseId: string, searchTerm: string): Promise<Document[]>
```

---

## PART 2: Image Upload & OCR Strategy

### Overview

Module D accepts **images and PDFs** and auto-extracts text using OCR:

1. **User uploads** image/PDF
2. **System OCRs** the content
3. **System parses** metadata (Bates, date, entity names)
4. **System stores** both image and extracted text
5. **User can link** to facts, issues, witnesses
6. **M&P Engine later** can annotate and populate

### What Gets OCR'd?

**When document uploaded to Module D:**
- ✅ Full document OCR (extract all visible text)
- ✅ Look for Bates ranges (D_001, D_002, etc.)
- ✅ Look for dates (from filename or embedded)
- ✅ Look for entity names (potential non-parties)
- ✅ Look for RFP numbers (for deficiency detection)
- ✅ Store full text for full-text search

**When region marked in M&P Engine:**
- ✅ Region-specific OCR (extract just that region)
- ✅ Store region text + coordinates
- ✅ Link to target (fact, issue, etc.)

### Supported File Types (Module D)

- ✅ PDF (multi-page supported)
- ✅ JPG/JPEG (single image)
- ✅ PNG (single image)
- ✅ TIFF (multi-page supported)
- ✅ DOCX (extracted via PDF conversion)

### OCR Library

**Technology:** Tesseract.js
- Pure JavaScript, offline-capable
- Accuracy: 85-95% for readable documents
- Speed: 2-5 seconds per page
- Languages: English (default), configurable

**Alternative:** Python EasyOCR (if speed becomes bottleneck)
- Faster (if using GPU)
- Better accuracy (90-98%)
- Requires Python backend
- Add in Phase 5 if needed

### Database: Image Storage

```sql
-- Images stored in: D:\SunflowerSuite\data\documents\[caseId]\[documentId]\
-- Example: D:\SunflowerSuite\data\documents\case-123\doc-456\original.pdf
--          D:\SunflowerSuite\data\documents\case-123\doc-456\compressed.jpg

-- Full path stored in: documents.file_path
-- Relative path used in exports (docs/case-123/doc-456/)
```

### Batch Upload

**What happens when user drags 50 images at once:**

```
1. User drags 50 JPGs into Module D
2. System queues them for processing
3. Shows: "Processing 1 of 50..."
4. OCR runs in background (doesn't freeze UI)
5. Each image: parsed → stored → indexed
6. After all complete: "50 documents added"
```

### Metadata Extraction from OCR

**Example:** Document D_001-D_010_received_2025-11-12.pdf

```
System extracts:
├─ Bates range: D_001 to D_010 (from filename)
├─ Date received: 2025-11-12 (from filename)
├─ Source: [User specifies at upload]
├─ OCR text: [All visible text in document]
└─ Full text search: [Indexed for searching]
```

**Example:** Hand-written medical report photo (JPG)

```
System extracts:
├─ Bates range: None found (user can enter manually)
├─ Date: [If visible in document or filename]
├─ Source: [User specifies at upload]
├─ OCR text: [Recognized handwriting + printed text]
├─ Names recognized: [Potential non-parties staged]
└─ Full text search: [Indexed]
```

---

## PART 3: Critical Module D ↔ M&P Engine Boundary

### What Module D Handles

| Task | Responsibility | Storage |
|------|-----------------|---------|
| Upload document | Module D | documents.file_path |
| OCR full document | Module D | documents.ocr_text |
| Parse Bates range | Module D | documents.bates_start/end |
| Parse date | Module D | documents.date_received |
| Store image file | Module D | On disk |
| Link to fact/issue | Module D | evidence_links table |
| Generate 6.4 letter | Module D | six_four_letters table |
| Export production index | Module D | CSV file |
| Full-text search | Module D | documents.ocr_text (indexed) |

### What M&P Engine Handles

| Task | Responsibility | Storage |
|------|-----------------|---------|
| Render image/PDF | M&P | In-app display only |
| Allow region selection | M&P | User interaction |
| Highlight regions | M&P | text_highlights table |
| OCR region text | M&P | text_highlights.extracted_text |
| Store region + description | M&P | text_highlights table |
| Assign to target module | M&P | text_highlights.target_module |
| Auto-populate templates | M&P | Uses highlighted regions |

### Critical: Don't Overlap

❌ **WRONG:** Module D renders documents with highlighting tool
→ **CORRECT:** Module D stores document, M&P renders and highlights

❌ **WRONG:** Module D auto-populates discovery responses
→ **CORRECT:** M&P marks regions, then auto-populates responses

❌ **WRONG:** M&P extracts Bates ranges from documents
→ **CORRECT:** Module D parses Bates, M&P uses them

---

## PART 4: User Workflows (Module D)

### Workflow 1: Standard Production Upload

```
1. Attorney receives 100-page PDF from plaintiff
   ↓ [MODULE D]
2. Drags PDF into "New Production" area
3. System auto-parses: Bates D_001-D_100, date from filename
4. Shows: "100 documents added"
5. Attorney reviews deficiency detection:
   - Gap found: D_045-D_050 missing
   - Flag: "Incomplete RFP 5 response"
6. Clicks "Generate 6.4 Letter"
7. Gets complaint-ready deficiency letter
8. Exports production index for compliance
```

### Workflow 2: Linking to Issues

```
1. Attorney uploads expert report (PDF)
   ↓ [MODULE D]
2. System OCRs: "Causation opinion at page 3"
3. Recognizes name: "Dr. Smith" (stages as potential non-party)
4. Attorney clicks "Link to Evidence"
5. Selects target: Issue "Causation"
6. System stores link: expert_report → Causation issue
7. Later, when building case summary (Module I):
   - Shows: "Causation (supported by: Expert Report D_045-D_050)"
```

### Workflow 3: Non-Party Approval

```
1. Attorney uploads defendant's interrogatory responses (PDF)
   ↓ [MODULE D]
2. System OCRs: "Answered by John Davis, Manager"
3. Stages: "John Davis" as potential non-party
4. Attorney sees staging queue: "1 new non-party"
5. Reviews: "John Davis" from XYZ Corp
6. Clicks "Approve & Merge"
7. If exists: merges to existing "John Davis" contact
8. If new: creates as new contact in Module A
9. Marks: "linked to interrogatory responses"
```

### Workflow 4: Medical Photos

```
1. Receives medical photos from doctor (JPGs)
   ↓ [MODULE D]
2. Drags all 12 photos into Module D
3. System OCRs each: timestamp, facility name, date
4. Groups by date automatically
5. Recognizes: "Dr. Patricia Chen, MD" (stages as potential non-party)
6. Attorney reviews staging, approves
7. Later, in M&P Engine:
   - Opens photo 1
   - Marks region: "3cm laceration on left arm"
   - Assigns to: Medical Chronology (Module F)
8. Module F auto-populates: "Medical photo (date) - [region description]"
```

---

## PART 5: Acceptance Criteria (Module D Complete)

### Phase 2 (Database)
- [ ] All 5 tables created and tested
- [ ] Foreign keys work correctly
- [ ] Indexes created for performance

### Phase 3 (IPC)
- [ ] All IPC methods callable from browser console
- [ ] No TypeScript errors
- [ ] Methods return expected data types

### Phase 4 (UI Components)
- [ ] Can drag/drop document into upload area
- [ ] System shows upload progress
- [ ] Document appears in list after upload
- [ ] Can click document to see details
- [ ] Can update review status (dropdown works)
- [ ] Can link to fact/issue inline
- [ ] Non-party staging appears when names recognized
- [ ] Can approve/reject non-parties
- [ ] Can generate 6.4 letter with one click
- [ ] Can export production index as CSV
- [ ] Full-text search works

### Phase 5 (Integration)
- [ ] Create new case
- [ ] Upload document with Bates range in filename
- [ ] System correctly parses Bates range
- [ ] Upload image (JPG/PNG)
- [ ] System OCRs image and extracts text
- [ ] Upload PDF with multiple pages
- [ ] System processes all pages
- [ ] Link document to Module A contact
- [ ] Export production index
- [ ] Data persists after app restart
- [ ] No console errors
- [ ] Module A still works (no breaking changes)

---

## PART 6: Implementation Notes for Claude Code

### Performance Considerations

**OCR Bottleneck:** 2-5 seconds per image
- **Solution:** Show "Processing... X of Y" progress
- **Solution:** Queue uploads (don't process all simultaneously)
- **Solution:** Optional: Compress images on upload

**Large Batch Upload:** 100+ documents
- **Solution:** Lazy-load in list (first 50, then paginate)
- **Solution:** Background processing with progress bar
- **Solution:** Allow pause/resume

**Full-Text Search:** On large OCR text
- **Solution:** Index OCR text in database (SQLite FTS)
- **Solution:** Limit search results (first 100 matches)

### Testing Strategy

**Phase 3 Tests:**
```javascript
// IPC methods work
window.electron.db.getDocuments('case-123')
window.electron.db.generateSixFourLetter('case-123')
```

**Phase 4 Tests:**
```
1. Upload single PDF
2. Verify Bates parsed correctly
3. Upload JPG
4. Verify OCR extracted text
5. Link document to fact
6. Generate 6.4 letter
7. Export production index
8. Verify CSV format
```

**Phase 5 Tests:**
```
1. Full workflow: upload → link → generate → export
2. Data persistence: restart app, verify documents still there
3. Module A integration: contact linking works
4. Search: OCR text is searchable
5. Non-party staging: names extracted and approvable
```

---

## PART 7: Questions to Ask Claude Code

Before Phase 1 ends, clarify:

1. **Non-party approval:** When attorney approves "John Davis", should system:
   - Auto-merge if similar contact exists?
   - Ask attorney first (merge dialog)?
   - Create new contact every time?

2. **6.4 Letter:** Should generation:
   - Include ALL deficiencies (auto-selected)?
   - Let attorney select which deficiencies to include?
   - Generate as DOCX (for editing) or just display?

3. **OCR accuracy:** If OCR confidence < 70%, should system:
   - Still import but flag for review?
   - Require manual review before importing?
   - Ask attorney: "Low confidence, continue anyway?"

4. **Bates parsing:** If filename has no Bates range, should system:
   - Let attorney enter manually?
   - Auto-assign sequential range?
   - Flag as requiring manual entry?

5. **Non-party extraction:** Which names to stage?
   - Only people (filter out company names)?
   - All entities (including companies)?
   - Let attorney select from list?

---

## PART 8: Georgia-Specific Rules

**Rule 1: Answer Due Date**
- Service occurs → Answer due 20 days later (or 21st day)
- If 20th day is weekend → next Monday
- Module C calculates this

**Rule 2: Discovery Cutoff**
- Answer filed → Discovery closes 30 days before trial
- Module C tracks this

**Rule 3: 6.4 Letter**
- Must identify with specificity what's missing
- Must give reasonable time to respond (typically 10-14 days)
- Must reference specific RFPs/requests
- Georgia rule: Must follow OCGA § 34-8-2 (Workers' Comp) or § 20-712 (Auto Liability)

**Rule 4: Privilege Log**
- If claiming privilege, must provide privilege log
- Must list: Doc number, date, author, recipient, subject, privilege claimed
- Module D tracks withheld items + reason

**Module D tracks these automatically when attorney marks document "Withheld" with reason.**

---

## Summary

**Module D = Your organized discovery file**

When Module D is complete:

✅ Upload documents (images, PDFs, scans)  
✅ System auto-OCRs and parses Bates ranges  
✅ System detects deficiencies automatically  
✅ Link documents to facts/issues for cross-referencing  
✅ Generate Georgia-compliant 6.4 deficiency letters  
✅ Export production index for compliance documentation  
✅ Full-text search across all documents  
✅ Ready for M&P Engine (Phase 2 of document processing)  

---

**Status:** Ready for Claude Code/Sonnet  
**Include in:** Project Charter before Module D development  
**Reference in:** All downstream modules (D-L)

