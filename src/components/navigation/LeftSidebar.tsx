// LEFT SIDEBAR - Tier 1 Global Navigation
// Persistent left sidebar with main module navigation

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Mail 
} from 'lucide-react';
import '../../styles/design-system.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

const tierOneModules: NavItem[] = [
  { id: 'cases', label: 'Case Manager', icon: Briefcase, path: '/' },
  { id: 'tasks', label: 'Task & Workflow', icon: CheckSquare, path: '/tasks' },
  { id: 'calendar', label: 'Calendar & Deadlines', icon: Calendar, path: '/calendar' },
  { id: 'documents', label: 'Document Creation', icon: FileText, path: '/documents' },
  { id: 'correspondence', label: 'Correspondence', icon: Mail, path: '/correspondence' },
];

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className="left-sidebar"
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRight: '2px solid var(--color-border-medium)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo/Branding */}
      <div 
        style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '2px solid var(--color-border-medium)',
          backgroundColor: 'var(--color-sunflower)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          height: 'var(--navbar-height)',
        }}
      >
        <div 
          style={{
            fontSize: '28px',
            lineHeight: 1,
          }}
        >
          🌻
        </div>
        <div>
          <div 
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 700,
              color: 'var(--color-brown-primary)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            Dy's Suite
          </div>
          <div 
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-brown-medium)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            Case Management
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav 
        style={{
          flex: 1,
          padding: 'var(--spacing-md) 0',
          overflowY: 'auto',
        }}
      >
        {tierOneModules.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                border: 'none',
                backgroundColor: active ? 'var(--color-sunflower-light)' : 'transparent',
                color: active ? 'var(--color-brown-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderLeft: active ? '3px solid var(--color-sunflower)' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer - User Info */}
      <div 
        style={{
          padding: 'var(--spacing-md)',
          borderTop: '1px solid var(--color-border-light)',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}
        >
          <div 
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--border-radius-full)',
              backgroundColor: 'var(--color-sunflower)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--color-brown-primary)',
            }}
          >
            DW
          </div>
          <div>
            <div 
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              Dy Ward
            </div>
            <div 
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              Attorney
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

