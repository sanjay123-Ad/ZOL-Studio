import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from '../types';

/**
 * Helper to handle Gemini errors consistently
 */
const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini API Error during ${context}:`, error);
    if (error.toString().includes('RESOURCE_EXHAUSTED') || error.toString().includes('429')) {
        throw new Error("Quota Exceeded: You have exceeded your API request limit. Please try again later.");
    }
    const message = error.message || 'An unknown error occurred.';
    throw new Error(`An AI service error occurred during ${context}. Details: ${message}`);
};

/**
 * Helper to get fresh AI client using process.env.API_KEY
 */
function getAiClient() {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * Analyze pant image using Gemini 3 Pro Image to extract detailed information
 * This ensures accurate recreation matching the reference style
 */
async function analyzePantImage(sourceImage: ImageFile): Promise<string> {
    try {
        const ai = getAiClient();
        const model = 'gemini-3-pro-image-preview';

        const analysisPrompt = `# TASK: COMPREHENSIVE PANT ANALYSIS FOR PRODUCT RECREATION

Analyze the provided pant/trouser image in extreme detail. Extract ALL critical information needed to recreate this pant accurately in a professional studio setting.

## REQUIRED ANALYSIS:

1. **PANT TYPE & STYLE:**
   - Type: (e.g., jeans, chinos, trousers, cargo pants, joggers, etc.)
   - Style: (e.g., straight leg, slim fit, relaxed fit, tapered, wide leg, etc.)
   - Length: (e.g., full length, cropped, ankle length, etc.)

2. **COLOR & FABRIC:**
   - Primary color: (exact shade description)
   - Secondary colors: (if any, like contrast stitching)
   - Fabric type: (e.g., denim, cotton, twill, etc.)
   - Texture: (e.g., smooth, distressed, faded, etc.)

3. **STRUCTURAL DETAILS:**
   - Waistband: (height, style, elastic/button/zipper closure)
   - Belt loops: (number, style, placement)
   - Pockets: (front pockets style, back pockets style, cargo pockets if any)
   - Zipper/Button: (type, color, placement)
   - Seams: (stitching color, style)
   - Cuffs: (hem style, length)

4. **DESIGN ELEMENTS:**
   - Logos/Branding: (exact placement, size, color)
   - Patterns: (if any, like stripes, checks, etc.)
   - Decorative elements: (patches, embroidery, rivets, etc.)
   - Distressing: (if any, like rips, fading, etc.)

5. **FIT CHARACTERISTICS:**
   - Waist fit: (low-rise, mid-rise, high-rise)
   - Leg fit: (slim, regular, relaxed, oversized)
   - Overall silhouette: (tapered, straight, wide)

## OUTPUT FORMAT:
Provide a detailed, structured analysis that can be used to recreate this exact pant in a professional studio environment. Be extremely specific about colors, measurements, and design elements.`;

        const sourcePart = { inlineData: { data: sourceImage.base64, mimeType: sourceImage.mimeType } };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [sourcePart, { text: analysisPrompt }] },
            config: {
                responseModalities: [Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    return part.text;
                }
            }
        }

        throw new Error("Failed to analyze pant image.");
    } catch (error) {
        console.error("Pant analysis error:", error);
        // Return a fallback analysis if analysis fails
        return "Standard pant with standard features. Preserve all visible design elements, colors, and structural details from the source image.";
    }
}

/**
 * ULTIMATE Product Quality Forge Function
 * Optimized for Gemini 3 Pro (Pro Forge).
 * STRICT IDENTITY MANDATE: Ensures the garment from IMAGE_1 is preserved 100%.
 */
export async function generateProductQualityForge(
    sourceImage: ImageFile,
    referenceImage: ImageFile,
    garmentType: 'upper' | 'lower' = 'upper',
    userId?: string
): Promise<string> {
    try {
        if (!sourceImage || !referenceImage) {
            throw new Error('Both source garment and quality reference images must be provided.');
        }

        const ai = getAiClient();
        const model = 'gemini-3-pro-image-preview';

        // For lower garments, analyze the source image first to extract detailed information
        let pantAnalysis = '';
        if (garmentType === 'lower') {
            pantAnalysis = await analyzePantImage(sourceImage);
        }

        // Garment-specific prompt instructions
        const garmentSpecificInstructions = garmentType === 'lower'
            ? `## LOWER GARMENT (PANT/TROUSER) - REFERENCE MATCH MANDATE

