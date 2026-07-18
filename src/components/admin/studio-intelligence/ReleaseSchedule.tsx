import type { ReleaseStatus, StudioRelease } from "./types";
import { EmptyIntelligenceState, IntelligencePanel, SignalTag, StatusBadge, type SignalTone } from "./shared";
import { countdownLabel, formatStudioDate, toLabel } from "./utils";

const releaseStatusTone: Record<ReleaseStatus, SignalTone> = {
  planned: "quiet",
  scheduled: "plasma",
  distributed: "flux",
  live: "halo",
  delayed: "alert",
};

function ReleaseLink({ href, children }: { href: string | null; children: string }) {
  if (!href) return null;
  return <a className="font-mono text-[8px] uppercase tracking-[.11em] text-flux transition hover:text-bone" href={href} rel="noreferrer" target="_blank">{children} ↗</a>;
}

export function ReleaseSchedule({
  releases,
  title = "Release runway.",
  detail = "dates · metadata · delivery",
  showTechnical = true,
  className,
}: {
  releases: StudioRelease[];
  title?: string;
  detail?: string;
  /** Hide codes and distribution internals when this is reused in an artist-facing portal. */
  showTechnical?: boolean;
  className?: string;
}) {
  const ordered = [...releases].sort((left, right) => left.release_date.localeCompare(right.release_date));

  return <IntelligencePanel className={className} eyebrow="Records signal" title={title} detail={detail}>
    {ordered.length ? <div className="mt-5 grid gap-3">
      {ordered.map((release) => {
        const pendingDistribution = !release.distribution_submitted && release.status !== "live";
        const needsCover = !release.cover_art_url && release.status !== "live";
        const platformLinks = [
          { label: "Spotify", href: release.spotify_url },
          { label: "Apple", href: release.apple_url },
          { label: "Bandcamp", href: release.bandcamp_url },
          { label: "YouTube", href: release.youtube_url },
        ];

        return <article className="relative overflow-hidden border border-steel bg-void/60 p-4" key={release.id}>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_100%_0,rgba(176,38,255,.17),transparent_66%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <SignalTag tone="quiet">{toLabel(release.release_type)}</SignalTag>
                <StatusBadge tone={releaseStatusTone[release.status]}>{toLabel(release.status)}</StatusBadge>
              </div>
              <h3 className="mt-3 font-display text-2xl leading-none text-bone">{release.title}</h3>
            </div>
            <div className="min-w-24 text-right">
              <time className="block font-mono text-[10px] uppercase tracking-[.11em] text-flux" dateTime={release.release_date}>{formatStudioDate(release.release_date, "short")}</time>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[.11em] text-ghost">{countdownLabel(release.release_date)}</p>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-steel py-3">
            {platformLinks.some((platform) => platform.href) ? platformLinks.map((platform) => <ReleaseLink href={platform.href} key={platform.label}>{platform.label}</ReleaseLink>) : <p className="font-mono text-[8px] uppercase tracking-[.11em] text-ghost">Platform links unlock after distribution.</p>}
            {release.presave_link ? <ReleaseLink href={release.presave_link}>Presave</ReleaseLink> : null}
            {release.cover_art_url ? <ReleaseLink href={release.cover_art_url}>Cover art</ReleaseLink> : null}
          </div>

          {showTechnical ? <div className="relative mt-3 grid gap-2 text-xs text-ghost sm:grid-cols-2">
            <p>ISRC <span className="font-mono text-[9px] text-bone">{release.isrc_code || "Pending"}</span></p>
            <p>UPC <span className="font-mono text-[9px] text-bone">{release.upc_code || "Pending"}</span></p>
          </div> : null}

          <div className="relative mt-3 flex flex-wrap gap-2">
            {release.press_deadline ? <SignalTag tone="halo">Press deadline · {formatStudioDate(release.press_deadline, "short")}</SignalTag> : null}
            {showTechnical && pendingDistribution ? <SignalTag tone="alert">Distribution not submitted</SignalTag> : null}
            {showTechnical && needsCover ? <SignalTag tone="alert">Cover art missing</SignalTag> : null}
          </div>
          {release.notes ? <p className="relative mt-3 text-xs leading-5 text-ghost">{release.notes}</p> : null}
        </article>;
      })}
    </div> : <EmptyIntelligenceState>No releases are scheduled. When the release path is set, its dates, delivery state, and rollout blockers will appear here.</EmptyIntelligenceState>}
  </IntelligencePanel>;
}
