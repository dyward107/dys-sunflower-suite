// TASK STORE - MODULE B
// Dy's Sunflower Suite v5.0
// Zustand store for task management with localStorage persistence

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Task, TaskInput, TaskFilters, TimeEntry, TimeEntryInput,
  TaskGroup, TaskGroupInput, CalendarEvent, CalendarEventInput
} from '../types/ModuleB';

// Simple IPC helper - sql.js is pure JavaScript, no native bindings needed
const callIPC = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (typeof window === 'undefined' || !window.electron?.db) {
    throw new Error('Electron IPC not available. Please run the app using: npm start');
  }
  return await fn();
};

interface TimerState {
  activeTimerId: string | null;
  timerStartTime: number | null;
  timerPausedAt: number | null;
  timerElapsedBeforePause: number;
}

interface TaskStore {
  // State
  tasks: Task[];
  selectedTask: Task | null;
  timeEntries: TimeEntry[];
  taskGroups: TaskGroup[];
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;

  // Timer State
  activeTimerId: string | null;
  timerStartTime: number | null;
  timerPausedAt: number | null;
  timerElapsedBeforePause: number;

  // Task Actions
  loadTasks: (caseId?: number, filters?: TaskFilters) => Promise<void>;
  loadTaskById: (id: string) => Promise<Task | undefined>;
  createTask: (taskData: TaskInput) => Promise<string>;
  updateTask: (id: string, updates: Partial<TaskInput>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (task: Task | null) => void;
  clearSelectedTask: () => void;

  // Timer Actions
  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => Promise<void>;
  getElapsedTime: () => number;

  // Time Entry Actions
  createTimeEntry: (entryData: TimeEntryInput) => Promise<string>;
  loadTimeEntries: (taskId: string) => Promise<void>;
  updateTimeEntry: (id: string, updates: Partial<TimeEntryInput>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;

  // Task Group Actions
  loadTaskGroups: (caseId: number) => Promise<void>;
  createTaskGroup: (groupData: TaskGroupInput) => Promise<string>;

  // Calendar Event Actions
  createCalendarEvent: (eventData: CalendarEventInput) => Promise<string>;
  loadCalendarEvents: (taskId?: string, caseId?: number) => Promise<void>;

  // Utility Actions
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      selectedTask: null,
      timeEntries: [],
      taskGroups: [],
      calendarEvents: [],
      isLoading: false,
      error: null,

      // Timer Initial State
      activeTimerId: null,
      timerStartTime: null,
      timerPausedAt: null,
      timerElapsedBeforePause: 0,

      // Task Actions
      loadTasks: async (caseId?: number, filters?: TaskFilters) => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await callIPC(() => window.electron.db.getTasks(caseId, filters));
          set({ tasks, isLoading: false });
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to load tasks';
          set({ error: errorMessage, isLoading: false });
        }
      },

