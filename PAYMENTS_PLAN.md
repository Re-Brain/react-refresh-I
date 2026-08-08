# Donations & Subscriptions — Build Plan

## Business model

Visitors can support a farm two ways, from that farm's (or one of its horses')
page:

- **One-time donation**
- **Monthly subscription** (recurring donation)

Both split the same way: **20% to the platform, 80% to the farm.** The split
must be enforced by Stripe at the moment of payment — never calculated and
transferred manually after the fact.

## Prerequisite: every farm needs a Stripe Connect account

Money can't be routed to a farm that hasn't onboarded. Each farm needs its own
**Stripe Connect Express account** — Stripe's lightest onboarding flow
(hosted by Stripe, a few minutes, handles ID verification + bank details).

- Store `stripe_account_id` on the farm record once created.
- Store/derive an onboarding status from Stripe's `account.updated` webhook
  (`charges_enabled` / `payouts_enabled`).
- A farm's donate/subscribe options must stay hidden or disabled on its public
  page until `payouts_enabled` is true.

## How the split actually works

**One-time donation** — a Checkout Session / PaymentIntent with:
```
transfer_data: { destination: <farm's stripe_account_id> }
application_fee_amount: <20% of the amount, in cents>
```
Stripe keeps 20% for the platform account and sends 80% to the farm
automatically — one API call, no manual transfer step.

**Monthly subscription** — a Subscription object with:
```
transfer_data: { destination: <farm's stripe_account_id> }
application_fee_percent: 20
```
Every renewal invoice is split the same way automatically, indefinitely, with
no manual intervention needed.

## Backend work

1. **Farm onboarding**
   - Endpoint to create a Connect Express account for a farm (`Account.create`)
     and generate a Stripe-hosted onboarding link (`Account Link`).
   - Webhook handler for `account.updated` → persist `charges_enabled` /
     `payouts_enabled` on the farm.

2. **One-time donation**
   - Endpoint to create a Checkout Session (payment mode) with the
     `transfer_data` + `application_fee_amount` fields above, scoped to a
     specific farm.
   - Webhook handler for `checkout.session.completed` → record the donation
     (amount, farm, visitor, date) for history/receipts.

3. **Monthly subscription**
   - Endpoint to create a Checkout Session (subscription mode) with
     `transfer_data` + `application_fee_percent`, scoped to a specific farm.
   - Webhook handlers for `invoice.payment_succeeded` / `invoice.payment_failed`
     → track subscription health (e.g. flag a farm's supporter list, notify on
     failed renewal).
   - A way to generate a **Stripe Billing Portal** session so visitors can
     view/cancel their own subscriptions without you building that UI.

4. **Data model additions**
   - Farms: `stripe_account_id`, `payouts_enabled`.
   - New tables: `donations` (one-time) and `subscriptions` (recurring),
     each tied to a visitor + a farm, with amount/status/Stripe IDs.

5. **Webhook endpoint security**: verify Stripe's signature on every webhook
   request (standard Stripe SDK helper) — never trust an unsigned payload.

## Frontend work (comparatively thin — Stripe hosts the actual payment UI)

1. **Farm/horse page**: a "Support this farm" section with a one-time amount
   input + a "Donate" button, and a "Subscribe monthly" option — both just
   call the backend to create a Checkout Session, then redirect to the URL
   Stripe returns. Hidden/disabled if the farm hasn't finished onboarding.
2. **Farmer dashboard**: a "Connect your Stripe account" call-to-action
   (Settings section) when a farm hasn't onboarded yet, linking out to the
   Stripe-hosted onboarding flow.
3. **Farmer dashboard**: a "Supporters" view (same shape as
   `VisitorManagement.tsx`) listing donations/subscriptions received —
   mirrors the booking-management pattern already built.
4. **Visitor dashboard**: a link to the Stripe Billing Portal to manage their
   own active subscriptions (no custom cancel/update UI needed).
5. **Success/cancel redirect pages** after a Checkout Session completes —
   same pattern as `BookingConfirmationPage.tsx`.

## Suggested build order

1. Farm Stripe Connect onboarding (nothing else works without this).
2. One-time donations end-to-end (simpler than subscriptions — validates the
   whole split mechanism first).
3. Monthly subscriptions (reuses everything from step 2, adds recurrence).
4. Farmer "Supporters" view + visitor Billing Portal link (operational
   visibility — don't skip this the way admin tooling was deferred; real
   money needs *some* visibility from day one).
