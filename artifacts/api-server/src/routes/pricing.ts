import { Router, type IRouter, type Request, type Response } from "express";
import { db, boothPricingTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const whopFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`https://api.whop.com/api/v2${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });

async function createWhopPlan(priceInDollars: number, name: string): Promise<string> {
  const planRes = await whopFetch("/plans", {
    method: "POST",
    body: JSON.stringify({
      company_id: process.env.WHOP_COMPANY_ID,
      product_id: "prod_DfqWDt9Ip5GMq",
      plan_type: "one_time",
      release_method: "buy_now",
      initial_price: priceInDollars,
      visibility: "hidden",
      name,
    }),
  });
  const planData: any = await planRes.json().catch(() => ({}));
  if (!planRes.ok) throw new Error(planData?.error?.message ?? "Failed to create Whop plan");
  return planData.id;
}

// GET /api/admin/pricing
router.get("/admin/pricing", async (req: Request, res: Response) => {
  try {
    const pricing = await db.select().from(boothPricingTable).orderBy(boothPricingTable.id);
    res.json({ pricing });
  } catch (err: unknown) {
    req.log.error({ err }, "pricing list error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/pricing/public — for the booking form
router.get("/pricing/public", async (req: Request, res: Response) => {
  try {
    const pricing = await db.select().from(boothPricingTable)
      .where(eq(boothPricingTable.active, true))
      .orderBy(boothPricingTable.id);
    res.json({ pricing });
  } catch (err: unknown) {
    req.log.error({ err }, "public pricing error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// PATCH /api/admin/pricing/:id
// Body: { price_per_day?: number (dollars), price_four_day?: number (dollars) }
router.patch("/admin/pricing/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { price_per_day, price_four_day } = req.body ?? {};

    if (!id) {
      res.status(400).json({ error: "Valid id required" });
      return;
    }

    const [existing] = await db.select().from(boothPricingTable).where(eq(boothPricingTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Booth pricing record not found" });
      return;
    }

    const updates: Record<string, any> = { updatedAt: new Date() };

    if (price_per_day !== undefined) {
      const newCents = Math.round(Number(price_per_day) * 100);
      if (isNaN(newCents) || newCents < 100) {
        res.status(400).json({ error: "price_per_day must be at least $1" });
        return;
      }
      if (newCents !== existing.pricePerDay) {
        const planId = await createWhopPlan(price_per_day, `${existing.label} — Single Day`);
        updates.pricePerDay = newCents;
        updates.whopPlanIdDaily = planId;
      }
    }

    if (price_four_day !== undefined) {
      const newCents = Math.round(Number(price_four_day) * 100);
      if (isNaN(newCents) || newCents < 100) {
        res.status(400).json({ error: "price_four_day must be at least $1" });
        return;
      }
      if (newCents !== existing.priceFourDay) {
        const planId = await createWhopPlan(price_four_day, `${existing.label} — 4-Day Bundle`);
        updates.priceFourDay = newCents;
        updates.whopPlanIdFourDay = planId;
      }
    }

    await db.update(boothPricingTable).set(updates).where(eq(boothPricingTable.id, id));
    const [updated] = await db.select().from(boothPricingTable).where(eq(boothPricingTable.id, id));

    req.log.info({ id, updates }, "booth pricing updated");
    res.json({ success: true, pricing: updated });
  } catch (err: unknown) {
    req.log.error({ err }, "pricing update error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
