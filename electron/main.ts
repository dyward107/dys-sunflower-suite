import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { DatabaseService } from './database/DatabaseService';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../electron/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173/');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'suite.db');
  dbService = new DatabaseService(dbPath);
  await dbService.initialize();
  console.log('Database initialized at:', dbPath);
}

app.on('ready', async () => {
  await initializeDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  if (dbService) {
    dbService.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A: CASES
// ============================================================================

ipcMain.handle('db:createCase', async (event, caseData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createCase(caseData);
    return id;
  } catch (error: any) {
    console.error('Error creating case:', error);
    throw error;
  }
});

ipcMain.handle('db:getCases', async (event, filters) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const cases = await dbService.getCases(filters);
    return cases;
  } catch (error: any) {
    console.error('Error getting cases:', error);
    throw error;
  }
});

ipcMain.handle('db:getCaseById', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const caseData = await dbService.getCaseById(id);
    return caseData;
  } catch (error: any) {
    console.error('Error getting case by ID:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCase', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateCase(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating case:', error);
    throw error;
  }
});

ipcMain.handle('db:searchCases', async (event, query) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const cases = await dbService.searchCases(query);
    return cases;
  } catch (error: any) {
    console.error('Error searching cases:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A: PARTIES
// ============================================================================

ipcMain.handle('db:addCaseParty', async (event, caseId, partyData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.addCaseParty(caseId, partyData);
    return id;
  } catch (error: any) {
    console.error('Error adding party:', error);
    throw error;
  }
});

ipcMain.handle('db:updateParty', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateParty(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating party:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteParty', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteParty(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting party:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A: POLICIES
// ============================================================================

ipcMain.handle('db:addCasePolicy', async (event, caseId, policyData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.addCasePolicy(caseId, policyData);
    return id;
  } catch (error: any) {
    console.error('Error adding policy:', error);
    throw error;
  }
});

ipcMain.handle('db:getCasePolicies', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const policies = await dbService.getCasePolicies(caseId);
    return policies;
  } catch (error: any) {
    console.error('Error getting policies:', error);
    throw error;
  }
});

ipcMain.handle('db:updatePolicy', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updatePolicy(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating policy:', error);
    throw error;
  }
});

ipcMain.handle('db:deletePolicy', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deletePolicy(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting policy:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A: CONTACTS (PHASE 1B)
// ============================================================================

// Global Contacts
ipcMain.handle('db:createContact', async (event, contactData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createContact(contactData);
    return id;
  } catch (error: any) {
    console.error('Error creating contact:', error);
    throw error;
  }
});

ipcMain.handle('db:getContacts', async (event, filters) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const contacts = await dbService.getContacts(filters);
    return contacts;
  } catch (error: any) {
    console.error('Error getting contacts:', error);
    throw error;
  }
});

ipcMain.handle('db:updateContact', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateContact(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating contact:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteContact', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteContact(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    throw error;
  }
});

ipcMain.handle('db:searchContacts', async (event, query) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const contacts = await dbService.searchContacts(query);
    return contacts;
  } catch (error: any) {
    console.error('Error searching contacts:', error);
    throw error;
  }
});

// Case-Contact Relationships
ipcMain.handle('db:addContactToCase', async (event, caseContactData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.addContactToCase(caseContactData);
    return id;
  } catch (error: any) {
    console.error('Error adding contact to case:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCaseContact', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateCaseContact(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating case contact:', error);
    throw error;
  }
});

ipcMain.handle('db:removeCaseContactRelationship', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.removeCaseContactRelationship(id);
    return success;
  } catch (error: any) {
    console.error('Error removing case contact relationship:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A: UTILITY
// ============================================================================

ipcMain.handle('db:deleteCase', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteCase(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting case:', error);
    throw error;
  }
});

ipcMain.handle('db:generateCaseDisplayName', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const displayName = await dbService.generateCaseDisplayName(caseId);
    return displayName;
  } catch (error: any) {
    console.error('Error generating case display name:', error);
    throw error;
  }
});

// ============================================================================
// MODULE A PHASE 1C: DISPOSITION IPC HANDLERS
// ============================================================================

ipcMain.handle('db:createDisposition', async (event, dispositionData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createDisposition(dispositionData);
    return id;
  } catch (error: any) {
    console.error('Error creating disposition:', error);
    throw error;
  }
});

