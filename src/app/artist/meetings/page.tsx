import { redirect } from "next/navigation";
export default async function MeetingsRedirect({ searchParams }: { searchParams: Promise<{ artist?: string }> }) { const { artist } = await searchParams; redirect(artist ? `/artist/tools?tab=meetings&artist=${encodeURIComponent(artist)}` : "/artist/tools?tab=meetings"); }
