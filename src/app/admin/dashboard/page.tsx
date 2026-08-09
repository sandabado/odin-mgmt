import { redirect } from "next/navigation";
import { OperationsDashboard, type DashboardActivity, type DashboardArm, type DashboardCalendarEntry, type DashboardCard, type DashboardCountdown, type DashboardLiveItem, type DashboardQuickLink } from "@/components/admin/OperationsDashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Profile = { full_name: string | null; role: string | null };
type Artist = { id: string; artist_name: string };
type Project = { id: string; artist_id: string | null; title: string; status: string; target_release_date: string | null; investment_cents: number; created_at: string };
type Deal = { id: string; artist_id: string | null; venue_id: string | null; deal_type: string; stage: string; event_date: string | null; guarantee_cents: number | null; created_at: string; updated_at: string };
type Practice = { id: string; artist_id: string; title: string; practice_date: string; start_time: string; end_time: string; location: string; status: string; created_at: string; updated_at: string };
type Meeting = { id: string; artist_id: string | null; title: string; scheduled_date: string; start_time: string; end_time: string | null; location: string | null; format: string; status: string; created_at: string; updated_at: string };
type Session = { id: string; project_id: string; title: string | null; session_date: string; engineer_name: string; hours: number; cost_cents: number; notes: string | null; session_status: string; scheduled_start: string | null; scheduled_end: string | null; created_at: string };
type Campaign = { id: string; project_id: string; artist_id: string; title: string; status: string; start_date: string | null; end_date: string | null; pitches_sent: number; responses_received: number; coverage_secured: number; estimated_reach: number; created_at: string; updated_at: string };
type Pitch = { id: string; campaign_id: string; outlet_name: string | null; pitch_date: string; response_status: string; response_date: string | null; created_at: string };
type Release = { id: string; project_id: string; artist_id: string; title: string; release_date: string; status: string; press_deadline: string | null; distribution_submitted: boolean; cover_art_url: string | null; created_at: string; updated_at: string };
type Opportunity = { id: string; title: string; status: string; priority: string; estimated_value_cents: number | null; probability: number; target_date: string | null; created_at: string; updated_at: string };
type Swap = { id: string; partner_artist_name: string; status: string; created_at: string; updated_at: string };
type Revenue = { id: string; amount_cents: number; revenue_type: string; arm: string; received_on: string; source_reference: string | null; created_at: string };
type Payout = { id: string; amount_cents: number; recipient_name: string; status: string; due_on: string | null; created_at: string };
type Contact = { id: string; name: string; category: string; warmth_score: number; last_contact_date: string | null; created_at: string; updated_at: string };
type Venue = { id: string };
type PromoMaterial = { id: string; status: string; created_at: string };
type Milestone = { id: string; project_id: string; title: string; status: string; scheduled_date: string | null };

