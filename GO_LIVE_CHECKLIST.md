# ZOL Studio – Go Live Checklist (Test → Live Payments)

Your micro-SaaS is ready. Switching Lemon Squeezy from **test** to **live** is done by changing environment variables and Lemon Squeezy dashboard settings only — **no code changes** are required.

---

## 1. Lemon Squeezy (Live Store)

- [ ] In [Lemon Squeezy](https://app.lemonsqueezy.com): use or create a **live** store (not test mode).
- [ ] Create **live** products/variants for Basic, Pro, and Agency (monthly + annual) if you haven’t already.
- [ ] Note the **live** variant IDs (Dashboard → Product → Variant → ID) for all 6:
  - Basic Monthly, Basic Annual  
  - Pro Monthly, Pro Annual  
  - Agency Monthly, Agency Annual  
- [ ] Get **live** API key: **Settings → API** (use the key that’s for the live store).
- [ ] Get **live** Store ID (from the live store URL or Settings).

---

## 2. Webhook (Live)

- [ ] In Lemon Squeezy: **Settings → Webhooks** (for the **live** store).
- [ ] Set **Signing Secret** and copy it (this is `LEMONSQUEEZY_WEBHOOK_SECRET`).
- [ ] Add/update webhook URL to your **production** URL, e.g.  
  `https://zolstudio.com/api/lemonsqueezy/webhook`  
  (or `https://your-project.vercel.app/api/lemonsqueezy/webhook` if that’s your live URL).
- [ ] Subscribe to the same events you use in test (e.g. `subscription_created`, `subscription_updated`, `subscription_payment_success`, etc.).

---

## 3. Environment Variables (Vercel)

In **Vercel → Project → Settings → Environment Variables**, set these for **Production** (and Preview if you want):

| Variable | What to set |
|----------|---------------------|
| `LEMONSQUEEZY_API_KEY` | Live API key from Lemon Squeezy |
| `LEMONSQUEEZY_STORE_ID` | Live store ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Live webhook signing secret |
| `LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID` | Live Basic Monthly variant ID |
| `LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID` | Live Basic Annual variant ID |
| `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` | Live Pro Monthly variant ID |
| `LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID` | Live Pro Annual variant ID |
| `LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID` | Live Agency Monthly variant ID |
| `LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID` | Live Agency Annual variant ID |

The app also reads `VITE_LEMONSQUEEZY_*_VARIANT_ID` for the frontend (Pricing/checkout). In Vercel, add the same **live** variant IDs with the `VITE_` prefix so the pricing page opens checkout with the correct live variants:

- `VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID`  
- `VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID`  
- `VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID`  
- `VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID`  
- `VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID`  
- `VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID`  

Optional:

- `LEMONSQUEEZY_SUCCESS_URL` = `https://zolstudio.com` (or your live app URL) so “Return to merchant” goes to production.

---

## 4. Local / .env.local (Optional)

If you run the app locally and want to test against live (or keep test for local), update `.env.local` with the same **live** keys and variant IDs. Never commit `.env.local`.

---

## 5. Redeploy

- [ ] After saving env vars in Vercel, trigger a **redeploy** (e.g. Deployments → … → Redeploy) so the new values are used.

---

## 6. Quick Verification

- [ ] Open your **live** app (e.g. zolstudio.com) and go to Pricing.
- [ ] Click a plan (e.g. Pro Monthly) — checkout should open **Lemon Squeezy live** (no test banner).
- [ ] Make a **small real payment** (or use a real card then refund) to confirm:
  - Webhook is called (check Vercel Logs for `/api/lemonsqueezy/webhook`).
  - User gets the correct plan and credits in the app and in Supabase `profiles`.

---

## Summary

| Area | Action |
|------|--------|
| **Code** | No changes needed; same code works for test and live. |
| **Lemon Squeezy** | Use live store, live API key, live variant IDs, live webhook URL + signing secret. |
| **Vercel** | Set all live env vars (API key, store ID, webhook secret, 6 variant IDs; plus `VITE_*` variant IDs for frontend). |
| **Webhook** | Production URL in Lemon Squeezy; `LEMONSQUEEZY_WEBHOOK_SECRET` matches dashboard. |
| **After switch** | Redeploy, then test one real payment and check webhook + credits. |

Once the **live** API key and **live** variant IDs are set in Vercel (and the live webhook is configured), the product will work in production. The only thing that was “test” was the payment/variant IDs; switching those to live completes the setup.
