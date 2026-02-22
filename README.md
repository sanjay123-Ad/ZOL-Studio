# Zol Studio AI

Zol Studio AI (also branded as ZOLA Studio 2.0) is an **AI-powered SaaS platform** for fashion e-commerce visual asset generation. It enables fashion brands to create professional product photography and marketing assets without the need for expensive photoshoots, studios, or photographers.

**Target Users:** Fashion e-commerce brands, online retailers, fashion designers, marketing agencies, and startups.
**Core Value:** Significantly reduce visual production costs (by ~90%), accelerate production timelines from months to days, and generate diverse creative variations without physical constraints.

## Tech Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| Frontend     | React 19, TypeScript, Vite, React Router, Framer Motion |
| Backend      | Express.js, Node.js 20                         |
| Database     | Supabase (PostgreSQL with real-time capabilities) |
| Storage      | Supabase Storage                               |
| AI           | Google Gemini 2.5 Flash & Gemini 3 Pro Image   |
| Payments     | Lemon Squeezy                                  |
| Deployment   | Vercel (with custom Express server)            |

## Core AI Features

Zol Studio AI provides five core AI features:

1.  **Virtual Photoshoot (Seamless Swap)**
    *   **Route:** `/virtual_photoshoot`
    *   **Description:** Swaps garments onto models while preserving face/identity.
    *   **Options:** Upper body, lower body, or both; backgrounds (studio, white, outdoor, original).
    *   **Credits:** 1 credit per generation.
2.  **E-commerce Asset Generator (Core Extraction)**
    *   **Route:** `/asset_generator`
    *   **Description:** Extracts individual garments from lifestyle photos into ghost mannequin images.
    *   **Credits:** 1 credit per batch (up to 12 images).
3.  **Perfect Product Forge (Catalog | Forged)**
    *   **Route:** `/catalog_forged`
    *   **Description:** Improves wrinkled/poorly lit product photos to 4K catalog quality.
    *   **Credits:** 2 credits per garment (front + back).
4.  **Style|Scene Campaign Director**
    *   **Route:** `/stylescene`
    *   **Description:** Builds full lifestyle campaigns from a single garment. User selects model and poses; AI generates campaign images.
    *   **Credits:** 1 credit per pose.
5.  **AI Pose Mimic**
    *   **Route:** `/pose_mimic`
    *   **Description:** Transfers poses to a model while preserving identity.
    *   **Credits:** 1 credit per pose pair.

## Local Development Setup

### Prerequisites

*   Node.js (version 20.x recommended)
*   npm (usually comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/zol-studio-ai.git
    cd zol-studio-ai
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**

    Create a `.env.local` file in the project root. This file should contain sensitive API keys and configuration specific to your local environment. **Do NOT commit this file to version control.**

    Here's a template for your `.env.local` file. Replace `your_..._here` with your actual values:

    ```bash
    # Supabase
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

    # Lemon Squeezy Backend
    LEMONSQUEEZY_API_KEY=ls_test_your_api_key_here
    LEMONSQUEEZY_STORE_ID=your_store_id_here
    LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

    # Lemon Squeezy Variant IDs - Backend (No VITE_ prefix)
    LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=your_basic_monthly_variant_id
    LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your_basic_annual_variant_id
    LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your_pro_monthly_variant_id
    LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your_pro_annual_variant_id
    LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your_agency_monthly_variant_id
    LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your_agency_annual_variant_id

    # Lemon Squeezy Variant IDs - Frontend (WITH VITE_ prefix - MUST BE SAME VALUES AS ABOVE)
    VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID=your_basic_monthly_variant_id
    VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID=your_basic_annual_variant_id
    VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=your_pro_monthly_variant_id
    VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID=your_pro_annual_variant_id
    VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID=your_agency_monthly_variant_id
    VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID=your_agency_annual_variant_id

    # Credit Reset
    CREDIT_RESET_SECRET=your-credit-reset-secret-key

    # Success URL (for Lemon Squeezy redirects)
    LEMONSQUEEZY_SUCCESS_URL=http://localhost:5173/pricing

    # Google Gemini AI (if using)
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

    **Important Notes on Environment Variables:**
    *   Frontend variables (`VITE_` prefix) are exposed to the client-side code. Ensure no highly sensitive keys are prefixed with `VITE_`.
    *   Backend variables (no `VITE_` prefix) are used by the Express server.
    *   The `LEMONSQUEEZY_*_VARIANT_ID` values for both frontend and backend **must be identical**.

4.  **Run the app in development mode:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server with HMR and the Express server for SSR and API endpoints. The app will typically be available at `http://localhost:5173`.

## Deployment (Vercel)

This project is configured for deployment on Vercel.

### Prerequisites for Vercel Deployment

1.  A Vercel account.
2.  Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket).
3.  All required environment variables (as listed in the Local Development Setup section, but without the `VITE_` prefix for backend variables, and with the `VITE_` prefix for frontend variables) configured in your Vercel project settings.

