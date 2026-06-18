# Agent Briefing — 101 Night Market Vendor Portal

## What this is
You are continuing development of the 101 Night Market vendor booking and payment portal. This primary repl already contains an interactive floor map UI (clickable booth grid for Van Nuys and Hollywood). Your job is to add the full payment, admin, and pricing infrastructure alongside the existing floor map.

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

### Whop plans
**Do NOT use any hardcoded plan IDs.** All Whop plans must be created fresh via the API at server startup if they don't exist yet, using the correct prices below. Store the resulting plan IDs in the `booth_pricing` table. The plan creation endpoint and payload are documented in the API routes section below.

---

## REAL Pricing (source of truth — from live JotForm)

### Single-day booth pricing
| Booth Type | Size | Price/Day |
|-----------|------|-----------|
| Food Vendor Booth | 10×10 | $100 |
| Food Vendor Booth | 10×20 | $150 |
| Pre-Packaged Food Booth | 10×10 | $75 |
| Retail Vendor Booth | 10×10 | $50 |
| Information Booth | 10×10 | $100 |
| Food Truck | N/A (extremely limited) | TBD by admin |

### 4-day bundle pricing
| Booth Type | Size | Bundle Price |
|-----------|------|-------------|
| Food Vendor Booth - 4 Days | 10×10 | $400 |
| Food Vendor Booth - 4 Days | 10×20 | $600 |
| Pre-Packaged Food Booth - 4 Days | 10×10 | $300 |
| Retail Vendor Booth - 4 Days | 10×10 | $200 |

### Add-ons
| Add-on | Price |
|--------|-------|
| Overnight Booth Security Fee | $10/night |
> Overnight security: covers vendors who leave their booth set up on-site after market hours.

### Market locations, days & hours
- **Van Nuys:** 16955 Sherman Way, Van Nuys
- **Hollywood:** Walk of Fame
- **Days:** Thursday – Sunday (+ "All Days" 4-day bundle)
- **Hours:** 5:00 PM – 11:00 PM both locations

### Location pricing
Both locations start with identical pricing. Hollywood launches July 2026. Admin can set per-location price overrides at any time via the pricing admin page.

---

## Vendor Application Fields (complete list from live JotForm)

These are all the fields vendors fill out. They apply to either Van Nuys or Hollywood location.

### Contact & Business Info (all required)
| Field | Type | Notes |
|-------|------|-------|
| Business Name | Text | |
| Contact Person First Name | Text | |
| Contact Person Last Name | Text | |
| Email Address | Email | |
| Phone Number | Phone | Format: (000) 000-0000 |

### Location & Booth Selection (all required)
| Field | Type | Notes |
|-------|------|-------|
| Which 101 Night Market location? | Dropdown | Van Nuys / Hollywood |
| Why should your business be selected for the Hollywood location? | Textarea | Conditional — only shown when Hollywood is selected |
| General Vendor Category | Checkboxes | Prepared Food / Packaged Food / Retail / Other |
| Vendor Category Details | Dropdown | Sub-category based on general category |
| Booth Size/Type | Checkboxes | 10×10 Food Space / 10×20 Food Space / 10×10 Prepackaged Food Space / Food Truck (Extremely Limited) / 10×10 Retail |

### Business Profile (all required)
| Field | Type | Notes |
|-------|------|-------|
| Brief Description of Business/Concept | Textarea | 500 words or less |
| List up to three menu items | Textarea | |
| Upload Photos of Products or Booth | File upload | Required |
| Instagram | URL | Full URL e.g. http://www.instagram.com/handle/ |
| Instagram Follower Count | Radio | Under 1000 / 1000–5000 / 5000–10,000 / 10,000+ |

### Logistics (all required)
| Field | Type | Notes |
|-------|------|-------|
| Do you have a generator? | Radio | Yes / No |
| Have you participated in night markets or similar events before? | Radio | Yes / No |
| Space or equipment requirements | Textarea | e.g. electricity, table size |
| Preferred Start Date | Date | MM-DD-YYYY |
| Which days are you available? | Checkboxes | Thursday / Friday / Saturday / Sunday / All Days |

### Final Step
| Field | Type | Notes |
|-------|------|-------|
| How did you hear about us? | Dropdown | |
| I agree to abide by the night market's rules and regulations | Checkbox | Required to submit |

---

