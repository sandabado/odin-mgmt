import type { Metadata } from "next";
import { FoundationInviteCompletionForm } from "@/components/foundation/FoundationInviteCompletionForm";

export const metadata: Metadata = {
  title: "Complete Foundation Invitation — ØDIN",
  description: "Complete an individual Whole Body Foundation invitation.",
  robots: { index: false, follow: false, noarchive: true },
};

export default function CompleteFoundationInvitePage() {
  return <FoundationInviteCompletionForm />;
}
