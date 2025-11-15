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
              Task Details (Loading...)
            </h2>
          </div>

          {/* Temporary content while we fix the full component */}
          <div style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}>
            <Circle size={48} style={{ margin: '0 auto var(--spacing-md) auto' }} />
            <p>Task details will appear here once the component is fully loaded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
