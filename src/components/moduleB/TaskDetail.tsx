// TASK DETAIL - MODULE B
// Dy's Sunflower Suite v5.0
// Comprehensive task details panel with time tracking, notes, and actions

import { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useCaseStore } from '../../stores/caseStore';
import type { Task, TimeEntry, TaskPriority } from '../../types/ModuleB';
import type { Case } from '../../types/ModuleA';
import {
  TASK_PRIORITIES,
} from '../../types/ModuleB';
import {
  Clock,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Circle,
  Play,
  Pause,
  Square,
  Plus,
  Tag,
  MessageSquare,
  Activity,
  DollarSign,
} from 'lucide-react';

interface TaskDetailProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

export function TaskDetail({ taskId, isOpen, onClose, onEdit }: TaskDetailProps) {
  const {
    tasks,
    timeEntries,
    isLoading,
    error,
    loadTaskById,
    loadTimeEntries,
    completeTask,
    deleteTask,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    activeTimerId,
    timerPausedAt,
    getElapsedTime,
  } = useTaskStore();

  const { cases, loadCases } = useCaseStore();

  const [task, setTask] = useState<Task | null>(null);
  const [taskCase, setTaskCase] = useState<Case | null>(null);
  const [taskTimeEntries, setTaskTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'time' | 'notes' | 'activity'>('overview');

  // Load task data when opened
  useEffect(() => {
    if (isOpen && taskId) {
      const foundTask = tasks.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        loadTimeEntries(taskId);
      } else {
        loadTaskById(taskId).then((loadedTask: Task | undefined) => {
          if (loadedTask) {
            setTask(loadedTask);
            loadTimeEntries(taskId);
          }
        });
      }
      loadCases();
    }
  }, [isOpen, taskId, tasks]);

  // Update case information when task or cases change
  useEffect(() => {
    if (task && cases.length > 0) {
      const foundCase = cases.find(c => c.id === task.case_id);
      setTaskCase(foundCase || null);
    }
  }, [task, cases]);

  // Update time entries when they change
  useEffect(() => {
    if (taskId) {
      const entries = timeEntries.filter(entry => entry.task_id === taskId);
      setTaskTimeEntries(entries);
    }
  }, [timeEntries, taskId]);

  // Update local task state when store tasks change (to reflect updated actual_hours)
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const updatedTask = tasks.find(t => t.id === taskId);
      if (updatedTask) {
        setTask(updatedTask);
      }
    }
  }, [tasks, taskId]);


  // Timer controls
  const handleTimerToggle = () => {
    if (!task) return;

    if (activeTimerId === task.id) {
      if (timerPausedAt) {
        resumeTimer();
      } else {
        pauseTimer();
      }
    } else {
      startTimer(task.id);
    }
  };

  const handleTimerStop = async () => {
    if (!task || activeTimerId !== task.id) return;
    await stopTimer();
  };

  // Task actions
  const handleCompleteTask = async () => {
    if (!task) return;
    
    if (window.confirm('Mark this task as completed?')) {
      try {
        await completeTask(task.id);
        setTask(prev => prev ? { ...prev, status: 'completed' } : null);
      } catch (error) {
        console.error('Failed to complete task:', error);
      }
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(task.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  // Get priority configuration
  const getPriorityConfig = (priority: TaskPriority) => {
    return TASK_PRIORITIES.find(p => p.value === priority);
  };

  // Check if task is overdue
  const isTaskOverdue = (task: Task): boolean => {
    if (!task.due_date || task.status === 'completed') return false;
    const now = new Date().toISOString().split('T')[0];
    return task.due_date < now;
  };

  // Calculate timer duration
  const getTimerDuration = (): string => {
    if (activeTimerId !== task?.id) return '00:00:00';

    const elapsed = getElapsedTime(); // milliseconds

    const totalSeconds = Math.floor(elapsed / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate total time spent
  const getTotalTimeSpent = (): number => {
    return taskTimeEntries.reduce((total, entry) => {
      // Convert minutes to hours (database stores duration_minutes)
      const hours = entry.duration_minutes ? entry.duration_minutes / 60 : 0;
      return total + hours;
    }, 0);
  };

  // Calculate time variance for legal workflow management
  const getTimeVariance = (): { variance: number; status: 'under' | 'close' | 'over'; message: string } => {
    const spent = getTotalTimeSpent();
    const estimated = task?.estimated_hours || 0;
    
    if (estimated === 0) {
      return { 
        variance: 0, 
        status: 'under', 
        message: 'No estimate set' 
      };
    }
    
    const variance = spent - estimated;
    const percentOver = (variance / estimated) * 100;
    
    // Legal variance thresholds
    if (variance <= 0) {
      return { 
        variance, 
        status: 'under', 
        message: `${Math.abs(variance).toFixed(1)}h under estimate` 
      };
    } else if (percentOver <= 15) { // Within 15% is "close"
      return { 
        variance, 
        status: 'close', 
        message: `${variance.toFixed(1)}h over estimate` 
      };
    } else {
      return { 
        variance, 
        status: 'over', 
        message: `${variance.toFixed(1)}h over estimate` 
      };
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-md p-3 shadow-lg">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Task not found
            </div>
          </div>
        </div>
      </div>
    );
  }

  const priorityConfig = getPriorityConfig(task.priority);
  const isOverdue = isTaskOverdue(task);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-md)',
    }}>
      {/* Background overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(62, 47, 35, 0.85)',
          cursor: 'pointer',
        }}
      />

      {/* Panel content */}
      <div style={{
        position: 'relative',
        width: '90vw',
        maxWidth: '900px',
        maxHeight: '90vh',
        backgroundColor: 'var(--color-bg-primary)',
        borderRadius: 'var(--border-radius-lg)',
        border: '3px solid var(--color-sunflower)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Scrollable content area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--spacing-xl)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-lg)',
            paddingBottom: 'var(--spacing-md)',
            borderBottom: '2px solid var(--color-border-light)',
          }}>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              Task Details
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {task.status === 'completed' ? (
                <CheckCircle size={20} style={{ color: 'var(--color-sage)' }} />
              ) : isOverdue ? (
                <AlertCircle size={20} style={{ color: 'var(--color-error)' }} />
              ) : (
                <Circle size={20} style={{ color: 'var(--color-text-muted)' }} />
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <h3 style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {task.title}
                </h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px var(--spacing-xs)',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  backgroundColor: priorityConfig?.color === 'red' ? 'var(--color-error)' :
                                 priorityConfig?.color === 'orange' ? 'var(--color-warning)' :
                                 priorityConfig?.color === 'blue' ? 'var(--color-blue-gray)' : 'var(--color-sage)',
                  color: 'white',
                }}>
                  {priorityConfig?.label}
                </span>
              </div>
              {taskCase && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {taskCase.case_name} • {taskCase.cm_number}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <button
                onClick={() => onEdit && onEdit(task)}
                style={{
                  padding: 'var(--spacing-xs)',
                  backgroundColor: 'var(--color-blue-gray)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Edit Task"
              >
                <Edit size={14} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-4 mt-4">
            {/* Timer Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTimerToggle}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                  activeTimerId === task.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {activeTimerId === task.id && !timerPausedAt ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </button>
              {activeTimerId === task.id && (
                <button
                  onClick={handleTimerStop}
                  className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </button>
              )}
              {activeTimerId === task.id && (
                <div className="text-sm font-mono text-gray-600">
                  {getTimerDuration()}
                </div>
              )}
            </div>

            {/* Status Actions */}
            {task.status !== 'completed' && (
              <button
                onClick={handleCompleteTask}
                className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </button>
            )}

            <button
              onClick={handleDeleteTask}
              className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-2">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="px-6 flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'time', label: 'Time Tracking', icon: Clock },
                { id: 'notes', label: 'Notes', icon: MessageSquare },
                { id: 'activity', label: 'Activity', icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Task Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                        <div className="mt-1 text-sm text-gray-900 capitalize">
                          {task.status.replace('-', ' ')}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phase</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {task.phase || 'Not specified'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</label>
                        <div className={`mt-1 text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          {isOverdue && ' (Overdue)'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {task.assigned_to || 'Unassigned'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Time & Billing</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimated Hours</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {task.estimated_hours ? `${task.estimated_hours} hours` : 'Not estimated'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actual Hours</label>
                        <div className="mt-1 text-sm text-gray-900">
                          {getTotalTimeSpent().toFixed(2)} hours
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Billable</label>
                        <div className="mt-1 flex items-center">
                          {task.is_billable ? (
                            <div className="flex items-center text-green-600">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Yes
                            </div>
                          ) : (
                            <div className="text-gray-500">No</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Description</h3>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded-md p-2">
                      {task.description}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {task.tags && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Time Tracking Tab */}
            {activeTab === 'time' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Time Entries</h3>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-time-entry-modal', { detail: { task_id: task.id } }))}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Entry
                  </button>
                </div>

                {/* Time Summary */}
                <div className="bg-gray-50 rounded-md p-2">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{getTotalTimeSpent().toFixed(1)}h</div>
                      <div className="text-sm text-gray-600">Time Spent</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{task.estimated_hours || 0}h</div>
                      <div className="text-sm text-gray-600">Estimated</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">Variance</div>
                      <div className="text-xs text-gray-600">Time comparison</div>
                    </div>
                  </div>
                </div>

                {/* Variance Alert */}
                {task.estimated_hours && task.estimated_hours > 0 && (() => {
                  const varianceData = getTimeVariance();
                  if (varianceData.status === 'over') {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                        <div className="flex items-center text-yellow-800 text-sm">
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="font-medium">{varianceData.message}</span>
                        </div>
                      </div>
                    );
                  } else if (varianceData.status === 'close') {
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                        <div className="flex items-center text-blue-800 text-sm">
                          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="font-medium">{varianceData.message} - within acceptable range</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Time Entries List */}
                <div className="space-y-3">
                  {taskTimeEntries.length > 0 ? (
                    taskTimeEntries.map((entry) => (
                      <div key={entry.id} className="bg-white border border-gray-200 rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.duration_minutes ? (entry.duration_minutes / 60).toFixed(1) : '0.0'} hours
                            </div>
                            <div className="text-xs text-gray-500">
                              {entry.entry_date ? new Date(entry.entry_date).toLocaleDateString() : 'No date'} • 
                              {entry.start_time || 'No start'} - {entry.stop_time || 'No end'}
                            </div>
                            {entry.description && (
                              <div className="text-sm text-gray-700 mt-1">{entry.description}</div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.is_billable ? 'Billable' : 'Non-billable'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
                      <p className="mt-1 text-sm text-gray-500">Start the timer or add a manual entry.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Notes & Comments</h3>
                  <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                  </button>
                </div>

                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notes yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Add notes and comments to track progress and important information.</p>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>

                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Task activity and changes will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
