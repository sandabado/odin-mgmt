# ØDIN Management — Lumo Review Brief

## How to use this brief

Paste the section below into Lumo, then attach only the screenshots or code files relevant to the review. This brief intentionally excludes credentials, private records, unpublished contacts, internal metrics, and NDA-sensitive client material.

---

## Review prompt

You are reviewing ØDIN Management, a private organizational operating system for artist management and the Whole Body ecosystem. It is not a booking spreadsheet. It connects direction, relationships, projects, campaigns, shows, money, operational knowledge, and feedback into one human-directed system.

Do not assume that a route, database table, or placeholder represents a verified live integration. Do not invent users, metrics, outcomes, business status, or customer research. Distinguish direct observations from inferences, and label any inference clearly.

### Operating model

Assess the product against these nine operational layers:

1. Direction — vision, roadmap, and sequencing
2. Validation — hypotheses, testing, and iteration
3. Execution — delivery, workflows, and SOPs
4. Protection — permissions, legal, compliance, and risk
5. Knowledge — documentation and organizational memory
6. Culture — values, cohesion, and sustainability
7. Flow — revenue, distribution, and economics
8. Infrastructure — tools, data, and implementation
9. Feedback — adaptation and self-correcting loops

The systems model is toroidal: each useful output should become an input to the next operating cycle. Human approval must remain explicit for A&R, scouting, proposals, external messages, and consequential decisions.

### Technical shape

- Framework: Next.js 15 App Router
- Language: TypeScript with strict checking
- UI: React 19 and Tailwind CSS
- Data and authentication: Supabase/Postgres with row-level security
- Validation: Zod
- Hosting target: Vercel
- API pattern: authenticated route handlers with consistent response envelopes and rate limits where applicable
- Supabase clients are separated by context: browser/RLS, server-session/RLS, and server-only service role
- Durable schema and canonical data changes live in ordered Supabase migrations

High-level structure:

```text
src/
├── app/
│   ├── admin/               private operations workspaces
│   ├── artist/              private artist-facing portal
│   ├── api/                 authenticated mutations and scheduled jobs
│   ├── login/               authentication entry
│   └── page.tsx             public management site
├── components/
│   ├── admin/               operations UI and studio intelligence
│   └── artist/              artist portal UI
├── lib/
│   ├── auth/                roles and session handling
│   ├── supabase/            context-specific clients
│   ├── treasury/            financial allocation logic
│   └── validators/          request schemas
└── types/                   shared API types

supabase/
└── migrations/              schema, policies, triggers, and canonical seeds
```

### Current information architecture

The authenticated admin shell uses this top-level order:

1. Dashboard
2. Artists
3. Studio
4. Venues
5. Campaigns
6. Showcases
7. People
8. Outreach
9. Wallet
10. Show Prep

Supporting groups:

- Outreach: Contracts and Press Coverage, both visibly marked as forthcoming
- Wallet: Inflow and Outflow; financial visibility is role-sensitive
- Studio: Engineering, with Projects, Promo Studio, and Records marked as forthcoming
- Show Prep: Run Sheets, Setlists, and Gear
- Super-admin settings include the operating Playbook; unfinished settings remain clearly labeled

Artists, Venues, Campaigns, Showcases, and People are first-class destinations because they are primary operating objects rather than utility pages.

### Primary workspace shapes

- Dashboard: cross-system status, time-sensitive work, the unified operating schedule, activity, and links into operational records
- Artists: directory leading to an Artist Studio that unifies projects, recording, releases, campaigns, pipeline, shows, revenue, payouts, and related expenses
- Venues: filterable room network with market, relationship status, capacity, role, notes, and deal range
- Campaigns: campaign desk plus detail views for pitches, coverage, social queue, budgets, and campaign state
- Showcases: booking and deal records connecting artists, venues, dates, terms, and negotiation state
- People: private relationship field with role, market, organization, genre focus, outreach dates, and a relationship-warmth indicator
- Wallet: inflow allocation, outflow expenses, payouts, and revenue records
- Artist portal: a restricted view of schedule, shows, meetings, music, setlists, gear, promotion, revenue, tools, and settings

### Visual and interaction language

The admin surface uses sacred minimalism with restrained operational density:

- Void: `#0C0F14`
- Carbon: `#11161D`
- Steel: `#19212A`
- Mercury: `#34404D`
- Plasma: `#B9A6FF`
- Flux: `#8DDBC9`
- Halo: `#E6C781`
- Bone: `#F2F3F0`
- Ghost: `#A8B0BB`
- Display type: Iowan Old Style / Palatino family
- Operational metadata: system monospace family
- Layout spacing should follow 8, 16, 25, 42, 68, 110, 179, and 290
- Admin surfaces use softened 12px controls, 18px cards, and 25px primary panels
- Admin motion uses low-amplitude eased transitions and a non-blocking welcome state

Interaction requirements:

- Mobile, tablet, and desktop layouts
- Keyboard navigation and visible focus
- WCAG AA contrast
- Reduced-motion support
- Motion only when it communicates state or system flow
- Loading, empty, and error states should preserve context and suggest a useful next action

### Product and safety constraints

- Preserve human judgment checkpoints for outbound communication and consequential decisions.
- Never describe an integration as live unless connection and behavior have been verified.
- Never expose credentials, private operating data, unpublished contacts, or internal documentation on public routes.
- Preserve Supabase row-level-security boundaries and role separation.
- Prefer proof before productization and one tangible artifact per project.
- Recommendations should improve clarity and operational flow before adding animation or abstraction.

### Requested review

Review the supplied screen, flow, or code in this context. Return:

1. A concise statement of what the surface currently helps the operator accomplish.
2. The five highest-impact findings, ordered by operational risk or user value.
3. For each finding: evidence, affected user, relevant operational layer, and a concrete recommendation.
4. Any broken loop where an output fails to become a useful next input.
5. Accessibility, responsive-layout, security, and permissions concerns as separate callouts.
6. A smallest-complete-change recommendation, followed by optional later enhancements.
7. Questions only where the answer would materially change scope, data, external state, or design direction.

Avoid generic SaaS advice. Do not recommend automation where human review is required. Do not treat placeholder or forthcoming functionality as shipped.

---

## Suggested attachments by review type

- Navigation or information architecture: `src/components/admin/AdminShell.tsx` plus desktop and mobile screenshots
- Artist Studio: `src/app/admin/studios/[artistId]/page.tsx` and `src/components/admin/ArtistStudioTabs.tsx`
- Venues: `src/app/admin/venues/page.tsx` and the venue schema migration
- Campaigns: campaign list/detail pages and `src/components/admin/CampaignForms.tsx`
- Contacts: `src/app/admin/contacts/page.tsx`, `ContactWarmthMeter.tsx`, and the contact schema migration
- Security or data review: the relevant migration, API handler, validator, and Supabase client—not environment files

Never attach `.env.local`, service-role keys, authentication cookies, production exports, private contact lists, or unpublished client material.
