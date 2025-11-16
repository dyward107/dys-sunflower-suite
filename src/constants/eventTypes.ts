// =====================================================
// EVENT TYPE REGISTRY WITH AUTOMATION MAPPINGS
// =====================================================
// Phase 3: Calendar Infrastructure + Event Triggers
// Defines event types and their associated automation cadences

export interface EventTypeDefinition {
  id: string;
  label: string;
  category: 'pleading' | 'discovery' | 'court' | 'settlement' | 'client' | 'deadline' | 'general';
  description: string;
  automationId?: string; // Links to cadence in rules/cadences.json
  automationDescription?: string; // Human-readable preview
  isJurisdictional: boolean; // Does this event have jurisdictional deadlines?
  defaultReminderDays: number[]; // Default reminder schedule
}

export const EVENT_TYPES: EventTypeDefinition[] = [
  // PLEADINGS CATEGORY
  {
    id: 'answer_filed',
    label: 'Answer Filed',
    category: 'pleading',
    description: 'Defendant filed an Answer to the Complaint',
    automationId: 'AUTO-002', // Answer and Initial Pleadings cadence
    automationDescription: 'Creates 13 tasks: discovery planning, propound discovery, client communications, etc.',
    isJurisdictional: true,
    defaultReminderDays: [30, 14, 7, 3, 1]
  },
  {
    id: 'complaint_filed',
    label: 'Complaint Filed',
    category: 'pleading',
    description: 'Plaintiff filed the initial Complaint',
    automationId: 'AUTO-001', // Case Intake cadence
    automationDescription: 'Creates 15 tasks: serve defendant, file certificate of service, calendar answer deadline, etc.',
    isJurisdictional: true,
    defaultReminderDays: [30, 14, 7, 3, 1]
  },
  {
    id: 'motion_filed',
    label: 'Motion Filed',
    category: 'pleading',
    description: 'A motion was filed by any party',
    isJurisdictional: false,
    defaultReminderDays: [14, 7, 3, 1]
  },

  // DISCOVERY CATEGORY
  {
    id: 'discovery_sent',
    label: 'Discovery Sent',
    category: 'discovery',
    description: 'Discovery requests sent to opposing party',
    automationId: 'AUTO-003', // Discovery Response Tracking
    automationDescription: 'Creates 8 tasks: calendar response deadline, follow up, meet and confer, etc.',
    isJurisdictional: true,
    defaultReminderDays: [30, 14, 7, 3, 1]
  },
  {
    id: 'discovery_received',
    label: 'Discovery Received',
    category: 'discovery',
    description: 'Discovery requests received from opposing party',
    automationId: 'AUTO-004', // Discovery Response Preparation
    automationDescription: 'Creates 12 tasks: review requests, gather documents, prepare responses, etc.',
    isJurisdictional: true,
    defaultReminderDays: [30, 21, 14, 7, 3, 1]
  },
  {
    id: 'discovery_responses_received',
    label: 'Discovery Responses Received',
    category: 'discovery',
    description: 'Opposing party provided discovery responses',
    isJurisdictional: false,
    defaultReminderDays: [14, 7, 3]
  },

  // COURT CATEGORY
  {
    id: 'deposition_scheduled',
    label: 'Deposition Scheduled',
    category: 'court',
    description: 'Deposition date set for witness',
    automationId: 'AUTO-005', // Deposition Preparation
    automationDescription: 'Creates 10 tasks: prepare outline, coordinate court reporter, subpoena documents, etc.',
    isJurisdictional: false,
    defaultReminderDays: [30, 14, 7, 3, 1]
  },
  {
    id: 'court_appearance',
    label: 'Court Appearance',
    category: 'court',
    description: 'Scheduled court hearing or appearance',
    isJurisdictional: true,
    defaultReminderDays: [14, 7, 3, 1]
  },
  {
    id: 'trial_date_set',
    label: 'Trial Date Set',
    category: 'court',
    description: 'Trial date scheduled by the court',
    automationId: 'AUTO-006', // Trial Preparation
    automationDescription: 'Creates 25+ tasks: witness prep, exhibit preparation, jury instructions, etc.',
    isJurisdictional: true,
    defaultReminderDays: [90, 60, 30, 14, 7, 3, 1]
  },

  // SETTLEMENT CATEGORY
  {
    id: 'mediation_scheduled',
    label: 'Mediation Scheduled',
    category: 'settlement',
    description: 'Mediation session scheduled with mediator',
    automationId: 'AUTO-007', // Mediation Preparation
    automationDescription: 'Creates 12 tasks: prepare mediation statement, organize exhibits, client prep, etc.',
    isJurisdictional: false,
    defaultReminderDays: [30, 14, 7, 3, 1]
  },
  {
    id: 'settlement_demand_received',
    label: 'Settlement Demand Received',
    category: 'settlement',
    description: 'Opposing party made settlement demand',
    isJurisdictional: false,
    defaultReminderDays: [14, 7, 3]
  },
  {
    id: 'settlement_reached',
    label: 'Settlement Reached',
    category: 'settlement',
    description: 'Parties agreed to settlement terms',
    automationId: 'AUTO-008', // Settlement Documentation
    automationDescription: 'Creates 8 tasks: draft settlement agreement, obtain releases, file dismissal, etc.',
    isJurisdictional: false,
    defaultReminderDays: [30, 14, 7, 3]
  },

  // CLIENT CATEGORY
  {
    id: 'client_meeting',
    label: 'Client Meeting',
    category: 'client',
    description: 'Scheduled meeting with client',
    isJurisdictional: false,
    defaultReminderDays: [7, 3, 1]
  },
  {
    id: 'expert_report_received',
    label: 'Expert Report Received',
    category: 'client',
    description: 'Received expert witness report',
    isJurisdictional: false,
    defaultReminderDays: [14, 7, 3]
  },
  {
    id: 'medical_records_received',
    label: 'Medical Records Received',
    category: 'client',
    description: 'Received medical records from provider',
    isJurisdictional: false,
    defaultReminderDays: [7, 3]
  },

  // DEADLINE CATEGORY
  {
    id: 'jurisdictional_deadline',
    label: 'Jurisdictional Deadline',
    category: 'deadline',
    description: 'Court-imposed deadline with jurisdictional consequences',
    isJurisdictional: true,
    defaultReminderDays: [30, 14, 7, 3, 1]
  },
  {
    id: 'internal_deadline',
    label: 'Internal Deadline',
    category: 'deadline',
    description: 'Firm-imposed deadline for internal tracking',
    isJurisdictional: false,
    defaultReminderDays: [7, 3, 1]
  },

  // GENERAL CATEGORY
  {
    id: 'general_event',
    label: 'General Event',
    category: 'general',
    description: 'Other case-related event not covered above',
    isJurisdictional: false,
    defaultReminderDays: [7, 3, 1]
  }
];

// Helper functions for working with event types
export const getEventTypeById = (id: string): EventTypeDefinition | undefined => {
  return EVENT_TYPES.find(type => type.id === id);
};

export const getEventTypesByCategory = (category: EventTypeDefinition['category']): EventTypeDefinition[] => {
  return EVENT_TYPES.filter(type => type.category === category);
};

export const getAutomatedEventTypes = (): EventTypeDefinition[] => {
  return EVENT_TYPES.filter(type => type.automationId);
};

export const getNonAutomatedEventTypes = (): EventTypeDefinition[] => {
  return EVENT_TYPES.filter(type => !type.automationId);
};

// Event categories for UI organization
export const EVENT_CATEGORIES = [
  { id: 'pleading', label: 'Pleadings', color: '#3B82F6' },
  { id: 'discovery', label: 'Discovery', color: '#8B5CF6' },
  { id: 'court', label: 'Court', color: '#EF4444' },
  { id: 'settlement', label: 'Settlement', color: '#10B981' },
  { id: 'client', label: 'Client', color: '#F59E0B' },
  { id: 'deadline', label: 'Deadlines', color: '#EC4899' },
  { id: 'general', label: 'General', color: '#6B7280' }
] as const;
