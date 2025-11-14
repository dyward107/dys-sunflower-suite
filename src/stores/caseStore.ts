// CASE STORE - MODULE A (PHASES 1A & 1B)
// Dy's Sunflower Suite v5.0
// Zustand store for case management with localStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Case, CaseInput, CaseFilters, Party, PartyInput, Policy, PolicyInput,
  Contact, ContactInput, ContactFilters, CaseContact, CaseContactInput 
} from '../types/ModuleA';

// Simple IPC helper - sql.js is pure JavaScript, no native bindings needed
// No retry logic required since sql.js initialization is async and doesn't have timing dependencies
const callIPC = async <T>(fn: () => Promise<T>): Promise<T> => {
  // Simple check - sql.js doesn't need retry logic
  if (typeof window === 'undefined' || !window.electron?.db) {
    throw new Error('Electron IPC not available. Please run the app using: npm run electron:dev');
  }
  return await fn();
};

interface CaseStore {
  // State
  cases: Case[];
  selectedCase: Case | null;
  parties: Party[];
  policies: Policy[];
  contacts: Contact[];
  caseContacts: CaseContact[];
  isLoading: boolean;
  error: string | null;

  // Case Actions
  loadCases: (filters?: CaseFilters) => Promise<void>;
  createCase: (caseData: CaseInput) => Promise<number>;
  selectCase: (caseId: number) => Promise<void>;
  updateCase: (id: number, updates: Partial<CaseInput>) => Promise<void>;
  searchCases: (query: string) => Promise<void>;
  clearSelectedCase: () => void;

  // Party Actions
  addCaseParty: (caseId: number, partyData: PartyInput) => Promise<number>;
  loadPartiesForCase: (caseId: number) => Promise<void>;
  updateParty: (id: number, updates: Partial<PartyInput>) => Promise<void>;
  deleteParty: (id: number) => Promise<void>;

  // Policy Actions
  addCasePolicy: (caseId: number, policyData: PolicyInput) => Promise<number>;
  loadPoliciesForCase: (caseId: number) => Promise<void>;
  updatePolicy: (id: number, updates: Partial<PolicyInput>) => Promise<void>;
  deletePolicy: (id: number) => Promise<void>;

  // Contact Actions (Phase 1B)
  createContact: (contactData: ContactInput) => Promise<number>;
  loadContacts: (filters?: ContactFilters) => Promise<void>;
  updateContact: (id: number, updates: Partial<ContactInput>) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  searchContacts: (query: string) => Promise<void>;

  // Case-Contact Relationship Actions (Phase 1B)
  addContactToCase: (caseContactData: CaseContactInput) => Promise<number>;
  loadContactsForCase: (caseId: number) => Promise<void>;
  updateCaseContact: (id: number, updates: Partial<CaseContactInput>) => Promise<void>;
  removeCaseContactRelationship: (id: number) => Promise<void>;

