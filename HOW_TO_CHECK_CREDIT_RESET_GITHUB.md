# How to Check Credit Reset (Annual Plan) with GitHub Actions

You use **GitHub Actions** to run the monthly credit reset daily. This guide shows how to confirm it’s working and that annual-plan credits (and rollover) are reset correctly.

---

## VERCEL_CREDIT_RESET_URL – Updated details (for GitHub)

Use this value in **GitHub → Settings → Secrets and variables → Actions** for the secret **`VERCEL_CREDIT_RESET_URL`**.

| Item | Value |
|------|--------|
| **Path** | `/api/credits/monthly-reset` |
| **Method** | `POST` (workflow already uses POST) |
| **Trailing slash** | Do **not** add a trailing slash |
| **Query params** | None |

**How to build the full URL:**

1. **If you use a custom domain (e.g. Hostinger/Vercel custom domain):**  
   `https://YOUR_PRODUCTION_DOMAIN/api/credits/monthly-reset`  
   Examples:  
   - `https://zolstudio.com/api/credits/monthly-reset`  
   - `https://www.zolstudio.com/api/credits/monthly-reset`  
   Use the same domain your app runs on in production.

2. **If you use Vercel’s default URL:**  
   `https://YOUR_PROJECT.vercel.app/api/credits/monthly-reset`  
   Get `YOUR_PROJECT.vercel.app` from **Vercel Dashboard → Your Project → Domains** (e.g. `zol-studio.vercel.app`).

**Copy-paste (replace the domain):**

```text
https://YOUR_DOMAIN/api/credits/monthly-reset
```

**Check:** In Vercel, the handler is `api/credits/monthly-reset.ts`; the route is exposed at the path above. The workflow sends `x-reset-secret: CREDIT_RESET_SECRET`; that secret must match the one in Vercel’s environment variables.

---

## 1. What Your GitHub Workflow Does

- **File:** `.github/workflows/monthly-credit-reset.yml`
- **Schedule:** Runs every day at **00:00 UTC** (midnight UTC)
- **Manual run:** You can also trigger it from **Actions → Monthly Credit Reset → Run workflow**
- **Action:** Sends a `POST` request to your live app’s credit-reset endpoint with a secret header.

**Required GitHub Secrets:**

| Secret | What to put |
|--------|---------------------|
| `VERCEL_CREDIT_RESET_URL` | Full URL: `https://YOUR_DOMAIN/api/credits/monthly-reset` (see section above) |
| `CREDIT_RESET_SECRET` | Same value as in Vercel env: `CREDIT_RESET_SECRET` (e.g. `zola-credit-reset-2024-secret-key`) |

If the URL or secret is wrong, the reset will not run correctly.

---

## From GitHub: How to Check It’s Working

Do this entirely from GitHub (no Supabase yet) to see if the workflow and endpoint are OK.

### 1. Run the workflow

1. Open your repo on **GitHub**.
2. Click the **Actions** tab.
3. In the left sidebar, click **Monthly Credit Reset**.
4. Click **Run workflow** (dropdown on the right) → **Run workflow**.
5. Wait until the run appears and finishes (green checkmark or red X).

### 2. Open the run and check the logs

1. Click the latest run (e.g. “Reset Monthly Credits” or the workflow name).
2. Click the **reset-credits** job.
3. Expand the step **“Call Credit Reset Endpoint”**.

### 3. What “working” looks like in the logs

**Success (it’s working):**

- You see: **`HTTP status: 200`** and **`✅ Endpoint returned 200 OK`**.
- **Response body** will be one of:
  - `{"message":"Credit reset completed","reset":N,"total":N}` — N users were reset.
  - `{"message":"No users need credit reset today","reset":0}` — no one was due today; endpoint is still working.

**Failure (fix secrets or URL):**

