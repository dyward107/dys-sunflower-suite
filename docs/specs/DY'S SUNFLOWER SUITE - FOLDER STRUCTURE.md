D:\Dy's Sunflower Suite/                    ← Flash drive root
├── electron/                               # Electron main process
│   ├── main.ts                            # Main process entry (ES modules)
│   ├── preload.js                         # Preload script (CommonJS ONLY!)
│   └── database/
│       ├── DatabaseService.ts             # All CRUD methods
│       ├── schema.sql                     # v4.0 foundation schema
│       ├── schema-module-a.sql            # Module A: Cases
│       ├── schema-module-b.sql            # Module B: Tasks
│       ├── schema-module-c.sql            # Module C: Calendar
│       ├── schema-module-k.sql            # Module K: Contacts
│       ├── schema-module-d.sql            # Module D: Discovery
│       ├── schema-module-e.sql            # Module E: Chronology
│       ├── schema-module-f.sql            # Module F: Medical
│       ├── schema-module-g.sql            # Module G: Issues
│       ├── schema-module-h.sql            # Module H: Deposition
│       ├── schema-module-i.sql            # Module I: Documents
│       ├── schema-module-j.sql            # Module J: Trial
│       ├── schema-module-l.sql            # Module L: Analytics
│       └── schema-mnp.sql                 # Mark-and-Populate Engine
│
├── src/                                    # React frontend
│   ├── types/
│   │   ├── index.ts                       # Core types
│   │   ├── electron.d.ts                  # window.electron definitions
│   │   ├── ModuleA.ts                     # Module A types
│   │   ├── ModuleB.ts                     # Module B types
│   │   ├── ModuleC.ts                     # Module C types
│   │   ├── ModuleK.ts                     # Module K types
│   │   ├── ModuleD.ts                     # Module D types
│   │   ├── ModuleE.ts                     # Module E types
│   │   ├── ModuleF.ts                     # Module F types
│   │   ├── ModuleG.ts                     # Module G types
│   │   ├── ModuleH.ts                     # Module H types
│   │   ├── ModuleI.ts                     # Module I types
│   │   ├── ModuleJ.ts                     # Module J types
│   │   ├── ModuleL.ts                     # Module L types
│   │   └── ModuleMNP.ts                   # Mark-and-Populate types
│   │
│   ├── stores/
│   │   ├── caseStore.ts                   # Module A: Case state
│   │   ├── taskStore.ts                   # Module B: Task state
│   │   ├── calendarStore.ts               # Module C: Calendar state
│   │   ├── contactStore.ts                # Module K: Contact state
│   │   ├── discoveryStore.ts              # Module D: Discovery state
│   │   ├── chronologyStore.ts             # Module E: Chronology state
│   │   ├── medicalStore.ts                # Module F: Medical state
│   │   ├── issueStore.ts                  # Module G: Issue state
│   │   ├── depositionStore.ts             # Module H: Deposition state
│   │   ├── documentStore.ts               # Module I: Document state
│   │   ├── trialStore.ts                  # Module J: Trial state
│   │   ├── analyticsStore.ts              # Module L: Analytics state
│   │   ├── mnpStore.ts                    # Mark-and-Populate state
│   │   └── appConfigStore.ts              # ← NEW: App config (base path, etc.)
│   │
│   ├── components/
│   │   ├── shared/                        # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── SaveButton.tsx            # ← NEW: Explicit save button
│   │   │   ├── BackupButton.tsx          # ← NEW: Manual backup trigger
│   │   │   └── SunflowerTheme.tsx        # Theme wrapper
│   │   │
│   │   ├── moduleA/                       # Module A: Cases
│   │   │   ├── CaseList.tsx
│   │   │   ├── CaseForm.tsx
│   │   │   ├── CaseDetail.tsx
│   │   │   └── CaseCard.tsx
│   │   │
│   │   ├── moduleB/                       # Module B: Tasks
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   ├── TaskGroupManager.tsx
│   │   │   └── CadenceBuilder.tsx
│   │   │
│   │   ├── moduleC/                       # Module C: Calendar
│   │   │   ├── CalendarView.tsx
│   │   │   ├── DeadlineCalculator.tsx
│   │   │   ├── DeadlineList.tsx
│   │   │   └── ICSExporter.tsx
│   │   │
│   │   ├── moduleK/                       # Module K: Contacts
│   │   │   ├── ContactList.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ContactDetail.tsx
│   │   │   ├── CorrespondenceLog.tsx
│   │   │   └── CorrespondenceForm.tsx
│   │   │
│   │   ├── moduleD/                       # Module D: Discovery
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── BatesManager.tsx
│   │   │   ├── DeficiencyDetector.tsx
│   │   │   ├── SixFourLetterGenerator.tsx
│   │   │   ├── ProductionIndex.tsx
│   │   │   └── NonPartyStagingQueue.tsx
│   │   │
│   │   ├── moduleE/                       # Module E: Chronology
│   │   │   ├── ChronologyTimeline.tsx
│   │   │   ├── ChronologyEventForm.tsx
│   │   │   ├── FactTagManager.tsx
│   │   │   └── NarrativeExporter.tsx
│   │   │
│   │   ├── moduleF/                       # Module F: Medical
│   │   │   ├── MedicalTimeline.tsx
│   │   │   ├── MedicalRecordForm.tsx
│   │   │   ├── TreatmentProgressionView.tsx
│   │   │   └── GapDetector.tsx
│   │   │
│   │   ├── moduleG/                       # Module G: Issues
│   │   │   ├── IssueList.tsx
│   │   │   ├── IssueForm.tsx
│   │   │   ├── IssueDetail.tsx
│   │   │   ├── ArgumentBuilder.tsx
│   │   │   ├── LegalResearchPanel.tsx    # ← NEW: Your legal research
│   │   │   ├── CaseLawLinker.tsx         # ← NEW: Link case law
│   │   │   └── StatuteLinker.tsx         # ← NEW: Link statutes
│   │   │
│   │   ├── moduleH/                       # Module H: Deposition
│   │   │   ├── WitnessList.tsx
│   │   │   ├── WitnessDetail.tsx
│   │   │   ├── DepositionOutlineBuilder.tsx
│   │   │   └── QuestionListGenerator.tsx
│   │   │
│   │   ├── moduleI/                       # Module I: Documents
│   │   │   ├── TemplateManager.tsx
│   │   │   ├── DocumentGenerator.tsx
│   │   │   ├── MergeFieldMapper.tsx
│   │   │   └── VersionTracker.tsx
│   │   │
│   │   ├── moduleJ/                       # Module J: Trial
│   │   │   ├── TrialNotebook.tsx
│   │   │   ├── ExhibitManager.tsx
│   │   │   ├── WitnessOrder.tsx
│   │   │   └── StatementBuilder.tsx
│   │   │
│   │   ├── moduleL/                       # Module L: Analytics
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CaseLoadChart.tsx
│   │   │   ├── TimeTrackingReport.tsx
│   │   │   ├── DeadlineComplianceMetrics.tsx
│   │   │   └── ReportExporter.tsx
│   │   │
│   │   └── mnp/                           # Mark-and-Populate Engine
│   │       ├── DocumentRenderer.tsx
│   │       ├── HighlightLayer.tsx
│   │       ├── TextSelector.tsx
│   │       ├── ResponseAssignmentPanel.tsx
│   │       ├── HighlightList.tsx
│   │       ├── BatchMarkingInterface.tsx
│   │       └── TemplatePopulator.tsx
│   │
│   ├── utils/
│   │   ├── dateTime.ts                    # Date utilities (Georgia rules)
│   │   ├── export.ts                      # DOCX/PDF/CSV export
│   │   ├── discovery.ts                   # Bates parsing, deficiency detection
│   │   ├── merge.ts                       # Mark-and-Populate utilities
│   │   ├── ocr.ts                         # Tesseract.js wrapper
│   │   ├── validation.ts                  # Form validation helpers
│   │   ├── pathResolver.ts                # ← NEW: Handle flash drive paths
│   │   └── autoSave.ts                    # ← NEW: Debounced auto-save logic
│   │
│   ├── rules/                             # Automation rules & cadences
│   │   ├── automations.json               # Workflow automation rules
│   │   ├── cadences.json                  # Pre-built task cadences
│   │   ├── georgia-deadlines.json         # Georgia deadline calculation rules
│   │   └── holidays.json                  # Court holidays & closures
│   │
│   ├── App.tsx                            # Main router
│   ├── main.tsx                           # React entry point
│   └── index.css                          # Global styles + Tailwind
│
├── public/
│   ├── templates/                         # DOCX merge templates
│   │   ├── discovery-responses.docx
│   │   ├── privilege-log.docx
│   │   ├── mediation-statement.docx
│   │   ├── trial-brief.docx
│   │   ├── status-report.docx
│   │   └── 6.4-letter.docx               # Georgia 6.4 deficiency letter
│   │
│   └── assets/                            # Static assets
│       ├── sunflower-logo.svg
│       └── seed-data.json                 # Initial data for testing
│
├── data/                                   # APPLICATION DATA STORAGE
│   ├── suite.db                           # Main SQLite database
│   ├── app-config.json                    # ← NEW: App configuration (base path, etc.)
│   │
│   ├── cases/                             # PER-CASE STORAGE
│   │   ├── [case-id-1]/                   # Each case gets its own folder
│   │   │   ├── documents/                 # Discovery documents
│   │   │   │   ├── [doc-id-1]/
│   │   │   │   │   ├── original.pdf
│   │   │   │   │   ├── ocr-text.txt
│   │   │   │   │   └── metadata.json
│   │   │   │   └── [doc-id-2]/
│   │   │   │       ├── original.jpg
│   │   │   │       └── ocr-text.txt
│   │   │   ├── exports/                   # Generated documents
│   │   │   │   ├── chronology-2025-11-12.docx
│   │   │   │   ├── discovery-responses-2025-11-10.docx
│   │   │   │   └── 6.4-letter-2025-11-08.docx
│   │   │   ├── templates/                 # Case-specific templates
│   │   │   └── backups/                   # Case backups
│   │   │
│   │   └── [case-id-N]/
│   │       └── [same structure]
│   │
│   └── backups/                           # Full database backups
│       ├── suite-2025-11-12.db
│       ├── suite-2025-11-11.db
│       └── [daily backups]
│
├── docs/                                   # PROJECT DOCUMENTATION
│   ├── 00_FINAL_MASTER_INDEX.txt
│   ├── SUNFLOWER_SUITE_v4.0_PROJECT_CHARTER_FRESH_START.md
│   ├── ADDENDUM_YOUR_ACTUAL_CASE_PHASES_AND_STATUSES.md
│   ├── ADDENDUM_MODULE_D_COMPLETE_SPECIFICATION_AND_OCR_STRATEGY.md
│   ├── ADDENDUM_MARK_AND_POPULATE_ENGINE_COMPLETE_SPECIFICATION.md
│   ├── STRATEGIC_ADVICE_PREVENTING_FUTURE_SPIRALS.md
│   ├── SONNET_STARTUP_PROMPT.md
│   ├── COMPLETE_STARTUP_WORKFLOW.md
│   ├── HOW_TO_KNOW_INVESTIGATION_COMPLETE.md
│   ├── FINAL_MESSAGE_ENCOURAGEMENT_AND_PERSPECTIVE.md
│   ├── QUICK_REFERENCE_CARD.txt
│   └── module-specs/                      # Individual module docs
│       ├── MODULE_A_SPEC.md
│       ├── MODULE_B_SPEC.md
│       └── [etc.]
│
├── tests/                                  # Unit tests (optional, future)
│   ├── database.test.ts
│   ├── utils.test.ts
│   └── components.test.tsx
│
├── node_modules/                           # Dependencies (npm install)
│
├── package.json                            # Dependencies
├── package-lock.json
├── tsconfig.json                           # TypeScript config (React)
├── tsconfig.electron.json                  # TypeScript config (Electron main)
├── vite.config.ts                          # Vite bundler config
├── electron-builder.yml                    # Electron packager config
├── tailwind.config.js                      # Tailwind CSS config
├── postcss.config.js                       # PostCSS config
├── .gitignore
├── .env                                    # Environment variables
└── README.md                               # Project README