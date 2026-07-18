import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/band-reminder-cron";
import { GET as sendRsvpReminders } from "@/app/api/cron/rsvp-reminders/route";
import { GET as sendShowDayAlerts } from "@/app/api/cron/show-day-alerts/route";

/**
 * Vercel Hobby permits one daily cron only. This combines the two daily-safe
 * reminders; the granular routes remain available to a Pro plan or scheduler.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [rsvpResponse, showResponse] = await Promise.all([sendRsvpReminders(request), sendShowDayAlerts(request)]);
  const [rsvp, show] = await Promise.all([rsvpResponse.json(), showResponse.json()]);
  return NextResponse.json({ rsvp, show });
}
