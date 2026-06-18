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
