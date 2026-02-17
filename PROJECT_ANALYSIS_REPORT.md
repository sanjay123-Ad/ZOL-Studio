# ZOL Studio - Complete Project Analysis & Bug Report

**Analysis Date:** February 17, 2025  
**Project:** ZOL Studio AI (zol-studio-ai)  
**Version:** 0.0.0

---

## Part 1: Product Concept & Full Understanding

### What is ZOL Studio?

**ZOL Studio** (also branded as ZOLA Studio 2.0) is an **AI-powered SaaS platform** for fashion e-commerce visual asset generation. It lets fashion brands create professional product photography and marketing assets without expensive photoshoots, studios, or photographers.

**Target Users:** Fashion e-commerce brands, online retailers, fashion designers, marketing agencies, startups.

**Core Value:** Reduce visual production costs by ~90%, speed up production from months to days, and generate many creative variations without physical constraints.

---

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, React Router, Framer Motion |
| Backend | Express.js, Node.js 20 |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI | Google Gemini 2.5 Flash & Gemini 3 Pro Image |
| Payments | Lemon Squeezy |
| Deployment | Vercel (with custom Express server option) |

---

### Five Core AI Features

#### 1. **Virtual Photoshoot (Seamless Swap)**
- **Route:** `/virtual_photoshoot`
- Swaps garments onto models while keeping face/identity.
- Options: Upper body, lower body, or both; backgrounds: studio, white, outdoor, original.
- Model: `gemini-2.5-flash-image` — 1 credit per generation.

#### 2. **E-commerce Asset Generator**
- **Route:** `/asset_generator`
- Extracts individual garments from lifestyle photos into ghost mannequin images.
- Batch: up to 12 images — 1 credit per batch.
- Model: `gemini-2.5-flash-image`.

#### 3. **Perfect Product Forge (Catalog | Forged)**
- **Route:** `/catalog_forged`
- Improves wrinkled/poorly lit product photos to 4K catalog quality.
- Batch: up to 12 products — 2 credits per garment (front + back).
- Model: `gemini-3-pro-image-preview`.

#### 4. **Style|Scene Campaign Director**
- **Route:** `/stylescene`
- Builds full lifestyle campaigns from a single garment.
- User selects model and poses; AI generates campaign images.
- Model: `gemini-3-pro-image-preview` — 1 credit per pose.

#### 5. **AI Pose Mimic**
- **Route:** `/pose_mimic`
- Transfers poses to a model while keeping identity.
- Batch: up to 12 pose pairs — 1 credit per pair.
- Model: `gemini-3-pro-image-preview`.

---

### Pricing Tiers & Credits (Current Implementation)

| Plan | Monthly | Annual | Credits/Month |
|------|---------|--------|---------------|
| Basic | $49 | $490 | 175 |
| Pro | $99 | $990 | 360 |
| Agency | $149 | $1,490 | 550 |

Annual plans bill yearly but credits still reset monthly.

---

### Key Flows

- **Auth:** Supabase (email/password + Google OAuth).
- **Payments:** Lemon Squeezy checkout → webhook → profile + credits update in Supabase.
- **Credits:** Deducted per generation, monthly reset via `/api/credits/monthly-reset` cron.
- **Storage:** User-specific buckets for generated assets, collections, style scene, pose mimic.
- **State:** Session and IndexedDB for images; stateStore for form state across features.

---

## Part 2: Errors, Bugs & Issues Found

### Critical

#### 1. **Missing `index.css` File**
- **Location:** `index.html` line 272: `<link rel="stylesheet" href="/index.css">`
- **Issue:** No `index.css` in the project (no `.css` files at all).
- **Impact:** 404 for CSS; build warning: *"/index.css doesn't exist at build time"*.
- **Fix:** Create an empty `index.css` or remove the link if styles are only inline/Tailwind.

#### 2. **Duplicate `index.tsx` Script Tags**
- **Location:** `index.html` lines 274 and 277
- **Issue:** Two scripts loading the same entry point:
  - `<script type="module" src="./index.tsx"></script>`
  - `<script type="module" src="/index.tsx"></script>`
- **Impact:** App can mount twice, wasted requests, possible hydration issues.
- **Fix:** Remove one of the script tags.

