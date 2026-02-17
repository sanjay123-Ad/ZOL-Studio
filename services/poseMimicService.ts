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
 * Helper to get fresh AI client
 */
function getAiClient() {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * Transfers the pose from a reference image to a target person.
 * Optimized for Gemini 3 Pro (Pro Image).
 */
export async function generatePoseMimic(
    target: ImageFile,
    reference: ImageFile,
    userId?: string
): Promise<string> {
    try {
        if (!target || !reference) throw new Error('Target and Reference images required.');

        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: target.base64, mimeType: target.mimeType } },
                    { inlineData: { data: reference.base64, mimeType: reference.mimeType } },
                    { text: "Reconstruct the person from the first image in the exact pose of the person in the second image. Maintain perfect identity and clothing. Return ONLY the image." }
                ]
            },
            config: {
                imageConfig: { imageSize: "1K" },
                responseModalities: [Modality.IMAGE]
            }
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const result = part.inlineData.data;
                    return result;
                }
            }
        }
        throw new Error("No image returned by the Pro model.");
    } catch (error) {
        handleGeminiError(error, 'pose mimic');
    }
}











