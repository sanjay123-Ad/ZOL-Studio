# ZOLA Studio - Complete Feature Analysis

## 📋 Project Overview

**ZOLA Studio** (ZOLA 2.0) is an AI-powered SaaS platform for fashion e-commerce visual asset generation. Built with React 19, TypeScript, Express.js, and powered by Google Gemini AI, it provides five core features that transform how fashion brands create product photography.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite
- Backend: Express.js + Node.js 20
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage
- AI: Google Gemini 2.5 Flash & Gemini 3 Pro Image
- Payment: Lemon Squeezy
- Deployment: Vercel

---

## 🎯 Core Features - How Each Works

### 1. Virtual Photoshoot (Seamless Swap) 
**Route:** `/virtual-photoshoot`  
**Service:** `services/virtualTryOnService.ts`  
**Page:** `pages/TryOnPage.tsx`  
**Credits:** 1 credit per generation

#### How It Works:

1. **User Input Collection:**
   - User selects gender (Male/Female)
   - Uploads person/model photo
   - Uploads garment/product photo
   - System auto-detects gender from person image (validation)
   - System auto-analyzes garment to generate description

2. **AI Analysis Phase:**
   - `detectGender()`: Analyzes person image to verify gender match
   - `detectGarmentGender()`: Verifies garment matches selected gender
   - `analyzeGarmentImage()`: Generates detailed garment description and style suggestions
   - `classifyGarmentsInImage()`: Determines if garment is upper/lower body

3. **Generation Configuration:**
   - User selects what to swap: Upper body, Lower body, or Both
   - Background options: Studio, White, Outdoor, or Original
   - Aspect ratio: 1:1 (Square), 4:5 (Portrait), or 9:16 (Vertical)

4. **AI Generation Process:**
   - `generateVirtualTryOn()` uses Gemini 2.5 Flash Image model
   - **Zero Tolerance Policy**: Preserves 100% garment structure (length, volume, hemline)
   - **3D Simulation**: Performs parametric reconstruction for realistic draping
   - **Identity Lock**: Maintains person's face, hair, body shape perfectly
   - **Garment Fidelity**: Exact replica of source garment (pattern, color, texture)

5. **Post-Generation:**
   - Credit deduction (1 credit)
   - Image displayed with options: Refine, Download, Share, Save to Gallery
   - `refineGeneratedImage()`: Allows text-based refinements
   - `diagnoseAndSuggestRefinement()`: AI quality check with auto-fix suggestions

#### Key Technical Details:
- **Model:** `gemini-2.5-flash-image`
- **Prompt Engineering:** Complex multi-part prompt with strict rules
- **Error Handling:** Handles quota exhaustion, API errors gracefully
- **State Management:** Saves session state to IndexedDB for persistence

---

### 2. E-commerce Asset Generator (Core Extraction)
**Route:** `/asset-generator`  
**Service:** `services/assetGeneratorService.ts`  
**Page:** `pages/AssetGeneratorPage.tsx`  
**Credits:** 1 credit per batch (up to 12 images)

#### How It Works:

1. **Image Upload & Analysis:**
   - User uploads lifestyle photos (can be messy backgrounds)
   - User selects gender (Male/Female)
   - System analyzes garment type and separability

2. **Garment Analysis:**
   - `analyzeFemaleGarment()` or `analyzeMaleGarment()`:
     - Identifies exact garment type from comprehensive list (100+ types)
     - Checks gender match
     - Determines if garment can be separated (2-part, 3-part, multi-part)
     - Returns recommended extraction: `full`, `upper`, `lower`, `separate`, `multi-separate`

3. **Extraction Process:**
   - `extractAssetsFromImage()` handles extraction:
     - **Single extraction**: For simple garments (full, upper, or lower)
     - **Multi-part extraction**: For separable garments (top+bottom, jacket+shirt+pants)
   - Uses `extractSingleAsset()` helper for each part
   - Processes parts in parallel (concurrency limit: 2)

