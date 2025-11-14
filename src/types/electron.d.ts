// ELECTRON API TYPE DEFINITIONS
// Dy's Sunflower Suite v5.0 - Phases 1A, 1B, 1C & Module B

import { 
  Case, CaseInput, CaseFilters, Party, PartyInput, Policy, PolicyInput,
  Contact, ContactInput, ContactFilters, CaseContact, CaseContactInput,
  Disposition, DispositionInput
} from './ModuleA';

import {
  Task, TaskInput, TaskFilters, TimeEntry, TimeEntryInput,
  TaskGroup, TaskGroupInput, CalendarEvent, CalendarEventInput
} from './ModuleB';

export interface ElectronAPI {
  db: {
    // Cases
    createCase: (caseData: CaseInput) => Promise<number>;
    getCases: (filters?: CaseFilters) => Promise<Case[]>;
    getCaseById: (id: number) => Promise<Case | null>;
    updateCase: (id: number, updates: Partial<CaseInput>) => Promise<boolean>;
    searchCases: (query: string) => Promise<Case[]>;

    // Parties
    addCaseParty: (caseId: number, partyData: PartyInput) => Promise<number>;
    getCaseParties: (caseId: number) => Promise<Party[]>;
    updateParty: (id: number, updates: Partial<PartyInput>) => Promise<boolean>;
    deleteParty: (id: number) => Promise<boolean>;

    // Policies
    addCasePolicy: (caseId: number, policyData: PolicyInput) => Promise<number>;
    getCasePolicies: (caseId: number) => Promise<Policy[]>;
    updatePolicy: (id: number, updates: Partial<PolicyInput>) => Promise<boolean>;
    deletePolicy: (id: number) => Promise<boolean>;

    // Contacts (Phase 1B)
    createContact: (contactData: ContactInput) => Promise<number>;
    getContacts: (filters?: ContactFilters) => Promise<Contact[]>;
    updateContact: (id: number, updates: Partial<ContactInput>) => Promise<boolean>;
    deleteContact: (id: number) => Promise<boolean>;
    searchContacts: (query: string) => Promise<Contact[]>;

  // Case-Contact Relationships (Phase 1B)
  addContactToCase: (caseContactData: CaseContactInput) => Promise<number>;
  getCaseContacts: (caseId: number) => Promise<CaseContact[]>;
  updateCaseContact: (id: number, updates: Partial<CaseContactInput>) => Promise<boolean>;
  removeCaseContactRelationship: (id: number) => Promise<boolean>;

  // Disposition Management (Phase 1C)
  createDisposition: (dispositionData: DispositionInput) => Promise<number>;
  getDisposition: (caseId: number) => Promise<Disposition | null>;
  updateDisposition: (id: number, updates: Partial<DispositionInput>) => Promise<boolean>;
  deleteDisposition: (id: number) => Promise<boolean>;
  getCaseDispositions: (caseId: number) => Promise<Disposition[]>;

  // Document Management (Phase 1D)
  createDocument: (documentData: any) => Promise<number>;
  getDocumentById: (id: number) => Promise<any | null>;
  getDocumentsForCase: (caseId: number) => Promise<any[]>;
  updateDocument: (id: number, updates: any) => Promise<boolean>;
  deleteDocument: (id: number) => Promise<boolean>;

  // Party-Document Linking (Phase 1D)
  linkDocumentToParty: (partyId: number, documentId: number, relevanceNotes?: string, isPrimarySubject?: boolean) => Promise<boolean>;
  unlinkDocumentFromParty: (partyId: number, documentId: number) => Promise<boolean>;
  getDocumentsForParty: (partyId: number) => Promise<any[]>;
  getPartiesForDocument: (documentId: number) => Promise<any[]>;

  // Policy-Document Linking (Phase 1D)
  linkDocumentToPolicy: (policyId: number, documentId: number, policyDocType?: string) => Promise<boolean>;
  unlinkDocumentFromPolicy: (policyId: number, documentId: number) => Promise<boolean>;
  getDocumentsForPolicy: (policyId: number) => Promise<any[]>;

  // Enhanced Party Methods (Phase 1D)
  updatePartyExtended: (id: number, updates: any) => Promise<boolean>;
  getPartyWithDocuments: (partyId: number) => Promise<any | null>;

  // Helper Methods (Phase 1D)
  getDocumentStats: (caseId: number) => Promise<any>;

    // Utility
    deleteCase: (id: number) => Promise<boolean>;
    generateCaseDisplayName: (caseId: number) => Promise<string>;

    // ============================================================================
    // MODULE B: TASK & WORKFLOW MANAGER
    // ============================================================================

    // Tasks
    getTasks: (caseId?: number, filters?: TaskFilters) => Promise<Task[]>;
    getTaskById: (id: string) => Promise<Task | null>;
    createTask: (taskData: TaskInput) => Promise<string>;
    updateTask: (id: string, updates: Partial<TaskInput>) => Promise<boolean>;
    completeTask: (id: string) => Promise<boolean>;
    deleteTask: (id: string) => Promise<boolean>;

    // Time Entries
    createTimeEntry: (entryData: TimeEntryInput) => Promise<string>;
    getTimeEntries: (taskId: string) => Promise<TimeEntry[]>;
    updateTimeEntry: (id: string, updates: Partial<TimeEntryInput>) => Promise<boolean>;
    deleteTimeEntry: (id: string) => Promise<boolean>;

    // Task Groups
    getTaskGroups: (caseId: number) => Promise<TaskGroup[]>;
    createTaskGroup: (groupData: TaskGroupInput) => Promise<string>;

    // Calendar Events
    createCalendarEvent: (eventData: CalendarEventInput) => Promise<string>;
    getCalendarEvents: (taskId?: string, caseId?: number) => Promise<CalendarEvent[]>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
