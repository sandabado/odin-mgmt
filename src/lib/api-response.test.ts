import { describe, expect, it } from "vitest";
import { fail, ok } from "./api-response";

describe("API response envelope", () => {
  it("wraps successful data consistently", async () => {
    const response = ok({ id: "venue-1" }, { page: 1, pageSize: 25, total: 1 });

    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { id: "venue-1" },
      meta: { page: 1, pageSize: 25, total: 1 },
    });
  });

  it("maps validation failures to a safe 400 response", async () => {
    const response = fail("VALIDATION_ERROR", "Email is required", "email");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: { code: "VALIDATION_ERROR", message: "Email is required", field: "email" },
    });
  });
});
