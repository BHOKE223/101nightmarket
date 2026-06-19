---
name: Whop Payment Setup
description: Whop API integration details for 101 Night Market vendor portal — credentials approach, plan creation, and known quirks.
---

## Credential approach
Whop is NOT available as a Replit connector integration — the MCP proxy returns 401 for "whop" connector. Use direct Whop REST API with `WHOP_API_KEY` and `WHOP_COMPANY_ID` secrets instead. The whopClient.ts in the API server initializes `new Whop({ apiKey })` directly.

**Why:** `searchIntegrations("whop")` returns nothing (only the unrelated Whoop fitness tracker). The OpenInt proxy at REPLIT_CONNECTORS_HOSTNAME has no Whop connector configured for this repl.

## SDK version
`@whop/sdk@0.0.40` — base URL is `https://api.whop.com/api/v1`, auth header is `Authorization: Bearer <apiKey>`.

## Plan creation quirk
One-time payment plans require `plan_type: "one_time"` in the POST body. Using `billing_period: 0` returns 400 "The billing period cannot be zero if the plan is a renewal". Omitting `billing_period` entirely also fails — must explicitly pass `plan_type: "one_time"`.

## Created resources
- Product: `prod_DfqWDt9Ip5GMq` — "101 Night Market - Van Nuys Standard Booth"
- Plan: `plan_4EsQToHGWlEqN` — $85 one-time, Van Nuys standard booth
- Env var `WHOP_PLAN_ID` stores the plan ID

## Checkout flow
POST /api/whop/checkout → calls `whop.checkoutConfigurations.create({ plan_id, redirect_url })` → returns `{ checkout_id, purchase_url }` → frontend redirects to `purchase_url` → Whop redirects back to `/booking/success?checkout_id=ch_xxx` → GET /api/whop/verify confirms payment server-side.
