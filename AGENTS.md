# ØDIN Management Repository Instructions

The complete organizational reference is [`docs/ODIN_MANAGEMENT_COMPLETE_TRAINING.md`](docs/ODIN_MANAGEMENT_COMPLETE_TRAINING.md). Read it before architecture, product strategy, brand-system, workflow-automation, or major UI work.

## Product definition

ØDIN Management is an organizational operating system, not a booking spreadsheet. It combines systems thinking, sacred geometry, workflow architecture, and human-directed agentic execution for artist management and the Whole Body ecosystem.

Every meaningful feature should support the nine operational layers in proportion to its scope:

1. Direction
2. Validation
3. Execution
4. Protection
5. Knowledge
6. Culture
7. Flow
8. Infrastructure
9. Feedback

Use toroidal flow as the systems model: outputs should create useful inputs for the next cycle. Prefer proof before productization and one tangible artifact per project.

## Execution discipline

- Preserve the existing Next.js, TypeScript, Supabase, and Vercel architecture.
- For net-new projects, produce the project manifest described in the training reference before implementation and wait for approval.
- For changes to this existing app, inspect the current implementation, state any material assumptions, make the smallest complete change, and validate it in proportion to risk.
- Ask a clarifying question only when the answer would materially change scope, data, external state, or the design direction.
- Never invent users, integrations, operational status, business metrics, or validation results.
- Keep human judgment checkpoints for A&R, scouting, proposals, external messages, and consequential decisions.
- Do not represent an integration as live until it is connected and verified.

## Design and interaction

- Respect the visual language already established on the surface being edited. Do not force Ghosthand, portfolio, or unrelated project specifications into ØDIN screens.
- For new ØDIN brand surfaces, begin with the sacred-minimalism tokens and golden-ratio spacing in the training reference.
- Use spacing from the 8, 16, 25, 42, 68, 110, 179, and 290 sequence when introducing or consolidating layout values.
- Support mobile, tablet, desktop, reduced motion, keyboard navigation, visible focus, and WCAG AA contrast.
- Prefer performance and clarity over animation complexity. Motion must communicate state or system flow.
- Every reusable component must have a documented TypeScript props interface.

## Data and assets

- Treat Supabase migrations as the durable record of schema and canonical data changes.
- Preserve RLS boundaries and the separation between browser, server-session, and service-role clients.
- Sequence database URLs and public assets so production records never point to undeployed files.
- Store production images in stable, artist-scoped locations with descriptive URL-safe names, responsive delivery, appropriate crops, and unnecessary metadata removed.
- Keep source photography authentic; do not generatively alter an artist's identity without explicit approval.

## Quality gates

Before handing off production work:

- TypeScript strict checks and the production build pass.
- Responsive behavior is accounted for at mobile, tablet, and desktop widths.
- Accessibility and reduced-motion behavior are preserved.
- Security-sensitive changes receive an explicit risk review.
- Tests cover changed business logic where applicable.
- Documentation, migrations, and changelog notes stay aligned with shipped behavior.

Target Lighthouse 95+ and WCAG AA for production public surfaces. Report measured results only when an audit actually ran.

## Boundaries

- Flag Amex and Thermo Fisher material as NDA-sensitive. Use only user-approved abstractions in public work.
- `dodeca.life` is excluded from Ghosthand portfolio material.
- Never expose credentials, private operating data, unpublished contacts, or internal documentation on public routes.
