"use client";

import { TurnServerTester } from "../../../components/turn-server-tester";

export default function TestPage() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Network Connectivity Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive test of all TURN servers to identify connection issues and optimal configurations.
        </p>
      </div>
      
      <TurnServerTester />
    </main>
  );
}