4. **Ghost Mannequin Effect:**
   - Removes all human elements (person, body, face, limbs)
   - Creates invisible form/mannequin effect
   - Pure white background (#FFFFFF)
   - Professional studio lighting
   - 4K quality output

5. **Asset Organization:**
   - Extracted assets saved to `collection_assets` table
   - Categorized: Upper Body, Lower Body, Full Outfit
   - User can save individual items or composed outfits
   - `composeOutfit()`: Merges upper + lower body assets into full outfit

#### Key Technical Details:
- **Model:** `gemini-2.5-flash-image` for extraction
- **Batch Processing:** Up to 12 images per batch
- **Multi-part Separation:** Handles 2-part (top+bottom), 3-part (jacket+shirt+pants), multi-part
- **Storage:** Assets saved to `collection_assets` table with metadata

---

### 3. Perfect Product Forge (Catalog | Forged)
**Route:** `/catalog-forged`  
**Service:** `services/productQualityForgeService.ts`  
**Page:** `pages/CatalogForgedPage.tsx`  
**Credits:** 2 credits per garment (front + back)

#### How It Works:

1. **Image Upload:**
   - User uploads product photo (can be wrinkled, poor lighting)
   - User uploads quality reference image (professional studio example)
   - User selects garment type: Upper (T-shirt) or Lower (Pants)

2. **Analysis Phase (Lower Garments Only):**
   - `analyzePantImage()`: For pants, performs detailed analysis:
     - Pant type & style
     - Color & fabric details
     - Structural details (waistband, pockets, zipper)
     - Design elements (logos, patterns)
     - Fit characteristics

3. **9-Step Processing Workflow (Lower Garments):**
   - **Step 1:** Product detection & masking
   - **Step 2:** Background removal (clean cut)
   - **Step 3:** Geometry & alignment correction
   - **Step 4:** Fabric reconstruction (enhance, don't replace)
   - **Step 5:** Color normalization
   - **Step 6:** Shape refinement
   - **Step 7:** Studio background insertion
   - **Step 8:** Natural shadow synthesis
   - **Step 9:** 4K upscaling & final polish

4. **AI Generation:**
   - `generateProductQualityForge()` uses Gemini 3 Pro Image Preview
   - **Identity Supremacy**: 100% preservation of source garment identity
   - Matches reference image's studio environment and lighting
   - Removes wrinkles while preserving garment structure
   - Standardizes lighting and color correction

5. **Output:**
   - 4K Ultra HD quality (7680x4320)
   - Professional catalog-ready image
   - Batch processing support (up to 12 products)
   - ZIP download for batch exports

#### Key Technical Details:
- **Model:** `gemini-3-pro-image-preview`
- **Aspect Ratio:** 3:4 (enforced)
- **Image Size:** 4K
- **Identity Preservation:** Strict rules to preserve logos, colors, patterns

---

### 4. Style|Scene Campaign Director
**Route:** `/style-scene`  
**Service:** `services/styleSceneService.ts`  
**Page:** `pages/StyleScenePage.tsx`  
**Credits:** 1 credit per pose

#### How It Works:

1. **Setup Phase:**
   - User selects gender (Male/Female)
   - User selects garment type (Upper/Lower)
   - User uploads garment front view
   - User uploads garment back view (optional)
   - `validateGarmentType()`: Validates garment matches selected type

2. **Model Selection:**
   - User selects from model gallery
   - Models have predefined poses (20+ poses per model)
   - System loads model and pose data from `services/models.ts`

3. **Pose Selection:**
   - User selects poses to generate
   - Can select multiple poses for batch generation
   - Queue-based batch processing system

4. **Complementary Garment Configuration:**
   - **No Change**: Keep complementary garment as-is
   - **Upload**: Upload complementary garment image
   - **AI-Based**: Generate complementary garment with color matching

5. **Generation Process:**
   - `generatePoseSwapImage()` uses Gemini 3 Pro Image Preview
   - **Complete Clothing Removal**: Removes all original clothing
   - **3D Topology Mapping**: Reconstructs garment for realistic fit
   - **Dual Garment Application**: Applies main + complementary garments
   - **Identity Preservation**: Maintains person's pose, face, body shape

6. **Background Customization:**
   - `changeBackgroundImage()`: Changes background color/style
   - Recolors background while preserving subject and scene structure
   - Uses reference background image for color palette

7. **Campaign Management:**
   - Generated images stored in Supabase Storage
   - Organized by pose name
   - Background variations stored in collections
   - Batch download as ZIP

#### Key Technical Details:
- **Model:** `gemini-3-pro-image-preview`
- **Batch Processing:** Queue-based system with status tracking
- **Storage:** Images uploaded to Supabase Storage with signed URLs
- **Collections:** Background variations stored per pose

---

### 5. AI Pose Mimic
**Route:** `/pose-mimic`  
**Service:** `services/poseMimicService.ts`  
**Page:** `pages/PoseMimicPage.tsx`  
**Credits:** 1 credit per pose pair

#### How It Works:

1. **Image Upload:**
   - User uploads target person/model image
   - User uploads or selects pose reference image
   - Can upload multiple pairs (batch processing, up to 12 pairs)

2. **Batch Queue System:**
   - Each pair added to queue with status: `queued`, `processing`, `success`, `error`
   - Processes pairs sequentially or in parallel
   - Real-time status updates

3. **Generation Process:**
   - `generatePoseMimic()` uses Gemini 3 Pro Image Preview
   - **Pose Transfer**: Transfers exact pose from reference to target
   - **Identity Preservation**: Maintains person's face, body, clothing
   - **Simple Prompt**: "Reconstruct the person from the first image in the exact pose of the person in the second image"

4. **Storage & Management:**
   - Generated images uploaded to Supabase Storage
   - Signed URLs generated for display
   - Batch download as ZIP
   - Individual download options

5. **Pose Carousel:**
   - Interactive 3D orbital carousel
   - Pre-loaded pose reference images
   - Click to select pose reference

#### Key Technical Details:
- **Model:** `gemini-3-pro-image-preview`
- **Image Size:** 1K (optimized for speed)
- **Batch Limit:** 12 pairs
- **Storage:** Supabase Storage with user-specific folders

---

## 💳 Credit System

**Service:** `services/creditService.ts`

### How Credits Work:

1. **Credit Allocation:**
   - **Free Tier:** 10 credits on signup (expires in 1 month)
   - **Basic Plan:** 250 credits/month
   - **Pro Plan:** 750 credits/month
   - **Agency Plan:** 1,450 credits/month
   - **Annual Plans:** Same monthly credits, but discounted billing

2. **Credit Deduction:**
   - `deductCredits()`: Checks available credits before operation
   - Deducts credits after successful generation
   - Updates `used_credits` in database
   - Logs usage in `usage_tracking` table

3. **Credit Renewal:**
   - `allocateCredits()`: For renewals (same plan)
   - Rolls over unused credits from previous period
   - `resetCredits()`: For plan changes (discards old credits)

4. **Monthly Reset:**
   - Cron job: `/api/credits/monthly-reset`
   - Runs daily, checks for reset dates
   - Allocates monthly credits + rollover
   - Both monthly and annual plans reset monthly

5. **Expiration:**
   - Credits expire at end of billing period
   - System checks expiration before operations
   - Expired credits cannot be used

---

## 💰 Payment Integration (Lemon Squeezy)

**Service:** `api/lemonsqueezy/webhook.ts`

### How Payment Works:

1. **Checkout Flow:**
   - User clicks "Upgrade" on pricing page
   - `create-checkout` API creates Lemon Squeezy checkout session
   - User redirected to Lemon Squeezy payment page
   - On success, redirected back with `?payment=success`

2. **Webhook Processing:**
   - Lemon Squeezy sends webhook events
   - Events handled: `subscription_created`, `subscription_payment_success`, `subscription_updated`, `subscription_canceled`
   - Webhook verifies signature (if secret provided)
   - Maps variant ID to plan tier and billing period

3. **Credit Allocation on Payment:**
   - Extracts plan tier from variant ID
   - Calculates credits based on plan
   - Preserves signup bonus (if valid)
   - Allocates plan credits
   - Updates user profile with plan details

4. **Subscription Management:**
   - Updates `plan_tier`, `plan_status`, `billing_period`
   - Stores Lemon Squeezy customer/subscription IDs
   - Tracks renewal dates

---

## 📁 Asset Management

**Service:** `services/db.ts`

### How Assets Are Stored:

1. **Generated Assets (Gallery):**
   - Table: `generated_assets`
   - Storage: Supabase Storage bucket `generated_assets`
   - Path: `{userId}/{filename}`
   - Metadata: `source_feature`, `created_at`
   - Signed URLs: Generated for secure access (5-minute validity)

2. **Collection Assets:**
   - Table: `collection_assets`
   - Storage: Supabase Storage bucket `collection_assets`
   - Metadata: `asset_type`, `item_name`, `item_category`
   - Used for extracted garments from Asset Generator

3. **Style Scene Assets:**
   - Storage: Supabase Storage bucket `style_scene`
   - Path: `{userId}/{poseId}/{filename}`
   - Organized by pose name
   - Background variations stored separately

4. **Pose Mimic Assets:**
   - Storage: Supabase Storage bucket `pose_mimic`
   - Path: `{userId}/{filename}`
   - Batch processing support

### Asset Operations:
- **Save:** Upload to storage + insert DB record
- **Fetch:** Query DB + generate signed URLs
- **Delete:** Remove from DB + storage
- **Optimistic Updates:** UI updates immediately, background save

---

## 🔐 Authentication & Authorization

**Service:** `services/supabase.ts`

### How Auth Works:

1. **Authentication Methods:**
   - Email/Password (Supabase Auth)
   - Google OAuth (Supabase Auth)
   - Password reset via email

2. **Session Management:**
   - Supabase handles session with auto-refresh
   - Session stored in browser
   - `onAuthStateChange` listener updates user state

3. **Authorization (RLS):**
   - Row Level Security enabled on all tables
   - User-specific data isolation
   - Storage policies restrict file access to owner
   - Service role key for server-side operations

4. **User Profile:**
   - Table: `profiles`
   - Linked to `auth.users` via UUID
   - Stores: username, avatar, plan info, credits, theme preference

---

## 📊 Usage Tracking

**Service:** `services/usageTrackingService.ts`

### How Tracking Works:

1. **Usage Logging:**
   - `logUsage()`: Logs individual feature usage
   - `logBatchUsage()`: Logs batch operations
   - Stores: `feature_name`, `credits_used`, `created_at`

2. **Analytics:**
   - Table: `usage_tracking`
   - Tracks usage across all features
   - Used for analytics dashboard
   - Helps identify popular features

---

## 🎨 State Management

### Session Persistence:

1. **IndexedDB Storage:**
   - `services/imageStore.ts`: Stores images in IndexedDB
   - User-specific keys: `{feature}-{type}-image_{userId}`
   - Persists across page reloads

2. **Session Storage:**
   - `services/stateStore.ts`: Stores serializable state
   - User-specific keys: `{feature}State_{userId}`
   - Saves: form inputs, selections, generation state

3. **State Loading:**
   - On page load, checks for saved state
   - Restores images from IndexedDB
   - Restores form state from session storage
   - Handles bridged data (cross-feature navigation)

---

## 🔄 Error Handling

### Error Management:

1. **AI API Errors:**
   - `handleGeminiError()`: Centralized error handler
   - Detects quota exhaustion (429 errors)
   - Provides user-friendly error messages
   - Logs detailed errors for debugging

2. **Credit Errors:**
   - Checks credits before operations
   - Returns clear error messages
   - Prevents generation if insufficient credits

3. **Storage Errors:**
   - Handles upload failures
   - Cleans up orphaned files
   - Provides rollback mechanisms

---

## 🚀 Performance Optimizations

1. **Batch Processing:**
   - Queue-based system for multiple operations
   - Parallel processing with concurrency limits
   - Real-time status updates

2. **Image Optimization:**
   - Base64 encoding for immediate display
   - Background upload to storage
   - Signed URLs for secure access
   - Optimistic UI updates

3. **State Caching:**
   - Session-cached gallery assets
   - Prevents redundant API calls
   - Force refresh option available

---

## 📱 User Experience Features

1. **Theme Support:**
   - Light/Dark/System theme
   - Stored in user profile
   - Applied on login

2. **Fullscreen Image View:**
   - Click to expand images
   - ESC key to close
   - Browser back button support

3. **Refinement Modal:**
   - Text-based image refinements
   - AI-powered suggestions
   - One-click fixes

4. **Collection Management:**
   - Organize assets by category
   - Background variations per pose
   - Batch download options

---

## 🔒 Security Features

1. **Row Level Security (RLS):**
   - Database-level access control
   - User-specific data isolation

2. **Storage Policies:**
   - User-specific file access
   - Signed URLs with expiration
   - No public access

3. **Webhook Verification:**
   - Signature verification (optional)
   - Secure payment processing

4. **Input Validation:**
   - TypeScript type checking
   - Runtime validation
   - Sanitized user inputs

---

## 📈 Scalability Considerations

1. **Serverless Architecture:**
   - Vercel serverless functions
   - Auto-scaling
   - Edge network distribution

2. **Database Optimization:**
   - Indexed queries
   - Batch operations
   - Connection pooling

3. **Storage Strategy:**
   - User-specific folders
   - Efficient file organization
   - Cleanup mechanisms

---

## 🎯 Key Technical Highlights

1. **AI Model Selection:**
   - Gemini 2.5 Flash: Fast, cost-effective (Virtual Try-On, Asset Generator)
   - Gemini 3 Pro Image: High quality (Product Forge, Style Scene, Pose Mimic)

2. **Prompt Engineering:**
   - Complex multi-part prompts
   - Strict rules and constraints
   - Zero tolerance policies for quality

3. **State Management:**
   - Optimistic updates
   - Session persistence
   - Cross-feature navigation

4. **Error Recovery:**
   - Graceful degradation
   - User-friendly messages
   - Retry mechanisms

---

## 📝 Conclusion

ZOLA Studio is a comprehensive, production-ready SaaS platform that combines five powerful AI features into a unified workflow. Each feature is carefully designed with:

- **Robust error handling**
- **Credit system integration**
- **Secure asset management**
- **Optimized performance**
- **Excellent user experience**

The platform successfully eliminates traditional barriers in fashion photography while maintaining professional quality standards.

---

*Last Updated: Based on complete codebase analysis*  
*Version: ZOLA Studio 2.0*












