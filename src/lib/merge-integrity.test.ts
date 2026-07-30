import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Whole Body Records merge integrity", () => {
  it("keeps one canonical notification table definition", () => {
    const engineering = read(
      "supabase/migrations/20260717220000_engineering_collaboration.sql",
    );
    const bandOperations = read(
      "supabase/migrations/20260717280000_band_member_rsvp_and_communication.sql",
    );
    expect(
      engineering.match(/create table public\.notifications/g),
    ).toHaveLength(1);
    expect(bandOperations).not.toMatch(
      /create table(?: if not exists)? public\.notifications/,
    );
    expect(bandOperations).toContain("alter table public.notifications");
    expect(bandOperations).toContain("notifications_recipient_check");
  });

  it("provides additive notification reconciliation and non-destructive rollback", () => {
    const forward = read(
      "supabase/migrations/20260729100000_reconcile_notifications_schema.sql",
    );
    const rollback = read(
      "scripts/migrations/rollback_20260729100000_reconcile_notifications_schema.sql",
    );
    expect(forward).toContain(
      "add column if not exists recipient_band_member_id",
    );
    expect(forward).toContain(
      "recipient_profile_id = coalesce(recipient_profile_id, recipient_id)",
    );
    expect(rollback).not.toMatch(
      /\bdrop table\b|\bdrop column\b|\bdelete from\b/i,
    );
  });

  it("uses the approved Ink on Water homepage and keeps ØDIN private", () => {
    const home = read("src/app/page.tsx");
    const experience = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const header = read("src/components/whole-body-records/RecordsHeader.tsx");
    const sessionControl = read(
      "src/components/whole-body-records/RecordsSessionControl.tsx",
    );
    const footer = read("src/components/whole-body-records/RecordsFooter.tsx");
    const publicRoutes = read("src/lib/records-public-routes.ts");
    const requiredCopy = [
      "Many voices.",
      "One whole body.",
      "A self-sustaining creative economy for artists who own their work",
      "Join the roster →",
      "Explore catalog",
      "Submit your work",
    ];
    for (const copy of requiredCopy) expect(experience).toContain(copy);
    expect(home).toContain("InkOnWaterPreview");
    expect(home).toContain("RecordsFooter");
    expect(experience).not.toContain("We serve the field.");
    expect(home).not.toContain("ØDIN member access");
    expect(header).not.toContain("Member access");
    expect(sessionControl).toContain("<span>Log in</span>");
    expect(experience).toContain("styles.artistRoom");
    expect(experience).toContain("WatercolorRecordPlayer");
    expect(experience).toContain("<RecordsRevenueCurrent />");
    expect(publicRoutes).toContain('href: "/login"');
    expect(footer).toContain("RECORDS_FOOTER_UTILITY_NAV_ITEMS");
    expect(footer).toContain("Water flows for all.");
  });

  it("keeps music inside WBR wherever a verified player exists", () => {
    const home = read("src/app/page.tsx");
    const experience = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const releases = read("src/app/catalog/page.tsx");
    const catalog = read("src/lib/public-catalog.ts");
    const layout = read("src/app/layout.tsx");
    const player = read(
      "src/components/whole-body-records/MuseumReleasePlayer.tsx",
    );
    const turntable = read(
      "src/components/whole-body-records/turntable/TurntableProvider.tsx",
    );
    expect(catalog).toContain(
      "https://open.spotify.com/embed/album/7KA075A6TZZRx8Gog6yanH",
    );
    expect(catalog).toContain("spotify:track:4f6C4ezpkM9hzITPsgfijd");
    expect(home).toContain("InkOnWaterPreview");
    expect(experience).toContain("WatercolorRecordPlayer");
    expect(experience).toContain("useTurntable");
    expect(experience).toContain("registerSpotifyHost");
    expect(releases).toContain("MuseumReleasePlayer");
    expect(home).not.toContain("href={infinityLove.listenUrl}");
    expect(releases).not.toContain("href={infinityLove.listenUrl}");
    expect(layout).toContain("<TurntableProvider");
    expect(player).toContain("selectRelease(release)");
    expect(turntable).toContain("https://open.spotify.com/embed/iframe-api/v1");
    expect(turntable).toContain("window.sessionStorage");
    expect(player).toContain("InlineTurntablePlayer");
  });

  it("retains the legacy water atmosphere as an unmounted archive", () => {
    const layout = read("src/app/layout.tsx");
    const museum = read("src/app/museum/page.tsx");
    const archivedAtmosphere =
      "src/components/whole-body-records/PersistentRecordsAtmosphere.tsx";

    for (const archivePath of [
      archivedAtmosphere,
      "src/components/whole-body-records/WholeBodyRecordsAtmosphere.tsx",
      "src/components/whole-body-records/WaterCanvas.tsx",
      "src/components/whole-body-records/DeepSeaFallback.tsx",
      "src/components/whole-body-records/water-shaders.ts",
      "public/images/backgrounds/wbr-iridescent-water-painting.jpg",
      "public/images/backgrounds/wbr-enter-the-river-v1.jpg",
    ]) {
      expect(existsSync(archivePath)).toBe(true);
    }
    expect(read(archivedAtmosphere)).toContain(
      "export function PersistentRecordsAtmosphere",
    );
    for (const productionSurface of [layout, museum]) {
      expect(productionSurface).not.toContain("PersistentRecordsAtmosphere");
      expect(productionSurface).not.toContain("WholeBodyRecordsAtmosphere");
      expect(productionSurface).not.toContain("<canvas");
    }
  });

  it("connects the museum and private operations in both directions", () => {
    const login = read("src/app/login/page.tsx");
    const loginForm = read(
      "src/components/whole-body-records/RecordsLoginForm.tsx",
    );
    const css = read("src/app/globals.css");
    const adminShell = read("src/components/admin/AdminShell.tsx");
    const artistNavigation = read(
      "src/components/artist/ArtistPortalNavigation.tsx",
    );
    expect(login).toContain('variant="auth"');
    expect(loginForm).toContain('data-login-form-viewport=""');
    expect(css).toContain("ØDIN access viewport");
    expect(css).toMatch(
      /@media \(max-width: 820px\)[\s\S]*\.records-auth__access\[data-login-form-viewport\][\s\S]*order: -1;/,
    );
    expect(loginForm).toContain("Return to Whole Body Records");
    expect(loginForm).toContain("memberDestinationForRole");
    expect(loginForm).not.toContain("signUp(");
    expect(loginForm).not.toContain("Request access");
    expect(adminShell).toContain('aria-label="Return to Whole Body Records"');
    expect(artistNavigation).toContain(
      'aria-label="Return to Whole Body Records"',
    );
  });

  it("grounds the public collection in approved work and excludes demo operations data", () => {
    const catalog = read("src/lib/public-catalog.ts");
    const publicSurface = [
      catalog,
      read("src/app/page.tsx"),
      read("src/app/artists/page.tsx"),
      read("src/app/catalog/page.tsx"),
      read("src/app/tour/page.tsx"),
    ].join("\n");
    expect(catalog).toContain('title: "∞ LOVE"');
    expect(catalog).toContain('displayDate: "September 26, 2026"');
    expect(catalog).toContain('title: "Jesus Says To Groove"');
    expect(catalog).toContain('title: "Great Mystery (333)"');
    expect(catalog).toContain('title: "Think Say Do"');
    expect(catalog).toContain('title: "Soul Of Gold"');
    for (const demoClaim of [
      "Palo Xanto — Field Signal EP",
      "Desert Current",
      "Night Bloom",
      "Signal Fire",
      "Demo Engineer",
      "Red Dog Saloon",
    ]) {
      expect(publicSurface).not.toContain(demoClaim);
    }
  });

  it("uses the approved Mandy Sanchez portrait as Palo Xanto's canonical image", () => {
    const catalog = read("src/lib/public-catalog.ts");
    const mirror = read("src/lib/public-mirror.ts");
    const experience = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const experienceCss = read(
      "src/components/whole-body-records/InkOnWaterPreview.module.css",
    );
    const imagePath =
      "/images/artists/palo-xanto/palo-xanto-live-portrait-mandy-sanchez.jpg";
    const imageAlt =
      "Palo Xanto performing live on guitar, photographed by Mandy Sanchez";

    expect(
      existsSync(`public${imagePath}`),
    ).toBe(true);
    for (const source of [catalog, mirror]) {
      expect(source).toContain(imagePath);
      expect(source).toContain(imageAlt);
    }
    expect(experience).toContain("secondaryArtist.imageAlt");
    expect(experience).toContain("secondaryArtist.image");
    expect(experienceCss).toMatch(
      /\.secondArtistMedia\s*\{[^}]*aspect-ratio:\s*699\s*\/\s*800;/,
    );
    expect(experienceCss).toMatch(
      /\.secondArtistMedia img\s*\{[^}]*object-fit:\s*cover;/,
    );
  });

  it("provides five content destinations plus quiet commerce utilities", () => {
    const header = read("src/components/whole-body-records/RecordsHeader.tsx");
    const footer = read("src/components/whole-body-records/RecordsFooter.tsx");
    const publicRoutes = read("src/lib/records-public-routes.ts");
    const expectedLinks = [
      ["Artists", "/artists"],
      ["Catalog", "/catalog"],
      ["Services", "/services"],
      ["Tour", "/tour"],
      ["Submit", "/submit"],
    ];
    for (const [label, href] of expectedLinks) {
      expect(publicRoutes).toContain(`label: "${label}"`);
      expect(publicRoutes).toContain(`href: "${href}"`);
    }
    expect(header).toContain("RECORDS_PRIMARY_NAV_ITEMS");
    expect(header).toContain('className="records-store-link"');
    expect(header).toContain("<RecordsCartLink");
    expect(header).toContain("<RecordsSessionControl");
    for (const label of [
      "Home",
      "Artists",
      "Catalog",
      "Services",
      "Tour",
      "Submit",
      "Store",
    ]) {
      expect(publicRoutes).toContain(`label: "${label}"`);
    }
    expect(footer).toContain("RECORDS_FOOTER_NAV_ITEMS");
    for (const route of [
      "account",
      "artists",
      "cart",
      "catalog",
      "releases",
      "services",
      "store",
      "tour",
      "submit",
    ]) {
      expect(existsSync(`src/app/${route}/page.tsx`)).toBe(true);
    }
    expect(read("src/app/releases/page.tsx")).toContain(
      'permanentRedirect("/catalog")',
    );
  });

  it("writes Records submissions through the deployed intake schema", () => {
    const route = read("src/app/api/intake/booking/route.ts");
    expect(route).toContain('source: "odin_homepage"');
    expect(route).toContain("[Whole Body Records submission ·");
    expect(route).toContain("artist_interest: parsed.data.intent");
    expect(route).toContain("Best work:");
    expect(route).toContain("submissionMessage");
    expect(route).not.toContain("work_url:");
    expect(route).not.toContain("additional_links:");
  });

  it("keeps all five navigation links available on mobile", () => {
    const css = read("src/app/globals.css");
    expect(css).toMatch(
      /@media \(max-width:\s*820px\)[\s\S]*\.records-museum \.records-header nav\s*\{[\s\S]*display:\s*flex;/,
    );
    expect(css).toMatch(
      /\.records-museum \.records-header nav a\s*\{[\s\S]*min-height:\s*44px;/,
    );
  });

  it("keeps the archived WebGL implementation dependency-light", () => {
    const atmosphere = read(
      "src/components/whole-body-records/WholeBodyRecordsAtmosphere.tsx",
    );
    const water = read("src/components/whole-body-records/WaterCanvas.tsx");
    expect(atmosphere).toContain("afterPaint");
    expect(atmosphere).toContain('import("./WaterCanvas")');
    expect(water).toContain('canvas.getContext("webgl"');
    expect(water).not.toMatch(/@react-three\/fiber|from "three"/);
  });

  it("keeps production flow CSS while leaving the heavy atmosphere unmounted", () => {
    const layout = read("src/app/layout.tsx");
    const museum = read("src/app/museum/page.tsx");
    const shell = read(
      "src/components/whole-body-records/RecordsPageShell.tsx",
    );
    const css = read("src/app/globals.css");

    expect(layout).not.toContain("PersistentRecordsAtmosphere");
    expect(museum).not.toContain("PersistentRecordsAtmosphere");
    for (const route of [
      "artists",
      "catalog",
      "services",
      "tour",
      "submit",
      "store",
      "cart",
      "account",
      "login",
    ]) {
      expect(css).toContain(`data-records-route="${route}"`);
    }
    expect(shell).toContain("records-continuous-flow");
    expect(shell).toContain("data-records-route={route}");
    expect(css).toMatch(
      /\.records-continuous-flow:not\(\.records-home-flow\)\s*>\s*main\s*:is\(/,
    );
    expect(css).toContain("Final continuity pass.");
    expect(css).toContain(".records-continuous-flow::after");
    expect(css).toMatch(/background:\s*transparent\s*!important/);
  });

  it("ships a branded social preview from the same water system", () => {
    const layout = read("src/app/layout.tsx");
    expect(
      existsSync("public/whole-body-records-social-record-watershed.png"),
    ).toBe(true);
    expect(existsSync("public/whole-body-records-social-ink-water.png")).toBe(
      true,
    );
    expect(layout).toContain(
      "Whole Body Records — Many voices. One whole body.",
    );
    expect(layout).toContain(
      'url: "/whole-body-records-social-record-watershed.png"',
    );
    expect(layout).toContain("height: 630");
    expect(layout).toContain('card: "summary_large_image"');
  });

  it("keeps production Records, featured-artist, and footer surfaces canvas-free", () => {
    const productionSurfaces = [
      read("src/app/layout.tsx"),
      read("src/app/museum/page.tsx"),
      read("src/components/whole-body-records/FeaturedArtistPortal.tsx"),
      read("src/components/whole-body-records/RecordsFooter.tsx"),
      read("src/components/whole-body-records/PoolingWaterClosing.tsx"),
    ];

    for (const surface of productionSurfaces) {
      expect(surface).not.toMatch(
        /<canvas\b|WaterCanvas|PersistentRecordsAtmosphere|WholeBodyRecordsAtmosphere/,
      );
    }
  });

  it("keeps archived ambient audio guarded by readiness and a fade envelope", () => {
    const atmosphere = read(
      "src/components/whole-body-records/WholeBodyRecordsAtmosphere.tsx",
    );
    expect(atmosphere).toContain("!soundOn || !waterReady");
    expect(atmosphere).toContain("linearRampToValueAtTime(0.035");
    expect(atmosphere).toContain(
      'window.localStorage.setItem("wbr-ambient-sound"',
    );
    expect(atmosphere).toContain("MutationObserver");
    expect(atmosphere).toContain('root.dataset.wbrPlayback === "playing"');
  });

  it("keeps the museum layer decorative, restrained, and motion-safe", () => {
    const experience = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const footer = read("src/components/whole-body-records/RecordsFooter.tsx");
    const spatial = read(
      "src/components/whole-body-records/RecordsSpatialExperience.tsx",
    );
    const geometry = read(
      "src/components/whole-body-records/RecordsGeometryDivider.tsx",
    );
    const current = read(
      "src/components/whole-body-records/brand/RecordsCurrentDivider.tsx",
    );
    const experienceCss = read(
      "src/components/whole-body-records/InkOnWaterPreview.module.css",
    );
    const footerCss = read(
      "src/components/whole-body-records/RecordsFooter.module.css",
    );
    const closingCss = read(
      "src/components/whole-body-records/PoolingWaterClosing.module.css",
    );

    expect(footer).toContain("Water flows for all.");
    expect(experience).toContain("AnimatePresence");
    expect(experience).not.toContain("whileInView");
    expect(experience).toContain("useReducedMotion");
    expect(spatial).toContain("IntersectionObserver");
    expect(spatial).toContain("return null");
    expect(spatial).not.toContain("records-ambient-light");
    expect(geometry).toContain("RecordsCurrentDivider");
    expect(current).toContain("aria-hidden={decorative || undefined}");
    for (const stylesheet of [experienceCss, footerCss, closingCss]) {
      expect(stylesheet).toContain("@media (prefers-reduced-motion: reduce)");
    }
  });

  it("powers the inline listening rooms while keeping the floating player off", () => {
    const environment = read(".env.example");
    const home = read("src/app/page.tsx");
    const experience = read(
      "src/components/whole-body-records/InkOnWaterPreview.tsx",
    );
    const layout = read("src/app/layout.tsx");
    const provider = read(
      "src/components/whole-body-records/turntable/TurntableProvider.tsx",
    );
    const listeningShelf = read(
      "src/components/whole-body-records/MuseumReleasePlayer.tsx",
    );
    const inlinePlayer = read(
      "src/components/whole-body-records/turntable/InlineTurntablePlayer.tsx",
    );

    expect(environment).toContain("NEXT_PUBLIC_INLINE_TURNTABLE_ENABLED=true");
    expect(environment).toContain("NEXT_PUBLIC_TURNTABLE_ENABLED=false");
    expect(layout).toContain(
      'process.env.NEXT_PUBLIC_INLINE_TURNTABLE_ENABLED !== "false"',
    );
    expect(layout).toContain(
      'process.env.NEXT_PUBLIC_TURNTABLE_ENABLED === "true"',
    );
    expect(provider).toContain("enabled = false");
    expect(provider).toContain("persistentPlayerEnabled = false");
    expect(provider).toContain("{enabled && persistentPlayerEnabled ? (");
    expect(provider).toContain("<TurntablePlayer");
    expect(home).toContain("InkOnWaterPreview");
    expect(experience).toContain(
      "<WatercolorRecordPlayer release={playableRelease}",
    );
    expect(experience).toContain("data-playing={isPlaying}");
    expect(listeningShelf).toContain('presentation === "immersive"');
    expect(listeningShelf).toContain("IntersectionObserver");
    expect(listeningShelf).toContain('rootMargin: "360px 0px"');
    expect(listeningShelf).not.toContain("persistent player");
    expect(inlinePlayer).toContain('data-player-placement="inline"');
    expect(inlinePlayer).toContain('data-testid="wbr-inline-turntable"');
    expect(inlinePlayer).toContain("registerSpotifyHost");
    expect(inlinePlayer).toContain("togglePlayback");
    expect(inlinePlayer).toContain("selectTrack(index)");
  });

  it("enforces the production Ink on Water brand law without deleting the archive", () => {
    const productionFiles = [
      read("src/app/records-brand.css"),
      read("src/components/whole-body-records/InkOnWaterPreview.module.css"),
      read(
        "src/components/whole-body-records/brand/RecordsTerrainRiver.module.css",
      ),
      read(
        "src/components/whole-body-records/brand/RecordsWatershed.module.css",
      ),
      read("src/components/whole-body-records/PoolingWaterClosing.module.css"),
      read("src/components/whole-body-records/RecordsFooter.module.css"),
    ].join("\n");
    const forbidden = [
      "#6d4aff",
      "#d4af37",
      "#e56b3d",
      "#54dbff",
      "#2ba8a0",
      "#d16b45",
      "#8f5bff",
      "#7c9cf5",
    ];

    expect(productionFiles).toContain("#2d9cdb");
    expect(productionFiles).toContain("aspect-ratio: 1 / 1");
    expect(productionFiles).toContain("mix-blend-mode: color");
    for (const color of forbidden) {
      expect(productionFiles.toLowerCase()).not.toContain(color);
    }
    expect(
      existsSync(
        "public/images/backgrounds/wbr-monochrome-watercolor-river-v2.png",
      ),
    ).toBe(true);
    expect(
      existsSync(
        "public/images/backgrounds/hero-options/wbr-hero-02-record-watershed.png",
      ),
    ).toBe(true);
    expect(
      existsSync("public/whole-body-records-social-record-watershed.png"),
    ).toBe(true);
    expect(existsSync("src/app/museum/page.tsx")).toBe(true);
    expect(read("src/app/museum/page.tsx")).toContain(
      "robots: { follow: false, index: false }",
    );
  });

  it("scopes Spotify playback to the mounted inline host", () => {
    const provider = read(
      "src/components/whole-body-records/turntable/TurntableProvider.tsx",
    );

    expect(provider).toContain(
      "if (!enabled || !activeRelease || !spotifyHostElement) return",
    );
    expect(provider).toContain(
      'script[src="https://open.spotify.com/embed/iframe-api/v1"]',
    );
    expect(provider).toContain("controllerRef.current?.destroy()");
    expect(provider).toContain("controllerRef.current = null");
    expect(provider).toContain("setControllerReady(false)");
  });

  it("renders a bounded deep-sea signal river in the existing WebGL plane", () => {
    const atmosphere = read(
      "src/components/whole-body-records/WholeBodyRecordsAtmosphere.tsx",
    );
    const fallback = read(
      "src/components/whole-body-records/DeepSeaFallback.tsx",
    );
    const water = read("src/components/whole-body-records/WaterCanvas.tsx");
    const shaders = read("src/components/whole-body-records/water-shaders.ts");

    expect(atmosphere).toContain('data-scene="deep-sea-signal-river"');
    expect(atmosphere).toContain("prefers-reduced-motion: reduce");
    expect(atmosphere).toContain("connection?.saveData");
    expect(atmosphere.indexOf("updatePolicy()")).toBeLessThan(
      atmosphere.lastIndexOf('import("./WaterCanvas")'),
    );
    expect(fallback).toContain("wbr-static-icosahedron");
    expect(water).toContain("ICOSAHEDRON_EDGE_VERTICES");
    expect(water).toContain("gl.LINES");
    expect(water).toContain('document.addEventListener("visibilitychange"');
    expect(water).toContain("new ResizeObserver");
    expect(water).toContain('data-testid="wbr-deep-sea-canvas"');
    expect(shaders).toContain("inkSignal");
    expect(shaders).toContain("vec3(45.0, 156.0, 219.0) / 255.0");
    expect(shaders).not.toMatch(/spectral|spectrum/i);
    expect(shaders).toContain("signalCenter");
    expect(shaders).toContain("icosahedronVertexShader");
  });

  it("locks the sovereign Records typography without restyling private ØDIN", () => {
    const layout = read("src/app/layout.tsx");
    const shell = read(
      "src/components/whole-body-records/RecordsPageShell.tsx",
    );
    const login = read("src/app/login/page.tsx");
    const tailwind = read("tailwind.config.ts");
    const css = read("src/app/globals.css");

    expect(layout).toContain("Fraunces");
    expect(layout).toContain("Schibsted_Grotesk");
    expect(layout).toContain('axes: ["opsz"]');
    expect(layout).toContain('variable: "--font-records-display"');
    expect(layout).toContain('variable: "--font-records-body"');
    expect(tailwind).toContain('header: ["var(--font-records-display)"');
    expect(tailwind).toContain('body: ["var(--font-records-body)"');
    expect(css).toContain("font-optical-sizing: auto");
    expect(css).toContain(".records-site h1");
    expect(css).toContain(".wbr-turntable");
    expect(shell).not.toContain("Cinzel");
    expect(login).not.toContain("Cinzel");
    expect(css).not.toMatch(
      /(?:^|\n)\s*(?:html|body)\s*\{[^}]*var\(--font-records-(?:display|body)\)/,
    );
  });
});