  // Utility Actions
  deleteCase: (id: number) => Promise<void>;
  generateCaseDisplayName: (caseId: number) => Promise<string>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set, get) => ({
      // Initial State
      cases: [],
      selectedCase: null,
      parties: [],
      policies: [],
      contacts: [],
      caseContacts: [],
      isLoading: false,
      error: null,

      // Case Actions
      loadCases: async (filters?: CaseFilters) => {
        set({ isLoading: true, error: null });
        try {
          const cases = await callIPC(() => window.electron.db.getCases(filters));
          set({ cases, isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to load cases';
          set({ error: errorMessage, isLoading: false });
        }
      },

      createCase: async (caseData: CaseInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.createCase(caseData));
          await get().loadCases();
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      selectCase: async (caseId: number) => {
        set({ isLoading: true, error: null });
        try {
          const caseData = await callIPC(() => window.electron.db.getCaseById(caseId));
          if (caseData) {
            set({ selectedCase: caseData });
            await get().loadPartiesForCase(caseId);
            await get().loadPoliciesForCase(caseId);
            await get().loadContactsForCase(caseId);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateCase: async (id: number, updates: Partial<CaseInput>) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.updateCase(id, updates));
          await get().loadCases();
          if (get().selectedCase?.id === id) {
            await get().selectCase(id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      searchCases: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const cases = await callIPC(() => window.electron.db.searchCases(query));
          set({ cases, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      clearSelectedCase: () => {
        set({ selectedCase: null, parties: [], policies: [], caseContacts: [] });
      },

      // Party Actions
      addCaseParty: async (caseId: number, partyData: PartyInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.addCaseParty(caseId, partyData));
          await get().loadPartiesForCase(caseId);
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadPartiesForCase: async (caseId: number) => {
        try {
          const parties = await callIPC(() => window.electron.db.getCaseParties(caseId));
          set({ parties });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      updateParty: async (id: number, updates: Partial<PartyInput>) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.updateParty(id, updates));
          if (get().selectedCase) {
            await get().loadPartiesForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteParty: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.deleteParty(id));
          if (get().selectedCase) {
            await get().loadPartiesForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Policy Actions
      addCasePolicy: async (caseId: number, policyData: PolicyInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.addCasePolicy(caseId, policyData));
          await get().loadPoliciesForCase(caseId);
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadPoliciesForCase: async (caseId: number) => {
        try {
          const policies = await callIPC(() => window.electron.db.getCasePolicies(caseId));
          set({ policies });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      updatePolicy: async (id: number, updates: Partial<PolicyInput>) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.updatePolicy(id, updates));
          if (get().selectedCase) {
            await get().loadPoliciesForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deletePolicy: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.deletePolicy(id));
          if (get().selectedCase) {
            await get().loadPoliciesForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Contact Actions (Phase 1B)
      createContact: async (contactData: ContactInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.createContact(contactData));
          await get().loadContacts();
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadContacts: async (filters?: ContactFilters) => {
        set({ isLoading: true, error: null });
        try {
          const contacts = await callIPC(() => window.electron.db.getContacts(filters));
          set({ contacts, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateContact: async (id: number, updates: Partial<ContactInput>) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.updateContact(id, updates));
          await get().loadContacts();
          // Refresh case contacts if a case is selected and contact is linked to it
          if (get().selectedCase) {
            await get().loadContactsForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteContact: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.deleteContact(id));
          await get().loadContacts();
          // Refresh case contacts if a case is selected
          if (get().selectedCase) {
            await get().loadContactsForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      searchContacts: async (query: string) => {
        set({ isLoading: true, error: null });
        try {
          const contacts = await callIPC(() => window.electron.db.searchContacts(query));
          set({ contacts, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Case-Contact Relationship Actions (Phase 1B)
      addContactToCase: async (caseContactData: CaseContactInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.addContactToCase(caseContactData));
          await get().loadContactsForCase(caseContactData.case_id);
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadContactsForCase: async (caseId: number) => {
        try {
          const caseContacts = await callIPC(() => window.electron.db.getCaseContacts(caseId));
          set({ caseContacts });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      updateCaseContact: async (id: number, updates: Partial<CaseContactInput>) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.updateCaseContact(id, updates));
          if (get().selectedCase) {
            await get().loadContactsForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      removeCaseContactRelationship: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.removeCaseContactRelationship(id));
          if (get().selectedCase) {
            await get().loadContactsForCase(get().selectedCase!.id);
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Utility Actions
      deleteCase: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.deleteCase(id));
          await get().loadCases();
          if (get().selectedCase?.id === id) {
            get().clearSelectedCase();
          }
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      generateCaseDisplayName: async (caseId: number) => {
        try {
          const displayName = await callIPC(() => window.electron.db.generateCaseDisplayName(caseId));
          return displayName;
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'case-store',
      partialize: (state) => ({
        // Only persist selectedCase ID, not full objects
        selectedCaseId: state.selectedCase?.id,
      }),
    }
  )
);
