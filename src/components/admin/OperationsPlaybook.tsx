"use client";

import { useState } from "react";

type Role = "super_admin" | "booking_director" | "artist";

const rolePlaybooks: Record<Role, { label: string; owner: string; purpose: string; daily: string[]; weekly: string[]; focus: string[] }> = {
  super_admin: {
    label: "Super Admin",
    owner: "Jesse / label owner",
    purpose: "See the whole field, approve decisive moves, and keep the Treasury healthy.",
    daily: ["Review overnight activity in the command hub.", "Check the Treasury for movement across all four arms.", "Review swaps awaiting approval and relationships cooling below 40.", "Clear high-value decisions that unblock the team."],
    weekly: ["Review Feed First allocation and pending payouts.", "Compare project investment to revenue and decide what gets resourced next.", "Audit the network: contacts added, warmth lost, and deals closed."],
    focus: ["Money flows correctly", "Relationships stay alive", "Projects compound value"],
  },
  booking_director: {
    label: "Booking Director",
    owner: "Palo / day-to-day operator",
    purpose: "Turn venue relationships and swaps into signed shows without losing the thread.",
    daily: ["Respond to hot leads within 24 hours.", "Clear follow-ups due today before new outreach.", "Log replies, calls, and notes into the contact field.", "Review swap proposals and generate promo for confirmed shows."],
    weekly: ["Add 5–10 venue targets by region.", "Plan the next outreach batch and review the swap network.", "Close the loop on deal history, contracts, and next contact dates."],
    focus: ["Speed to hot leads", "Follow-up discipline", "Network growth"],
  },
  artist: {
    label: "Artist",
    owner: "Managed roster member",
    purpose: "Keep the creative signal current: availability, assets, releases, and artist-share visibility.",
    daily: ["Review your confirmed schedule and project phase.", "Upload current photo and video assets for active shows.", "Confirm availability quickly when a hold arrives."],
    weekly: ["Review artist-share revenue and upcoming payouts.", "Check which project phase needs your creative input.", "Refresh links, bio, and assets before a release or tour push."],
    focus: ["Availability", "Current assets", "Clear project visibility"],
  },
};

const bookingLoop = [
  ["01", "Research", "Add a target venue with region, capacity, and contact context."],
  ["02", "Outreach", "Segment the right audience, personalize the pitch, and send at the right time."],
  ["03", "Signal", "Track opens, clicks, and replies; lead score and contact warmth update."],
  ["04", "Respond", "Treat hot leads as a 24-hour priority with a contextual reply."],
  ["05", "Deal", "Negotiate date, guarantee, rider, and notes in one relationship record."],
  ["06", "Contract", "Send terms, collect the deposit, and mark the show confirmed."],
  ["07", "Promo", "Generate the show kit and enable dual-market mode when a swap is active."],
  ["08", "Execute", "Log attendance, venue feedback, and the result of the relationship."],
  ["09", "Treasury", "Record the revenue; Feed First distributes the value."],
  ["10", "Maintain", "Set the next touchpoint. A completed show starts the next relationship cycle."],
] as const;

const onboarding = [
  ["Day 1", "Mental model", "Read the five-arm model, explore the hub, and add a safe practice contact."],
  ["Day 2", "Booking loop", "Walk a venue from prospect through a simulated reply and contract."],
  ["Day 3", "Network + Treasury", "Review warmth, propose a practice swap, and trace a revenue entry through Feed First."],
  ["Week 2", "Live operations", "Add real venues and contacts, run a small approved outreach batch, then review the result."],
] as const;

const demoFlow = ["Vision: five arms, one central treasury.", "Rolodex: show relationship warmth and deal context.", "Swap network: explain the exchange engine.", "Promo studio: one source asset, many outputs.", "Treasury: prove the Feed First split and project ROI.", "Close: this is the operating system, not a booking spreadsheet."];