ipcMain.handle('db:getDisposition', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const disposition = await dbService.getDisposition(caseId);
    return disposition;
  } catch (error: any) {
    console.error('Error getting disposition:', error);
    throw error;
  }
});

ipcMain.handle('db:updateDisposition', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateDisposition(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating disposition:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteDisposition', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteDisposition(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting disposition:', error);
    throw error;
  }
});

ipcMain.handle('db:getCaseDispositions', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const dispositions = await dbService.getCaseDispositions(caseId);
    return dispositions;
  } catch (error: any) {
    console.error('Error getting case dispositions:', error);
    throw error;
  }
});

// ============================================================================
// MODULE A PHASE 1D: DOCUMENT MANAGEMENT IPC HANDLERS
// ============================================================================

ipcMain.handle('db:createDocument', async (event, documentData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createDocument(documentData);
    return id;
  } catch (error: any) {
    console.error('Error creating document:', error);
    throw error;
  }
});

ipcMain.handle('db:getDocumentById', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const document = await dbService.getDocumentById(id);
    return document;
  } catch (error: any) {
    console.error('Error getting document by ID:', error);
    throw error;
  }
});

ipcMain.handle('db:getDocumentsForCase', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const documents = await dbService.getDocumentsForCase(caseId);
    return documents;
  } catch (error: any) {
    console.error('Error getting documents for case:', error);
    throw error;
  }
});

ipcMain.handle('db:updateDocument', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateDocument(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating document:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteDocument', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteDocument(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting document:', error);
    throw error;
  }
});

// Party-Document Linking IPC Handlers
ipcMain.handle('db:linkDocumentToParty', async (event, partyId, documentId, relevanceNotes, isPrimarySubject) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.linkDocumentToParty(partyId, documentId, relevanceNotes, isPrimarySubject);
    return success;
  } catch (error: any) {
    console.error('Error linking document to party:', error);
    throw error;
  }
});

ipcMain.handle('db:unlinkDocumentFromParty', async (event, partyId, documentId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.unlinkDocumentFromParty(partyId, documentId);
    return success;
  } catch (error: any) {
    console.error('Error unlinking document from party:', error);
    throw error;
  }
});

ipcMain.handle('db:getDocumentsForParty', async (event, partyId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const documents = await dbService.getDocumentsForParty(partyId);
    return documents;
  } catch (error: any) {
    console.error('Error getting documents for party:', error);
    throw error;
  }
});

ipcMain.handle('db:getPartiesForDocument', async (event, documentId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const parties = await dbService.getPartiesForDocument(documentId);
    return parties;
  } catch (error: any) {
    console.error('Error getting parties for document:', error);
    throw error;
  }
});

// Policy-Document Linking IPC Handlers
ipcMain.handle('db:linkDocumentToPolicy', async (event, policyId, documentId, policyDocType) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.linkDocumentToPolicy(policyId, documentId, policyDocType);
    return success;
  } catch (error: any) {
    console.error('Error linking document to policy:', error);
    throw error;
  }
});

ipcMain.handle('db:unlinkDocumentFromPolicy', async (event, policyId, documentId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.unlinkDocumentFromPolicy(policyId, documentId);
    return success;
  } catch (error: any) {
    console.error('Error unlinking document from policy:', error);
    throw error;
  }
});

ipcMain.handle('db:getDocumentsForPolicy', async (event, policyId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const documents = await dbService.getDocumentsForPolicy(policyId);
    return documents;
  } catch (error: any) {
    console.error('Error getting documents for policy:', error);
    throw error;
  }
});

// Enhanced Party Methods IPC Handlers
ipcMain.handle('db:updatePartyExtended', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updatePartyExtended(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating party (extended):', error);
    throw error;
  }
});

ipcMain.handle('db:getPartyWithDocuments', async (event, partyId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const party = await dbService.getPartyWithDocuments(partyId);
    return party;
  } catch (error: any) {
    console.error('Error getting party with documents:', error);
    throw error;
  }
});

// Helper Methods IPC Handlers
ipcMain.handle('db:getDocumentStats', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const stats = await dbService.getDocumentStats(caseId);
    return stats;
  } catch (error: any) {
    console.error('Error getting document stats:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A (UNIFIED): CASE PERSONS
// ============================================================================

ipcMain.handle('db:createCasePerson', async (event, personData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createCasePerson(personData);
    return id;
  } catch (error: any) {
    console.error('Error creating case person:', error);
    throw error;
  }
});

ipcMain.handle('db:getCasePersons', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const persons = await dbService.getCasePersons(caseId);
    return persons;
  } catch (error: any) {
    console.error('Error getting case persons:', error);
    throw error;
  }
});

