import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageFile, ExtractedAsset } from '../types';
import { logUsage } from './usageTrackingService';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini API Error during ${context}:`, error);
    
    // Check for specific Gemini API error structure or 429 status code.
    // The error from the SDK might not have a clean httpStatus field, so we check the message string.
    if (error.toString().includes('RESOURCE_EXHAUSTED') || error.toString().includes('429')) {
        throw new Error("Quota Exceeded: You have exceeded your API request limit. Please check your plan and billing details on the Google AI Studio website, or try again later.");
    }

    // Generic fallback for other API errors
    const message = error.message || 'An unknown error occurred.';
    throw new Error(`An AI service error occurred during ${context}. Details: ${message}`);
};

export interface FemaleGarmentAnalysis {
    garmentType: string; // Detailed garment type from comprehensive list
    isGenderMatch: boolean;
    canSeparate: boolean;
    separationParts?: string[]; // Array of parts that can be separated (e.g., ['jacket', 'top', 'bottom'])
    separationType?: 'top-bottom' | 'blouse-saree' | 'jacket-dress-bottom' | 'jacket-top-bottom' | 'multi-part' | 'none';
    description: string;
    recommendedExtraction: 'full' | 'upper' | 'lower' | 'separate' | 'multi-separate';
    partsCount?: number; // Number of separable parts (2, 3, etc.)
}

export interface MaleGarmentAnalysis {
    garmentType: string; // Detailed garment type from comprehensive list
    isGenderMatch: boolean;
    canSeparate: boolean;
    separationParts?: string[]; // Array of parts that can be separated (e.g., ['jacket', 'shirt', 'pants'])
    separationType?: 'top-bottom' | 'jacket-top-bottom' | 'multi-part' | 'none';
    description: string;
    recommendedExtraction: 'full' | 'upper' | 'lower' | 'separate' | 'multi-separate';
    partsCount?: number; // Number of separable parts (2, 3, etc.)
    hasUpperPart?: boolean;
    hasLowerPart?: boolean;
}

export async function analyzeFemaleGarment(
    sourceImage: ImageFile,
    selectedGender: 'Male' | 'Female',
    userId?: string
): Promise<FemaleGarmentAnalysis> {
    try {
        if (!sourceImage) {
            throw new Error("Source image must be provided for analysis.");
        }
        const model = 'gemini-2.5-flash';
        const prompt = `# ROLE: Advanced Female Garment Analysis Expert

## PRIMARY MISSION
Analyze the uploaded image to determine:
1. **Gender Match Verification:** Does the garment match the selected gender (${selectedGender})?
2. **Garment Type Identification:** What specific type of female garment is this? (Use the comprehensive list below)
3. **Separability Assessment:** Can this garment be logically separated into 2, 3, or more parts?

## COMPREHENSIVE GARMENT TYPE CATEGORIES
You must identify the EXACT garment type from this comprehensive list:

### TOPS & T-SHIRTS
- Women T-Shirts, Women Oversized T-Shirts, Women Relaxed Fit T-Shirts, Women Oversized Cropped T-Shirts
- Women Full Sleeve T-Shirts, Women Dolman Sleeve T-Shirts, Women Ribbed Henley T-Shirts
- Women Polo T-Shirts, Women Rugby Polos, Women Yoga T-Shirts
- Women Shirts, Women Boyfriend Shirts, Women Holiday Shirts, Women Cropped Shirts
- Women Oversized Shirts, Women Oversized Cropped Shirts, Women Boxy Fit Shirts, Women Fitted Shirts
- Women Tops, Women Cropped Tops, Women Tank Tops, Women Capped Vests, Women Bralette, Women Base Layer

### HOODIES, SWEATSHIRTS & SWEATERS
- Women Hoodies, Women Oversized Hoodies, Women Cropped Oversized Hoodies
- Women Sweatshirts, Women Oversized Sweatshirts, Women Rugby Polo Sweatshirts
- Women Sweaters, Women Oversized Sweaters, Women Knitted Sweaters, Women Cropped Sweaters, Women Turtle Neck Sweaters

### JACKETS & OUTERWEAR
- Women Jackets, Women Denim Jackets, Women Puffer Jackets
- Women Varsity Jackets, Women Oversized Varsity Jackets
- Women Shackets, Women Knit Jackets

### BOTTOM WEAR
- Women Pants, Women Cargo Pants
- Women Jeans, Women Wide Leg Jeans, Women Cargo Jeans
- Women Joggers, Women Cargo Joggers, Women Flared Joggers, Women Denim Joggers
- Women Shorts, Women Denim Shorts, Women Bermuda Shorts, Women Boxer Shorts
- Women Lounge Shorts, Women High Waist Shorts, Women Sweatshorts
- Women Skirts, Women Denim Skirts, Women Skorts, Women Denim Skorts

### DRESSES & ONE-PIECES
- Women Dresses, Women Shirt Dresses, Women Oversized Shirt Dresses
- Women T-Shirt Dresses, Women Oversized T-Shirt Dresses
- Denim Dresses, Polo Dresses, Sweatshirt Dresses, Sweater Dresses
- Pocket Dresses, Gathered Dresses, Hooded Dresses
- Women Playsuits, Women Jumpsuits

### SETS & SPECIAL
- Women Co-ord Sets, Full Length Co-ord Sets

### ACTIVE & INNERWEAR
- Women Training Sports Bras, Women Yoga Tank Tops, Women Hipster Underwear

## ADVANCED SEPARABILITY RULES
A garment can be separated into MULTIPLE parts:

### 2-PART SEPARATION:
- **Dress/Jumpsuit → Top + Bottom:** Separate into upper portion (top) and lower portion (bottom/skirt)
- **Saree → Blouse + Saree:** Separate into blouse and saree drape
- **Two-piece Set → Top + Bottom:** Already separate pieces