- **`HTTP status: 401`** → Secret mismatch. Make sure **GitHub** secret `CREDIT_RESET_SECRET` matches **Vercel** env var `CREDIT_RESET_SECRET`.
- **`HTTP status: 404`** or **5xx** → Wrong or unreachable URL. Check **GitHub** secret `VERCEL_CREDIT_RESET_URL` (e.g. `https://YOUR_DOMAIN/api/credits/monthly-reset`). Ensure the app is deployed on Vercel and that domain works in the browser.
- **Job fails with “Expected 200, got …”** → Same as above; fix the status code cause.

### 4. Summary from GitHub only

| What you see in “Call Credit Reset Endpoint” | Meaning |
|---------------------------------------------|--------|
| `HTTP status: 200` + `✅ Endpoint returned 200 OK` | **Working.** The cron is calling the right URL with the right secret. |
| `reset: 0` in response | No users were due for reset today; run again after setting a test user’s `next_credit_reset_at` to today (see Step 2 below) if you want to test actual credit changes. |
| `reset: 1` (or more) in response | One or more users were reset; check Supabase to confirm numbers. |
| `401` / `404` / `5xx` or job failure | **Not working.** Fix `CREDIT_RESET_SECRET` or `VERCEL_CREDIT_RESET_URL` as above. |

So: **from GitHub, you’ve confirmed it’s working when a run succeeds and the log shows `HTTP status: 200` and the success message.** To confirm credits actually changed, use a test user and check Supabase (next section).

---

## How to Check in Vercel

When GitHub shows `"reset":1,"total":1` and **HTTP Status: 200**, the request hit your Vercel app. Here’s how to verify the same run in Vercel.

### 1. Open your project and logs