export function OperationsPlaybook() {
  const [role, setRole] = useState<Role>("super_admin");
  const current = rolePlaybooks[role];

  return <div className="space-y-5"><section className="relative overflow-hidden border border-mercury bg-carbon p-6 sm:p-9"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(176,38,255,.24),transparent_28%)]" /><div className="relative"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Odin Operations Playbook</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.86] sm:text-6xl">A relationship engine that happens to book shows.</h1><p className="mt-6 max-w-2xl text-sm leading-6 text-ghost">Use this field manual to train an operator, run the day with intent, or demonstrate Odin to a label partner. Every action should strengthen the next relationship—not disappear into a spreadsheet.</p><div className="mt-8 grid gap-px border border-mercury bg-mercury sm:grid-cols-5"><PlaybookArm label="PR" note="Media · Campaigns" /><PlaybookArm label="Records" note="Publishing · Sync" /><PlaybookArm central label="Ø Hub" note="Treasury · Projects" /><PlaybookArm label="Engineering" note="Recording · Mastering" /><PlaybookArm label="Management" note="Odin · Relationships" /></div></div></section><section className="grid gap-5 lg:grid-cols-[.86fr_1.14fr]"><article className="border border-mercury bg-carbon p-5"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">Role playbooks</p><div className="mt-5 grid gap-2">{(Object.keys(rolePlaybooks) as Role[]).map((item) => <button className={`border px-4 py-3 text-left transition ${item === role ? "border-plasma bg-steel text-bone" : "border-steel text-ghost hover:border-mercury hover:text-bone"}`} key={item} onClick={() => setRole(item)} type="button"><span className="font-mono text-[10px] uppercase tracking-[.14em]">{rolePlaybooks[item].label}</span><span className="mt-1 block text-xs">{rolePlaybooks[item].owner}</span></button>)}</div></article><article className="border border-mercury bg-carbon p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">{current.label} field</p><h2 className="mt-3 font-display text-4xl leading-none">{current.owner}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-ghost">{current.purpose}</p></div><div className="border border-flux px-3 py-2 font-mono text-[9px] uppercase tracking-[.13em] text-flux">Daily operating mode</div></div><div className="mt-7 grid gap-5 md:grid-cols-2"><TaskList title="Daily rhythm" tasks={current.daily} /><TaskList title="Weekly review" tasks={current.weekly} /></div><div className="mt-6 flex flex-wrap gap-2">{current.focus.map((item) => <span className="border border-steel px-3 py-2 font-mono text-[9px] uppercase tracking-[.1em] text-ghost" key={item}>{item}</span>)}</div></article></section><section className="border border-mercury bg-carbon p-5 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">The permanent booking loop</p><h2 className="mt-3 font-display text-4xl leading-none">Cold venue → permanent asset.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">The work does not end when a show is booked. Odin captures the context, revenue, and next touchpoint so the relationship gets stronger every time.</p><ol className="mt-7 grid gap-px border border-mercury bg-mercury md:grid-cols-2 xl:grid-cols-5">{bookingLoop.map(([number, title, copy]) => <li className="bg-carbon p-4" key={number}><p className="font-mono text-[10px] tracking-[.15em] text-plasma">{number}</p><h3 className="mt-5 font-display text-2xl leading-none">{title}</h3><p className="mt-3 text-xs leading-5 text-ghost">{copy}</p></li>)}</ol></section><section className="grid gap-5 lg:grid-cols-2"><article className="border border-mercury bg-carbon p-5 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">Onboarding runway</p><h2 className="mt-3 font-display text-4xl leading-none">Learn by moving through the field.</h2><div className="mt-6 divide-y divide-mercury border-y border-mercury">{onboarding.map(([time, title, copy]) => <div className="grid gap-2 py-4 sm:grid-cols-[90px_1fr]" key={time}><p className="font-mono text-[10px] uppercase tracking-[.12em] text-flux">{time}</p><div><h3 className="font-display text-2xl leading-none">{title}</h3><p className="mt-2 text-xs leading-5 text-ghost">{copy}</p></div></div>)}</div></article><article className="border border-mercury bg-carbon p-5 sm:p-7"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">15-minute demo script</p><h2 className="mt-3 font-display text-4xl leading-none">Show the system, not a dashboard.</h2><ol className="mt-6 space-y-3">{demoFlow.map((step, index) => <li className="flex gap-4 border-l border-mercury pl-4" key={step}><span className="font-mono text-[10px] text-plasma">{String(index + 1).padStart(2, "0")}</span><p className="m-0 text-sm leading-5 text-ghost">{step}</p></li>)}</ol><p className="mt-8 border border-flux bg-void p-4 font-mono text-[10px] uppercase leading-5 tracking-[.1em] text-flux">So it is built. So it holds. So it is.</p></article></section></div>;
}

function PlaybookArm({ label, note, central = false }: { label: string; note: string; central?: boolean }) {
  return <div className={`p-4 text-center ${central ? "bg-void text-flux" : "bg-carbon text-ghost"}`}><p className="font-display text-2xl leading-none">{label}</p><p className="mt-2 font-mono text-[8px] uppercase tracking-[.11em]">{note}</p></div>;
}

function TaskList({ title, tasks }: { title: string; tasks: string[] }) {
  return <div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-ghost">{title}</p><ol className="mt-4 space-y-3">{tasks.map((task, index) => <li className="flex gap-3" key={task}><span className="font-mono text-[10px] text-plasma">{String(index + 1).padStart(2, "0")}</span><span className="text-xs leading-5 text-ghost">{task}</span></li>)}</ol></div>;
}
