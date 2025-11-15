// TIME ENTRY MODAL - MODULE B
// Dy's Sunflower Suite v5.0
// Modal form for creating and editing time entries

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import type { TimeEntry, TimeEntryInput, Task } from '../../types/ModuleB';
import { X, Clock, Calendar, DollarSign, AlertCircle, Calculator } from 'lucide-react';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // Pre-selected task
  timeEntry?: TimeEntry | null; // If editing existing entry
}

export function TimeEntryModal({ isOpen, onClose, taskId, timeEntry }: TimeEntryModalProps) {
  const { 
    tasks, 
    createTimeEntry, 
    updateTimeEntry, 
    isLoading, 
    error,
    loadTasks,
    activeTimerId,
    timerStartedAt,
    stopTimer,
  } = useTaskStore();

  // Form state  
  const [formData, setFormData] = useState<TimeEntryInput>({
    task_id: taskId || '',
    entry_date: new Date().toISOString().split('T')[0], // Today
    start_time: '',
    stop_time: '',
    duration_minutes: 0,
    description: '',
    is_billable: true,
    user_id: undefined, // Optional
    rate: undefined,    // Optional
  });
  
  // Additional UI state for form convenience
  const [hours, setHours] = useState<number>(0); // For UI display as hours

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeMode, setTimeMode] = useState<'duration' | 'range'>('range'); // Duration input or start/end time
  const [showTimerImport, setShowTimerImport] = useState(false);

  // Load tasks if not already loaded
  useEffect(() => {
    if (isOpen && tasks.length === 0) {
      loadTasks();
    }
  }, [isOpen, tasks.length, loadTasks]);

  // Check if there's an active timer for any task
  useEffect(() => {
    if (isOpen && activeTimerId && timerStartedAt) {
      setShowTimerImport(true);
    }
  }, [isOpen, activeTimerId, timerStartedAt]);

  // Populate form when editing existing entry
  useEffect(() => {
    if (timeEntry) {
      setFormData({
        task_id: timeEntry.task_id,
        entry_date: timeEntry.date,
        start_time: timeEntry.start_time,
        stop_time: timeEntry.end_time,
        duration_minutes: timeEntry.hours * 60, // Convert hours to minutes
        description: timeEntry.description || '',
        is_billable: timeEntry.is_billable,
        user_id: timeEntry.user_id || undefined,
        rate: timeEntry.rate || undefined,
      });
      setHours(timeEntry.hours);
      setTimeMode('range'); // Default to range when editing
    } else {
      // Reset form for new entry
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setFormData({
        task_id: taskId || '',
        entry_date: new Date().toISOString().split('T')[0],
        start_time: currentTime,
        stop_time: '',
        duration_minutes: 0,
        description: '',
        is_billable: true,
        user_id: undefined,
        rate: undefined,
      });
      setHours(0);
    }
    setValidationErrors({});
    setShowTimerImport(false);
  }, [timeEntry, taskId, isOpen]);

  // Calculate hours from start/end time
  const calculateHoursFromRange = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
      // Handle overnight times
      diffMinutes += 24 * 60;
    }
    
    return diffMinutes / 60;
  };

  // Update duration when start/end time changes  
  useEffect(() => {
    if (timeMode === 'range' && formData.start_time && formData.stop_time) {
      const calculatedHours = calculateHoursFromRange(formData.start_time, formData.stop_time);
      const calculatedMinutes = Math.round(calculatedHours * 60);
      if (calculatedMinutes !== formData.duration_minutes) {
        setFormData(prev => ({ ...prev, duration_minutes: calculatedMinutes }));
        setHours(calculatedHours);
      }
    }
  }, [formData.start_time, formData.stop_time, timeMode, formData.duration_minutes]);

  // Handle input changes
  const handleInputChange = (field: keyof TimeEntryInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle hours input (for UI convenience)
  const handleHoursChange = (newHours: number) => {
    setHours(newHours);
    setFormData(prev => ({ 
      ...prev, 
      duration_minutes: Math.round(newHours * 60),
      start_time: '',
      stop_time: ''
    }));
  };

  // Handle quick duration buttons
  const handleQuickDuration = (inputHours: number) => {
    setTimeMode('duration');
    setHours(inputHours);
    setFormData(prev => ({ 
      ...prev, 
      duration_minutes: Math.round(inputHours * 60), 
      start_time: '', 
      stop_time: '' 
    }));
  };

  // Import from active timer
  const handleImportFromTimer = async () => {
    if (!activeTimerId || !timerStartedAt) return;
    
    const startTime = new Date(timerStartedAt);
    const now = new Date();
    
    const startTimeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
    const endTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const durationHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Hours
    const durationMinutes = Math.round(durationHours * 60); // Convert to minutes
    
    setFormData(prev => ({
      ...prev,
      task_id: activeTimerId,
      entry_date: startTime.toISOString().split('T')[0],
      start_time: startTimeStr,
      stop_time: endTimeStr,
      duration_minutes: durationMinutes,
    }));
    
    setHours(Math.round(durationHours * 10) / 10); // Round to 1 decimal for display
    setTimeMode('range');
    setShowTimerImport(false);
    
    // Stop the timer
    await stopTimer();
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.task_id) {
      errors.task_id = 'Please select a task';
    }

    if (!formData.entry_date) {
      errors.entry_date = 'Date is required';
    }

    if (timeMode === 'range') {
      if (!formData.start_time) {
        errors.start_time = 'Start time is required';
      }
      if (!formData.stop_time) {
        errors.stop_time = 'End time is required';
      }
      if (formData.start_time && formData.stop_time) {
        const calculatedHours = calculateHoursFromRange(formData.start_time, formData.stop_time);
        if (calculatedHours <= 0) {
          errors.stop_time = 'End time must be after start time';
        }
        if (calculatedHours > 24) {
          errors.stop_time = 'Time entry cannot exceed 24 hours';
        }
      }
    } else {
      const durationHours = formData.duration_minutes / 60;
      if (durationHours <= 0) {
        errors.duration_minutes = 'Duration must be greater than 0';
      }
      if (durationHours > 24) {
        errors.duration_minutes = 'Duration cannot exceed 24 hours';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure we have the correct duration_minutes value
      let finalFormData = { ...formData };
      if (timeMode === 'range' && formData.start_time && formData.stop_time) {
        const calculatedHours = calculateHoursFromRange(formData.start_time, formData.stop_time);
        finalFormData.duration_minutes = Math.round(calculatedHours * 60);
      }
      
      if (timeEntry) {
        // Update existing entry (TODO: implement when updateTimeEntry is available)
        console.warn('Time entry editing not yet implemented');
        onClose();
      } else {
        // Create new entry
        await createTimeEntry(finalFormData);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save time entry:', error);
      // Error handling is managed by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Check for unsaved changes
  const hasUnsavedChanges = (): boolean => {
    if (!timeEntry) {
      return Object.values(formData).some(value => 
        value !== '' && value !== 0 && value !== false && value !== new Date().toISOString().split('T')[0]
      );
    }
    
    return (
      formData.task_id !== timeEntry.task_id ||
      formData.entry_date !== timeEntry.date ||
      formData.start_time !== timeEntry.start_time ||
      formData.stop_time !== timeEntry.end_time ||
      Math.abs(formData.duration_minutes - (timeEntry.hours * 60)) > 1 || // Allow 1-minute difference
      formData.description !== (timeEntry.description || '') ||
      formData.is_billable !== timeEntry.is_billable
    );
  };

  // Get selected task info
  const selectedTask = tasks.find(t => t.id === formData.task_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleCancel}
        />

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {timeEntry ? 'Edit Time Entry' : 'Add Time Entry'}
                </h3>
                {selectedTask && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTask.title}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Timer Import Banner */}
          {showTimerImport && activeTimerId && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Active Timer Detected
                    </p>
                    <p className="text-xs text-blue-600">
                      Import time from your running timer
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleImportFromTimer}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  Import
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Selection */}
            <div>
              <label htmlFor="task_id" className="block text-sm font-medium text-gray-700 mb-1">
                Task *
              </label>
              <select
                id="task_id"
                value={formData.task_id}
                onChange={(e) => handleInputChange('task_id', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.task_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a task</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
              {validationErrors.task_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.task_id}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date *
                </div>
              </label>
              <input
                type="date"
                id="entry_date"
                value={formData.entry_date}
                onChange={(e) => handleInputChange('entry_date', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.entry_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.entry_date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.entry_date}</p>
              )}
            </div>

            {/* Time Mode Toggle */}
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium text-gray-700">Time Entry Method:</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setTimeMode('range')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      timeMode === 'range'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Start/End Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('duration')}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      timeMode === 'duration'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Duration
                  </button>
                </div>
              </div>

              {/* Time Range Mode */}
              {timeMode === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      id="start_time"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.start_time ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.start_time && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.start_time}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="stop_time" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="stop_time"
                      value={formData.stop_time}
                      onChange={(e) => handleInputChange('stop_time', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.stop_time ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.stop_time && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.stop_time}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Duration Mode */}
              {timeMode === 'duration' && (
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-1" />
                      Duration (Hours) *
                    </div>
                  </label>
                  <input
                    type="number"
                    id="hours"
                    min="0"
                    step="0.1"
                    value={hours}
                    onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.duration_minutes ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.0"
                  />
                  {validationErrors.duration_minutes && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.duration_minutes}</p>
                  )}

                  {/* Quick Duration Buttons */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Quick durations (0.1 hour increments):</p>
                    <div className="flex flex-wrap gap-2">
                      {[0.1, 0.2, 0.3, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0, 8.0].map(hourValue => (
                        <button
                          key={hourValue}
                          type="button"
                          onClick={() => handleQuickDuration(hourValue)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700"
                        >
                          {hourValue}h
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Calculated Duration Display */}
              {timeMode === 'range' && formData.start_time && formData.stop_time && (
                <div className="mt-2 text-sm text-gray-600">
                  Duration: {(formData.duration_minutes / 60).toFixed(1)} hours
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What did you work on? (optional)"
                maxLength={500}
              />
            </div>

            {/* Billable Checkbox */}
            <div className="flex items-center">
              <input
                id="is_billable"
                type="checkbox"
                checked={formData.is_billable}
                onChange={(e) => handleInputChange('is_billable', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_billable" className="ml-2 flex items-center text-sm text-gray-900">
                <DollarSign className="h-4 w-4 mr-1" />
                This is billable time
              </label>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white border border-transparent rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {timeEntry ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    timeEntry ? 'Update Entry' : 'Add Entry'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
