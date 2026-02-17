import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from '../types';
import { logUsage } from './usageTrackingService';
import { getGarmentCategories } from './styleSceneGarments';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini API Error during ${context}:`, error);

    // Check for specific Gemini API error structure or 429 status code.
    if (error.toString().includes('RESOURCE_EXHAUSTED') || error.toString().includes('429')) {
        throw new Error("Quota Exceeded: You have exceeded your API request limit. Please check your plan and billing details, or try again later.");
    }

    const message = error.message || 'An unknown error occurred.';
    throw new Error(`An AI service error occurred during ${context}. Details: ${message}`);
};


export interface ComplementaryGarmentConfig {
    type: 'no-change' | 'upload' | 'ai-based';
    uploadedImage?: ImageFile;
    aiCategoryId?: string;
    aiSubcategoryId?: string;
    aiCustomText?: string;
    mainGarmentImage?: ImageFile; // For color matching
}

export async function generatePoseSwapImage(
    garmentImage: ImageFile,
    poseImage: ImageFile,
    fixInstruction?: string,
    userId?: string,
    garmentType?: 'upper' | 'lower',
    complementaryGarment?: ComplementaryGarmentConfig,
    gender?: 'Male' | 'Female'
): Promise<string> {
    try {
        if (!garmentImage || !poseImage) {
            throw new Error('Both garment and pose images must be provided.');
        }

        const model = 'gemini-3-pro-image-preview';

        // Build prompt based on complementary garment configuration
        let prompt = `# INSTRUCTION: AI-DRIVEN HIGH-FIDELITY GARMENT REDRESSING (ZERO TOLERANCE PROTOCOL)

## GOAL
Perform a professional "Digital Redressing" on the person in the "Base Image".`;

        const imageParts: any[] = [];

        // Add main garment image
        imageParts.push({ inlineData: { data: garmentImage.base64, mimeType: garmentImage.mimeType } });

        if (complementaryGarment) {
            if (complementaryGarment.type === 'no-change') {
                // Only swap the main garment, keep complementary garment as-is
                prompt += `

## CORE COMPONENTS (Inputs)
- **Image 1 (Main Garment):** The ${garmentType === 'upper' ? 'upper body' : 'lower body'} clothing to be transferred.
- **Image 2 (Base Image):** The target person and environment.

