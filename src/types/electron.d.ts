// ELECTRON API TYPE DEFINITIONS
// Dy's Sunflower Suite v5.0 - Unified Module A + Module B

import { 
  Case, CaseInput, CaseFilters, Party, PartyInput, Policy, PolicyInput,
  Contact, ContactInput, ContactFilters, CaseContact, CaseContactInput,
  Disposition, DispositionInput
} from './ModuleA';

import {
  CasePerson, CasePersonInput, PersonType, GlobalContact, GlobalContactInput,
  CorrespondenceEntry, CorrespondenceEntryInput, CorrespondenceMethod, CorrespondenceDirection
} from './ModuleA-Unified';

import {
  Task, TaskInput, TaskFilters, TimeEntry, TimeEntryInput,
  TaskNote, TaskNoteInput, TaskGroup, TaskGroupInput
} from './ModuleB';

import {
  CalendarEvent, CalendarEventInput, CalendarEventFilters,
  ICSExportOptions, OutlookSyncStatus
} from './ModuleC';

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
    // MODULE A (UNIFIED): CASE PERSONS (Parties + Contacts)
    // ============================================================================
    
    createCasePerson: (personData: CasePersonInput) => Promise<number>;
    getCasePersons: (caseId: number) => Promise<CasePerson[]>;
    getCasePersonById: (personId: number) => Promise<CasePerson | null>;
    getCaseParties: (caseId: number, partyRole?: 'plaintiff' | 'defendant') => Promise<CasePerson[]>;
    getInsuredsWeRepresent: (caseId: number) => Promise<CasePerson[]>;
    getCaseContacts: (caseId: number, personType?: PersonType) => Promise<CasePerson[]>;
    updateCasePerson: (personId: number, updates: Partial<CasePersonInput>) => Promise<boolean>;
    deleteCasePerson: (personId: number) => Promise<boolean>;

    // ============================================================================
    // MODULE A (UNIFIED): CORRESPONDENCE
    // ============================================================================
    
    createCorrespondence: (entryData: CorrespondenceEntryInput) => Promise<number>;
    getAllCorrespondence: (filters?: { caseId?: number; personId?: number; dateStart?: string; dateEnd?: string }) => Promise<CorrespondenceEntry[]>;
    getCaseCorrespondence: (caseId: number) => Promise<CorrespondenceEntry[]>;
    getCorrespondenceById: (entryId: number) => Promise<CorrespondenceEntry | null>;
    updateCorrespondence: (entryId: number, updates: Partial<CorrespondenceEntryInput>) => Promise<boolean>;
    deleteCorrespondence: (entryId: number) => Promise<boolean>;

    // ============================================================================
    // MODULE C (PHASE 3): CALENDAR EVENTS
    // ============================================================================
    createCalendarEvent: (eventData: CalendarEventInput) => Promise<string>;
    getCalendarEvents: (filters?: CalendarEventFilters) => Promise<CalendarEvent[]>;
    getCalendarEventById: (eventId: string) => Promise<CalendarEvent | null>;
    updateCalendarEvent: (eventId: string, updates: Partial<CalendarEventInput>) => Promise<boolean>;
    deleteCalendarEvent: (eventId: string) => Promise<boolean>;
    exportCalendarEventsToICS: (options?: ICSExportOptions) => Promise<string>;
    syncCalendarEventToOutlook: (eventId: string) => Promise<boolean>;

    // ============================================================================
    // MODULE A (UNIFIED): GLOBAL CONTACTS
    // ============================================================================
    
    createGlobalContact: (contactData: GlobalContactInput) => Promise<number>;
    getGlobalContacts: (filters?: { contactType?: string; isFavorite?: boolean }) => Promise<GlobalContact[]>;
    getGlobalContactById: (contactId: number) => Promise<GlobalContact | null>;
    updateGlobalContact: (contactId: number, updates: Partial<GlobalContactInput>) => Promise<boolean>;
    deleteGlobalContact: (contactId: number) => Promise<boolean>;
    promoteToGlobalContact: (personId: number) => Promise<number>;

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

    // Task Notes
    createTaskNote: (noteData: TaskNoteInput) => Promise<string>;
    getTaskNotes: (taskId: string) => Promise<TaskNote[]>;
    updateTaskNote: (id: string, updates: Partial<TaskNoteInput>) => Promise<boolean>;
    deleteTaskNote: (id: string) => Promise<boolean>;

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
