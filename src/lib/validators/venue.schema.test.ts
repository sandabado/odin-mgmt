import { describe, expect, it } from "vitest";
import { createVenueSchema } from "./venue.schema";

describe("createVenueSchema", () => {
  const validVenue = {
    name: "Red Dog Saloon",
    city: "Morongo Valley",
    state: "CA",
    capacity: 150,
    region: "desert" as const,
  };

  it("accepts a valid venue and applies the network default", () => {
    expect(createVenueSchema.parse(validVenue).networkRole).toBe("target");
  });

  it("rejects a malformed state and impossible capacity", () => {
    const result = createVenueSchema.safeParse({ ...validVenue, state: "California", capacity: -1 });

    expect(result.success).toBe(false);
  });
});
