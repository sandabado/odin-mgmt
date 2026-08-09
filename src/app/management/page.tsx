import type { Metadata } from "next";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import { RecordsPracticePage } from "@/components/whole-body-records/RecordsPracticePage";
import { recordsIntakeHref } from "@/lib/records-intake";
import { RECORDS_PUBLIC_ROUTES } from "@/lib/records-public-routes";

export const metadata: Metadata = {
  title: "ØDIN Management — Whole Body Records",
  description:
    "A public view of the protected operating engine behind Whole Body Records.",
  alternates: { canonical: "/management" },
};

export default function ManagementPage() {
  return (
    <RecordsPageShell route="management">
      <MuseumPageHero
        description="ØDIN is the protected operating engine behind Whole Body Records. The public site carries approved work; private operations stay inside their proper boundary."
        eyebrow="The operating engine"
        title={
          <>
            The work stays
            <br />
            <em>connected.</em>
          </>
        }
      />

      <RecordsPracticePage
        actions={[
          {
            href: recordsIntakeHref("artist"),
            label: "Bring us your work",
            primary: true,
          },
          {
            href: RECORDS_PUBLIC_ROUTES.login.href,
            label: "Enter ØDIN",
          },
        ]}
        boundary={{
          body: "Whole Body Records publishes only material that has crossed its approval boundary. ØDIN is not a public directory of artists, finances, contacts, negotiations, or internal plans.",
          eyebrow: "The public boundary",
          points: [
            "Approved artist, release, and tour material may move to the public site",
            "Private working records remain behind authenticated access",
            "Consequential decisions remain visible to the people responsible for them",
          ],
          title: "Protected inside. Clear outside.",
        }}
        chapters={[
          {
            body: "Artist context, records, campaigns, bookings, rights, and revenue can be understood as one operating picture instead of disconnected tasks.",
            eyebrow: "One context",
            title: "See the whole body.",
          },
          {
            body: "Access follows role and responsibility. The public website does not expose internal records simply because a public page points toward the label.",
            eyebrow: "Protected work",
            title: "Access has a reason.",
          },
          {
            body: "ØDIN can organize the signal, but people still review the work and authorize the decisions that affect artists, partners, and money.",
            eyebrow: "Human authority",
            title: "The engine does not decide.",
          },
        ]}
        introduction="A label becomes coherent when the creative, operational, and financial context can be held together without making private work public. ØDIN provides that internal frame for Whole Body Records."
        introductionEyebrow="Whole Body Records · ØDIN"
        introductionTitle="A private engine beneath a public current."
      />
    </RecordsPageShell>
  );
}
