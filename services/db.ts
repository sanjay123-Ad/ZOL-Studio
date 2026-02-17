import { supabase } from './supabase';
import { GeneratedAsset, CollectionAsset } from '../types';

// Helper to convert a data URL string to a File object for uploading
const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
};

// Saves a generated asset by uploading to storage and inserting into the database
export async function saveAsset(
    userId: string,
    generatedImageBase64: string,
    sourceFeature: string
): Promise<GeneratedAsset> {
    if (!userId || !generatedImageBase64) {
        throw new Error('User ID and image data are required.');
    }

    const imageFile = await dataURLtoFile(`data:image/png;base64,${generatedImageBase64}`, `asset-${Date.now()}.png`);
    const filePath = `${userId}/${imageFile.name}`;

    try {
        // 1. Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('generated_assets')
            .upload(filePath, imageFile, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        // 2. Insert the asset metadata and select the new record
        const { data: newAsset, error: insertError } = await supabase
            .from('generated_assets')
            .insert({
                user_id: userId,
                image_url: filePath, // Store the file path
                source_feature: sourceFeature,
            })
            .select()
            .single();

        if (insertError) {
            // If DB insert fails, remove the orphaned storage object for cleanup
            await supabase.storage.from('generated_assets').remove([filePath]);
            throw insertError;
        }
        
        if (!newAsset) {
            throw new Error('Failed to create asset in database.');
        }

        // 3. Generate a signed URL for the newly created asset
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('generated_assets')
            .createSignedUrls([filePath], 60 * 5); // 5 minute validity

        if (signedUrlError) {
            // Throw if getting the URL fails to ensure the caller knows the process is incomplete.
            throw signedUrlError;
        }
        if (!signedUrlData?.[0]?.signedUrl) {
            throw new Error("Storage upload succeeded, but failed to generate a viewable URL.");
        }

        // 4. Return the complete asset object with the temporary signed URL
        return {
            ...newAsset,
            display_url: signedUrlData[0].signedUrl,
        };

    } catch (error) {
        console.error('Error saving asset to Supabase:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while saving the asset.';
        throw new Error(`Failed to save asset: ${message}`);
    }
}

// Fetches all assets for a given user and generates secure, temporary URLs for viewing
export async function getAssetsForUser(userId: string): Promise<GeneratedAsset[]> {
    try {
        // 1. Fetch asset records from the database
        const { data: assets, error } = await supabase
            .from('generated_assets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!assets || assets.length === 0) return [];

        // 2. Extract the file paths from the asset records
        const paths = assets.map(asset => asset.image_url);

        // 3. Generate signed URLs for all file paths in a single batch request
        const { data: signedUrlsData, error: signedUrlError } = await supabase
            .storage
            .from('generated_assets')
            .createSignedUrls(paths, 60 * 5); // URLs are valid for 5 minutes

        if (signedUrlError) throw signedUrlError;

        // 4. Map the signed URLs back to their corresponding asset objects
        const assetsWithSignedUrls = assets.map(asset => {
            const signedUrlData = signedUrlsData.find(d => d.path === asset.image_url);
            return {
                ...asset,
                // Add the temporary signed URL for the UI to use
                display_url: signedUrlData ? signedUrlData.signedUrl : '', 
            };
        }).filter(asset => asset.display_url !== ''); // Filter out any that failed to get a URL

        return assetsWithSignedUrls;

    } catch (error) {
        console.error('Error fetching assets from Supabase:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while retrieving assets.';
        throw new Error(`Failed to retrieve assets: ${message}`);
    }
}

// Deletes an asset from the database and storage
export async function deleteAsset(assetId: string, imagePath: string): Promise<void> {
    try {
        // First, delete the database record. If this fails, we don't orphan the storage object.
        const { error: dbError } = await supabase
            .from('generated_assets')
            .delete()
            .eq('id', assetId);
        
        if (dbError) {
            throw dbError;
        }

        // If the database record is gone, delete the storage object.
        const { error: storageError } = await supabase.storage
            .from('generated_assets')
            .remove([imagePath]);
        
        if (storageError) {
            // Log this, but at this point the DB record is gone, so we can't easily roll back.
            // This is a tradeoff of not using a transaction-like function.
            console.warn(`Storage object ${imagePath} could not be deleted, but DB record was removed.`, storageError);
        }
    } catch (error) {
        console.error('Error deleting asset:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while deleting the asset.';
        throw new Error(`Failed to delete asset: ${message}`);
    }
}


// --- Asset Collection Storage ---
const ASSET_COLLECTION_BUCKET = 'Asset_Collection';

export async function saveAssetToCollection(
    userId: string,
    imageBase64: string,
    metadata: {
        asset_type: 'individual' | 'composed';
        item_name: string;
        item_category: string;
    }
): Promise<CollectionAsset> {
    if (!userId || !imageBase64) {
        throw new Error('User ID and image data are required.');
    }

    const imageFile = await dataURLtoFile(`data:image/png;base64,${imageBase64}`, `asset_collection_${Date.now()}.png`);
    const filePath = `${userId}/${imageFile.name}`;

    try {
        // 1. Upload file to storage
        const { error: uploadError } = await supabase.storage
            .from(ASSET_COLLECTION_BUCKET)
            .upload(filePath, imageFile, { upsert: false });

        if (uploadError) throw uploadError;

        // 2. Insert metadata into the database
        const { data: newAsset, error: insertError } = await supabase
            .from('asset_collection')
            .insert({
                user_id: userId,
                image_url: filePath,
                asset_type: metadata.asset_type,
                item_name: metadata.item_name,
                item_category: metadata.item_category,
            })
            .select()
            .single();

        if (insertError) {
            await supabase.storage.from(ASSET_COLLECTION_BUCKET).remove([filePath]);
            throw insertError;
        }
        if (!newAsset) {
            throw new Error('Failed to create asset in database.');
        }

        // 3. Generate signed URL for immediate display
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(ASSET_COLLECTION_BUCKET)
            .createSignedUrls([filePath], 60 * 5); // 5 minutes

        if (signedUrlError) throw signedUrlError;
        if (!signedUrlData?.[0]?.signedUrl) throw new Error("Storage upload succeeded, but failed to generate a viewable URL.");

        return {
            ...newAsset,
            display_url: signedUrlData[0].signedUrl,
        };

    } catch (error) {
        console.error('Error saving asset to collection:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while saving asset to collection.';
        throw new Error(`Failed to save asset to collection: ${message}`);
    }
}

export async function getAssetsFromCollection(userId: string): Promise<CollectionAsset[]> {
    try {
        // 1. Fetch asset records
        const { data: assets, error } = await supabase
            .from('asset_collection')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!assets || assets.length === 0) return [];

        // 2. Get signed URLs
        const paths = assets.map(asset => asset.image_url);
        const { data: signedUrlsData, error: signedUrlError } = await supabase
            .storage
            .from(ASSET_COLLECTION_BUCKET)
            .createSignedUrls(paths, 60 * 5); // 5 mins

        if (signedUrlError) throw signedUrlError;

        // 3. Map URLs back to assets
        const assetsWithSignedUrls = assets.map(asset => {
            const signedUrlData = signedUrlsData.find(d => d.path === asset.image_url);
            return {
                ...asset,
                display_url: signedUrlData ? signedUrlData.signedUrl : '',
            };
        }).filter(asset => asset.display_url !== '');

        return assetsWithSignedUrls;

    } catch (error) {
        console.error('Error fetching assets from collection:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while retrieving assets from collection.';
        throw new Error(`Failed to retrieve assets from collection: ${message}`);
    }
}

export async function deleteAssetFromCollection(assetId: string, imagePath: string): Promise<void> {
    try {
        // First, delete the database record.
        const { error: dbError } = await supabase
            .from('asset_collection')
            .delete()
            .eq('id', assetId);
        
        if (dbError) {
            throw dbError;
        }

        // If the database record is gone, delete the storage object.
        const { error: storageError } = await supabase.storage
            .from(ASSET_COLLECTION_BUCKET)
            .remove([imagePath]);
        
        if (storageError) {
            // Log this, but the DB record is gone, so we can't easily roll back.
            console.warn(`Storage object ${imagePath} could not be deleted, but DB record was removed.`, storageError);
        }
    } catch (error) {
        console.error('Error deleting asset from collection:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while deleting asset from collection.';
        throw new Error(`Failed to delete asset from collection: ${message}`);
    }
}


// --- StyleScene Collection Storage ---

const STYLE_SCENE_BUCKET = 'style_scene_collections';

/**
 * Uploads a generated StyleScene image to Supabase Storage.
 * @param userId The ID of the current user.
 * @param poseId The ID of the pose, used for organization.
 * @param generatedImageBase64 The base64 string of the image to upload.
 * @returns The public URL of the uploaded image.
 */
export async function uploadStyleSceneImage(
    userId: string,
    poseId: string,
    generatedImageBase64: string
): Promise<string> {
    if (!userId || !poseId || !generatedImageBase64) {
        throw new Error('User ID, Pose ID, and image data are required for upload.');
    }

    const imageFile = await dataURLtoFile(`data:image/png;base64,${generatedImageBase64}`, `stylescene-${Date.now()}.png`);
    const filePath = `${userId}/${poseId}/${imageFile.name}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from(STYLE_SCENE_BUCKET)
            .upload(filePath, imageFile, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from(STYLE_SCENE_BUCKET)
            .getPublicUrl(filePath);
        
        if (!data.publicUrl) {
            throw new Error('Could not retrieve public URL for the uploaded image.');
        }

        return data.publicUrl;

    } catch (error) {
        console.error('Error uploading StyleScene image to Supabase:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while uploading the StyleScene image.';
        throw new Error(`Failed to upload image: ${message}`);
    }
}

/**
 * Deletes a user's entire folder from the StyleScene collection bucket.
 * Used when the user starts a new session with a new garment.
 * @param userId The ID of the user whose folder should be deleted.
 */
export async function deleteUserStyleSceneFolder(userId: string): Promise<void> {
    try {
        // FIX: The `recursive` option for `list()` is not valid. This function now
        // manually lists and removes files from subdirectories to clear the user's folder.
        const { data: topLevelFolders, error: listError } = await supabase.storage
            .from(STYLE_SCENE_BUCKET)
            .list(userId, { limit: 1000 });

        if (listError) {
            if (listError.message.includes('Object not found')) {
                console.log(`No folder to delete for user ${userId}.`);
                return;
            }
            throw listError;
        }

        if (topLevelFolders && topLevelFolders.length > 0) {
            const allFilePaths: string[] = [];
            
            await Promise.all(
                topLevelFolders.map(async (folder) => {
                    const subfolderPath = `${userId}/${folder.name}`;
                    const { data: filesInSubfolder, error: subfolderError } = await supabase.storage
                        .from(STYLE_SCENE_BUCKET)
                        .list(subfolderPath);
                    
                    if (subfolderError) {
                        console.warn(`Could not list files in ${subfolderPath}`, subfolderError);
                        return; // Continue to next folder
                    }
                    
                    if (filesInSubfolder && filesInSubfolder.length > 0) {
                        const paths = filesInSubfolder.map(f => `${subfolderPath}/${f.name}`);
                        allFilePaths.push(...paths);
                    }
                })
            );
            
            if (allFilePaths.length > 0) {
                const { error: removeError } = await supabase.storage
                    .from(STYLE_SCENE_BUCKET)
                    .remove(allFilePaths);

                if (removeError) {
                    throw removeError;
                }
            }
        }
    } catch (error) {
        console.error(`Error deleting StyleScene folder for user ${userId}:`, error);
        // We don't re-throw here to prevent the UI from breaking on a cleanup failure.
    }
}

// --- Catalog Forged Output Storage ---
const CATALOG_SESSIONS_BUCKET = 'catalog_forged_outputs';

export async function uploadCatalogSessionImage(
    userId: string,
    garmentId: string,
    view: string,
    imageBase64: string
): Promise<string> {
    if (!userId || !garmentId || !view || !imageBase64) {
        throw new Error('User ID, garment ID, view, and image data are required.');
    }
    const fileName = `${view}-${Date.now()}.png`;
    const imageFile = await dataURLtoFile(`data:image/png;base64,${imageBase64}`, fileName);
    const filePath = `${userId}/${garmentId}/${fileName}`;
    try {
        const { error } = await supabase.storage
            .from(CATALOG_SESSIONS_BUCKET)
            .upload(filePath, imageFile, { upsert: true });
        if (error) throw error;
        return filePath;
    } catch (error) {
        console.error('Error uploading catalog session image:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while uploading session image.';
        throw new Error(`Failed to upload session image: ${message}`);
    }
}

export async function getSignedUrlsForCatalogSession(paths: string[]): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    if (paths.length === 0) return urlMap;
    try {
        const { data, error } = await supabase.storage
            .from(CATALOG_SESSIONS_BUCKET)
            .createSignedUrls(paths, 60 * 5); // 5 minute validity
        if (error) throw error;
        if (data) {
            for (const item of data) {
                if (item.path && item.signedUrl) urlMap.set(item.path, item.signedUrl);
            }
        }
        return urlMap;
    } catch (error) {
        console.error('Error getting signed URLs for catalog session:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while retrieving session image URLs.';
        throw new Error(`Failed to retrieve session image URLs: ${message}`);
    }
}

// --- Product Quality Forge Storage ---
const PRODUCT_QUALITY_FORGE_BUCKET = 'product_quality_forge';

/**
 * Uploads a Product Quality Forge generated image to Supabase Storage
 * Files are stored in user-specific folders: {userId}/forge-{fileId}-{timestamp}.png
 * Each user's files are completely isolated from other users
 */
export async function uploadProductQualityForgeImage(
    userId: string,
    fileId: string,
    imageBase64: string
): Promise<string> {
    if (!userId || !fileId || !imageBase64) {
        throw new Error('User ID, file ID, and image data are required.');
    }
    
    // Store files in user-specific folder structure: {userId}/filename
    // This ensures complete separation between users
    const fileName = `forge-${fileId}-${Date.now()}.png`;
    const imageFile = await dataURLtoFile(`data:image/png;base64,${imageBase64}`, fileName);
    const filePath = `${userId}/${fileName}`; // User ID is the first folder level
    
    try {
        const { error } = await supabase.storage
            .from(PRODUCT_QUALITY_FORGE_BUCKET)
            .upload(filePath, imageFile, { upsert: true });
        
        if (error) throw error;
        return filePath; // Returns full path including userId folder
    } catch (error) {
        console.error('Error uploading Product Quality Forge image:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while uploading image.';
        throw new Error(`Failed to upload image: ${message}`);
    }
}

/**
 * Gets signed URLs for Product Quality Forge images
 */
export async function getSignedUrlsForProductQualityForge(paths: string[]): Promise<Map<string, string>> {
    if (paths.length === 0) return new Map();
    
    try {
        const { data, error } = await supabase.storage
            .from(PRODUCT_QUALITY_FORGE_BUCKET)
            .createSignedUrls(paths, 60 * 60 * 24); // 24 hours validity
        
        if (error) throw error;
        if (!data) return new Map();
        
        const urlMap = new Map<string, string>();
        for (const item of data) {
            if (item.path && item.signedUrl) {
                urlMap.set(item.path, item.signedUrl);
            }
        }
        
        return urlMap;
    } catch (error) {
        console.error('Error getting signed URLs for Product Quality Forge:', error);
        return new Map();
    }
}

/**
 * Deletes a user's entire Product Quality Forge folder
 * This removes all files stored in the user's dedicated folder: {userId}/
 * Each user's folder is completely isolated, so this only affects the specified user
 */
export async function deleteUserProductQualityForgeFolder(userId: string): Promise<void> {
    if (!userId) {
        throw new Error('User ID is required to delete folder.');
    }
    
    try {
        // List all files in the user's dedicated folder
        // The folder structure is: product_quality_forge/{userId}/*
        const { data: files, error: listError } = await supabase.storage
            .from(PRODUCT_QUALITY_FORGE_BUCKET)
            .list(userId, {
                limit: 1000, // Maximum files per user folder
                sortBy: { column: 'name', order: 'asc' }
            });
        
        if (listError) {
            // If folder doesn't exist, that's OK - just return
            if (listError.message?.includes('not found') || listError.message?.includes('does not exist')) {
                return;
            }
            throw listError;
        }
        
        // Delete all files in the user's folder
        if (files && files.length > 0) {
            const pathsToDelete = files.map(file => `${userId}/${file.name}`);
            const { error: deleteError } = await supabase.storage
                .from(PRODUCT_QUALITY_FORGE_BUCKET)
                .remove(pathsToDelete);
            
            if (deleteError) throw deleteError;
        }
    } catch (error) {
        console.error('Error deleting Product Quality Forge folder:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while deleting folder.';
        throw new Error(`Failed to delete folder: ${message}`);
    }
}

export async function deleteUserCatalogSessionFolder(userId: string): Promise<void> {
    if (!userId) return;
    try {
        // FIX: The `recursive` option for `list()` is not valid. This function now
        // manually lists and removes files from subdirectories to clear the user's folder.
        const { data: folders, error } = await supabase.storage
            .from(CATALOG_SESSIONS_BUCKET)
            .list(userId, { limit: 1000 });
        if (error) {
            if (error.message.includes('Object not found')) return;
            throw error;
        }
        if (folders && folders.length > 0) {
            const pathsToRemove: string[] = [];

            await Promise.all(
                folders.map(async (folder) => {
                    const subfolderPath = `${userId}/${folder.name}`;
                    const { data: filesInFolder, error: subfolderError } = await supabase.storage
                        .from(CATALOG_SESSIONS_BUCKET)
                        .list(subfolderPath);

                    if (subfolderError) {
                        console.warn(`Could not list files in ${subfolderPath}`, subfolderError);
                        return; // Continue to next folder
                    }

                    if (filesInFolder && filesInFolder.length > 0) {
                        const paths = filesInFolder.map(f => `${subfolderPath}/${f.name}`);
                        pathsToRemove.push(...paths);
                    }
                })
            );
            
            if (pathsToRemove.length > 0) {
                const { error: removeError } = await supabase.storage.from(CATALOG_SESSIONS_BUCKET).remove(pathsToRemove);
                if (removeError) {
                    throw removeError;
                }
            }
        }
    } catch (error) {
        console.error(`Error deleting catalog session folder for user ${userId}:`, error);
    }
}

// --- Pose Mimic Storage ---
const POSE_MIMIC_BUCKET = 'pose_mimic';

/**
 * Uploads a Pose Mimic generated image to Supabase Storage
 * Files are stored in user-specific folders: {userId}/pose-{fileId}-{timestamp}.png
 */
export async function uploadPoseMimicImage(
    userId: string,
    fileId: string,
    imageBase64: string
): Promise<string> {
    if (!userId || !fileId || !imageBase64) {
        throw new Error('User ID, file ID, and image data are required.');
    }
    
    const fileName = `pose-${fileId}-${Date.now()}.png`;
    const imageFile = await dataURLtoFile(`data:image/png;base64,${imageBase64}`, fileName);
    const filePath = `${userId}/${fileName}`;
    
    try {
        const { error } = await supabase.storage
            .from(POSE_MIMIC_BUCKET)
            .upload(filePath, imageFile, { upsert: true });
        
        if (error) throw error;
        return filePath;
    } catch (error) {
        console.error('Error uploading Pose Mimic image:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while uploading image.';
        throw new Error(`Failed to upload image: ${message}`);
    }
}

/**
 * Gets signed URLs for Pose Mimic images
 */
export async function getSignedUrlsForPoseMimic(paths: string[]): Promise<Map<string, string>> {
    if (paths.length === 0) return new Map();
    
    try {
        const { data, error } = await supabase.storage
            .from(POSE_MIMIC_BUCKET)
            .createSignedUrls(paths, 60 * 60 * 24); // 24 hours validity
        
        if (error) throw error;
        if (!data) return new Map();
        
        const urlMap = new Map<string, string>();
        paths.forEach((path, index) => {
            if (data[index]?.signedUrl) {
                urlMap.set(path, data[index].signedUrl);
            }
        });
        
        return urlMap;
    } catch (error) {
        console.error('Error getting signed URLs for Pose Mimic:', error);
        return new Map();
    }
}

/**
 * Deletes a user's entire Pose Mimic folder
 */
export async function deleteUserPoseMimicFolder(userId: string): Promise<void> {
    if (!userId) {
        throw new Error('User ID is required to delete folder.');
    }
    
    try {
        const { data: files, error: listError } = await supabase.storage
            .from(POSE_MIMIC_BUCKET)
            .list(userId, {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' }
            });
        
        if (listError) {
            if (listError.message?.includes('not found') || listError.message?.includes('does not exist')) {
                return;
            }
            throw listError;
        }
        
        if (files && files.length > 0) {
            const pathsToDelete = files.map(file => `${userId}/${file.name}`);
            const { error: deleteError } = await supabase.storage
                .from(POSE_MIMIC_BUCKET)
                .remove(pathsToDelete);
            
            if (deleteError) throw deleteError;
        }
    } catch (error) {
        console.error('Error deleting Pose Mimic folder:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while deleting folder.';
        throw new Error(`Failed to delete folder: ${message}`);
    }
}

// --- Asset Generator Storage ---
const ASSET_GENERATOR_BUCKET = 'asset_generator';

/**
 * Uploads a generated asset image to Supabase Storage
 * Files are stored in user-specific folders: {userId}/asset-{timestamp}-{assetId}.png
 */
export async function uploadAssetGeneratorImage(
    userId: string,
    imageBase64: string,
    assetId: string,
    metadata?: {
        item_name?: string;
        item_category?: string;
        asset_type?: 'individual' | 'composed';
    }
): Promise<string> {
    if (!userId || !imageBase64 || !assetId) {
        throw new Error('User ID, image data, and asset ID are required.');
    }
    
    const fileName = `asset-${Date.now()}-${assetId.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const imageFile = await dataURLtoFile(`data:image/png;base64,${imageBase64}`, fileName);
    const filePath = `${userId}/${fileName}`;
    
    try {
        const { error } = await supabase.storage
            .from(ASSET_GENERATOR_BUCKET)
            .upload(filePath, imageFile, { upsert: false });
        
        if (error) throw error;
        return filePath;
    } catch (error) {
        console.error('Error uploading Asset Generator image to Supabase:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while uploading image.';
        throw new Error(`Failed to upload image: ${message}`);
    }
}

/**
 * Deletes a single asset image from Supabase Storage
 */
export async function deleteAssetGeneratorImage(filePath: string): Promise<void> {
    if (!filePath) {
        throw new Error('File path is required.');
    }
    
    try {
        const { error } = await supabase.storage
            .from(ASSET_GENERATOR_BUCKET)
            .remove([filePath]);
        
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting Asset Generator image from Supabase:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while deleting image.';
        throw new Error(`Failed to delete image: ${message}`);
    }
}

/**
 * Deletes all asset generator images for a user (when clearing/resetting)
 */
export async function deleteAllAssetGeneratorImages(userId: string): Promise<void> {
    if (!userId) {
        throw new Error('User ID is required.');
    }
    
    try {
        // List all files in the user's folder
        const { data: files, error: listError } = await supabase.storage
            .from(ASSET_GENERATOR_BUCKET)
            .list(userId);
        
        if (listError) throw listError;
        
        if (!files || files.length === 0) {
            return; // No files to delete
        }
        
        // Delete all files
        const pathsToDelete = files.map(file => `${userId}/${file.name}`);
        const { error: deleteError } = await supabase.storage
            .from(ASSET_GENERATOR_BUCKET)
            .remove(pathsToDelete);
        
        if (deleteError) throw deleteError;
    } catch (error) {
        console.error('Error deleting all Asset Generator images:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while deleting images.';
        throw new Error(`Failed to delete images: ${message}`);
    }
}

/**
 * Uploads a source image (batch upload) to Supabase Storage
 * Files are stored in user-specific folders: {userId}/source-{fileId}-{timestamp}.png
 */
export async function uploadAssetGeneratorSourceImage(
    userId: string,
    fileId: string,
    imageBase64: string
): Promise<string> {
    if (!userId || !fileId || !imageBase64) {
        throw new Error('User ID, file ID, and image data are required.');
    }
    
    const fileName = `source-${fileId}-${Date.now()}.png`;
    const imageFile = await dataURLtoFile(`data:image/png;base64,${imageBase64}`, fileName);
    const filePath = `${userId}/sources/${fileName}`; // Store in sources subfolder
    
    try {
        const { error } = await supabase.storage
            .from(ASSET_GENERATOR_BUCKET)
            .upload(filePath, imageFile, { upsert: false });
        
        if (error) throw error;
        return filePath;
    } catch (error) {
        console.error('Error uploading Asset Generator source image to Supabase:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while uploading source image.';
        throw new Error(`Failed to upload source image: ${message}`);
    }
}

/**
 * Deletes a source image from Supabase Storage
 */
export async function deleteAssetGeneratorSourceImage(filePath: string): Promise<void> {
    if (!filePath) {
        throw new Error('File path is required.');
    }
    
    try {
        const { error } = await supabase.storage
            .from(ASSET_GENERATOR_BUCKET)
            .remove([filePath]);
        
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting Asset Generator source image from Supabase:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while deleting source image.';
        throw new Error(`Failed to delete source image: ${message}`);
    }
}

/**
 * Gets signed URLs for Asset Generator images
 */
export async function getSignedUrlsForAssetGenerator(paths: string[]): Promise<Map<string, string>> {
    if (!paths || paths.length === 0) {
        return new Map();
    }
    
    try {
        const { data, error } = await supabase.storage
            .from(ASSET_GENERATOR_BUCKET)
            .createSignedUrls(paths, 60 * 60 * 24); // 24 hours
        
        if (error) throw error;
        if (!data) return new Map();
        
        const urlMap = new Map<string, string>();
        paths.forEach((path, index) => {
            if (data[index]?.signedUrl) {
                urlMap.set(path, data[index].signedUrl);
            }
        });
        
        return urlMap;
    } catch (error) {
        console.error('Error getting signed URLs for Asset Generator images:', error);
        const message = (error as Error)?.message || 'An unknown error occurred while getting signed URLs.';
        throw new Error(`Failed to get signed URLs: ${message}`);
    }
}