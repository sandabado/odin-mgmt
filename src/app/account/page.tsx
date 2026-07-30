import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MuseumPageHero } from "@/components/whole-body-records/MuseumPageHero";
import { RecordsGeometryDivider } from "@/components/whole-body-records/RecordsGeometryDivider";
import { RecordsPageShell } from "@/components/whole-body-records/RecordsPageShell";
import type { OdinRole } from "@/lib/auth/roles";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account — Whole Body Records",
  description:
    "Private ØDIN member access for approved artists, Foundation partners, and operations stewards.",
  alternates: { canonical: "/account" },
  robots: { follow: false, index: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  let authenticatedWithoutRole = false;

  if (hasSupabaseEnvironment()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle<{ role: OdinRole }>();

      if (profile?.role === "artist") redirect("/artist/dashboard");
      if (profile?.role === "foundation_partner") redirect("/foundation");
      if (
        profile?.role === "booking_director" ||
        profile?.role === "super_admin"
      ) {
        redirect("/admin/dashboard");
      }
      authenticatedWithoutRole = true;
    }
  }

  return (
    <RecordsPageShell activeNav="account" route="account">
      <MuseumPageHero
        description="This doorway is for approved artists, Foundation partners, and the people supporting their work inside ØDIN."
        eyebrow="Member account"
        title={
          <>
            Private work.
            <br />
            <em>Role-aware access.</em>
          </>
        }
      />

      <RecordsGeometryDivider tone="deep" />

      <section className="museum-catalog-boundary" data-records-reveal="">
        <p className="records-kicker">ØDIN member gateway</p>
        <h2>
          {authenticatedWithoutRole
            ? "This account has no active ØDIN role."
            : "Enter the private current."}
        </h2>
        <p>
          {authenticatedWithoutRole
            ? "An operations steward must provision artist, Foundation partner, or team access before this account can enter the private workspace."
            : "Sign in with approved ØDIN credentials. Each member enters only the workspace assigned to their role."}
        </p>
        {!authenticatedWithoutRole ? (
          <Link
            className="records-button records-button--solid"
            href="/login"
          >
            Continue to member access <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link className="records-catalog-link" href="/">
            Return to Whole Body Records <span aria-hidden="true">→</span>
          </Link>
        )}
        <small>
          This is not a customer order account and does not expose purchase
          history.
        </small>
      </section>

      <RecordsGeometryDivider />
    </RecordsPageShell>
  );
}
