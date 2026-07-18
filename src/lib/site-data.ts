export const artists = [
  { name: "Sandābādo", discipline: "Music · Live · Film", mark: "∞", summary: "Warm-blooded electronic music for the long road home.", color: "#a995ff", image: "/images/artists/sandabado/sandabado-joshua-tree-portrait.jpg", imageAlt: "Sandābādo in the Joshua Tree desert", imagePosition: "50% 50%" },
  { name: "Father Atlas", discipline: "Songwriter · Producer", mark: "A", summary: "Songs made at the edge of the map, with a compass still inside them.", color: "#d9b977" },
  { name: "Palo Xanto", discipline: "Artist · Fieldwork", mark: "P", summary: "Ritual sound, living archives, and culture built in public.", color: "#91cdbf" },
  { name: "Future signal", discipline: "Open roster", mark: "+", summary: "We work with artists building a body of work worth protecting.", color: "#e8e4ee" },
] as const;

export const services = [
  ["01", "Booking", "Routing, venue relationships, show offers, advancing, and settlement—handled with context."],
  ["02", "Management", "A steady operating layer for artists making releases, rooms, and durable careers."],
  ["03", "Release strategy", "Campaign systems that connect the record, the live room, and the audience without flattening the artist."],
] as const;

export const promotions = [
  { artist: "Sandābādo", format: "Show poster", title: "∞ LOVE", detail: "Red Dog Saloon · 26 Sep", note: "Tour announcement system", tone: "violet" },
  { artist: "Father Atlas", format: "Release world", title: "NORTHBOUND", detail: "A record in motion", note: "Release campaign kit", tone: "amber" },
  { artist: "Palo Xanto", format: "Press dispatch", title: "FIELD / NOTE 04", detail: "Sound, place, memory", note: "Editorial & social sequence", tone: "jade" },
] as const;
