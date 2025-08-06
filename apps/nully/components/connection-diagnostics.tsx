"use client";

import { useState, useEffect } from "react";
import { diagnoseConnectivity } from "@/lib/peer-fallback-config";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";

interface DiagnosticResult {
  hasInternet: boolean;
  stunReachable: boolean;
  turnReachable: boolean;
  behindNAT: boolean;
  recommendation: string;
}

export function ConnectionDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const locale = params.locale as string;

  const runDiagnostics = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    
    try {
      console.log("[Diagnostics] Starting connectivity test...");
      const diagnosticResults = await diagnoseConnectivity();
      console.log("[Diagnostics] Results:", diagnosticResults);
      setResults(diagnosticResults);
    } catch (err) {
      console.error("[Diagnostics] Error:", err);
      setError(err instanceof Error ? err.message : "Diagnostic test failed");
    } finally {
      setIsRunning(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return null;
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connection Diagnostics</h3>
        <div className="flex gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Run Quick Test"
            )}
          </Button>
          <Button
            onClick={() => window.open(`/${locale}/test`, '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Test
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {results && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-sm font-medium">Internet Connection</span>
              <StatusIcon status={results.hasInternet} />
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-sm font-medium">STUN Servers</span>
              <StatusIcon status={results.stunReachable} />
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-sm font-medium">TURN Servers</span>
              <StatusIcon status={results.turnReachable} />
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="text-sm font-medium">Behind NAT/Firewall</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {results.behindNAT ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Recommendation
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {results.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Additional troubleshooting tips */}
          {results.behindNAT && !results.turnReachable && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                Troubleshooting Tips:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Try switching to a different network (mobile hotspot)</li>
                <li>Disable VPN if you're using one</li>
                <li>Check firewall settings for WebRTC/UDP blocking</li>
                <li>Try using a different browser</li>
                <li>Contact your network administrator about TURN server access</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {!results && !error && !isRunning && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Click "Run Diagnostics" to test your connection
        </p>
      )}
    </Card>
  );
}