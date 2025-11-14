// CRITICAL: This file MUST remain as .js with CommonJS syntax
// DO NOT convert to TypeScript or ES modules
// Electron requires preload scripts to use require() and module.exports

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  db: {
    // Cases
    createCase: (caseData) => ipcRenderer.invoke('db:createCase', caseData),
    getCases: (filters) => ipcRenderer.invoke('db:getCases', filters),
    getCaseById: (id) => ipcRenderer.invoke('db:getCaseById', id),
    updateCase: (id, updates) => ipcRenderer.invoke('db:updateCase', id, updates),
    searchCases: (query) => ipcRenderer.invoke('db:searchCases', query),

    // Parties
    addCaseParty: (caseId, partyData) => ipcRenderer.invoke('db:addCaseParty', caseId, partyData),
    getCaseParties: (caseId) => ipcRenderer.invoke('db:getCaseParties', caseId),
    updateParty: (id, updates) => ipcRenderer.invoke('db:updateParty', id, updates),
    deleteParty: (id) => ipcRenderer.invoke('db:deleteParty', id),

    // Policies
    addCasePolicy: (caseId, policyData) => ipcRenderer.invoke('db:addCasePolicy', caseId, policyData),
    getCasePolicies: (caseId) => ipcRenderer.invoke('db:getCasePolicies', caseId),
    updatePolicy: (id, updates) => ipcRenderer.invoke('db:updatePolicy', id, updates),
    deletePolicy: (id) => ipcRenderer.invoke('db:deletePolicy', id),

    // Contacts (Phase 1B)
    createContact: (contactData) => ipcRenderer.invoke('db:createContact', contactData),
    getContacts: (filters) => ipcRenderer.invoke('db:getContacts', filters),
    updateContact: (id, updates) => ipcRenderer.invoke('db:updateContact', id, updates),
    deleteContact: (id) => ipcRenderer.invoke('db:deleteContact', id),
    searchContacts: (query) => ipcRenderer.invoke('db:searchContacts', query),

    // Case-Contact Relationships (Phase 1B)
    addContactToCase: (caseContactData) => ipcRenderer.invoke('db:addContactToCase', caseContactData),
    getCaseContacts: (caseId) => ipcRenderer.invoke('db:getCaseContacts', caseId),
    updateCaseContact: (id, updates) => ipcRenderer.invoke('db:updateCaseContact', id, updates),
    removeCaseContactRelationship: (id) => ipcRenderer.invoke('db:removeCaseContactRelationship', id),

    // Utility
    deleteCase: (id) => ipcRenderer.invoke('db:deleteCase', id),
    generateCaseDisplayName: (caseId) => ipcRenderer.invoke('db:generateCaseDisplayName', caseId)
  }
});
