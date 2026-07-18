export type BandMember = {
  id: string;
  artist_id: string;
  name: string;
  role: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_color: string;
  is_active: boolean;
  sort_order: number;
};

export type EventType = "practice" | "show" | "meeting" | "studio_session";

export type EventReference = { type: EventType; id: string };

export type EventRsvp = {
  id: string;
  event_type: EventType;
  practice_id: string | null;
  deal_id: string | null;
  meeting_id: string | null;
  session_id: string | null;
  band_member_id: string;
  response: "confirmed" | "declined" | "tentative" | "late";
  late_arrival_time: string | null;
  decline_reason: string | null;
  note: string | null;
  responded_at: string;
  updated_at: string;
};

export type EventThreadRecord = {
  id: string;
  artist_id: string;
  event_type: EventType | "general";
  practice_id: string | null;
  deal_id: string | null;
  meeting_id: string | null;
  session_id: string | null;
  title: string | null;
  is_locked: boolean;
};

export type EventMessage = {
  id: string;
  thread_id: string;
  band_member_id: string | null;
  profile_id: string | null;
  author_name: string;
  author_avatar_color: string;
  author_role: "member" | "admin" | "manager" | "system" | null;
  body: string;
  is_system_message: boolean;
  mentions: string[];
  reactions: Record<string, string[]>;
  deleted_at: string | null;
  created_at: string;
};

export function eventColumn(eventType: EventType) {
  return eventType === "practice" ? "practice_id" : eventType === "show" ? "deal_id" : eventType === "meeting" ? "meeting_id" : "session_id";
}

export function memberLabel(member: Pick<BandMember, "name" | "display_name">) {
  return member.display_name || member.name;
}