1. Go to [vercel.com](https://vercel.com) and log in.
2. Open the **project** that hosts ZOL Studio (the one with `api/credits/monthly-reset`).
3. In the top nav, click **Logs** (or **Deployments** → pick a deployment → **Functions** / **Logs**).

### 2. Find the credit-reset function

- In **Logs**: filter or scroll for requests to **`/api/credits/monthly-reset`** around the time you ran the GitHub workflow.
- Or: **Deployments** → latest deployment → **Functions** tab → find **`api/credits/monthly-reset`** (or similar) and open it to see invocations.

### 3. What you’ll see in Vercel

- **Request:** A **POST** to `/api/credits/monthly-reset` with status **200**.
- **Runtime logs** (if you open that invocation): The `console.log` / `console.error` output from the function, for example:
  - `✅ Reset credits for user <id>: 460 credits (360 new + 100 rollover)`
  - Or: `✅ No users need credit reset today` if no one was due.

So: **GitHub** confirms the HTTP call and response (`reset: 1`); **Vercel** shows that the same request was executed and the serverless function’s internal logs (which user was reset, new total, rollover).

### 4. If you don’t see logs

- **Logs** may be under **Project → Logs** with a time filter; set the time range to when you ran the workflow.
- On the **Hobby** plan, log retention is limited; run the workflow again and check immediately.
- Ensure the deployment that’s live (production domain) is the one you’re viewing; **Logs** usually show the deployment that received the request.

---

## 2. Step-by-Step: Check That Reset Is Allocating Properly

### Step 1: Confirm GitHub Secrets

1. Open your repo on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Check:
   - `VERCEL_CREDIT_RESET_URL` = `https://YOUR_DOMAIN/api/credits/monthly-reset`
   - `CREDIT_RESET_SECRET` = same as in Vercel (e.g. `CREDIT_RESET_SECRET` env var).

### Step 2: Create a Test User (or Use Existing Annual User)

You need at least one user who is **due for a reset today** so the job actually does something.

**Option A – Use a real annual Pro user**

- In **Supabase → Table Editor → `profiles`**:
  - Find a user with `plan_tier` = `pro`, `plan_status` = `active`, `billing_period` = `annual`.
  - Note their `total_credits`, `used_credits`, and `next_credit_reset_at`.

**Option B – Force a “reset today” for testing**

1. In Supabase → **profiles**, pick one test user (e.g. your own).
2. Set:
   - `plan_tier` = `pro`
   - `plan_status` = `active`
   - `billing_period` = `annual`
   - `total_credits` = `360`
   - `used_credits` = `260` (so 100 “remaining” for rollover test)
   - `next_credit_reset_at` = **today’s date** in UTC (e.g. `2026-02-24T00:00:00.000Z`).
3. Save.

So before the reset: **360 total, 260 used → 100 remaining**. After reset you expect: **360 + 100 = 460** total, **0** used.

### Step 3: Run the Workflow (Don’t Wait for Midnight)

1. GitHub → your repo → **Actions**.
2. Click **Monthly Credit Reset** in the left sidebar.
3. Click **Run workflow** (right side) → **Run workflow**.
4. Wait for the run to finish (green checkmark).

### Step 4: See Whether the Endpoint Was Called

- In the job **“Call Credit Reset Endpoint”**, expand the step and check the `curl` output.
- You should see either:
  - HTTP **200** and a body like `{"message":"Credit reset completed","reset":1,"total":1}`, or
  - HTTP **200** and `{"message":"No users need credit reset today","reset":0}` if no user had `next_credit_reset_at` ≤ today.

If you get **401**: secret mismatch (check `CREDIT_RESET_SECRET` in GitHub and Vercel).  
If you get **404/5xx**: wrong URL or app not deployed (check `VERCEL_CREDIT_RESET_URL` and deployment).

### Step 5: Check Supabase (Did Credits Actually Reset?)

1. Open **Supabase → Table Editor → profiles**.
2. Find the same user you set in Step 2.

**After a successful reset you should see:**

| Field | Before reset (example) | After reset (expected) |
|-------|------------------------|--------------------------|
| `total_credits` | 360 | **460** (360 new + 100 rollover) |
| `used_credits` | 260 | **0** |
| `credits_expire_at` | e.g. 2026-02-24 | **Next month same day** (e.g. 2026-03-24) |
| `next_credit_reset_at` | e.g. 2026-02-24 | **Next month same day** (e.g. 2026-03-24) |
| `last_credits_allocated_at` | (any) | **Just now** (time of the run) |

If these match, the reset is allocating properly for the annual plan and rollover is correct.

### Step 6: Check in Your App

- Log in as that user and open **Profile** or wherever you show credits.
- You should see the new balance (e.g. 460) and an expiry date one month ahead (same day as next reset).

---

## 3. Quick Checklist

- [ ] GitHub Actions secrets set: `VERCEL_CREDIT_RESET_URL`, `CREDIT_RESET_SECRET`.
- [ ] Vercel env has same `CREDIT_RESET_SECRET` (and app is deployed).
- [ ] At least one test user has `next_credit_reset_at` = today (or past) and `plan_status` = `active`, `plan_tier` = `pro` (or basic/agency).
- [ ] Run **Monthly Credit Reset** workflow manually and see HTTP 200.
- [ ] In Supabase, that user’s `total_credits` = **plan’s monthly credits + previous remaining**, `used_credits` = **0**, and `next_credit_reset_at` / `credits_expire_at` = **same day next month**.

---

## 4. If “No users need credit reset today”

The endpoint only resets users where:

- `plan_status` = `'active'`
- `next_credit_reset_at` is not null  
- `next_credit_reset_at` ≤ **today (UTC)**.

So:

- If you use “today” in **local** time, Supabase stores UTC: e.g. 24 Feb 00:00 in your country might be 23 Feb 18:00 UTC, so “today” in UTC might still be 23 Feb and the user won’t be selected until 24 Feb 00:00 UTC.
- To test immediately, set `next_credit_reset_at` to **yesterday** or **today 00:00 UTC** in Supabase, then run the workflow again.

---

## 5. Summary

- **GitHub** runs the workflow daily at 00:00 UTC and calls your **Vercel** credit-reset URL with the secret.
- **Vercel** runs `api/credits/monthly-reset.ts`, which updates Supabase (reset + rollover, same-day-next-month).
- To validate: set one annual Pro user’s `next_credit_reset_at` to today (or yesterday), run the workflow once, then check Supabase and the app. If the numbers match the table above, reset and allocation for the annual plan are working properly.
