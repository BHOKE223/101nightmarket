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
