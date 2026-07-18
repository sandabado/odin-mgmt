import { redirect } from "next/navigation";
export default async function GearRedirect({ searchParams }: { searchParams: Promise<{ artist?: string }> }) { const { artist } = await searchParams; redirect(artist ? `/artist/tools?tab=gear&artist=${encodeURIComponent(artist)}` : "/artist/tools?tab=gear"); }
