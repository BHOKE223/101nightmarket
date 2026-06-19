import { Router, type IRouter, type Request, type Response } from "express";
import express from "express";
import { db, boothPricingTable, boothReservationsTable, bookingsTable } from "@workspace/db";
import { eq, and, lt, gt, ne } from "drizzle-orm";
import { sendBookingConfirmation, sendAdminNewApplicationAlert } from "../lib/email.js";

const router: IRouter = Router();

const COMPANY_ID = () => {
  const id = process.env.WHOP_COMPANY_ID;
  if (!id) throw new Error("WHOP_COMPANY_ID env var is not set");
  return id;
};

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

async function getOrCreateWhopPlan(
  pricingId: number,
  priceInDollars: number,
  field: "whopPlanIdDaily" | "whopPlanIdFourDay",
  label: string
): Promise<string> {
  const [pricing] = await db.select().from(boothPricingTable).where(eq(boothPricingTable.id, pricingId));
  if (!pricing) throw new Error("Booth pricing not found");

  const existingPlanId = pricing[field];
  if (existingPlanId) return existingPlanId;

  const planRes = await whopFetch("/plans", {
    method: "POST",
    body: JSON.stringify({
      company_id: COMPANY_ID(),
      product_id: "prod_DfqWDt9Ip5GMq",
      plan_type: "one_time",
      release_method: "buy_now",
      initial_price: priceInDollars,
      visibility: "hidden",
      name: label,
    }),
  });

  const planData: any = await planRes.json().catch(() => ({}));
  if (!planRes.ok) throw new Error(planData?.error?.message ?? "Failed to create Whop plan");

  const newPlanId: string = planData.id;
  await db.update(boothPricingTable).set({ [field]: newPlanId, updatedAt: new Date() }).where(eq(boothPricingTable.id, pricingId));

  return newPlanId;
}

