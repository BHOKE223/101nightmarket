---
name: 101 Night Market vendor portal
description: Key product decisions, timezone rules, calendar integration plan, and market config for the vendor booth booking system.
---

## Timezone
- **All times are Pacific Time (America/Los_Angeles).**
- Store all datetimes in UTC in the database; convert to/from PT at the API boundary and in UI display.
- Use `date-fns-tz` or `Temporal` (with polyfill) for conversions — never raw JS Date offsets.
- Market hours: Thu–Sun 5 pm – 10 pm PT.

## Calendar Integration (planned, not yet built)
- **iCal / WebCal feed** — subscription URL per vendor (`webcal://.../api/calendar/vendor/:id`). Auto-updates on booking changes. Works with Google, Apple, Outlook.
- **"Add to Google Calendar" button** — deep-link after booking, no OAuth needed.
- Full Google Calendar OAuth sync is a later-phase addition if needed.
- All event times in iCal DTSTART/DTEND must be emitted in PT (use `TZID=America/Los_Angeles`).

## Markets
- **Van Nuys**: standard $85/night, endcap $120/night
- **Hollywood**: standard $95/night, endcap $135/night
- Both run Thu–Sun 5 pm–10 pm PT.

## Floor Map Layout
- Vertical corridor: Side A (left) / Side B (right), 20 booths per side (A1–A20, B1–B20).
- Endcap bars span full width: E1 at top (entrance), E2 at bottom (exit).
- Status colors: green = available, amber = endcap, yellow = pending, grey = taken.
- Admin controls booth count per week and single vs double endcaps per end.

## Payments
- Provider: Whop (decided earlier in session).
- **Fee structure:** Whop handles the revenue split natively. Bulk of each payment routes to the main night market business bank account; a ~3% developer fee routes automatically to the owner's separate account. No manual transfers needed — Whop's split-pay feature does this at the platform level.
- Configure Whop revenue split via Whop dashboard/API during setup.
- Test the full split-pay flow in staging to confirm both accounts receive their correct share.

## SMS
- Provider: Twilio for vendor notifications.

## Stack notes
- Vendor portal is a separate artifact from the GLCN landing page.
- Floor map mockup lives at `artifacts/mockup-sandbox/src/components/mockups/booth-selection/FloorMap.tsx`.
- Vendor portal tasks (#1–#5) are in PROPOSED state — not yet approved or built.
