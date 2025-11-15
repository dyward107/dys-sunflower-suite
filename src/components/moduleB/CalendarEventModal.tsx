// CALENDAR EVENT MODAL - MODULE B
// Dy's Sunflower Suite v5.0
// Modal form for creating calendar events with Outlook and .ICS export

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import type { CalendarEvent, CalendarEventInput } from '../../types/ModuleB';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Download, 
  Mail, 
  AlertCircle, 
  Bell,
  Link as LinkIcon,
} from 'lucide-react';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // Pre-selected task to link
  calendarEvent?: CalendarEvent | null; // If editing existing event
}

export function CalendarEventModal({ isOpen, onClose, taskId, calendarEvent }: CalendarEventModalProps) {
  const { tasks, createCalendarEvent, isLoading, error, loadTasks } = useTaskStore();

  // Form state
  const [formData, setFormData] = useState<CalendarEventInput>({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    task_id: taskId || undefined,
    case_id: 0, // Will be set from task or selected
    all_day: false,
    reminders: [15], // Array of minutes
    calendar_type: 'ics',
    event_type: 'manual',
  });
  
  // Additional form state for UI
  const [attendees, setAttendees] = useState<string>('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load tasks if not already loaded
  useEffect(() => {
    if (isOpen && tasks.length === 0) {
      loadTasks();
    }
  }, [isOpen, tasks.length, loadTasks]);

  // Populate form when editing existing event or resetting
  useEffect(() => {
    if (calendarEvent) {
      // Editing existing event - populate from calendar event data
      // Construct datetime from event_date and start_time/end_time
      const startDateTime = new Date(`${calendarEvent.event_date}T${calendarEvent.start_time || '00:00'}`);
      const endDateTime = new Date(`${calendarEvent.event_date}T${calendarEvent.end_time || '23:59'}`);
      
      setFormData({
        title: calendarEvent.title,
        description: calendarEvent.description || '',
        event_date: calendarEvent.event_date,
        start_time: `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}`,
        end_time: `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`,
        location: calendarEvent.location || '',
        task_id: calendarEvent.task_id || undefined,
        case_id: calendarEvent.case_id,
        all_day: calendarEvent.all_day,
        reminders: calendarEvent.reminders || [15],
        calendar_type: calendarEvent.calendar_type,
        event_type: calendarEvent.event_type,
      });
      setAttendees(''); // attendees not stored in calendar event
    } else {
      // New event - set defaults
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      setFormData({
        title: '',
        description: '',
        event_date: now.toISOString().split('T')[0],
        start_time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
        end_time: `${oneHourLater.getHours().toString().padStart(2, '0')}:${oneHourLater.getMinutes().toString().padStart(2, '0')}`,
        location: '',
        task_id: taskId || undefined,
        case_id: 0, // Will be set when task is selected
        all_day: false,
        reminders: [15],
        calendar_type: 'ics',
        event_type: 'manual',
      });
      setAttendees('');
    }
    setValidationErrors({});
  }, [calendarEvent, taskId, isOpen]);

  // Auto-populate title and case_id from linked task
  useEffect(() => {
    if (formData.task_id && !calendarEvent) {
      const linkedTask = tasks.find(t => t.id === formData.task_id);
      if (linkedTask) {
        setFormData(prev => ({
          ...prev,
          title: linkedTask.title,
          description: linkedTask.description || '',
          case_id: typeof linkedTask.case_id === 'string' ? parseInt(linkedTask.case_id) : linkedTask.case_id,
        }));
      }
    }
  }, [formData.task_id, tasks, calendarEvent]);

  // Handle input changes
  const handleInputChange = (field: keyof CalendarEventInput, value: any) => {
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
  
  // Handle attendees separately (not part of CalendarEventInput)
  const handleAttendeesChange = (value: string) => {
    setAttendees(value);
  };

  // Handle all-day toggle
  const handleAllDayToggle = (isAllDay: boolean) => {
    setFormData(prev => ({
      ...prev,
      all_day: isAllDay,
      start_time: isAllDay ? '00:00' : '09:00',
      end_time: isAllDay ? '23:59' : '10:00',
    }));
  };

  // Handle quick duration buttons
  const handleQuickDuration = (minutes: number) => {
    if (!formData.event_date || !formData.start_time) return;
    
    const startDateTime = new Date(`${formData.event_date}T${formData.start_time}`);
    const endDateTime = new Date(startDateTime.getTime() + minutes * 60 * 1000);
    
    setFormData(prev => ({
      ...prev,
      end_time: `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`,
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }

    if (!formData.event_date) {
      errors.event_date = 'Event date is required';
    }

    if (!formData.all_day) {
      if (!formData.start_time) {
        errors.start_time = 'Start time is required';
      }
      if (!formData.end_time) {
        errors.end_time = 'End time is required';
      }
      
      // Validate that end time is after start time (for same day events)
      if (formData.start_time && formData.end_time) {
        const startDateTime = new Date(`${formData.event_date}T${formData.start_time}`);
        const endDateTime = new Date(`${formData.event_date}T${formData.end_time}`);
        
        if (endDateTime <= startDateTime) {
          errors.end_time = 'End time must be after start time';
        }
      }
    }

    if (formData.case_id === 0) {
      errors.task_id = 'Please select a task (which will set the case)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate .ICS content
  const generateICS = (): string => {
    const startDateTime = new Date(`${formData.event_date}T${formData.start_time || '00:00'}`);
    const endDateTime = new Date(`${formData.event_date}T${formData.end_time || '23:59'}`);
    const now = new Date();
    
    const formatDateTime = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeICS = (text: string): string => {
      return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dy\'s Sunflower Suite//Calendar Event//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@sunflower-suite`,
      `DTSTAMP:${formatDateTime(now)}`,
      `DTSTART:${formatDateTime(startDateTime)}`,
      `DTEND:${formatDateTime(endDateTime)}`,
      `SUMMARY:${escapeICS(formData.title)}`,
      formData.description ? `DESCRIPTION:${escapeICS(formData.description)}` : '',
      formData.location ? `LOCATION:${escapeICS(formData.location)}` : '',
      attendees ? `ATTENDEE:${escapeICS(attendees)}` : '',
      formData.reminders?.[0] ? `BEGIN:VALARM\nACTION:DISPLAY\nTRIGGER:-PT${formData.reminders[0]}M\nDESCRIPTION:Reminder\nEND:VALARM` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  };

  // Handle export
  const handleExport = (format: 'outlook' | 'ics') => {
    if (!validateForm()) return;

    if (format === 'ics') {
      // Download .ICS file
      const icsContent = generateICS();
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Open Outlook
      const startDateTime = new Date(`${formData.event_date}T${formData.start_time || '00:00'}`);
      const endDateTime = new Date(`${formData.event_date}T${formData.end_time || '23:59'}`);
      
      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?` +
        `subject=${encodeURIComponent(formData.title)}&` +
        `startdt=${startDateTime.toISOString()}&` +
        `enddt=${endDateTime.toISOString()}` +
        (formData.description ? `&body=${encodeURIComponent(formData.description)}` : '') +
        (formData.location ? `&location=${encodeURIComponent(formData.location)}` : '');
      
      window.open(outlookUrl, '_blank');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (calendarEvent) {
        // TODO: Implement update functionality when available
        console.warn('Calendar event editing not yet implemented');
        onClose();
      } else {
        // Create new event
        await createCalendarEvent(formData);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save calendar event:', error);
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
    if (!calendarEvent) {
      return Object.values(formData).some(value => 
        value !== '' && value !== 0 && value !== false
      );
    }
    
    const startDateTime = new Date(`${calendarEvent.event_date}T${calendarEvent.start_time || '00:00'}`);
    const endDateTime = new Date(`${calendarEvent.event_date}T${calendarEvent.end_time || '23:59'}`);
    
    return (
      formData.title !== calendarEvent.title ||
      formData.description !== (calendarEvent.description || '') ||
      formData.event_date !== calendarEvent.event_date ||
      formData.start_time !== `${startDateTime.getHours().toString().padStart(2, '0')}:${startDateTime.getMinutes().toString().padStart(2, '0')}` ||
      formData.end_time !== `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}` ||
      formData.location !== (calendarEvent.location || '') ||
      formData.task_id !== (calendarEvent.task_id || '') ||
      formData.case_id !== calendarEvent.case_id ||
      formData.all_day !== calendarEvent.all_day ||
      JSON.stringify(formData.reminders) !== JSON.stringify(calendarEvent.reminders || [15]) ||
      formData.calendar_type !== calendarEvent.calendar_type ||
      formData.event_type !== calendarEvent.event_type
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
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {calendarEvent ? 'Edit Calendar Event' : 'Add to Calendar'}
                </h3>
                {selectedTask && (
                  <p className="text-sm text-gray-600 mt-1">
                    Linked to: {selectedTask.title}
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
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter event title"
                maxLength={200}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
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
                placeholder="Event description (optional)"
                maxLength={1000}
              />
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center">
              <input
                id="all_day"
                type="checkbox"
                checked={formData.all_day}
                onChange={(e) => handleAllDayToggle(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="all_day" className="ml-2 block text-sm text-gray-900">
                All day event
              </label>
            </div>

            {/* Event Date */}
            <div>
              <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                id="event_date"
                value={formData.event_date}
                onChange={(e) => handleInputChange('event_date', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.event_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.event_date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.event_date}</p>
              )}
            </div>

            {/* Time Range */}
            {!formData.all_day && (
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
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    id="end_time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange('end_time', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.end_time ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.end_time && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.end_time}</p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Duration Buttons (for non-all-day events) */}
            {!formData.all_day && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Quick durations:</p>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60, 90, 120, 180, 240].map(minutes => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => handleQuickDuration(minutes)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700"
                    >
                      {minutes < 60 ? `${minutes}min` : `${minutes / 60}h`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </div>
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event location (optional)"
                maxLength={200}
              />
            </div>

            {/* Attendees */}
            <div>
              <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Attendees
                </div>
              </label>
              <input
                type="text"
                id="attendees"
                value={attendees}
                onChange={(e) => handleAttendeesChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email addresses separated by commas (optional)"
                maxLength={500}
              />
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showAdvanced ? 'Hide' : 'Show'} advanced options
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                {/* Task Link */}
                <div>
                  <label htmlFor="task_id" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Link to Task
                    </div>
                  </label>
                  <select
                    id="task_id"
                    value={formData.task_id}
                    onChange={(e) => handleInputChange('task_id', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No linked task</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reminder */}
                <div>
                  <label htmlFor="reminder_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 mr-1" />
                      Reminder
                    </div>
                  </label>
                  <select
                    id="reminder_minutes"
                    value={formData.reminders?.[0] || 0}
                    onChange={(e) => handleInputChange('reminders', [Number(e.target.value)])}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>No reminder</option>
                    <option value={5}>5 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={120}>2 hours before</option>
                    <option value={1440}>1 day before</option>
                  </select>
                </div>
              </div>
            )}

            {/* Export Options */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Export Options</h4>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleExport('outlook')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Add to Outlook
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('ics')}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download .ICS
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                You can export to your calendar and still save to the database for tracking.
              </p>
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
                      {calendarEvent ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    calendarEvent ? 'Update Event' : 'Create Event'
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
