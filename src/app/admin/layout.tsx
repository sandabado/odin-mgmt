import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login?next=/admin/dashboard"); const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "artist") redirect("/artist/dashboard");
  const role = profile?.role === "booking_director" ? "booking_director" : "super_admin";
  return <AdminShell role={role}>{children}</AdminShell>;
}
