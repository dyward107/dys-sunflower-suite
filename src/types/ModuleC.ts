// =====================================================
// MODULE C: CALENDAR & DEADLINES TYPE DEFINITIONS
// =====================================================
// Phase 3: Calendar Infrastructure + Event Triggers

// Calendar Event Interfaces
export interface CalendarEvent {
  id: string;
  case_id: number;
  task_id?: string;
  correspondence_id?: number;
  deadline_id?: string;
  
  // Event details
  event_type: string;
  title: string;
  description?: string;
  event_date: string; // ISO date format YYYY-MM-DD
  event_time?: string; // HH:mm:ss format
  all_day: boolean;
  location?: string;
  
  // Automation triggers
  trigger_automation: boolean;
  automation_triggered: boolean;
  automation_id?: string;
  automation_log_id?: string;
  
  // Reminders
  reminder_days?: number[]; // Array of days before event [30, 14, 7, 3, 1]
  
  // Metadata
  is_jurisdictional: boolean;
  outlook_event_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields from cases table
  case_name?: string;
  cm_number?: string;
}

export interface CalendarEventInput {
  case_id: number;
  task_id?: string;
  correspondence_id?: number;
  deadline_id?: string;
  
  // Event details
  event_type: string;
  title: string;
  description?: string;
  event_date: string; // ISO date format YYYY-MM-DD
  event_time?: string; // HH:mm:ss format
  all_day?: boolean; // Defaults to true if not specified
  location?: string;
  
  // Automation triggers
  trigger_automation?: boolean; // Defaults to false
  automation_id?: string;
  
  // Reminders
  reminder_days?: number[];
  
  // Metadata
  is_jurisdictional?: boolean; // Defaults to false
  outlook_event_id?: string;
  created_by?: string;
}

export interface CalendarEventFilters {
  case_id?: number;
  start_date?: string; // ISO date format
  end_date?: string; // ISO date format
  event_type?: string;
  jurisdictional_only?: boolean;
  automation_pending?: boolean; // Events that need automation trigger
}

// Event creation contexts (for different entry points)
export interface EventCreationContext {
  source: 'calendar' | 'task_completion' | 'correspondence' | 'quick_action';
  case_id: number;
  prefilled_data?: Partial<CalendarEventInput>;
}

// Calendar view states
export type CalendarView = 'month' | 'week' | 'day' | 'list';

export interface CalendarViewState {
  view: CalendarView;
  current_date: string; // ISO date format
  selected_date?: string; // ISO date format
}

// Deadline calculation inputs (links to Phase 2 utilities)
export interface DeadlineCalculationInput {
  base_date: string; // ISO date format
  calculation_type: 'answer' | 'discovery_response' | 'discovery_close' | 'custom';
  days?: number; // For custom calculations
  description?: string;
}

export interface DeadlineCalculationResult {
  calculated_date: string; // ISO date format
  calculation_method: string; // Description of how it was calculated
  is_weekend_adjusted: boolean;
  is_holiday_adjusted: boolean;
  business_days_counted: number;
  calendar_days_counted: number;
}

// ICS export options
export interface ICSExportOptions {
  filters?: CalendarEventFilters;
  include_case_info?: boolean;
  include_automation_notes?: boolean;
}

// Outlook sync status
export interface OutlookSyncStatus {
  event_id: string;
  outlook_event_id?: string;
  last_sync_attempt?: string; // ISO datetime
  sync_status: 'pending' | 'synced' | 'failed' | 'disabled';
  error_message?: string;
}