## Terms & Conditions (must be shown and agreed to at checkout)
The following terms must be displayed as a required checkbox before the vendor can proceed to payment. Store `termsAgreed: true` on the booking record.

**Refund & Cancellation Policy:**
All vendor payments are non-refundable. If the event is canceled due to weather, safety concerns, or orders from the city or authorities, the event may be rescheduled at the organizer's discretion. Payments may be transferred to a future event date. No refunds will be issued for no-shows, late arrivals, early breakdowns, or failure to comply with event rules. Submission of payment confirms acceptance of these terms.

**Liability Disclaimer:**
The organizer is not responsible for loss, theft, damage, or injury to vendors, staff, equipment, or property. Vendors agree to operate at their own risk and hold the organizer harmless from any claims arising from participation.

---

## Database schema to create
Run `pnpm --filter @workspace/db run push` after adding these schema files.

### `lib/db/src/schema/vendorApplications.ts`
```typescript
import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorApplicationsTable = pgTable("vendor_applications", {
  id: serial("id").primaryKey(),

  // Contact & business info
  businessName: text("business_name").notNull(),
  contactFirstName: text("contact_first_name").notNull(),
  contactLastName: text("contact_last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),

  // Location & booth preference
  location: text("location").notNull(),             // "van_nuys" | "hollywood"
  hollywoodWhySelected: text("hollywood_why_selected"), // conditional, Hollywood only
  generalCategory: text("general_category").notNull(), // "prepared_food" | "packaged_food" | "retail" | "other"
  categoryDetails: text("category_details").notNull(),
  boothType: text("booth_type").notNull(),          // "food_10x10" | "food_10x20" | "prepackaged_10x10" | "food_truck" | "retail_10x10"

  // Business profile
  businessDescription: text("business_description").notNull(),
  menuItems: text("menu_items"),                    // up to 3 items
  photoUrls: text("photo_urls"),                    // comma-separated uploaded file URLs
  instagramUrl: text("instagram_url"),
  instagramFollowerCount: text("instagram_follower_count"), // "under_1000" | "1000_5000" | "5000_10000" | "10000_plus"

  // Logistics
  hasGenerator: boolean("has_generator"),
  hasParticipatedBefore: boolean("has_participated_before"),
  spaceRequirements: text("space_requirements"),
  preferredStartDate: text("preferred_start_date"),
  availableDays: text("available_days"),            // comma-separated: "thursday,friday,saturday"

  // How they heard about us
  howHeard: text("how_heard"),

  // Agreement
  agreedToRules: boolean("agreed_to_rules").notNull().default(false),

  // Admin workflow
  status: text("status").notNull().default("pending_review"),
  // pending_review | approved | rejected | waitlisted
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  rejectionReason: text("rejection_reason"),
  bookingToken: text("booking_token").unique(),     // UUID sent in approval email
  bookingTokenExpiresAt: timestamp("booking_token_expires_at"),
  notifiedAt: timestamp("notified_at"),             // when approval/rejection email was sent

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVendorApplicationSchema = createInsertSchema(vendorApplicationsTable)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVendorApplication = z.infer<typeof insertVendorApplicationSchema>;
export type VendorApplication = typeof vendorApplicationsTable.$inferSelect;
```

### `lib/db/src/schema/bookings.ts`
```typescript
import { pgTable, serial, text, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  checkoutId: text("checkout_id").notNull().unique(),
  whopPaymentId: text("whop_payment_id"),
  planId: text("plan_id").notNull(),
  vendorEmail: text("vendor_email"),
  vendorName: text("vendor_name"),
  vendorBusinessName: text("vendor_business_name"),
  boothNumber: text("booth_number"),
  boothType: text("booth_type"),         // e.g. "food_10x10", "retail_10x10"
  boothSize: text("booth_size"),         // e.g. "10x10", "10x20"
  marketDate: date("market_date"),
  marketDays: text("market_days"),       // e.g. "thursday,friday" or "all"
  marketLocation: text("market_location"), // "van_nuys" | "hollywood"
  overnightSecurity: boolean("overnight_security").default(false),
  overnightNights: integer("overnight_nights").default(0),
  amountPaid: integer("amount_paid"),    // in cents
  termsAgreed: boolean("terms_agreed").notNull().default(false),
  status: text("status").notNull().default("pending"), // pending | confirmed | cancelled
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
  amountRefunded: integer("amount_refunded").notNull(), // in cents
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
  boothType: text("booth_type").notNull(),   // e.g. "food_10x10", "food_10x20", "retail_10x10"
  label: text("label").notNull(),             // display name
  size: text("size").notNull(),               // "10x10" | "10x20"
  pricePerDay: integer("price_per_day").notNull(),   // in cents
  priceFourDay: integer("price_four_day"),           // in cents, null if no bundle
  whopPlanIdDaily: text("whop_plan_id_daily"),       // Whop plan for single day
  whopPlanIdFourDay: text("whop_plan_id_four_day"),  // Whop plan for 4-day bundle
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBoothPricingSchema = createInsertSchema(boothPricingTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBoothPricing = z.infer<typeof insertBoothPricingSchema>;
export type BoothPricing = typeof boothPricingTable.$inferSelect;
```

