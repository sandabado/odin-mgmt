import type { Metadata } from "next";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { RecordsPracticePage } from "@/components/whole-body-records/RecordsPracticePage";
import { recordsIntakeHref } from "@/lib/records-intake";

export const metadata: Metadata = {
  title: "Sync Licensing — Whole Body Records",
  description:
    "Bring a film, television, game, advertising, or media licensing inquiry to Whole Body Records for artist-aware human review.",
  alternates: { canonical: "/sync" },
};

export default function SyncPage() {
  return (
    <RecordsPageShell route="sync">
      <MuseumPageHero
        description="A careful path for music-in-picture inquiries. Bring the project, usage, timing, and clearance context; the artist remains part of the decision."
        eyebrow="Sync licensing"
        title={
          <>
            Music for picture,
            <br />
            <em>artist in the room.</em>
          </>
        }
      />

      <RecordsPracticePage
        actions={[
          {
            href: recordsIntakeHref("sync"),
            label: "Send a licensing inquiry",
            primary: true,
          },
        ]}
        boundary={{
          body: "An inquiry is not a quote, hold, clearance, or license. Rights, ownership, conflicts, terms, and artist approval must be confirmed for the specific use before anything can proceed.",
          eyebrow: "Clearance boundary",
          points: [
            "No placement is promised by submitting a brief",
            "No use is cleared until the required parties approve it",
            "No public availability statement replaces project-specific review",
          ],
          title: "Nothing clears itself.",
        }}
        chapters={[
          {
            body: "Tell us what the production is, who is making it, where the music appears, and what the scene or story needs to hold.",
            eyebrow: "The brief",
            points: ["Project and media", "Scene or creative direction"],
            title: "Start with the picture.",
          },
          {
            body: "Include the requested term, territory, media, exclusivity, timing, and budget context when those details are known.",
            eyebrow: "The use",
            points: ["Term, territory, and media", "Deadline and budget context"],
            title: "Name the actual use.",
          },
          {
            body: "The label can review the inquiry with the relevant artist and rights context. A human response follows only when there is enough information to assess the request.",
            eyebrow: "The review",
            points: ["Artist-aware review", "Project-specific next steps"],
            title: "Keep the maker present.",
          },
        ]}
        introduction="The song is not an interchangeable asset. A useful sync conversation respects the production and the people who made the music by giving both sides enough context to make a real decision."
        introductionEyebrow="Music supervision · Film · Television · Games · Media"
        introductionTitle="A clear brief creates a clear current."
      />
    </RecordsPageShell>
  );
}