ipcMain.handle('db:getCasePersonById', async (event, personId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const person = await dbService.getCasePersonById(personId);
    return person;
  } catch (error: any) {
    console.error('Error getting case person by ID:', error);
    throw error;
  }
});

ipcMain.handle('db:getCaseParties', async (event, caseId, partyRole) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const parties = await dbService.getCaseParties(caseId, partyRole);
    return parties;
  } catch (error: any) {
    console.error('Error getting case parties:', error);
    throw error;
  }
});

ipcMain.handle('db:getInsuredsWeRepresent', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const insureds = await dbService.getInsuredsWeRepresent(caseId);
    return insureds;
  } catch (error: any) {
    console.error('Error getting insureds we represent:', error);
    throw error;
  }
});

ipcMain.handle('db:getCaseContacts', async (event, caseId, personType) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const contacts = await dbService.getCaseContacts(caseId, personType);
    return contacts;
  } catch (error: any) {
    console.error('Error getting case contacts:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCasePerson', async (event, personId, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.updateCasePerson(personId, updates);
    return true;
  } catch (error: any) {
    console.error('Error updating case person:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteCasePerson', async (event, personId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.deleteCasePerson(personId);
    return true;
  } catch (error: any) {
    console.error('Error deleting case person:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A (UNIFIED): CORRESPONDENCE
// ============================================================================

ipcMain.handle('db:createCorrespondence', async (event, entryData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createCorrespondence(entryData);
    return id;
  } catch (error: any) {
    console.error('Error creating correspondence:', error);
    throw error;
  }
});

ipcMain.handle('db:getAllCorrespondence', async (event, filters) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const correspondence = await dbService.getAllCorrespondence(filters);
    return correspondence;
  } catch (error: any) {
    console.error('Error getting all correspondence:', error);
    throw error;
  }
});

ipcMain.handle('db:getCaseCorrespondence', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const correspondence = await dbService.getCaseCorrespondence(caseId);
    return correspondence;
  } catch (error: any) {
    console.error('Error getting case correspondence:', error);
    throw error;
  }
});

ipcMain.handle('db:getCorrespondenceById', async (event, entryId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const entry = await dbService.getCorrespondenceById(entryId);
    return entry;
  } catch (error: any) {
    console.error('Error getting correspondence by ID:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCorrespondence', async (event, entryId, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.updateCorrespondence(entryId, updates);
    return true;
  } catch (error: any) {
    console.error('Error updating correspondence:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteCorrespondence', async (event, entryId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.deleteCorrespondence(entryId);
    return true;
  } catch (error: any) {
    console.error('Error deleting correspondence:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE C (PHASE 3): CALENDAR EVENTS
// ============================================================================

ipcMain.handle('db:createCalendarEvent', async (event, eventData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createCalendarEvent(eventData);
    return id;
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
});

ipcMain.handle('db:getCalendarEvents', async (event, filters) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const events = await dbService.getCalendarEvents(filters);
    return events;
  } catch (error: any) {
    console.error('Error getting calendar events:', error);
    throw error;
  }
});

ipcMain.handle('db:getCalendarEventById', async (event, eventId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const event = await dbService.getCalendarEventById(eventId);
    return event;
  } catch (error: any) {
    console.error('Error getting calendar event by ID:', error);
    throw error;
  }
});

ipcMain.handle('db:updateCalendarEvent', async (event, eventId, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.updateCalendarEvent(eventId, updates);
    return true;
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteCalendarEvent', async (event, eventId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.deleteCalendarEvent(eventId);
    return true;
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
});

ipcMain.handle('db:exportCalendarEventsToICS', async (event, filters) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const icsContent = await dbService.exportCalendarEventsToICS(filters);
    return icsContent;
  } catch (error: any) {
    console.error('Error exporting calendar events to ICS:', error);
    throw error;
  }
});

ipcMain.handle('db:syncCalendarEventToOutlook', async (event, eventId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.syncCalendarEventToOutlook(eventId);
    return success;
  } catch (error: any) {
    console.error('Error syncing calendar event to Outlook:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE A (UNIFIED): GLOBAL CONTACTS
// ============================================================================

ipcMain.handle('db:createGlobalContact', async (event, contactData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createGlobalContact(contactData);
    return id;
  } catch (error: any) {
    console.error('Error creating global contact:', error);
    throw error;
  }
});

ipcMain.handle('db:getGlobalContacts', async (event, filters) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const contacts = await dbService.getGlobalContacts(filters);
    return contacts;
  } catch (error: any) {
    console.error('Error getting global contacts:', error);
    throw error;
  }
});

ipcMain.handle('db:getGlobalContactById', async (event, contactId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const contact = await dbService.getGlobalContactById(contactId);
    return contact;
  } catch (error: any) {
    console.error('Error getting global contact by ID:', error);
    throw error;
  }
});

ipcMain.handle('db:updateGlobalContact', async (event, contactId, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.updateGlobalContact(contactId, updates);
    return true;
  } catch (error: any) {
    console.error('Error updating global contact:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteGlobalContact', async (event, contactId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    await dbService.deleteGlobalContact(contactId);
    return true;
  } catch (error: any) {
    console.error('Error deleting global contact:', error);
    throw error;
  }
});

ipcMain.handle('db:promoteToGlobalContact', async (event, personId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const globalContactId = await dbService.promoteToGlobalContact(personId);
    return globalContactId;
  } catch (error: any) {
    console.error('Error promoting to global contact:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE B: TASKS
// ============================================================================

ipcMain.handle('db:getTasks', async (event, caseId, filters) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const tasks = await dbService.getTasks(caseId, filters);
    return tasks;
  } catch (error: any) {
    console.error('Error getting tasks:', error);
    throw error;
  }
});

ipcMain.handle('db:getTaskById', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const task = await dbService.getTaskById(id);
    return task;
  } catch (error: any) {
    console.error('Error getting task by ID:', error);
    throw error;
  }
});

ipcMain.handle('db:createTask', async (event, taskData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createTask(taskData);
    return id;
  } catch (error: any) {
    console.error('Error creating task:', error);
    throw error;
  }
});

ipcMain.handle('db:updateTask', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateTask(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating task:', error);
    throw error;
  }
});

