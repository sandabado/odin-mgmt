import type { Metadata } from "next";
import Link from "next/link";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";

export const metadata: Metadata = {
  title: "Terms — Whole Body Records",
  description:
    "Terms for the Whole Body Records website and artist submission process.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <RecordsPageShell route="legal" variant="legal">
      <p className="records-kicker">Terms</p>
      <h1>A submission starts a conversation—not a contract.</h1>
      <p>
        Materials on this site are informational. Sending music or other work
        does not create a recording, management, booking, distribution,
        publishing, or licensing agreement.
      </p>
      <p>
        You retain your rights in submitted work. Any future arrangement exists
        only when its terms are separately reviewed and signed by authorized
        parties.
      </p>
      <p>
        Please submit only work you are authorized to share. Do not include
        confidential third-party material or sensitive personal information.
      </p>
      <Link className="records-catalog-link" href="/">
        Return home <span aria-hidden="true">→</span>
      </Link>
    </RecordsPageShell>
  );
}
