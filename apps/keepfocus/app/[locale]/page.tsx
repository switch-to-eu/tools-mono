"use client";

import { useTranslations } from 'next-intl';
import { PomodoroTimer } from '../../components/pomodoro-timer';
import { TodoList } from '../../components/todo-list';
import { SettingsDialog } from '../../components/settings-dialog';
import { PomodoroSettingsProvider } from '../../hooks/use-pomodoro-settings';
import { TasksProvider, useTasks } from '../../hooks/use-tasks';

export default function HomePage() {
  const t = useTranslations();

  return (
    <TasksProvider>
      <PomodoroSettingsProvider>
        <main className="container mx-auto py-8 max-w-6xl">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Timer Section */}
            <div className="space-y-6">
              <PomodoroTimer />

              {/* Settings Dialog */}
              <div className="w-full max-w-md mx-auto">
                <SettingsDialog />
              </div>
            </div>

            {/* Todo List Section */}
            <div className="space-y-6">
              <div>
                <TodoList />
              </div>
            </div>
          </div>
        </main>
      </PomodoroSettingsProvider>
    </TasksProvider>
  );
}