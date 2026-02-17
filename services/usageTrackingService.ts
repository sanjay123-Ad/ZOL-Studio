import { supabase } from './supabase';

export interface UsageLog {
    id?: string;
    user_id: string;
    feature: string;
    input_images: number;
    input_chars: number;
    output_images: number;
    tokens: number;
    estimated_cost: number;
    created_at?: string;
}

// Gemini Flash Real-Time API pricing
const INPUT_COST_PER_MILLION = 0.075; // $0.075 per 1M input tokens (real-time)
const OUTPUT_COST_PER_MILLION = 0.30; // $0.30 per 1M output tokens (text, real-time)
// Real-time image generation cost
const IMAGE_GENERATION_COST = 0.041; // $0.041 per image (real-time API)

// Gemini 3 Pro pricing (higher cost for premium quality)
const GEMINI_3_PRO_INPUT_COST_PER_MILLION = 0.125; // $0.125 per 1M input tokens (Gemini 3 Pro)
const GEMINI_3_PRO_IMAGE_COST = 0.08; // $0.08 per image (Gemini 3 Pro - higher quality)

// Token estimation helpers
// Rough estimate: 1 token ≈ 4 characters for text
// For images: base64 encoded images are roughly 256 tokens per image (conservative estimate)
export function estimateTokens(inputImages: number, inputChars: number, outputImages: number): number {
    const imageTokens = inputImages * 256; // Conservative estimate
    const textTokens = Math.ceil(inputChars / 4); // ~4 chars per token
    // Output images don't count as tokens in the same way, but we track them separately
    return imageTokens + textTokens;
}

export function calculateCost(tokens: number, outputImages: number, outputTokens: number = 0, useGemini3Pro: boolean = false, isBatch: boolean = false): number {
    // Select pricing based on model
    const inputCostPerMillion = useGemini3Pro ? GEMINI_3_PRO_INPUT_COST_PER_MILLION : INPUT_COST_PER_MILLION;
    const imageCostPerImage = useGemini3Pro ? GEMINI_3_PRO_IMAGE_COST : IMAGE_GENERATION_COST;
    
    // Calculate input cost
    const inputCost = (tokens / 1_000_000) * inputCostPerMillion;
    
    // Calculate output token cost (for text responses like JSON from analysis features)
    const outputTokenCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;
    
    // Calculate output image cost
    const imageCost = outputImages * imageCostPerImage;
    
    const totalCost = inputCost + outputTokenCost + imageCost;

    // Apply 50% discount for batch processing
    return isBatch ? totalCost * 0.5 : totalCost;
}

// Estimate output tokens for text-based features (JSON responses, analysis, etc.)
function estimateOutputTokens(feature: string, inputChars: number): number {
    // Features that return text/JSON responses
    const textOutputFeatures = ['Detect Gender', 'Analyze Garment', 'Classify Garments', 'Diagnose Image'];
    
    if (textOutputFeatures.includes(feature)) {
        // Estimate output tokens: typically 50-200 tokens for JSON responses
        if (feature === 'Detect Gender') {
            return 20; // Simple JSON: {"gender": "Male"}
        } else if (feature === 'Analyze Garment') {
            return 100; // JSON with description and suggestions array
        } else if (feature === 'Classify Garments') {
            return 30; // Simple JSON: {"upperBody": true, "lowerBody": false}
        } else if (feature === 'Diagnose Image') {
            return 150; // JSON with flaw detection and suggestion text
        }
    }
    
    return 0; // Image generation features don't have text output tokens
}

export async function logUsage(
    userId: string,
    feature: string,
    inputImages: number,
    inputChars: number,
    outputImages: number,
    useGemini3Pro: boolean = false
): Promise<void> {
    try {
        const tokens = estimateTokens(inputImages, inputChars, outputImages);
        const outputTokens = estimateOutputTokens(feature, inputChars);
        const estimatedCost = calculateCost(tokens, outputImages, outputTokens, useGemini3Pro, false);

        const { error } = await supabase
            .from('usage_logs')
            .insert({
                user_id: userId,
                feature,
                input_images: inputImages,
                input_chars: inputChars,
                output_images: outputImages,
                tokens,
                estimated_cost: estimatedCost,
            });

        if (error) {
            console.error('Failed to log usage:', error);
            // Don't throw - we don't want usage tracking to break the main flow
        }
    } catch (error) {
        console.error('Error logging usage:', error);
        // Silently fail - usage tracking should not break the app
    }
}

/**
 * Log batch usage for multiple operations
 * Useful for batch processing where we want a single log entry
 */
export async function logBatchUsage(
    userId: string,
    feature: string,
    totalInputImages: number,
    totalInputChars: number,
    totalOutputImages: number,
    useGemini3Pro: boolean = false
): Promise<void> {
    try {
        const tokens = estimateTokens(totalInputImages, totalInputChars, totalOutputImages);
        const outputTokens = estimateOutputTokens(feature, totalInputChars);
        const estimatedCost = calculateCost(tokens, totalOutputImages, outputTokens, useGemini3Pro, true);

        const { error } = await supabase
            .from('usage_logs')
            .insert({
                user_id: userId,
                feature: `${feature} (Batch)`,
                input_images: totalInputImages,
                input_chars: totalInputChars,
                output_images: totalOutputImages,
                tokens,
                estimated_cost: estimatedCost,
            });

        if (error) {
            console.error('Failed to log batch usage:', error);
        }
    } catch (error) {
        console.error('Error logging batch usage:', error);
    }
}

export async function getUserUsageLogs(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
): Promise<{ logs: UsageLog[]; total: number }> {
    try {
        // Get total count
        const { count, error: countError } = await supabase
            .from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            console.error('Failed to fetch usage logs count:', countError);
        }

        // Get paginated logs
        const { data, error } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Failed to fetch usage logs:', error);
            return { logs: [], total: 0 };
        }

        return { logs: data || [], total: count || 0 };
    } catch (error) {
        console.error('Error fetching usage logs:', error);
        return { logs: [], total: 0 };
    }
}

export async function getUserUsageStats(userId: string): Promise<{
    totalCost: number;
    totalImages: number;
    totalTokens: number;
}> {
    try {
        const { data, error } = await supabase
            .from('usage_logs')
            .select('estimated_cost, output_images, tokens')
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to fetch usage stats:', error);
            return { totalCost: 0, totalImages: 0, totalTokens: 0 };
        }

        const stats = (data || []).reduce(
            (acc, log) => ({
                totalCost: acc.totalCost + (log.estimated_cost || 0),
                totalImages: acc.totalImages + (log.output_images || 0),
                totalTokens: acc.totalTokens + (log.tokens || 0),
            }),
            { totalCost: 0, totalImages: 0, totalTokens: 0 }
        );

        return stats;
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        return { totalCost: 0, totalImages: 0, totalTokens: 0 };
    }
}

export async function clearUserUsageHistory(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('usage_logs')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to clear usage history:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error clearing usage history:', error);
        throw error;
    }
}