      loadTaskById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const task = await callIPC(() => window.electron.db.getTaskById(id));
          if (task) {
            set({ selectedTask: task });
            
            // Also update the task in the tasks array if it exists
            const currentTasks = get().tasks;
            const taskIndex = currentTasks.findIndex(t => t.id === id);
            if (taskIndex !== -1) {
              const updatedTasks = [...currentTasks];
              updatedTasks[taskIndex] = task;
              set({ tasks: updatedTasks });
            }
            
            await get().loadTimeEntries(id);
          }
          set({ isLoading: false });
          return task;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createTask: async (taskData: TaskInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.createTask(taskData));
          await get().loadTasks(taskData.case_id);
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateTask: async (id: string, updates: Partial<TaskInput>) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.updateTask(id, updates));
          
          // Reload tasks
          const currentTask = get().tasks.find(t => t.id === id);
          if (currentTask) {
            await get().loadTasks(currentTask.case_id);
          }
          
          // Reload selected task if it's the one being updated
          if (get().selectedTask?.id === id) {
            await get().loadTaskById(id);
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      completeTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.completeTask(id));
          
          // Reload tasks
          const currentTask = get().tasks.find(t => t.id === id);
          if (currentTask) {
            await get().loadTasks(currentTask.case_id);
          }
          
          // Reload selected task if it's the one being completed
          if (get().selectedTask?.id === id) {
            await get().loadTaskById(id);
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const currentTask = get().tasks.find(t => t.id === id);
          await callIPC(() => window.electron.db.deleteTask(id));
          
          if (currentTask) {
            await get().loadTasks(currentTask.case_id);
          }
          
          if (get().selectedTask?.id === id) {
            get().clearSelectedTask();
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      selectTask: (task: Task | null) => {
        set({ selectedTask: task });
        if (task) {
          get().loadTimeEntries(task.id);
        }
      },

      clearSelectedTask: () => {
        set({ selectedTask: null, timeEntries: [] });
      },

      // Timer Actions
      startTimer: (taskId: string) => {
        // Stop any existing timer first
        if (get().activeTimerId) {
          get().stopTimer();
        }

        set({
          activeTimerId: taskId,
          timerStartTime: Date.now(),
          timerPausedAt: null,
          timerElapsedBeforePause: 0,
        });
      },

      pauseTimer: () => {
        const { timerStartTime, timerElapsedBeforePause } = get();
        if (!timerStartTime) return;

        const elapsed = Date.now() - timerStartTime + timerElapsedBeforePause;
        set({
          timerPausedAt: Date.now(),
          timerElapsedBeforePause: elapsed,
        });
      },

      resumeTimer: () => {
        set({
          timerStartTime: Date.now(),
          timerPausedAt: null,
        });
      },

      stopTimer: async () => {
        const { activeTimerId, timerStartTime, timerElapsedBeforePause, timerPausedAt } = get();
        
        if (!activeTimerId || !timerStartTime) {
          // Clear timer state even if no active timer
          set({
            activeTimerId: null,
            timerStartTime: null,
            timerPausedAt: null,
            timerElapsedBeforePause: 0,
          });
          return;
        }

        // Calculate total elapsed time
        const endTime = timerPausedAt || Date.now();
        const totalElapsed = endTime - timerStartTime + timerElapsedBeforePause;
        const totalMinutes = totalElapsed / (1000 * 60); // Convert to minutes (decimal)
        
        // Round to nearest 0.1 hour (6-minute increments) for legal billing
        // 0.1 hour = 6 minutes, so round up to nearest 6-minute block
        const tenthHourBlocks = Math.ceil(totalMinutes / 6); // Round UP to nearest 0.1 hour
        const roundedMinutes = tenthHourBlocks * 6; // Convert back to minutes
        
        // Only create time entry if there's any time (even 1 second rounds to 0.1 hour)
        if (roundedMinutes > 0) {
          try {
            const startDate = new Date(timerStartTime);
            const stopDate = new Date(endTime);
            
            const timeEntryData: TimeEntryInput = {
              task_id: activeTimerId,
              description: 'Timer session',
              start_time: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
              stop_time: `${stopDate.getHours().toString().padStart(2, '0')}:${stopDate.getMinutes().toString().padStart(2, '0')}`,
              duration_minutes: roundedMinutes,
              entry_date: startDate.toISOString().split('T')[0],
              is_billable: true,
            };
            
            // Create the time entry automatically
            await get().createTimeEntry(timeEntryData);
            console.log(`✅ Auto-saved timer session: ${(roundedMinutes / 60).toFixed(1)} hours (rounded to 0.1 hour increments)`);
          } catch (error) {
            console.error('❌ Failed to auto-save timer session:', error);
          }
        }

        // Clear timer state
        set({
          activeTimerId: null,
          timerStartTime: null,
          timerPausedAt: null,
          timerElapsedBeforePause: 0,
        });
      },

      getElapsedTime: () => {
        const { timerStartTime, timerPausedAt, timerElapsedBeforePause } = get();
        
        if (!timerStartTime) return 0;
        
        if (timerPausedAt) {
          return timerElapsedBeforePause;
        }
        
        return Date.now() - timerStartTime + timerElapsedBeforePause;
      },

      // Time Entry Actions
      createTimeEntry: async (entryData: TimeEntryInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.createTimeEntry(entryData));
          await get().loadTimeEntries(entryData.task_id);
          
          // Reload task to update actual_hours
          await get().loadTaskById(entryData.task_id);
          
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadTimeEntries: async (taskId: string) => {
        try {
          const timeEntries = await callIPC(() => window.electron.db.getTimeEntries(taskId));
          set({ timeEntries });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      updateTimeEntry: async (id: string, updates: Partial<TimeEntryInput>) => {
        set({ isLoading: true, error: null });
        try {
          await callIPC(() => window.electron.db.updateTimeEntry(id, updates));
          
          const currentEntry = get().timeEntries.find(e => e.id === id);
          if (currentEntry) {
            await get().loadTimeEntries(currentEntry.task_id);
            await get().loadTaskById(currentEntry.task_id);
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      deleteTimeEntry: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const currentEntry = get().timeEntries.find(e => e.id === id);
          await callIPC(() => window.electron.db.deleteTimeEntry(id));
          
          if (currentEntry) {
            await get().loadTimeEntries(currentEntry.task_id);
            await get().loadTaskById(currentEntry.task_id);
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Task Group Actions
      loadTaskGroups: async (caseId: number) => {
        set({ isLoading: true, error: null });
        try {
          const taskGroups = await callIPC(() => window.electron.db.getTaskGroups(caseId));
          set({ taskGroups, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      createTaskGroup: async (groupData: TaskGroupInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.createTaskGroup(groupData));
          await get().loadTaskGroups(groupData.case_id);
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Calendar Event Actions
      createCalendarEvent: async (eventData: CalendarEventInput) => {
        set({ isLoading: true, error: null });
        try {
          const id = await callIPC(() => window.electron.db.createCalendarEvent(eventData));
          if (eventData.task_id) {
            await get().loadCalendarEvents(eventData.task_id);
          }
          set({ isLoading: false });
          return id;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loadCalendarEvents: async (taskId?: string, caseId?: number) => {
        try {
          const calendarEvents = await callIPC(() => window.electron.db.getCalendarEvents(taskId, caseId));
          set({ calendarEvents });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      // Utility Actions
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'task-store',
      partialize: (state) => ({
        // Only persist selected task ID and timer state
        selectedTaskId: state.selectedTask?.id,
        activeTimerId: state.activeTimerId,
        timerStartTime: state.timerStartTime,
        timerPausedAt: state.timerPausedAt,
        timerElapsedBeforePause: state.timerElapsedBeforePause,
      }),
    }
  )
);

