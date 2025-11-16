import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, AlertTriangle, Zap, Info } from 'lucide-react';
import '../../styles/design-system.css';
import { 
  CalendarEventInput, 
  EventCreationContext,
  CalendarEvent 
} from '../../types/ModuleC';
import { 
  EVENT_TYPES, 
  EVENT_CATEGORIES, 
  getEventTypeById
} from '../../constants/eventTypes';

interface EventCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: CalendarEventInput) => Promise<void>;
  context?: EventCreationContext;
  existingEvent?: CalendarEvent; // For editing
}

export const EventCreationForm: React.FC<EventCreationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  context,
  existingEvent
}) => {
  const [formData, setFormData] = useState<CalendarEventInput>({
    case_id: context?.case_id || 0,
    event_type: 'general_event',
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '09:00',
    all_day: false,
    location: '',
    trigger_automation: false,
    reminder_days: [7, 3, 1],
    is_jurisdictional: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [automationPreview, setAutomationPreview] = useState<string>('');

  // Initialize form with existing event data or context prefills
  useEffect(() => {
    if (existingEvent) {
      setFormData({
        case_id: existingEvent.case_id,
        event_type: existingEvent.event_type,
        title: existingEvent.title,
        description: existingEvent.description || '',
        event_date: existingEvent.event_date,
        event_time: existingEvent.event_time || '09:00',
        all_day: existingEvent.all_day,
        location: existingEvent.location || '',
        trigger_automation: existingEvent.trigger_automation,
        reminder_days: existingEvent.reminder_days || [7, 3, 1],
        is_jurisdictional: existingEvent.is_jurisdictional
      });
    } else if (context?.prefilled_data) {
      setFormData(prev => ({
        ...prev,
        ...context.prefilled_data
      }));
    }
  }, [existingEvent, context]);

  // Update automation preview when event type changes
  useEffect(() => {
    const eventType = getEventTypeById(formData.event_type);
    if (eventType?.automationDescription) {
      setAutomationPreview(eventType.automationDescription);
    } else {
      setAutomationPreview('');
    }
  }, [formData.event_type]);

  const handleInputChange = (field: keyof CalendarEventInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.case_id || formData.case_id === 0) {
      newErrors.case_id = 'Case selection is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    }

    if (!formData.all_day && !formData.event_time) {
      newErrors.event_time = 'Event time is required for non-all-day events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating/updating event:', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const selectedEventType = getEventTypeById(formData.event_type);
  const hasAutomation = selectedEventType?.automationId;

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
      padding: 'var(--spacing-md)'
    }}>
      {/* Background overlay - matching CalendarEventModal */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(62, 47, 35, 0.85)',
          cursor: 'pointer'
        }}
      />

      {/* Modal content */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          position: 'relative',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: 'var(--border-radius-lg)',
          border: '3px solid var(--color-sunflower)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-lg)',
          borderBottom: '2px solid var(--color-border-light)',
          backgroundColor: 'var(--color-bg-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)'
          }}>
            <Calendar size={24} color="var(--color-sunflower)" />
            <h2 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
              fontFamily: 'var(--font-family-primary)'
            }}>
              {existingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} color="var(--color-text-secondary)" />
          </button>
        </div>

        {/* Form Content */}
        <div style={{
          padding: 'var(--spacing-lg)',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Context Info */}
          {context && (
            <div style={{
              backgroundColor: 'var(--color-bg-secondary)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: 'var(--spacing-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)'
            }}>
              <Info size={16} color="var(--color-primary)" />
              <span style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-primary)'
              }}>
                Creating event from {context.source.replace('_', ' ')}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Event Type Selection */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
                fontFamily: 'var(--font-family-primary)'
              }}>
                Event Type *
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => handleInputChange('event_type', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: `1px solid ${errors.event_type ? 'var(--color-error)' : 'var(--color-border-light)'}`,
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)'
                }}
              >
                {EVENT_CATEGORIES.map(category => (
                  <optgroup key={category.id} label={category.label}>
                    {EVENT_TYPES
                      .filter(type => type.category === category.id)
                      .map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))
                    }
                  </optgroup>
                ))}
              </select>
              {errors.event_type && (
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-error)',
                  fontFamily: 'var(--font-family-primary)'
                }}>
                  {errors.event_type}
                </span>
              )}
            </div>

            {/* Event Title */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
                fontFamily: 'var(--font-family-primary)'
              }}>
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title..."
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: `1px solid ${errors.title ? 'var(--color-error)' : 'var(--color-border-light)'}`,
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {errors.title && (
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-error)',
                  fontFamily: 'var(--font-family-primary)'
                }}>
                  {errors.title}
                </span>
              )}
            </div>

            {/* Date and Time Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              {/* Event Date */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                  fontFamily: 'var(--font-family-primary)'
                }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: `1px solid ${errors.event_date ? 'var(--color-error)' : 'var(--color-border-light)'}`,
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                {errors.event_date && (
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-family-primary)'
                  }}>
                    {errors.event_date}
                  </span>
                )}
              </div>

              {/* Event Time */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-xs)',
                  fontFamily: 'var(--font-family-primary)'
                }}>
                  Time {!formData.all_day && '*'}
                </label>
                <input
                  type="time"
                  value={formData.event_time || '09:00'}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  disabled={formData.all_day}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: `1px solid ${errors.event_time ? 'var(--color-error)' : 'var(--color-border-light)'}`,
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    backgroundColor: formData.all_day ? 'var(--color-bg-hover)' : 'var(--color-bg-primary)',
                    opacity: formData.all_day ? 0.6 : 1
                  }}
                />
                {errors.event_time && (
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-family-primary)'
                  }}>
                    {errors.event_time}
                  </span>
                )}
              </div>

              {/* All Day Toggle */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-family-primary)',
                  padding: 'var(--spacing-sm) 0'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.all_day}
                    onChange={(e) => handleInputChange('all_day', e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  All Day
                </label>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
                fontFamily: 'var(--font-family-primary)'
              }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location..."
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-xs)',
                fontFamily: 'var(--font-family-primary)'
              }}>
                Description / Notes
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description or notes..."
                rows={3}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Automation Section */}
            {hasAutomation && (
              <div style={{
                backgroundColor: 'var(--color-sunflower-lighter)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-sunflower)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)'
                  }}>
                    <Zap size={16} color="var(--color-sunflower)" />
                    <span style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-primary)'
                    }}>
                      Automation Available
                    </span>
                  </div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-family-primary)'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.trigger_automation}
                      onChange={(e) => handleInputChange('trigger_automation', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Trigger Automation
                  </label>
                </div>
                
                {automationPreview && (
                  <p style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    fontFamily: 'var(--font-family-primary)',
                    lineHeight: 1.4
                  }}>
                    <strong>Preview:</strong> {automationPreview}
                  </p>
                )}
              </div>
            )}

            {/* Jurisdictional Warning */}
            {selectedEventType?.isJurisdictional && (
              <div style={{
                backgroundColor: 'var(--color-error-light)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-error)',
                marginBottom: 'var(--spacing-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-sm)'
              }}>
                <AlertTriangle size={16} color="var(--color-error)" style={{ marginTop: '2px' }} />
                <div>
                  <span style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    color: 'var(--color-error)',
                    fontFamily: 'var(--font-family-primary)'
                  }}>
                    Jurisdictional Deadline
                  </span>
                  <p style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                    margin: '4px 0 0 0',
                    fontFamily: 'var(--font-family-primary)',
                    lineHeight: 1.4
                  }}>
                    This event type has jurisdictional consequences. Missing this deadline could result in dismissal or other sanctions.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div style={{
                backgroundColor: 'var(--color-error-light)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: 'var(--spacing-lg)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-error)',
                fontFamily: 'var(--font-family-primary)'
              }}>
                {errors.submit}
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-border-light)',
          backgroundColor: 'var(--color-bg-secondary)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-family-primary)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: loading ? 'var(--color-border-light)' : 'var(--color-sunflower)',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--color-bg-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-family-primary)',
              transition: 'opacity 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading && (
              <div className="spinner" style={{
                width: '14px',
                height: '14px',
                border: '2px solid transparent',
                borderTop: '2px solid var(--color-bg-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {existingEvent ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
