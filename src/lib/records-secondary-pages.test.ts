import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { recordsIntakeHref } from "./records-intake";

const read = (path: string) => readFileSync(path, "utf8");

describe("Whole Body Records secondary public rooms", () => {
  it("builds submission doorways from the typed intent union", () => {
    expect(recordsIntakeHref("artist")).toBe("/submit?intent=artist");
    expect(recordsIntakeHref("partner")).toBe("/submit?intent=partner");
    expect(recordsIntakeHref("sync")).toBe("/submit?intent=sync");
    expect(recordsIntakeHref("art-of-the-song")).toBe(
      "/submit?intent=art-of-the-song",
    );
  });

  it("presents ØDIN as the protected engine rather than a public database", () => {
    const page = read("src/app/management/page.tsx");

    expect(page).toContain("protected operating engine");
    expect(page).toContain(
      "Private working records remain behind authenticated access",
    );
    expect(page).toContain('recordsIntakeHref("artist")');
    expect(page).toContain('route="management"');
  });

  it("keeps partner language grounded and non-transactional", () => {
    const page = read("src/app/partners/page.tsx");

    expect(page).toContain("does not create a partnership");
    expect(page).toContain("conversations we are prepared to review");
    expect(page).toContain('recordsIntakeHref("partner")');
    expect(page).toContain('route="partners"');
  });

  it("requires real sync context without promising placement or clearance", () => {
    const page = read("src/app/sync/page.tsx");

    expect(page).toContain("No placement is promised");
    expect(page).toContain("No use is cleared");
    expect(page).toContain('recordsIntakeHref("sync")');
    expect(page).toContain('route="sync"');
  });

  it("defines Art of the Song as a named human-review pitch path", () => {
    const page = read("src/app/art-of-the-song/page.tsx");

    expect(page).toContain("named human-review pitch path");
    expect(page).toContain("not a contest");
    expect(page).toContain('recordsIntakeHref("art-of-the-song")');
    expect(page).toContain('route="art-of-the-song"');
  });

  it("keeps every secondary page inside the shared Records brand shell", () => {
    const room = read(
      "src/components/whole-body-records/RecordsPracticePage.tsx",
    );
    const sitemap = read("src/app/sitemap.ts");

    expect(room).toContain("RecordsCurrentDivider");
    expect(room).toContain("records-button--solid");
    for (const route of [
      "/management",
      "/partners",
      "/sync",
      "/art-of-the-song",
    ]) {
      expect(sitemap).toContain(route);
    }
  });

  it("keeps the archived atmosphere out of production layouts", () => {
    const layout = read("src/app/layout.tsx");
    const museum = read("src/app/museum/page.tsx");
    const archive =
      "src/components/whole-body-records/PersistentRecordsAtmosphere.tsx";

    expect(existsSync(archive)).toBe(true);
    expect(read(archive)).toContain(
      "export function PersistentRecordsAtmosphere",
    );
    for (const productionSurface of [layout, museum]) {
      expect(productionSurface).not.toContain("PersistentRecordsAtmosphere");
      expect(productionSurface).not.toContain("WholeBodyRecordsAtmosphere");
      expect(productionSurface).not.toContain("<canvas");
    }
  });

  it("keeps listening state alive across every public Records room", () => {
    const provider = read(
      "src/components/whole-body-records/turntable/TurntableProvider.tsx",
    );

    for (const route of [
      "/management",
      "/partners",
      "/sync",
      "/art-of-the-song",
      "/museum",
    ]) {
      expect(provider).toContain(`"${route}"`);
    }

    expect(provider).toContain('pathname.startsWith("/artists/")');
    expect(provider).toContain("isTurntablePublicPath(pathname)");
    expect(provider).not.toContain('"/admin/dashboard"');
    expect(provider).not.toContain('"/foundation"');
  });

  it("routes the active-label carousel through the explanatory rooms", () => {
    const current = read("src/lib/records-label-current.ts");

    expect(current).toContain('href: "/management"');
    expect(current).toContain('href: "/partners"');
    expect(current).toContain('href: "/sync"');
    expect(current).toContain('href: "/art-of-the-song"');
  });
});