const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
const keyFor = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
const timeFor = () => new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace("24:", "00:");
const addDays = (date: string, days: number) => { const next = new Date(`${date}T12:00:00Z`); next.setUTCDate(next.getUTCDate() + days); return next.toISOString().slice(0, 10); };
const phasePosition = (phase: string | null | undefined) => ({ recording: 0, mixing: 1, mastering: 2, publishing_setup: 3, distribution: 3, pr_campaign: 4, tour_booking: 5 })[phase || ""] ?? 0;
const titleCase = (value: string) => value.replaceAll("_", " ");
const displayName = (value: string) => value.trim().split(/\s+/).map((part) => part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : part).join(" ");

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/dashboard");
  const today = keyFor();
  const weekEnd = addDays(today, 7);
  const yesterday = addDays(today, -1);
  const followUpDate = addDays(today, -2);
  const [{ data: profileData }, { data: artistsData }, { data: projectsData }, { data: dealsData }, { data: practicesData }, { data: meetingsData }, { data: sessionsData }, { data: campaignsData }, { data: pitchesData }, { data: releasesData }, { data: opportunitiesData }, { data: swapsData }, { data: revenueData }, { data: payoutsData }, { data: contactsData }, { data: venuesData }, { data: promoData }, { data: milestonesData }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("artists").select("id, artist_name").returns<Artist[]>(),
    supabase.from("projects").select("id, artist_id, title, status, target_release_date, investment_cents, created_at").returns<Project[]>(),
    supabase.from("deals").select("id, artist_id, venue_id, deal_type, stage, event_date, guarantee_cents, created_at, updated_at").order("event_date").returns<Deal[]>(),
    supabase.from("practices").select("id, artist_id, title, practice_date, start_time, end_time, location, status, created_at, updated_at").order("practice_date").returns<Practice[]>(),
    supabase.from("meetings").select("id, artist_id, title, scheduled_date, start_time, end_time, location, format, status, created_at, updated_at").order("scheduled_date").returns<Meeting[]>(),
    supabase.from("engineering_sessions").select("id, project_id, title, session_date, engineer_name, hours, cost_cents, notes, session_status, scheduled_start, scheduled_end, created_at").order("session_date", { ascending: false }).returns<Session[]>(),
    supabase.from("campaigns").select("id, project_id, artist_id, title, status, start_date, end_date, pitches_sent, responses_received, coverage_secured, estimated_reach, created_at, updated_at").order("created_at", { ascending: false }).returns<Campaign[]>(),
    supabase.from("campaign_pitches").select("id, campaign_id, outlet_name, pitch_date, response_status, response_date, created_at").order("created_at", { ascending: false }).returns<Pitch[]>(),
    supabase.from("release_schedule").select("id, project_id, artist_id, title, release_date, status, press_deadline, distribution_submitted, cover_art_url, created_at, updated_at").order("release_date").returns<Release[]>(),
    supabase.from("opportunities").select("id, title, status, priority, estimated_value_cents, probability, target_date, created_at, updated_at").order("updated_at", { ascending: false }).returns<Opportunity[]>(),
    supabase.from("swap_deals").select("id, partner_artist_name, status, created_at, updated_at").order("updated_at", { ascending: false }).returns<Swap[]>(),
    supabase.from("revenue_ledger").select("id, amount_cents, revenue_type, arm, received_on, source_reference, created_at").order("created_at", { ascending: false }).returns<Revenue[]>(),
    supabase.from("payouts").select("id, amount_cents, recipient_name, status, due_on, created_at").order("created_at", { ascending: false }).returns<Payout[]>(),
    supabase.from("contacts").select("id, name, category, warmth_score, last_contact_date, created_at, updated_at").order("updated_at", { ascending: false }).returns<Contact[]>(),
    supabase.from("venues").select("id").returns<Venue[]>(),
    supabase.from("promo_materials").select("id, status, created_at").returns<PromoMaterial[]>(),
    supabase.from("engineering_milestones").select("id, project_id, title, status, scheduled_date").order("scheduled_date").returns<Milestone[]>(),
  ]);

  const artists = artistsData ?? []; const projects = projectsData ?? []; const deals = dealsData ?? []; const practices = practicesData ?? []; const meetings = meetingsData ?? []; const sessions = sessionsData ?? []; const campaigns = campaignsData ?? []; const pitches = pitchesData ?? []; const releases = releasesData ?? []; const opportunities = opportunitiesData ?? []; const swaps = swapsData ?? []; const revenue = revenueData ?? []; const payouts = payoutsData ?? []; const contacts = contactsData ?? []; const venues = venuesData ?? []; const promoMaterials = promoData ?? []; const milestones = milestonesData ?? [];
  const artistById = new Map(artists.map((artist) => [artist.id, artist.artist_name]));
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const currentTime = timeFor();
  const activeProjects = projects.filter((project) => project.status !== "complete");
  const upcomingPractices = practices.filter((practice) => practice.status === "scheduled" && practice.practice_date >= today && practice.practice_date <= weekEnd);
  const upcomingMeetings = meetings.filter((meeting) => !["cancelled", "completed"].includes(meeting.status) && meeting.scheduled_date >= today && meeting.scheduled_date <= weekEnd);
  const upcomingDeals = deals.filter((deal) => deal.event_date && deal.event_date >= today && deal.event_date <= weekEnd && !["lost", "completed"].includes(deal.stage));
  const activeCampaigns = campaigns.filter((campaign) => ["active", "planning"].includes(campaign.status));
  const followUpPitches = pitches.filter((pitch) => pitch.response_status === "pending" && pitch.pitch_date <= followUpDate);
  const hotContacts = contacts.filter((contact) => contact.warmth_score >= 75);
  const activeOpportunities = opportunities.filter((opportunity) => !["declined", "expired", "confirmed"].includes(opportunity.status));
  const activeSwaps = swaps.filter((swap) => ["proposed", "confirmed"].includes(swap.status));
  const pendingPayouts = payouts.filter((payout) => payout.status === "pending");
  const cashDue = pendingPayouts.reduce((sum, payout) => sum + payout.amount_cents, 0);
  const monthPrefix = `${today.slice(0, 7)}-`;
  const monthRevenue = revenue.filter((entry) => entry.received_on.startsWith(monthPrefix) && entry.revenue_type !== "expense").reduce((sum, entry) => sum + entry.amount_cents, 0);
  const monthExpenses = revenue.filter((entry) => entry.received_on.startsWith(monthPrefix) && entry.revenue_type === "expense").reduce((sum, entry) => sum + entry.amount_cents, 0);
  const monthlyNet = monthRevenue - monthExpenses;
  const nearestShow = deals.filter((deal) => deal.event_date && deal.event_date >= today && !["lost", "completed"].includes(deal.stage)).sort((a, b) => (a.event_date || "").localeCompare(b.event_date || ""))[0];
  const showProject = nearestShow ? projects.find((project) => project.artist_id === nearestShow.artist_id && project.status !== "complete") : undefined;
  const nextRelease = releases.filter((release) => release.release_date >= today && !["live", "delayed"].includes(release.status)).sort((a, b) => a.release_date.localeCompare(b.release_date))[0];
  const coverArtAlerts = releases.filter((release) => !release.cover_art_url && release.release_date >= today && release.release_date <= addDays(today, 30));
  const nextMilestone = milestones.filter((milestone) => !["complete", "skipped"].includes(milestone.status)).sort((a, b) => (a.scheduled_date || "9999-12-31").localeCompare(b.scheduled_date || "9999-12-31"))[0];

  const liveItems: DashboardLiveItem[] = [];
  const showToday = deals.find((deal) => deal.event_date === today && !["lost", "completed"].includes(deal.stage));
  if (showToday) liveItems.push({ id: `show-${showToday.id}`, tone: "critical", label: "Show day", title: `${artistById.get(showToday.artist_id || "") || "Artist"} is on the field tonight`, detail: `${titleCase(showToday.deal_type)} · ${showToday.stage}`, href: "/admin/deals", action: "Open deal" });
  sessions.filter((session) => session.session_status === "in_progress" || Boolean(session.scheduled_start && session.scheduled_end && new Date(session.scheduled_start) <= new Date() && new Date(session.scheduled_end) >= new Date())).forEach((session) => { const project = projectById.get(session.project_id); liveItems.push({ id: `session-${session.id}`, tone: "live", label: "Recording in progress", title: session.title || `${project?.title || "Project"} session`, detail: `${project?.title || "Project"} · ${session.engineer_name} · ${session.hours}h booked`, href: `/admin/engineering/sessions/${session.id}`, action: "View session" }); });
  practices.filter((practice) => practice.status === "scheduled" && practice.practice_date === today && practice.start_time.slice(0, 5) <= currentTime && practice.end_time.slice(0, 5) >= currentTime).forEach((practice) => liveItems.push({ id: `practice-${practice.id}`, tone: "live", label: "Practice underway", title: `${artistById.get(practice.artist_id) || "Artist"} — ${practice.title}`, detail: `${practice.start_time.slice(0, 5)} → ${practice.end_time.slice(0, 5)} · ${practice.location}`, href: "/admin/dashboard#operations-calendar", action: "Open schedule" }));
  meetings.filter((meeting) => !["cancelled", "completed"].includes(meeting.status) && meeting.scheduled_date === today && meeting.start_time.slice(0, 5) <= currentTime && (!meeting.end_time || meeting.end_time.slice(0, 5) >= currentTime)).forEach((meeting) => liveItems.push({ id: `meeting-${meeting.id}`, tone: "attention", label: "Meeting in progress", title: meeting.title, detail: `${meeting.location || meeting.format} · started ${meeting.start_time.slice(0, 5)}`, href: "/admin/dashboard#operations-calendar", action: "Open schedule" }));
  pitches.filter((pitch) => pitch.response_status === "positive" && pitch.response_date && pitch.response_date >= yesterday).slice(0, 2).forEach((pitch) => liveItems.push({ id: `reply-${pitch.id}`, tone: "attention", label: "Hot reply", title: `${pitch.outlet_name || "An outlet"} replied to your pitch`, detail: `Campaign reply received ${pitch.response_date === today ? "today" : "yesterday"}`, href: `/admin/campaigns/${pitch.campaign_id}`, action: "Respond now" }));
  releases.filter((release) => release.press_deadline === today).forEach((release) => liveItems.push({ id: `deadline-${release.id}`, tone: "critical", label: "Deadline today", title: `Press deadline — ${release.title}`, detail: release.cover_art_url ? "Release materials are on file." : "Cover art has not been added.", href: "/admin/campaigns", action: "Review release" }));
  revenue.filter((entry) => entry.received_on === today && entry.revenue_type !== "expense").slice(0, 2).forEach((entry) => liveItems.push({ id: `revenue-${entry.id}`, tone: "positive", label: "Revenue received", title: `${money(entry.amount_cents)} received`, detail: entry.source_reference || `${titleCase(entry.arm)} revenue`, href: "/admin/treasury", action: "Open treasury" }));

  const oldestHotContact = hotContacts.slice().sort((a, b) => (a.last_contact_date || "9999").localeCompare(b.last_contact_date || "9999"))[0];
  const daysSinceContact = oldestHotContact?.last_contact_date ? Math.max(0, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${oldestHotContact.last_contact_date}T00:00:00Z`)) / 86400000)) : 0;
  const cards: DashboardCard[] = [
    { id: "leads", label: "Hot leads", value: String(hotContacts.length), detail: hotContacts.length ? "high-warmth contacts in the field" : "no high-warmth contacts waiting", status: hotContacts.length ? `${daysSinceContact}d since oldest touch` : "field clear", tone: daysSinceContact > 7 ? "urgent" : daysSinceContact > 3 ? "attention" : "good", href: "/admin/contacts", icon: "leads" },
    { id: "replies", label: "Replies", value: String(followUpPitches.length), detail: followUpPitches.length ? "pitches waiting on follow-up" : "no pitches need follow-up", status: followUpPitches.length ? "review outreach" : "in rhythm", tone: followUpPitches.length > 5 ? "urgent" : followUpPitches.length ? "attention" : "good", href: "/admin/campaigns", icon: "replies" },
    { id: "upcoming", label: "Upcoming", value: String(upcomingPractices.length + upcomingMeetings.length + upcomingDeals.length), detail: "events in the next 7 days", status: upcomingPractices[0]?.title || upcomingMeetings[0]?.title || upcomingDeals[0] ? "next item scheduled" : "clear week", tone: "quiet", href: "/admin/calendar", icon: "upcoming" },
    { id: "cash", label: "Cash due", value: money(cashDue), detail: pendingPayouts.length ? `${pendingPayouts.length} payout${pendingPayouts.length === 1 ? "" : "s"} pending` : "no payouts pending", status: pendingPayouts.length ? "review treasury" : "all clear", tone: pendingPayouts.length ? "attention" : "good", href: "/admin/treasury", icon: "cash" },
    { id: "swaps", label: "Swaps", value: String(activeSwaps.length), detail: activeSwaps.length ? "active exchanges in motion" : "no active exchanges", status: activeSwaps[0]?.partner_artist_name || "network ready", tone: activeSwaps.length ? "attention" : "quiet", href: "/admin/people", icon: "swaps" },
    { id: "campaigns", label: "Campaigns", value: String(activeCampaigns.length), detail: `${campaigns.reduce((sum, campaign) => sum + campaign.pitches_sent, 0)} total pitches logged`, status: followUpPitches.length ? `${followUpPitches.length} need follow-up` : "signals moving", tone: followUpPitches.length ? "attention" : "good", href: "/admin/campaigns", icon: "campaigns" },
    { id: "deals", label: "Deals", value: String(deals.filter((deal) => ["negotiating", "agreed", "confirmed"].includes(deal.stage)).length), detail: `${money(deals.filter((deal) => !["lost", "completed"].includes(deal.stage)).reduce((sum, deal) => sum + (deal.guarantee_cents || 0), 0))} pipeline value`, status: nearestShow ? `${nearestShow.stage} · next show ${nearestShow.event_date}` : "no show clock", tone: nearestShow?.stage === "negotiating" ? "attention" : "quiet", href: "/admin/deals", icon: "deals" },
    { id: "treasury", label: "Treasury", value: money(monthlyNet), detail: `${money(monthRevenue)} in · ${money(monthExpenses)} out this month`, status: monthlyNet < 0 ? "net negative" : "net positive", tone: monthlyNet < 0 ? "attention" : "good", href: "/admin/treasury", icon: "treasury" },
  ];

  const arms: DashboardArm[] = [
    { id: "pr", label: "PR", description: "Press · Media · Campaigns", activity: `${activeCampaigns.length} active campaign${activeCampaigns.length === 1 ? "" : "s"} · ${campaigns.reduce((sum, campaign) => sum + campaign.pitches_sent, 0)} pitches`, metric: `${campaigns.reduce((sum, campaign) => sum + campaign.coverage_secured, 0)} coverage secured`, alert: followUpPitches.length ? `${followUpPitches.length} pitches need follow-up` : undefined, href: "/admin/campaigns", color: "plasma" },
    { id: "records", label: "Records", description: "Publishing · Sync · Distribution", activity: nextRelease ? `${nextRelease.title} · ${nextRelease.release_date}` : "No release currently scheduled", metric: `${releases.filter((release) => ["planned", "scheduled", "distributed"].includes(release.status)).length} release${releases.length === 1 ? "" : "s"} in the schedule`, alert: coverArtAlerts.length ? `cover art missing for ${coverArtAlerts.length} release${coverArtAlerts.length === 1 ? "" : "s"}` : undefined, href: "/admin/studio", color: "flux" },
    { id: "engineering", label: "Engineering", description: "Recording · Mixing · Mastering", activity: `${activeProjects.length} active project${activeProjects.length === 1 ? "" : "s"} · ${sessions.filter((session) => session.session_date === today).length} sessions today`, metric: nextMilestone ? `Next: ${nextMilestone.title}${nextMilestone.scheduled_date ? ` · ${nextMilestone.scheduled_date}` : ""}` : "No milestone scheduled", href: "/admin/engineering", color: "blue" },
    { id: "management", label: "Management", description: "Booking · Relationships", activity: `${activeOpportunities.length} opportunities · ${money(activeOpportunities.reduce((sum, opportunity) => sum + (opportunity.estimated_value_cents || 0), 0))} pipeline`, metric: `${money(activeOpportunities.reduce((sum, opportunity) => sum + Math.round((opportunity.estimated_value_cents || 0) * opportunity.probability / 100), 0))} weighted value`, alert: deals.some((deal) => deal.stage === "negotiating" && deal.event_date && deal.event_date <= addDays(today, 30)) ? "a near-term deal is still negotiating" : undefined, href: "/admin/deals", color: "halo" },
    { id: "central", label: "Ø Central", description: "Treasury · Projects · Value flow", activity: `This month: ${money(monthRevenue)} in · ${money(monthExpenses)} out`, metric: `${activeProjects.length} active projects · ${money(activeProjects.reduce((sum, project) => sum + project.investment_cents, 0))} invested`, href: "/admin/treasury", color: "bone" },
  ];

  const activity: DashboardActivity[] = [
    ...sessions.map((session): DashboardActivity => ({ id: `session-${session.id}`, description: `Studio session logged: ${session.title || projectById.get(session.project_id)?.title || "project session"} (${session.hours}h, ${money(session.cost_cents)})`, createdAt: session.created_at, href: `/admin/engineering/sessions/${session.id}`, tone: "flux" })),
    ...pitches.map((pitch): DashboardActivity => ({ id: `pitch-${pitch.id}`, description: `Pitch sent to ${pitch.outlet_name || "an outlet"}`, createdAt: pitch.created_at, href: `/admin/campaigns/${pitch.campaign_id}`, tone: "plasma" })),
    ...campaigns.map((campaign): DashboardActivity => ({ id: `campaign-${campaign.id}`, description: `Campaign created: ${campaign.title}`, createdAt: campaign.created_at, href: `/admin/campaigns/${campaign.id}`, tone: "plasma" })),
    ...deals.map((deal): DashboardActivity => ({ id: `deal-${deal.id}`, description: `Deal updated: ${titleCase(deal.deal_type)} (${deal.stage})`, createdAt: deal.updated_at, href: "/admin/deals", tone: "halo" })),
    ...projects.map((project): DashboardActivity => ({ id: `project-${project.id}`, description: `Project created: ${project.title}`, createdAt: project.created_at, href: "/admin/studio", tone: "flux" })),
    ...contacts.map((contact): DashboardActivity => ({ id: `contact-${contact.id}`, description: `Contact added: ${contact.name} (${titleCase(contact.category)})`, createdAt: contact.created_at, href: "/admin/contacts", tone: "ghost" })),
    ...revenue.map((entry): DashboardActivity => ({ id: `revenue-${entry.id}`, description: `${entry.revenue_type === "expense" ? "Expense" : "Revenue"} logged: ${money(entry.amount_cents)}${entry.source_reference ? ` · ${entry.source_reference}` : ""}`, createdAt: entry.created_at, href: "/admin/treasury", tone: entry.revenue_type === "expense" ? "halo" : "flux" })),
    ...practices.map((practice): DashboardActivity => ({ id: `practice-${practice.id}`, description: `Practice scheduled: ${practice.title}`, createdAt: practice.created_at, href: "/admin/dashboard#operations-calendar", tone: "ghost" })),
    ...meetings.map((meeting): DashboardActivity => ({ id: `meeting-${meeting.id}`, description: `Meeting scheduled: ${meeting.title}`, createdAt: meeting.created_at, href: "/admin/dashboard#operations-calendar", tone: "ghost" })),
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 10);

  const countdown: DashboardCountdown = nearestShow?.event_date ? { title: nearestShow.deal_type === "show_booked" ? "next showcase" : titleCase(nearestShow.deal_type), date: nearestShow.event_date, artist: artistById.get(nearestShow.artist_id || "") || "Artist", days: Math.max(0, Math.ceil((Date.parse(`${nearestShow.event_date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000)), phase: titleCase(showProject?.status === "in_progress" ? (milestones.find((milestone) => milestone.project_id === showProject.id && milestone.status === "in_progress")?.title || "recording") : showProject?.status || "planning"), phasePosition: phasePosition(milestones.find((milestone) => milestone.project_id === showProject?.id && milestone.status === "in_progress")?.title.toLowerCase().replaceAll(" ", "_")), href: "/admin/deals" } : null;
  const calendarEntries: DashboardCalendarEntry[] = [
    ...deals.filter((deal) => deal.event_date && deal.event_date >= today).map((deal) => ({ id: `deal-${deal.id}`, date: deal.event_date as string, title: `Show · ${artistById.get(deal.artist_id || "") || titleCase(deal.deal_type)}`, detail: `${titleCase(deal.deal_type)} · ${deal.stage}`, tone: "show" as const })),
    ...meetings.filter((meeting) => meeting.scheduled_date >= today && meeting.status !== "cancelled").map((meeting) => ({ id: `meeting-${meeting.id}`, date: meeting.scheduled_date, title: `Meeting · ${meeting.title}`, detail: `${meeting.start_time.slice(0, 5)} · ${meeting.location || meeting.format} · ${meeting.status}`, tone: "meeting" as const })),
    ...practices.filter((practice) => practice.practice_date >= today && practice.status !== "cancelled").map((practice) => ({ id: `practice-${practice.id}`, date: practice.practice_date, title: `Practice · ${practice.title}`, detail: `${practice.start_time.slice(0, 5)}–${practice.end_time.slice(0, 5)} · ${practice.location}`, tone: "practice" as const })),
    ...projects.filter((project) => project.target_release_date && project.target_release_date >= today).map((project) => ({ id: `project-${project.id}`, date: project.target_release_date as string, title: `Release target · ${project.title}`, detail: project.status, tone: "release" as const })),
  ].sort((left, right) => left.date.localeCompare(right.date)).slice(0, 24);
  const quickLinks: DashboardQuickLink[] = [
    { id: "contacts", label: "contacts", count: String(contacts.length), context: hotContacts.length ? `${hotContacts.length} high warmth` : "network ready", href: "/admin/contacts", icon: "contacts" },
    { id: "projects", label: "projects", count: String(activeProjects.length), context: activeProjects[0]?.title || "no active project", href: "/admin/studio", icon: "projects" },
    { id: "promo", label: "promo kit", count: String(promoMaterials.filter((material) => material.status === "ready").length), context: `${promoMaterials.length} materials logged`, href: "/admin/show-prep", icon: "promo" },
    { id: "upcoming", label: "upcoming", count: String(upcomingPractices.length + upcomingMeetings.length + upcomingDeals.length), context: "next 7 days", href: "/admin/dashboard#operations-calendar", icon: "upcoming" },
    { id: "venues", label: "venues", count: String(venues.length), context: "rooms in the network", href: "/admin/venues", icon: "venues" },
    { id: "swaps", label: "active swaps", count: String(activeSwaps.length), context: activeSwaps[0]?.partner_artist_name || "exchange board ready", href: "/admin/people", icon: "swaps" },
  ];

  return <OperationsDashboard user={{ id: user.id, fullName: displayName(profileData?.full_name || user.email?.split("@")[0] || "Administrator"), role: profileData?.role || "super_admin", lastLogin: user.last_sign_in_at }} liveItems={liveItems.slice(0, 5)} countdown={countdown} calendarEntries={calendarEntries} cards={cards} arms={arms} activity={activity} quickLinks={quickLinks} generatedAt={new Date().toISOString()} />;
}