### 3-PART SEPARATION:
- **Dress with Jacket → Jacket + Inner Dress Top + Bottom:** If a dress has an outer jacket/coat, separate into:
  1. Outer jacket/coat
  2. Inner dress top portion
  3. Inner dress bottom/skirt portion
- **Outfit with Jacket → Jacket + Top + Bottom:** If there's a jacket over a top and bottom, separate into all three

### MULTI-PART SEPARATION:
- **Co-ord Set with Jacket → Jacket + Top + Bottom:** Full separation of all visible layers
- **Layered Outfit:** Separate each distinct layer (outerwear, mid-layer, base layer, bottom)

## SEPARATION PARTS IDENTIFICATION
When identifying separable parts, use these categories:
- **"jacket"** - Outer jacket, coat, shacket, or outerwear layer
- **"top"** - Upper body garment (shirt, t-shirt, blouse, top, sweater, hoodie)
- **"dress-top"** - Upper portion of a dress (when dress is separated)
- **"bottom"** - Lower body garment (pants, skirt, shorts, jeans)
- **"dress-bottom"** - Lower portion/skirt of a dress (when dress is separated)
- **"blouse"** - Blouse portion (for saree or traditional wear)
- **"saree"** - Saree drape portion

## GENDER MATCH VERIFICATION
- If selected gender is "Female" and the image shows a female garment → **isGenderMatch: true**
- If selected gender is "Female" but the image shows a male garment → **isGenderMatch: false**
- If selected gender is "Male" but the image shows a female garment → **isGenderMatch: false**

## RECOMMENDED EXTRACTION
Based on the analysis, recommend the best extraction approach:
- **full:** Extract as complete single piece (for simple garments or when not separating)
- **upper:** Extract only upper portion (for tops only)
- **lower:** Extract only lower portion (for bottoms only)
- **separate:** Extract 2 parts separately (top + bottom, or blouse + saree)
- **multi-separate:** Extract 3+ parts separately (jacket + top + bottom, etc.)

## OUTPUT FORMAT
Respond ONLY with a JSON object containing:
{
  "garmentType": "Exact garment type from the comprehensive list above (e.g., 'Women Shirt Dresses', 'Women Denim Jackets')",
  "isGenderMatch": boolean,
  "canSeparate": boolean,
  "separationParts": ["part1", "part2", ...] (array of separable parts, e.g., ["jacket", "top", "bottom"] or ["top", "bottom"]),
  "separationType": "top-bottom" | "blouse-saree" | "jacket-dress-bottom" | "jacket-top-bottom" | "multi-part" | "none",
  "description": "Detailed description (e.g., 'Oversized shirt dress with denim jacket overlay')",
  "recommendedExtraction": "full" | "upper" | "lower" | "separate" | "multi-separate",
  "partsCount": number (2, 3, or more if separable, 1 if not)
}

## CRITICAL INSTRUCTIONS
- Identify the EXACT garment type from the comprehensive list provided
- Look for LAYERS: Check if there's a jacket, coat, or outerwear over the main garment
- For dresses with jackets: Identify as 3-part separation (jacket + dress-top + dress-bottom)
- For outfits with jackets: Identify as 3-part separation (jacket + top + bottom)
- Be precise and detailed in descriptions
- Ensure gender match verification is strict
- Count all visible, separable layers`;

        const imagePart = {
            inlineData: {
                data: sourceImage.base64,
                mimeType: sourceImage.mimeType,
            },
        };
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        garmentType: { type: Type.STRING },
                        isGenderMatch: { type: Type.BOOLEAN },
                        canSeparate: { type: Type.BOOLEAN },
                        separationParts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        separationType: { 
                            type: Type.STRING,
                            enum: ['top-bottom', 'blouse-saree', 'jacket-dress-bottom', 'jacket-top-bottom', 'multi-part', 'none']
                        },
                        description: { type: Type.STRING },
                        recommendedExtraction: {
                            type: Type.STRING,
                            enum: ['full', 'upper', 'lower', 'separate', 'multi-separate']
                        },
                        partsCount: { type: Type.NUMBER },
                    },
                    required: ["garmentType", "isGenderMatch", "canSeparate", "description", "recommendedExtraction"],
                },
            },
        });

        const jsonText = response.text.trim();
        try {
            const result = JSON.parse(jsonText);
            // Validate the result
            if (!result.garmentType || typeof result.isGenderMatch !== 'boolean' || 
                typeof result.canSeparate !== 'boolean' || !result.description || !result.recommendedExtraction) {
                throw new Error("Invalid analysis result format");
            }
            return {
                garmentType: result.garmentType,
                isGenderMatch: result.isGenderMatch,
                canSeparate: result.canSeparate,
                separationParts: result.separationParts || [],
                separationType: result.separationType || 'none',
                description: result.description,
                recommendedExtraction: result.recommendedExtraction,
                partsCount: result.partsCount || (result.canSeparate && result.separationParts ? result.separationParts.length : 1),
            };
        } catch (e) {
            console.error("Error parsing garment analysis JSON:", e);
            throw new Error("Failed to parse garment analysis.");
        }
    } catch (error) {
        handleGeminiError(error, 'female garment analysis');
    } finally {
        if (userId) {
            const promptLength = 1500; // Approximate prompt length
            await logUsage(userId, 'Analyze Female Garment', 1, promptLength, 0);
        }
    }
}

export async function analyzeMaleGarment(
    sourceImage: ImageFile,
    selectedGender: 'Male' | 'Female',
    userId?: string
): Promise<MaleGarmentAnalysis> {
    try {
        if (!sourceImage) {
            throw new Error("Source image must be provided for analysis.");
        }
        const model = 'gemini-2.5-flash';
        const prompt = `# ROLE: Advanced Male Garment Analysis Expert

