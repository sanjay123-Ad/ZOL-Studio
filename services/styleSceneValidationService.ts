import { GoogleGenAI } from "@google/genai";
import { ImageFile } from '../types';
import { logUsage } from './usageTrackingService';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GarmentValidationResult {
  isValid: boolean;
  garmentType: 'upper' | 'lower' | 'unknown';
  errorMessage?: string;
  description?: string;
}

/**
 * Validates if uploaded garment images match the selected garment type (upper/lower)
 */
export async function validateGarmentType(
  frontImage: ImageFile,
  backImage: ImageFile,
  expectedType: 'upper' | 'lower',
  gender: 'Male' | 'Female',
  userId?: string
): Promise<GarmentValidationResult> {
  try {
    if (!frontImage || !backImage) {
      throw new Error('Both front and back images must be provided for validation.');
    }

    const model = 'gemini-2.5-flash';
    const expectedTypeLabel = expectedType === 'upper' ? 'upper body garment (shirt, t-shirt, top, jacket, etc.)' : 'lower body garment (pants, jeans, shorts, skirt, etc.)';
    
    const prompt = `# TASK: GARMENT TYPE VALIDATION FOR STYLE SCENE

## GOAL
Analyze the TWO uploaded images (front and back views) to determine if they match the expected garment type.

## EXPECTED GARMENT TYPE
The user claims to have uploaded: **${expectedTypeLabel}** for ${gender} gender.

## YOUR TASK
1. Analyze BOTH images (Image 1 = Front view, Image 2 = Back view)
2. Determine if the garment shown is actually an ${expectedTypeLabel}
3. Check if BOTH images show the SAME garment from front and back perspectives
4. Verify the garment matches the ${gender} gender category

## VALIDATION CRITERIA

### For UPPER garments (shirts, t-shirts, tops, jackets):
- Should show upper body clothing (torso, sleeves, neckline, shoulders)
- Should NOT show pants, shorts, skirts, or lower body clothing
- Front and back should show the same upper garment from different angles

### For LOWER garments (pants, jeans, shorts, skirts):
- Should show lower body clothing (waist, hips, legs)
- Should NOT show shirts, t-shirts, tops, or upper body clothing
- Front and back should show the same lower garment from different angles

## OUTPUT FORMAT
Respond ONLY with a JSON object:
{
  "isValid": boolean (true if images match expected type, false otherwise),
  "garmentType": "upper" | "lower" | "unknown",
  "errorMessage": string (only if isValid is false, provide helpful instruction to user),
  "description": string (brief description of what was detected in the images)
}

## ERROR MESSAGES
If validation fails, provide clear, user-friendly error messages:
- If wrong type: "The uploaded images appear to be [detected type], but you selected [expected type]. Please upload images of [expected type] (front and back views)."
- If images don't match: "The front and back images don't appear to show the same garment. Please ensure both images are of the same ${expectedTypeLabel} from front and back perspectives."
- If gender mismatch: "The uploaded garment doesn't appear to match ${gender} clothing. Please upload ${gender} ${expectedTypeLabel} images."

## CRITICAL INSTRUCTIONS
- Be strict but fair in validation
- Consider that images might be isolated garment photos (ghost mannequin, flat-lay)
- Both images must show the same garment
- The garment type must match the expected type
- Provide helpful, actionable error messages`;

    const frontImagePart = { inlineData: { data: frontImage.base64, mimeType: frontImage.mimeType } };
    const backImagePart = { inlineData: { data: backImage.base64, mimeType: backImage.mimeType } };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [frontImagePart, backImagePart, { text: prompt }] },
    });

    const jsonText = response.text.trim();
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || jsonText.match(/(\{[\s\S]*\})/);
    const cleanJson = jsonMatch ? jsonMatch[1] : jsonText;

    try {
      const result = JSON.parse(cleanJson);
      
      // Validate the result
      if (typeof result.isValid !== 'boolean' || !result.garmentType) {
        throw new Error("Invalid validation result format");
      }

      // Log usage
      if (userId) {
        await logUsage(userId, 'Style Scene Garment Validation', 2, prompt.length, 0, result.isValid);
      }

      return {
        isValid: result.isValid,
        garmentType: result.garmentType,
        errorMessage: result.errorMessage,
        description: result.description,
      };
    } catch (parseError) {
      console.error("Error parsing validation JSON:", parseError);
      console.error("Raw response:", jsonText);
      throw new Error("Failed to parse validation result. Please try again.");
    }
  } catch (error: any) {
    console.error("Garment validation error:", error);
    
    // Log usage even on error
    if (userId) {
      await logUsage(userId, 'Style Scene Garment Validation', 2, 1000, 0, false);
    }

    // Return a safe error response
    return {
      isValid: false,
      garmentType: 'unknown',
      errorMessage: error.message || 'Validation failed. Please ensure you uploaded the correct garment type (front and back views).',
    };
  }
}


