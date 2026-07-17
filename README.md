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

## Local development

```bash
npm install
npm run dev
```

Validate the production build with `npm run build`.

## Changelog

### 0.1.0 — Public MVP

Initial Odin Management site with public roster, booking positioning, and contact flow.
