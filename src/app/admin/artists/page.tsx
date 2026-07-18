import Link from "next/link";
import { redirect } from "next/navigation";
import { FieldFilters } from "@/components/admin/FieldFilters";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Artist = {
  id: string;
  profile_id: string | null;
  artist_name: string;
  genres: string[];
  draw_size: number;
  home_market: string;
  status: string;
};

const markets = [
  { label: "Desert", value: "desert" },
  { label: "Los Angeles", value: "los_angeles" },
  { label: "San Diego", value: "san_diego" },
] as const;

export default async function ArtistsPage({ searchParams }: { searchParams: Promise<{ market?: string }> }) {
  const { market } = await searchParams;
  const activeMarket = markets.some((item) => item.value === market) ? market : undefined;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/artists");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const query = supabase.from("artists").select("id, profile_id, artist_name, genres, draw_size, home_market, status").order("artist_name");
  const { data } = profile?.role === "artist"
    ? await query.eq("profile_id", user.id).returns<Artist[]>()
    : activeMarket ? await query.eq("home_market", activeMarket).returns<Artist[]>() : await query.returns<Artist[]>();
  const artists = data ?? [];

  return <main className="min-h-screen bg-void px-5 py-8 text-bone sm:px-8"><div className="mx-auto max-w-7xl"><header className="flex flex-wrap items-end justify-between gap-5 border-b border-mercury pb-6"><div><Link className="font-mono text-[10px] uppercase tracking-[.16em] text-ghost transition hover:text-flux" href="/admin">← Command hub</Link><p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-plasma">Whole Body Studios / artist directory</p><h1 className="mt-3 font-display text-5xl leading-none">Every artist, one living room.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-ghost">Open an Artist Studio to see the entire release, campaign, show, and revenue story in one scroll.</p></div><p className="border border-flux px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] text-flux">{artists.length} in field</p></header><div className="mt-5"><FieldFilters active={activeMarket} label="Market" options={[...markets]} param="market" /></div>{artists.length ? <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{artists.map((artist) => <Link className="group relative overflow-hidden border border-mercury bg-carbon p-6 transition hover:border-plasma hover:bg-steel" href={`/admin/studios/${artist.id}`} key={artist.id}><span className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-plasma/30 transition duration-500 group-hover:scale-150" /><p className="font-mono text-[9px] uppercase tracking-[.15em] text-flux">Artist Studio / {artist.home_market.replaceAll("_", " ")}</p><h2 className="mt-7 font-display text-4xl leading-none">{artist.artist_name}</h2><div className="mt-4 flex flex-wrap gap-2">{artist.genres.map((genre) => <span className="border border-steel px-2 py-1 font-mono text-[8px] uppercase tracking-[.1em] text-ghost" key={genre}>{genre}</span>)}</div><div className="mt-8 flex items-center justify-between border-t border-mercury pt-4 font-mono text-[9px] uppercase tracking-[.12em] text-ghost"><span>Draw {artist.draw_size.toLocaleString()}</span><span className="text-flux">Open field →</span></div></Link>)}</section> : <section className="mt-7 border border-dashed border-steel bg-carbon p-10"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-plasma">Artist field waiting</p><h2 className="mt-4 font-display text-4xl leading-none">No artists in this market.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-ghost">Clear the market filter to see the entire active roster.</p></section>}</div></main>;
}
