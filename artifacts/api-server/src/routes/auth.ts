import { Router, type IRouter, type Request, type Response } from "express";
import { db, magicTokensTable, sessionsTable, adminsTable, vendorApplicationsTable, bookingsTable } from "@workspace/db";
import { eq, and, gt, isNotNull } from "drizzle-orm";
import { sendMagicLink } from "../lib/email.js";

const router: IRouter = Router();

function randomToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

function getBaseUrl(req: Request): string {
  const origin = (req.headers.origin as string) ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return origin;
}

// POST /api/auth/magic-link
// Body: { email, type: "vendor" | "admin" }
router.post("/auth/magic-link", async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body ?? {};

    if (!email || !["vendor", "admin"].includes(type)) {
      res.status(400).json({ error: "email and type (vendor|admin) are required" });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (type === "admin") {
      const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.email, normalizedEmail));
      if (!admin) {
        // Don't reveal whether email exists
        res.json({ success: true });
        return;
      }
    }

    if (type === "vendor") {
      // Vendor must have at least one confirmed booking
      const [booking] = await db.select().from(bookingsTable)
        .where(and(eq(bookingsTable.vendorEmail, normalizedEmail), eq(bookingsTable.status, "confirmed")))
        .limit(1);
      if (!booking) {
        res.json({ success: true });
        return;
      }
    }

    const token = randomToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(magicTokensTable).values({
      email: normalizedEmail,
      token,
      type,
      expiresAt,
    });

    const base = getBaseUrl(req);
    const url = `${base}/api/auth/verify?token=${token}`;
    await sendMagicLink(normalizedEmail, url, type as "vendor" | "admin");

    res.json({ success: true });
  } catch (err: unknown) {
    req.log.error({ err }, "magic link error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/auth/verify?token=xxx
router.get("/auth/verify", async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token?: string };

    if (!token) {
      res.status(400).send("Missing token");
      return;
    }

    const [magicToken] = await db.select().from(magicTokensTable)
      .where(and(
        eq(magicTokensTable.token, token),
        gt(magicTokensTable.expiresAt, new Date()),
      ));

    if (!magicToken || magicToken.usedAt) {
      const base = getBaseUrl(req);
      const type = magicToken?.type ?? "vendor";
      const loginPath = type === "admin" ? "/admin/login" : "/portal/login";
      res.redirect(`${base}${loginPath}?error=expired`);
      return;
    }

    // Mark token as used
    await db.update(magicTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(magicTokensTable.id, magicToken.id));

    // Create session (7 days)
    const sessionToken = randomToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(sessionsTable).values({
      email: magicToken.email,
      token: sessionToken,
      type: magicToken.type,
      expiresAt,
    });

    const base = getBaseUrl(req);
    const redirectPath = magicToken.type === "admin" ? "/admin" : "/portal";

    res.setHeader("Set-Cookie", `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);
    res.redirect(`${base}${redirectPath}`);
  } catch (err: unknown) {
    req.log.error({ err }, "auth verify error");
    res.status(500).send("Authentication failed");
  }
});

// GET /api/auth/me
router.get("/auth/me", async (req: Request, res: Response) => {
  try {
    const sessionToken = parseCookies(req.headers.cookie ?? "").session;

    if (!sessionToken) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const [session] = await db.select().from(sessionsTable)
      .where(and(
        eq(sessionsTable.token, sessionToken),
        gt(sessionsTable.expiresAt, new Date()),
      ));

    if (!session) {
      res.status(401).json({ error: "Session expired" });
      return;
    }

    res.json({ email: session.email, type: session.type });
  } catch (err: unknown) {
    req.log.error({ err }, "auth/me error");
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", async (req: Request, res: Response) => {
  try {
    const sessionToken = parseCookies(req.headers.cookie ?? "").session;
    if (sessionToken) {
      await db.delete(sessionsTable).where(eq(sessionsTable.token, sessionToken));
    }
    res.setHeader("Set-Cookie", "session=; Path=/; HttpOnly; Max-Age=0");
    res.json({ success: true });
  } catch (err: unknown) {
    req.log.error({ err }, "logout error");
    res.status(500).json({ error: "Server error" });
  }
});

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
}

export { parseCookies };
export default router;
