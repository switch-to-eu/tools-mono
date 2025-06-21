"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Play, Pause, Square, SkipForward, Timer } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import { cn } from '@workspace/ui/lib/utils';
import { Task } from '../lib/types';
import { usePomodoroTimer } from '../hooks/use-pomodoro-timer';
import { usePomodoroSettings } from '../hooks/use-pomodoro-settings';
import { useTasks } from '../hooks/use-tasks';

interface PomodoroTimerProps {
  activeTask?: Task | null;
  className?: string;
}

export function PomodoroTimer({
  activeTask,
  className,
}: PomodoroTimerProps) {
  const t = useTranslations();
  const { settings } = usePomodoroSettings();
  const { incrementTaskPomodoros } = useTasks();

  const {
    phase,
    timeLeft,
    isRunning,
    completedPomodoros,
    progress,
    start,
    pause,
    reset,
    skip,
    formatTime,
    getPhaseEmoji,
  } = usePomodoroTimer({
    settings,
    onPomodoroComplete: () => {
      // Increment pomodoro count for active task
      if (activeTask) {
        incrementTaskPomodoros(activeTask.id);
      }
    },
    onPhaseChange: (newPhase) => {
      console.log(`Phase changed to: ${newPhase}`);
    },
  });

  const getPhaseColor = () => {
    switch (phase) {
      case 'work':
        return 'text-red-500 border-red-500';
      case 'shortBreak':
        return 'text-green-500 border-green-500';
      case 'longBreak':
        return 'text-blue-500 border-blue-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm", className)}>
      <CardHeader className="text-center pb-3">
        <CardTitle className="flex items-center justify-center gap-2">
          <Timer className="h-5 w-5" />
          {t('pomodoro.timer.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-3">
          <div className={cn(
            "text-6xl font-mono font-bold transition-colors duration-200",
            getPhaseColor()
          )}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center justify-center gap-2 text-lg font-medium">
            <span className="text-2xl">{getPhaseEmoji(phase)}</span>
            <span className={getPhaseColor()}>{t(`pomodoro.timer.phases.${phase}`)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress
            value={Math.max(0, Math.min(100, progress))}
            className="h-3"
          />
          <div className="text-sm text-muted-foreground text-center">
            {Math.round(Math.max(0, Math.min(100, progress)))}% {t('pomodoro.timer.complete')}
          </div>
        </div>



        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={isRunning ? pause : start}
            size="lg"
            className="flex items-center gap-2 min-w-[100px]"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                {t('pomodoro.timer.pause')}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {t('pomodoro.timer.start')}
              </>
            )}
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            {t('pomodoro.timer.reset')}
          </Button>
          <Button
            onClick={skip}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <SkipForward className="h-4 w-4" />
            {t('pomodoro.timer.skip')}
          </Button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <div className="text-center">
            <div className="font-medium text-lg">{completedPomodoros}</div>
            <div>{t('pomodoro.timer.pomodorosToday')}</div>
          </div>
          <div className="flex items-center">•</div>
          <div className="text-center">
            <div className={cn("font-medium text-lg", getPhaseColor())}>
              {t(`pomodoro.timer.phaseLabels.${phase}`)}
            </div>
            <div>{t('pomodoro.timer.currentPhase')}</div>
          </div>
        </div>

        {/* Phase indicator dots */}
        <div className="flex justify-center space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors duration-200",
            phase === 'work' ? 'bg-red-500' : 'bg-gray-300'
          )} />
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors duration-200",
            phase === 'shortBreak' ? 'bg-green-500' : 'bg-gray-300'
          )} />
          <div className={cn(
            "w-3 h-3 rounded-full transition-colors duration-200",
            phase === 'longBreak' ? 'bg-blue-500' : 'bg-gray-300'
          )} />
        </div>
      </CardContent>
    </Card>
  );
}