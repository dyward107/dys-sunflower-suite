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

ipcMain.handle('db:getCaseParties', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const parties = await dbService.getCaseParties(caseId);
    return parties;
  } catch (error: any) {
    console.error('Error getting parties:', error);
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

ipcMain.handle('db:getCaseContacts', async (event, caseId) => {
  if (!dbService) throw new Error('Database not initialized');
  try {
    const caseContacts = await dbService.getCaseContacts(caseId);
    return caseContacts;
  } catch (error: any) {
    console.error('Error getting case contacts:', error);
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
