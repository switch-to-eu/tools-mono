import { useState } from "react";
import { Laptop, Copy, Send, FilePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@workspace/ui/components/button";
import {
  SectionCard,
  SectionHeader,
  SectionContent,
  SectionFooter,
} from "@workspace/ui/blocks/section-card";
import { ConnectionStatus } from "../hooks/use-peer-connection";
import { usePolicyAcceptance } from "../hooks/use-policy-acceptance";
import { AcceptanceChecklist } from "./acceptance-checklist";

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

interface StagedFilesProps {
  stagedFiles: File[];
}

function StagedFiles({ stagedFiles }: StagedFilesProps) {
  const t = useTranslations("Nully.Send");
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
        {stagedFiles.map((file, i) => (
          <li key={`${file.name}-${i}`} className="p-2 text-sm truncate">
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface SendPageProps {
  shareUrl: string;
  status: ConnectionStatus;
  stagedFiles: File[];
  onSelectFiles: (files: FileList | null) => void;
}

export function SendPage({ shareUrl, status, stagedFiles, onSelectFiles }: SendPageProps) {
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

          <ConnectionIndicator status={status} />
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
            <StagedFiles stagedFiles={stagedFiles} />
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