## PRIMARY MISSION
Analyze the uploaded image to determine:
1. **Gender Match Verification:** Does the garment match the selected gender (${selectedGender})?
2. **Garment Type Identification:** What specific type of male garment is this? (Use the comprehensive list below)
3. **Separability Assessment:** Can this garment be logically separated into 2, 3, or more parts?

## COMPREHENSIVE GARMENT TYPE CATEGORIES
You must identify the EXACT garment type from this comprehensive list:

### TOPS & T-SHIRTS
- Men T-Shirts, Men Oversized T-Shirts, Super Oversized T-Shirts, Oversized Full Sleeve T-Shirts
- Men Relaxed Fit T-Shirts, Drop Cut T-Shirts, Hooded T-Shirts, Supima T-Shirts
- Basic T-Shirts, Graphic T-Shirts, V-Neck T-Shirts, Crew Neck T-Shirts
- Long Sleeve T-Shirts, Henley T-Shirts, Muscle / Sleeveless T-Shirts

### SHIRTS
- Men Shirts, Men Relaxed Shirts, Men Holiday Shirts, Cotton Linen Shirts
- Denim Shirts, Oversized Shirts, Men Utility Shirts, Men Textured Shirts
- Men Flannel Shackets, Men Shackets, Half Sleeve Shirts, Hooded Shirts
- Kimono Shirts, Knit Shirts, Mandarin Shirts, Oxford Shirts, Supima Shirts
- Casual Shirts, Formal Shirts, Flannel Shirts, Linen Shirts, Checked Shirts
- Solid Shirts, Striped Shirts, Mandarin Collar Shirts, Short Sleeve Shirts
- Long Sleeve Shirts, Printed Shirts, Cuban Collar Shirts

### POLOS & JERSEYS
- Polos, Oversized Polos, Zipper Polos, Men Rugby Polos
- Bomber Neck Polos, Mandarin Polos, Oversized Jerseys
- Polo T-Shirts, Rugby T-Shirts

### KNITWEAR & SWEATERS
- Pullovers, Oversized Pullovers, Cardigans, Sweaters
- Turtleneck Sweaters, Half-zip Sweaters

### HOODIES & SWEATSHIRTS
- Men Hoodies, All Weather Hoodies, Men Oversized Hoodies
- Men Sweatshirts, Men Oversized Sweatshirts, Men Rugby Polo Sweatshirts
- Basic Hoodies, Zipper Hoodies, Quarter-Zip Sweatshirts
- Crewneck Sweatshirts, Graphic Sweatshirts, Hoodie Jackets

### JACKETS & OUTERWEAR
- Men Jackets, Denim Jackets, Bomber Jackets, Biker Jackets
- Racer Jackets, Varsity Jackets, Men Puffer Jackets, Men Shackets
- Windbreakers, Trench Coats, Parkas, Blazers, Suede Jackets, Hooded Jackets
- Biker / Leather Jackets

### BOTTOM WEAR - PANTS & JEANS
- Men Pants, Men Cargo Pants, Men Cargo Jeans, Men Jeans
- Men Super Flex Pants, Men Supima Pants, Men Cotton Pants
- Men Fusion Pants, Men Korean Pants, Cotton Linen Pants, Textured Pants
- Chinos, Dress Pants / Trousers, Linen Pants, Cotton Pants
- Jogger Pants, Track Pants, Wide-Leg Pants, Utility Pants
- Slim Fit Jeans, Skinny Jeans, Straight Leg Jeans, Relaxed Fit Jeans
- Tapered Jeans, Loose / Baggy Jeans, Rigid / Raw Denim

### BOTTOM WEAR - JOGGERS
- Men Joggers, Men Oversized Joggers, Men Cargo Joggers
- Korean Joggers, Denim Joggers, Hipster Joggers, Men Enduro Joggers
- Sweat Joggers, Fleece Joggers, Tech Joggers, Training Pants

### BOTTOM WEAR - SHORTS
- Men Bermuda Shorts, Men Cargo Shorts, Men Denim Shorts
- Men Lounge Shorts, Men Utility Shorts, Boxer Shorts, Pajamas
- Casual Shorts, Swim Shorts / Board Shorts, Athletic Shorts

### ONE-PIECES / SETS
- Jumpsuits / Boilersuits, Rompers
- Co-ord Sets (Top + Bottom matching sets), Lounge / Pajama Sets

### ACTIVE & SPORTSWEAR
- Training Tees, Compression Tops, Performance Shorts, Track Pants
- Hooded Sportswear, Active Joggers

### FORMAL & BUSINESS
- Dress Shirts, Suit Jackets / Blazers, Dress Trousers
- Waistcoats / Vests, Ties / Pocket Squares

## ADVANCED SEPARABILITY RULES
A garment can be separated into MULTIPLE parts:

### 2-PART SEPARATION:
- **Top + Bottom:** Separate into upper portion (shirt/t-shirt/jacket) and lower portion (pants/shorts/jeans)
- **Two-piece Set → Top + Bottom:** Already separate pieces (e.g., co-ord set)

### 3-PART SEPARATION:
- **Outfit with Jacket → Jacket + Shirt/Top + Pants/Bottom:** If there's a jacket over a shirt and pants, separate into:
  1. Outer jacket/coat
  2. Inner shirt/top
  3. Bottom (pants/shorts/jeans)
- **Layered Outfit:** Separate each distinct layer (outerwear, mid-layer, base layer, bottom)

### MULTI-PART SEPARATION:
- **Co-ord Set with Jacket → Jacket + Top + Bottom:** Full separation of all visible layers
- **Jumpsuit/Romper → Top + Bottom:** Separate one-piece into upper and lower portions

