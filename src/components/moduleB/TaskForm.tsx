// TASK FORM - MODULE B
// Dy's Sunflower Suite v5.0
// Modal form for creating and editing tasks

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { useCaseStore } from '../../stores/caseStore';
import type { Task, TaskPriority, TaskStatus, TaskPhase, CreateTaskRequest } from '../../types/ModuleB';
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_PHASES,
  LEAD_ATTORNEYS,
} from '../../types/ModuleB';
import { Calendar, Clock, User } from 'lucide-react';
import '../../styles/design-system.css';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null; // If editing existing task
  caseId?: string; // If creating task for specific case
}

export function TaskForm({ isOpen, onClose, task, caseId }: TaskFormProps) {
  const { createTask, updateTask, isLoading, error } = useTaskStore();
  const { cases, loadCases } = useCaseStore();

  // Form state
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    case_id: caseId ? parseInt(caseId) : 0,
    priority: 2 as TaskPriority, // Default to P2
    status: 'pending' as TaskStatus,
    phase: '',
    date_assigned: new Date().toISOString().split('T')[0], // Default to today
    due_date: '',
    assigned_to: '',
    estimated_hours: 0,
    is_billable: true,
    tags: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cases on mount
  useEffect(() => {
    if (isOpen) {
      loadCases();
    }
  }, [isOpen, loadCases]);

  // Populate form when editing existing task
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        case_id: task.case_id,
        priority: task.priority,
        status: task.status,
        phase: task.phase || '',
        date_assigned: task.date_assigned || new Date().toISOString().split('T')[0],
        due_date: task.due_date || '',
        assigned_to: task.assigned_to || '',
        estimated_hours: task.estimated_hours || 0,
        is_billable: task.is_billable,
        tags: task.tags || '',
      });
    } else {
      // Reset form for new task  
      setFormData({
        title: '',
        description: '',
        case_id: caseId ? parseInt(caseId) : 0,
        priority: 2 as TaskPriority,
        status: 'pending' as TaskStatus,
        phase: '',
        date_assigned: new Date().toISOString().split('T')[0], // Default to today
        due_date: '',
        assigned_to: '',
        estimated_hours: 0,
        is_billable: true,
        tags: '',
      });
    }
    setValidationErrors({});
  }, [task, caseId, isOpen]);

  // Handle input changes
  const handleInputChange = (field: keyof CreateTaskRequest, value: any) => {
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

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
    }

    if (!formData.case_id) {
      errors.case_id = 'Please select a case';
    }

    // Allow due dates in the past for overdue task management

    if (formData.estimated_hours && formData.estimated_hours < 0) {
      errors.estimated_hours = 'Estimated hours cannot be negative';
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
      if (task) {
        // Update existing task
        console.log('Updating task:', task.id, formData);
        await updateTask(task.id, formData);
        console.log('Task updated successfully');
      } else {
        // Create new task
        console.log('Creating new task:', formData);
        await createTask(formData);
        console.log('Task created successfully');
      }
      
      // Wait a moment for state to update before closing
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Failed to save task:', error);
      alert(`Failed to save task: ${error}`);
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
    if (!task) {
      return Object.values(formData).some(value => 
        value !== '' && value !== 0 && value !== false
      );
    }
    
    return (
      formData.title !== task.title ||
      formData.description !== (task.description || '') ||
      formData.case_id !== task.case_id ||
      formData.priority !== task.priority ||
      formData.status !== task.status ||
      formData.phase !== (task.phase || '') ||
      formData.due_date !== (task.due_date || '') ||
      formData.assigned_to !== (task.assigned_to || '') ||
      formData.estimated_hours !== (task.estimated_hours || 0) ||
      formData.is_billable !== task.is_billable ||
      formData.tags !== (task.tags || '') ||
      formData.task_group_id !== (task.task_group_id || '')
    );
  };


  if (!isOpen) return null;

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
        onClick={handleCancel}
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

      {/* Modal content - Better sized to avoid sidebar overlap */}
      <div style={{
        position: 'relative',
        width: '90vw',
        maxWidth: '700px',
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
            {task ? 'Edit Task' : 'Add Task'}
          </h2>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-error)',
            color: 'white',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {/* Title */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '2px solid var(--color-border-medium)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                }}
                placeholder="Enter task title"
                maxLength={200}
              />
              {validationErrors.title && (
                <p style={{
                  color: 'var(--color-error)',
                  fontSize: 'var(--font-size-xs)',
                  marginTop: 'var(--spacing-xs)',
                }}>
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the task (optional)"
                maxLength={1000}
              />
            </div>

            {/* Case Selection */}
            <div>
              <label htmlFor="case_id" className="block text-xs font-medium text-gray-700 mb-1">
                Case *
              </label>
              <select
                id="case_id"
                value={formData.case_id}
                onChange={(e) => handleInputChange('case_id', e.target.value)}
                className={`block w-full px-2 py-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.case_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a case</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.case_name} • {c.cm_number}
                  </option>
                ))}
              </select>
              {validationErrors.case_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.case_id}</p>
              )}
            </div>

            {/* Row 1: Priority, Status, Phase */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="priority" className="block text-xs font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', Number(e.target.value) as TaskPriority)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TASK_PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TASK_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="phase" className="block text-xs font-medium text-gray-700 mb-1">
                  Phase
                </label>
                <select
                  id="phase"
                  value={formData.phase}
                  onChange={(e) => handleInputChange('phase', e.target.value as TaskPhase)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select phase</option>
                  {TASK_PHASES.map(phase => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Date Assigned, Due Date, Assigned To */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="date_assigned" className="block text-xs font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date Assigned *
                  </div>
                </label>
                <input
                  type="date"
                  id="date_assigned"
                  value={formData.date_assigned}
                  onChange={(e) => handleInputChange('date_assigned', e.target.value)}
                  className={`block w-full px-2 py-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.date_assigned ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.date_assigned && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date_assigned}</p>
                )}
              </div>
              <div>
                <label htmlFor="due_date" className="block text-xs font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due Date
                  </div>
                </label>
                <input
                  type="date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className={`block w-full px-2 py-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.due_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.due_date}</p>
                )}
              </div>

              <div>
                <label htmlFor="assigned_to" className="block text-xs font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Lead Attorney
                  </div>
                </label>
                <select
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {LEAD_ATTORNEYS.map(attorney => (
                    <option key={attorney} value={attorney}>
                      {attorney}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="estimated_hours" className="block text-xs font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Est. Hours
                  </div>
                </label>
                <input
                  type="number"
                  id="estimated_hours"
                  min="0"
                  step="0.25"
                  value={formData.estimated_hours}
                  onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                  className={`block w-full px-2 py-1 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.estimated_hours ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {validationErrors.estimated_hours && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.estimated_hours}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-xs font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Comma-separated tags (e.g., discovery, motion, urgent)"
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
              <label htmlFor="is_billable" className="ml-2 block text-sm text-gray-900">
                This is a billable task
              </label>
            </div>

          {/* Form Actions */}
          <div style={{
            paddingTop: 'var(--spacing-xl)',
            borderTop: '2px solid var(--color-border-medium)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--spacing-md)',
          }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                backgroundColor: 'var(--color-blue-gray)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-family-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: 600,
                backgroundColor: (isSubmitting || isLoading) ? 'var(--color-border-medium)' : 'var(--color-sage)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                cursor: (isSubmitting || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                transition: 'background-color 0.15s ease',
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--color-brown-primary)',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  {task ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
