import React from 'react';
import { Calendar, Clock, MapPin, AlertTriangle, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../../types/ModuleC';

interface EventListViewProps {
  events: CalendarEvent[];
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const EventListView: React.FC<EventListViewProps> = ({
  events,
  onEditEvent,
  onDeleteEvent
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string, allDay?: boolean) => {
    if (allDay) return 'All Day';
    if (!timeString) return 'All Day';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const getEventTypeColor = (eventType: string, isJurisdictional: boolean) => {
    if (isJurisdictional) return 'var(--color-error)';
    
    switch (eventType) {
      case 'deadline':
      case 'court_appearance':
        return 'var(--color-error)';
      case 'client_meeting':
      case 'settlement_reached':
        return 'var(--color-success)';
      default:
        return 'var(--color-blue-gray)';
    }
  };

  if (events.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
        color: 'var(--color-text-secondary)'
      }}>
        <Calendar size={48} color="var(--color-text-muted)" />
        <h3 style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text-secondary)',
          marginTop: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-sm)',
          fontFamily: 'var(--font-family-primary)'
        }}>
          No Events Found
        </h3>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-family-primary)'
        }}>
          Create your first event using the "New Event" button above.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--color-border-light)',
      overflow: 'hidden'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 120px 1fr 80px',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        backgroundColor: 'var(--color-sunflower-light)',
        borderBottom: '1px solid var(--color-border-light)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-family-primary)'
      }}>
        <div>Event Details</div>
        <div>Date</div>
        <div>Time</div>
        <div>Location</div>
        <div>Actions</div>
      </div>

      {/* Event Rows */}
      {events.map((event) => (
        <div
          key={event.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 120px 1fr 80px',
            gap: 'var(--spacing-md)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderBottom: '1px solid var(--color-border-light)',
            transition: 'background-color 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* Event Details */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-xs)'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getEventTypeColor(event.event_type, event.is_jurisdictional),
                flexShrink: 0
              }} />
              <h4 style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
                fontFamily: 'var(--font-family-primary)'
              }}>
                {event.title}
              </h4>
              {event.is_jurisdictional && (
                <AlertTriangle size={14} color="var(--color-error)" title="Jurisdictional Deadline" />
              )}
              {event.task_id && (
                <CheckSquare size={14} color="var(--color-blue-gray)" title="Linked to Task" />
              )}
            </div>
            {event.description && (
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                margin: 0,
                fontFamily: 'var(--font-family-primary)'
              }}>
                {event.description}
              </p>
            )}
            {(event.case_name || event.cm_number) && (
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                margin: 'var(--spacing-xs) 0 0 0',
                fontFamily: 'var(--font-family-primary)'
              }}>
                {event.case_name} {event.cm_number && `(${event.cm_number})`}
              </p>
            )}
          </div>

          {/* Date */}
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-primary)'
          }}>
            {formatDate(event.event_date)}
          </div>

          {/* Time */}
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
          }}>
            <Clock size={12} />
            {formatTime(event.event_time, event.all_day)}
          </div>

          {/* Location */}
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)'
          }}>
            {event.location && (
              <>
                <MapPin size={12} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {event.location}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-xs)'
          }}>
            {onEditEvent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditEvent(event);
                }}
                style={{
                  padding: 'var(--spacing-xs)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Edit Event"
              >
                <Edit size={14} color="var(--color-text-secondary)" />
              </button>
            )}
            {onDeleteEvent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this event?')) {
                    onDeleteEvent(event.id);
                  }
                }}
                style={{
                  padding: 'var(--spacing-xs)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-light)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Delete Event"
              >
                <Trash2 size={14} color="var(--color-error)" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventListView;
