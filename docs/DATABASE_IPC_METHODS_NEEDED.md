# DATABASE IPC METHODS - UNIFIED CASE_PERSONS ARCHITECTURE

## METHODS TO ADD TO DatabaseService.ts

### 1. CASE_PERSONS (Unified Parties + Contacts)

```typescript
// Create person (party or contact)
async createCasePerson(personData: CasePersonInput): Promise<number>

// Get all persons for a case
async getCasePersons(caseId: number): Promise<CasePerson[]>

// Get person by ID
async getCasePersonById(personId: number): Promise<CasePerson | null>

// Get parties only (filtered)
async getCaseParties(caseId: number, partyRole?: 'plaintiff' | 'defendant'): Promise<CasePerson[]>

// Get insureds we represent
async getInsuredsWeRepresent(caseId: number): Promise<CasePerson[]>

// Get contacts only (non-parties)
async getCaseContacts(caseId: number, personType?: PersonType): Promise<CasePerson[]>

// Update person
async updateCasePerson(personId: number, updates: Partial<CasePersonInput>): Promise<void>

// Delete person
async deleteCasePerson(personId: number): Promise<void>
```

### 2. CORRESPONDENCE_LOG

```typescript
// Create correspondence entry
async createCorrespondence(entryData: CorrespondenceEntryInput): Promise<number>

// Get all correspondence (global)
async getAllCorrespondence(filters?: { caseId?: number; personId?: number; dateStart?: string; dateEnd?: string }): Promise<CorrespondenceEntry[]>

// Get correspondence for specific case
async getCaseCorrespondence(caseId: number): Promise<CorrespondenceEntry[]>

// Get correspondence by ID
async getCorrespondenceById(entryId: number): Promise<CorrespondenceEntry | null>

// Update correspondence
async updateCorrespondence(entryId: number, updates: Partial<CorrespondenceEntryInput>): Promise<void>

// Delete correspondence
async deleteCorrespondence(entryId: number): Promise<void>
```

### 3. GLOBAL_CONTACTS

```typescript
// Create global contact
async createGlobalContact(contactData: GlobalContactInput): Promise<number>

// Get all global contacts
async getGlobalContacts(filters?: { contactType?: string; isFavorite?: boolean }): Promise<GlobalContact[]>

// Get global contact by ID
async getGlobalContactById(contactId: number): Promise<GlobalContact | null>

// Update global contact
async updateGlobalContact(contactId: number, updates: Partial<GlobalContactInput>): Promise<void>

// Delete global contact
async deleteGlobalContact(contactId: number): Promise<void>

// Promote case person to global contact
async promoteToGlobalContact(personId: number): Promise<number>
```

### 4. UPDATE EXISTING METHODS

```typescript
// Update createCase to handle policy_limit field
async createCase(caseData: CaseInput): Promise<number> // Add policy_limit field

// Remove old methods:
// - createParty() ← replaced by createCasePerson()
// - getParties() ← replaced by getCaseParties()
// - createContact() ← replaced by createCasePerson() or createGlobalContact()
// - linkContactToCase() ← not needed with unified table
```

## IPC HANDLERS TO ADD TO main.ts

```typescript
// Case Persons
ipcMain.handle('db:createCasePerson', async (_, personData) => ...)
ipcMain.handle('db:getCasePersons', async (_, caseId) => ...)
ipcMain.handle('db:getCasePersonById', async (_, personId) => ...)
ipcMain.handle('db:getCaseParties', async (_, caseId, partyRole) => ...)
ipcMain.handle('db:getInsuredsWeRepresent', async (_, caseId) => ...)
ipcMain.handle('db:getCaseContacts', async (_, caseId, personType) => ...)
ipcMain.handle('db:updateCasePerson', async (_, personId, updates) => ...)
ipcMain.handle('db:deleteCasePerson', async (_, personId) => ...)

// Correspondence
ipcMain.handle('db:createCorrespondence', async (_, entryData) => ...)
ipcMain.handle('db:getAllCorrespondence', async (_, filters) => ...)
ipcMain.handle('db:getCaseCorrespondence', async (_, caseId) => ...)
ipcMain.handle('db:getCorrespondenceById', async (_, entryId) => ...)
ipcMain.handle('db:updateCorrespondence', async (_, entryId, updates) => ...)
ipcMain.handle('db:deleteCorrespondence', async (_, entryId) => ...)

// Global Contacts
ipcMain.handle('db:createGlobalContact', async (_, contactData) => ...)
ipcMain.handle('db:getGlobalContacts', async (_, filters) => ...)
ipcMain.handle('db:getGlobalContactById', async (_, contactId) => ...)
ipcMain.handle('db:updateGlobalContact', async (_, contactId, updates) => ...)
ipcMain.handle('db:deleteGlobalContact', async (_, contactId) => ...)
ipcMain.handle('db:promoteToGlobalContact', async (_, personId) => ...)
```

## PRELOAD.JS METHODS TO ADD

```javascript
// Case Persons
createCasePerson: (personData) => ipcRenderer.invoke('db:createCasePerson', personData),
getCasePersons: (caseId) => ipcRenderer.invoke('db:getCasePersons', caseId),
// ... etc (all methods above)
```

## ELECTRON.D.TS UPDATES

Add method signatures to window.electron.db interface

##FILES TO MODIFY:
1. electron/database/DatabaseService.ts - Add all case_persons, correspondence, global_contacts methods
2. electron/main.ts - Add IPC handlers  
3. electron/preload.js - Add API methods
4. src/types/electron.d.ts - Add type signatures

