// ELECTRON API TYPE DEFINITIONS
// Dy's Sunflower Suite v5.0 - Phases 1A & 1B

import { 
  Case, CaseInput, CaseFilters, Party, PartyInput, Policy, PolicyInput,
  Contact, ContactInput, ContactFilters, CaseContact, CaseContactInput
} from './ModuleA';

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

    // Utility
    deleteCase: (id: number) => Promise<boolean>;
    generateCaseDisplayName: (caseId: number) => Promise<string>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
