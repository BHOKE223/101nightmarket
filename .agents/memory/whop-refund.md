---
name: Whop Refund Endpoint
description: How to issue refunds via Whop REST API — SDK is read-only for refunds.
---

The Whop SDK's `refunds` resource only has `list` and `retrieve`. No `create` method.

**Correct endpoint:** `POST https://api.whop.com/api/v1/payments/{payment_id}/refund`

- Full refund: send empty body `{}`
- Partial refund: send `{ "amount": 25.00 }` (dollars, not cents)
- Always attach `Authorization: Bearer <WHOP_API_KEY>` header

**Why:** Discovered by probing the API — `/api/v1/refunds` (POST) returns 404, `/memberships/{id}/refund` also 404. The `payments/{id}/refund` path returns 400 with a real payment ID issue (not 404), confirming it exists.

**How to apply:** In any refund route, go directly to the payments refund endpoint, not through the SDK or memberships path.

**Local notes storage:** Whop refund records don't store a reason/notes field. We persist those to `refund_notes` table in our DB, keyed by `whop_payment_id`. Always insert a row after a successful Whop refund call.