## CRITICAL REDRESSING PROTOCOL
1. **SELECTIVE CLOTHING REMOVAL:** You MUST identify and digitally REMOVE ONLY the ${garmentType === 'upper' ? 'upper body clothing (shirt, t-shirt, top, jacket, etc.)' : 'lower body clothing (pants, jeans, shorts, skirt, etc.)'} currently worn by the person in Image 2.
2. **PRESERVE COMPLEMENTARY GARMENT:** You MUST NOT change or modify the ${garmentType === 'upper' ? 'lower body clothing (pants, jeans, shorts, etc.)' : 'upper body clothing (shirt, t-shirt, top, etc.)'} - keep it exactly as shown in Image 2.
3. **CLEAN REPLACEMENT:** Replace the removed ${garmentType === 'upper' ? 'upper' : 'lower'} garment entirely with the "Main Garment" from Image 1.
4. **3D TOPOLOGY MAPPING:** Perform a 3D parametric reconstruction of the garment in Image 1. Wrap it realistically around the body contours of the person in Image 2.
5. **ZERO ALTERATION OF BASE:** You MUST NOT change the person's pose, body shape, face, hair, or the background of Image 2. Only the specified garment changes.`;
            } else if (complementaryGarment.type === 'upload' && complementaryGarment.uploadedImage) {
                // Swap both garments: main + uploaded complementary
                imageParts.push({ inlineData: { data: complementaryGarment.uploadedImage.base64, mimeType: complementaryGarment.uploadedImage.mimeType } });
                prompt += `

## CORE COMPONENTS (Inputs)
- **Image 1 (Main Garment):** The ${garmentType === 'upper' ? 'upper body' : 'lower body'} clothing to be transferred.
- **Image 2 (Complementary Garment):** The ${garmentType === 'upper' ? 'lower body' : 'upper body'} clothing to be transferred.
- **Image 3 (Base Image):** The target person and environment.

## CRITICAL REDRESSING PROTOCOL
1. **COMPLETE CLOTHING REMOVAL (MANDATORY):** You MUST first identify and digitally REMOVE EVERY piece of clothing currently worn by the person in Image 3. NO traces, shadows, or textures of the original outfit should be visible.
2. **DUAL GARMENT REPLACEMENT:** Replace the removed clothing with BOTH garments:
   - Replace the ${garmentType === 'upper' ? 'upper body' : 'lower body'} clothing with the "Main Garment" from Image 1.
   - Replace the ${garmentType === 'upper' ? 'lower body' : 'upper body'} clothing with the "Complementary Garment" from Image 2.
3. **3D TOPOLOGY MAPPING:** Perform 3D parametric reconstruction of both garments and wrap them realistically around the body contours.
4. **PERFECT INTEGRATION:** Ensure both garments integrate seamlessly with each other (e.g., shirt tucks into pants naturally, colors complement each other).
5. **ZERO ALTERATION OF BASE:** You MUST NOT change the person's pose, body shape, face, hair, or the background of Image 3. Only the clothes change.`;
            } else if (complementaryGarment.type === 'ai-based') {
                // Swap main garment + AI-generated complementary with color matching
                // Look up category and subcategory names and descriptions if available
                let garmentDescription = complementaryGarment.aiCustomText || 'complementary garment';
                let garmentDetails = '';

                if (complementaryGarment.aiCategoryId && complementaryGarment.aiSubcategoryId && gender && garmentType) {
                    const complementaryGarmentType = garmentType === 'upper' ? 'lower' : 'upper';
                    const categories = getGarmentCategories(gender, complementaryGarmentType);
                    const category = categories.find(cat => cat.id === complementaryGarment.aiCategoryId);

                    if (category) {
                        const subcategory = category.subcategories.find(sub => sub.id === complementaryGarment.aiSubcategoryId);

                        if (subcategory) {
                            // Use the actual subcategory name (e.g., "Korean Joggers") as the primary description
                            garmentDescription = subcategory.name;

                            // Build detailed specification
                            garmentDetails = `\n\n## COMPLEMENTARY GARMENT SPECIFICATION (MANDATORY)
You MUST generate a ${category.name} specifically of the "${subcategory.name}" style.

### Category: ${category.name}
${category.description ? `- Category Description: ${category.description}` : ''}

### Subcategory: ${subcategory.name}
${subcategory.description ? `- Subcategory Description: ${subcategory.description}` : ''}

### CRITICAL REQUIREMENTS:
- The garment MUST be exactly "${subcategory.name}" style - not a generic version or similar style.
- All distinguishing features, fit characteristics, and design elements specific to "${subcategory.name}" MUST be accurately represented.
- If the subcategory has specific characteristics (e.g., "Korean Joggers" have a clean, minimalist aesthetic with tapered but relaxed fit), you MUST incorporate ALL of these characteristics precisely.`;
                        } else if (complementaryGarment.aiCategoryId) {
                            // Only category selected, no subcategory
                            garmentDescription = category.name;
                            garmentDetails = `\n\n## COMPLEMENTARY GARMENT SPECIFICATION
You MUST generate a ${category.name}${category.description ? ` (${category.description})` : ''}.`;
                        }
                    }
                }

                let colorMatchingInstruction = '';
                if (complementaryGarment.mainGarmentImage) {
                    colorMatchingInstruction = `\n\n## COLOR MATCHING REQUIREMENT
- Analyze the dominant colors in the main garment (Image 1).
- Generate the complementary ${garmentType === 'upper' ? 'upper body' : 'lower body'} garment (${garmentDescription}) in colors that PERFECTLY MATCH and complement the main garment's color palette.
- Ensure the colors harmonize beautifully - they should look like a cohesive, professionally styled outfit.`;
                }

                prompt += `

## CORE COMPONENTS (Inputs)
- **Image 1 (Main Garment):** The ${garmentType === 'upper' ? 'upper body' : 'lower body'} clothing to be transferred.
- **Image 2 (Base Image):** The target person and environment.

## COMPLEMENTARY GARMENT REQUIREMENT
You MUST also create and apply a ${garmentType === 'upper' ? 'upper body' : 'lower body'} garment that complements the main garment. This complementary garment should be:
- **Exact Style:** ${garmentDescription}
- Perfectly fitted to the person in Image 2
- Professionally designed and realistic
${garmentDetails}${colorMatchingInstruction}

## CRITICAL REDRESSING PROTOCOL
1. **COMPLETE CLOTHING REMOVAL (MANDATORY):** You MUST first identify and digitally REMOVE EVERY piece of clothing currently worn by the person in Image 2.
2. **DUAL GARMENT APPLICATION:** 
   - Apply the "Main Garment" from Image 1 to the ${garmentType === 'upper' ? 'upper body' : 'lower body'}.
   - Generate and apply the complementary ${garmentType === 'upper' ? 'upper body' : 'lower body'} garment (${garmentDescription}) to the ${garmentType === 'upper' ? 'upper body' : 'lower body'}, ensuring it matches the exact specifications above.
3. **3D TOPOLOGY MAPPING:** Perform 3D parametric reconstruction of the main garment and generate the complementary garment with realistic body contours that match the specified style characteristics.
4. **PERFECT INTEGRATION:** Ensure both garments integrate seamlessly (e.g., shirt tucks into pants naturally, colors complement each other perfectly).
5. **ZERO ALTERATION OF BASE:** You MUST NOT change the person's pose, body shape, face, hair, or the background of Image 2. Only the clothes change.`;
            }
        } else {
            // Original behavior: swap only the main garment, remove all clothing
            prompt += `

## CORE COMPONENTS (Inputs)
- **Image 1 (New Garment):** The clothing to be transferred.
- **Image 2 (Base Image):** The target person and environment.

## CRITICAL REDRESSING PROTOCOL (ULTIMATE RULE E.4)
1. **COMPLETE CLOTHING REMOVAL (MANDATORY):** You MUST first identify and digitally REMOVE every piece of clothing currently worn by the person in Image 2. NO traces, shadows, or textures of the original outfit (collars, hems, layers) should be visible.
2. **CLEAN REPLACEMENT:** Replace the removed clothing entirely with the "New Garment" from Image 1. 
3. **3D TOPOLOGY MAPPING:** Perform a 3D parametric reconstruction of the garment in Image 1. Wrap it realistically around the body contours of the person in Image 2.
4. **NO GHOSTING/MERGING:** Ensure there is ZERO blending between the original clothes in Image 2 and the new garment from Image 1. The original clothes must be 100% replaced.
5. **ZERO ALTERATION OF BASE:** You MUST NOT change the person's pose, body shape, face, hair, or the background of Image 2. Only the clothes change.`;
        }

        prompt += `

## QUALITY STANDARDS
- Preserve 100% of the color, pattern, and texture of Image 1 (main garment).
${complementaryGarment?.type === 'upload' ? '- Preserve 100% of the color, pattern, and texture of Image 2 (complementary garment).' : ''}
- Lighting and shadows on the garments MUST match the original scene in the base image.
- 8K resolution, ultra-photorealistic output with maximum clarity and detail.

## OUTPUT FORMAT
Return ONLY the final redressed image. No text, logos, or watermarks.`;

        // Add pose image last
        imageParts.push({ inlineData: { data: poseImage.base64, mimeType: poseImage.mimeType } });

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [...imageParts, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                    aspectRatio: "3:4",
                    imageSize: "4K", // Highest quality for style scene outputs
                },
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const result = part.inlineData.data;
                // Log usage after successful generation
                if (userId) {
                    const promptLength = prompt.length;
                    // Log usage asynchronously for speed
                    const featureName = fixInstruction ? 'Style Scene Fix' : 'Style Scene Generation';
                    logUsage(userId, featureName, imageParts.length, promptLength, 1, true).catch(console.error);
                }
                return result;
            }
        }

        throw new Error("Failed to generate a valid image. The model did not return an image part. This can happen if the inputs are unclear. Please try a different source image or prompt.");
    } catch (error) {
        handleGeminiError(error, 'style scene generation');
    }
}


