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

  return <main className="min-h-full p-5 sm:p-8"><OperationsPlaybook /></main>;
}
