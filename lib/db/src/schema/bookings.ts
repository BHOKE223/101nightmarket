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
