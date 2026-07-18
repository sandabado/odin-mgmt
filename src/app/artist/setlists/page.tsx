import { redirect } from "next/navigation";
export default async function SetlistsRedirect({ searchParams }: { searchParams: Promise<{ artist?: string }> }) { const { artist } = await searchParams; redirect(artist ? `/artist/music?artist=${encodeURIComponent(artist)}` : "/artist/music"); }
