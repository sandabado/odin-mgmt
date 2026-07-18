import { CampaignTracker } from "./CampaignTracker";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { OpportunityPipeline } from "./OpportunityPipeline";
import { ReleaseSchedule } from "./ReleaseSchedule";
import type { StudioIntelligenceData } from "./types";

/**
 * Full operations view for the four linked Studio Intelligence signals.
 * Feed it records scoped to one artist (and, where appropriate, their current project).
 */
export function StudioIntelligence({
  milestones,
  releases,
  campaigns,
  opportunities,
}: StudioIntelligenceData) {
  return <section aria-label="Studio intelligence" className="mt-4 grid gap-4 xl:grid-cols-2">
    <MilestoneTimeline milestones={milestones} />
    <ReleaseSchedule releases={releases} />
    <CampaignTracker campaigns={campaigns} className="xl:col-span-2" />
    <OpportunityPipeline opportunities={opportunities} className="xl:col-span-2" />
  </section>;
}
