import { Resend } from "resend";
import { logger } from "./logger.js";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

const FROM = "101 Night Market <noreply@101nightmarket.com>";

export async function sendMagicLink(email: string, url: string, type: "vendor" | "admin"): Promise<void> {
  const resend = getResend();
  const label = type === "admin" ? "Admin Portal" : "Vendor Portal";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your ${label} login link`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">101 Night Market</h2>
        <p style="color:#555;margin:0 0 24px">Click the button below to log into your ${label}. This link expires in 15 minutes.</p>
        <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">Log in to ${label}</a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
  logger.info({ email, type }, "magic link email sent");
}

export async function sendApprovalEmail(email: string, vendorName: string, bookingUrl: string): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "You've been approved for 101 Night Market! 🎉",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">Congratulations, ${vendorName}!</h2>
        <p style="color:#555;margin:0 0 16px">Your application to 101 Night Market has been approved. Click below to choose your booth and complete your booking.</p>
        <p style="color:#555;margin:0 0 24px">This link is valid for <strong>7 days</strong>.</p>
        <a href="${bookingUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">Book Your Booth</a>
        <p style="color:#aaa;font-size:12px;margin:24px 0 0">Questions? Reply to this email and we'll get back to you.</p>
      </div>
    `,
  });
  logger.info({ email }, "approval email sent");
}

export async function sendRejectionEmail(email: string, vendorName: string, reason: string): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Update on your 101 Night Market application",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">Thank you for applying, ${vendorName}</h2>
        <p style="color:#555;margin:0 0 16px">After careful review, we're unable to accept your application at this time.</p>
        ${reason ? `<p style="color:#555;margin:0 0 16px"><strong>Reason:</strong> ${reason}</p>` : ""}
        <p style="color:#555;margin:0">We appreciate your interest in 101 Night Market and encourage you to apply again in the future.</p>
      </div>
    `,
  });
  logger.info({ email }, "rejection email sent");
}

export async function sendBookingConfirmation(
  email: string,
  vendorName: string,
  boothNumber: string,
  location: string,
  days: string,
  amount: number
): Promise<void> {
  const resend = getResend();
  const locationLabel = location === "hollywood" ? "Hollywood (Walk of Fame)" : "Van Nuys (16955 Sherman Way)";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Booking Confirmed — 101 Night Market",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">You're booked! 🎉</h2>
        <p style="color:#555;margin:0 0 24px">Hi ${vendorName}, your booth reservation is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Booth</td><td style="padding:8px 0;font-weight:600">${boothNumber}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Location</td><td style="padding:8px 0;font-weight:600">${locationLabel}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Days</td><td style="padding:8px 0;font-weight:600">${days}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:14px">Amount Paid</td><td style="padding:8px 0;font-weight:600">$${(amount / 100).toFixed(2)}</td></tr>
        </table>
        <p style="color:#555;font-size:13px">Hours: 5:00 PM – 11:00 PM. Please arrive by 4:30 PM for setup.</p>
      </div>
    `,
  });
  logger.info({ email }, "booking confirmation email sent");
}

export async function sendAdminNewApplicationAlert(businessName: string, email: string, location: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New vendor application: ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">New Application Received</h2>
        <p style="color:#555;margin:0 0 16px"><strong>${businessName}</strong> has applied for the ${location === "hollywood" ? "Hollywood" : "Van Nuys"} location.</p>
        <p style="color:#555;margin:0 0 24px">Applicant email: ${email}</p>
        <a href="${process.env.ADMIN_URL ?? "https://101nightmarket.com"}/admin/applications" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">Review Application</a>
      </div>
    `,
  });
}
