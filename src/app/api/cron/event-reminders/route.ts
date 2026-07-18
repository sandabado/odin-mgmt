import { NextRequest, NextResponse } from "next/server";
import { activeMembers, insertNotificationOnce, isAuthorizedCron, pacificDate, pacificMinutesNow, timeToMinutes } from "@/lib/band-reminder-cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Practice = { id: string; artist_id: string; title: string; start_time: string; location: string };

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const { data: practiceData, error } = await supabase.from("practices").select("id, artist_id, title, start_time, location").eq("practice_date", pacificDate()).eq("status", "scheduled").returns<Practice[]>();
  if (error) return NextResponse.json({ error: "Unable to load practices" }, { status: 500 });
  const now = pacificMinutesNow();
  const upcoming = (practiceData ?? []).filter((practice) => {
    const minutesUntil = timeToMinutes(practice.start_time) - now;
    return minutesUntil > 0 && minutesUntil <= 60;
  });
  const members = await activeMembers(supabase, [...new Set(upcoming.map((practice) => practice.artist_id))]);
  let created = 0;
  for (const practice of upcoming) for (const member of members.filter((item) => item.artist_id === practice.artist_id)) {
    const didCreate = await insertNotificationOnce(supabase, { artist_id: practice.artist_id, recipient_band_member_id: member.id, type: "practice_reminder", title: "Practice starts in 1 hour", body: `${practice.title} · ${practice.location}`, link_type: "practice", link_id: practice.id, dedup_key: `practice-hour:${practice.id}:${pacificDate()}` });
    if (didCreate) created += 1;
  }
  return NextResponse.json({ created, events: upcoming.length });
}
