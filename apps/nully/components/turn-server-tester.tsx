"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { 
  runComprehensiveTurnTest, 
  exportTestReport,
  TurnTestReport, 
  TurnServerTest 
} from "@/lib/turn-server-tester";
import { 
  Play, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2,
  Network,
  Shield,
  Zap
} from "lucide-react";

export function TurnServerTester() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, serverName: '' });
  const [report, setReport] = useState<TurnTestReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setError(null);
    setReport(null);
    setProgress({ current: 0, total: 0, serverName: '' });
    
    try {
      console.log("[TURN Tester] Starting comprehensive test...");
      
      const testReport = await runComprehensiveTurnTest(
        (current, total, serverName) => {
          setProgress({ current, total, serverName });
        }
      );
      
      console.log("[TURN Tester] Test completed:", testReport);
      setReport(testReport);
    } catch (err) {
      console.error("[TURN Tester] Test failed:", err);
      setError(err instanceof Error ? err.message : "Test failed");
    } finally {
      setIsRunning(false);
      setProgress({ current: 0, total: 0, serverName: '' });
    }
  };

  const getResultIcon = (result: TurnServerTest['result']) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'timeout':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getResultColor = (result: TurnServerTest['result']) => {
    switch (result) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'timeout':
        return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Network className="w-5 h-5" />
              TURN Server Comprehensive Test
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Test all TURN servers individually to identify which ones work in your network
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? 'Testing...' : 'Run Tests'}
            </Button>
            
            {report && (
              <Button
                variant="outline"
                onClick={() => exportTestReport(report)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Testing: {progress.serverName}</span>
              <span>{progress.current}/{progress.total}</span>
            </div>
            <Progress value={progressPercent} className="w-full" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-md flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </Card>

      {/* Results Overview */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Test Results Overview
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold">{report.totalServers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Servers</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{report.successfulServers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Working</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{report.failedServers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((report.successfulServers / report.totalServers) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Recommendations
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Detailed Results */}
      {report && report.testResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Test Results</h3>
          
          <div className="space-y-3">
            {report.testResults.map((test, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${getResultColor(test.result)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getResultIcon(test.result)}
                    <span className="font-medium">{test.name}</span>
                    <span className="text-sm text-gray-500">
                      ({test.duration}ms)
                    </span>
                  </div>
                  <span className="text-sm font-medium capitalize">
                    {test.result}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex gap-4 mb-1">
                    <span>URL: {test.server.urls}</span>
                  </div>
                  <div className="flex gap-4">
                    <span>Local: {test.details.localCandidates}</span>
                    <span>Host: {test.details.hostCandidates}</span>
                    <span>Srflx: {test.details.srflxCandidates}</span>
                    <span className={`font-medium ${test.details.relayCandidates > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Relay: {test.details.relayCandidates}
                    </span>
                  </div>
                  {test.error && (
                    <div className="text-red-600 dark:text-red-400 mt-1">
                      Error: {test.error}
                    </div>
                  )}
                  {test.relayCandidate && (
                    <div className="text-green-600 dark:text-green-400 mt-1">
                      ✅ Relay: {test.relayCandidate.address}:{test.relayCandidate.port} ({test.relayCandidate.protocol})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Network Info */}
      {report && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Platform:</span> {report.networkInfo.platform}
            </div>
            <div>
              <span className="font-medium">Language:</span> {report.networkInfo.language}
            </div>
            <div>
              <span className="font-medium">Online:</span> {report.networkInfo.onLine ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Test Time:</span> {new Date(report.timestamp).toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}