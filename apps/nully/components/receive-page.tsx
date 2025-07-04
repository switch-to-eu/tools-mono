import { useState } from "react";
import { Laptop, File, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@workspace/ui/components/button";
import {
  SectionCard,
  SectionHeader,
  SectionContent,
} from "@workspace/ui/blocks/section-card";
import { ConnectionStatus } from "../hooks/use-peer-connection";
import { type FileMetadata } from "../hooks/use-file-transfer";
import { usePolicyAcceptance } from "../hooks/use-policy-acceptance";
import { AcceptanceChecklist } from "./acceptance-checklist";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
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
      <p className="text-sm font-medium">
        {isConnected ? t("connected") : t("waiting")}
      </p>
    </div>
  );
}

interface AvailableFilesProps {
  availableFiles: FileMetadata[];
  onDownload: (fileId: string) => void;
}

function AvailableFiles({ availableFiles, onDownload }: AvailableFilesProps) {
  const t = useTranslations("Nully.Receive");

  if (availableFiles.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        {t("noFilesAvailable")}
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-md border">
      {availableFiles.map((file) => (
        <li key={file.id} className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onDownload(file.id)}>
            <Download className="mr-2 h-4 w-4" />
            {t("downloadButton")}
          </Button>
        </li>
      ))}
    </ul>
  );
}

interface ReceivePageProps {
  status: ConnectionStatus;
  availableFiles: FileMetadata[];
  onDownload: (fileId: string) => void;
}

export function ReceivePage({ status, availableFiles, onDownload }: ReceivePageProps) {
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
          <ConnectionIndicator status={status} />
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
              onDownload={onDownload}
            />
          </SectionContent>
        </SectionCard>
      )}
    </div>
  );
}