## SEPARATION PARTS IDENTIFICATION
When identifying separable parts, use these categories:
- **"jacket"** - Outer jacket, coat, shacket, blazer, or outerwear layer
- **"shirt"** - Shirt, t-shirt, polo, or upper body garment
- **"top"** - Generic upper body garment (shirt, t-shirt, sweater, hoodie)
- **"bottom"** - Lower body garment (pants, shorts, jeans, joggers)
- **"pants"** - Pants, trousers, chinos
- **"jeans"** - Jeans specifically
- **"shorts"** - Shorts of any type

## GENDER MATCH VERIFICATION
- If selected gender is "Male" and the image shows a male garment → **isGenderMatch: true**
- If selected gender is "Male" but the image shows a female garment → **isGenderMatch: false**
- If selected gender is "Female" but the image shows a male garment → **isGenderMatch: false**

## RECOMMENDED EXTRACTION
Based on the analysis, recommend the best extraction approach:
- **full:** Extract as complete single piece (for simple garments or when not separating)
- **upper:** Extract only upper portion (for tops/shirts/jackets only)
- **lower:** Extract only lower portion (for bottoms/pants/shorts only)
- **separate:** Extract 2 parts separately (top + bottom)
- **multi-separate:** Extract 3+ parts separately (jacket + shirt + pants, etc.)

## OUTPUT FORMAT
Respond ONLY with a JSON object containing:
{
  "garmentType": "Exact garment type from the comprehensive list above (e.g., 'Men Denim Jackets', 'Men Cargo Pants')",
  "isGenderMatch": boolean,
  "canSeparate": boolean,
  "separationParts": ["part1", "part2", ...] (array of separable parts, e.g., ["jacket", "shirt", "pants"] or ["shirt", "pants"]),
  "separationType": "top-bottom" | "jacket-top-bottom" | "multi-part" | "none",
  "description": "Detailed description (e.g., 'Denim jacket over casual shirt with cargo pants')",
  "recommendedExtraction": "full" | "upper" | "lower" | "separate" | "multi-separate",
  "partsCount": number (2, 3, or more if separable, 1 if not),
  "hasUpperPart": boolean (true if garment has upper body component),
  "hasLowerPart": boolean (true if garment has lower body component)
}

## CRITICAL INSTRUCTIONS
- Identify the EXACT garment type from the comprehensive list provided
- Look for LAYERS: Check if there's a jacket, coat, or outerwear over the main garment
- For outfits with jackets: Identify as 3-part separation (jacket + shirt + pants)
- For jumpsuits/rompers: Identify as 2-part separation (top + bottom)
- Be precise and detailed in descriptions
- Ensure gender match verification is strict
- Count all visible, separable layers
- Determine if garment has upper and/or lower parts`;

        const imagePart = {
            inlineData: {
                data: sourceImage.base64,
                mimeType: sourceImage.mimeType,
            },
        };
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        garmentType: { type: Type.STRING },
                        isGenderMatch: { type: Type.BOOLEAN },
                        canSeparate: { type: Type.BOOLEAN },
                        separationParts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        separationType: { 
                            type: Type.STRING,
                            enum: ['top-bottom', 'jacket-top-bottom', 'multi-part', 'none']
                        },
                        description: { type: Type.STRING },
                        recommendedExtraction: {
                            type: Type.STRING,
                            enum: ['full', 'upper', 'lower', 'separate', 'multi-separate']
                        },
                        partsCount: { type: Type.NUMBER },
                        hasUpperPart: { type: Type.BOOLEAN },
                        hasLowerPart: { type: Type.BOOLEAN },
                    },
                    required: ["garmentType", "isGenderMatch", "canSeparate", "description", "recommendedExtraction", "hasUpperPart", "hasLowerPart"],
                },
            },
        });

        const jsonText = response.text.trim();
        try {
            const result = JSON.parse(jsonText);
            // Validate the result
            if (!result.garmentType || typeof result.isGenderMatch !== 'boolean' || 
                typeof result.canSeparate !== 'boolean' || !result.description || !result.recommendedExtraction) {
                throw new Error("Invalid analysis result format");
            }
            return {
                garmentType: result.garmentType,
                isGenderMatch: result.isGenderMatch,
                canSeparate: result.canSeparate,
                separationParts: result.separationParts || [],
                separationType: result.separationType || 'none',
                description: result.description,
                recommendedExtraction: result.recommendedExtraction,
                partsCount: result.partsCount || (result.canSeparate && result.separationParts ? result.separationParts.length : 1),
                hasUpperPart: result.hasUpperPart !== undefined ? result.hasUpperPart : true,
                hasLowerPart: result.hasLowerPart !== undefined ? result.hasLowerPart : true,
            };
        } catch (e) {
            console.error("Error parsing male garment analysis JSON:", e);
            throw new Error("Failed to parse garment analysis.");
        }
    } catch (error) {
        handleGeminiError(error, 'male garment analysis');
    } finally {
        if (userId) {
            const promptLength = 2000; // Approximate prompt length
            await logUsage(userId, 'Analyze Male Garment', 1, promptLength, 0);
        }
    }
}

export async function classifyGarmentsInImage(
    sourceImage: ImageFile,
    userId?: string
): Promise<{ upperBody: boolean, lowerBody: boolean }> {
    try {
        if (!sourceImage) {
            throw new Error("Source image must be provided for classification.");
        }
        const model = 'gemini-2.5-flash';
        const prompt = `# ROLE: AI Garment Visibility Analyst

## TASK
Your task is to analyze an image of a person and determine if distinct upper and lower body garments are *clearly visible and identifiable*. Your analysis must be strict.

## DEFINITIONS
- **Upper Body Garment:** A shirt, t-shirt, jacket, top, blouse, etc.
- **Lower Body Garment:** Pants, jeans, skirt, shorts, etc.
- **Full Outfit:** A single garment that covers both, like a dress, gown, or jumpsuit.

