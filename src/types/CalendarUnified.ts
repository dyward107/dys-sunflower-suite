// =====================================================
// UNIFIED CALENDAR TYPES - BRIDGE MODULE B & MODULE C
// =====================================================
// This file provides compatibility between the old Module B calendar system
// and the new Module C calendar system after schema consolidation

import type { CalendarEvent as ModuleBEvent, CalendarEventInput as ModuleBInput } from './ModuleB';
import type { CalendarEvent as ModuleCEvent, CalendarEventInput as ModuleCInput } from './ModuleC';

// ============================================================================
// UNIFIED INTERFACES (Supports both Module B and Module C fields)
// ============================================================================

export interface UnifiedCalendarEvent {
  // Core fields (common to both modules)
  id: string;
  case_id: number;
  task_id?: string;
  title: string;
  description?: string;
  event_date: string;
  all_day: boolean;
  location?: string;
  outlook_event_id?: string;
  created_at: string;
  updated_at: string;
  
  // Module C fields (new automation system)
  correspondence_id?: number;
  deadline_id?: string;
  event_type: string; // Can be Module B values ('manual', 'auto') or Module C values ('answer_filed', etc.)
  event_time?: string;
  trigger_automation?: boolean;
  automation_triggered?: boolean;
  automation_id?: string;
  automation_log_id?: string;
  reminder_days?: number[];
  is_jurisdictional?: boolean;
  created_by?: string;
  
  // Module B fields (legacy compatibility)
  start_time?: string;
  end_time?: string;
  calendar_type?: 'outlook' | 'ics' | 'both';
  ics_file_path?: string;
  reminders?: number[]; // Different format from reminder_days
  
  // Joined fields from cases table
  case_name?: string;
  cm_number?: string;
}

export interface UnifiedCalendarEventInput {
  // Required fields
  case_id: number;
  title: string;
  event_date: string;
  event_type: string;
  
  // Optional core fields
  task_id?: string;
  description?: string;
  all_day?: boolean;
  location?: string;
  
  // Module C fields (optional)
  correspondence_id?: number;
  deadline_id?: string;
  event_time?: string;
  trigger_automation?: boolean;
  automation_id?: string;
  reminder_days?: number[];
  is_jurisdictional?: boolean;
  created_by?: string;
  
  // Module B fields (optional)
  start_time?: string;
  end_time?: string;
  calendar_type?: 'outlook' | 'ics' | 'both';
  ics_file_path?: string;
  reminders?: number[];
  
  // External integration
  outlook_event_id?: string;
}

// ============================================================================
// FIELD MAPPING UTILITIES
// ============================================================================

export const MODULE_B_EVENT_TYPES = {
  'manual': 'general_event',
  'auto': 'automated_event'
} as const;

export const MODULE_C_TO_B_EVENT_TYPES = {
  'general_event': 'manual',
  'automated_event': 'auto',
  'answer_filed': 'manual',
  'discovery_sent': 'manual',
  'discovery_received': 'manual',
  'deposition_scheduled': 'manual',
  'mediation_scheduled': 'manual',
  'trial_date_set': 'manual',
  'settlement_reached': 'manual',
  'expert_report_received': 'manual',
  'medical_records_received': 'manual',
  'meet_and_confer_scheduled': 'manual',
  'settlement_demand_received': 'manual',
  'court_appearance': 'manual',
  'client_meeting': 'manual',
  'deadline': 'manual'
} as const;

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Converts Module B time format to Module C format
 */
export const convertStartEndToEventTime = (start_time?: string, end_time?: string): string | undefined => {
  // Use start_time as primary event_time (Module C uses single time field)
  return start_time;
};

/**
 * Converts Module C time format to Module B format
 */
export const convertEventTimeToStartEnd = (event_time?: string, duration = '01:00'): { start_time?: string; end_time?: string } => {
  if (!event_time) return { start_time: undefined, end_time: undefined };
  
  // Calculate end_time by adding duration
  const [hours, minutes] = event_time.split(':').map(Number);
  const [durationHours, durationMinutes] = duration.split(':').map(Number);
  
  const endHours = hours + durationHours;
  const endMinutes = minutes + durationMinutes;
  
  const end_time = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  
  return {
    start_time: event_time,
    end_time
  };
};

/**
 * Converts Module B reminders (minutes before event) to Module C reminder_days
 */
