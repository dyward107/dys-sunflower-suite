// MODULE B: TASK & WORKFLOW MANAGER - TYPE DEFINITIONS
// Dy's Sunflower Suite v5.0

// ============================================================================
// TASK TYPES
// ============================================================================

export type TaskPriority = 1 | 2 | 3 | 4;
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  case_id: number;
  task_group_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  phase: string | null;
  assigned_to: string | null;
  due_date: string | null;
  completed_date: string | null;
  is_billable: boolean;
  estimated_hours: number | null;
  actual_hours: number | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  case_id: number;
  task_group_id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  phase?: string;
  assigned_to?: string;
  due_date?: string;
  completed_date?: string;
  is_billable?: boolean;
  estimated_hours?: number;
  actual_hours?: number;
}

export interface TaskFilters {
  case_id?: number;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  phase?: string;
  assigned_to?: string;
  overdue_only?: boolean;
  billable_only?: boolean;
  date_range_start?: string;
  date_range_end?: string;
}

// ============================================================================
// TASK GROUP TYPES (Cadence Instances)
// ============================================================================

export type TaskGroupStatus = 'active' | 'completed' | 'archived';

export interface TaskGroup {
  id: string;
  case_id: number;
  cadence_type: string;
  name: string;
  status: TaskGroupStatus;
  triggered_by: string | null;
  triggered_at: string;
  completed_at: string | null;
}

export interface TaskGroupInput {
  case_id: number;
  cadence_type: string;
  name: string;
  triggered_by?: string;
}

// ============================================================================
// TIME ENTRY TYPES
// ============================================================================

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string | null;
  description: string;
  start_time: string;
  stop_time: string;
  duration_minutes: number;
  entry_date: string;
  rate: number | null;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeEntryInput {
  task_id: string;
  user_id?: string;
  description: string;
  start_time: string;
  stop_time: string;
  duration_minutes: number;
  entry_date: string;
  rate?: number;
  is_billable?: boolean;
}

// ============================================================================
// CALENDAR EVENT TYPES
// ============================================================================

export type CalendarType = 'outlook' | 'ics' | 'both';
export type EventType = 'auto' | 'manual';

export interface CalendarEvent {
  id: string;
  task_id: string | null;
  case_id: number;
  title: string;
  description: string | null;
  event_date: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  reminders: number[] | null; // [30, 14, 7, 3, 1] days before
  calendar_type: CalendarType;
  outlook_event_id: string | null;
  ics_file_path: string | null;
  event_type: EventType;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInput {
  task_id?: string;
  case_id: number;
  title: string;
  description?: string;
  event_date: string;
  all_day?: boolean;
  start_time?: string;
  end_time?: string;
  location?: string;
  reminders?: number[];
  calendar_type: CalendarType;
  event_type?: EventType;
}

// ============================================================================
// AUTOMATION SETTINGS TYPES
// ============================================================================

export interface AutomationSetting {
  id: number;
  automation_code: string;
  is_enabled: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 1, label: 'P1 - Low', color: 'gray' },
  { value: 2, label: 'P2 - Medium', color: 'blue' },
  { value: 3, label: 'P3 - High', color: 'orange' },
  { value: 4, label: 'P4 - Critical', color: 'red' },
];

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const TASK_PHASES = [
  'Discovery',
  'Pleadings',
  'Depositions',
  'Expert Discovery',
  'Mediation',
  'Pre-Trial Motions',
  'Trial',
  'Post-Trial/Appeal',
  'Settlement',
  'Administrative',
] as const;

export const CALENDAR_TYPES: { value: CalendarType; label: string }[] = [
  { value: 'ics', label: '.ICS Export (Universal)' },
  { value: 'outlook', label: 'Outlook Calendar' },
  { value: 'both', label: 'Both' },
];

export const DEFAULT_REMINDERS = [30, 14, 7, 3, 1]; // Days before event

// Lead Attorneys (reference from Module A)
export const LEAD_ATTORNEYS = [
  'Rebecca Strickland',
  'Kelly Chartash',
  'Kori Wagner',
  'Elizabeth Bentley',
  'Bill Casey',
  'Marissa Merrill',
  'Leah Parker',
  'Katy',
] as const;

