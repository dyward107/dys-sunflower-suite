# 🌻 SUNFLOWER SUITE - CODE REFERENCE
## Technical Implementation Guide & Code Examples
### Version 5.0 - Complete Reference

**Purpose:** Complete technical reference with all code examples, database schemas, commands, and implementation patterns  
**For Use With:** VS Code and Cursor  
**Status:** Production-Ready Reference

---

## TABLE OF CONTENTS

**SECTION 1: QUICK COMMAND REFERENCE**
- [Development Commands](#development-commands)
- [Database Commands](#database-commands)
- [Build Commands](#build-commands)
- [Testing Commands](#testing-commands)

**SECTION 2: DATABASE SCHEMAS**
- [Core Tables (Module A)](#core-tables-module-a)
- [Task Tables (Module B)](#task-tables-module-b)
- [Calendar Tables (Module C)](#calendar-tables-module-c)
- [Discovery Tables (Module D)](#discovery-tables-module-d)
- [Chronology Tables (Module E)](#chronology-tables-module-e)
- [Medical Tables (Module F)](#medical-tables-module-f)
- [Additional Module Tables](#additional-module-tables)

**SECTION 3: IPC BRIDGE IMPLEMENTATIONS**
- [Preload Script Setup](#preload-script-setup)
- [Main Process Handlers](#main-process-handlers)
- [Renderer Process Calls](#renderer-process-calls)
- [Type Definitions](#type-definitions)

**SECTION 4: REACT COMPONENTS**
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [Hook Implementations](#hook-implementations)
- [Error Handling](#error-handling)

**SECTION 5: UTILITY FUNCTIONS**
- [Date Calculations](#date-calculations)
- [Export Functions](#export-functions)
- [Validation Functions](#validation-functions)
- [Search Functions](#search-functions)

**SECTION 6: AUTOMATION IMPLEMENTATIONS**
- [Trigger Definitions](#trigger-definitions)
- [Action Handlers](#action-handlers)
- [Cadence Templates](#cadence-templates)

---

## SECTION 1: QUICK COMMAND REFERENCE

### Development Commands {#development-commands}

```bash
# Initial Setup
cd D:\SunflowerSuite
npm install

# Development Mode (Hot Reload)
npm run dev

# Check TypeScript Compilation
npx tsc --noEmit

# Run Specific Script
node scripts/init-database.js
node scripts/migrate-case-keeper.js
node scripts/load-seed-data.js

# Clean Build
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item dist-electron -Recurse -Force -ErrorAction SilentlyContinue
npm run build

# Database Console
sqlite3 "$env:APPDATA\SunflowerSuite\suite.db"

# View Electron Logs
$env:ELECTRON_ENABLE_LOGGING=1
npm run dev
```

### Database Commands {#database-commands}

```sql
-- SQLite Console Commands
.tables                    -- List all tables
.schema [table_name]       -- Show table structure
.indexes                   -- List all indexes
.mode column              -- Pretty output
.headers on               -- Show column names
.quit                     -- Exit console

-- Useful Queries
SELECT name FROM sqlite_master WHERE type='table';
SELECT sql FROM sqlite_master WHERE name='cases';
SELECT COUNT(*) FROM cases WHERE is_deleted = 0;

-- Check Foreign Keys
PRAGMA foreign_keys;       -- Check if enabled
PRAGMA foreign_keys = ON;  -- Enable foreign keys

-- Database Integrity
PRAGMA integrity_check;
PRAGMA quick_check;
VACUUM;                    -- Optimize database
```

### Build Commands {#build-commands}

```bash
# Build for Production
npm run build

# Package for Windows
npm run package

# Create Installer
npm run dist

# Clean and Rebuild
npm run clean && npm run build

# Version Bump
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

---

## SECTION 2: DATABASE SCHEMAS

### Core Tables (Module A) {#core-tables-module-a}

```sql
-- Main cases table with all v5.0 fields
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT,  -- Legacy support
    case_key TEXT UNIQUE,
    case_name TEXT NOT NULL,
    short_case_name TEXT,
    cm_number TEXT,
    cafn TEXT,
    
    -- Parties
    primary_plaintiff_name TEXT,
    primary_defendant_name TEXT,
    
    -- Venue & Court
    venue_court TEXT,
    venue_judge TEXT,
    venue_clerk TEXT,
    venue_staff_attorney TEXT,
    
    -- Status & Phase
    phase TEXT DEFAULT 'intake',
    status TEXT DEFAULT 'active',
    case_type TEXT,
    case_subtype TEXT,
    
    -- Dates
    date_opened DATE DEFAULT (DATE('now')),
    date_of_loss DATE,
    date_closed DATE,
    
    -- Flags
    is_provisional BOOLEAN DEFAULT FALSE,
    is_wrongful_death BOOLEAN DEFAULT FALSE,
    is_survival_action BOOLEAN DEFAULT FALSE,
    has_deceased_defendants BOOLEAN DEFAULT FALSE,
    
    -- Discovery
    discovery_close_date DATE,
    discovery_deadline_extended BOOLEAN DEFAULT FALSE,
    discovery_deadline_notes TEXT,
    
    -- Insurance
    carrier_name TEXT,
    carrier_claim_no TEXT,
    lead_attorney_id TEXT,
    
    -- Metadata
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parties table
CREATE TABLE IF NOT EXISTS case_parties (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    party_type TEXT NOT NULL,
    party_name TEXT NOT NULL,
    is_corporate BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    is_insured BOOLEAN DEFAULT FALSE,
    is_presuit BOOLEAN DEFAULT FALSE,
    monitor_for_service BOOLEAN DEFAULT TRUE,
    service_date DATE,
    answer_filed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Policies table
CREATE TABLE IF NOT EXISTS case_policies (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    policy_type TEXT,
    carrier_name TEXT,
    policy_number TEXT,
    policy_limits TEXT,
    we_are_retained_by_carrier BOOLEAN DEFAULT FALSE,
    umuim_type TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_cases_cm_number ON cases(cm_number);
CREATE INDEX idx_case_parties_case_id ON case_parties(case_id);
CREATE INDEX idx_case_policies_case_id ON case_policies(case_id);
```

### Task Tables (Module B) {#task-tables-module-b}

```sql
-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    task_group_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 3,
    status TEXT DEFAULT 'pending',
    phase TEXT,
    assigned_to TEXT,
    due_date DATE,
    completed_date DATE,
    is_billable BOOLEAN DEFAULT TRUE,
    estimated_hours REAL,
    actual_hours REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Task groups (cadences)
CREATE TABLE IF NOT EXISTS task_groups (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    cadence_type TEXT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    triggered_by TEXT,
    triggered_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Time entries
CREATE TABLE IF NOT EXISTS time_entries (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    task_id TEXT NOT NULL,
    user_id TEXT,
    description TEXT,
    hours REAL NOT NULL,
    rate REAL,
    is_billable BOOLEAN DEFAULT TRUE,
    entry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Cadence templates
CREATE TABLE IF NOT EXISTS cadence_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    category TEXT,
    trigger_event TEXT,
    tasks JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Calendar Tables (Module C) {#calendar-tables-module-c}

```sql
-- Deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    task_id TEXT,
    type TEXT NOT NULL,
    description TEXT,
    trigger_date DATE,
    calculated_date DATE NOT NULL,
    manual_override_date DATE,
    is_jurisdictional BOOLEAN DEFAULT FALSE,
    warning_days INTEGER,
    status TEXT DEFAULT 'pending',
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    deadline_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP,
    all_day BOOLEAN DEFAULT FALSE,
    reminder_minutes INTEGER,
    attendees TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    date DATE NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    is_federal BOOLEAN,
    is_georgia BOOLEAN,
    year INTEGER
);
```

### Discovery Tables (Module D) {#discovery-tables-module-d}

```sql
-- Discovery documents
CREATE TABLE IF NOT EXISTS discovery_documents (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    production_id TEXT,
    filename TEXT NOT NULL,
    filepath TEXT,
    bates_start TEXT,
    bates_end TEXT,
    page_count INTEGER,
    file_size INTEGER,
    file_hash TEXT,
    document_date DATE,
    received_date DATE,
    produced_by TEXT,
    document_type TEXT,
    ocr_text TEXT,
    ocr_confidence REAL,
    review_status TEXT DEFAULT 'pending',
    privilege_type TEXT,
    redacted BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Discovery productions
CREATE TABLE IF NOT EXISTS discovery_productions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    production_name TEXT,
    production_date DATE,
    produced_to TEXT,
    produced_by TEXT,
    method TEXT,
    document_count INTEGER,
    page_count INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Discovery deficiencies
CREATE TABLE IF NOT EXISTS discovery_deficiencies (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    production_id TEXT,
    deficiency_type TEXT,
    description TEXT,
    bates_range TEXT,
    request_number TEXT,
    status TEXT DEFAULT 'open',
    raised_date DATE,
    resolved_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

### Chronology Tables (Module E) {#chronology-tables-module-e}

```sql
-- Case facts
CREATE TABLE IF NOT EXISTS case_facts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    fact_date DATE,
    fact_time TIME,
    date_is_approximate BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    source_type TEXT,
    source_document_id TEXT,
    source_page INTEGER,
    source_line INTEGER,
    source_excerpt TEXT,
    fact_type TEXT,
    significance TEXT DEFAULT 'standard',
    related_parties TEXT,
    is_disputed BOOLEAN DEFAULT FALSE,
    is_material BOOLEAN DEFAULT FALSE,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Fact exhibits
CREATE TABLE IF NOT EXISTS fact_exhibits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    fact_id TEXT NOT NULL,
    exhibit_id TEXT,
    document_id TEXT,
    exhibit_number TEXT,
    description TEXT,
    FOREIGN KEY (fact_id) REFERENCES case_facts(id) ON DELETE CASCADE
);
```

### Medical Tables (Module F) {#medical-tables-module-f}

```sql
-- Medical providers
CREATE TABLE IF NOT EXISTS medical_providers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    name TEXT NOT NULL,
    specialty TEXT,
    first_visit DATE,
    last_visit DATE,
    total_billed DECIMAL(10,2),
    total_paid DECIMAL(10,2),
    lien_amount DECIMAL(10,2),
    has_lien BOOLEAN DEFAULT FALSE,
    records_status TEXT,
    contact_info TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Medical visits
CREATE TABLE IF NOT EXISTS medical_visits (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    case_id TEXT NOT NULL,
    provider_id TEXT,
    visit_date DATE NOT NULL,
    visit_type TEXT,
    chief_complaint TEXT,
    diagnoses TEXT,
    procedures TEXT,
    medications TEXT,
    work_restrictions TEXT,
    prognosis TEXT,
    billed_amount DECIMAL(10,2),
    paid_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);
```

---

## SECTION 3: IPC BRIDGE IMPLEMENTATIONS

### Preload Script Setup {#preload-script-setup}

```javascript
// electron/preload.js
// CRITICAL: Must use CommonJS format (require, not import)

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  db: {
    // Module A - Case Management
    getCases: (filters) => ipcRenderer.invoke('db:getCases', filters),
    getCaseById: (id) => ipcRenderer.invoke('db:getCaseById', id),
    createCase: (caseData) => ipcRenderer.invoke('db:createCase', caseData),
    updateCase: (id, updates) => ipcRenderer.invoke('db:updateCase', id, updates),
    deleteCase: (id) => ipcRenderer.invoke('db:deleteCase', id),
    searchCases: (query) => ipcRenderer.invoke('db:searchCases', query),
    
    // Module A - Parties
    addCaseParty: (caseId, partyData) => ipcRenderer.invoke('db:addCaseParty', caseId, partyData),
    getCaseParties: (caseId) => ipcRenderer.invoke('db:getCaseParties', caseId),
    updateParty: (id, updates) => ipcRenderer.invoke('db:updateParty', id, updates),
    deleteParty: (id) => ipcRenderer.invoke('db:deleteParty', id),
    
    // Module A - Policies
    addCasePolicy: (caseId, policyData) => ipcRenderer.invoke('db:addCasePolicy', caseId, policyData),
    getCasePolicies: (caseId) => ipcRenderer.invoke('db:getCasePolicies', caseId),
    updatePolicy: (id, updates) => ipcRenderer.invoke('db:updatePolicy', id, updates),
    deletePolicy: (id) => ipcRenderer.invoke('db:deletePolicy', id),
    
    // Module B - Tasks
    getTasks: (caseId, filters) => ipcRenderer.invoke('db:getTasks', caseId, filters),
    getTask: (taskId) => ipcRenderer.invoke('db:getTask', taskId),
    createTask: (data) => ipcRenderer.invoke('db:createTask', data),
    updateTask: (data) => ipcRenderer.invoke('db:updateTask', data),
    completeTask: (taskId) => ipcRenderer.invoke('db:completeTask', taskId),
    deleteTask: (taskId) => ipcRenderer.invoke('db:deleteTask', taskId),
    
    // Module B - Task Groups
    getTaskGroups: (caseId) => ipcRenderer.invoke('db:getTaskGroups', caseId),
    createTaskGroup: (data) => ipcRenderer.invoke('db:createTaskGroup', data),
    closeTaskGroup: (groupId) => ipcRenderer.invoke('db:closeTaskGroup', groupId),
    
    // Module B - Time Entries
    getTimeEntries: (taskId) => ipcRenderer.invoke('db:getTimeEntries', taskId),
    createTimeEntry: (data) => ipcRenderer.invoke('db:createTimeEntry', data),
    updateTimeEntry: (data) => ipcRenderer.invoke('db:updateTimeEntry', data),
    deleteTimeEntry: (entryId) => ipcRenderer.invoke('db:deleteTimeEntry', entryId),
    
    // Module B - Cadences
    getCadenceTemplates: () => ipcRenderer.invoke('db:getCadenceTemplates'),
    triggerCadence: (caseId, cadenceType) => ipcRenderer.invoke('db:triggerCadence', caseId, cadenceType),
    
    // Module C - Deadlines
    calculateDeadline: (startDate, days, type) => ipcRenderer.invoke('db:calculateDeadline', startDate, days, type),
    getDeadlines: (caseId) => ipcRenderer.invoke('db:getDeadlines', caseId),
    createDeadline: (data) => ipcRenderer.invoke('db:createDeadline', data),
    updateDeadline: (id, updates) => ipcRenderer.invoke('db:updateDeadline', id, updates),
    
    // Module D - Discovery
    uploadDocument: (caseId, file, metadata) => ipcRenderer.invoke('db:uploadDocument', caseId, file, metadata),
    getDiscoveryDocuments: (caseId, filters) => ipcRenderer.invoke('db:getDiscoveryDocuments', caseId, filters),
    detectBatesGaps: (caseId) => ipcRenderer.invoke('db:detectBatesGaps', caseId),
    generateDeficiencyLetter: (caseId, deficiencies) => ipcRenderer.invoke('db:generateDeficiencyLetter', caseId, deficiencies),
    
    // Module E - Chronology
    createFact: (factData) => ipcRenderer.invoke('db:createFact', factData),
    getFacts: (caseId, filters) => ipcRenderer.invoke('db:getFacts', caseId, filters),
    updateFact: (id, updates) => ipcRenderer.invoke('db:updateFact', id, updates),
    deleteFact: (id) => ipcRenderer.invoke('db:deleteFact', id),
    generateChronology: (caseId, template) => ipcRenderer.invoke('db:generateChronology', caseId, template),
  },
  
  // File operations
  file: {
    selectFile: () => ipcRenderer.invoke('file:select'),
    selectDirectory: () => ipcRenderer.invoke('file:selectDirectory'),
    saveFile: (path, content) => ipcRenderer.invoke('file:save', path, content),
    readFile: (path) => ipcRenderer.invoke('file:read', path),
    exportToWord: (templatePath, data) => ipcRenderer.invoke('file:exportWord', templatePath, data),
    exportToPdf: (html) => ipcRenderer.invoke('file:exportPdf', html),
    exportToCsv: (data) => ipcRenderer.invoke('file:exportCsv', data),
  },
  
  // System operations
  system: {
    getAppPath: () => ipcRenderer.invoke('system:getAppPath'),
    openExternal: (url) => ipcRenderer.invoke('system:openExternal', url),
    showItemInFolder: (path) => ipcRenderer.invoke('system:showItemInFolder', path),
    printDocument: (options) => ipcRenderer.invoke('system:print', options),
  }
});
```

### Main Process Handlers {#main-process-handlers}

```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { DatabaseService } from './database/DatabaseService';
import path from 'path';

let mainWindow: BrowserWindow;
let dbService: DatabaseService;

app.whenReady().then(() => {
  // Initialize database
  dbService = new DatabaseService();
  
  // Create window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  // Register IPC handlers
  registerHandlers();
});

function registerHandlers() {
  // Module A - Cases
  ipcMain.handle('db:getCases', async (_, filters) => {
    return dbService.getCases(filters);
  });
  
  ipcMain.handle('db:getCaseById', async (_, id) => {
    return dbService.getCaseById(id);
  });
  
  ipcMain.handle('db:createCase', async (_, caseData) => {
    return dbService.createCase(caseData);
  });
  
  ipcMain.handle('db:updateCase', async (_, id, updates) => {
    return dbService.updateCase(id, updates);
  });
  
  ipcMain.handle('db:deleteCase', async (_, id) => {
    return dbService.deleteCase(id);
  });
  
  ipcMain.handle('db:searchCases', async (_, query) => {
    return dbService.searchCases(query);
  });
  
  // Module B - Tasks
  ipcMain.handle('db:getTasks', async (_, caseId, filters) => {
    return dbService.getTasks(caseId, filters);
  });
  
  ipcMain.handle('db:createTask', async (_, data) => {
    return dbService.createTask(data);
  });
  
  ipcMain.handle('db:updateTask', async (_, data) => {
    return dbService.updateTask(data);
  });
  
  ipcMain.handle('db:completeTask', async (_, taskId) => {
    return dbService.completeTask(taskId);
  });
  
  // Module B - Cadences
  ipcMain.handle('db:triggerCadence', async (_, caseId, cadenceType) => {
    return dbService.triggerCadence(caseId, cadenceType);
  });
  
  // Module C - Deadlines
  ipcMain.handle('db:calculateDeadline', async (_, startDate, days, type) => {
    return dbService.calculateDeadline(startDate, days, type);
  });
  
  // Module D - Discovery
  ipcMain.handle('db:detectBatesGaps', async (_, caseId) => {
    return dbService.detectBatesGaps(caseId);
  });
  
  // Module E - Chronology
  ipcMain.handle('db:createFact', async (_, factData) => {
    return dbService.createFact(factData);
  });
  
  ipcMain.handle('db:generateChronology', async (_, caseId, template) => {
    return dbService.generateChronology(caseId, template);
  });
}
```

### Renderer Process Calls {#renderer-process-calls}

```typescript
// src/components/CaseList.tsx
import React, { useState, useEffect } from 'react';

export function CaseList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadCases();
  }, []);
  
  async function loadCases(retryCount = 0) {
    // Critical: Retry logic for IPC initialization
    if (!window.electron?.db?.getCases) {
      if (retryCount < 10) {
        setTimeout(() => loadCases(retryCount + 1), 100);
        return;
      }
      setError('Database connection failed');
      setLoading(false);
      return;
    }
    
    try {
      const result = await window.electron.db.getCases({
        status: 'active',
        orderBy: 'date_opened',
        orderDir: 'desc'
      });
      setCases(result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleCreateCase(caseData) {
    try {
      const newCase = await window.electron.db.createCase(caseData);
      setCases([newCase, ...cases]);
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  }
  
  if (loading) return <div>Loading cases...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (cases.length === 0) return <div>No cases found</div>;
  
  return (
    <div className="case-list">
      {cases.map(case => (
        <CaseCard key={case.id} case={case} />
      ))}
    </div>
  );
}
```

### Type Definitions {#type-definitions}

```typescript
// src/types/electron.d.ts
export interface Window {
  electron: {
    db: {
      // Case methods
      getCases: (filters?: CaseFilters) => Promise<Case[]>;
      getCaseById: (id: string) => Promise<Case | null>;
      createCase: (caseData: CreateCaseDTO) => Promise<Case>;
      updateCase: (id: string, updates: Partial<Case>) => Promise<void>;
      deleteCase: (id: string) => Promise<void>;
      searchCases: (query: string) => Promise<Case[]>;
      
      // Task methods
      getTasks: (caseId: string, filters?: TaskFilters) => Promise<Task[]>;
      createTask: (data: CreateTaskDTO) => Promise<Task>;
      updateTask: (data: UpdateTaskDTO) => Promise<void>;
      completeTask: (taskId: string) => Promise<void>;
      
      // Deadline methods
      calculateDeadline: (startDate: string, days: number, type: string) => Promise<string>;
      getDeadlines: (caseId: string) => Promise<Deadline[]>;
      
      // Discovery methods
      uploadDocument: (caseId: string, file: File, metadata: any) => Promise<void>;
      detectBatesGaps: (caseId: string) => Promise<BatesGap[]>;
      
      // Chronology methods
      createFact: (factData: CreateFactDTO) => Promise<Fact>;
      getFacts: (caseId: string, filters?: FactFilters) => Promise<Fact[]>;
    };
    
    file: {
      selectFile: () => Promise<string>;
      saveFile: (path: string, content: string) => Promise<void>;
      exportToWord: (templatePath: string, data: any) => Promise<string>;
      exportToPdf: (html: string) => Promise<string>;
    };
    
    system: {
      getAppPath: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
    };
  };
}
```

---

## SECTION 4: REACT COMPONENTS

### Component Patterns {#component-patterns}

```typescript
// Standard component with loading/error states
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ComponentProps {
  caseId: string;
  onUpdate?: () => void;
}

export function StandardComponent({ caseId, onUpdate }: ComponentProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadData();
  }, [caseId]);
  
  async function loadData(retryCount = 0) {
    if (!window.electron?.db?.getData) {
      if (retryCount < 10) {
        setTimeout(() => loadData(retryCount + 1), 100);
        return;
      }
      setError('Database connection failed');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await window.electron.db.getData(caseId);
      setData(result || []);
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error loading data',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
        <button onClick={() => loadData()} className="mt-2 text-sm text-red-600 hover:text-red-800">
          Try again
        </button>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {data.map(item => (
        <DataCard key={item.id} item={item} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
```

### State Management {#state-management}

```typescript
// src/stores/caseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CaseStore {
  // State
  cases: Case[];
  currentCase: Case | null;
  filters: CaseFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  setCases: (cases: Case[]) => void;
  setCurrentCase: (case: Case | null) => void;
  setFilters: (filters: CaseFilters) => void;
  loadCases: () => Promise<void>;
  createCase: (data: CreateCaseDTO) => Promise<void>;
  updateCase: (id: string, updates: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cases: [],
      currentCase: null,
      filters: {
        status: 'active',
        orderBy: 'date_opened',
        orderDir: 'desc'
      },
      loading: false,
      error: null,
      
      // Actions
      setCases: (cases) => set({ cases }),
      setCurrentCase: (case) => set({ currentCase: case }),
      setFilters: (filters) => set({ filters }),
      
      loadCases: async () => {
        set({ loading: true, error: null });
        try {
          const filters = get().filters;
          const cases = await window.electron.db.getCases(filters);
          set({ cases: cases || [], loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },
      
      createCase: async (data) => {
        try {
          const newCase = await window.electron.db.createCase(data);
          const cases = get().cases;
          set({ cases: [newCase, ...cases] });
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },
      
      updateCase: async (id, updates) => {
        try {
          await window.electron.db.updateCase(id, updates);
          const cases = get().cases.map(c => 
            c.id === id ? { ...c, ...updates } : c
          );
          set({ cases });
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },
      
      deleteCase: async (id) => {
        try {
          await window.electron.db.deleteCase(id);
          const cases = get().cases.filter(c => c.id !== id);
          set({ cases });
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      }
    }),
    {
      name: 'case-store',
      partialize: (state) => ({
        filters: state.filters,
        currentCase: state.currentCase
      })
    }
  )
);
```

### Hook Implementations {#hook-implementations}

```typescript
// src/hooks/useAutosave.ts
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export function useAutosave(
  value: any,
  onSave: (value: any) => Promise<void>,
  delay = 1200
) {
  const debouncedSave = useRef(
    debounce(async (value) => {
      try {
        await onSave(value);
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    }, delay)
  ).current;
  
  useEffect(() => {
    if (value) {
      debouncedSave(value);
    }
    
    return () => {
      debouncedSave.cancel();
    };
  }, [value, debouncedSave]);
}

// Usage
function NoteEditor({ caseId }) {
  const [content, setContent] = useState('');
  
  useAutosave(content, async (text) => {
    await window.electron.db.updateCaseNotes(caseId, text);
  });
  
  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="Enter notes..."
    />
  );
}
```

---

## SECTION 5: UTILITY FUNCTIONS

### Date Calculations {#date-calculations}

```typescript
// src/utils/dateTime.ts

// Georgia-specific deadline calculation (O.C.G.A. § 9-11-6)
export function addBusinessDays(startDate: Date, days: number): Date {
  const holidays = getGeorgiaHolidays(startDate.getFullYear());
  let currentDate = new Date(startDate);
  
  // Never count day 1 (the trigger day)
  currentDate.setDate(currentDate.getDate() + 1);
  
  if (days < 7) {
    // Short deadline: exclude intermediate weekends/holidays
    let daysAdded = 0;
    while (daysAdded < days) {
      if (!isWeekend(currentDate) && !isHoliday(currentDate, holidays)) {
        daysAdded++;
      }
      if (daysAdded < days) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  } else {
    // Standard deadline: count all days
    currentDate.setDate(currentDate.getDate() + days - 1);
    
    // If ending on weekend/holiday, extend to next business day
    while (isWeekend(currentDate) || isHoliday(currentDate, holidays)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return currentDate;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(h => 
    h.getDate() === date.getDate() &&
    h.getMonth() === date.getMonth()
  );
}

// Federal holidays (11 total)
export function getGeorgiaHolidays(year: number): Date[] {
  return [
    new Date(year, 0, 1),        // New Year's Day
    getNthWeekday(year, 0, 1, 3), // MLK Day (3rd Monday in January)
    getNthWeekday(year, 1, 1, 3), // Presidents Day (3rd Monday in February)
    getLastWeekday(year, 4, 1),   // Memorial Day (Last Monday in May)
    new Date(year, 5, 19),        // Juneteenth
    new Date(year, 6, 4),         // Independence Day
    getNthWeekday(year, 8, 1, 1), // Labor Day (1st Monday in September)
    getNthWeekday(year, 9, 1, 2), // Columbus Day (2nd Monday in October)
    new Date(year, 10, 11),       // Veterans Day
    getNthWeekday(year, 10, 4, 4),// Thanksgiving (4th Thursday in November)
    new Date(year, 11, 25)        // Christmas Day
  ];
}

function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function getLastWeekday(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();
  const offset = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month + 1, -offset);
}
```

### Export Functions {#export-functions}

```typescript
// src/utils/export.ts

export async function generateDOCX(templatePath: string, data: any): Promise<string> {
  const template = await window.electron.file.readFile(templatePath);
  const filled = await window.electron.file.exportToWord(template, data);
  return filled;
}

export function generateCSV(rows: any[]): string {
  if (rows.length === 0) return '';
  
  const headers = Object.keys(rows[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = rows.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

export function generateICS(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sunflower Suite//EN',
    'CALSCALE:GREGORIAN'
  ];
  
  events.forEach(event => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@sunflowersuite.local`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${formatICSDate(event.start)}`);
    lines.push(`DTEND:${formatICSDate(event.end)}`);
    lines.push(`SUMMARY:${event.title}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${event.location}`);
    }
    lines.push('END:VEVENT');
  });
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
```

### Validation Functions {#validation-functions}

```typescript
// src/utils/validation.ts

export function validateBatesRange(start: string, end: string): boolean {
  // Extract numeric portions
  const startNum = extractBatesNumber(start);
  const endNum = extractBatesNumber(end);
  
  if (!startNum || !endNum) return false;
  return endNum >= startNum;
}

export function extractBatesNumber(bates: string): number | null {
  const match = bates.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export function detectBatesGaps(documents: any[]): BatesGap[] {
  const gaps: BatesGap[] = [];
  const sorted = documents.sort((a, b) => {
    const aNum = extractBatesNumber(a.bates_end || a.bates_start);
    const bNum = extractBatesNumber(b.bates_start);
    return (aNum || 0) - (bNum || 0);
  });
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    
    const currentEnd = extractBatesNumber(current.bates_end || current.bates_start);
    const nextStart = extractBatesNumber(next.bates_start);
    
    if (currentEnd && nextStart && nextStart - currentEnd > 1) {
      gaps.push({
        after: current.bates_end || current.bates_start,
        before: next.bates_start,
        missing: nextStart - currentEnd - 1
      });
    }
  }
  
  return gaps;
}

export function validateCaseData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.case_name || data.case_name.trim() === '') {
    errors.push('Case name is required');
  }
  
  if (!data.primary_plaintiff_name || data.primary_plaintiff_name.trim() === '') {
    errors.push('Primary plaintiff name is required');
  }
  
  if (!data.primary_defendant_name || data.primary_defendant_name.trim() === '') {
    errors.push('Primary defendant name is required');
  }
  
  if (data.date_of_loss && new Date(data.date_of_loss) > new Date()) {
    errors.push('Date of loss cannot be in the future');
  }
  
  return errors;
}
```

---

## SECTION 6: AUTOMATION IMPLEMENTATIONS

### Trigger Definitions {#trigger-definitions}

```javascript
// rules/automations.json
{
  "automations": [
    {
      "id": "answer-filed",
      "name": "Answer Filed Automation",
      "trigger": {
        "type": "event",
        "event": "answer_filed",
        "conditions": {
          "case.phase": ["complaint_served", "answer_due"]
        }
      },
      "actions": [
        {
          "type": "update_case",
          "data": {
            "phase": "discovery"
          }
        },
        {
          "type": "create_tasks",
          "tasks": [
            {
              "title": "Prepare Initial Discovery Requests",
              "due_days": 30,
              "priority": 2
            },
            {
              "title": "Schedule Initial Case Conference",
              "due_days": 14,
              "priority": 2
            }
          ]
        },
        {
          "type": "calculate_deadlines",
          "deadlines": [
            {
              "type": "discovery_close",
              "days_before_trial": 30
            }
          ]
        }
      ]
    },
    {
      "id": "discovery-close-30",
      "name": "30 Days Before Discovery Close",
      "trigger": {
        "type": "deadline",
        "days_before": 30,
        "deadline_type": "discovery_close"
      },
      "actions": [
        {
          "type": "create_tasks",
          "tasks": [
            {
              "title": "Final Discovery Review",
              "due_days": 7,
              "priority": 1
            },
            {
              "title": "Identify Remaining Discovery Needs",
              "due_days": 3,
              "priority": 1
            },
            {
              "title": "Prepare Final Discovery Requests",
              "due_days": 5,
              "priority": 1
            }
          ]
        },
        {
          "type": "send_notification",
          "template": "discovery_close_warning"
        }
      ]
    }
  ]
}
```

### Action Handlers {#action-handlers}

```typescript
// electron/database/AutomationService.ts

export class AutomationService {
  constructor(private db: Database) {}
  
  async processAutomation(caseId: string, trigger: string, context: any) {
    const automations = await this.getAutomationsForTrigger(trigger);
    
    for (const automation of automations) {
      if (this.evaluateConditions(automation.conditions, context)) {
        await this.executeActions(caseId, automation.actions, context);
        await this.logAutomation(caseId, automation.id, automation.actions);
      }
    }
  }
  
  private evaluateConditions(conditions: any, context: any): boolean {
    if (!conditions) return true;
    
    for (const [key, value] of Object.entries(conditions)) {
      const contextValue = this.getNestedValue(context, key);
      
      if (Array.isArray(value)) {
        if (!value.includes(contextValue)) return false;
      } else {
        if (contextValue !== value) return false;
      }
    }
    
    return true;
  }
  
  private async executeActions(caseId: string, actions: any[], context: any) {
    for (const action of actions) {
      switch (action.type) {
        case 'create_tasks':
          await this.createTasks(caseId, action.tasks);
          break;
          
        case 'update_case':
          await this.updateCase(caseId, action.data);
          break;
          
        case 'calculate_deadlines':
          await this.calculateDeadlines(caseId, action.deadlines);
          break;
          
        case 'send_notification':
          await this.sendNotification(caseId, action.template);
          break;
      }
    }
  }
  
  private async createTasks(caseId: string, tasks: any[]) {
    for (const task of tasks) {
      const dueDate = this.calculateDueDate(task.due_days);
      
      this.db.prepare(`
        INSERT INTO tasks (case_id, title, description, due_date, priority, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(
        caseId,
        task.title,
        task.description || '',
        dueDate,
        task.priority || 3
      );
    }
  }
  
  private calculateDueDate(dueDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dueDays);
    return date.toISOString().split('T')[0];
  }
}
```

### Cadence Templates {#cadence-templates}

```javascript
// rules/cadences.json
{
  "cadences": [
    {
      "id": "case-intake",
      "name": "Case Intake & Initial Setup",
      "category": "intake",
      "trigger": "new_case",
      "timeline": "0-10 days",
      "tasks": [
        {
          "title": "Acknowledge file receipt and open case",
          "day": 0,
          "assigned_to": "attorney",
          "priority": 1,
          "description": "Create case file, assign case number, enter basic information"
        },
        {
          "title": "Contact insured/client",
          "day": 1,
          "assigned_to": "attorney",
          "priority": 1,
          "description": "Initial contact to confirm representation, gather incident info"
        },
        {
          "title": "Check for pre-suit demand",
          "day": 3,
          "assigned_to": "attorney",
          "priority": 2,
          "description": "Review file for settlement demands, evaluate settlement possibility"
        },
        {
          "title": "Check for coverage issues",
          "day": 3,
          "assigned_to": "attorney",
          "priority": 2,
          "description": "Review policy, identify exclusions, flag reservation of rights"
        },
        {
          "title": "Prepare initial claim file index",
          "day": 5,
          "assigned_to": "paralegal",
          "priority": 3,
          "description": "Create document index, organize file structure"
        },
        {
          "title": "Draft initial case intake memo",
          "day": 7,
          "assigned_to": "attorney",
          "priority": 2,
          "description": "Comprehensive memo with facts, parties, claims, liability assessment"
        },
        {
          "title": "Send preliminary status to adjuster",
          "day": 7,
          "assigned_to": "attorney",
          "priority": 2,
          "description": "Initial report with overview, strategy, reserve recommendation"
        },
        {
          "title": "Draft initial litigation budget",
          "day": 10,
          "assigned_to": "attorney",
          "priority": 3,
          "description": "Phase-by-phase budget through resolution"
        }
      ]
    },
    {
      "id": "discovery-initiated",
      "name": "Discovery Initiated",
      "category": "discovery",
      "trigger": "discovery_opened",
      "tasks": [
        {
          "title": "Draft Initial Interrogatories",
          "day": 5,
          "assigned_to": "attorney",
          "priority": 2
        },
        {
          "title": "Draft Request for Production",
          "day": 5,
          "assigned_to": "attorney",
          "priority": 2
        },
        {
          "title": "Draft Request for Admissions",
          "day": 7,
          "assigned_to": "attorney",
          "priority": 3
        },
        {
          "title": "Calendar Discovery Deadlines",
          "day": 1,
          "assigned_to": "paralegal",
          "priority": 1
        },
        {
          "title": "Send Preservation Letter",
          "day": 2,
          "assigned_to": "attorney",
          "priority": 1
        }
      ]
    }
  ]
}
```

---

## SECTION 7: MODULE-SPECIFIC CODE

### Module A Implementation {#module-a-implementation}

```typescript
// electron/database/ModuleA_DatabaseService.ts

export class ModuleA_DatabaseService {
  private db: Database;
  
  constructor(db: Database) {
    this.db = db;
  }
  
  // Create case with all v5.0 fields
  createCase(caseData: CreateCaseDTO): Case {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Generate display name with et al. logic
    const displayName = this.generateCaseDisplayName(caseData);
    
    const stmt = this.db.prepare(`
      INSERT INTO cases (
        id, case_name, short_case_name, cm_number, 
        primary_plaintiff_name, primary_defendant_name,
        venue_court, venue_judge, phase, status,
        date_opened, date_of_loss, is_provisional,
        is_wrongful_death, is_survival_action,
        carrier_name, carrier_claim_no, lead_attorney_id,
        notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    
    stmt.run(
      id,
      displayName,
      caseData.short_case_name || displayName.substring(0, 30),
      caseData.cm_number || null,
      caseData.primary_plaintiff_name,
      caseData.primary_defendant_name,
      caseData.venue_court || null,
      caseData.venue_judge || null,
      caseData.phase || 'intake',
      caseData.status || 'active',
      caseData.date_opened || now.split('T')[0],
      caseData.date_of_loss || null,
      caseData.is_provisional ? 1 : 0,
      caseData.is_wrongful_death ? 1 : 0,
      caseData.is_survival_action ? 1 : 0,
      caseData.carrier_name || null,
      caseData.carrier_claim_no || null,
      caseData.lead_attorney_id || null,
      caseData.notes || null,
      now,
      now
    );
    
    return this.getCaseById(id);
  }
  
  // Generate display name with et al. logic
  private generateCaseDisplayName(caseData: any): string {
    const plaintiffs = [caseData.primary_plaintiff_name];
    const defendants = [caseData.primary_defendant_name];
    
    // Add additional parties if provided
    if (caseData.additional_plaintiffs?.length > 0) {
      plaintiffs.push(...caseData.additional_plaintiffs);
    }
    if (caseData.additional_defendants?.length > 0) {
      defendants.push(...caseData.additional_defendants);
    }
    
    // Format with et al. if multiple parties
    const plaintiffStr = plaintiffs.length > 1 
      ? `${plaintiffs[0]}, et al.`
      : plaintiffs[0];
      
    const defendantStr = defendants.length > 1
      ? `${defendants[0]}, et al.`
      : defendants[0];
    
    return `${plaintiffStr} v. ${defendantStr}`;
  }
  
  // Get cases with filters
  getCases(filters?: CaseFilters): Case[] {
    let sql = `
      SELECT c.*,
        GROUP_CONCAT(DISTINCT p.party_name) as all_parties
      FROM cases c
      LEFT JOIN case_parties p ON c.id = p.case_id
      WHERE c.is_deleted = 0
    `;
    
    const params: any[] = [];
    
    if (filters?.status) {
      sql += ` AND c.status = ?`;
      params.push(filters.status);
    }
    
    if (filters?.lead_attorney_id) {
      sql += ` AND c.lead_attorney_id = ?`;
      params.push(filters.lead_attorney_id);
    }
    
    if (filters?.phase) {
      sql += ` AND c.phase = ?`;
      params.push(filters.phase);
    }
    
    sql += ` GROUP BY c.id`;
    
    // Add ordering
    const orderBy = filters?.orderBy || 'date_opened';
    const orderDir = filters?.orderDir || 'DESC';
    sql += ` ORDER BY c.${orderBy} ${orderDir}`;
    
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }
  
  // Search cases across multiple fields
  searchCases(query: string): Case[] {
    const searchTerm = `%${query}%`;
    
    const sql = `
      SELECT DISTINCT c.*
      FROM cases c
      LEFT JOIN case_parties p ON c.id = p.case_id
      WHERE c.is_deleted = 0
        AND (
          c.case_name LIKE ? OR
          c.cm_number LIKE ? OR
          c.primary_plaintiff_name LIKE ? OR
          c.primary_defendant_name LIKE ? OR
          p.party_name LIKE ? OR
          c.carrier_claim_no LIKE ? OR
          c.notes LIKE ?
        )
      ORDER BY c.date_opened DESC
    `;
    
    const stmt = this.db.prepare(sql);
    return stmt.all(
      searchTerm, searchTerm, searchTerm, 
      searchTerm, searchTerm, searchTerm, searchTerm
    );
  }
}
```

### Module B Implementation {#module-b-implementation}

```typescript
// src/components/moduleB/TaskTable.tsx

import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export function TaskTable({ caseId }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  
  useEffect(() => {
    loadTasks();
  }, [caseId, filter, sortBy]);
  
  async function loadTasks() {
    const filters = {
      status: filter === 'all' ? undefined : filter,
      orderBy: sortBy
    };
    
    const result = await window.electron.db.getTasks(caseId, filters);
    setTasks(result || []);
  }
  
  function getPriorityColor(priority: number) {
    switch (priority) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
  
  function getDueDateColor(dueDate: string, status: string) {
    if (status === 'completed') return '';
    
    const daysUntilDue = differenceInDays(new Date(dueDate), new Date());
    
    if (daysUntilDue < 0) return 'text-red-600 font-bold'; // Overdue
    if (daysUntilDue <= 1) return 'text-red-500';          // Due tomorrow
    if (daysUntilDue <= 7) return 'text-yellow-600';        // Due this week
    return '';
  }
  
  async function handleComplete(taskId: string) {
    await window.electron.db.completeTask(taskId);
    loadTasks();
  }
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Tasks
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>
      
      {/* Task List */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Task</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Due Date</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-600">{task.description}</div>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    P{task.priority}
                  </Badge>
                </td>
                <td className={`p-2 ${getDueDateColor(task.due_date, task.status)}`}>
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </td>
                <td className="p-2">
                  <Badge variant={task.status === 'completed' ? 'success' : 'default'}>
                    {task.status}
                  </Badge>
                </td>
                <td className="p-2">
                  {task.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => handleComplete(task.id)}
                    >
                      Complete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## APPENDIX: TROUBLESHOOTING

### Common Errors and Solutions

**Error: "window.electron is undefined"**
```javascript
// Solution: Check preload.js is CommonJS
// ✅ Correct
const { contextBridge } = require('electron');

// ❌ Wrong - causes undefined
import { contextBridge } from 'electron';
```

**Error: "no such column: [column_name]"**
```bash
# Solution: Check database schema
sqlite3 "$env:APPDATA\SunflowerSuite\suite.db"
.schema cases

# Run migration if needed
node scripts/migrate-to-v5.js
```

**Error: "Cannot read property 'getCases' of undefined"**
```javascript
// Solution: Add retry logic
async function loadData(retryCount = 0) {
  if (!window.electron?.db?.getCases) {
    if (retryCount < 10) {
      setTimeout(() => loadData(retryCount + 1), 100);
      return;
    }
    // Handle error
  }
  // Continue
}
```

**Error: Build fails on flash drive**
```bash
# Solution: Build locally, then copy
cd C:\temp\SunflowerSuite
npm run build
xcopy /E /I dist D:\SunflowerSuite\dist
```

---

## QUICK REFERENCE CARD

### Most Used Commands
```bash
npm run dev                    # Start development
sqlite3 suite.db               # Database console
npx tsc --noEmit              # Check TypeScript
npm run build                  # Build production
```

### Key File Locations
```
Database: %APPDATA%\SunflowerSuite\suite.db
Logs: %APPDATA%\SunflowerSuite\logs\
Templates: D:\SunflowerSuite\templates\
Exports: D:\SunflowerSuite\data\exports\
```

### Database Quick Queries
```sql
-- Active cases
SELECT * FROM cases WHERE status = 'active';

-- Overdue tasks
SELECT * FROM tasks WHERE due_date < DATE('now') AND status != 'completed';

-- Discovery deadlines
SELECT * FROM deadlines WHERE type = 'discovery_close';
```

### IPC Quick Test
```javascript
// Browser console
window.electron.db.getCases().then(console.log)
window.electron.db.getTasks('case-id').then(console.log)
window.electron.system.getAppPath().then(console.log)
```

---

**Document Version:** 5.0  
**Total Pages:** 40+ pages  
**Code Examples:** 50+  
**Database Tables:** 25+  
**IPC Methods:** 40+  
**Status:** Complete Technical Reference