## RULES
1.  **Visibility is Key:** If a body part is not shown in the image, you cannot assume a garment is present.
2.  **Partial View:** If the image only shows the person from the waist up, you MUST classify \`lowerBody\` as \`false\`.
3.  **Full Outfits:** If the garment is a single piece like a dress or jumpsuit, you MUST classify BOTH \`upperBody\` and \`lowerBody\` as \`true\` as it covers both areas.

## OUTPUT FORMAT
Respond ONLY with a JSON object containing two boolean properties: "upperBody" and "lowerBody".

## EXAMPLES
- **Image shows a person in a t-shirt and jeans:** \`{"upperBody": true, "lowerBody": true}\`
- **Image is a portrait showing only a person's head and shoulders wearing a jacket:** \`{"upperBody": true, "lowerBody": false}\`
- **Image shows a person from the knees down wearing pants and shoes:** \`{"upperBody": false, "lowerBody": true}\`
- **Image shows a person wearing a full-length dress:** \`{"upperBody": true, "lowerBody": true}\``;

        const imagePart = {
            inlineData: {
                data: sourceImage.base64,
                mimeType: sourceImage.mimeType,
            },
        };
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        upperBody: { type: Type.BOOLEAN },
                        lowerBody: { type: Type.BOOLEAN },
                    },
                    required: ["upperBody", "lowerBody"],
                },
            },
        });

        const jsonText = response.text.trim();
        try {
            const result = JSON.parse(jsonText);
            if (typeof result.upperBody === 'boolean' && typeof result.lowerBody === 'boolean') {
                return result;
            } else {
                console.error("Received malformed JSON for garment classification:", result);
                throw new Error("Invalid JSON format from API during garment classification.");
            }
        } catch (e) {
            console.error("Error parsing garment classification JSON:", e);
            throw new Error("Failed to parse garment classification.");
        }
    } catch (error) {
        handleGeminiError(error, 'garment classification');
    } finally {
        if (userId) {
            const promptLength = 400; // Approximate prompt length
            await logUsage(userId, 'Classify Garments', 1, promptLength, 0);
        }
    }
}


// Helper function for batch processing multiple extractions
async function extractSingleAsset(
    sourceImage: ImageFile,
    partDescription: string,
    category: string,
    itemName: string,
    gender: 'Male' | 'Female',
    needsContext: boolean = false
): Promise<ExtractedAsset> {
    const model = 'gemini-2.5-flash-image';
    
    let contextInstruction = '';
    if (needsContext) {
        contextInstruction = 'IMPORTANT: The garment you are extracting (the top/upper portion) is part of a full outfit. For proper visual context and accurate extraction, show the top portion WITH the bottom portion visible below it, but extract ONLY the top portion as the main asset. The bottom should be visible for reference but the top is the primary extraction target.';
    }
    
    const prompt = `# ROLE: Precision E-commerce Asset Extractor

# CRITICAL REQUIREMENT: NO PERSON IN OUTPUT
You MUST extract ONLY the garment. There must be NO person, NO model, NO human body visible in the output. The garment must appear as if on an invisible ghost mannequin.

# EXTRACTION TARGET
${partDescription}

${contextInstruction}

# STRICT EXTRACTION RULES
1. **Remove ALL human elements:** No person, no body, no face, no limbs visible
2. **Ghost Mannequin Effect:** The garment must appear to be floating or on an invisible form
3. **Perfect Isolation:** Only the specified garment part should be visible
4. **Preserve Details:** Maintain exact design, color, pattern, texture, and all garment details

# IMAGE SPECIFICATIONS
- **Background:** Pure white (#FFFFFF)
- **Style:** Professional ghost mannequin effect - garment on invisible form
- **Quality:** Photorealistic, studio lighting, 4K clarity
- **View:** Front View ONLY
- **Centering:** Garment centered with even white margins on all sides

# OUTPUT FORMAT
Return ONLY a JSON object followed by the image:
{"category": "${category}", "itemName": "${itemName}", "view": "Front"}
[IMAGE_DATA]`;

    const imagePart = {
        inlineData: {
            data: sourceImage.base64,
            mimeType: sourceImage.mimeType,
        },
    };
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    if (response.candidates && response.candidates[0].content.parts) {
        let metadata: any = null;
        let imageData: string | null = null;
        
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                const jsonMatch = part.text.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    try {
                        metadata = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.warn("Failed to parse metadata:", e);
                    }
                }
            } else if (part.inlineData) {
                imageData = part.inlineData.data;
            }
        }
        
        if (metadata && imageData) {
            return {
                category: metadata.category || category,
                itemName: metadata.itemName || itemName,
                views: [{
                    viewType: metadata.view || 'Front',
                    imageBase64: imageData,
                }],
            };
        }
    }
    
    throw new Error(`Failed to extract ${itemName}`);
}

