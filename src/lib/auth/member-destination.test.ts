import { describe, expect, it } from "vitest";
import {
  memberDestinationForRole,
  memberHomeForRole,
} from "./member-destination";

describe("member destinations", () => {
  it("routes each ØDIN role to its own operating surface", () => {
    expect(memberHomeForRole("super_admin")).toBe("/admin/dashboard");
    expect(memberHomeForRole("booking_director")).toBe("/admin/dashboard");
    expect(memberHomeForRole("artist")).toBe("/artist/dashboard");
    expect(memberHomeForRole("foundation_partner")).toBe("/foundation");
  });

  it("never treats a missing or unknown profile as an administrator", () => {
    expect(memberHomeForRole(null)).toBeNull();
    expect(memberHomeForRole(undefined)).toBeNull();
    expect(memberHomeForRole("customer" as never)).toBeNull();
  });

  it("keeps requested paths inside the member's authorized route family", () => {
    expect(
      memberDestinationForRole("artist", "/artist/revenue"),
    ).toBe("/artist/revenue");
    expect(
      memberDestinationForRole("artist", "/admin/treasury"),
    ).toBe("/artist/dashboard");
    expect(
      memberDestinationForRole("foundation_partner", "/foundation/resources"),
    ).toBe("/foundation/resources");
    expect(
      memberDestinationForRole("foundation_partner", "/admin/foundation"),
    ).toBe("/foundation");
    expect(
      memberDestinationForRole("super_admin", "/admin/treasury"),
    ).toBe("/admin/treasury");
    expect(
      memberDestinationForRole("super_admin", "/foundation"),
    ).toBe("/foundation");
    expect(
      memberDestinationForRole("booking_director", "https://example.com"),
    ).toBe("/admin/dashboard");
  });
});
