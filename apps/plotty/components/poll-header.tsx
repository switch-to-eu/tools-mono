import { format } from "date-fns";
import { Calendar, Users, CheckCircle, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionCard, SectionHeader, SectionContent } from "@workspace/ui/blocks/section-card";
import type { DecryptedPoll } from "@/lib/interfaces";

interface BestTime {
  date: string;
  count: number;
  percentage: number;
}

interface PollInfoProps {
  poll: DecryptedPoll;
}

interface BestTimeHighlightProps {
  poll: DecryptedPoll;
  bestTime?: BestTime | null;
}

interface PollHeaderProps {
  poll: DecryptedPoll;
  bestTime?: BestTime | null;
}

export function PollInfo({ poll }: PollInfoProps) {
  const t = useTranslations('PollHeader');

  return (
    <SectionCard>
      <SectionHeader
        icon={<FileText className="h-5 w-5" />}
        title={poll.title}
        description={poll.description ?? t('eventDetails')}
      />
      <SectionContent className="text-center">
        {poll.location && (
          <p className="mb-6 text-base text-gray-700">
            📍 {poll.location}
          </p>
        )}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>{poll.participants.length} {t('responses')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{poll.dates.length} {t('dates')}</span>
          </div>
        </div>
      </SectionContent>
    </SectionCard>
  );
}

export function BestTimeHighlight({ poll, bestTime }: BestTimeHighlightProps) {
  const t = useTranslations('PollHeader.bestTime');

  if (!bestTime || poll.participants.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <SectionHeader
        icon={<CheckCircle className="h-5 w-5" />}
        title={t('title')}
        description={t('description', {
          count: bestTime.count,
          total: poll.participants.length,
          percentage: bestTime.percentage
        })}
      />
      <SectionContent className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {format(new Date(bestTime.date), "EEEE, MMMM d")}
        </h3>
      </SectionContent>
    </SectionCard>
  );
}