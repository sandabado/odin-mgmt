import { redirect } from "next/navigation";
export default async function PromoRedirect({ searchParams }: { searchParams: Promise<{ artist?: string }> }) { const { artist } = await searchParams; redirect(artist ? `/artist/tools?tab=promo&artist=${encodeURIComponent(artist)}` : "/artist/tools?tab=promo"); }
