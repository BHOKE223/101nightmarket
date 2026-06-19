import { db, boothPricingTable, adminsTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { logger } from "./logger.js";

const DEFAULT_PRICING = [
  { boothType: "food_10x10",        label: "Food Vendor Booth 10×10",           size: "10x10", pricePerDay: 10000, priceFourDay: 40000 },
  { boothType: "food_10x20",        label: "Food Vendor Booth 10×20",           size: "10x20", pricePerDay: 15000, priceFourDay: 60000 },
  { boothType: "prepackaged_10x10", label: "Pre-Packaged Vendor Booth 10×10",   size: "10x10", pricePerDay: 7500,  priceFourDay: 30000 },
  { boothType: "retail_10x10",      label: "Retail Vendor Booth 10×10",         size: "10x10", pricePerDay: 5000,  priceFourDay: 20000 },
  { boothType: "information_10x10", label: "Information Booth 10×10",           size: "10x10", pricePerDay: 10000, priceFourDay: null  },
];

export async function seedDefaultPricing(): Promise<void> {
  try {
    const [{ value }] = await db.select({ value: count() }).from(boothPricingTable);
    if (Number(value) > 0) return;

    await db.insert(boothPricingTable).values(
      DEFAULT_PRICING.map((p) => ({ ...p, active: true }))
    );
    logger.info("Seeded default booth pricing (%d rows)", DEFAULT_PRICING.length);
  } catch (err) {
    logger.error({ err }, "Failed to seed booth pricing — continuing anyway");
  }
}

export async function seedDefaultAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  try {
    const [{ value }] = await db.select({ value: count() }).from(adminsTable);
    if (Number(value) > 0) return;

    await db.insert(adminsTable).values({ email: adminEmail, name: "Admin" });
    logger.info("Seeded default admin: %s", adminEmail);
  } catch (err) {
    logger.error({ err }, "Failed to seed admin — continuing anyway");
  }
}