export async function extractAssetsFromImage(
    sourceImage: ImageFile,
    extractionScope: 'full' | 'upper' | 'lower' | 'separate' | 'multi-separate',
    gender: 'Male' | 'Female',
    userId?: string
): Promise<ExtractedAsset[]> {
    try {
        if (!sourceImage) {
            throw new Error("Source image must be provided.");
        }
        // Handle batch processing for multi-part separations
        if (extractionScope === 'separate' || extractionScope === 'multi-separate') {
            const assets: ExtractedAsset[] = [];
            
            // Determine parts to extract based on scope
            let partsToExtract: Array<{description: string, category: string, name: string, needsContext: boolean}> = [];
            
            if (extractionScope === 'separate') {
                // 2 parts: top and bottom
                if (gender === 'Male') {
                    partsToExtract = [
                        {
                            description: 'Extract the UPPER portion (shirt/t-shirt/polo/jacket) of the garment. This is the top half of the outfit.',
                            category: 'Upper Body',
                            name: 'Top',
                            needsContext: false
                        },
                        {
                            description: 'Extract the LOWER portion (pants/shorts/jeans/joggers) of the garment. This is the bottom half of the outfit.',
                            category: 'Lower Body',
                            name: 'Bottom',
                            needsContext: false
                        }
                    ];
                } else {
                    partsToExtract = [
                        {
                            description: 'Extract the UPPER portion (top/blouse/dress-top) of the garment. This is the top half of the outfit.',
                            category: 'Upper Body',
                            name: 'Top',
                            needsContext: false
                        },
                        {
                            description: 'Extract the LOWER portion (bottom/skirt/dress-bottom/pants) of the garment. This is the bottom half of the outfit.',
                            category: 'Lower Body',
                            name: 'Bottom',
                            needsContext: false
                        }
                    ];
                }
            } else if (extractionScope === 'multi-separate') {
                // 3+ parts: jacket, top, bottom
                if (gender === 'Male') {
                    partsToExtract = [
                        {
                            description: 'Extract the OUTER JACKET/COAT/SHACKET/BLAZER layer. This is the outermost upper body garment visible in the image.',
                            category: 'Upper Body',
                            name: 'Jacket',
                            needsContext: false
                        },
                        {
                            description: 'Extract the INNER SHIRT/TOP portion (shirt/t-shirt/polo) that is under the jacket. This is the middle layer.',
                            category: 'Upper Body',
                            name: 'Shirt',
                            needsContext: false
                        },
                        {
                            description: 'Extract the BOTTOM portion (pants/shorts/jeans/joggers) of the outfit.',
                            category: 'Lower Body',
                            name: 'Bottom',
                            needsContext: false
                        }
                    ];
                } else {
                    partsToExtract = [
                        {
                            description: 'Extract the OUTER JACKET/COAT/SHACKET layer. This is the outermost upper body garment visible in the image.',
                            category: 'Upper Body',
                            name: 'Jacket',
                            needsContext: false
                        },
                        {
                            description: 'Extract the INNER TOP portion (shirt/top/blouse) that is under the jacket. This is the middle layer.',
                            category: 'Upper Body',
                            name: 'Top',
                            needsContext: false
                        },
                        {
                            description: 'Extract the BOTTOM portion (pants/skirt/shorts/jeans) of the outfit.',
                            category: 'Lower Body',
                            name: 'Bottom',
                            needsContext: false
                        }
                    ];
                }
            }
            
            // Process parts in parallel with concurrency limit for better performance
            const CONCURRENT_LIMIT = 2; // Process 2 parts at a time
            for (let i = 0; i < partsToExtract.length; i += CONCURRENT_LIMIT) {
                const batch = partsToExtract.slice(i, i + CONCURRENT_LIMIT);
                
                // Process batch in parallel
                const batchResults = await Promise.all(
                    batch.map(async (part) => {
                        try {
                            return await extractSingleAsset(
                                sourceImage,
                                part.description,
                                part.category,
                                part.name,
                                gender,
                                part.needsContext
                            );
                        } catch (error) {
                            console.error(`Failed to extract ${part.name}:`, error);
                            return null; // Return null for failed extractions
                        }
                    })
                );
                
                // Add successful extractions to assets array
                batchResults.forEach(result => {
                    if (result) {
                        assets.push(result);
                    }
                });
            }
            
            if (assets.length === 0) {
                throw new Error("Failed to extract any assets. Please try again with a clearer image.");
            }
            
            // Log usage
            if (userId) {
                const promptLength = 500; // Approximate
                await logUsage(userId, 'Extract Assets', 1, promptLength, assets.length);
            }
            
            return assets;
        }
        
        // Single image extraction (real-time calling)
        const model = 'gemini-2.5-flash-image';
        let taskInstruction = '';

        if (gender === 'Female' && extractionScope === 'full') {
            taskInstruction = 'You MUST extract ONLY the main, single, full-body garment (e.g., a dress, gown, jumpsuit, saree) visible in the image. CRITICAL: There must be NO person, NO model, NO human body visible. The garment must appear on an invisible ghost mannequin. Generate one "Front" view. The output JSON MUST use category "Full Outfit". This is the ONLY item you should generate.';
        } else if (gender === 'Female' && extractionScope === 'upper') {
            // Extract only upper portion, but show with bottom for context if it's a dress/jumpsuit
            taskInstruction = 'You MUST extract ONLY the UPPER portion (top/shirt/blouse/jacket/dress-top) of this garment. If there is a jacket/coat over an inner top, extract ONLY the jacket/coat (outer layer). IMPORTANT CONTEXT RULE: If the source garment is a dress, jumpsuit, or one-piece outfit, you MUST show the top portion WITH the bottom portion (skirt/pants) visible below it for proper visual context and accurate proportions. However, the PRIMARY extraction target is the TOP portion - the bottom is only for reference. If the source is separate pieces (top + bottom), extract ONLY the top piece. CRITICAL: There must be NO person, NO model, NO human body visible. The garment must appear on an invisible ghost mannequin. Generate one "Front" view. The item MUST use category "Upper Body". This is the ONLY item you should generate.';
        } else if (gender === 'Female' && extractionScope === 'lower') {
            taskInstruction = 'You MUST extract ONLY the LOWER portion (pants/skirt/shorts/jeans/dress-bottom) of this garment. CRITICAL: There must be NO person, NO model, NO human body visible. The garment must appear on an invisible ghost mannequin. Generate one "Front" view. The item MUST use category "Lower Body". This is the ONLY item you should generate.';
        } else if (gender === 'Male' && extractionScope === 'full') {
            taskInstruction = 'You MUST extract BOTH the upper body garment (shirt/t-shirt/jacket/polo) AND the lower body garment (pants/shorts/jeans/joggers) visible in the image. If there is a jumpsuit or romper, extract it as a single full-body garment. CRITICAL: There must be NO person, NO model, NO human body visible. The garments must appear on an invisible ghost mannequin. Generate one "Front" view for each garment. These are the ONLY items you should generate.';
        } else if (gender === 'Male' && extractionScope === 'upper') {
            taskInstruction = 'You MUST extract ONLY the UPPER portion (shirt/t-shirt/jacket/polo/hoodie/sweater) of this garment. If there is a jacket/coat over an inner shirt, extract ONLY the jacket/coat (outer layer). IMPORTANT CONTEXT RULE: If the source garment is a jumpsuit or romper, you MUST show the top portion WITH the bottom portion (pants/shorts) visible below it for proper visual context and accurate proportions. However, the PRIMARY extraction target is the TOP portion - the bottom is only for reference. If the source is separate pieces (shirt + pants), extract ONLY the upper piece. CRITICAL: There must be NO person, NO model, NO human body visible. The garment must appear on an invisible ghost mannequin. Generate one "Front" view. The item MUST use category "Upper Body". This is the ONLY item you should generate.';
        } else if (gender === 'Male' && extractionScope === 'lower') {
            taskInstruction = 'You MUST extract ONLY the LOWER portion (pants/shorts/jeans/joggers) of this garment. CRITICAL: There must be NO person, NO model, NO human body visible. The garment must appear on an invisible ghost mannequin. Generate one "Front" view. The item MUST use category "Lower Body". This is the ONLY item you should generate.';
        } else {
            switch (extractionScope) {
                case 'full':
                    taskInstruction = 'You MUST extract BOTH the upper body garment AND the lower body garment visible in the image. CRITICAL: There must be NO person, NO model, NO human body visible. The garments must appear on an invisible ghost mannequin. Generate one "Front" view for each of these two items. These are the ONLY two items you should generate.';
                    break;
                case 'upper':
                    taskInstruction = 'You MUST extract ONLY the upper body garment (e.g., shirt, jacket, top) visible in the image. CRITICAL: There must be NO person, NO model, NO human body visible. The garment must appear on an invisible ghost mannequin. Generate one "Front" view. This is the ONLY item you should generate.';
                    break;
                case 'lower':
                    taskInstruction = 'You MUST extract ONLY the lower body garment (e.g., pants, skirt, shorts) visible in the image. CRITICAL: There must be NO person, NO model, NO human body visible. The garment must appear on an invisible ghost mannequin. Generate one "Front" view. This is the ONLY item you should generate.';
                    break;
            }
        }

        const prompt = `# ROLE: Precision E-commerce Asset Generator

# CRITICAL REQUIREMENT: NO PERSON IN OUTPUT
You MUST extract ONLY the garment(s). There must be NO person, NO model, NO human body, NO face, NO limbs visible in the output. The garment must appear as if on an invisible ghost mannequin.

# CONTEXT
- **Subject Gender:** ${gender}
- **CRITICAL NOTE FOR 'FEMALE' GENDER:** You MUST be prepared to handle complex and ethnic wear like a 'Saree'. A Saree is a single, long piece of draped fabric, often worn with a blouse. When extracting a Saree, you must treat the entire drape and the accompanying blouse as a single "Full Outfit" or "Upper Body" set. DO NOT misinterpret it as a simple top and skirt or reduce it to a bra/bikini top. Preserve the full, flowing structure.

# PRIMARY_DIRECTIVE
Extract the apparel item(s) specified in the TASK_INSTRUCTION with perfect isolation. The output must show ONLY the garment(s) on an invisible form - NO human elements whatsoever.

# EXECUTION_PROTOCOL
1. **Identify Target:** Identify the exact garment(s) to extract based on TASK_INSTRUCTION
2. **Remove Human:** Completely remove all human elements (person, body, face, limbs)
3. **Ghost Mannequin:** Create perfect ghost mannequin effect - garment floating on invisible form
4. **Isolate:** Extract ONLY the specified garment(s), nothing else

# TASK_INSTRUCTION (MANDATORY)
${taskInstruction}

# STRICT_EXCLUSIONS
- **DO NOT** include any person, model, or human body parts
- **DO NOT** generate Back or Side views. Only Front view is required
- **DO NOT** extract accessories, footwear, or items not in TASK_INSTRUCTION
- **DO NOT** show any background elements - pure white only

# IMAGE_SPECIFICATIONS
- **Background:** Pure white (#FFFFFF) - no gradients, no patterns
- **Style:** Professional ghost mannequin effect - garment on invisible form showing 3D structure
- **Quality:** Photorealistic, studio lighting, 4K clarity
- **View:** Front View ONLY
- **Centering:** Garment centered with even white margins on all sides
- **No Human Elements:** Absolutely no person, body, or human features visible

# OUTPUT_FORMAT_SPECIFICATION
Your response MUST be a strict sequence of JSON object followed by image data for each item.
- **Example for single item:**
{"category": "Upper Body", "itemName": "Blue T-Shirt", "view": "Front"}
[IMAGE_DATA]
- **Example for two items:**
{"category": "Upper Body", "itemName": "Blue T-Shirt", "view": "Front"}
[IMAGE_DATA_FOR_SHIRT]
{"category": "Lower Body", "itemName": "Denim Jeans", "view": "Front"}
[IMAGE_DATA_FOR_JEANS]

Failure to adhere to this format will break the processing pipeline.`;

        const imagePart = {
            inlineData: {
                data: sourceImage.base64,
                mimeType: sourceImage.mimeType,
            },
        };
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const assetsMap: Map<string, ExtractedAsset> = new Map();

        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content) {
            const parts = response.candidates[0].content.parts;
            const metadataParts: any[] = [];
            const imageParts: any[] = [];
            for (const part of parts) {
                if (part.text) {
                    const jsonStrings = part.text.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/g);
                    if (jsonStrings) {
                        for (const jsonString of jsonStrings) {
                            try {
                                const parsed = JSON.parse(jsonString);
                                if (Array.isArray(parsed)) {
                                    metadataParts.push(...parsed);
                                } else {
                                    metadataParts.push(parsed);
                                }
                            } catch (e) {
                                console.warn("Skipping malformed JSON string within a text part:", jsonString, e);
                            }
                        }
                    }
                } else if (part.inlineData) {
                    imageParts.push(part.inlineData);
                }
            }
            
            const numPairs = Math.min(metadataParts.length, imageParts.length);
            if (numPairs < metadataParts.length || numPairs < imageParts.length) {
                console.warn("Mismatch in metadata and image parts count. Metadata:", metadataParts.length, "Images:", imageParts.length);
            }

            for (let i = 0; i < numPairs; i++) {
                const metadata = metadataParts[i];
                const inlineData = imageParts[i];
                if (!metadata) continue;

                const { category, itemName, view } = metadata;
                if (!category || !itemName || !view) {
                    console.warn("Skipping incomplete metadata object:", metadata);
                    continue;
                }

                const key = `${category}-${itemName}`;
                if (!assetsMap.has(key)) {
                    assetsMap.set(key, {
                        category: category,
                        itemName: itemName,
                        views: [],
                    });
                }
                const asset = assetsMap.get(key)!;
                asset.views.push({
                    viewType: view,
                    imageBase64: inlineData.data,
                });
            }
        }

        const generatedAssets = Array.from(assetsMap.values());
        if (generatedAssets.length === 0) {
            console.error("Asset extraction failed. No valid asset pairs were generated. Raw response from model:", JSON.stringify(response, null, 2));
            throw new Error("Processing failed. Please try a clearer image.");
        }
        
        // Log usage after successful extraction
        if (userId) {
            const promptLength = prompt.length;
            const outputImages = generatedAssets.reduce((sum, asset) => sum + asset.views.length, 0);
            await logUsage(userId, 'Extract Assets', 1, promptLength, outputImages);
        }
        
        return generatedAssets;
    } catch (error) {
        handleGeminiError(error, 'asset extraction');
    }
}

