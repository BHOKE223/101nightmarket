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

// ─── GET /api/admin/pricing ────────────────────────────────────────────────
router.get("/admin/pricing", async (req: Request, res: Response) => {
  try {
    const pricing = await db
      .select()
      .from(boothPricingTable)
      .orderBy(boothPricingTable.location, boothPricingTable.boothType);
    res.json({ pricing });
  } catch (err: unknown) {
    req.log.error({ err }, "pricing list error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── PATCH /api/admin/pricing/:id ─────────────────────────────────────────
// Body: { price: number }
// Creates a new Whop plan at the new price, updates the DB record
router.patch("/admin/pricing/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const newPrice = Number(req.body?.price);

    if (!id || isNaN(newPrice) || newPrice < 1) {
      res.status(400).json({ error: "Valid id and price are required" });
      return;
    }

    const [existing] = await db
      .select()
      .from(boothPricingTable)
      .where(eq(boothPricingTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Booth pricing record not found" });
      return;
    }

    if (existing.price === newPrice) {
      res.json({ message: "Price unchanged", whopPlanId: existing.whopPlanId });
      return;
    }

    // Create a new Whop plan at the new price
    const planRes = await whopFetch("/plans", {
      method: "POST",
      body: JSON.stringify({
        company_id: process.env.WHOP_COMPANY_ID,
        product_id: "prod_DfqWDt9Ip5GMq",
        plan_type: "one_time",
        release_method: "buy_now",
        initial_price: newPrice,
        visibility: "hidden",
      }),
    });

    const planData: any = await planRes.json().catch(() => ({}));
    if (!planRes.ok) {
      res.status(planRes.status).json({
        error: planData?.error?.message ?? "Failed to create Whop plan",
      });
      return;
    }

    const newPlanId: string = planData.id;

    await db
      .update(boothPricingTable)
      .set({ price: newPrice, whopPlanId: newPlanId, updatedAt: new Date() })
      .where(eq(boothPricingTable.id, id));

    req.log.info({ id, oldPrice: existing.price, newPrice, newPlanId }, "booth price updated");
    res.json({ success: true, price: newPrice, whopPlanId: newPlanId });
  } catch (err: unknown) {
    req.log.error({ err }, "pricing update error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
