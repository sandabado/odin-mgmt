"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { memberHomeForRole } from "@/lib/auth/member-destination";
import type { OdinRole } from "@/lib/auth/roles";
import { RECORDS_PUBLIC_ROUTES } from "@/lib/records-public-routes";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

interface MemberSession {
  destination: string;
  initial: string;
  name: string;
}

export interface RecordsSessionControlProps {
  active?: boolean;
}

function initialFor(value: string) {
  return value.trim().charAt(0).toLocaleUpperCase() || "Ø";
}

export function RecordsSessionControl({
  active = false,
}: RecordsSessionControlProps) {
  const [member, setMember] = useState<MemberSession | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let cancelled = false;

    async function refresh() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setMember(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle<{ full_name: string | null; role: OdinRole }>();
      const destination = memberHomeForRole(profile?.role);
      if (!destination || cancelled) {
        if (!cancelled) setMember(null);
        return;
      }

      const name =
        profile?.full_name?.trim() ||
        user.email?.split("@")[0] ||
        "ØDIN member";
      setMember({
        destination,
        initial: initialFor(name),
        name,
      });
    }

    void refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (member) {
    return (
      <Link
        aria-current={active ? "page" : undefined}
        aria-label={`Open ØDIN for ${member.name}`}
        className="records-session-control records-session-control--member"
        href={member.destination}
        title={`Open ØDIN · ${member.name}`}
      >
        <span aria-hidden="true">{member.initial}</span>
      </Link>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label="Log in to ØDIN member access"
      className="records-session-control"
      href={RECORDS_PUBLIC_ROUTES.login.href}
    >
      <CircleUserRound aria-hidden="true" size={16} strokeWidth={1.5} />
      <span>Log in</span>
    </Link>
  );
}
