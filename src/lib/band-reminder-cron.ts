import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

type BandMember = { id: string; artist_id: string };
type EventRsvp = { band_member_id: string; practice_id: string | null; deal_id: string | null; meeting_id: string | null };
type NotificationInsert = { artist_id: string; recipient_band_member_id: string; type: string; title: string; body: string; link_type: string; link_id: string; dedup_key: string };

export function isAuthorizedCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export function pacificDate(offsetDays = 0) {
  const dateParts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = Object.fromEntries(dateParts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  const target = new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day) + offsetDays));
  return target.toISOString().slice(0, 10);
}

export function pacificMinutesNow() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const value = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return Number(value.hour) * 60 + Number(value.minute);
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function activeMembers(supabase: SupabaseClient, artistIds: string[]) {
  if (!artistIds.length) return [] as BandMember[];
  const { data } = await supabase.from("band_members").select("id, artist_id").in("artist_id", artistIds).eq("is_active", true).returns<BandMember[]>();
  return data ?? [];
}

export async function insertNotificationOnce(supabase: SupabaseClient, notification: NotificationInsert) {
  const { data: existing } = await supabase.from("notifications").select("id").eq("dedup_key", notification.dedup_key).maybeSingle();
  if (existing) return false;
  const { error } = await supabase.from("notifications").insert(notification);
  return !error;
}

export function nonResponders(members: BandMember[], rsvps: EventRsvp[], eventColumn: "practice_id" | "deal_id" | "meeting_id", eventId: string) {
  const answered = new Set(rsvps.filter((rsvp) => rsvp[eventColumn] === eventId).map((rsvp) => rsvp.band_member_id));
  return members.filter((member) => !answered.has(member.id));
}
