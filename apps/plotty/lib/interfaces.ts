// Types
export interface Participant {
  id: string;
  name: string;
  availability: Record<string, boolean | string[]>; // Support both formats
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
  // New multiple start times approach
  fixedDuration?: number; // Hours (1, 2, 3, etc.) - ONE duration for all slots
  selectedStartTimes?: string[]; // ["09:00", "14:00", "16:30"] - multiple start times
  allowHourSelection?: boolean; // Default false
  // Generated final time slots from duration + start times
  timeSlots?: string[]; // Generated: ["09:00-11:00", "14:00-16:00", "16:30-18:30"]
}
