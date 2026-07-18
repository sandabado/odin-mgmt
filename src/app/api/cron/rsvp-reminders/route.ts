import { NextRequest, NextResponse } from "next/server";
import { activeMembers, insertNotificationOnce, isAuthorizedCron, nonResponders, pacificDate } from "@/lib/band-reminder-cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Practice = { id: string; artist_id: string; title: string };
type Meeting = { id: string; artist_id: string; title: string };
type EventRsvp = { band_member_id: string; practice_id: string | null; deal_id: string | null; meeting_id: string | null };

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const tomorrow = pacificDate(1);
  const [{ data: practiceData, error: practiceError }, { data: meetingData, error: meetingError }] = await Promise.all([
    supabase.from("practices").select("id, artist_id, title").eq("practice_date", tomorrow).eq("status", "scheduled").returns<Practice[]>(),
    supabase.from("meetings").select("id, artist_id, title").eq("scheduled_date", tomorrow).eq("status", "scheduled").not("artist_id", "is", null).returns<Meeting[]>(),
  ]);
  if (practiceError || meetingError) return NextResponse.json({ error: "Unable to load RSVP reminders" }, { status: 500 });
  const practices = practiceData ?? [];
  const meetings = meetingData ?? [];
  const [{ data: practiceRsvps }, { data: meetingRsvps }] = await Promise.all([
    practices.length ? supabase.from("event_rsvps").select("band_member_id, practice_id, deal_id, meeting_id").in("practice_id", practices.map((practice) => practice.id)).returns<EventRsvp[]>() : Promise.resolve({ data: [] as EventRsvp[] }),
    meetings.length ? supabase.from("event_rsvps").select("band_member_id, practice_id, deal_id, meeting_id").in("meeting_id", meetings.map((meeting) => meeting.id)).returns<EventRsvp[]>() : Promise.resolve({ data: [] as EventRsvp[] }),
  ]);
  const members = await activeMembers(supabase, [...new Set([...practices, ...meetings].map((event) => event.artist_id))]);
  let created = 0;
  for (const practice of practices) for (const member of nonResponders(members.filter((item) => item.artist_id === practice.artist_id), practiceRsvps ?? [], "practice_id", practice.id)) {
    if (await insertNotificationOnce(supabase, { artist_id: practice.artist_id, recipient_band_member_id: member.id, type: "rsvp_reminder", title: "RSVP needed for tomorrow's practice", body: practice.title, link_type: "practice", link_id: practice.id, dedup_key: `rsvp-practice:${practice.id}:${tomorrow}:${member.id}` })) created += 1;
  }
  for (const meeting of meetings) for (const member of nonResponders(members.filter((item) => item.artist_id === meeting.artist_id), meetingRsvps ?? [], "meeting_id", meeting.id)) {
    if (await insertNotificationOnce(supabase, { artist_id: meeting.artist_id, recipient_band_member_id: member.id, type: "rsvp_reminder", title: "RSVP needed for tomorrow's meeting", body: meeting.title, link_type: "meeting", link_id: meeting.id, dedup_key: `rsvp-meeting:${meeting.id}:${tomorrow}:${member.id}` })) created += 1;
  }
  return NextResponse.json({ created, events: practices.length + meetings.length });
}
