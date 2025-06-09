// Types
export interface Participant {
  id: string;
  name: string;
  availability: Record<string, boolean>;
}

export interface DecryptedPoll {
  id: string;
  title: string;
  description?: string;
  location?: string;
  dates: string[];
  participants: Participant[];
  createdAt: string;
  expiresAt: string;
}
