import { Router, type IRouter, type Request, type Response } from "express";
import { db, vendorApplicationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { sendApprovalEmail, sendRejectionEmail, sendAdminNewApplicationAlert } from "../lib/email.js";

const router: IRouter = Router();

// POST /api/applications — submit a vendor application
router.post("/applications", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    const required = ["businessName", "contactFirstName", "contactLastName", "email", "phone",
      "location", "generalCategory", "categoryDetails", "boothType", "businessDescription"];

    for (const field of required) {
      if (!body[field]?.trim?.()) {
        res.status(400).json({ error: `${field} is required` });
        return;
      }
    }

    if (!body.agreedToRules) {
      res.status(400).json({ error: "You must agree to the rules" });
      return;
    }

    const [application] = await db.insert(vendorApplicationsTable).values({
      businessName: body.businessName.trim(),
      contactFirstName: body.contactFirstName.trim(),
      contactLastName: body.contactLastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      location: body.location,
      hollywoodWhySelected: body.hollywoodWhySelected?.trim() ?? null,
      generalCategory: body.generalCategory,
      categoryDetails: body.categoryDetails,
      boothType: body.boothType,
      businessDescription: body.businessDescription.trim(),
      menuItems: body.menuItems?.trim() ?? null,
      photoUrls: body.photoUrls ?? null,
      instagramUrl: body.instagramUrl?.trim() ?? null,
      instagramFollowerCount: body.instagramFollowerCount ?? null,
      hasGenerator: body.hasGenerator ?? null,
      hasParticipatedBefore: body.hasParticipatedBefore ?? null,
      spaceRequirements: body.spaceRequirements?.trim() ?? null,
      preferredStartDate: body.preferredStartDate ?? null,
      availableDays: body.availableDays ?? null,
      howHeard: body.howHeard ?? null,
      agreedToRules: true,
      status: "pending_review",
    }).returning();

    // Fire-and-forget admin alert
    sendAdminNewApplicationAlert(body.businessName, body.email, body.location).catch(() => {});

    req.log.info({ id: application.id, email: body.email }, "vendor application submitted");
    res.status(201).json({ success: true, id: application.id });
  } catch (err: unknown) {
    req.log.error({ err }, "application submit error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/admin/applications — list all applications
router.get("/admin/applications", async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    let query = db.select().from(vendorApplicationsTable).orderBy(desc(vendorApplicationsTable.createdAt));
    const applications = await query;
    const filtered = status ? applications.filter((a) => a.status === status) : applications;
    res.json({ applications: filtered });
  } catch (err: unknown) {
    req.log.error({ err }, "admin applications list error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/admin/applications/:id
router.get("/admin/applications/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [application] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, id));
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    res.json({ application });
  } catch (err: unknown) {
    req.log.error({ err }, "admin application detail error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/admin/applications/:id/approve
router.post("/admin/applications/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [application] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, id));

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const bookingToken = crypto.randomUUID().replace(/-/g, "");
    const bookingTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const origin = (req.headers.origin as string) ?? `https://${process.env.REPLIT_DEV_DOMAIN}`;
    const bookingUrl = `${origin}/book?token=${bookingToken}`;

    await db.update(vendorApplicationsTable)
      .set({
        status: "approved",
        approvedAt: new Date(),
        approvedBy: "admin",
        bookingToken,
        bookingTokenExpiresAt,
        notifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vendorApplicationsTable.id, id));

    await sendApprovalEmail(
      application.email,
      `${application.contactFirstName} ${application.contactLastName}`,
      bookingUrl
    );

    req.log.info({ id, email: application.email }, "application approved");
    res.json({ success: true, bookingUrl });
  } catch (err: unknown) {
    req.log.error({ err }, "application approve error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/admin/applications/:id/reject
router.post("/admin/applications/:id/reject", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body ?? {};

    if (!reason?.trim()) {
      res.status(400).json({ error: "A rejection reason is required" });
      return;
    }

    const [application] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, id));
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await db.update(vendorApplicationsTable)
      .set({
        status: "rejected",
        rejectionReason: reason.trim(),
        notifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vendorApplicationsTable.id, id));

    await sendRejectionEmail(
      application.email,
      `${application.contactFirstName} ${application.contactLastName}`,
      reason.trim()
    );

    req.log.info({ id, email: application.email }, "application rejected");
    res.json({ success: true });
  } catch (err: unknown) {
    req.log.error({ err }, "application reject error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/admin/applications/:id/waitlist
router.post("/admin/applications/:id/waitlist", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [application] = await db.select().from(vendorApplicationsTable).where(eq(vendorApplicationsTable.id, id));
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await db.update(vendorApplicationsTable)
      .set({ status: "waitlisted", updatedAt: new Date() })
      .where(eq(vendorApplicationsTable.id, id));

    req.log.info({ id }, "application waitlisted");
    res.json({ success: true });
  } catch (err: unknown) {
    req.log.error({ err }, "application waitlist error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/booking/validate?token=xxx — validate a booking token
router.get("/booking/validate", async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token?: string };
    if (!token) {
      res.status(400).json({ error: "token required" });
      return;
    }

    const [application] = await db.select().from(vendorApplicationsTable)
      .where(eq(vendorApplicationsTable.bookingToken, token));

    if (!application) {
      res.status(404).json({ error: "Invalid token" });
      return;
    }

    if (!application.bookingTokenExpiresAt || application.bookingTokenExpiresAt < new Date()) {
      res.status(410).json({ error: "This booking link has expired. Please contact us." });
      return;
    }

    if (application.status !== "approved") {
      res.status(403).json({ error: "This link is no longer valid." });
      return;
    }

    res.json({
      valid: true,
      application: {
        id: application.id,
        businessName: application.businessName,
        contactFirstName: application.contactFirstName,
        contactLastName: application.contactLastName,
        email: application.email,
        location: application.location,
        boothType: application.boothType,
        availableDays: application.availableDays,
      },
    });
  } catch (err: unknown) {
    req.log.error({ err }, "booking validate error");
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
