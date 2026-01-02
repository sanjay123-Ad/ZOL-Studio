import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from '../types';
import { logUsage } from './usageTrackingService';

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


export async function generatePoseSwapImage(
    garmentImage: ImageFile,
    poseImage: ImageFile,
    fixInstruction?: string,
    userId?: string
): Promise<string> {
    try {
        if (!garmentImage || !poseImage) {
            throw new Error('Both garment and pose images must be provided.');
        }
        
        const model = 'gemini-3-pro-image-preview';
        
        const prompt = `# INSTRUCTION: AI-DRIVEN HIGH-FIDELITY GARMENT REDRESSING (ZERO TOLERANCE PROTOCOL)

## GOAL
Perform a professional "Digital Redressing" on the person in the "Base Image".

## CORE COMPONENTS (Inputs)
- **Image 1 (New Garment):** The clothing to be transferred.
- **Image 2 (Base Image):** The target person and environment.

## CRITICAL REDRESSING PROTOCOL (ULTIMATE RULE E.4)
1. **COMPLETE CLOTHING REMOVAL (MANDATORY):** You MUST first identify and digitally REMOVE every piece of clothing currently worn by the person in Image 2. NO traces, shadows, or textures of the original outfit (collars, hems, layers) should be visible.
2. **CLEAN REPLACEMENT:** Replace the removed clothing entirely with the "New Garment" from Image 1. 
3. **3D TOPOLOGY MAPPING:** Perform a 3D parametric reconstruction of the garment in Image 1. Wrap it realistically around the body contours of the person in Image 2.
4. **NO GHOSTING/MERGING:** Ensure there is ZERO blending between the original clothes in Image 2 and the new garment from Image 1. The original clothes must be 100% replaced.
5. **ZERO ALTERATION OF BASE:** You MUST NOT change the person's pose, body shape, face, hair, or the background of Image 2. Only the clothes change.

## QUALITY STANDARDS
- Preserve 100% of the color, pattern, and texture of Image 1.
- Lighting and shadows on the new garment MUST match the original scene in Image 2.
- 4K resolution, ultra-photorealistic output.

## OUTPUT FORMAT
Return ONLY the final redressed image. No text, logos, or watermarks.`;
        
        const garmentImagePart = { inlineData: { data: garmentImage.base64, mimeType: garmentImage.mimeType } };
        const poseImagePart = { inlineData: { data: poseImage.base64, mimeType: poseImage.mimeType } };
        
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [garmentImagePart, poseImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const result = part.inlineData.data;
            // Log usage after successful generation
            if (userId) {
                const promptLength = prompt.length;
                // Use different feature name for fix/regenerate operations
                const featureName = fixInstruction ? 'Pose Swap Fix' : 'Pose Swap';
                await logUsage(userId, featureName, 2, promptLength, 1, true);
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

        const model = 'gemini-2.5-flash-image';

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
- 4K resolution, photorealistic finish.

## OUTPUT FORMAT
Return ONLY the final recolored image. No text, logos, or watermarks.`;

        const subjectImagePart = { inlineData: { data: subjectImage.base64, mimeType: subjectImage.mimeType } };
        const backgroundImagePart = { inlineData: { data: backgroundImage.base64, mimeType: backgroundImage.mimeType } };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [subjectImagePart, backgroundImagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const result = part.inlineData.data;
                // Log usage after successful generation
                if (userId) {
                    const promptLength = prompt.length;
                    await logUsage(userId, 'Change Background', 2, promptLength, 1, false);
                }
                return result;
            }
        }

        throw new Error("Failed to generate the image. The model did not return an image part. This can happen if the subject cannot be clearly identified in the source image.");

    } catch (error) {
        handleGeminiError(error, 'background change');
    }
}