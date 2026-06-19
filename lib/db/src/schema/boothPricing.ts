import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const boothPricingTable = pgTable("booth_pricing", {
  id: serial("id").primaryKey(),
  boothType: text("booth_type").notNull().unique(),
  label: text("label").notNull(),
  size: text("size").notNull(),
  pricePerDay: integer("price_per_day").notNull(),
  priceFourDay: integer("price_four_day"),
  whopPlanIdDaily: text("whop_plan_id_daily"),
  whopPlanIdFourDay: text("whop_plan_id_four_day"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBoothPricingSchema = createInsertSchema(boothPricingTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBoothPricing = z.infer<typeof insertBoothPricingSchema>;
export type BoothPricing = typeof boothPricingTable.$inferSelect;
