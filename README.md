# ØDIN Management

Public-facing artist management and booking site for the Whole Body Records roster.

## Operating reference

This repository follows the ØDIN nine-layer operating architecture, proof-first workflow, human-checkpoint model, and sacred-minimalism design principles documented in [`docs/ODIN_MANAGEMENT_COMPLETE_TRAINING.md`](docs/ODIN_MANAGEMENT_COMPLETE_TRAINING.md). Repository-specific execution rules live in [`AGENTS.md`](AGENTS.md).

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

1. Create a Supabase project and copy the project URL plus publishable key into `.env.local` using `.env.example` as the reference. Legacy projects can use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead.
2. Run [`supabase/migrations/20260717140000_phase_one_foundation.sql`](supabase/migrations/20260717140000_phase_one_foundation.sql) in the Supabase SQL editor or through the Supabase CLI.
3. Configure the Supabase Auth site URL and redirect URL for `/auth/callback`.
4. Register and confirm the first account. The migration assigns that first profile `super_admin`; future accounts default to `artist` until an administrator changes the role.

### Odin Network

The industry Rolodex is the next protected module. After Phase 1 is running, apply [`supabase/migrations/20260717150000_industry_network_foundation.sql`](supabase/migrations/20260717150000_industry_network_foundation.sql). It adds contacts, outreach campaign/message records, deal history, RLS, and a warmth calculation that powers the contacts workspace at `/admin/contacts`.

The contacts API is available at `/api/contacts` for authenticated operations staff. Email delivery, open/click tracking, and campaign sending intentionally remain off until SendGrid is connected and webhook signatures are configured.

### Whole Body Studios Treasury

[`supabase/migrations/20260717160000_studio_treasury_and_projects.sql`](supabase/migrations/20260717160000_studio_treasury_and_projects.sql) adds the cross-arm foundation: projects, a shared timeline, revenue ledger, payouts, and contact engagements. `/admin/treasury` is super-admin-only and reports from those real ledger entries using the Feed First split: artist 50%, guild 25%, infrastructure 15%, founder 10%.

`/admin`, `/login`, and each future operations route are protected by Supabase session middleware. Supabase clients are separated by context: browser (RLS), server (session/RLS), and a server-only service-role client for trusted work such as webhooks. Every future API handler uses the `ApiResponse<T>` envelope and a Zod validator from `src/lib/validators`.

No live CRM, email sender, contract workflow, storage uploader, or social publisher has been represented as operational before its real integration exists.

## Local development

```bash
npm install
npm run dev
```

Validate the production build with `npm run build`.

## Changelog

### 0.1.0 — Public MVP

Initial ØDIN Management site with public roster, booking positioning, and contact flow.
