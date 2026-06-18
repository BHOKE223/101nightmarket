import { Router, type IRouter, type Request, type Response } from "express";
import { db, refundNotesTable } from "@workspace/db";

const router: IRouter = Router();

const COMPANY_ID = () => {
  const id = process.env.WHOP_COMPANY_ID;
  if (!id) throw new Error("WHOP_COMPANY_ID env var is not set");
  return id;
};

const whopFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`https://api.whop.com/api/v1${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });

// ─── POST /api/admin/refunds ───────────────────────────────────────────────
// Body: { payment_id, amount?: number (dollars, omit for full), notes }
router.post("/admin/refunds", async (req: Request, res: Response) => {
  try {
    const { payment_id, amount, notes } = req.body ?? {};

    if (!payment_id || !notes?.trim()) {
      res.status(400).json({ error: "payment_id and notes are required" });
      return;
    }

    // Full refund = no body; partial = { amount }
    const refundBody = amount ? JSON.stringify({ amount: Number(amount) }) : "{}";

    const refundRes = await whopFetch(`/payments/${payment_id}/refund`, {
      method: "POST",
      body: refundBody,
    });

    const refundData: any = await refundRes.json().catch(() => ({}));

    if (!refundRes.ok) {
      res.status(refundRes.status).json({
        error: refundData?.error?.message ?? "Refund failed on Whop",
      });
      return;
    }

    const amountCents = Math.round((amount ?? refundData?.amount ?? 0) * 100);

    await db.insert(refundNotesTable).values({
      whopPaymentId: payment_id,
      whopRefundId: refundData?.id ?? null,
      amountRefunded: amountCents,
      notes: notes.trim(),
      issuedBy: "admin",
    });

    req.log.info({ payment_id, refundId: refundData?.id, amount }, "refund issued");
    res.json({ success: true, refund: refundData });
  } catch (err: unknown) {
    req.log.error({ err }, "admin refund error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /api/admin/reports ────────────────────────────────────────────────
// Query: { from?: ISO date string, to?: ISO date string }
router.get("/admin/reports", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const co = COMPANY_ID();

    let paymentsUrl = `https://api.whop.com/api/v1/payments?company_id=${co}&order=created_at&direction=desc&first=200`;
    if (from) paymentsUrl += `&created_after=${encodeURIComponent(from)}`;
    if (to) paymentsUrl += `&created_before=${encodeURIComponent(to)}`;

    let refundsUrl = `https://api.whop.com/api/v1/refunds?company_id=${co}&first=200`;
    if (from) refundsUrl += `&created_after=${encodeURIComponent(from)}`;
    if (to) refundsUrl += `&created_before=${encodeURIComponent(to)}`;

    const [paymentsRes, refundsRes, localNotes] = await Promise.all([
      whopFetch(paymentsUrl.replace("https://api.whop.com/api/v1", "")),
      whopFetch(refundsUrl.replace("https://api.whop.com/api/v1", "")),
      db.select().from(refundNotesTable),
    ]);

    const payments: any[] = (await paymentsRes.json().catch(() => ({ data: [] }))).data ?? [];
    const whopRefunds: any[] = (await refundsRes.json().catch(() => ({ data: [] }))).data ?? [];

    const notesByPaymentId = new Map(localNotes.map((n) => [n.whopPaymentId, n]));
    const refunds = whopRefunds.map((r: any) => ({
      ...r,
      notes: notesByPaymentId.get(r.payment_id ?? r.id)?.notes ?? null,
    }));

    const totalGross = payments.reduce((s, p) => s + (p.final_amount ?? 0), 0);
    const totalFees = payments.reduce((s, p) => s + (p.fee_amount ?? 0), 0);
    const totalRefunded = whopRefunds.reduce((s, r) => s + (r.amount ?? 0), 0);
    const devFeeTotal = Math.round(totalGross * 0.035 * 100) / 100;
    const netRevenue = Math.round((totalGross - totalFees - devFeeTotal - totalRefunded) * 100) / 100;

    res.json({
      summary: { totalGross, totalFees, devFeeTotal, totalRefunded, netRevenue, paymentCount: payments.length, refundCount: whopRefunds.length },
      payments,
      refunds,
    });
  } catch (err: unknown) {
    req.log.error({ err }, "admin reports error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /api/admin/reports/export ────────────────────────────────────────
// Returns a CSV file download
router.get("/admin/reports/export", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const co = COMPANY_ID();

    let url = `https://api.whop.com/api/v1/payments?company_id=${co}&order=created_at&direction=desc&first=500`;
    if (from) url += `&created_after=${encodeURIComponent(from)}`;
    if (to) url += `&created_before=${encodeURIComponent(to)}`;

    const [paymentsRes, localNotes] = await Promise.all([
      whopFetch(url.replace("https://api.whop.com/api/v1", "")),
      db.select().from(refundNotesTable),
    ]);

    const payments: any[] = (await paymentsRes.json().catch(() => ({ data: [] }))).data ?? [];
    const notesByPaymentId = new Map(localNotes.map((n) => [n.whopPaymentId, n]));

    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const headers = [
      "Date (PT)",
      "Payment ID",
      "Vendor Email",
      "Status",
      "Gross ($)",
      "Whop Fee ($)",
      "Dev Fee 3.5% ($)",
      "Refunded ($)",
      "Net to Business ($)",
      "Refund Notes",
    ];

    const rows = payments.map((p: any) => {
      const gross = p.final_amount ?? 0;
      const whopFee = p.fee_amount ?? 0;
      const devFee = Math.round(gross * 0.035 * 100) / 100;
      const note = notesByPaymentId.get(p.id);
      const refunded = note ? note.amountRefunded / 100 : 0;
      const net = Math.round((gross - whopFee - devFee - refunded) * 100) / 100;

      return [
        p.created_at
          ? new Date(p.created_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
          : "",
        p.id ?? "",
        p.user?.email ?? "",
        p.status ?? "",
        gross.toFixed(2),
        whopFee.toFixed(2),
        devFee.toFixed(2),
        refunded.toFixed(2),
        net.toFixed(2),
        note?.notes ?? "",
      ].map(esc);
    });

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\r\n");
    const slug = [from ?? "all", "to", to ?? "now"].join("-").replace(/[^a-z0-9-]/gi, "-");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="101-nightmarket-${slug}.csv"`);
    res.send("\uFEFF" + csv); // BOM for Excel UTF-8
  } catch (err: unknown) {
    req.log.error({ err }, "admin export error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
