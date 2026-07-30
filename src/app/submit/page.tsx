import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import {
  parseRecordsIntakeIntent,
  recordsIntakePresentation,
} from "@/lib/records-intake";

export const metadata: Metadata = {
  title: "Submit — Whole Body Records",
  description: "Send your work to Whole Body Records for human review.",
  alternates: { canonical: "/submit" },
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent: requestedIntent } = await searchParams;
  const intent = parseRecordsIntakeIntent(requestedIntent);
  const presentation = recordsIntakePresentation[intent];

  return (
    <RecordsPageShell activeNav="submit" route="submit">
      <MuseumPageHero
        description={presentation.promise}
        eyebrow={presentation.eyebrow}
        title={
          <>
            {presentation.title}
            <br />
            <em>Human to human.</em>
          </>
        }
      />

      <RecordsGeometryDivider tone="deep" />

      <section
        className="records-submit records-submit--page"
        data-records-reveal=""
      >
        <div className="records-submit__copy">
          <p className="records-index">Human review</p>
          <p className="records-kicker">{presentation.eyebrow}</p>
          <h2>
            {presentation.title} <em>We&apos;ll listen.</em>
          </h2>
          <p>{presentation.detailPlaceholder}</p>
          <ul>
            <li>Two or three tracks, or a portfolio</li>
            <li>Your contact information</li>
            <li>A clear note about the support you need</li>
          </ul>
          <p className="records-submit__promise">
            No mass emails. No generic templates. Human review.
          </p>
        </div>
        <BookingForm intent={intent} />
      </section>

      <RecordsGeometryDivider tone="deep" />
    </RecordsPageShell>
  );
}
