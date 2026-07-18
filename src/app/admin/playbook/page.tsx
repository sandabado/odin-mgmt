import { redirect } from "next/navigation";
import { OperationsPlaybook } from "@/components/admin/OperationsPlaybook";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  if (!hasSupabaseEnvironment()) redirect("/login?configuration=required");

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/playbook");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin" && profile?.role !== "booking_director") redirect("/admin");

  return <main className="min-h-full p-5 sm:p-8"><OperationsPlaybook /></main>;
}