export async function composeOutfit(
    upperBodyAsset: ImageFile,
    lowerBodyAsset: ImageFile,
    gender: 'Male' | 'Female',
    userId?: string
): Promise<string> {
    try {
        if (!upperBodyAsset || !lowerBodyAsset) {
            throw new Error("Both upper and lower body assets must be provided.");
        }

        const model = 'gemini-2.5-flash-image';

        const prompt = `# ROLE: AI Master Tailor for Ghost Mannequin Composites

## ZERO_TOLERANCE_POLICY: PRESERVE GARMENT STRUCTURE & PROPORTION
THIS IS YOUR PRIMARY DIRECTIVE. You MUST preserve the original shape, volume, and proportions of each source garment. The final composite must look like a natural, well-proportioned outfit.
**FAILURE CONDITION:** Any "collapsing," shrinking, unnatural pinching at the waist, or distortion of the garments is a critical failure. The final silhouette must be realistic and anatomically correct for the specified gender.

## CONTEXT
- **Subject Gender:** ${gender}

## PRIMARY_DIRECTIVE
Merge two separate ghost mannequin assets (an upper and a lower body garment) into a single, seamless, and photorealistic full-outfit composite.

## SOURCE IMAGES
- **Image 1:** The Upper Body Garment.
- **Image 2:** The Lower Body Garment.

## EXECUTION PROTOCOL

1.  **3D Shape Analysis:** Infer the 3D structure and material properties of each garment.

2.  **Virtual Mannequin Draping:** Re-drape both garments together onto a single, neutral ghost mannequin form appropriate for the specified gender. This is NOT simple 2D layering.

3.  **Seamless Waistline Synthesis (CRITICAL):**
    - Render a flawless connection at the waist. The top must sit naturally OVER or tuck INTO the bottom.
    - **NO GAPS, NO OVERLAPS:** There must be no visible seam, gap, or unnatural overlap.
    - **CONTINUOUS SILHOUETTE:** The final outfit must have a continuous, believable shape. Avoid any "pinched" or "collapsed" appearance.

4.  **Unified Lighting & Shadow:**
    - Create a single, consistent lighting model across the entire outfit.
    - Shadows from the upper garment must fall realistically onto the lower garment.
    - The entire outfit must cast a single, soft ground shadow.

## AESTHETIC REQUIREMENTS
- **Background:** Pure White (#FFFFFF).
- **Quality:** Photorealistic, 4K clarity. Maintain all original texture and detail.
- **Proportions:** The final composed outfit must have realistic human proportions.

## OUTPUT_FORMAT
Return ONLY the final, merged image. Do not include any text or watermarks.`;

        const upperBodyPart = { inlineData: { data: upperBodyAsset.base64, mimeType: upperBodyAsset.mimeType } };
        const lowerBodyPart = { inlineData: { data: lowerBodyAsset.base64, mimeType: lowerBodyAsset.mimeType } };

        const response = await ai.models.generateContent({
            model,
            contents: { parts: [upperBodyPart, lowerBodyPart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const result = part.inlineData.data;
                    // Log usage after successful composition
                    if (userId) {
                        const promptLength = prompt.length;
                        await logUsage(userId, 'Compose Outfit', 2, promptLength, 1);
                    }
                    return result;
                }
            }
        }
        throw new Error("Failed to generate the composed outfit. The model did not return an image part.");
    } catch (error) {
        handleGeminiError(error, 'outfit composition');
    }
}