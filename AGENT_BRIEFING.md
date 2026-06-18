# Agent Briefing — 101 Night Market Vendor Portal

## What this is
You are continuing development of the 101 Night Market vendor booking and payment portal. This primary repl already contains an interactive floor map UI (clickable booth grid for Van Nuys and Hollywood). Your job is to add the full payment, admin, and pricing infrastructure that has been designed and tested in a staging repl.

**Do not redesign anything. Wire in the backend alongside whatever floor map code already exists here.**

---

## Environment secrets required
These must already exist or be added via the Secrets panel before starting:

| Secret | Description |
|--------|-------------|
| `WHOP_API_KEY` | Whop API key (starts with `apik_`) |
| `WHOP_COMPANY_ID` | `biz_boYAUqKgviBMum` |
| `DATABASE_URL` | Postgres connection string (provision a new DB if not already done) |

No `WHOP_PLAN_ID` env var needed — plan IDs are stored in the database.

---

## Stack
- pnpm workspaces monorepo (Node.js 24, TypeScript 5.9)
- API: Express 5 at `artifacts/api-server` (`@workspace/api-server`)
- Frontend: React + Vite at `artifacts/glcn` (`@workspace/glcn`)
- DB: PostgreSQL + Drizzle ORM at `lib/db` (`@workspace/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Payments: Whop (direct REST API — the SDK does NOT have refunds.create or plan price updates)

---

## Whop account details
- Company: `biz_boYAUqKgviBMum` (101 nightmarket LLC)
- Product: `prod_DfqWDt9Ip5GMq` (101 Night Market)
- Developer rev share: **3.5% pre-fee**, set company-wide as a team member

### Existing Whop plans (already created — use these exact IDs)
| Booth Type | Location | Price | Whop Plan ID |
|-----------|----------|-------|-------------|
| Standard Booth | Van Nuys | $85 | `plan_4EsQToHGWlEqN` |
| Endcap Booth | Van Nuys | $120 | `plan_AGBR2EFAs1NhP` |
| Standard Booth | Hollywood | $95 | `plan_yAGFGeDwZbCgD` |
| Endcap Booth | Hollywood | $135 | `plan_z8hqmTXZ7iKNM` |

---

## Database schema to create
Run `pnpm --filter @workspace/db run push` after adding these schema files.

### `lib/db/src/schema/bookings.ts`
```typescript
import { pgTable, serial, text, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  checkoutId: text("checkout_id").notNull().unique(),
  whopPaymentId: text("whop_payment_id"),
  planId: text("plan_id").notNull(),
  vendorEmail: text("vendor_email"),
  vendorName: text("vendor_name"),
  boothNumber: text("booth_number"),
  marketDate: date("market_date"),
  marketLocation: text("market_location"),
  amountPaid: integer("amount_paid"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
```

### `lib/db/src/schema/refundNotes.ts`
```typescript
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const refundNotesTable = pgTable("refund_notes", {
  id: serial("id").primaryKey(),
  whopPaymentId: text("whop_payment_id").notNull(),
  whopRefundId: text("whop_refund_id"),
  amountRefunded: integer("amount_refunded").notNull(),
  notes: text("notes").notNull(),
  issuedBy: text("issued_by").default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRefundNoteSchema = createInsertSchema(refundNotesTable).omit({ id: true, createdAt: true });
export type InsertRefundNote = z.infer<typeof insertRefundNoteSchema>;
export type RefundNote = typeof refundNotesTable.$inferSelect;
```

### `lib/db/src/schema/boothPricing.ts`
```typescript
import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const boothPricingTable = pgTable("booth_pricing", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  boothType: text("booth_type").notNull(),
  label: text("label").notNull(),
  price: integer("price").notNull(),
  whopPlanId: text("whop_plan_id").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBoothPricingSchema = createInsertSchema(boothPricingTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBoothPricing = z.infer<typeof insertBoothPricingSchema>;
export type BoothPricing = typeof boothPricingTable.$inferSelect;
```

### `lib/db/src/schema/index.ts`
```typescript
export * from "./bookings";
export * from "./refundNotes";
export * from "./boothPricing";
```

---

## Startup seeding
On server startup, check if `booth_pricing` is empty and seed it with the 4 default booth types. Add this to `artifacts/api-server/src/lib/seed.ts` and call it from `src/index.ts` inside the `app.listen` callback.

Default seed data:
```
van_nuys  | standard | Van Nuys Standard Booth  | $85  | plan_4EsQToHGWlEqN
van_nuys  | endcap   | Van Nuys Endcap Booth    | $120 | plan_AGBR2EFAs1NhP
hollywood | standard | Hollywood Standard Booth  | $95  | plan_yAGFGeDwZbCgD
hollywood | endcap   | Hollywood Endcap Booth   | $135 | plan_z8hqmTXZ7iKNM
```

---

## API routes to build
All routes live under `/api` prefix.

### Whop routes (`artifacts/api-server/src/routes/whop.ts`)
- `POST /api/whop/checkout` — body: `{ plan_id }` → calls Whop checkoutConfigurations.create, returns `{ checkout_id, purchase_url }`
- `GET /api/whop/verify` — query: `{ checkout_id }` → verifies payment
- `POST /api/whop/webhook` — raw body, handles `payment.completed` and `membership.went_valid`

### Whop client (`artifacts/api-server/src/lib/whopClient.ts`)
```typescript
import WhopSDK from "@whop/sdk";
export function getWhopClient() {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error("WHOP_API_KEY is not set");
  return new WhopSDK({ apiKey: key });
}
```

### Admin routes (`artifacts/api-server/src/routes/admin.ts`)
- `POST /api/admin/refunds` — body: `{ payment_id, amount?, notes }` → calls `POST https://api.whop.com/api/v1/payments/{id}/refund`, saves notes to `refund_notes` table. Empty body = full refund, `{ amount: N }` = partial.
- `GET /api/admin/reports` — query: `{ from?, to? }` → fetches payments + refunds from Whop, joins local refund notes, returns summary stats + transaction list
- `GET /api/admin/reports/export` — returns CSV download with UTF-8 BOM for Excel. Columns: Date (PT), Payment ID, Vendor Email, Status, Gross ($), Whop Fee ($), Dev Fee 3.5% ($), Refunded ($), Net to Business ($), Refund Notes

### Pricing routes (`artifacts/api-server/src/routes/pricing.ts`)
- `GET /api/admin/pricing` → returns all rows from `booth_pricing` table
- `PATCH /api/admin/pricing/:id` — body: `{ price }` → creates a NEW Whop plan at the new price via `POST https://api.whop.com/api/v2/plans`, updates `booth_pricing` record with new price and `whop_plan_id`

### Whop plan creation payload
```json
{
  "company_id": "biz_boYAUqKgviBMum",
  "product_id": "prod_DfqWDt9Ip5GMq",
  "plan_type": "one_time",
  "release_method": "buy_now",
  "initial_price": <number>,
  "visibility": "hidden"
}
```
Endpoint: `POST https://api.whop.com/api/v2/plans`
Auth: `Authorization: Bearer <WHOP_API_KEY>`

---

## Frontend pages to add (React + Vite)

### `/admin/reports` — Financial Reports page
- Date range picker (From / To) with quick buttons: This month, Last 30 days, All time
- Run Report button → calls `GET /api/admin/reports`
- 6 summary stat cards: Gross Revenue, Whop Fees, Dev Fee 3.5%, Refunded, Net to Business, Transaction count
- Transaction table with columns: Date (PT), Vendor, Status badge, Gross, Whop Fee, Dev 3.5%, Net, Refund button
- Refund button opens a modal with: amount field (blank = full refund), required notes/reason textarea, Cancel + Refund buttons
- Export to Spreadsheet button → `GET /api/admin/reports/export` (file download)

### `/admin/pricing` — Booth Pricing page
- Lists all booth types grouped by location (Hollywood / Van Nuys)
- Each row shows: booth type label, Whop plan ID (small mono text), current price, Edit button
- Edit mode: inline price input, Save / Cancel buttons
- Saving calls `PATCH /api/admin/pricing/:id` and updates the displayed price + plan ID
- Static explainer at bottom: "When you update a price, the system automatically creates a new plan on Whop..."

---

## Key architectural decisions (do not change these)

1. **Whop SDK refunds are read-only** — SDK has no `refunds.create`. Always use direct REST: `POST https://api.whop.com/api/v1/payments/{id}/refund`
2. **Whop plan prices cannot be updated via API** — always CREATE a new plan at the new price; old plan becomes orphaned
3. **Refund reasons are stored locally** — Whop refund records have no notes field; we store them in `refund_notes` table keyed by `whop_payment_id`
4. **Revenue split: 3.5% pre-fee** — developer added as team member at 3.5% company-wide. Do NOT give client Owner role in Whop (they'd be able to remove the rev share). Give them Operations role with Team, Company settings, Developer tools, and Checkout toggles OFF
5. **Whop plan visibility: hidden** — all programmatically created plans use `visibility: "hidden"` so they don't appear publicly on the Whop storefront
6. **CSV export includes UTF-8 BOM** (`\uFEFF`) so Excel opens it without encoding issues
7. **All times displayed in Pacific Time** (`America/Los_Angeles`)
8. **Redirect URL for checkout** is read from `req.headers.origin` dynamically — works across dev, staging, and production domains without hardcoding

---

## Next feature to build after wiring in the above
**Per-booth individual pricing + floor map checkout integration:**

Each booth on the floor map (A1–A20, B1–B20, E1, E2 per location) needs:
- Its own DB record with individual price, status (open/pending/taken), and vendor info
- Clicking a booth triggers a real Whop checkout at that booth's specific price
- After payment webhook fires, booth status updates to "taken"
- Admin can set price per individual booth directly on the map or in a table view

Start by reading the existing floor map component code to understand the current data structure before building this.

---

## CRITICAL: Concurrent booking race condition prevention

**Problem:** Two vendors can click the same booth at the same millisecond, both see it as "open", both get sent to Whop checkout, both pay — resulting in a double booking.

**Solution: Database-level reservation lock system**

### How it works
1. Vendor clicks a booth → server immediately inserts a **reservation** row in a `booth_reservations` table inside a transaction
2. A **unique constraint on `(booth_number, market_date, location)`** means only ONE insert can win — the second one gets a conflict error at the DB level, not the app level
3. Winning vendor gets redirected to Whop checkout; their reservation holds the booth for **15 minutes**
4. On Whop `payment.completed` webhook → reservation converts to a confirmed booking, status = `"confirmed"`
5. If vendor abandons checkout → a cleanup job or TTL check marks the reservation as expired after 15 minutes → booth returns to `"open"`

### `booth_reservations` table schema
```typescript
import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const boothReservationsTable = pgTable("booth_reservations", {
  id: serial("id").primaryKey(),
  boothNumber: text("booth_number").notNull(),
  marketDate: text("market_date").notNull(),
  marketLocation: text("market_location").notNull(),
  checkoutId: text("checkout_id").notNull().unique(),
  whopPaymentId: text("whop_payment_id"),
  vendorEmail: text("vendor_email"),
  status: text("status").notNull().default("pending"), // pending | confirmed | expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // THIS is the race condition guard — DB enforces only one active reservation per booth per date
  uniqueBoothDate: unique("unique_booth_date_location").on(
    table.boothNumber,
    table.marketDate,
    table.marketLocation
  ),
}));
```

### Checkout route logic (enforce atomically)
```typescript
// POST /api/whop/checkout
// body: { booth_number, market_date, market_location, plan_id }

// 1. Check for existing non-expired reservation
const existing = await db.select().from(boothReservationsTable)
  .where(and(
    eq(boothReservationsTable.boothNumber, booth_number),
    eq(boothReservationsTable.marketDate, market_date),
    eq(boothReservationsTable.marketLocation, market_location),
    gt(boothReservationsTable.expiresAt, new Date()),
    ne(boothReservationsTable.status, "expired")
  )).limit(1);

if (existing.length > 0) {
  return res.status(409).json({ error: "This booth is currently being reserved by another vendor. Please try again in a few minutes or choose a different booth." });
}

// 2. Create Whop checkout
const checkout = await whop.checkoutConfigurations.create(...);

// 3. Insert reservation — unique constraint prevents race condition
try {
  await db.insert(boothReservationsTable).values({
    boothNumber: booth_number,
    marketDate: market_date,
    marketLocation: market_location,
    checkoutId: checkout.id,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    status: "pending",
  });
} catch (err) {
  // Unique constraint violation — another vendor just beat them to it
  return res.status(409).json({ error: "This booth was just taken by another vendor. Please choose a different booth." });
}

return res.json({ checkout_id: checkout.id, purchase_url: checkout.purchase_url });
```

### Webhook confirms the reservation
```typescript
// In payment.completed handler:
await db.update(boothReservationsTable)
  .set({ status: "confirmed", whopPaymentId: payment.id })
  .where(eq(boothReservationsTable.checkoutId, checkoutId));
```

### Expired reservation cleanup
On every `GET /api/booths` (floor map load), run a quick cleanup first:
```typescript
await db.update(boothReservationsTable)
  .set({ status: "expired" })
  .where(and(
    lt(boothReservationsTable.expiresAt, new Date()),
    eq(boothReservationsTable.status, "pending")
  ));
```

### Floor map booth status logic (priority order)
1. If confirmed reservation exists for booth+date+location → `"taken"` (red, unclickable)
2. If pending reservation exists AND not expired → `"pending"` (yellow, unclickable, show "Being reserved...")
3. Otherwise → `"open"` (green, clickable)

### Frontend: optimistic UI on click
When a vendor clicks a booth:
- Immediately show a loading spinner on that booth
- Disable the booth button to prevent double-clicks from the same browser
- If the API returns 409 → show a clear message: "This booth was just taken. Please choose another."
- If success → redirect to Whop checkout URL

---

## Pricing summary (for reference)
| Location | Type | Price |
|----------|------|-------|
| Van Nuys | Standard | $85/night |
| Van Nuys | Endcap | $120/night |
| Hollywood | Standard | $95/night |
| Hollywood | Endcap | $135/night |

Notification system: email only (no SMS), using Resend. Pacific Time for all dates/times.
