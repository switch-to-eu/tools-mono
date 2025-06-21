"use client";

import { PomodoroTimer } from '../../../components/pomodoro-timer';
import { TodoList } from '../../../components/todo-list';
import { PomodoroSettingsProvider } from '../../../hooks/use-pomodoro-settings';
import { TasksProvider, useTasks } from '../../../hooks/use-tasks';

function TimerWithActiveTask() {
  const { tasks, activeTaskId } = useTasks();
  const activeTask = tasks.find(task => task.id === activeTaskId) || null;

  return <PomodoroTimer activeTask={activeTask} />;
}

export default function FocusPage() {
  return (
    <PomodoroSettingsProvider>
      <TasksProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
              KeepFocus - Pomodoro Timer & Tasks
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Todo List */}
              <div className="space-y-4">
                <TodoList
                  title="Your Tasks"
                  placeholder="Add a new task to focus on..."
                  showActiveButton={true}
                  showMoveButtons={true}
                  showCompletedSection={true}
                />
              </div>

              {/* Pomodoro Timer */}
              <div className="space-y-4">
                <TimerWithActiveTask />
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                How to Use
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <div className="font-medium mb-2">1. Add Tasks</div>
                  <p>Create tasks you want to work on in the todo list</p>
                </div>
                <div>
                  <div className="font-medium mb-2">2. Set Active Task</div>
                  <p>Click the timer icon on a task to make it active</p>
                </div>
                <div>
                  <div className="font-medium mb-2">3. Start Timer</div>
                  <p>Use the Pomodoro timer to focus for 25-minute sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TasksProvider>
    </PomodoroSettingsProvider>
  );
}