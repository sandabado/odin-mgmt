import type { Metadata } from "next";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { RecordsPracticePage } from "@/components/whole-body-records/RecordsPracticePage";
import { recordsIntakeHref } from "@/lib/records-intake";

export const metadata: Metadata = {
  title: "Art of the Song — Whole Body Records",
  description:
    "Pitch one song, with full context, for human review by Whole Body Records.",
  alternates: { canonical: "/art-of-the-song" },
};

export default function ArtOfTheSongPage() {
  return (
    <RecordsPageShell route="art-of-the-song">
      <MuseumPageHero
        description="Art of the Song is a named human-review pitch path: one song, one private listening link, and enough context to hear the work in full."
        eyebrow="Art of the Song"
        title={
          <>
            Let one song
            <br />
            <em>speak in full.</em>
          </>
        }
      />

      <RecordsPracticePage
        actions={[
          {
            href: recordsIntakeHref("art-of-the-song"),
            label: "Pitch one song",
            primary: true,
          },
        ]}
        boundary={{
          body: "Art of the Song is not a contest, automated score, release offer, publishing deal, sync placement, or guarantee of a response. It is a focused way to place one song before a person with its context intact.",
          eyebrow: "What this path is—and is not",
          points: [
            "No automated acceptance",
            "No fee creates priority or an outcome",
            "No rights transfer is requested by the pitch form",
          ],
          title: "Human review. No hidden promise.",
        }}
        chapters={[
          {
            body: "Choose the one song you most need us to understand. Send one working private link rather than a folder or an entire catalog.",
            eyebrow: "One song",
            title: "Make the choice.",
          },
          {
            body: "Tell us who wrote and performs it, where the song is in its life, what it carries, and why this is the work you chose.",
            eyebrow: "Full context",
            title: "Let us know what we are hearing.",
          },
          {
            body: "A person reads the context and listens. If the work and the label have a real reason to continue the conversation, the next step is human too.",
            eyebrow: "Human review",
            title: "No machine decides the song.",
          },
        ]}
        introduction="The form is intentionally narrow. It protects attention for the song and asks the artist or songwriter to make one clear choice before asking another person to listen."
        introductionEyebrow="A focused pitch path"
        introductionTitle="One song is enough to begin."
      />
    </RecordsPageShell>
  );
}
