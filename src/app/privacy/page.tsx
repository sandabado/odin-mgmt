import type { Metadata } from "next";
import Link from "next/link";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";

export const metadata: Metadata = {
  title: "Privacy — Whole Body Records",
  description:
    "How Whole Body Records handles artist submissions and personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <RecordsPageShell route="legal" variant="legal">
      <p className="records-kicker">Privacy</p>
      <h1>We protect the work and the people behind it.</h1>
      <p>
        Whole Body Records uses submission details only to review the work,
        respond to the sender, and maintain the resulting conversation. We do
        not sell personal information or use artist submissions for unrelated
        marketing.
      </p>
      <p>
        Submission records are available only to authorized ØDIN operations
        users. Sending work does not grant Whole Body Records ownership,
        publishing, licensing, or other rights in that work.
      </p>
      <p>
        For access, correction, deletion, or privacy questions, contact{" "}
        <a href="mailto:booking@odin.management?subject=Whole%20Body%20Records%20privacy">
          booking@odin.management
        </a>
        .
      </p>
      <Link className="records-catalog-link" href="/">
        Return home <span aria-hidden="true">→</span>
      </Link>
    </RecordsPageShell>
  );
}
