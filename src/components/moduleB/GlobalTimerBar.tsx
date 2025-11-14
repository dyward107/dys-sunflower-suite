// GLOBAL TIMER BAR - MODULE B
// Dy's Sunflower Suite v5.0
// Fixed timer bar at bottom of window (ESSENTIAL feature)

import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { Play, Pause, Square } from 'lucide-react';

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
  const [showStopModal, setShowStopModal] = useState(false);

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

  const handleStop = () => {
    setShowStopModal(true);
  };

  const confirmStop = (createEntry: boolean) => {
    if (createEntry) {
      // Calculate duration and timestamps
      const elapsed = getElapsedTime();
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsed);

      // Open time entry modal with pre-filled data
      // This will be handled by the TimeEntryModal component
      const event = new CustomEvent('open-time-entry-modal', {
        detail: {
          task_id: activeTimerId,
          start_time: startTime.toISOString(),
          stop_time: now.toISOString(),
          duration_minutes: Math.floor(elapsed / 60000),
          entry_date: now.toISOString().split('T')[0],
        },
      });
      window.dispatchEvent(event);
    }

    stopTimer();
    sessionStorage.removeItem(`timer-warning-${activeTimerId}`);
    setShowStopModal(false);
  };

  if (!activeTimerId || !activeTask) {
    return null; // Don't render if no timer is active
  }

  const elapsed = getElapsedTime();
  const isPaused = timerPausedAt !== null;
  const isWarning = elapsed >= WARNING_TIMER_MS;

  // Determine background gradient
  let bgGradient = 'from-blue-500 to-blue-600'; // Normal
  if (isPaused) {
    bgGradient = 'from-gray-500 to-gray-600'; // Paused
  } else if (isWarning) {
    bgGradient = 'from-orange-500 to-red-600'; // Warning
  }

  return (
    <>
      {/* Global Timer Bar - Fixed at Bottom */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r ${bgGradient} text-white shadow-lg`}>
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Task Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-gray-300' : 'bg-green-400'} animate-pulse`} />
              <span className="font-semibold text-sm">TIMER RUNNING</span>
            </div>
            <div className="border-l border-white/30 h-6" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" title={activeTask.title}>
                {activeTask.title}
              </p>
              <p className="text-xs text-white/80">
                {activeTask.case_id && `Case ID: ${activeTask.case_id}`}
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-3xl font-bold font-mono tracking-wider">
                {displayTime}
              </div>
              {isWarning && (
                <div className="text-xs text-yellow-200 font-semibold animate-pulse">
                  ⚠️ Near 6-hour limit
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePauseResume}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title={isPaused ? 'Resume Timer' : 'Pause Timer'}
              >
                {isPaused ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleStop}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                title="Stop Timer"
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Confirmation Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Stop Timer
            </h3>
            <p className="text-gray-600 mb-4">
              Timer ran for: <span className="font-bold text-gray-900">{displayTime}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Would you like to create a time entry for this task?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => confirmStop(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Yes, Create Time Entry
              </button>
              <button
                onClick={() => confirmStop(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                No, Just Stop
              </button>
              <button
                onClick={() => setShowStopModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

