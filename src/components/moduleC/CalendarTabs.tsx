import React from 'react';
import { Calendar, List, AlertTriangle, CheckSquare } from 'lucide-react';

export type CalendarTabId = 'calendar' | 'events' | 'deadlines' | 'tasks';

interface CalendarTab {
  id: CalendarTabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const calendarTabs: CalendarTab[] = [
  {
    id: 'calendar',
    label: 'Calendar View',
    icon: <Calendar size={16} />,
    description: 'Month grid view with visual event display'
  },
  {
    id: 'events',
    label: 'All Events',
    icon: <List size={16} />,
    description: 'Complete list of all calendar events'
  },
  {
    id: 'deadlines',
    label: 'Deadlines',
    icon: <AlertTriangle size={16} />,
    description: 'Jurisdictional deadlines and court dates'
  },
  {
    id: 'tasks',
    label: 'Task Events',
    icon: <CheckSquare size={16} />,
    description: 'Events linked to specific tasks'
  }
];

interface CalendarTabsProps {
  activeTab: CalendarTabId;
  onTabChange: (tabId: CalendarTabId) => void;
  eventCounts?: {
    events: number;
    deadlines: number;
    tasks: number;
  };
}

export const CalendarTabs: React.FC<CalendarTabsProps> = ({
  activeTab,
  onTabChange,
  eventCounts
}) => {
  const getTabCount = (tabId: CalendarTabId): number | undefined => {
    if (!eventCounts) return undefined;
    
    switch (tabId) {
      case 'events':
        return eventCounts.events;
      case 'deadlines':
        return eventCounts.deadlines;
      case 'tasks':
        return eventCounts.tasks;
      default:
        return undefined;
    }
  };

  return (
    <div style={{
      display: 'flex',
      borderBottom: '2px solid var(--color-border-light)',
      marginBottom: 'var(--spacing-lg)',
      backgroundColor: 'var(--color-bg-secondary)'
    }}>
      {calendarTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = getTabCount(tab.id);
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: isActive ? 'var(--color-bg-primary)' : 'transparent',
              border: 'none',
              borderBottom: isActive ? '3px solid var(--color-sunflower)' : '3px solid transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'var(--font-family-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }
            }}
            title={tab.description}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {count !== undefined && count > 0 && (
              <span style={{
                backgroundColor: isActive ? 'var(--color-sunflower)' : 'var(--color-blue-gray)',
                color: isActive ? 'var(--color-text-primary)' : 'white',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CalendarTabs;
