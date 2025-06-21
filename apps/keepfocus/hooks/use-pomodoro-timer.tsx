"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerPhase, PomodoroSettings, PHASE_LABELS } from '../lib/types';
import { useNotifications } from './use-notifications';

interface TimerState {
  phase: TimerPhase;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
}

interface UsePomodoroTimerProps {
  settings: PomodoroSettings;
  onPomodoroComplete?: () => void;
  onPhaseChange?: (phase: TimerPhase) => void;
}

interface UsePomodoroTimerReturn {
  // Timer state
  phase: TimerPhase;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  progress: number;

  // Timer controls
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;

  // Utility functions
  formatTime: (seconds: number) => string;
  getPhaseEmoji: (phase: TimerPhase) => string;
}

// Phase labels are now handled by translations in components

const PHASE_EMOJIS: Record<TimerPhase, string> = {
  work: '🍅',
  shortBreak: '☕',
  longBreak: '🌿',
};

export const usePomodoroTimer = ({
  settings,
  onPomodoroComplete,
  onPhaseChange,
}: UsePomodoroTimerProps): UsePomodoroTimerReturn => {
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitle = useRef<string>('');
  const { showNotification, playNotificationSound, requestPermission } = useNotifications();

  // Calculate timer durations from settings
  const TIMER_DURATIONS = {
    work: settings.workDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60,
  };

  // Store original page title
  useEffect(() => {
    originalTitle.current = document.title;
    return () => {
      // Restore original title on cleanup
      document.title = originalTitle.current;
    };
  }, []);

  // Update page title when timer is running
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const formattedTime = formatTime(timeLeft);
      const emoji = PHASE_EMOJIS[phase];
      // Simple phase labels for title (not translated)
      const simpleLabels = { work: 'Focus', shortBreak: 'Break', longBreak: 'Long Break' };
      const label = simpleLabels[phase];
      document.title = `${emoji} ${formattedTime} - ${label}`;
    } else {
      document.title = originalTitle.current;
    }
  }, [isRunning, timeLeft, phase]);

  // Update timer duration when settings change (only if not running)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(TIMER_DURATIONS[phase]);
    }
  }, [settings, phase, isRunning, TIMER_DURATIONS]);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Handle phase completion when timer reaches zero
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handlePhaseComplete();
    }
  }, [timeLeft, isRunning]);

  const handlePhaseComplete = useCallback(async () => {
    setIsRunning(false);

    // Play sound notification if enabled
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    if (phase === 'work') {
      // Work session completed
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);

      // Call completion callback
      if (onPomodoroComplete) {
        onPomodoroComplete();
      }

      // Determine next phase (short break or long break)
      const isLongBreak = newCompletedPomodoros % settings.longBreakInterval === 0;
      const nextPhase: TimerPhase = isLongBreak ? 'longBreak' : 'shortBreak';

      setPhase(nextPhase);
      setTimeLeft(TIMER_DURATIONS[nextPhase]);

      // Notify about phase change
      if (onPhaseChange) {
        onPhaseChange(nextPhase);
      }

      // Show notification
      if (settings.desktopNotifications) {
        await showNotification({
          title: 'Pomodoro Complete! 🍅',
          body: `Time for a ${isLongBreak ? 'long' : 'short'} break.`,
          tag: 'pomodoro-complete',
        });
      }

      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      // Break completed, back to work
      setPhase('work');
      setTimeLeft(TIMER_DURATIONS.work);

      // Notify about phase change
      if (onPhaseChange) {
        onPhaseChange('work');
      }

      // Show notification
      if (settings.desktopNotifications) {
        await showNotification({
          title: 'Break Complete! ⏰',
          body: 'Time to get back to work.',
          tag: 'break-complete',
        });
      }

      // Auto-start work if enabled
      if (settings.autoStartWork) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  }, [
    phase,
    completedPomodoros,
    settings,
    onPomodoroComplete,
    onPhaseChange,
    playNotificationSound,
    showNotification,
    TIMER_DURATIONS,
  ]);

  const start = useCallback(async () => {
    // Request notification permission when starting timer
    if (settings.desktopNotifications) {
      await requestPermission();
    }
    setIsRunning(true);
  }, [settings.desktopNotifications, requestPermission]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[phase]);
  }, [TIMER_DURATIONS, phase]);

  const skip = useCallback(() => {
    setIsRunning(false);
    // Immediately trigger phase completion
    handlePhaseComplete();
  }, [handlePhaseComplete]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // getPhaseLabel removed - now handled by translations in components

  const getPhaseEmoji = useCallback((currentPhase: TimerPhase): string => {
    return PHASE_EMOJIS[currentPhase];
  }, []);

  // Calculate progress percentage
  const progress = ((TIMER_DURATIONS[phase] - timeLeft) / TIMER_DURATIONS[phase]) * 100;

  return {
    // Timer state
    phase,
    timeLeft,
    isRunning,
    completedPomodoros,
    progress,

    // Timer controls
    start,
    pause,
    reset,
    skip,

    // Utility functions
    formatTime,
    getPhaseEmoji,
  };
};