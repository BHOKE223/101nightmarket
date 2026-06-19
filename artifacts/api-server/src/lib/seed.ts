import { db, boothPricingTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { logger } from "./logger.js";

const DEFAULT_PRICING = [
  { location: "van_nuys",  boothType: "standard", label: "Van Nuys Standard Booth",  price: 85,  whopPlanId: "plan_4EsQToHGWlEqN" },
  { location: "van_nuys",  boothType: "endcap",   label: "Van Nuys Endcap Booth",    price: 120, whopPlanId: "plan_AGBR2EFAs1NhP" },
  { location: "hollywood", boothType: "standard", label: "Hollywood Standard Booth", price: 95,  whopPlanId: "plan_yAGFGeDwZbCgD" },
  { location: "hollywood", boothType: "endcap",   label: "Hollywood Endcap Booth",   price: 135, whopPlanId: "plan_z8hqmTXZ7iKNM" },
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
