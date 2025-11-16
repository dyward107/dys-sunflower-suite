-- =====================================================
-- MODULE C: CALENDAR & DEADLINES SCHEMA
-- =====================================================
-- Phase 3: Calendar Infrastructure + Event Triggers
-- Supports: Event creation, automation triggers, ICS export

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
    case_id INTEGER NOT NULL,
    task_id TEXT,
    correspondence_id INTEGER, -- Nullable reference to correspondence_log
    deadline_id TEXT,
    
    -- Event details
    event_type TEXT NOT NULL, -- 'answer_filed', 'mediation_scheduled', 'discovery_sent', etc.
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    all_day INTEGER DEFAULT 1,
    location TEXT,
    
    -- Module B Compatibility Fields (for CalendarEventModal.tsx)
    start_time TIME, -- Module B used separate start/end times (maps to/from event_time)
    end_time TIME,   -- Module B used separate start/end times
    calendar_type TEXT CHECK(calendar_type IN ('outlook', 'ics', 'both')), -- Module B export preferences
    ics_file_path TEXT, -- Module B file tracking for .ics exports
    reminders TEXT, -- Module B reminders format (different from reminder_days)
    
    -- Automation triggers
    trigger_automation INTEGER DEFAULT 0, -- Should this trigger automation?
    automation_triggered INTEGER DEFAULT 0, -- Was automation executed?
    automation_id TEXT, -- Which automation was triggered (e.g., 'AUTO-002')
    automation_log_id TEXT, -- Link to automation_log entry (when available)
    
    -- Reminders
    reminder_days TEXT, -- JSON array [30, 14, 7, 3, 1]
    
    -- Metadata  
    is_jurisdictional INTEGER DEFAULT 0,
    outlook_event_id TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (correspondence_id) REFERENCES correspondence_log(id) -- Nullable FK is fine
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_correspondence_id ON calendar_events(correspondence_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_calendar_type ON calendar_events(calendar_type); -- Module B compatibility

-- Add calendar_event_id to tasks table (optional linkage)
-- This allows tasks to reference the calendar event they created
-- Note: Will be handled by migration in DatabaseService if column doesn't exist

-- Add calendar_event_id to correspondence_log table (optional linkage)  
-- This allows correspondence to reference the calendar event it created
-- Note: Will be handled by migration in DatabaseService if column doesn't exist

-- Sample event types for reference (actual registry in TypeScript)
-- answer_filed, discovery_sent, discovery_received, deposition_scheduled,
-- mediation_scheduled, trial_date_set, settlement_reached, expert_report_received,
-- medical_records_received, meet_and_confer_scheduled, settlement_demand_received,
-- court_appearance, client_meeting, deadline, general_event
