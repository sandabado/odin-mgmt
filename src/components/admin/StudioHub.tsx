type StudioArm = {
  id: "pr" | "records" | "engineering" | "management";
  label: string;
  capabilities: string;
  href?: string;
  state: string;
  position: string;
};

const studioArms: StudioArm[] = [
  { id: "pr", label: "PR", capabilities: "Press · Media · Campaigns", state: "Next arm", position: "sm:col-start-2 sm:row-start-1" },
  { id: "records", label: "Records", capabilities: "Publishing · Sync · Distribution", href: "/admin/artists", state: "Artist studios live", position: "sm:col-start-1 sm:row-start-2" },
  { id: "engineering", label: "Engineering", capabilities: "Recording · Mixing · Mastering", href: "/admin/artists", state: "Artist studios live", position: "sm:col-start-3 sm:row-start-2" },
  { id: "management", label: "Management", capabilities: "ØDIN · Booking · Relationships", href: "/admin/artists", state: "Artist studios live", position: "sm:col-start-2 sm:row-start-3" },
];

function ArmCard({ arm }: { arm: StudioArm }) {
  const content = <><div className="flex items-start justify-between gap-3"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost">{arm.label}</p><span className={`h-2 w-2 ${arm.href ? "bg-flux" : "bg-mercury"}`} aria-label={arm.state} /></div><p className="mt-6 font-display text-3xl leading-none">{arm.label}</p><p className="mt-3 text-[11px] leading-4 text-ghost">{arm.capabilities}</p><p className={`mt-5 font-mono text-[9px] uppercase tracking-[.13em] ${arm.href ? "text-flux" : "text-ghost"}`}>{arm.href ? "Enter arm →" : arm.state}</p></>;
  const className = `relative border border-steel bg-void/85 p-5 transition sm:min-h-40 ${arm.position} ${arm.href ? "hover:border-flux hover:bg-steel" : ""}`;

  return arm.href ? <a className={className} href={arm.href}>{content}</a> : <article className={className}>{content}</article>;
}

/** The admin command center: four operating arms around the Whole Body hub. */
export function StudioHub() {
  return <section className="relative overflow-hidden border border-mercury bg-carbon p-5 sm:p-8"><div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(176,38,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(176,38,255,.045)_1px,transparent_1px)] bg-[size:22px_22px]" /><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(176,38,255,.2),transparent_38%)]" /><div className="relative"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-plasma">Whole Body Studios / command center</p><h2 className="mt-3 font-display text-4xl leading-none">The hub is the heartbeat.</h2></div><p className="max-w-48 text-right font-mono text-[10px] uppercase leading-4 tracking-[.12em] text-ghost">Four arms · one shared field · Feed First</p></div><div className="mt-8 grid gap-3 sm:grid-cols-3 sm:grid-rows-3 sm:gap-0">{studioArms.map((arm) => <ArmCard arm={arm} key={arm.id} />)}<a className="group relative flex min-h-52 flex-col items-center justify-center overflow-hidden border border-flux bg-[radial-gradient(circle,rgba(176,38,255,.35),rgba(5,5,5,.96)_70%)] p-6 text-center transition hover:border-flux sm:col-start-2 sm:row-start-2" href="/admin/treasury"><span className="absolute h-32 w-32 border border-plasma/60 transition duration-500 group-hover:scale-125 group-hover:rotate-45" aria-hidden="true" /><span className="relative font-mono text-[10px] uppercase tracking-[.2em] text-flux">Ø Central Hub</span><span className="relative mt-4 font-display text-4xl leading-none">Treasury</span><span className="relative mt-3 max-w-44 text-xs leading-5 text-ghost">Projects · payouts · value flowing back through every arm</span><span className="relative mt-5 font-mono text-[9px] uppercase tracking-[.14em] text-bone">Open central ledger →</span></a></div><div className="mt-3 grid gap-px border border-mercury bg-mercury sm:grid-cols-4"><a href="/admin/contacts" className="bg-carbon p-4 transition hover:bg-steel"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-flux">Shared field</p><p className="mt-2 font-display text-xl leading-none">Contacts</p><p className="mt-2 text-[10px] leading-4 text-ghost">One Rolodex, every arm</p></a><article className="bg-carbon p-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-ghost">Shared field</p><p className="mt-2 font-display text-xl leading-none">Projects</p><p className="mt-2 text-[10px] leading-4 text-ghost">One ID, full lifecycle</p></article><article className="bg-carbon p-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-ghost">Shared field</p><p className="mt-2 font-display text-xl leading-none">Promo Studio</p><p className="mt-2 text-[10px] leading-4 text-ghost">One signal, many formats</p></article><article className="bg-carbon p-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-ghost">Shared field</p><p className="mt-2 font-display text-xl leading-none">Calendar</p><p className="mt-2 text-[10px] leading-4 text-ghost">Availability without conflict</p></article></div></div></section>;
}
