import { useState } from "react";
import { Laptop, File, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@workspace/ui/components/button";
import {
  SectionCard,
  SectionHeader,
  SectionContent,
} from "@workspace/ui/blocks/section-card";
import { ConnectionStatus, ConnectionType } from "../hooks/use-peer-connection";
import { type FileMetadata, type DownloadState } from "../hooks/use-file-transfer";
import { usePolicyAcceptance } from "../hooks/use-policy-acceptance";
import { AcceptanceChecklist } from "./acceptance-checklist";
import { DownloadProgressItem } from "./download-progress-item";
import { ConnectionTypeIndicator } from "./connection-type-indicator";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  connectionType: ConnectionType;
}

function ConnectionIndicator({ status, connectionType }: ConnectionIndicatorProps) {
  const t = useTranslations("Nully.Connection");
  const isConnected = status === "connected";

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-gray-50 p-4">
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
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium">
          {isConnected ? t("connected") : t("waiting")}
        </p>
        {isConnected && (
          <ConnectionTypeIndicator connectionType={connectionType} />
        )}
      </div>
    </div>
  );
}

interface AvailableFilesProps {
  availableFiles: FileMetadata[];
  downloadState: DownloadState;
  onDownload: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  onClearError: () => void;
}

function AvailableFiles({ 
  availableFiles, 
  downloadState, 
  onDownload, 
  onRetry, 
  onClearError 
}: AvailableFilesProps) {
  const t = useTranslations("Nully.Receive");

  if (availableFiles.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        {t("noFilesAvailable")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {availableFiles.map((file) => (
        <DownloadProgressItem
          key={file.id}
          file={file}
          downloadState={downloadState}
          onDownload={onDownload}
          onRetry={onRetry}
          onClearError={onClearError}
        />
      ))}
    </div>
  );
}

interface ReceivePageProps {
  status: ConnectionStatus;
  connectionType: ConnectionType;
  availableFiles: FileMetadata[];
  downloadState: DownloadState;
  onDownload: (fileId: string) => void;
  onRetry: (fileId: string) => void;
  onClearError: () => void;
}

export function ReceivePage({ 
  status, 
  connectionType, 
  availableFiles, 
  downloadState, 
  onDownload, 
  onRetry, 
  onClearError 
}: ReceivePageProps) {
  const t = useTranslations("Nully.Receive");
  const { hasAcceptedAll, isLoaded } = usePolicyAcceptance();
  const [userHasConfirmed, setUserHasConfirmed] = useState(false);

  const showAvailableFiles = (isLoaded && hasAcceptedAll) || userHasConfirmed;

  return (
    <div className="space-y-6">
      <SectionCard>
        <SectionHeader
          icon={<Download className="h-6 w-6" />}
          title={t("title")}
          description={t("description")}
        />
        <SectionContent>
          <ConnectionIndicator status={status} connectionType={connectionType} />
        </SectionContent>
      </SectionCard>

      {isLoaded && !showAvailableFiles && (
        <AcceptanceChecklist onAccepted={() => setUserHasConfirmed(true)} />
      )}

      {showAvailableFiles && (
        <SectionCard>
          <SectionHeader
            icon={<File className="h-6 w-6" />}
            title={t("availableFilesTitle")}
          />
          <SectionContent>
            <AvailableFiles
              availableFiles={availableFiles}
              downloadState={downloadState}
              onDownload={onDownload}
              onRetry={onRetry}
              onClearError={onClearError}
            />
          </SectionContent>
        </SectionCard>
      )}
    </div>
  );
}