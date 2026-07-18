import type { MilestoneStatus, StudioMilestone } from "./types";
import { EmptyIntelligenceState, IntelligencePanel, StatusBadge, cx, type SignalTone } from "./shared";
import { formatStudioDate } from "./utils";

const milestonePresentation: Record<MilestoneStatus, { icon: string; tone: SignalTone; label: string }> = {
  complete: { icon: "✓", tone: "flux", label: "Complete" },
  in_progress: { icon: "●", tone: "plasma", label: "In motion" },
  pending: { icon: "○", tone: "quiet", label: "Upcoming" },
  blocked: { icon: "×", tone: "alert", label: "Blocked" },
  skipped: { icon: "—", tone: "quiet", label: "Skipped" },
};

function milestoneDate(milestone: StudioMilestone) {
  return milestone.completed_date ?? milestone.scheduled_date;
}

export function MilestoneTimeline({
  milestones,
  title = "Recording timeline.",
  detail = "writing · tracking · mix · master · delivery",
  showCompletedDetails = false,
  maxItems,
  className,
}: {
  milestones: StudioMilestone[];
  title?: string;
  detail?: string;
  showCompletedDetails?: boolean;
  maxItems?: number;
  className?: string;
}) {
  const ordered = [...milestones]
    .sort((left, right) => (milestoneDate(left) ?? "9999-12-31").localeCompare(milestoneDate(right) ?? "9999-12-31"));
  const visible = maxItems ? ordered.slice(0, maxItems) : ordered;
  const activeId = ordered.find((milestone) => milestone.status === "in_progress")?.id;

  return <IntelligencePanel className={className} eyebrow="Engineering signal" title={title} detail={detail}>
    {visible.length ? <ol className="mt-5">
      {visible.map((milestone, index) => {
        const presentation = milestonePresentation[milestone.status];
        const isActive = milestone.id === activeId;
        const isCompact = (milestone.status === "complete" || milestone.status === "skipped") && !showCompletedDetails;
        const date = milestoneDate(milestone);

        return <li className="relative grid grid-cols-[34px_minmax(0,1fr)_auto] gap-3 pb-5 last:pb-0" key={milestone.id}>
          {index < visible.length - 1 ? <span aria-hidden="true" className="absolute bottom-0 left-[13px] top-7 w-px bg-steel" /> : null}
          <span aria-label={presentation.label} className={cx(
            "relative z-10 grid h-7 w-7 place-items-center rounded-full border bg-void font-mono text-sm",
            presentation.tone === "flux" && "border-flux text-flux",
            presentation.tone === "plasma" && "border-plasma text-plasma",
            presentation.tone === "alert" && "border-[#ff6b8a] text-[#ff8ba4]",
            presentation.tone === "quiet" && "border-mercury text-ghost",
            isActive && "animate-pulse shadow-[0_0_22px_rgba(176,38,255,.44)]",
          )}>{presentation.icon}</span>
          <div className={cx("min-w-0", isCompact && "pt-1")}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className={cx("text-sm leading-5", milestone.status === "skipped" ? "text-ghost line-through" : "text-bone")}>{milestone.title}</p>
              {isActive ? <StatusBadge tone="plasma">Current</StatusBadge> : null}
            </div>
            {!isCompact && milestone.description ? <p className="mt-1.5 max-w-xl text-xs leading-5 text-ghost">{milestone.description}</p> : null}
          </div>
          <time className={cx("pt-1 text-right font-mono text-[9px] uppercase tracking-[.1em]", isActive ? "text-plasma" : "text-ghost")} dateTime={date ?? undefined}>{formatStudioDate(date, "short")}</time>
        </li>;
      })}
    </ol> : <EmptyIntelligenceState>No milestones are mapped yet. The recording chain will make the next creative decision visible to the whole team.</EmptyIntelligenceState>}
  </IntelligencePanel>;
}
