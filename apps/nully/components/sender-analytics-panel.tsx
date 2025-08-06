"use client";

import { useTranslations } from "next-intl";
import { Activity, Download, Clock, HardDrive, TrendingUp } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import type { SessionAnalytics, FileDownloadStats } from "../lib/interfaces";
import type { ConnectionType } from "../hooks/use-peer-connection";
import { ConnectionTypeIndicator } from "./connection-type-indicator";

interface SenderAnalyticsPanelProps {
  sessionAnalytics: SessionAnalytics;
  activeTransfers: Set<string>;
  stagedFiles: File[];
  connectionType: ConnectionType;
  isConnected: boolean;
}

export function SenderAnalyticsPanel({
  sessionAnalytics,
  activeTransfers,
  stagedFiles,
  connectionType,
  isConnected,
}: SenderAnalyticsPanelProps) {
  const t = useTranslations("Nully.Sender");

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format session duration
  const formatDuration = (startTime: number): string => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Get file stats array sorted by download count
  const fileStatsArray = Array.from(sessionAnalytics.fileStats.values())
    .sort((a, b) => b.downloadCount - a.downloadCount);

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">{t("analytics.title")}</h3>
        </div>
        {isConnected && (
          <ConnectionTypeIndicator connectionType={connectionType} />
        )}
      </div>

      {/* Active Transfers */}
      {activeTransfers.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">{t("analytics.activeTransfers")}</span>
            <Badge variant="secondary">{activeTransfers.size}</Badge>
          </div>
          
          <div className="space-y-1">
            {Array.from(activeTransfers).map((fileId) => {
              const file = stagedFiles.find(f => f.name.includes(fileId.split('-')[0] || fileId)); // Simple matching
              return (
                <div key={fileId} className="text-xs text-gray-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  {file ? file.name : t("analytics.transferring")}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3 text-green-500" />
            <span className="text-xs text-gray-500">{t("analytics.totalDownloads")}</span>
          </div>
          <p className="text-lg font-semibold text-green-600">{sessionAnalytics.totalDownloads}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <HardDrive className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-gray-500">{t("analytics.totalBytes")}</span>
          </div>
          <p className="text-lg font-semibold text-blue-600">
            {formatFileSize(sessionAnalytics.totalBytesTransferred)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-purple-500" />
            <span className="text-xs text-gray-500">{t("analytics.sessionTime")}</span>
          </div>
          <p className="text-lg font-semibold text-purple-600">
            {formatDuration(sessionAnalytics.sessionStartTime)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-gray-500" />
            <span className="text-xs text-gray-500">{t("analytics.filesShared")}</span>
          </div>
          <p className="text-lg font-semibold text-gray-600">{stagedFiles.length}</p>
        </div>
      </div>

      {/* File Download Stats */}
      {fileStatsArray.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{t("analytics.fileStats")}</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {fileStatsArray.map((stats) => (
              <div key={stats.fileId} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                <span className="truncate flex-1">{stats.fileName}</span>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="outline" className="text-xs">
                    {stats.downloadCount}x
                  </Badge>
                  <span className="text-gray-500">
                    {formatFileSize(stats.totalBytesTransferred)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No activity message */}
      {sessionAnalytics.totalDownloads === 0 && activeTransfers.size === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">{t("analytics.noActivity")}</p>
        </div>
      )}
    </Card>
  );
}