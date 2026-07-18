export type MilestoneStatus = "pending" | "in_progress" | "complete" | "skipped" | "blocked";

export type MilestoneType =
  | "song_written"
  | "demo_recorded"
  | "tracking_started"
  | "tracking_complete"
  | "overdubs_added"
  | "mixing_started"
  | "mix_approved"
  | "mastering_started"
  | "master_delivered"
  | "isrc_assigned"
  | "distribution_uploaded"
  | "release_live";

export type StudioMilestone = {
  id: string;
  project_id: string;
  artist_id: string;
  milestone_type: MilestoneType;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  scheduled_date: string | null;
  completed_date: string | null;
};

export type ReleaseType = "single" | "ep" | "album" | "video" | "merch_drop";
export type ReleaseStatus = "planned" | "scheduled" | "distributed" | "live" | "delayed";

export type StudioRelease = {
  id: string;
  project_id: string;
  artist_id: string;
  release_type: ReleaseType;
  title: string;
  release_date: string;
  status: ReleaseStatus;
  spotify_url: string | null;
  apple_url: string | null;
  bandcamp_url: string | null;
  youtube_url: string | null;
  isrc_code: string | null;
  upc_code: string | null;
  presave_link: string | null;
  press_deadline: string | null;
  distribution_submitted: boolean;
  distribution_submitted_date: string | null;
  cover_art_url: string | null;
  notes: string | null;
};

export type CampaignType =
  | "release_pr"
  | "show_promotion"
  | "sync_pitch"
  | "social_media"
  | "playlist_pitch"
  | "radio_push"
  | "influencer_outreach"
  | "swap_promotion";

export type CampaignStatus = "planning" | "active" | "paused" | "complete" | "cancelled";

export type StudioCampaign = {
  id: string;
  project_id: string;
  artist_id: string;
  campaign_type: CampaignType;
  title: string;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  target_outlets: string[];
  target_playlists: string[];
  pitches_sent: number;
  responses_received: number;
  coverage_secured: number;
  playlist_adds: number;
  estimated_reach: number;
  budget_cents: number;
  spent_cents: number;
  assigned_to: string | null;
  /** A resolved profile name, supplied by the page if it joins profiles. */
  assigned_to_name?: string | null;
  notes: string | null;
};

export type OpportunityType =
  | "show_booking"
  | "sync_placement"
  | "festival_submission"
  | "brand_partnership"
  | "collaboration"
  | "press_feature"
  | "playlist_submission"
  | "radio_feature"
  | "swap_deal"
  | "licensing_deal"
  | "merch_opportunity";

export type OpportunityStatus =
  | "identified"
  | "researching"
  | "pitched"
  | "in_negotiation"
  | "verbal_yes"
  | "contract_sent"
  | "confirmed"
  | "declined"
  | "expired";

export type OpportunityPriority = "low" | "medium" | "high" | "critical";

export type StudioOpportunity = {
  id: string;
  artist_id: string;
  opportunity_type: OpportunityType;
  title: string;
  description: string | null;
  status: OpportunityStatus;
  priority: OpportunityPriority;
  estimated_value_cents: number | null;
  actual_value_cents: number | null;
  contact_id: string | null;
  venue_id: string | null;
  /** Resolved display names, supplied by the parent when relationship data is loaded. */
  contact_name?: string | null;
  venue_name?: string | null;
  identified_date: string;
  target_date: string | null;
  close_date: string | null;
  probability: number;
  assigned_to: string | null;
  assigned_to_name?: string | null;
  notes: string | null;
};

export type StudioIntelligenceData = {
  milestones: StudioMilestone[];
  releases: StudioRelease[];
  campaigns: StudioCampaign[];
  opportunities: StudioOpportunity[];
};
