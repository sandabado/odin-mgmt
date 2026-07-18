import { NextRequest, NextResponse } from "next/server";
import { activeMembers, insertNotificationOnce, isAuthorizedCron, pacificDate } from "@/lib/band-reminder-cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Deal = { id: string; artist_id: string; event_date: string };

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createSupabaseAdminClient();
  const today = pacificDate();
  const { data: dealData, error } = await supabase.from("deals").select("id, artist_id, event_date").eq("event_date", today).eq("stage", "confirmed").not("artist_id", "is", null).returns<Deal[]>();
  if (error) return NextResponse.json({ error: "Unable to load today’s shows" }, { status: 500 });
  const deals = dealData ?? [];
  const members = await activeMembers(supabase, [...new Set(deals.map((deal) => deal.artist_id))]);
  let created = 0;
  for (const deal of deals) for (const member of members.filter((item) => item.artist_id === deal.artist_id)) {
    if (await insertNotificationOnce(supabase, { artist_id: deal.artist_id, recipient_band_member_id: member.id, type: "show_reminder", title: "Tonight — confirmed show", body: "Check the run sheet and band thread before heading out.", link_type: "show", link_id: deal.id, dedup_key: `show-day:${deal.id}:${today}:${member.id}` })) created += 1;
  }
  return NextResponse.json({ created, events: deals.length });
}
