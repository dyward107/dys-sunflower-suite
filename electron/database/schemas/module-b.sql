-- MODULE B: TASK & WORKFLOW MANAGER
-- Dy's Sunflower Suite v5.0
-- Database Schema for Tasks, Time Tracking, and Workflow Automation

-- ============================================================================
-- TABLE 1: tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  -- Primary Key
  id TEXT PRIMARY KEY,

  -- Foreign Keys
  case_id INTEGER NOT NULL,
  task_group_id TEXT,

  -- Task Information
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3, 4)),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  phase TEXT,
  assigned_to TEXT,
  tags TEXT,

  -- Dates
  date_assigned DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,

  -- Billing & Time Tracking
  is_billable INTEGER DEFAULT 1,
  estimated_hours REAL,
  actual_hours REAL,

  -- Task Locking (for completed tasks when discovery deadline changes)
  is_locked INTEGER DEFAULT 0,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Key Constraint
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (task_group_id) REFERENCES task_groups(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_task_group_id ON tasks(task_group_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase);

-- ============================================================================
-- TABLE 2: task_groups (Cadence Instances)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_groups (
  -- Primary Key
  id TEXT PRIMARY KEY,

  -- Foreign Key
  case_id INTEGER NOT NULL,

  -- Group Information
  cadence_type TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
  triggered_by TEXT,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  -- Foreign Key Constraint
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_groups_case_id ON task_groups(case_id);
CREATE INDEX IF NOT EXISTS idx_task_groups_status ON task_groups(status);
CREATE INDEX IF NOT EXISTS idx_task_groups_cadence_type ON task_groups(cadence_type);

-- ============================================================================
-- TABLE 3: time_entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS time_entries (
  -- Primary Key
  id TEXT PRIMARY KEY,

  -- Foreign Keys
  task_id TEXT NOT NULL,
  user_id TEXT,

  -- Time Information
  description TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  stop_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  entry_date DATE NOT NULL,

  -- Billing Information
  rate REAL,
  is_billable INTEGER DEFAULT 1,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Key Constraint
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_entry_date ON time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_entries_is_billable ON time_entries(is_billable);

-- ============================================================================
-- TABLE 4: calendar_events
-- ============================================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  -- Primary Key
  id TEXT PRIMARY KEY,

  -- Foreign Keys
  task_id TEXT,
  case_id INTEGER NOT NULL,

  -- Event Information
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  all_day INTEGER DEFAULT 1,
  start_time TIME,
  end_time TIME,
  location TEXT,

  -- Reminders (stored as JSON array: [30, 14, 7, 3, 1])
  reminders TEXT,

  -- Calendar Type
  calendar_type TEXT CHECK(calendar_type IN ('outlook', 'ics', 'both')),

  -- External IDs
  outlook_event_id TEXT,
  ics_file_path TEXT,

  -- Event Type
  event_type TEXT DEFAULT 'manual' CHECK(event_type IN ('auto', 'manual')),

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Key Constraints
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_calendar_type ON calendar_events(calendar_type);

-- ============================================================================
-- TABLE 5: automation_settings (Future: Enable/Disable Automations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS automation_settings (
  -- Primary Key
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Automation Information
  automation_code TEXT NOT NULL UNIQUE,
  is_enabled INTEGER DEFAULT 1,
  user_id TEXT,

  -- Audit Trail
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_automation_settings_code ON automation_settings(automation_code);
CREATE INDEX IF NOT EXISTS idx_automation_settings_enabled ON automation_settings(is_enabled);
