// TASK LIST - MODULE B
// Dy's Sunflower Suite v5.0
// Main practice-wide task management interface (Tier 1 Navigation)

import React, { useState, useEffect, useMemo } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useCaseStore } from '../../stores/caseStore';
import type { Task, TaskFilters as TaskFilterType, TaskPriority, TaskStatus } from '../../types/ModuleB';
import type { Case } from '../../types/ModuleA';
import { TaskForm } from './TaskForm';
import { TaskDetail } from './TaskDetail';
import { TimeEntryModal } from './TimeEntryModal';
import { CalendarEventModal } from './CalendarEventModal';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_PHASES,
  LEAD_ATTORNEYS,
} from '../../types/ModuleB';
import {
  Play,
  Pause,
  Square,
  Calendar,
  Clock,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Circle,
  MoreHorizontal,
} from 'lucide-react';
import '../../styles/design-system.css';

interface TaskWithCase extends Task {
  case?: Case;
}

export function TaskList() {
  const {
    tasks,
    isLoading,
    error,
    loadTasks,
    updateTask,
    completeTask,
    deleteTask,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    activeTimerId,
    timerPausedAt,
  } = useTaskStore();

  const { cases, loadCases } = useCaseStore();

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilterType>({});
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'case_id' | 'created_at'>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState<string | null>(null);
  const [showTimeEntry, setShowTimeEntry] = useState<string | null>(null);
  const [showCalendarEvent, setShowCalendarEvent] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadTasks(undefined, filters); // Load all tasks across all cases
    loadCases(); // Load cases for reference
  }, [filters]);

  // Listen for custom events to open time entry modal
  useEffect(() => {
    const handleOpenTimeEntry = (event: any) => {
      const { task_id } = event.detail || {};
      if (task_id) {
        setShowTimeEntry(task_id);
      }
    };

    window.addEventListener('open-time-entry-modal', handleOpenTimeEntry);
    return () => window.removeEventListener('open-time-entry-modal', handleOpenTimeEntry);
  }, []);

  // Combine tasks with case information
  const tasksWithCases: TaskWithCase[] = useMemo(() => {
    return tasks.map(task => ({
      ...task,
      case: cases.find(c => c.id === task.case_id),
    }));
  }, [tasks, cases]);

  // Apply filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasksWithCases;

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority!.includes(task.priority));
    }
    if (filters.phase) {
      filtered = filtered.filter(task => task.phase === filters.phase);
    }
    if (filters.assigned_to) {
      filtered = filtered.filter(task => task.assigned_to === filters.assigned_to);
    }
    if (filters.overdue_only) {
      const now = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(task => 
        task.status !== 'completed' && 
        task.due_date && 
        task.due_date < now
      );
    }
    if (filters.billable_only) {
      filtered = filtered.filter(task => task.is_billable);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'due_date':
          aValue = a.due_date || '9999-12-31';
          bValue = b.due_date || '9999-12-31';
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        case 'case_id':
          aValue = a.case?.case_name || '';
          bValue = b.case?.case_name || '';
          break;
        case 'created_at':
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        default:
          aValue = a.due_date || '9999-12-31';
          bValue = b.due_date || '9999-12-31';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasksWithCases, filters, sortBy, sortDirection]);

  // Get priority badge color
  const getPriorityColor = (priority: TaskPriority): string => {
    const priorityConfig = TASK_PRIORITIES.find(p => p.value === priority);
    return priorityConfig?.color || 'gray';
  };

  // Check if task is overdue
  const isTaskOverdue = (task: Task): boolean => {
    if (!task.due_date || task.status === 'completed') return false;
    const now = new Date().toISOString().split('T')[0];
    return task.due_date < now;
  };

  // Get task urgency styling for legal workflow
  const getTaskUrgencyStyle = (task: Task): { bgClass: string; textClass: string } => {
    if (task.status === 'completed') {
      return { bgClass: '', textClass: 'opacity-60' }; // Muted for completed
    }

    if (!task.due_date) {
      return { bgClass: '', textClass: '' };
    }

    const now = new Date();
    const dueDate = new Date(task.due_date);
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      return { bgClass: 'bg-red-50', textClass: '' }; // Overdue - red
    } else if (daysDiff <= 3) {
      return { bgClass: 'bg-orange-50', textClass: '' }; // < 3 days - orange
    } else if (daysDiff <= 7) {
      return { bgClass: 'bg-yellow-50', textClass: '' }; // < 7 days - yellow
    } else if (daysDiff >= 21) {
      return { bgClass: 'bg-green-50', textClass: '' }; // 3+ weeks out - green (low urgency)
    }

    return { bgClass: '', textClass: '' }; // Normal (8-20 days)
  };

  // Handle timer controls
  const handleTimerToggle = (taskId: string) => {
    if (activeTimerId === taskId) {
      if (timerPausedAt) {
        resumeTimer();
      } else {
        pauseTimer();
      }
    } else {
      startTimer(taskId);
    }
  };

  const handleTimerStop = async (taskId: string) => {
    if (activeTimerId === taskId) {
      await stopTimer();
    }
  };

  // Handle inline editing
  const handleFieldUpdate = async (taskId: string, field: keyof Task, value: any) => {
    try {
      await updateTask(taskId, { [field]: value });
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">Error loading tasks: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--spacing-xl)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Header */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-tight)',
        }}>
          Tasks • {filteredAndSortedTasks.length}
        </h1>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
            fontWeight: 500,
            backgroundColor: showFilters ? 'var(--color-blue-gray)' : 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            transition: 'all 0.15s ease',
          }}
        >
          <Filter size={14} />
          Filters
        </button>
        <button
          onClick={() => setShowTaskForm(true)}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-family-primary)',
            fontWeight: 600,
            backgroundColor: 'var(--color-sunflower)',
            color: 'var(--color-brown-primary)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower-dark)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower)'}
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-2 grid grid-cols-4 gap-2">
        <div className="bg-gray-50 rounded-md p-2">
          <div className="text-xs font-medium text-gray-600">Total Tasks</div>
          <div className="text-lg font-bold text-gray-900">{tasks.length}</div>
        </div>
        <div className="bg-yellow-50 rounded-md p-2">
          <div className="text-xs font-medium text-yellow-700">Pending</div>
          <div className="text-lg font-bold text-yellow-900">
            {tasks.filter(t => t.status === 'pending').length}
          </div>
        </div>
        <div className="bg-blue-50 rounded-md p-2">
          <div className="text-xs font-medium text-blue-700">In Progress</div>
          <div className="text-lg font-bold text-blue-900">
            {tasks.filter(t => t.status === 'in-progress').length}
          </div>
        </div>
        <div className="bg-red-50 rounded-md p-2">
          <div className="text-xs font-medium text-red-700">Overdue</div>
          <div className="text-lg font-bold text-red-900">
            {tasks.filter(t => isTaskOverdue(t)).length}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                multiple
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value) as TaskStatus[];
                  setFilters(prev => ({ ...prev, status: values }));
                }}
              >
                {TASK_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                multiple
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filters.priority?.map(String) || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => Number(option.value)) as TaskPriority[];
                  setFilters(prev => ({ ...prev, priority: values }));
                }}
              >
                {TASK_PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lead Attorney Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Attorney</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filters.assigned_to || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, assigned_to: e.target.value || undefined }));
                }}
              >
                <option value="">All Attorneys</option>
                {LEAD_ATTORNEYS.map(attorney => (
                  <option key={attorney} value={attorney}>
                    {attorney}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filters.phase || ''}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, phase: e.target.value || undefined }));
                }}
              >
                <option value="">All Phases</option>
                {TASK_PHASES.map(phase => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Toggles */}
          <div className="mt-4 flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={filters.overdue_only || false}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, overdue_only: e.target.checked }));
                }}
              />
              <span className="ml-2 text-sm text-gray-700">Show overdue only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={filters.billable_only || false}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, billable_only: e.target.checked }));
                }}
              />
              <span className="ml-2 text-sm text-gray-700">Billable tasks only</span>
            </label>
            <button
              onClick={() => setFilters({})}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Task Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => {
                      if (sortBy === 'due_date') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('due_date');
                        setSortDirection('asc');
                      }
                    }}
                    className="flex items-center hover:text-gray-700"
                  >
                    Task & Due Date
                    {sortBy === 'due_date' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => {
                      if (sortBy === 'case_id') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('case_id');
                        setSortDirection('asc');
                      }
                    }}
                    className="flex items-center hover:text-gray-700"
                  >
                    Case
                    {sortBy === 'case_id' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => {
                      if (sortBy === 'priority') {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('priority');
                        setSortDirection('desc'); // Higher priority first
                      }
                    }}
                    className="flex items-center hover:text-gray-700"
                  >
                    Priority
                    {sortBy === 'priority' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Phase
                </th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedTasks.map((task) => {
                const { bgClass, textClass } = getTaskUrgencyStyle(task);
                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50 ${bgClass} ${textClass}`}
                  >
                
                  {/* Task & Due Date */}
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : isTaskOverdue(task) ? (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        ) : (
                          <Circle className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {task.title}
                        </div>
                        {task.due_date && (
                          <div className={`text-xs ${
                            isTaskOverdue(task) ? 'text-red-600 font-semibold' : 'text-gray-500'
                          }`}>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        {task.description && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Case */}
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {task.case?.case_name || 'Unknown Case'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.case?.cm_number}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getPriorityColor(task.priority) === 'red'
                        ? 'bg-red-100 text-red-800'
                        : getPriorityColor(task.priority) === 'orange'
                        ? 'bg-orange-100 text-orange-800'
                        : getPriorityColor(task.priority) === 'blue'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      P{task.priority}
                    </span>
                  </td>

                  {/* Status & Phase */}
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {task.status.replace('-', ' ')}
                    </div>
                    {task.phase && (
                      <div className="text-xs text-gray-500">{task.phase}</div>
                    )}
                  </td>

                  {/* Assigned */}
                  <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-900">
                    {task.assigned_to || 'Unassigned'}
                  </td>

                  {/* Time */}
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {/* Timer Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleTimerToggle(task.id)}
                          className={`p-1 rounded ${
                            activeTimerId === task.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={
                            activeTimerId === task.id
                              ? timerPausedAt
                                ? 'Resume Timer'
                                : 'Pause Timer'
                              : 'Start Timer'
                          }
                        >
                          {activeTimerId === task.id && !timerPausedAt ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </button>
                        {activeTimerId === task.id && (
                          <button
                            onClick={() => handleTimerStop(task.id)}
                            className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                            title="Stop Timer"
                          >
                            <Square className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      
                      {/* Time Display with Variance */}
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">
                          {task.actual_hours ? `${task.actual_hours.toFixed(1)}h` : '0h'}
                        </div>
                        {task.estimated_hours && task.estimated_hours > 0 && (
                          (() => {
                            const spent = task.actual_hours || 0;
                            const estimated = task.estimated_hours;
                            const variance = spent - estimated;
                            const percentOver = (variance / estimated) * 100;
                            
                            let status: 'under' | 'close' | 'over';
                            let colorClass: string;
                            
                            if (variance <= 0) {
                              status = 'under';
                              colorClass = 'text-green-600';
                            } else if (percentOver <= 15) {
                              status = 'close'; 
                              colorClass = 'text-yellow-600';
                            } else {
                              status = 'over';
                              colorClass = 'text-red-600';
                            }
                            
                            return (
                              <div className={`${colorClass} font-medium`}>
                                {variance === 0 ? 'On Target' : 
                                 variance > 0 ? `+${variance.toFixed(1)}h` : 
                                 `${variance.toFixed(1)}h`}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-1.5 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setShowCalendarEvent(task.id)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Add to Calendar"
                      >
                        <Calendar className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setShowTimeEntry(task.id)}
                        className="text-gray-400 hover:text-green-600"
                        title="Add Time Entry"
                      >
                        <Clock className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => setShowTaskDetail(task.id)}
                        className="text-gray-400 hover:text-blue-600"
                        title="View/Edit Task"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="text-gray-400 hover:text-green-600"
                          title="Mark Complete"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Task"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredAndSortedTasks.length === 0 && (
            <div className="text-center py-12">
              <Circle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.keys(filters).length > 0
                  ? 'Try adjusting your filters or create a new task.'
                  : 'Get started by creating your first task.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-transparent rounded-md text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null); // Clear editing state
          }}
          task={null}
          caseId={undefined}
        />
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && (
        <TaskDetail
          taskId={showTaskDetail!}
          isOpen={true}
          onClose={() => setShowTaskDetail(null)}
          onEdit={(task) => {
            setEditingTask(task.id);
            setShowTaskDetail(null);
            // Don't set showTaskForm - that's for NEW tasks only
          }}
        />
      )}

      {/* Time Entry Modal */}
      {showTimeEntry && (
        <TimeEntryModal
          isOpen={true}
          onClose={() => setShowTimeEntry(null)}
          taskId={showTimeEntry!}
          timeEntry={undefined}
        />
      )}

      {/* Calendar Event Modal */}
      {showCalendarEvent && (
        <CalendarEventModal
          isOpen={true}
          onClose={() => setShowCalendarEvent(null)}
          taskId={showCalendarEvent!}
          calendarEvent={undefined}
        />
      )}

      {/* Edit Task Form Modal */}
      {editingTask && (
        <TaskForm
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={tasks.find(t => t.id === editingTask) || null}
          caseId={undefined}
        />
      )}
    </div>
  );
}