### `lib/db/src/schema/boothReservations.ts`
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
  uniqueBoothDate: unique("unique_booth_date_location").on(
    table.boothNumber,
    table.marketDate,
    table.marketLocation
  ),
}));
```

### `lib/db/src/schema/index.ts`
```typescript
export * from "./bookings";
export * from "./refundNotes";
export * from "./boothPricing";
export * from "./boothReservations";
```

---

## Startup seeding
On server startup, check if `booth_pricing` is empty and seed it. Whop plan IDs start as null — they get populated the first time a vendor goes to checkout for that booth type (lazy plan creation). Add `seed.ts` and call it from `src/index.ts` inside the `app.listen` callback.

```typescript
// Default seed — prices in cents
const defaults = [
  { boothType: "food_10x10",      label: "Food Vendor Booth 10×10",             size: "10x10", pricePerDay: 10000, priceFourDay: 40000 },
  { boothType: "food_10x20",      label: "Food Vendor Booth 10×20",             size: "10x20", pricePerDay: 15000, priceFourDay: 60000 },
  { boothType: "prepackaged_10x10", label: "Pre-Packaged Vendor Booth 10×10",   size: "10x10", pricePerDay: 7500,  priceFourDay: 30000 },
  { boothType: "retail_10x10",    label: "Retail Vendor Booth 10×10",           size: "10x10", pricePerDay: 5000,  priceFourDay: 20000 },
  { boothType: "information_10x10", label: "Information Booth 10×10",           size: "10x10", pricePerDay: 10000, priceFourDay: null  },
];
```

---

## API routes to build
All routes live under `/api` prefix.

### Whop routes (`artifacts/api-server/src/routes/whop.ts`)

**`POST /api/whop/checkout`**
Body: `{ booth_type, days, market_location, booth_number, market_date, overnight_security, overnight_nights, vendor_name, vendor_email, vendor_business_name }`
- Validate terms agreed (frontend must check before calling)
- Look up the correct Whop plan from `booth_pricing` table based on booth_type + whether days === "all" (4-day) or single
- If plan doesn't exist yet (null), create it via Whop API first, save plan ID to DB
- Check for active reservation (race condition guard — see section below)
- Create Whop checkoutConfiguration, return `{ checkout_id, purchase_url }`
- Insert pending reservation into `booth_reservations`

**`GET /api/whop/verify`**
Query: `{ checkout_id }` → verifies payment status with Whop

**`POST /api/whop/webhook`**
Raw body. Handles:
- `payment.completed` → update reservation status to confirmed, update booking record
- `membership.went_valid` → same

### Whop client (`artifacts/api-server/src/lib/whopClient.ts`)
```typescript
import WhopSDK from "@whop/sdk";
export function getWhopClient() {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error("WHOP_API_KEY is not set");
  return new WhopSDK({ apiKey: key });
}
```

### Whop plan creation (used lazily on first checkout per booth type)
```
POST https://api.whop.com/api/v2/plans
Authorization: Bearer <WHOP_API_KEY>
Content-Type: application/json

