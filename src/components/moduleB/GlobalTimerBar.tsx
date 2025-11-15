// GLOBAL TIMER BAR - MODULE B
// Dy's Sunflower Suite v5.0
// Fixed timer bar at bottom of window (ESSENTIAL feature)

import { useEffect, useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { Play, Pause, Square } from 'lucide-react';
import '../../styles/design-system.css';

const MAX_TIMER_MS = 6 * 60 * 60 * 1000; // 6 hours
const WARNING_TIMER_MS = 5 * 60 * 60 * 1000; // 5 hours

export function GlobalTimerBar() {
  const {
    activeTimerId,
    timerPausedAt,
    getElapsedTime,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tasks,
  } = useTaskStore();

  const [displayTime, setDisplayTime] = useState('00:00:00');

  const activeTask = tasks.find(t => t.id === activeTimerId);

  // Update display time every second
  useEffect(() => {
    if (!activeTimerId) return;

    const interval = setInterval(() => {
      const elapsed = getElapsedTime();
      setDisplayTime(formatTime(elapsed));

      // Auto-stop at 6 hours
      if (elapsed >= MAX_TIMER_MS) {
        clearInterval(interval);
        alert('Timer has reached 6 hours and will be automatically stopped.');
        handleStop();
      }
    }, 100); // Update 10x per second for smooth display

    return () => clearInterval(interval);
  }, [activeTimerId, timerPausedAt, getElapsedTime]);

  // Show warning at 5 hours
  useEffect(() => {
    if (!activeTimerId) return;

    const elapsed = getElapsedTime();
    if (elapsed >= WARNING_TIMER_MS && elapsed < MAX_TIMER_MS) {
      // Show warning once
      const hasShownWarning = sessionStorage.getItem(`timer-warning-${activeTimerId}`);
      if (!hasShownWarning) {
        alert('Timer has been running for 5 hours. It will auto-stop at 6 hours.');
        sessionStorage.setItem(`timer-warning-${activeTimerId}`, 'true');
      }
    }
  }, [activeTimerId, displayTime]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (timerPausedAt) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleStop = async () => {
    // Auto-save timer session without prompting
    await stopTimer();
    if (activeTimerId) {
      sessionStorage.removeItem(`timer-warning-${activeTimerId}`);
    }
  };

  if (!activeTimerId || !activeTask) {
    return null; // Don't render if no timer is active
  }

  const elapsed = getElapsedTime();
  const isPaused = timerPausedAt !== null;
  const isWarning = elapsed >= WARNING_TIMER_MS;

  // Determine background color
  let backgroundColor = 'var(--color-sunflower)'; // Normal - sunflower yellow
  let textColor = 'var(--color-brown-primary)'; // Dark brown text
  if (isPaused) {
    backgroundColor = 'var(--color-blue-gray)'; // Paused - blue-gray
    textColor = 'white';
  } else if (isWarning) {
    backgroundColor = 'var(--color-error)'; // Warning - muted red
    textColor = 'white';
  }

  return (
    <>
      {/* Global Timer Bar - Fixed at Bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor,
        color: textColor,
        boxShadow: 'var(--shadow-lg)',
        borderTop: '2px solid var(--color-border-medium)',
      }}>
        <div style={{ 
          padding: 'var(--spacing-xs) var(--spacing-md)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {/* Task Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-md)', 
            flex: 1, 
            minWidth: 0 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <div style={{
                width: '12px',
                height: '12px', 
                borderRadius: '50%',
                backgroundColor: isPaused ? 'var(--color-text-muted)' : 'var(--color-sage)',
                animation: isPaused ? 'none' : 'pulse 2s infinite',
              }} />
              <span style={{ 
                fontWeight: 600, 
                fontSize: 'var(--font-size-xs)', 
                letterSpacing: '0.5px' 
              }}>
                TIMER {isPaused ? 'PAUSED' : 'RUNNING'}
              </span>
            </div>
            <div style={{ 
              borderLeft: `1px solid ${textColor}`, 
              opacity: 0.3, 
              height: '24px' 
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ 
                fontSize: 'var(--font-size-sm)', 
                fontWeight: 500, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }} title={activeTask.title}>
                {activeTask.title}
              </p>
              <p style={{ 
                fontSize: 'var(--font-size-xs)', 
                opacity: 0.8,
                marginTop: '2px' 
              }}>
                {activeTask.case_id && `Case ID: ${activeTask.case_id}`}
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: 700, 
                fontFamily: 'monospace', 
                letterSpacing: '2px' 
              }}>
                {displayTime}
              </div>
              {isWarning && (
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: '#FFEB3B', 
                  fontWeight: 600, 
                  animation: 'pulse 2s infinite',
                  marginTop: '2px' 
                }}>
                  ⚠️ Near 6-hour limit
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <button
                onClick={handlePauseResume}
                title={isPaused ? 'Resume Timer' : 'Pause Timer'}
                style={{
                  padding: 'var(--spacing-xs)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  color: textColor,
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                {isPaused ? (
                  <Play size={16} />
                ) : (
                  <Pause size={16} />
                )}
              </button>
              <button
                onClick={handleStop}
                title="Stop Timer"
                style={{
                  padding: 'var(--spacing-xs)',
                  backgroundColor: 'var(--color-error)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Square size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

