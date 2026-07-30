import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Whole Body Records booking corridor", () => {
  it("places the regional operating loop after all artists and before the ØDIN value current", () => {
    const home = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const allArtists = home.indexOf("styles.allArtistsRoom");
    const corridor = home.indexOf("<RecordsBookingCorridor />");
    const revenueCurrent = home.indexOf("<RecordsRevenueCurrent />");

    expect(home).toContain("import { RecordsBookingCorridor }");
    expect(allArtists).toBeGreaterThan(-1);
    expect(corridor).toBeGreaterThan(allArtists);
    expect(revenueCurrent).toBeGreaterThan(corridor);
  });

  it("names the three-city corridor without fabricating venue relationships", () => {
    const component = read(
      "src/components/whole-body-records/RecordsBookingCorridor.tsx",
    );

    for (const city of ["Joshua Tree", "Los Angeles", "San Diego"]) {
      expect(component).toContain(city);
    }
    for (const service of [
      "Listen & align",
      "Shape the signal",
      "Book with intent",
      "Prepare & return",
    ]) {
      expect(component).toContain(service);
    }
    expect(component).not.toMatch(/guaranteed|exclusive venue|venue partner/i);
  });

  it("keeps management primary, uses existing public routes, and stays lightweight", () => {
    const component = read(
      "src/components/whole-body-records/RecordsBookingCorridor.tsx",
    );
    const css = read(
      "src/components/whole-body-records/RecordsBookingCorridor.module.css",
    );

    expect(component.indexOf('href="/management"')).toBeLessThan(
      component.indexOf('href="/tour"'),
    );
    expect(component.indexOf('href="/tour"')).toBeLessThan(
      component.indexOf('href="/submit#submission-form"'),
    );
    expect(component).not.toContain("<canvas");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("--corridor-water: #2d9cdb");
    expect(css).not.toContain("backdrop-filter");
  });
});
