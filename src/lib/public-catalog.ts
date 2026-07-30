export interface PublicTrack {
  number: number;
  title: string;
  duration: string;
  spotifyUri?: string;
}

export interface PublicReleaseCredit {
  name: string;
  role: string;
}

export interface PublicRelease {
  slug?: string;
  artistSlug: string;
  artistName: string;
  title: string;
  year: number;
  format: string;
  tracks: PublicTrack[];
  listenUrl: string;
  spotifyUri?: string;
  embedUrl?: string;
  coverImage?: string;
  coverImageAlt?: string;
  credits?: PublicReleaseCredit[];
  displayDate?: string;
  description?: string;
  releaseType?: string;
  status?: "released" | "forthcoming";
  videoUrl?: string;
}

export interface PlayablePublicTrack extends PublicTrack {
  spotifyUri: string;
}

export interface PlayablePublicRelease extends PublicRelease {
  coverImage: string;
  embedUrl: string;
  spotifyUri: string;
  tracks: PlayablePublicTrack[];
}

export interface PublicArtist {
  slug: string;
  name: string;
  location?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  catalogStatus: "published" | "held";
  featureImages?: Partial<
    Record<"atmosphere" | "live" | "story", { alt: string; src: string }>
  >;
  links: Array<{ label: string; href: string }>;
}

export interface PublicShow {
  slug: string;
  artistSlug: string;
  artistName: string;
  date: string;
  venueName: string;
  cityState: string;
  doorsTime?: string;
  showTime?: string;
  ticketUrl?: string;
  ticketPriceCents?: number;
  note?: string;
}

export const sandabado: PublicArtist = {
  slug: "sandabado",
  name: "Sandābādo",
  location: "Joshua Tree, California",
  description: "Soulful blues rock from Joshua Tree.",
  image: "/images/artists/sandabado/sandabado-joshua-tree-portrait.jpg",
  imageAlt: "Sandābādo in the Joshua Tree desert",
  featureImages: {
    atmosphere: {
      alt: "Sandābādo performing solo at night at Giant Rock",
      src: "https://umoapqrkcabmdvkmdnqv.supabase.co/storage/v1/object/public/records-public/artists/sandabado/giant-rock/sandabado-giant-rock-solo-night.jpg",
    },
    live: {
      alt: "Sandābādo performing as a duo at Giant Rock",
      src: "https://umoapqrkcabmdvkmdnqv.supabase.co/storage/v1/object/public/records-public/artists/sandabado/giant-rock/sandabado-giant-rock-duo-performance.jpg",
    },
    story: {
      alt: "Sandābādo performing beneath the Giant Rock monolith",
      src: "https://umoapqrkcabmdvkmdnqv.supabase.co/storage/v1/object/public/records-public/artists/sandabado/giant-rock/sandabado-giant-rock-monolith-performance.jpg",
    },
  },
  catalogStatus: "published",
  links: [
    {
      label: "Full artist experience",
      href: "https://sandabado-music.vercel.app",
    },
    {
      label: "Spotify",
      href: "https://open.spotify.com/artist/5vX6WxSBdsYrzXCM3hSJ81",
    },
    { label: "Instagram", href: "https://instagram.com/sandabadomusic" },
  ],
};

export const paloXanto: PublicArtist = {
  slug: "palo-xanto",
  name: "Palo Xanto",
  description: "An artist in the Whole Body Records field.",
  image:
    "/images/artists/palo-xanto/palo-xanto-live-portrait-mandy-sanchez.jpg",
  imageAlt:
    "Palo Xanto performing live on guitar, photographed by Mandy Sanchez",
  catalogStatus: "held",
  links: [],
};

// Public release facts are curated because ØDIN currently stores the four track
// titles but does not yet model the released 333 EP, track order, or durations.
export const release333: PlayablePublicRelease = {
  slug: "333",
  artistSlug: sandabado.slug,
  artistName: sandabado.name,
  title: "333",
  year: 2023,
  format: "Four-song EP",
  listenUrl: "https://open.spotify.com/album/7KA075A6TZZRx8Gog6yanH",
  spotifyUri: "spotify:album:7KA075A6TZZRx8Gog6yanH",
  embedUrl: "https://open.spotify.com/embed/album/7KA075A6TZZRx8Gog6yanH",
  coverImage: "/images/artists/sandabado/sandabado-333-album-art.jpg",
  coverImageAlt: "333 album artwork by Sandābādo",
  tracks: [
    {
      number: 1,
      title: "Jesus Says To Groove",
      duration: "3:40",
      spotifyUri: "spotify:track:4f6C4ezpkM9hzITPsgfijd",
    },
    {
      number: 2,
      title: "Great Mystery (333)",
      duration: "3:49",
      spotifyUri: "spotify:track:3n7YJI2kJZqZGskA6LnAK2",
    },
    {
      number: 3,
      title: "Think Say Do",
      duration: "3:37",
      spotifyUri: "spotify:track:2CRz0cdAvJGvGAczGSaTjV",
    },
    {
      number: 4,
      title: "Soul Of Gold",
      duration: "4:17",
      spotifyUri: "spotify:track:5RhbndjN0Uq31ZyEz4tmq0",
    },
  ],
  status: "released",
};

export const infinityLove: PublicRelease = {
  slug: "infinity-love",
  artistSlug: sandabado.slug,
  artistName: sandabado.name,
  title: "∞ LOVE",
  year: 2026,
  format: "Debut full album",
  displayDate: "September 26, 2026",
  description:
    "Thirteen songs of soul blues and desert rock, made in the high desert.",
  coverImage:
    "https://sandabado-music.vercel.app/images/releases/sandabado-infinity-love.png",
  coverImageAlt: "∞ LOVE album artwork by Sandābādo",
  listenUrl: "https://sandabado-music.vercel.app/music",
  tracks: [
    { number: 1, title: "ROLLIN' STONE", duration: "4:12" },
    { number: 2, title: "LOV3R", duration: "3:45" },
    { number: 3, title: "M∆GIC M∆N", duration: "4:33" },
    { number: 4, title: "SOUL OF GØLD", duration: "5:01" },
    { number: 5, title: "PL3NTY OF TIⅯE", duration: "3:58" },
    { number: 6, title: "BE∆ST", duration: "3:29" },
    { number: 7, title: "JESUS S∆YS", duration: "4:15" },
    { number: 8, title: "∞ LOVE", duration: "6:12" },
    { number: 9, title: "LIONS D3N", duration: "4:44" },
    { number: 10, title: "EVERGOLD", duration: "3:55" },
    { number: 11, title: "THINK SAY DO", duration: "3:33" },
    { number: 12, title: "GREAT MYSTERY", duration: "5:44" },
    { number: 13, title: "PARADISE", duration: "4:03" },
  ],
  status: "forthcoming",
};

export const publicArtists = [sandabado, paloXanto] as const;
export const publicReleases = [infinityLove, release333] as const;
export const playablePublicReleases = publicReleases.filter(
  (release): release is PlayablePublicRelease =>
    Boolean(
      release.coverImage &&
      release.embedUrl &&
      release.spotifyUri &&
      release.tracks.length &&
      release.tracks.every((track) => track.spotifyUri),
    ),
);
export const publicTourDates: PublicShow[] = [];
export const publicStudioNotes = [] as const;