**CRITICAL: IMAGE 2 is the user-selected reference.** The output MUST look like IMAGE 2 in every way except the garment itself.

- **REFERENCE FIDELITY:** Your output must be indistinguishable from IMAGE 2 in: display method (flat-lay, mannequin, or hanging), pant pose/angle and arrangement, camera height and distance, background color and gradient, shadow placement and softness, lighting direction and intensity, framing and crop. Only the pant design (colors, logos, patterns, structure) comes from IMAGE 1.

- **DISPLAY REPLICA:** The pant from IMAGE 1 must be displayed EXACTLY as in IMAGE 2: same fold style, same leg arrangement, same waistband position, same overall silhouette and composition. Study IMAGE 2's pant display and replicate it precisely with IMAGE 1's design.

- **STRUCTURAL ACCURACY:** Preserve the exact waistband style, pocket placement, leg cut, hem style, and fit from IMAGE 1.

## LOWER GARMENT (PANT/TROUSER) - POWERFUL STEP-BY-STEP PROCESSING:

${pantAnalysis ? `## AI ANALYSIS OF SOURCE PANT:
${pantAnalysis}

**CRITICAL:** Use the above analysis to RECREATE this exact pant following the 9-step process below. Do NOT simply copy the input image.

` : ''}## STEP 1: PRODUCT DETECTION & MASKING

- **What to do:** Detect the pant/trouser as the primary object in IMAGE 1
- **Process:** Mark everything else as background noise (floor, wall edge, feet, shadows, camera artifacts)
- **Output:** Create a high-precision binary mask of the pant with clean edges around waist, legs, and cuffs
- **Important:** NO cropping yet — only isolation

## STEP 2: BACKGROUND REMOVAL (CLEAN CUT)

- **Using the mask:** Remove all background elements (floor texture, walls, shadows)
- **Preserve:** Natural garment outline with no hard cut edges
- **Why this matters:** Bad masking = fake looking product. Good masking = brand-level image

## STEP 3: GEOMETRY & ALIGNMENT CORRECTION

- **Fix orientation:** Rotate pant to true vertical alignment
- **Center alignment:** Center waistband horizontally, balance left & right legs
- **Distortion correction:** Correct any lens distortion or perspective issues
- **Result:** Pant should sit like a professional studio flat-lay

## STEP 4: FABRIC RECONSTRUCTION (NOT GENERATION)

**CRITICAL - What you must NOT do:**
- ❌ Do NOT change fabric type
- ❌ Do NOT invent new patterns
- ❌ Do NOT smooth unrealistically

**What you MUST do:**
- ✅ Enhance existing fabric texture from IMAGE 1
- ✅ Increase micro-contrast for detail visibility
- ✅ Sharpen stitching paths and seams
- ✅ Reduce random wrinkles while keeping natural wear marks
- ✅ Think of it as: Same pant, photographed under perfect lighting

## STEP 5: COLOR NORMALIZATION

- **Fix camera issues:** Correct yellow/grey reflections, flat colors
- **Corrections:** White balance correction, preserve original pant color (from IMAGE 1)
- **Enhancement:** Lift highlights slightly, deepen shadows slightly
- **Result:** Color looks premium and natural, not artificially edited

## STEP 6: SHAPE REFINEMENT

- **Subtle improvements:** Smooth leg edges, clean inner thigh seam
- **Symmetry:** Slightly improve symmetry, straighten waistline
- **Important:** This is NOT reshaping fit — only visual refinement of the existing pant structure

## STEP 7: STUDIO BACKGROUND INSERTION