export const convertRemindersToReminderDays = (reminders?: number[]): number[] | undefined => {
  if (!reminders) return undefined;
  
  // Module B uses minutes, Module C uses days
  // Convert common legal reminder patterns
  const dayReminders: number[] = [];
  
  reminders.forEach(minutes => {
    if (minutes >= 1440) { // 1 day or more
      dayReminders.push(Math.floor(minutes / 1440));
    } else if (minutes >= 60) { // 1 hour or more, treat as same day
      dayReminders.push(1);
    }
  });
  
  // Add default legal reminder pattern if empty
  return dayReminders.length > 0 ? [...new Set(dayReminders)].sort((a, b) => b - a) : [1, 3, 7];
};

/**
 * Converts Module C reminder_days to Module B reminders (minutes)
 */
export const convertReminderDaysToReminders = (reminder_days?: number[]): number[] | undefined => {
  if (!reminder_days) return undefined;
  
  // Convert days to minutes (days * 24 * 60)
  return reminder_days.map(days => days * 1440);
};

/**
 * Maps Module B event input to unified format
 */
export const mapModuleBToUnified = (input: Partial<ModuleBInput>): Partial<UnifiedCalendarEventInput> => {
  return {
    ...input,
    // Map event_type from Module B to Module C format
    event_type: input.event_type && MODULE_B_EVENT_TYPES[input.event_type as keyof typeof MODULE_B_EVENT_TYPES] || input.event_type || 'general_event',
    // Map time fields
    event_time: convertStartEndToEventTime(input.start_time, input.end_time),
    // Map reminders
    reminder_days: convertRemindersToReminderDays(input.reminders),
    // Set defaults for Module C fields
    trigger_automation: false,
    is_jurisdictional: false
  };
};

/**
 * Maps Module C event input to unified format (pass-through with Module B compatibility)
 */
export const mapModuleCToUnified = (input: Partial<ModuleCInput>): Partial<UnifiedCalendarEventInput> => {
  const startEnd = convertEventTimeToStartEnd(input.event_time);
  
  return {
    ...input,
    // Add Module B compatibility fields
    ...startEnd,
    reminders: convertReminderDaysToReminders(input.reminder_days),
    calendar_type: 'ics' // Default export preference
  };
};

/**
 * Maps unified event to Module B format for legacy components
 */
export const mapUnifiedToModuleB = (unified: UnifiedCalendarEvent): ModuleBEvent => {
  const startEnd = convertEventTimeToStartEnd(unified.event_time);
  
  return {
    id: unified.id,
    task_id: unified.task_id || null,
    case_id: unified.case_id,
    title: unified.title,
    description: unified.description || null,
    event_date: unified.event_date,
    all_day: unified.all_day,
    start_time: unified.start_time || startEnd.start_time || null,
    end_time: unified.end_time || startEnd.end_time || null,
    location: unified.location || null,
    reminders: unified.reminders || convertReminderDaysToReminders(unified.reminder_days) || null,
    calendar_type: unified.calendar_type || 'ics',
    outlook_event_id: unified.outlook_event_id || null,
    ics_file_path: unified.ics_file_path || null,
    event_type: (unified.event_type && MODULE_C_TO_B_EVENT_TYPES[unified.event_type as keyof typeof MODULE_C_TO_B_EVENT_TYPES]) || 'manual',
    created_at: unified.created_at,
    updated_at: unified.updated_at
  } as ModuleBEvent;
};

/**
 * Maps unified event to Module C format for new components
 */
export const mapUnifiedToModuleC = (unified: UnifiedCalendarEvent): ModuleCEvent => {
  return {
    id: unified.id,
    case_id: unified.case_id,
    task_id: unified.task_id,
    correspondence_id: unified.correspondence_id,
    deadline_id: unified.deadline_id,
    event_type: unified.event_type,
    title: unified.title,
    description: unified.description,
    event_date: unified.event_date,
    event_time: unified.event_time || unified.start_time,
    all_day: unified.all_day,
    location: unified.location,
    trigger_automation: unified.trigger_automation || false,
    automation_triggered: unified.automation_triggered || false,
    automation_id: unified.automation_id,
    automation_log_id: unified.automation_log_id,
    reminder_days: unified.reminder_days || convertRemindersToReminderDays(unified.reminders),
    is_jurisdictional: unified.is_jurisdictional || false,
    outlook_event_id: unified.outlook_event_id,
    created_by: unified.created_by,
    created_at: unified.created_at,
    updated_at: unified.updated_at,
    case_name: unified.case_name,
    cm_number: unified.cm_number
  } as ModuleCEvent;
};