#### 3. **`listUsers()` May Miss Users (Webhook)**
- **Location:** `server.ts` line 361, `api/lemonsqueezy/webhook.ts` line 273
- **Issue:** `supabaseAdmin.auth.admin.listUsers()` is used without pagination.
- **Impact:** Supabase’s `listUsers` is paginated (e.g. default 50 per page). With more users, a paying customer’s email might not be in the first page → “User not found” for valid webhooks.
- **Fix:** Implement pagination (e.g. loop over pages until user found or list exhausted) or use a direct lookup (e.g. Supabase SQL/auth function by email) if available.

---

### Medium

#### 4. **`creditService.calculateExpirationDate` Inconsistent**
- **Location:** `services/creditService.ts` lines 384–391
- **Issue:** For `billingPeriod === 'annual'` it uses `setFullYear(+1)`, so credits expire in 1 year.
- **Context:** Server and API webhooks use a local version that expires in 1 month for both monthly and annual.
- **Impact:** If `creditService.calculateExpirationDate` is ever used for webhook/credit logic, annual plans would get incorrect expiry (1 year vs 1 month).
- **Status:** Webhook uses its own `calculateExpirationDate`, so impact is limited for now, but could cause future bugs.
- **Fix:** Align `creditService.calculateExpirationDate` with server logic (always 1 month) or clearly document and isolate its usage.

#### 5. **`start` Script Fails on Windows**
- **Location:** `package.json` — `"start": "NODE_ENV=production tsx server.ts"`
- **Issue:** `VAR=value command` is Unix shell syntax and fails on Windows (PowerShell/CMD).
- **Impact:** `npm run start` fails on Windows.
- **Fix:** Use `cross-env` or platform-specific commands, e.g. `"start": "cross-env NODE_ENV=production tsx server.ts"` and add `cross-env` as a dependency.

#### 6. **Monthly Credit Reset and `plan_tier` Edge Cases**
- **Location:** `server.ts` around line 676
- **Issue:** `getCreditsForPlan(user.plan_tier, 'monthly')` assumes `plan_tier` is `'basic' | 'pro' | 'agency'`. If it is `'free'` or `null`, the map returns `0`.
- **Impact:** Users with unexpected `plan_tier` could receive 0 credits on reset.
- **Fix:** Add validation (e.g. skip or handle `'free'`/`null`) and ensure the query only includes paid plans.

---

### Low / Documentation

#### 7. **Outdated Credit Values in `PROJECT_ANALYSIS.md`**
- **Location:** `PROJECT_ANALYSIS.md`
- **Issue:** Lists 250/750/1,450 credits per plan; actual implementation uses 175/360/550.
- **Impact:** Misleading documentation only.
- **Fix:** Update `PROJECT_ANALYSIS.md` to match `server.ts` and `creditService.ts`.

#### 8. **Hardcoded Supabase Credentials**
- **Location:** `services/supabase.ts`
- **Issue:** Supabase URL and anon key are hardcoded.
- **Impact:** Harder to switch between dev/staging/prod; anon key is public but usually safe with RLS.
- **Fix:** Prefer env vars for URL and keys in different environments.

#### 9. **Large Client Bundle**
- **Build output:** ~1.34 MB main JS (above 500 KB recommended).
- **Impact:** Slower initial load.
- **Fix:** Consider code splitting (e.g. route-based `import()`) and splitting large dependencies.

---

## Part 3: Build Status

- Client build: Success (with index.css warning)
- Server build: Success
- Linter: No errors reported

---

## Part 4: Summary & Recommendations

| Priority | Issue | Action |
|----------|-------|--------|
| Critical | Missing `index.css` | Add file or remove link |
| Critical | Duplicate `index.tsx` scripts | Remove one script tag |
| Critical | `listUsers` pagination | Add pagination or email-based lookup |
| Medium | `creditService` expiration for annual | Align with server or isolate usage |
| Medium | Windows `start` script | Use `cross-env` |
| Medium | `plan_tier` in credit reset | Validate and handle edge cases |
| Low | Docs / bundle size | Update docs, add code splitting |

**Overall:** The product design and implementation look solid. The main production risks are the webhook user lookup (with many users) and the duplicate script + missing CSS issues, which are quick to fix.