export async function changeBackgroundImage(
    subjectImage: ImageFile,
    backgroundImage: ImageFile,
    userId?: string
): Promise<string> {
    try {
        if (!subjectImage || !backgroundImage) {
            throw new Error('Both subject and background images must be provided.');
        }

        const model = 'gemini-3-pro-image-preview';

        const prompt = `# TASK: AI BACKGROUND RECOLORING & STYLE TRANSFER (STRICT SUBJECT & SCENE LOCK)

## GOAL
Take the generated image (Image 1) and change its background color to match the color palette of Image 2. You are NOT replacing the scene; you are RECOLORING it.

## CORE INPUTS
- **Image 1 (Source Scene):** The original generated image containing the model, their pose, their outfit, and the initial background/surroundings.
- **Image 2 (Color Reference):** The target background whose color palette should be extracted.

## CRITICAL EXECUTION PROTOCOL (STRICT LOCK)
1. **PROTECT THE SUBJECT & SCENE STRUCTURE:** You MUST NOT change the person or the structural elements of the background in Image 1.
   - **Person Lock:** Keep the person's face, hair, skin tone, and outfit exactly as they appear in Image 1.
   - **Structure Lock:** Maintain any furniture (chairs, stools), floors, or walls present in Image 1.
2. **BACKGROUND RECOLORING (MANDATORY):** Extract the dominant color and tonal mood from Image 2 and apply it to the background of Image 1.
   - Example: If Image 1 has a white studio background and Image 2 is blue, the background in Image 1 should become the EXACT shade of blue from Image 2.
   - The original lighting and shadows from Image 1 MUST be preserved but rendered in the new color.
3. **NO BACKGROUND REPLACEMENT:** DO NOT replace the background of Image 1 with the contents of Image 2. Use Image 2 ONLY for its color information.
4. **SEAMLESS INTEGRATION:** Ensure the transition between the person and the newly colored background is perfect, with zero color bleeding or artifacts.

## QUALITY STANDARDS
- The person and background objects remain identical to Image 1 in terms of shape and position.
- The background color matches the palette of Image 2.
- 8K resolution, ultra-photorealistic finish with maximum clarity and detail.

## OUTPUT FORMAT
Return ONLY the final recolored image. No text, logos, or watermarks.`;

        const subjectImagePart = { inlineData: { data: subjectImage.base64, mimeType: subjectImage.mimeType } };
        const backgroundImagePart = { inlineData: { data: backgroundImage.base64, mimeType: backgroundImage.mimeType } };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [subjectImagePart, backgroundImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
                imageConfig: {
                    aspectRatio: "3:4",
                    imageSize: "4K", // Match main style scene quality
                },
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const result = part.inlineData.data;
                // Log usage after successful generation
                if (userId) {
                    const promptLength = prompt.length;
                    logUsage(userId, 'Change Background', 2, promptLength, 1, false).catch(console.error);
                }
                return result;
            }
        }

        throw new Error("Failed to generate the image. The model did not return an image part. This can happen if the subject cannot be clearly identified in the source image.");

    } catch (error) {
        handleGeminiError(error, 'background change');
    }
}