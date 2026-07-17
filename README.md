# Odin Management

Public-facing artist management and booking site for the Whole Body Records roster.

## Current MVP

- Public management and booking presence
- Artist roster: Sandābādo, Father Atlas, Palo Xanto, and future-signing intake
- Booking inquiry handoff to `booking@odin.management`
- Red Dog Saloon showcase signal
- Privacy and terms pages
- Responsive, accessible design with reduced-motion support

## Operations roadmap

The private venue database, lead scoring, outreach automation, contracts, and payment workflow are intentionally not simulated in the public interface. They are the next integration layer, connecting Airtable, an email provider, e-signatures, and payments behind authenticated roles.

## Phase 1: Supabase handoff

The Phase 1 foundation is in the repository, but it is not connected to a live Supabase project until an operator provides the environment values and applies the migration.

1. Create a Supabase project and copy the project URL plus publishable key into `.env.local` using `.env.example` as the reference.
2. Run [`supabase/migrations/20260717140000_phase_one_foundation.sql`](supabase/migrations/20260717140000_phase_one_foundation.sql) in the Supabase SQL editor or through the Supabase CLI.
3. Configure the Supabase Auth site URL and redirect URL for `/auth/callback`.
4. Register and confirm the first account. The migration assigns that first profile `super_admin`; future accounts default to `artist` until an administrator changes the role.

`/admin` and `/login` are protected by Supabase session middleware. No live CRM, email sender, contract workflow, storage uploader, or social publisher has been represented as operational before its real integration exists.

## Local development

```bash
npm install
npm run dev
```

Validate the production build with `npm run build`.

## Changelog

### 0.1.0 — Public MVP

Initial Odin Management site with public roster, booking positioning, and contact flow.
