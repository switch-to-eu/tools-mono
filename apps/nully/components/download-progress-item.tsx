"use client";

import { useTranslations } from "next-intl";
import { Download, X, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ProgressGreen } from "./progress-green";
import { Badge } from "@workspace/ui/components/badge";
import type { DownloadState, FileMetadata } from "../hooks/use-file-transfer";
import { formatFileSize, formatSpeed, formatETA } from "../lib/formatters";

interface DownloadProgressItemProps {
  file: FileMetadata;
  downloadState: DownloadState;
  onDownload: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  onClearError: () => void;
}

export function DownloadProgressItem({
  file,
  downloadState,
  onDownload,
  onRetry,
  onClearError,
}: DownloadProgressItemProps) {
  const t = useTranslations("Nully.Download");
  
  const isActiveDownload = downloadState.activeFileId === file.id;
  const isDownloading = downloadState.status === 'downloading' && isActiveDownload;
  const isCompleted = downloadState.status === 'completed' && isActiveDownload;
  const isFailed = downloadState.status === 'failed' && isActiveDownload;
  const canDownload = downloadState.status === 'idle' || 
                      (downloadState.status === 'completed' && !isActiveDownload) ||
                      (downloadState.status === 'failed' && !isActiveDownload);


  return (
    <div className="p-4 border rounded-lg space-y-3">
      {/* File info row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-gray-500" />
          <div>
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>

        {/* Action button */}
        <div>
          {canDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownload(file.id)}
              disabled={downloadState.status === 'downloading'}
            >
              <Download className="h-4 w-4 mr-2" />
              {t("download")}
            </Button>
          )}
          
          {isDownloading && downloadState.progress && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {downloadState.progress.percentage}%
              </span>
            </div>
          )}
          
          {isCompleted && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t("completed")}
            </Badge>
          )}
          
          {isFailed && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {t("failed")}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(file.id)}
              >
                {t("retry")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearError}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar and stats */}
      {isDownloading && downloadState.progress && (
        <div className="space-y-2">
          <ProgressGreen value={downloadState.progress.percentage} className="h-2" />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {formatFileSize(downloadState.progress.bytesReceived)} / {formatFileSize(downloadState.progress.totalBytes)}
            </span>
            <div className="flex gap-4">
              <span>{formatSpeed(downloadState.progress.speed)}</span>
              <span>ETA: {formatETA(downloadState.progress.eta)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {isFailed && downloadState.error && (
        <div className="text-xs text-red-500 mt-2">
          {downloadState.error}
        </div>
      )}
    </div>
  );
}