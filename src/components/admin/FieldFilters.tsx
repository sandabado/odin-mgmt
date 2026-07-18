import Link from "next/link";

type FilterOption = { label: string; value: string };

export function FieldFilters({ label, param, active, options, values = {} }: { label: string; param: string; active?: string; options: FilterOption[]; values?: Record<string, string | undefined> }) {
  const hrefFor = (value?: string) => {
    const query = new URLSearchParams();
    Object.entries(values).forEach(([key, item]) => { if (item && key !== param) query.set(key, item); });
    if (value) query.set(param, value);
    const serialized = query.toString();
    return serialized ? `?${serialized}` : "?";
  };
  return <nav aria-label={`Filter ${label}`} className="flex flex-wrap items-center gap-2"><span className="mr-1 font-mono text-[9px] uppercase tracking-[.14em] text-ghost">{label}</span><Link className={`border px-3 py-2 font-mono text-[9px] uppercase tracking-[.1em] transition ${!active ? "border-flux bg-flux/10 text-flux" : "border-steel text-ghost hover:border-mercury hover:text-bone"}`} href={hrefFor()}>All</Link>{options.map((option) => <Link className={`border px-3 py-2 font-mono text-[9px] uppercase tracking-[.1em] transition ${active === option.value ? "border-flux bg-flux/10 text-flux" : "border-steel text-ghost hover:border-mercury hover:text-bone"}`} href={hrefFor(option.value)} key={option.value}>{option.label}</Link>)}</nav>;
}