### Deployment Steps (via Vercel Dashboard)

1.  Go to [https://vercel.com/new](https://vercel.com/new) and import your Git repository.
2.  Vercel should auto-detect most project settings.
3.  Configure your **Environment Variables** in Vercel Project Settings:
    *   Add all backend and frontend environment variables from your `.env.local` file to Vercel's environment variables.
    *   For production, update `LEMONSQUEEZY_SUCCESS_URL` to your production domain (e.g., `https://yourdomain.com/pricing`).
4.  Ensure the **Build Command** is `npm run build` and the **Output Directory** is `dist/client`.
5.  Click "Deploy".

### Vercel Configuration Notes

*   **Build Process:** Vercel will execute `npm run build`, which creates `dist/client/` (client-side assets) and `dist/server/` (server-side code).
*   **SSR Handling:** The Express server (`server.ts`) handles all non-API routes for Server-Side Rendering.
*   **Cron Jobs:** For features like the monthly credit reset (`/api/credits/monthly-reset`), you may need to configure Vercel Cron Jobs to trigger this endpoint periodically. Ensure `CREDIT_RESET_SECRET` is set for security.

## Authentication & Authorization

*   **Authentication Provider:** Supabase Auth (supports Email/Password and Google OAuth).
*   **Authorization:** Row Level Security (RLS) is enabled on all Supabase tables to ensure user-specific data isolation. The Supabase service role key is used for server-side operations to bypass RLS when necessary.

## Payment Integration (Lemon Squeezy)

*   **Subscription Tiers:**
    | Plan   | Monthly Price | Annual Price | Credits/Month |
    |--------|---------------|--------------|---------------|
    | Basic  | $49           | $490         | 175           |
    | Pro    | $99           | $990         | 360           |
    | Agency | $149          | $1,490       | 550           |
    (Annual plans are billed yearly but credits reset monthly.)
*   **Webhook (`/api/lemonsqueezy/webhook`):** Handles subscription events (`subscription_created`, `subscription_payment_success`, `subscription_updated`, `subscription_canceled`) to update user profiles and allocate credits in Supabase.
*   **Credit Allocation Logic:**
    *   **Plan Change:** Resets plan credits, but preserves any remaining signup bonus credits (if still valid).
    *   **Renewal:** Rolls over unused credits from the previous period and allocates new monthly credits.
    *   **First-time Paid:** Preserves signup credits (up to 10) and adds plan credits.
*   **Checkout Flow (`/api/lemonsqueezy/create-checkout`):** Generates a Lemon Squeezy checkout URL for user redirection.

## Credit System

*   **Initial Credits:** Free tier users receive 10 credits upon signup (these typically expire in 1 month).
*   **Paid Plan Credits:** Monthly credit allocation based on the user's plan tier (Basic, Pro, Agency). Even annual plans receive credits on a monthly basis.
*   **Credit Deduction:** Credits are deducted per AI generation. A pre-check ensures sufficient credits are available before an operation, and `used_credits` is updated in the database. Usage is also tracked in the `usage_tracking` table.
*   **Monthly Reset (`/api/credits/monthly-reset`):** An automated cron job (scheduled daily) checks for users whose credits need to be reset. It allocates new monthly credits and rolls over any unused credits from the previous month.

## Project Structure

```
ZOLA-2.0/
├── api/                    # Serverless API endpoints (credits, lemonsqueezy, _utils)
├── components/            # Reusable React components
├── pages/                 # Route-based page components
├── services/              # Business logic & API clients for various features
├── constants/             # Application constants and paths
├── supabase/              # Supabase functions & migrations
├── public/                # Static assets
├── .github/               # GitHub Actions workflows
├── dist/                  # Built output for client and server
├── node_modules/          # Installed Node.js packages
├── privacy policy document/ # Document templates for privacy policies
├── Terms & Conditions document/ # Document templates for terms and conditions
├── .env.local             # Local environment variables (NOT committed to Git)
├── package.json           # Project dependencies and scripts
├── server.ts              # Main Express server for SSR and API endpoints
├── App.tsx                # Root React application component
├── entry-server.tsx       # Server-side entry point for SSR
└── ... (other markdown documentation files)
```

**Service Layer Pattern:** Each core AI feature has a dedicated service file within the `services/` directory (e.g., `virtualTryOnService.ts`, `assetGeneratorService.ts`).

## Code Quality & Recommendations

### Strengths

*   **Type Safety:** Full TypeScript implementation.
*   **Modular Architecture:** Clear separation of concerns with a dedicated service layer.
*   **Error Handling:** Try-catch blocks in critical paths.
*   **Robust Authentication/Authorization:** Supabase Auth with RLS.
*   **Well-implemented Payment System:** Lemon Squeezy integration with credit allocation logic.
*   **SSR Support:** Server-side rendering for improved SEO.

### High-Priority Improvements

1.  **Missing `index.css` File:** The `index.html` references `/index.css`, but this file does not exist, leading to a 404 error and build warnings. **Action:** Create an empty `index.css` file or remove the reference if styles are handled otherwise.
2.  **Duplicate `index.tsx` Script Tags:** `index.html` has two script tags loading `index.tsx`, which can cause the app to mount twice, leading to wasted requests and potential hydration issues. **Action:** Remove one of the duplicate script tags.
3.  **`listUsers()` Pagination (Webhook):** The `supabaseAdmin.auth.admin.listUsers()` function in `server.ts` is used without pagination. With a large number of users, this could lead to the webhook failing to find a paying customer if their email is not on the first page of results. **Action:** Implement pagination (loop over pages until the user is found or the list is exhausted) or use a more direct user lookup method if available (e.g., a Supabase SQL/auth function by email).
4.  **Windows `start` script:** The `start` script in `package.json` uses Unix-specific syntax (`NODE_ENV=production tsx server.ts`) which causes it to fail on Windows. **Action:** Use `cross-env` for setting environment variables in scripts, e.g., `"start": "cross-env NODE_ENV=production tsx server.ts"`, and add `cross-env` as a development dependency.
5.  **Hardcoded Supabase Credentials:** The Supabase URL and anon key are hardcoded in `services/supabase.ts`. **Action:** Move these to environment variables to simplify switching between environments and improve security.

### Other Recommendations

*   **Add Comprehensive Error Handling:** Implement a consistent error handling pattern across all services.
*   **Implement API Rate Limiting:** Add rate limiting on API endpoints to prevent abuse and ensure stability.
*   **Code Documentation (JSDoc):** Add JSDoc comments for public APIs and complex functions.
*   **Code Splitting Optimization:** Consider further code splitting and lazy loading for routes to improve frontend performance.
*   **Testing Infrastructure:** Implement unit tests for critical services and integration tests for API flows.

## Troubleshooting

*   **Build Fails:**
    *   Check `package.json` for missing dependencies.
    *   Verify Node.js version compatibility.
    *   Review build logs for specific errors.
*   **Environment Variables Not Working:**
    *   Ensure variables are correctly set in `.env.local` (for local) or Vercel dashboard (for deployment).
    *   Redeploy after adding new environment variables.
    *   Double-check variable names for exact matches (case-sensitive).
*   **SSR Not Working:**
    *   Verify `dist/server/entry-server.js` exists after build.
    *   Check `server.ts` configuration.
    *   Review Vercel function logs.
*   **Static Assets Not Loading:**
    *   Verify `dist/client` contains all static assets.
    *   Check asset paths for correctness.

## Important Security Notes

*   **Sensitive Keys:** Never commit sensitive API keys, secrets, or credentials directly to your Git repository. Use environment variables and secure configuration practices.
*   **Webhook Signature Verification:** While the webhook in `server.ts` has a placeholder for signature verification, a strict HMAC comparison should be implemented to ensure webhook authenticity and prevent tampering.

---
This `README.md` is a consolidation of information from various `.md` files found in the project.
