import { useState } from "react";
import { Laptop, Copy, Send, FilePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@workspace/ui/components/button";
import { ProgressGreen } from "./progress-green";
import {
  SectionCard,
  SectionHeader,
  SectionContent,
  SectionFooter,
} from "@workspace/ui/blocks/section-card";
import { ConnectionStatus, ConnectionType } from "../hooks/use-peer-connection";
import { usePolicyAcceptance } from "../hooks/use-policy-acceptance";
import { AcceptanceChecklist } from "./acceptance-checklist";
import { ConnectionTypeIndicator } from "./connection-type-indicator";
import type { SessionAnalytics } from "../lib/interfaces";
import type { DownloadProgress } from "../hooks/use-file-transfer";
import { formatFileSize } from "../lib/formatters";

interface HowToStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function HowToStep({ icon, title, description }: HowToStepProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  connectionType: ConnectionType;
}

function ConnectionIndicator({ status, connectionType }: ConnectionIndicatorProps) {
  const t = useTranslations("Nully.Connection");
  const isConnected = status === "connected";

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border bg-gray-50 p-4">
      <div className="flex items-center gap-4">
        <Laptop
          className={`h-8 w-8 transition-colors ${isConnected ? "text-green-500" : "text-gray-400"
            }`}
        />
        <div
          className={`h-1 w-12 rounded-full transition-colors ${isConnected ? "bg-green-500" : "bg-gray-300"
            }`}
        />
        <Laptop
          className={`h-8 w-8 transition-colors ${isConnected ? "text-green-500" : "text-gray-400"
            }`}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          {isConnected ? t("connected") : t("waiting")}
        </p>
        {isConnected && connectionType !== "unknown" && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <ConnectionTypeIndicator connectionType={connectionType} />
          </div>
        )}
      </div>
    </div>
  );
}

interface StagedFileWithId {
  fileId: string;
  file: File;
}

interface StagedFilesProps {
  stagedFiles: StagedFileWithId[];
  activeTransfers: Set<string>;
  sessionAnalytics: SessionAnalytics;
  uploadProgress: Map<string, DownloadProgress>;
}

function StagedFiles({ stagedFiles, activeTransfers, sessionAnalytics, uploadProgress }: StagedFilesProps) {
  const t = useTranslations("Nully.Send");
  
  // Helper function to check if a file is being transferred
  const isFileTransferring = (fileId: string) => {
    return activeTransfers.has(fileId);
  };

  // Helper function to get file download stats
  const getFileStats = (fileId: string) => {
    return sessionAnalytics.fileStats.get(fileId);
  };

  // Helper function to get upload progress for a file
  const getUploadProgress = (fileId: string) => {
    return uploadProgress.get(fileId) || null;
  };


  if (stagedFiles.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        {t("noFilesStaged")}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{t("stagedFilesTitle")}</h3>
      <ul className="divide-y rounded-md border">
        {stagedFiles.map((stagedFile, i) => {
          const { fileId, file } = stagedFile;
          const isTransferring = isFileTransferring(fileId);
          const fileStats = getFileStats(fileId);
          const progress = getUploadProgress(fileId);
          
          return (
            <li key={fileId} className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isTransferring && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {fileStats && fileStats.downloadCount > 0 && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        {fileStats.downloadCount}x
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Upload Progress Bar */}
                {isTransferring && progress && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Uploading {progress.percentage}%</span>
                      <span>{progress.speed.toFixed(1)} MB/s</span>
                    </div>
                    <ProgressGreen value={progress.percentage} className="h-2" />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface SendPageProps {
  shareUrl: string;
  status: ConnectionStatus;
  stagedFiles: StagedFileWithId[];
  onSelectFiles: (files: FileList | null) => void;
  sessionAnalytics: SessionAnalytics;
  activeTransfers: Set<string>;
  connectionType: ConnectionType;
  uploadProgress: Map<string, DownloadProgress>;
}

export function SendPage({ shareUrl, status, stagedFiles, onSelectFiles, sessionAnalytics, activeTransfers, connectionType, uploadProgress }: SendPageProps) {
  const t = useTranslations("Nully");
  const { hasAcceptedAll, isLoaded } = usePolicyAcceptance();
  const [userHasConfirmed, setUserHasConfirmed] = useState(false);

  const showFileSelection = (isLoaded && hasAcceptedAll) || userHasConfirmed;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionHeader
          icon={<Send className="h-6 w-6" />}
          title={t("Send.title")}
          description={t("Send.description")}
        />
        <SectionContent className="space-y-6">
          <div className="space-y-4">

            <HowToStep
              icon={<Copy className="h-5 w-5" />}
              title={t("HowTo.step2.title")}
              description={t("HowTo.step2.description")}
            />
            <HowToStep
              icon={<FilePlus className="h-5 w-5" />}
              title={t("HowTo.step1.title")}
              description={t("HowTo.step1.description")}
            />
            <HowToStep
              icon={<Laptop className="h-5 w-5" />}
              title={t("HowTo.step3.title")}
              description={t("HowTo.step3.description")}
            />
          </div>

          <div className="relative">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full rounded-md border bg-gray-50 p-2 pr-20 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute right-1 top-1"
              onClick={handleCopy}
            >
              <Copy className="mr-2 h-4 w-4" />
              {t("Send.copyButton")}
            </Button>
          </div>

          <ConnectionIndicator status={status} connectionType={connectionType} />
        </SectionContent>
      </SectionCard>

      {isLoaded && !showFileSelection && (
        <AcceptanceChecklist onAccepted={() => setUserHasConfirmed(true)} />
      )}

      {showFileSelection && (
        <SectionCard>
          <SectionHeader
            icon={<FilePlus className="h-6 w-6" />}
            title={t("Send.stagedFilesTitle")}
          />
          <SectionContent>
            <StagedFiles 
              stagedFiles={stagedFiles} 
              activeTransfers={activeTransfers}
              sessionAnalytics={sessionAnalytics}
              uploadProgress={uploadProgress}
            />
          </SectionContent>
          <SectionFooter>
            <input
              type="file"
              multiple
              id="file-input"
              className="hidden"
              onChange={(e) => onSelectFiles(e.target.files)}
            />
            <Button
              className="w-full"
              size="lg"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <FilePlus className="mr-2 h-5 w-5" />
              {t("Send.selectFilesButton")}
            </Button>
          </SectionFooter>
        </SectionCard>
      )}

    </div>
  );
}