{
  "company_id": "biz_boYAUqKgviBMum",
  "product_id": "prod_DfqWDt9Ip5GMq",
  "plan_type": "one_time",
  "release_method": "buy_now",
  "initial_price": <dollars as number, e.g. 100>,
  "visibility": "hidden"
}
```

### Overnight security add-on
Overnight fee is $10/night. Since Whop plans are fixed amounts, calculate the total (booth price + overnight_nights × $10) and create a single Whop plan at the combined price if one doesn't exist at that exact amount. Store the combined-price plan ID in the booking record.

### Admin routes (`artifacts/api-server/src/routes/admin.ts`)
- `POST /api/admin/refunds` — body: `{ payment_id, amount?, notes }` → calls `POST https://api.whop.com/api/v1/payments/{id}/refund`, saves notes to `refund_notes`. Empty body = full refund, `{ amount: N }` in dollars = partial.
- `GET /api/admin/reports` — query: `{ from?, to? }` → fetches payments from Whop, joins local refund notes, returns summary stats + transaction list
- `GET /api/admin/reports/export` — CSV download with UTF-8 BOM. Columns: Date (PT), Payment ID, Vendor Name, Vendor Email, Booth Type, Booth #, Location, Days, Status, Gross ($), Whop Fee ($), Dev 3.5% ($), Refunded ($), Net ($), Refund Notes

### Pricing routes (`artifacts/api-server/src/routes/pricing.ts`)
- `GET /api/admin/pricing` → all rows from `booth_pricing`
- `PATCH /api/admin/pricing/:id` — body: `{ price_per_day?, price_four_day? }` → creates NEW Whop plan(s) at new price(s), updates DB record

---

## TWO-FLOW SYSTEM: Application → Approval → Booking → Payment

The system has two completely separate flows. Do NOT combine them.

---

### FLOW 1: Vendor Application (no payment)

Public-facing page at `/apply` (or linked from the main site).

Vendors fill out and submit the full application. No payment is taken here. Application is stored in the DB with status `pending_review`.

Admin receives an email notification of each new application.

**Application DB table: `vendor_applications`**
Store all fields from the application form (see Vendor Application Fields section). Key fields:
```typescript
status: text("status").default("pending_review")
// pending_review | approved | rejected | waitlisted
approvedAt: timestamp("approved_at")
approvedBy: text("approved_by")
rejectionReason: text("rejection_reason")
notifiedAt: timestamp("notified_at") // when approval email was sent
```

---

### FLOW 2: Booking + Payment (approved vendors only)

After admin approves an application, the system sends the vendor a **unique approval link** via email:
```
https://101nightmarket.com/book?token=<secure_token>
```

The token is a short-lived (7-day) signed JWT or random UUID stored in the DB linked to their application. When vendor clicks the link they land on the booking page — no login required, token authenticates them.

**Booking page flow:**
1. Token is validated — if expired or invalid, show "This link has expired. Please contact us."
2. Vendor sees their pre-filled info (name, business, booth type preference from application)
3. **Location selector** — Van Nuys / Hollywood (or pre-selected if application specified one)
4. **Floor map** — shows available booths for that location, filtered to the booth type they applied for
5. Vendor clicks a booth → panel opens:
   - Booth number + size confirmed
   - **Days selector** — Thu / Fri / Sat / Sun / All Days
   - **Overnight security add-on** — optional checkbox ($10/night)
   - **Price summary** — live total
   - **Terms & Conditions checkbox** — required (full text, see T&C section)
   - **"Proceed to Payment"** → calls `POST /api/whop/checkout` → redirect to Whop
6. After Whop payment → webhook fires → booking confirmed → booth marked taken → confirmation email sent to vendor

---

### FLOW 3: Admin Panel

Admin-only area (protect with a simple hardcoded admin password env var `ADMIN_PASSWORD` for now — no full auth system needed yet).

Admin pages:
- `/admin` — dashboard: pending applications count, recent bookings, quick stats
- `/admin/applications` — list all applications, filter by status, view full application details, Approve / Reject / Waitlist buttons. Approving sends the booking link email automatically.
- `/admin/bookings` — list all confirmed bookings, booth assignments, filter by location/date
- `/admin/reports` — financial reports with CSV export (see details below)
- `/admin/pricing` — edit booth pricing per type
- `/admin/floor-map` — view floor map with real-time booth status for each location

---

## Frontend pages to add (React + Vite)

### `/admin/reports` — Financial Reports page
- Date range picker (From / To) with quick buttons: This month, Last 30 days, All time
- Run Report button → calls `GET /api/admin/reports`
- 6 summary stat cards: Gross Revenue, Whop Fees, Dev Fee 3.5%, Refunded, Net to Business, Transaction count
- Transaction table: Date (PT), Vendor, Booth Type, Location, Days, Status badge, Gross, Whop Fee, Dev 3.5%, Net, Refund button
- Refund button opens modal: amount field (blank = full refund), required notes/reason textarea, Cancel + Refund buttons
- Export to Spreadsheet button → `GET /api/admin/reports/export`