ipcMain.handle('db:completeTask', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.completeTask(id);
    return success;
  } catch (error: any) {
    console.error('Error completing task:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteTask', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteTask(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting task:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE B: TIME ENTRIES
// ============================================================================

ipcMain.handle('db:createTimeEntry', async (event, entryData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createTimeEntry(entryData);
    return id;
  } catch (error: any) {
    console.error('Error creating time entry:', error);
    throw error;
  }
});

ipcMain.handle('db:getTimeEntries', async (event, taskId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const entries = await dbService.getTimeEntries(taskId);
    return entries;
  } catch (error: any) {
    console.error('Error getting time entries:', error);
    throw error;
  }
});

ipcMain.handle('db:updateTimeEntry', async (event, id, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateTimeEntry(id, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating time entry:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteTimeEntry', async (event, id) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteTimeEntry(id);
    return success;
  } catch (error: any) {
    console.error('Error deleting time entry:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE B: TASK NOTES
// ============================================================================

ipcMain.handle('db:createTaskNote', async (event, noteData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const noteId = await dbService.createTaskNote(noteData);
    return noteId;
  } catch (error: any) {
    console.error('Error creating task note:', error);
    throw error;
  }
});

ipcMain.handle('db:getTaskNotes', async (event, taskId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const notes = await dbService.getTaskNotes(taskId);
    return notes;
  } catch (error: any) {
    console.error('Error getting task notes:', error);
    throw error;
  }
});

ipcMain.handle('db:updateTaskNote', async (event, noteId, updates) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.updateTaskNote(noteId, updates);
    return success;
  } catch (error: any) {
    console.error('Error updating task note:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteTaskNote', async (event, noteId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const success = await dbService.deleteTaskNote(noteId);
    return success;
  } catch (error: any) {
    console.error('Error deleting task note:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE B: TASK GROUPS
// ============================================================================

ipcMain.handle('db:getTaskGroups', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const groups = await dbService.getTaskGroups(caseId);
    return groups;
  } catch (error: any) {
    console.error('Error getting task groups:', error);
    throw error;
  }
});

ipcMain.handle('db:createTaskGroup', async (event, groupData) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const id = await dbService.createTaskGroup(groupData);
    return id;
  } catch (error: any) {
    console.error('Error creating task group:', error);
    throw error;
  }
});

// ============================================================================
// IPC HANDLERS - MODULE B: TASKS, TIME TRACKING, NOTES  
// ============================================================================
// (Calendar events moved to Module C section above)
