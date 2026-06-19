import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import { getWhopClient } from "../lib/whopClient.js";

const router: IRouter = Router();

const COMPANY_ID = () => {
  const id = process.env.WHOP_COMPANY_ID;
  if (!id) throw new Error("WHOP_COMPANY_ID env var is not set");
  return id;
};

// POST /api/whop/checkout
// Body: { plan_id?: string }
// Returns: { checkout_id, purchase_url }
router.post("/whop/checkout", async (req: Request, res: Response) => {
  try {
    const planId: string | undefined = req.body?.plan_id ?? process.env.WHOP_PLAN_ID;
    if (!planId) {
      res.status(400).json({ error: "plan_id required (or set WHOP_PLAN_ID env var)" });
      return;
    }

    const origin =
      (req.headers.origin as string) ??
      `https://${process.env.REPLIT_DEV_DOMAIN}`;
    const redirectUrl = `${origin}/booking/success`;

    const whop = getWhopClient();
    const config = await (whop.checkoutConfigurations as any).create({
      plan_id: planId,
      redirect_url: redirectUrl,
    });

    res.json({
      checkout_id: (config as any).id,
      purchase_url: (config as any).purchase_url,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "whop checkout error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/whop/verify?checkout_id=ch_xxx
// Returns: { verified: boolean, payments: [] }
router.get("/whop/verify", async (req: Request, res: Response) => {
  try {
    const checkoutId = req.query.checkout_id as string | undefined;
    if (!checkoutId) {
      res.status(400).json({ error: "checkout_id query param required" });
      return;
    }

    const whop = getWhopClient();
    const result = await (whop.payments as any).list({
      company_id: COMPANY_ID(),
      checkout_configuration_ids: [checkoutId],
    });

    const payments: any[] = result?.data ?? [];
    const verified = payments.some(
      (p: any) => p.status === "paid" || p.status === "succeeded",
    );

    res.json({ verified, payments });
  } catch (err: unknown) {
    req.log.error({ err }, "whop verify error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/whop/webhook
// Raw body required for signature verification
router.post(
  "/whop/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    try {
      const raw = req.body as Buffer;
      const event = JSON.parse(raw.toString("utf8"));

      req.log.info({ action: event.action, id: event.data?.id }, "whop webhook received");

      switch (event.action) {
        case "payment.completed":
        case "membership.went_valid":
          req.log.info({ paymentId: event.data?.id }, "✅ Whop payment confirmed via webhook");
          // TODO: mark booking as paid in DB
          break;
        default:
          req.log.info({ action: event.action }, "unhandled whop webhook action");
      }

      res.json({ received: true });
    } catch (err: unknown) {
      req.log.error({ err }, "whop webhook error");
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  },
);

export default router;
