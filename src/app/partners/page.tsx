import type { Metadata } from "next";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { RecordsPracticePage } from "@/components/whole-body-records/RecordsPracticePage";
import { recordsIntakeHref } from "@/lib/records-intake";

export const metadata: Metadata = {
  title: "Partners — Whole Body Records",
  description:
    "A human-reviewed doorway for aligned collaborators to approach Whole Body Records.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  return (
    <RecordsPageShell route="partners">
      <MuseumPageHero
        description="For people and organizations with a real opportunity, a necessary skill, a room, a platform, or another missing piece. Every inquiry begins with context."
        eyebrow="Work with the label"
        title={
          <>
            Build what the work
            <br />
            <em>actually needs.</em>
          </>
        }
      />

      <RecordsPracticePage
        actions={[
          {
            href: recordsIntakeHref("partner"),
            label: "Begin a partner conversation",
            primary: true,
          },
        ]}
        boundary={{
          body: "Submitting an inquiry does not create a partnership, representation agreement, booking, placement, endorsement, or other commitment. It opens a human-reviewed conversation.",
          eyebrow: "No invented alliance",
          points: [
            "We do not publish a partner name without permission",
            "We do not imply a deal before the people involved agree",
            "We do not promise an outcome in exchange for an introduction",
          ],
          title: "A doorway is not a promise.",
        }}
        chapters={[
          {
            body: "Music supervisors, filmmakers, game teams, and other storytellers can bring a clear brief through the licensing path.",
            eyebrow: "Picture and story",
            title: "Find the right song with care.",
          },
          {
            body: "Venues, presenters, festivals, and production teams can share a specific room, date, or live opportunity for review.",
            eyebrow: "Rooms and roads",
            title: "Bring a real place and purpose.",
          },
          {
            body: "Studios, makers, media, distributors, and aligned service partners can describe what they contribute and where it may serve the work.",
            eyebrow: "The missing piece",
            title: "Add capacity, not noise.",
          },
        ]}
        introduction="Whole Body Records does not need a wall of borrowed logos. It needs relationships that remain legible to the artists and people doing the work. This page names the kinds of conversations we are prepared to review—not partnerships we claim already exist."
        introductionEyebrow="Potential collaborators"
        introductionTitle="Specific people. Specific contribution."
      />
    </RecordsPageShell>
  );
}
