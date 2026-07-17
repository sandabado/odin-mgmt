type ContactWarmthMeterProps = { score: number };

export function ContactWarmthMeter({ score }: ContactWarmthMeterProps) {
  const safeScore = Math.max(0, Math.min(100, score));
  const label = safeScore >= 75 ? "Hot" : safeScore >= 40 ? "Warm" : "Cold";

  return <div className="flex items-center gap-3" aria-label={`${label} relationship score: ${safeScore} out of 100`}><div className="flex gap-1" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <span className={`h-2 w-5 ${safeScore >= (index + 1) * 20 ? "bg-flux" : "bg-steel"}`} key={index} />)}</div><span className="font-mono text-[10px] uppercase tracking-[.12em] text-ghost">{label} · {safeScore}/100</span></div>;
}
