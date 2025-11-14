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

    // Disposition Management (Phase 1C)  
    createDisposition: (dispositionData) => ipcRenderer.invoke('db:createDisposition', dispositionData),
    getDisposition: (caseId) => ipcRenderer.invoke('db:getDisposition', caseId),
    updateDisposition: (id, updates) => ipcRenderer.invoke('db:updateDisposition', id, updates),
    deleteDisposition: (id) => ipcRenderer.invoke('db:deleteDisposition', id),
    getCaseDispositions: (caseId) => ipcRenderer.invoke('db:getCaseDispositions', caseId),

    // Document Management (Phase 1D)
    createDocument: (documentData) => ipcRenderer.invoke('db:createDocument', documentData),
    getDocumentById: (id) => ipcRenderer.invoke('db:getDocumentById', id),
    getDocumentsForCase: (caseId) => ipcRenderer.invoke('db:getDocumentsForCase', caseId),
    updateDocument: (id, updates) => ipcRenderer.invoke('db:updateDocument', id, updates),
    deleteDocument: (id) => ipcRenderer.invoke('db:deleteDocument', id),

    // Party-Document Linking (Phase 1D)
    linkDocumentToParty: (partyId, documentId, relevanceNotes, isPrimarySubject) => ipcRenderer.invoke('db:linkDocumentToParty', partyId, documentId, relevanceNotes, isPrimarySubject),
    unlinkDocumentFromParty: (partyId, documentId) => ipcRenderer.invoke('db:unlinkDocumentFromParty', partyId, documentId),
    getDocumentsForParty: (partyId) => ipcRenderer.invoke('db:getDocumentsForParty', partyId),
    getPartiesForDocument: (documentId) => ipcRenderer.invoke('db:getPartiesForDocument', documentId),

    // Policy-Document Linking (Phase 1D)
    linkDocumentToPolicy: (policyId, documentId, policyDocType) => ipcRenderer.invoke('db:linkDocumentToPolicy', policyId, documentId, policyDocType),
    unlinkDocumentFromPolicy: (policyId, documentId) => ipcRenderer.invoke('db:unlinkDocumentFromPolicy', policyId, documentId),
    getDocumentsForPolicy: (policyId) => ipcRenderer.invoke('db:getDocumentsForPolicy', policyId),

    // Enhanced Party Methods (Phase 1D)
    updatePartyExtended: (id, updates) => ipcRenderer.invoke('db:updatePartyExtended', id, updates),
    getPartyWithDocuments: (partyId) => ipcRenderer.invoke('db:getPartyWithDocuments', partyId),

    // Helper Methods (Phase 1D)
    getDocumentStats: (caseId) => ipcRenderer.invoke('db:getDocumentStats', caseId),

    // Utility
    deleteCase: (id) => ipcRenderer.invoke('db:deleteCase', id),
    generateCaseDisplayName: (caseId) => ipcRenderer.invoke('db:generateCaseDisplayName', caseId),

    // ============================================================================
    // MODULE B: TASK & WORKFLOW MANAGER
    // ============================================================================

    // Tasks
    getTasks: (caseId, filters) => ipcRenderer.invoke('db:getTasks', caseId, filters),
    getTaskById: (id) => ipcRenderer.invoke('db:getTaskById', id),
    createTask: (taskData) => ipcRenderer.invoke('db:createTask', taskData),
    updateTask: (id, updates) => ipcRenderer.invoke('db:updateTask', id, updates),
    completeTask: (id) => ipcRenderer.invoke('db:completeTask', id),
    deleteTask: (id) => ipcRenderer.invoke('db:deleteTask', id),

    // Time Entries
    createTimeEntry: (entryData) => ipcRenderer.invoke('db:createTimeEntry', entryData),
    getTimeEntries: (taskId) => ipcRenderer.invoke('db:getTimeEntries', taskId),
    updateTimeEntry: (id, updates) => ipcRenderer.invoke('db:updateTimeEntry', id, updates),
    deleteTimeEntry: (id) => ipcRenderer.invoke('db:deleteTimeEntry', id),

    // Task Groups
    getTaskGroups: (caseId) => ipcRenderer.invoke('db:getTaskGroups', caseId),
    createTaskGroup: (groupData) => ipcRenderer.invoke('db:createTaskGroup', groupData),

    // Calendar Events
    createCalendarEvent: (eventData) => ipcRenderer.invoke('db:createCalendarEvent', eventData),
    getCalendarEvents: (taskId, caseId) => ipcRenderer.invoke('db:getCalendarEvents', taskId, caseId)
  }
});