// POST /api/whop/checkout
router.post("/whop/checkout", async (req: Request, res: Response) => {
  try {
    const {
      booth_type,
      days,
      market_location,
      booth_number,
      market_date,
      overnight_security,
      overnight_nights,
      vendor_name,
      vendor_email,
      vendor_business_name,
      terms_agreed,
    } = req.body ?? {};

    if (!terms_agreed) {
      res.status(400).json({ error: "You must agree to the terms and conditions" });
      return;
    }

    if (!booth_type || !days || !market_location || !booth_number || !market_date) {
      res.status(400).json({ error: "booth_type, days, market_location, booth_number, and market_date are required" });
      return;
    }

    const [pricing] = await db.select().from(boothPricingTable).where(eq(boothPricingTable.boothType, booth_type));
    if (!pricing) {
      res.status(400).json({ error: `Unknown booth type: ${booth_type}` });
      return;
    }

    const isFourDay = days === "all";
    const basePriceCents = isFourDay ? (pricing.priceFourDay ?? pricing.pricePerDay * 4) : pricing.pricePerDay;
    const overnightCents = overnight_security ? (Number(overnight_nights) || 1) * 1000 : 0;
    const totalCents = basePriceCents + overnightCents;
    const totalDollars = totalCents / 100;

    const planField = isFourDay ? "whopPlanIdFourDay" : "whopPlanIdDaily";
    const planLabel = `${pricing.label} — ${isFourDay ? "4-Day Bundle" : "Single Day"}${overnight_security ? " + Security" : ""}`;

    let planId: string;
    if (overnightCents > 0) {
      // Combined price — create a custom plan at the total amount
      const planRes = await whopFetch("/plans", {
        method: "POST",
        body: JSON.stringify({
          company_id: COMPANY_ID(),
          product_id: "prod_DfqWDt9Ip5GMq",
          plan_type: "one_time",
          release_method: "buy_now",
          initial_price: totalDollars,
          visibility: "hidden",
          name: planLabel,
        }),
      });
      const planData: any = await planRes.json().catch(() => ({}));
      if (!planRes.ok) throw new Error(planData?.error?.message ?? "Failed to create Whop plan");
      planId = planData.id;
    } else {
      planId = await getOrCreateWhopPlan(pricing.id, totalDollars, planField as any, planLabel);
    }

    // Clean up expired reservations
    await db.update(boothReservationsTable)
      .set({ status: "expired" })
      .where(and(lt(boothReservationsTable.expiresAt, new Date()), eq(boothReservationsTable.status, "pending")));

    // Check for active reservation
    const existing = await db.select().from(boothReservationsTable)
      .where(and(
        eq(boothReservationsTable.boothNumber, booth_number),
        eq(boothReservationsTable.marketDate, market_date),
        eq(boothReservationsTable.marketLocation, market_location),
        gt(boothReservationsTable.expiresAt, new Date()),
        ne(boothReservationsTable.status, "expired"),
      )).limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "This booth is currently being reserved. Please try again shortly or choose a different booth." });
      return;
    }

    const origin = (req.headers.origin as string) ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
    const redirectUrl = `${origin}/booking/success`;

    const checkoutRes = await whopFetch("/checkout_configurations", {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        redirect_url: redirectUrl,
      }),
    });

    const checkoutData: any = await checkoutRes.json().catch(() => ({}));
    if (!checkoutRes.ok) throw new Error(checkoutData?.error?.message ?? "Failed to create checkout");

    const checkoutId: string = checkoutData.id;
    const purchaseUrl: string = checkoutData.checkout_url ?? checkoutData.purchase_url;

    // Insert pending booking record
    await db.insert(bookingsTable).values({
      checkoutId,
      planId,
      vendorEmail: vendor_email ?? null,
      vendorName: vendor_name ?? null,
      vendorBusinessName: vendor_business_name ?? null,
      boothNumber: booth_number,
      boothType: booth_type,
      boothSize: pricing.size,
      marketDate: market_date,
      marketDays: days,
      marketLocation: market_location,
      overnightSecurity: overnight_security ?? false,
      overnightNights: overnight_nights ?? 0,
      amountPaid: totalCents,
      termsAgreed: true,
      status: "pending",
    });

    // Insert reservation lock
    try {
      await db.insert(boothReservationsTable).values({
        boothNumber: booth_number,
        marketDate: market_date,
        marketLocation: market_location,
        checkoutId,
        vendorEmail: vendor_email ?? null,
        status: "pending",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    } catch {
      res.status(409).json({ error: "This booth was just taken by another vendor. Please choose a different booth." });
      return;
    }

    req.log.info({ checkoutId, booth_number, market_location }, "checkout created");
    res.json({ checkout_id: checkoutId, purchase_url: purchaseUrl });
  } catch (err: unknown) {
    req.log.error({ err }, "whop checkout error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/whop/booths?location=van_nuys&date=2026-07-10
router.get("/whop/booths", async (req: Request, res: Response) => {
  try {
    const { location, date } = req.query as { location?: string; date?: string };
    if (!location || !date) {
      res.status(400).json({ error: "location and date are required" });
      return;
    }

    await db.update(boothReservationsTable)
      .set({ status: "expired" })
      .where(and(lt(boothReservationsTable.expiresAt, new Date()), eq(boothReservationsTable.status, "pending")));

    const reservations = await db.select().from(boothReservationsTable)
      .where(and(
        eq(boothReservationsTable.marketLocation, location),
        eq(boothReservationsTable.marketDate, date),
        ne(boothReservationsTable.status, "expired"),
      ));

    const takenBooths = reservations.filter((r) => r.status === "confirmed").map((r) => r.boothNumber);
    const pendingBooths = reservations.filter((r) => r.status === "pending").map((r) => r.boothNumber);

    res.json({ taken: takenBooths, pending: pendingBooths });
  } catch (err: unknown) {
    req.log.error({ err }, "booths status error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/whop/verify?checkout_id=ch_xxx
router.get("/whop/verify", async (req: Request, res: Response) => {
  try {
    const checkoutId = req.query.checkout_id as string | undefined;
    if (!checkoutId) {
      res.status(400).json({ error: "checkout_id query param required" });
      return;
    }

    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.checkoutId, checkoutId));
    if (booking?.status === "confirmed") {
      res.json({ verified: true, booking });
      return;
    }

    const paymentsRes = await whopFetch(`/payments?company_id=${COMPANY_ID()}&checkout_configuration_ids[]=${checkoutId}`);
    const paymentsData: any = await paymentsRes.json().catch(() => ({ data: [] }));
    const payments: any[] = paymentsData.data ?? [];
    const verified = payments.some((p: any) => p.status === "paid" || p.status === "succeeded");

    res.json({ verified, booking: booking ?? null });
  } catch (err: unknown) {
    req.log.error({ err }, "whop verify error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/whop/webhook
router.post(
  "/whop/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    try {
      const raw = req.body as Buffer;
      const event = JSON.parse(raw.toString("utf8"));
      req.log.info({ action: event.action, id: event.data?.id }, "whop webhook received");

      if (event.action === "payment.completed" || event.action === "membership.went_valid") {
        const payment = event.data;
        const checkoutId = payment?.checkout_configuration_id ?? payment?.checkout_id;

        if (checkoutId) {
          const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.checkoutId, checkoutId));

          if (booking) {
            await db.update(bookingsTable)
              .set({ status: "confirmed", whopPaymentId: payment.id, updatedAt: new Date() })
              .where(eq(bookingsTable.checkoutId, checkoutId));

            await db.update(boothReservationsTable)
              .set({ status: "confirmed", whopPaymentId: payment.id })
              .where(eq(boothReservationsTable.checkoutId, checkoutId));

            if (booking.vendorEmail && booking.vendorName && booking.boothNumber) {
              sendBookingConfirmation(
                booking.vendorEmail,
                booking.vendorName,
                booking.boothNumber,
                booking.marketLocation ?? "",
                booking.marketDays ?? "",
                booking.amountPaid ?? 0
              ).catch(() => {});
            }

            req.log.info({ checkoutId, paymentId: payment.id }, "booking confirmed");
          }
        }
      }

      res.json({ received: true });
    } catch (err: unknown) {
      req.log.error({ err }, "whop webhook error");
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  },
);

export default router;
