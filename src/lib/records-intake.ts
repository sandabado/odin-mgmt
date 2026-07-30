export const recordsIntakeIntents = [
  "artist",
  "partner",
  "sync",
  "art-of-the-song",
] as const;

export type RecordsIntakeIntent = (typeof recordsIntakeIntents)[number];

export interface RecordsIntakePresentation {
  button: string;
  detailLabel: string;
  detailPlaceholder: string;
  eyebrow: string;
  linkLabel: string;
  organizationLabel: string;
  promise: string;
  title: string;
}

export const recordsIntakePresentation: Record<
  RecordsIntakeIntent,
  RecordsIntakePresentation
> = {
  artist: {
    button: "Submit your work",
    detailLabel: "What are you looking for?",
    detailPlaceholder:
      "Tell us where the work is now and what kind of structure would help.",
    eyebrow: "Join the collection",
    linkLabel: "Best work link",
    organizationLabel: "Artist / project name",
    promise: "No mass emails. No generic templates. Human review.",
    title: "Begin with the work.",
  },
  partner: {
    button: "Begin the conversation",
    detailLabel: "What could we build together?",
    detailPlaceholder:
      "Tell us about the opportunity, the people involved, and why this belongs in the Whole Body Records current.",
    eyebrow: "Partner with the label",
    linkLabel: "Relevant work / organization link",
    organizationLabel: "Organization / project",
    promise: "Every inquiry is reviewed by a person before anything moves.",
    title: "Bring the missing piece.",
  },
  sync: {
    button: "Send the licensing inquiry",
    detailLabel: "What does the music need to hold?",
    detailPlaceholder:
      "Share the production, brief, media, territory, timing, and any clearance context already known.",
    eyebrow: "Sync licensing",
    linkLabel: "Project / brief link",
    organizationLabel: "Company / production",
    promise: "No placement proceeds without artist review and approval.",
    title: "Place the work with care.",
  },
  "art-of-the-song": {
    button: "Pitch one song",
    detailLabel: "Why this song?",
    detailPlaceholder:
      "Tell us what the song carries, where it came from, and why this is the one you want us to hear.",
    eyebrow: "Art of the Song",
    linkLabel: "Private listening link",
    organizationLabel: "Artist / songwriter",
    promise:
      "One song, full context, and a human review. No automated acceptance.",
    title: "Let one song speak in full.",
  },
};

export function parseRecordsIntakeIntent(
  value: string | undefined,
): RecordsIntakeIntent {
  return recordsIntakeIntents.includes(value as RecordsIntakeIntent)
    ? (value as RecordsIntakeIntent)
    : "artist";
}

export function recordsIntakeHref(intent: RecordsIntakeIntent) {
  return `/submit?intent=${intent}` as const;
}
