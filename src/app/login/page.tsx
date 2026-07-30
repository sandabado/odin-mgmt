import type { Metadata } from "next";
import { RecordsLoginForm } from "@/components/whole-body-records/RecordsLoginForm";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";

export const metadata: Metadata = {
  title: "Member Access — Whole Body Records",
  description:
    "Private ØDIN operations for approved artists, Foundation partners, and stewards.",
  alternates: { canonical: "/login" },
  robots: { follow: false, index: false },
};

export default function LoginPage() {
  return (
    <RecordsPageShell activeNav="login" route="login" variant="auth">
      <RecordsLoginForm />
    </RecordsPageShell>
  );
}
