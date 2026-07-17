import type { CSSProperties } from "react";

type Promotion = { artist: string; format: string; title: string; detail: string; note: string; tone: "violet" | "amber" | "jade" };

export function PromotionCard({ promotion }: { promotion: Promotion }) {
  return <article className={`promotion-card promotion-card--${promotion.tone}`} style={{ "--poster-index": promotion.artist.length } as CSSProperties}><div className="poster"><p>{promotion.artist}</p><h3>{promotion.title}</h3><span>{promotion.detail}</span><i aria-hidden="true" /></div><div className="promotion-meta"><p className="eyebrow">{promotion.format}</p><span>{promotion.note}</span></div></article>;
}
