import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260729130000_public_mirror_projection.sql",
  "utf8",
);
const hardeningMigration = readFileSync(
  "supabase/migrations/20260729140000_public_mirror_metadata_allowlist.sql",
  "utf8",
);
const servicesMigration = readFileSync(
  "supabase/migrations/20260729150000_public_services_catalog.sql",
  "utf8",
);
const storeMigration = readFileSync(
  "supabase/migrations/20260729160000_whole_body_store_catalog.sql",
  "utf8",
);
const leastPrivilegeMigration = readFileSync(
  "supabase/migrations/20260729180000_public_mirror_least_privilege.sql",
  "utf8",
);
const editorialMigration = readFileSync(
  "supabase/migrations/20260730010000_public_editorial_current_allowlist.sql",
  "utf8",
);
const api = readFileSync("src/lib/public-mirror.ts", "utf8");

describe("public mirror security boundary", () => {
  it("grants anonymous reads only to the projection table", () => {
    expect(migration).toContain(
      "grant select on public.published_entities to anon",
    );
    for (const privateSource of [
      "artists",
      "release_schedule",
      "release_tracks",
      "deals",
      "contacts",
      "revenue_ledger",
    ]) {
      expect(migration).not.toContain(
        `grant select on public.${privateSource} to anon`,
      );
    }
  });

  it("requires both a publication state and recorded approval", () => {
    expect(migration).toContain("visibility = 'published'");
    expect(migration).toContain(
      "new.artist_approval_status not in ('approved', 'not_required')",
    );
    expect(migration).toContain(
      "Only confirmed shows can be published",
    );
  });

  it("never performs wildcard reads from an operational source", () => {
    expect(api).toContain('.from("published_entities")');
    expect(api).not.toContain('.select("*")');
    for (const privateSource of [
      '.from("artists")',
      '.from("release_schedule")',
      '.from("deals")',
    ]) {
      expect(api).not.toContain(privateSource);
    }
  });

  it("rejects protocol-relative and backslash-confused public URLs", () => {
    expect(api).toContain('candidate.startsWith("//")');
    expect(api).toContain('candidate.includes("\\\\")');
  });

  it("allows presentation metadata only through an explicit server allowlist", () => {
    expect(hardeningMigration).toContain(
      "public.safe_public_mirror_metadata",
    );
    expect(hardeningMigration).toContain(
      "new.payload := source_payload || safe_metadata",
    );
    expect(hardeningMigration).not.toContain(
      "new.payload := source_payload || coalesce(new.metadata",
    );
    for (const allowedKey of [
      "catalog_status",
      "format_label",
      "display_date",
      "cover_image_alt",
    ]) {
      expect(hardeningMigration).toContain(`'${allowedKey}'`);
    }
  });

  it("publishes service copy through a bounded field allowlist", () => {
    expect(servicesMigration).toContain(
      "public.safe_public_service_payload",
    );
    expect(servicesMigration).toContain(
      "public.safe_public_service_content",
    );
    expect(servicesMigration).toContain(
      "source_payload := public.safe_public_service_payload(source_payload)",
    );
    expect(servicesMigration).toContain("artist_approval_status,");
    expect(servicesMigration).toContain("'not_required'");
    for (const publicField of ["'title'", "'body'", "'statement'", "'capabilities'"]) {
      expect(servicesMigration).toContain(publicField);
    }
    for (const withheldClaim of [
      "15–25%",
      "15% on gross",
      "$2,500",
      "14 business days",
      "70% artist",
    ]) {
      expect(servicesMigration).not.toContain(withheldClaim);
    }
  });

  it("publishes editorial current through a strict studio-update allowlist", () => {
    expect(editorialMigration).toContain(
      "public.safe_public_studio_update_payload",
    );
    expect(editorialMigration).toContain(
      "public.safe_public_editorial_image_url",
    );
    expect(editorialMigration).toContain(
      "public.sanitize_public_studio_update_snapshot",
    );
    expect(editorialMigration).toContain(
      "source.content_key ~ '^current\\.[a-z0-9]+(?:[.-][a-z0-9]+)*$'",
    );
    expect(editorialMigration).toContain("visibility = 'hidden'");
    expect(editorialMigration).toContain(
      "new.payload := public.safe_public_studio_update_payload(new.payload)",
    );
    expect(editorialMigration).toContain("new.metadata := '{}'::jsonb");
    for (const approvedImageHost of [
      "sandabado-music\\.vercel\\.app",
      "umoapqrkcabmdvkmdnqv\\.supabase\\.co",
      "wholebodyrecords\\.com",
    ]) {
      expect(editorialMigration).toContain(approvedImageHost);
    }

    const payloadAllowlist = editorialMigration.slice(
      editorialMigration.indexOf(
        "create or replace function public.safe_public_studio_update_payload",
      ),
      editorialMigration.indexOf(
        "revoke all on function public.safe_public_editorial_url",
      ),
    );
    for (const publicField of [
      "'title'",
      "'summary'",
      "'kind'",
      "'href'",
      "'action_label'",
      "'artist_slug'",
      "'image_url'",
      "'image_alt'",
      "'meta'",
      "'starts_at'",
      "'live_status'",
    ]) {
      expect(payloadAllowlist).toContain(publicField);
    }
    expect(payloadAllowlist).not.toContain("jsonb_build_object('id'");
    expect(payloadAllowlist).not.toContain("jsonb_build_object('artist_id'");
    expect(payloadAllowlist).not.toContain("'private_notes'");
    expect(editorialMigration).toContain(
      "public.sync_public_editorial_artist_relationship",
    );
    expect(editorialMigration).toContain(
      "publication.entity_type = 'studio_update'",
    );
  });

  it("keeps commerce source and Stripe identifiers behind the public mirror", () => {
    expect(storeMigration).toContain(
      "create table if not exists public.commerce_products",
    );
    expect(storeMigration).toContain("'store_product'");
    expect(storeMigration).toContain(
      "public.build_public_store_product_payload",
    );
    expect(storeMigration).not.toContain(
      "grant select on public.commerce_products to anon",
    );
    const publicPayloadBuilder = storeMigration.slice(
      storeMigration.indexOf(
        "create or replace function public.build_public_store_product_payload",
      ),
      storeMigration.indexOf(
        "create or replace function public.prepare_public_mirror_snapshot",
      ),
    );
    expect(publicPayloadBuilder).not.toContain("'stripe_product_id'");
    expect(publicPayloadBuilder).not.toContain("'stripe_price_id'");
    expect(publicPayloadBuilder).not.toContain("'inventory_limit'");
    expect(storeMigration).toContain("if new.status <> 'active' then");
    expect(storeMigration).toContain("visibility = 'hidden'");
    expect(leastPrivilegeMigration).toContain(
      "public.sync_release_commerce_public_mirror",
    );
    expect(leastPrivilegeMigration).toContain(
      "product.release_schedule_id = new.id",
    );
    expect(leastPrivilegeMigration).toContain(
      "after update of slug on public.release_schedule",
    );
  });

  it("limits anonymous projection access to public application columns", () => {
    expect(leastPrivilegeMigration).toContain(
      "revoke select on public.published_entities from anon",
    );
    expect(leastPrivilegeMigration).toContain(
      "grant select (",
    );
    for (const internalColumn of [
      "source_table",
      "source_id",
      "artist_id",
      "published_by",
      "metadata",
    ]) {
      const grant = leastPrivilegeMigration.slice(
        leastPrivilegeMigration.indexOf("grant select ("),
      );
      expect(grant).not.toContain(internalColumn);
    }
  });
});