- **Background:** Apply pure white / studio white background (matching IMAGE 2's style)
- **No distractions:** No gradients, no patterns, no visual noise
- **Standard:** Follow e-commerce marketplace standards (Amazon, Myntra, Flipkart style)

## STEP 8: NATURAL SHADOW SYNTHESIS

- **Shadow characteristics:** Soft, low opacity, slight blur
- **Placement:** Place shadows under cuffs and natural contact points
- **Rule:** Shadow must feel like gravity, not artificial design
- **Match:** Replicate shadow style from IMAGE 2's reference

## STEP 9: 4K UPSCALING & FINAL POLISH

- **Super-resolution:** Apply 4K upscaling
- **Edge cleanup:** Clean all edges, remove noise
- **Output sharpening:** Final sharpening for catalog-ready quality
- **Export:** Product-ready resolution, clean aspect ratio, catalog-ready format

## CRITICAL IDENTITY PRESERVATION:

- **100% Identity Lock:** All logos, branding, colors, patterns, and design elements from IMAGE 1 must be preserved exactly
- **Structural Accuracy:** Waistband design, belt loops, zipper/button, pockets, seams, cuffs - all must match IMAGE 1 exactly
- **Color Accuracy:** Exact color shades from IMAGE 1 must be maintained
- **Fabric Type:** Do NOT change the fabric type - preserve denim, cotton, twill, etc. from IMAGE 1`
            : `## UPPER GARMENT (T-SHIRT/TOP) - REFERENCE MATCH MANDATE

**CRITICAL: IMAGE 2 is the user-selected reference.** The output MUST look like IMAGE 2 in every way except the garment itself.

- **REFERENCE FIDELITY:** Your output must be indistinguishable from IMAGE 2 in: hanger type and position, garment pose/angle, camera height and distance, background color and gradient, shadow placement and softness, lighting direction and intensity, framing and crop. Only the garment design (colors, logos, patterns) comes from IMAGE 1.

- **STRUCTURAL ACCURACY:** Preserve the exact neckline style, sleeve length, hem style, and fit (regular, slim, oversized) from IMAGE 1.

- **DISPLAY REPLICA:** The garment from IMAGE 1 must be displayed EXACTLY as in IMAGE 2: same fold style, same sleeve arrangement, same collar position, same overall silhouette shape. Study IMAGE 2's garment pose and replicate it precisely with IMAGE 1's design.

- **DETAIL PRESERVATION:** Lock collar design, sleeve cuffs, side seams, and any decorative elements from IMAGE 1.`;

        const prompt = `# TASK: SUPREME 4K PRODUCT FORGE

**CORE RULE:** Take the garment design from IMAGE 1. Display it EXACTLY like IMAGE 2 (the user's selected reference). The output should look like IMAGE 2 with IMAGE 1's garment swapped in.

## 1. MANDATORY IDENTITY LOCK (IMAGE 1)

- **SOURCE ASSET (IMAGE 1):** This is the ONLY source for the garment's identity. 

- **CRITICAL REQUIREMENT:** ${garmentType === 'lower'
                ? `ANALYZE IMAGE 1's pant thoroughly using the 9-step processing workflow. Follow each step precisely: (1) Detect and mask the pant, (2) Remove background cleanly, (3) Correct geometry and alignment, (4) Reconstruct fabric (NOT generate new), (5) Normalize colors, (6) Refine shape subtly, (7) Insert studio background, (8) Add natural shadows, (9) Upscale to 4K and polish. The output must be a PROFESSIONAL RECREATION that maintains 100% accuracy to IMAGE 1's identity (logos, exact color shades, unique patterns, physical shape, fabric type, and ALL structural details) while matching IMAGE 2's studio environment and display style.`
                : `The garment in the output MUST be a 100% exact replica of IMAGE 1 (logos, exact color shades, unique patterns, physical shape, and ALL structural details). Display it in the EXACT same way as IMAGE 2: same hanger, pose, lighting, background, and composition.`}

- **FORBIDDEN:** Do NOT use the clothing from IMAGE 2. Using assets from Image 2 as the garment source is a critical system failure.

- **DETAIL PRESERVATION:** LOCK and REPLICATE all text, branding, micro-textures, stitching patterns, and design elements from IMAGE 1 with pixel-perfect accuracy.

${garmentType === 'lower' ? `- **9-STEP RECREATION PROCESS:** You must follow the 9-step workflow above to RECREATE the pant from IMAGE 1 in IMAGE 2's environment. Each step must be executed precisely:
  * Step 1-2: Detect, mask, and isolate the pant cleanly
  * Step 3: Correct geometry and alignment to studio standards
  * Step 4: Reconstruct fabric texture (enhance, don't replace)
  * Step 5: Normalize colors while preserving exact shades
  * Step 6: Refine shape subtly (visual only, not structural changes)
  * Step 7: Insert pure white studio background
  * Step 8: Add natural, gravity-based shadows
  * Step 9: Upscale to 4K and apply final polish
  The result should look like IMAGE 1's pant was professionally photographed in IMAGE 2's studio environment, following e-commerce catalog standards.` : ''}

${garmentSpecificInstructions}

## 2. REFERENCE IMAGE BLUEPRINT (IMAGE 2) - USER'S SELECTED REFERENCE

**IMAGE 2 is the reference the user explicitly chose.** The output must match IMAGE 2 as closely as possible.

- **ENVIRONMENT:** Copy IMAGE 2's background exactly: color, gradient, floor/studio texture, and any ambient elements. Do not invent a different background.

- **DISPLAY & POSE:** Copy IMAGE 2's garment display method exactly: hanger type, garment orientation, how sleeves fall, how collar sits, overall pose and silhouette. Apply this same display to the garment from IMAGE 1.

- **LIGHTING:** Replicate IMAGE 2's lighting precisely: direction, softness, highlights, shadows, and overall exposure. The output should feel like it was shot in the same studio setup.

- **COMPOSITION:** Match IMAGE 2's camera angle, perspective, framing, and crop. Same distance from subject, same aspect ratio feel.

${garmentType === 'lower' ? `- **RECREATION PROCESS:** You must RECREATE IMAGE 1's pant in IMAGE 2's environment. This means:
  * Analyze IMAGE 1's pant: understand its type, color, style, structure, and all design elements
  * Understand IMAGE 2's environment: studio setting, lighting, display method, background
  * RECREATE the pant: generate a new image of IMAGE 1's pant as if it was professionally photographed in IMAGE 2's studio
  * The result should be a professional recreation, not a copy or overlay of IMAGE 1` : ''}

## 3. AESTHETIC UPGRADE PROTOCOL

- **SHARPNESS:** Apply extreme 4K edge definition. Every stitch, seam, logo border, and fabric texture must be razor-sharp and hyper-detailed.

- **VIBRANCE:** Aggressively boost color depth and saturation to make the garment "pop" for high-end catalog use, while maintaining the EXACT color shades from IMAGE 1.

- **LUMINOSITY:** Ensure the final scene is bright, clean, and perfectly exposed with professional studio quality.

- **WRINKLE REMOVAL:** Eliminate ALL wrinkles, creases, and fabric distortions while maintaining the garment's natural shape and structure from IMAGE 1.

## FINAL OUTPUT SPECIFICATION

- Return ONLY the final forged image.

- No side-by-side comparison. No text. No watermarks.

- Commercial 4K quality only.

${garmentType === 'upper'
    ? `- **REFERENCE MATCH:** The output must look like IMAGE 2 with IMAGE 1's garment. If someone compared your output to IMAGE 2, they should see the same scene—background, lighting, hanger, pose, framing—but with the user's garment (from IMAGE 1) in place.`
    : '- **REFERENCE MATCH:** The output must look like IMAGE 2 with IMAGE 1\'s pant. If someone compared your output to IMAGE 2, they should see the same scene—background, lighting, display method, pant pose/arrangement, framing—but with the user\'s pant (from IMAGE 1) in place.'}`;

        const sourcePart = { inlineData: { data: sourceImage.base64, mimeType: sourceImage.mimeType } };
        const refPart = { inlineData: { data: referenceImage.base64, mimeType: referenceImage.mimeType } };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [sourcePart, refPart, { text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "3:4",
                    imageSize: "4K"
                },
                responseModalities: [Modality.IMAGE],
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const result = part.inlineData.data;
                    return result;
                }
            }
        }

        throw new Error("Forge failed. Ensure the source garment is clearly visible and try again.");
    } catch (error) {
        handleGeminiError(error, 'product quality forge');
    }
}

