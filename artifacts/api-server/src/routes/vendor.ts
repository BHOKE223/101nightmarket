import { Router, type IRouter, type Request, type Response } from "express";
import { db, bookingsTable, boothReservationsTable, sessionsTable } from "@workspace/db";
import { eq, and, gt, desc } from "drizzle-orm";
import { parseCookies } from "./auth.js";

const router: IRouter = Router();

async function requireVendorSession(req: Request, res: Response): Promise<{ email: string } | null> {
  const sessionToken = parseCookies(req.headers.cookie ?? "").session;
  if (!sessionToken) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }

  const [session] = await db.select().from(sessionsTable)
    .where(and(
      eq(sessionsTable.token, sessionToken),
      eq(sessionsTable.type, "vendor"),
      gt(sessionsTable.expiresAt, new Date()),
    ));

  if (!session) {
    res.status(401).json({ error: "Session expired" });
    return null;
  }

  return { email: session.email };
}

// GET /api/vendor/bookings — all bookings for the authenticated vendor
router.get("/vendor/bookings", async (req: Request, res: Response) => {
  try {
    const user = await requireVendorSession(req, res);
    if (!user) return;

    const vendorBookings = await db.select().from(bookingsTable)
      .where(eq(bookingsTable.vendorEmail, user.email))
      .orderBy(desc(bookingsTable.createdAt));

    res.json({ bookings: vendorBookings });
  } catch (err: unknown) {
    req.log.error({ err }, "vendor bookings error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
