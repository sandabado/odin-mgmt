import { feedFirstRatios } from "../../lib/treasury/feed-first";

export const recordsRevenueCurrents = [
  {
    index: "01",
    label: "PR",
    description: "Campaign strategy, story development, and earned attention.",
  },
  {
    index: "02",
    label: "Records · licensing · distribution",
    description:
      "Recorded work moving through releases, rights, and listening channels.",
  },
  {
    index: "03",
    label: "Management",
    description:
      "Long-range decisions, relationships, and the shape of an artist’s world.",
  },
  {
    index: "04",
    label: "Booking",
    description:
      "Shows, rooms, and audiences connected through a deliberate touring current.",
  },
] as const;

export const recordsFeedFirstDestinations = [
  {
    label: "Artist",
    percentage: feedFirstRatios.artist * 100,
  },
  {
    label: "Guild",
    percentage: feedFirstRatios.guild * 100,
  },
  {
    label: "Infrastructure",
    percentage: feedFirstRatios.infrastructure * 100,
  },
  {
    label: "Founder reserve",
    percentage: feedFirstRatios.founder * 100,
  },
] as const;
