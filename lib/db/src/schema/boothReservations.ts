import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const boothReservationsTable = pgTable("booth_reservations", {
  id: serial("id").primaryKey(),
  boothNumber: text("booth_number").notNull(),
  marketDate: text("market_date").notNull(),
  marketLocation: text("market_location").notNull(),
  checkoutId: text("checkout_id").notNull().unique(),
  whopPaymentId: text("whop_payment_id"),
  vendorEmail: text("vendor_email"),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueBoothDateLocation: unique("unique_booth_date_location").on(
    table.boothNumber,
    table.marketDate,
    table.marketLocation
  ),
}));

export type BoothReservation = typeof boothReservationsTable.$inferSelect;