### `/admin/pricing` — Booth Pricing page
- Lists all booth types
- Each row: label, size, daily price, 4-day bundle price, Edit button
- Edit mode: inline price inputs for daily + bundle, Save / Cancel
- Saving calls `PATCH /api/admin/pricing/:id`
- Explainer: "When you update a price, the system automatically creates a new plan on Whop. Existing bookings are not affected."

---

## Key architectural decisions (do not change these)

1. **Whop SDK refunds are read-only** — SDK has no `refunds.create`. Always use direct REST: `POST https://api.whop.com/api/v1/payments/{id}/refund`
2. **Whop plan prices cannot be updated via API** — always CREATE a new plan at the new price; old plan becomes orphaned
3. **Whop plans are created lazily** — created on first checkout for that booth type/price combo, plan ID stored in DB
4. **Refund reasons stored locally** — Whop has no notes field on refunds; store in `refund_notes` table
5. **Revenue split: 3.5% pre-fee** — developer added as team member at 3.5%. Do NOT give client Owner role in Whop — give them Operations role with Team, Company settings, Developer tools, and Checkout toggles OFF
6. **Whop plan visibility: hidden** — all programmatically created plans use `visibility: "hidden"`
7. **All prices stored in cents** (integer) in the DB — convert to dollars only at display/API boundary
8. **CSV export includes UTF-8 BOM** (`\uFEFF`) so Excel opens without encoding issues
9. **All times in Pacific Time** (`America/Los_Angeles`)
10. **Redirect URL for checkout** reads from `req.headers.origin` dynamically — works across all domains

---

## CRITICAL: Concurrent booking race condition prevention

**Problem:** Two vendors click the same booth simultaneously → both see it open → both pay → double booking.

**Solution: DB-level unique constraint + reservation lock**

1. Vendor clicks booth → server inserts a reservation row (15-min TTL)
2. Unique constraint on `(booth_number, market_date, market_location)` — only ONE insert wins at the DB level
3. Second vendor gets 409 → "This booth was just taken. Please choose another."
4. Payment webhook fires → reservation status → `confirmed`
5. Abandoned checkout → reservation expires after 15 min → booth returns to open

### Checkout route reservation logic
```typescript
// 1. Clean up expired reservations first
await db.update(boothReservationsTable)
  .set({ status: "expired" })
  .where(and(lt(boothReservationsTable.expiresAt, new Date()), eq(boothReservationsTable.status, "pending")));

// 2. Check for active reservation
const existing = await db.select().from(boothReservationsTable)
  .where(and(
    eq(boothReservationsTable.boothNumber, booth_number),
    eq(boothReservationsTable.marketDate, market_date),
    eq(boothReservationsTable.marketLocation, market_location),
    gt(boothReservationsTable.expiresAt, new Date()),
    ne(boothReservationsTable.status, "expired")
  )).limit(1);

if (existing.length > 0) {
  return res.status(409).json({ error: "This booth is currently being reserved. Please try again shortly or choose a different booth." });
}

// 3. Create Whop checkout first
const checkout = await createWhopCheckout(...);

// 4. Insert reservation — unique constraint is the real guard
try {
  await db.insert(boothReservationsTable).values({
    boothNumber: booth_number,
    marketDate: market_date,
    marketLocation: market_location,
    checkoutId: checkout.id,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    status: "pending",
  });
} catch (err) {
  // Unique constraint violation — another vendor just won the race
  return res.status(409).json({ error: "This booth was just taken by another vendor. Please choose a different booth." });
}

return res.json({ checkout_id: checkout.id, purchase_url: checkout.purchase_url });
```

### Floor map status logic (priority order)
1. Confirmed reservation → **taken** (red, unclickable)
2. Pending reservation + not expired → **pending** (yellow, unclickable, tooltip: "Being reserved...")
3. Otherwise → **open** (green, clickable)

### Frontend on booth click
- Immediately show loading spinner on that booth, disable the button
- 409 response → show inline error message, re-enable booth
- Success → redirect to Whop checkout URL

---

## Notification system
- Email only (no SMS)
- Use Resend for transactional email
- Send confirmation email to vendor on `payment.completed` webhook
- Send notification email to admin on every new booking
- All timestamps in Pacific Time (`America/Los_Angeles`)
