import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import '../../styles/design-system.css';
import { CalendarEvent, CalendarEventFilters, CalendarEventInput, EventCreationContext } from '../../types/ModuleC';
import { EventCreationForm } from '../shared/EventCreationForm';
import { CalendarTabs, CalendarTabId } from './CalendarTabs';
import { EventListView } from './EventListView';

interface CalendarPageProps {}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export const CalendarPage: React.FC<CalendarPageProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<CalendarTabId>('calendar');

  // Load events for the current month
  useEffect(() => {
    loadMonthEvents();
    
    // Also check what cases exist to ensure case_id: 1 is valid
    checkAvailableCases();
  }, [currentDate]);

  const checkAvailableCases = async () => {
    try {
      const cases = await window.electron.db.getCases();
      console.log('📋 Available cases in database:', cases);
      if (cases.length === 0) {
        console.log('⚠️ No cases found! You may need to create a case first.');
      } else {
        console.log('✅ Found', cases.length, 'cases. Using case ID:', cases[0]?.id || 'unknown');
      }
    } catch (error) {
      console.error('❌ Error checking cases:', error);
    }
  };

  const loadMonthEvents = async () => {
    setLoading(true);
    try {
      // First, load ALL events to see if any exist
      const allEvents = await window.electron.db.getCalendarEvents();
      console.log('🔍 ALL events in database:', allEvents);
      
      if (allEvents.length === 0) {
        console.log('⚠️ No events found in database at all');
        setEvents([]);
        setLoading(false);
        return;
      }

      // If we have events, try filtering by month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const filters: CalendarEventFilters = {
        start_date: startOfMonth.toISOString().split('T')[0],
        end_date: endOfMonth.toISOString().split('T')[0]
      };

      console.log('📅 Loading events for month:', currentDate.toLocaleDateString());
      console.log('📅 Date range:', filters.start_date, 'to', filters.end_date);
      
      const monthEvents = await window.electron.db.getCalendarEvents(filters);
      console.log('📅 Filtered month events:', monthEvents);
      
      // For now, show ALL events until we debug the filtering
      console.log('🔧 Temporarily showing ALL events to debug filtering issue');
      setEvents(allEvents);
      
    } catch (error) {
      console.error('❌ Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar grid
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    
    // Start from the Sunday of the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks × 7 days) to fill the grid
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      
      // Find events for this date
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = events.filter(event => {
        const eventDateString = event.event_date;
        return eventDateString === dateString;
      });
      
      // Debug logging only if we find events
      if (dayEvents.length > 0) {
        console.log(`📅 Found ${dayEvents.length} events for ${dateString}:`, dayEvents.map(e => e.title));
      }
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        events: dayEvents
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setShowEventForm(true);
  };

  const handleNewEvent = () => {
    setSelectedDate(new Date());
    setShowEventForm(true);
  };

  const handleEventSubmit = async (eventData: CalendarEventInput) => {
    try {
      console.log('💾 Attempting to save event with data:', eventData);
      
      // Validate required fields before saving
      if (!eventData.case_id || eventData.case_id === 0) {
        console.error('❌ Case ID is missing or zero:', eventData.case_id);
        throw new Error('Case ID is required');
      }
      
      if (!eventData.title?.trim()) {
        console.error('❌ Event title is missing');
        throw new Error('Event title is required');
      }
      
      const eventId = await window.electron.db.createCalendarEvent(eventData);
      console.log('✅ Event created successfully with ID:', eventId);
      
      // Close the form first
      setShowEventForm(false);
      
      // Reload events to show the new event
      console.log('🔄 Reloading events...');
      await loadMonthEvents();
      
    } catch (error) {
      console.error('❌ Failed to create calendar event:', error);
      throw error; // Let EventCreationForm handle the error display
    }
  };

  const getEventCreationContext = (): EventCreationContext => {
    return {
      source: 'calendar',
      case_id: 1, // Default case - user should change in form if needed
      prefilled_data: selectedDate ? {
        event_date: selectedDate.toISOString().split('T')[0],
        event_type: 'general_event',
        all_day: true,
        case_id: 1 // Ensure case_id is set in prefilled data too
      } : {
        case_id: 1 // Default case_id even when no date selected
      }
    };
  };

  // Filter events for different tabs
  const getFilteredEvents = (tabId: CalendarTabId): CalendarEvent[] => {
    switch (tabId) {
      case 'deadlines':
        return events.filter(event => event.is_jurisdictional);
      case 'tasks':
        return events.filter(event => event.task_id);
      case 'events':
      default:
        return events;
    }
  };

  // Calculate event counts for tab badges
  const getEventCounts = () => {
    return {
      events: events.length,
      deadlines: events.filter(event => event.is_jurisdictional).length,
      tasks: events.filter(event => event.task_id).length
    };
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await window.electron.db.deleteCalendarEvent(eventId);
      console.log('Event deleted successfully');
      await loadMonthEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const calendarDays = generateCalendarDays();

  // Format month/year display
  const monthYear = currentDate.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      height: '100vh',
      overflow: 'auto',
      backgroundColor: 'var(--color-background-primary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-md)',
        borderBottom: '2px solid var(--color-sunflower)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)'
        }}>
          <Calendar 
            size={28} 
            color="var(--color-sunflower)" 
          />
          <h1 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
            fontFamily: 'var(--font-family-primary)'
          }}>
            Calendar & Deadlines
          </h1>
        </div>
        
        <button
          onClick={handleNewEvent}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'var(--color-sunflower)',
            color: 'var(--color-background-primary)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-family-primary)',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Plus size={16} />
          New Event
        </button>
      </div>

      {/* Tier 2 Navigation Tabs */}
      <CalendarTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        eventCounts={getEventCounts()}
      />

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'calendar' && (
        <>
          {/* Month Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)'
        }}>
          <button
            onClick={() => navigateMonth('prev')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--border-radius-md)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower-light)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'}
          >
            <ChevronLeft size={20} color="var(--color-text-primary)" />
          </button>
          
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0,
            minWidth: '200px',
            textAlign: 'center',
            fontFamily: 'var(--font-family-primary)'
          }}>
            {monthYear}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--color-background-secondary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--border-radius-md)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower-light)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'}
          >
            <ChevronRight size={20} color="var(--color-text-primary)" />
          </button>
        </div>
        
        <button
          onClick={goToToday}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            backgroundColor: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-family-primary)',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-sunflower-light)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'}
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        backgroundColor: 'var(--color-background-secondary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden'
      }}>
        {/* Week Day Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: 'var(--color-sunflower-light)',
          borderBottom: '1px solid var(--color-border-primary)'
        }}>
          {weekDays.map(day => (
            <div
              key={day}
              style={{
                padding: 'var(--spacing-sm)',
                textAlign: 'center',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-primary)',
                borderRight: '1px solid var(--color-border-primary)'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, 120px)' // Fixed row height for consistency
        }}>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              style={{
                border: '1px solid var(--color-border-primary)',
                padding: 'var(--spacing-xs)',
                backgroundColor: day.isCurrentMonth 
                  ? (day.isToday ? 'var(--color-sunflower-lighter)' : 'var(--color-background-primary)')
                  : 'var(--color-background-tertiary)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                if (day.isCurrentMonth) {
                  e.currentTarget.style.backgroundColor = 'var(--color-sunflower-lighter)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = day.isCurrentMonth 
                  ? (day.isToday ? 'var(--color-sunflower-lighter)' : 'var(--color-background-primary)')
                  : 'var(--color-background-tertiary)';
              }}
            >
              {/* Day Number */}
              <div style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: day.isToday ? 700 : 500,
                color: day.isCurrentMonth 
                  ? (day.isToday ? 'var(--color-text-primary)' : 'var(--color-text-primary)')
                  : 'var(--color-text-tertiary)',
                marginBottom: 'var(--spacing-xs)',
                fontFamily: 'var(--font-family-primary)'
              }}>
                {day.date.getDate()}
              </div>

              {/* Events */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: '80px',
                overflow: 'hidden'
              }}>
                {day.events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    style={{
                      fontSize: '10px',
                      padding: '2px 4px',
                      backgroundColor: event.is_jurisdictional 
                        ? 'var(--color-error)' 
                        : 'var(--color-primary)',
                      color: 'white',
                      borderRadius: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                    title={`${event.title} - ${event.event_time || 'All Day'}`}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-family-primary)'
                  }}>
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {/* Event List Tab */}
      {(activeTab === 'events' || activeTab === 'deadlines' || activeTab === 'tasks') && (
        <EventListView 
          events={getFilteredEvents(activeTab)}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={(event) => {
            // TODO: Implement event editing
            console.log('Edit event:', event);
          }}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-primary)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--border-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-primary)'
          }}>
            <div className="spinner" style={{
              width: '20px',
              height: '20px',
              border: '2px solid var(--color-border-light)',
              borderTop: '2px solid var(--color-sunflower)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading calendar events...
          </div>
        </div>
      )}

      {/* EventCreationForm Modal */}
      {showEventForm && (
        <EventCreationForm
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSubmit={handleEventSubmit}
          context={getEventCreationContext()}
        />
      )}
    </div>
  );
};
