"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBandMember } from "@/components/artist/BandMemberContext";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Notification = { id: string; type: string; title: string; body: string | null; link_type: string | null; link_id: string | null; is_read: boolean; created_at: string };

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function NotificationBell() {
  const { currentBandMember, openMemberPicker } = useBandMember();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const unread = notifications.filter((notification) => !notification.is_read).length;

  useEffect(() => {
    if (!currentBandMember) {
      setNotifications([]);
      return;
    }
    const memberId = currentBandMember.id;
    let mounted = true;
    async function loadNotifications() {
      const { data } = await supabase.from("notifications").select("id, type, title, body, link_type, link_id, is_read, created_at").eq("recipient_band_member_id", memberId).order("created_at", { ascending: false }).limit(30).returns<Notification[]>();
      if (mounted && data) setNotifications(data);
    }
    void loadNotifications();
    const channel = supabase.channel(`notifications:${memberId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_band_member_id=eq.${memberId}` }, (payload) => {
      const notification = payload.new as Notification;
      setNotifications((current) => current.some((item) => item.id === notification.id) ? current : [notification, ...current].slice(0, 30));
    }).on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `recipient_band_member_id=eq.${memberId}` }, (payload) => {
      const notification = payload.new as Notification;
      setNotifications((current) => current.map((item) => item.id === notification.id ? notification : item));
    }).subscribe();
    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [currentBandMember, supabase]);

  async function markRead(notification: Notification) {
    if (!notification.is_read) {
      const { data } = await supabase.from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", notification.id).select().single<Notification>();
      if (data) setNotifications((current) => current.map((item) => item.id === data.id ? data : item));
    }
    setOpen(false);
    const query = notification.link_type === "thread" ? `thread=${notification.link_id}` : notification.link_type && notification.link_id ? `event=${notification.link_type}:${notification.link_id}` : "";
    router.push(`/artist/schedule${query ? `?${query}` : ""}`);
  }

  async function markAllRead() {
    if (!currentBandMember || !unread) return;
    const { error } = await supabase.from("notifications").update({ is_read: true, read_at: new Date().toISOString() }).eq("recipient_band_member_id", currentBandMember.id).eq("is_read", false);
    if (!error) setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
  }

  return <div className="relative"><button aria-expanded={open} aria-label={currentBandMember ? `Notifications, ${unread} unread` : "Choose a band member for notifications"} className="relative border border-mercury p-2 text-ghost transition hover:border-plasma hover:text-bone" onClick={() => currentBandMember ? setOpen((value) => !value) : openMemberPicker()} type="button"><Bell className="h-4 w-4" />{unread ? <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-plasma px-1 font-mono text-[8px] text-void">{unread > 9 ? "9+" : unread}</span> : null}</button>{open ? <section className="absolute right-0 top-[calc(100%+.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] border border-mercury bg-carbon shadow-2xl"><div className="flex items-center justify-between border-b border-steel px-4 py-3"><p className="font-mono text-[9px] uppercase tracking-[.13em] text-bone">Notifications</p><div className="flex items-center gap-2"><button className="font-mono text-[8px] uppercase tracking-[.08em] text-flux hover:text-bone disabled:opacity-40" disabled={!unread} onClick={markAllRead} type="button"><CheckCheck className="mr-1 inline h-3 w-3" />Read all</button><button aria-label="Close notifications" className="text-ghost hover:text-bone" onClick={() => setOpen(false)} type="button"><X className="h-4 w-4" /></button></div></div><div className="max-h-96 overflow-y-auto">{notifications.length ? notifications.map((notification) => <button className={`flex w-full gap-3 border-b border-steel px-4 py-3 text-left transition hover:bg-steel ${notification.is_read ? "opacity-65" : ""}`} key={notification.id} onClick={() => void markRead(notification)} type="button"><MessageCircle className={`mt-0.5 h-4 w-4 shrink-0 ${notification.is_read ? "text-ghost" : "text-plasma"}`} /><span className="min-w-0 flex-1"><span className="block text-xs text-bone">{notification.title}</span>{notification.body ? <span className="mt-1 block truncate text-xs text-ghost">{notification.body}</span> : null}<span className="mt-1 block font-mono text-[8px] uppercase tracking-[.08em] text-ghost">{relativeTime(notification.created_at)}</span></span></button>) : <p className="p-5 text-center text-sm text-ghost">Nothing new. You are all caught up.</p>}</div></section> : null}</div>;
}
