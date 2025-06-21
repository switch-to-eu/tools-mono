"use client";

import { useTranslations } from 'next-intl';
import { PomodoroTimer } from '../../components/pomodoro-timer';
import { TodoList } from '../../components/todo-list';
import { SettingsDialog } from '../../components/settings-dialog';
import { PomodoroSettingsProvider } from '../../hooks/use-pomodoro-settings';
import { TasksProvider, useTasks } from '../../hooks/use-tasks';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';

// Component that uses the tasks hook
function TimerWithActiveTask() {
  const t = useTranslations();
  const { tasks, activeTaskId, setActiveTask } = useTasks();
  const activeTask = tasks.find(task => task.id === activeTaskId) || null;

  return (
    <div className="space-y-6">
      <PomodoroTimer activeTask={activeTask} />

      {/* Active Task Display Box */}
      <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          {activeTask ? (
            <div className="text-center space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                🎯 {t('pomodoro.tasks.activeTask')}
              </div>
              <div className="font-medium text-lg">
                {activeTask.description}
              </div>
              <div className="text-sm text-muted-foreground">
                🍅 {activeTask.pomodoros} {t('pomodoro.tasks.pomodorosCompleted')}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTask(null)}
                className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300"
              >
                {t('pomodoro.tasks.deactivate')}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                ⏱️ {t('pomodoro.tasks.noActiveTask')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        <p>🍅 {t('homepage.footer')}</p>
        <p>{t('homepage.subtitle2')}</p>
      </div>

      {/* Settings Dialog */}
      <div className="w-full max-w-md mx-auto">
        <SettingsDialog />
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations();

  return (
    <TasksProvider>
      <PomodoroSettingsProvider>
        <main className="container mx-auto px-4 py-8 max-w-6xl">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Timer Section */}
            <div className="space-y-6">

              <TimerWithActiveTask />
            </div>

            {/* Todo List Section */}
            <div className="space-y-6">
              <div>
                <TodoList />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-900">
              {t('homepage.instructions.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">🍅 {t('homepage.instructions.timer.title')}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t('homepage.instructions.timer.focusSessions')}</li>
                  <li>{t('homepage.instructions.timer.shortBreaks')}</li>
                  <li>{t('homepage.instructions.timer.longBreaks')}</li>
                  <li>{t('homepage.instructions.timer.customizeSettings')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📝 {t('homepage.instructions.tasks.title')}</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{t('homepage.instructions.tasks.addTasks')}</li>
                  <li>{t('homepage.instructions.tasks.setActive')}</li>
                  <li>{t('homepage.instructions.tasks.autoCount')}</li>
                  <li>{t('homepage.instructions.tasks.localData')}</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </PomodoroSettingsProvider>
    </TasksProvider>
  );
}