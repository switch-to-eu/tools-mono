"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Play, Pause, Square, SkipForward, Timer, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { Progress } from '@workspace/ui/components/progress';
import { cn } from '@workspace/ui/lib/utils';
import { Task } from '../lib/types';
import { usePomodoroTimer } from '../hooks/use-pomodoro-timer';
import { usePomodoroSettings } from '../hooks/use-pomodoro-settings';
import { useTasks } from '../hooks/use-tasks';
import { SettingsDialog } from './settings-dialog';

interface PomodoroTimerProps {
  className?: string;
}

export function PomodoroTimer({
  className,
}: PomodoroTimerProps) {
  const t = useTranslations();
  const { settings } = usePomodoroSettings();

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
    <Card className={cn("w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm", className)}>
      <CardHeader className="text-center pb-3 relative">
        <CardTitle className="flex items-center justify-center gap-2">
          <Timer className="h-5 w-5" />
          {t('pomodoro.timer.title')}
        </CardTitle>

        {/* Action buttons */}
        <div className="absolute top-0 right-3 flex items-center gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                title="How Pomodoro works"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  🍅 How the Pomodoro Technique Works
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-medium">Focus (25 minutes)</h4>
                      <p className="text-sm text-gray-600">Work on a single task with complete focus</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-medium">Short Break (5 minutes)</h4>
                      <p className="text-sm text-gray-600">Take a quick break to recharge</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-primary-color rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-medium">Long Break (15 minutes)</h4>
                      <p className="text-sm text-gray-600">After 4 pomodoros, take a longer break</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Stay focused during work sessions and truly rest during breaks for maximum effectiveness.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <SettingsDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            }
          />
        </div>
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
            variant="warning"
            size="lg"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            {t('pomodoro.timer.reset')}
          </Button>
          <Button
            onClick={skip}
            variant="secondary"
            size="lg"
            className="flex items-center gap-2"
          >
            <SkipForward className="h-4 w-4" />
            {t('pomodoro.timer.skip')}
          </Button>
        </div>

        {/* Simple Stats */}
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-medium">{completedPomodoros}</span> {t('pomodoro.timer.pomodorosToday')} • <span className={getPhaseColor()}>{t(`pomodoro.timer.phaseLabels.${phase}`)}</span>
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